// app/api/scholarship-submit/route.ts

import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { prisma } from '@/lib/prisma'; 

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*', 
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    
    const status = String(body.status || 'pending');
    const name = String(body.name || 'Unknown Student');
    const email = String(body.email || '');
    const phone = String(body.phone || 'N/A');
    const score = Number(body.score || 0);
    const totalQuestions = Number(body.totalQuestions || 25);
    const scholarshipCode = String(body.scholarshipCode || '');
    const discount = Number(body.discount || 0);
    const planName = String(body.planName || 'Unknown Plan');
    const cheatWarnings = Number(body.cheatWarnings || 0);

    if (!email) {
       return NextResponse.json({ error: 'Email is required' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    await prisma.attendee.upsert({
      where: { email: email },
      update: {
        status: status,
        score: score,
        discountPercent: discount,
        cheatWarnings: cheatWarnings,
      },
      create: {
        fullName: name,
        email: email,
        phone: phone,
        status: status,
        planName: planName,
        score: score,
        discountPercent: discount,
        cheatWarnings: cheatWarnings,
        countryCode: '',
        couponCode: scholarshipCode,
      }
    });

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT || 465),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    if (status === 'disqualified') {
        await transporter.sendMail({
            from: `"InternX Security" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `⚠️ Test Disqualified: Suspicious Activity Detected on ${planName} Test`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #ef4444; padding: 20px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 22px;">Test Disqualified</h1>
                    </div>
                    <div style="padding: 30px; background-color: #fff;">
                        <p style="font-size: 16px; color: #333;">Hi <strong>${name}</strong>,</p>
                        <p style="color: #555; line-height: 1.6;">
                            Your scholarship test session for <strong>${planName}</strong> was automatically terminated by our proctoring system.
                        </p>
                        <div style="background-color: #fef2f2; border: 1px solid #fecaca; padding: 15px; border-radius: 6px; margin: 20px 0;">
                            <strong style="color: #991b1b;">Reason for Termination:</strong>
                            <p style="margin: 5px 0 0 0; color: #7f1d1d; font-size: 14px;">Multiple Tab Switches / Window Focus Loss detected.</p>
                        </div>
                        <p style="color: #666; font-size: 13px;">
                            InternX maintains a strict zero-tolerance policy against cheating to ensure fairness for all applicants.
                        </p>
                    </div>
                </div>
            `
        });

        await transporter.sendMail({
            from: `"InternX System" <${process.env.SMTP_USER}>`,
            to: 'careerlabconsulting@gmail.com',
            subject: `🚩 ALERT: Cheating Detected - ${name}`,
            html: `
                <h3 style="color: red;">User Disqualified</h3>
                <p><strong>Name:</strong> ${name}</p>
                <p><strong>Phone:</strong> ${phone}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Reason:</strong> Anti-Cheating Violation (Tab Switch)</p>
            `
        });

        return NextResponse.json(
          { success: true, message: 'Disqualification processed and saved to DB' },
          { headers: { 'Access-Control-Allow-Origin': '*' } } 
        );
    }

    const mrpAmount = planName === 'Foundation' ? 120000 : 200000;
    const scholarshipAmount = Math.round((mrpAmount * discount) / 100);
    const finalFee = mrpAmount - scholarshipAmount;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    await transporter.sendMail({
      from: `"InternX AI" <${process.env.SMTP_USER}>`,
      to: email, 
      subject: `🎉 InternX-AI Scholarship Unlocked: Save ${formatCurrency(scholarshipAmount)} on ${planName}`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
          <div style="background-color: #2563eb; padding: 35px 20px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 26px;">Congratulations!</h1>
            <p style="color: #bfdbfe; margin: 10px 0 0 0; font-size: 16px;">Scholarship Qualified Successfully</p>
          </div>
          <div style="padding: 35px 30px;">
            <p style="font-size: 16px; margin-top: 0;">Hi <strong>${name}</strong>,</p>
            <p style="color: #475569; line-height: 1.6;">Thanks again for participating in our recent scholarship test. You did a great job, and I’m happy to share that you’ve officially qualified for a scholarship!</p>
            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 25px 0; text-align: center;">
              <h3 style="color: #1e293b; margin-top: 0; margin-bottom: 20px; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">Your Results</h3>
              <div style="margin-bottom: 15px;">
                <span style="font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: bold;">Score</span><br/>
                <span style="font-size: 28px; font-weight: 800; color: #0f172a;">${score} <span style="font-size: 16px; color: #94a3b8; font-weight: normal;">/ ${totalQuestions * 2}</span></span>
              </div>
              <div style="margin-bottom: 15px;">
                <span style="font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: bold;">Scholarship Code</span><br/>
                <div style="background: #eff6ff; border: 2px dashed #2563eb; color: #2563eb; font-size: 22px; font-weight: bold; padding: 10px 20px; border-radius: 8px; display: inline-block; margin-top: 5px; font-family: monospace;">
                  ${scholarshipCode}
                </div>
              </div>
              <div>
                <span style="font-size: 14px; color: #64748b; text-transform: uppercase; font-weight: bold;">Scholarship Unlocked</span><br/>
                <span style="font-size: 18px; font-weight: bold; color: #16a34a;">${discount}% OFF (${formatCurrency(scholarshipAmount)})</span>
              </div>
            </div>
            <h3 style="color: #1e293b; margin-top: 30px; border-bottom: 2px solid #2563eb; display: inline-block; padding-bottom: 5px;">Updated Fee Structure</h3>
            <div style="margin-top: 15px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 10px 0; color: #64748b; font-size: 15px;">Total Fee (MRP)</td>
                  <td style="padding: 10px 0; text-align: right; text-decoration: line-through; color: #94a3b8; font-size: 15px;">${formatCurrency(mrpAmount)}</td>
                </tr>
                <tr>
                  <td style="padding: 10px 0; color: #166534; font-weight: 600; font-size: 15px;">Applied Scholarship</td>
                  <td style="padding: 10px 0; text-align: right; color: #166534; font-weight: 600; font-size: 15px;">-${formatCurrency(scholarshipAmount)}</td>
                </tr>
                <tr>
                  <td colspan="2" style="border-bottom: 1px dashed #cbd5e1; padding: 5px 0;"></td>
                </tr>
                <tr>
                  <td style="padding: 15px 0 0 0; color: #0f172a; font-weight: 800; font-size: 18px;">Updated Fee</td>
                  <td style="padding: 15px 0 0 0; text-align: right; color: #2563eb; font-weight: 800; font-size: 24px;">${formatCurrency(finalFee)}</td>
                </tr>
              </table>
            </div>
            <p style="margin-top: 30px; color: #475569;">To claim this, just use your code within <strong>48 Hours</strong>. If you have any questions at all, feel free to reach out.</p>
            <p style="color: #475569;">Great work!</p>
            <div style="margin-top: 35px; text-align: center;">
              <a href="https://internx.ai/checkout/b2c?scholarshipCode=${scholarshipCode}&planName=${planName}" style="background-color: #2563eb; color: #ffffff; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">
                Claim Scholarship Now
              </a>
            </div>
            <div style="margin-top: 30px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
              <p style="margin: 0; color: #64748b; font-style: italic; font-size: 14px;">Best Regards,</p>
              <p style="margin: 5px 0 0 0; font-weight: bold; color: #0f172a;">Career Lab Consulting</p>
            </div>
          </div>
          <div style="background-color: #f1f5f9; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            &copy; 2026 InternX AI by Career Lab Consulting. All rights reserved.<br/>
            This offer is valid for a limited time.
          </div>
        </div>
      `,
    });

    await transporter.sendMail({
      from: `"InternX System" <${process.env.SMTP_USER}>`,
      to: 'careerlabconsulting@gmail.com',
      bcc: 'mr.deepanshujoshi@gmail.com',
      subject: `🎓 Scholarship Won: ${name} (${discount}%) - ${planName}`,
      html: `
        <h2>New Scholarship Qualified</h2>
        <p><strong>Student:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone}</p>
        <p><strong>Plan:</strong> ${planName}</p>
        <p><strong>Score:</strong> ${score}</p>
        <p><strong>Discount:</strong> ${discount}% (${formatCurrency(scholarshipAmount)})</p>
        <p><strong>Code:</strong> ${scholarshipCode}</p>
        <p><strong>Final Fee:</strong> ${formatCurrency(finalFee)}</p>
      `,
    });

    return NextResponse.json(
      { success: true, message: 'Data saved to DB and emails sent' },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (error) {
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    console.error('Email/DB Saving Error:', errorMessage);
    
    return NextResponse.json(
      { error: 'Failed to process request', details: errorMessage }, 
      { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  }
}