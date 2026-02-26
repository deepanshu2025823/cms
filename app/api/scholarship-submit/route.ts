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
    
    const qualification = String(body.qualification || 'N/A');
    const collegeName = String(body.collegeName || 'N/A');
    const city = String(body.city || 'N/A');
    const state = String(body.state || 'N/A');
    
    const testResponses = body.testResponses || null; 

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
        testResponses: testResponses, 
        qualification: qualification,
        collegeName: collegeName,
        city: city,
        state: state,
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
        testResponses: testResponses, 
        qualification: qualification,
        collegeName: collegeName,
        city: city,
        state: state,
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
            subject: `Action Required: Test Session Terminated - InternX`,
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #ef4444; padding: 25px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Session Terminated</h1>
                    </div>
                    <div style="padding: 35px 30px;">
                        <p style="font-size: 16px; color: #1f2937; margin-top: 0;">Dear <strong>${name}</strong>,</p>
                        <p style="color: #4b5563; line-height: 1.6;">
                            This is to inform you that your scholarship test session for the <strong>${planName} Program</strong> was automatically terminated by our automated proctoring system.
                        </p>
                        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; margin: 25px 0;">
                            <strong style="color: #991b1b; display: block; margin-bottom: 5px;">Reason for Termination:</strong>
                            <span style="color: #7f1d1d; font-size: 14px;">Multiple occurrences of tab switching or window focus loss were detected, violating our strict anti-cheating policy.</span>
                        </div>
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                            InternX maintains a zero-tolerance policy to ensure a fair assessment environment for all applicants. A report has been logged with our administrative team. You are currently ineligible to proceed with this scholarship application.
                        </p>
                        <div style="margin-top: 35px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                            <p style="margin: 0; color: #9ca3af; font-size: 13px;">Regards,<br><strong style="color: #4b5563;">InternX Administrative Team</strong></p>
                        </div>
                    </div>
                </div>
            `
        });

        await transporter.sendMail({
            from: `"InternX System" <${process.env.SMTP_USER}>`,
            to: 'careerlabconsulting@gmail.com',
            subject: `🚩 SECURITY ALERT: Test Disqualified - ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border-left: 5px solid #ef4444; background: #fafafa;">
                    <h2 style="color: #ef4444; margin-top: 0;">User Disqualified (Proctoring Violation)</h2>
                    <table style="width: 100%; max-width: 500px; border-collapse: collapse; margin-top: 15px;">
                        <tr><td style="padding: 8px 0; color: #666; width: 120px;">Name:</td><td style="font-weight: bold;">${name}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="font-weight: bold;">${email}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666;">Phone:</td><td style="font-weight: bold;">${phone}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666;">Plan:</td><td style="font-weight: bold;">${planName}</td></tr>
                    </table>
                    <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;"/>
                    <h4 style="margin: 0 0 10px 0; color: #333;">Profile Context:</h4>
                    <p style="margin: 4px 0; color: #555;"><strong>Edu:</strong> ${qualification} from ${collegeName}</p>
                    <p style="margin: 4px 0; color: #555;"><strong>Loc:</strong> ${city}, ${state}</p>
                </div>
            `
        });

        return NextResponse.json(
          { success: true, message: 'Disqualification processed' },
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
      from: `"InternX Admissions" <${process.env.SMTP_USER}>`,
      to: email, 
      subject: `🏆 Your InternX Scholarship Results are in! (${discount}% Awarded)`,
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif; color: #1f2937; max-width: 650px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
            <p style="color: #bfdbfe; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">InternX ${planName} Program</p>
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">Congratulations, ${name.split(' ')[0]}!</h1>
          </div>
          
          <div style="padding: 40px 35px;">
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-top: 0;">
                We have successfully reviewed your recent assessment. Based on your performance, academic background from <strong>${collegeName}</strong>, and aptitude, we are thrilled to offer you a scholarship for the InternX Program.
            </p>
            
            <div style="display: flex; gap: 15px; margin: 30px 0;">
              <div style="flex: 1; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center;">
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Test Score</span><br/>
                <span style="font-size: 28px; font-weight: 900; color: #0f172a; line-height: 1.2;">${score}<span style="font-size: 14px; color: #94a3b8; font-weight: 500;">/50</span></span>
              </div>
              <div style="flex: 1; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center;">
                <span style="font-size: 12px; color: #166534; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Scholarship</span><br/>
                <span style="font-size: 28px; font-weight: 900; color: #15803d; line-height: 1.2;">${discount}%</span>
              </div>
            </div>

            <div style="background-color: #eff6ff; border: 1px dashed #93c5fd; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
                <p style="margin: 0 0 10px 0; color: #1e3a8a; font-size: 14px; font-weight: 600;">YOUR UNIQUE ENROLLMENT CODE</p>
                <div style="font-size: 28px; font-weight: 900; color: #2563eb; letter-spacing: 2px; font-family: monospace;">
                  ${scholarshipCode}
                </div>
            </div>

            <h3 style="color: #111827; font-size: 18px; font-weight: 700; margin-bottom: 15px; border-bottom: 2px solid #f3f4f6; padding-bottom: 10px;">Revised Fee Structure</h3>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
              <tr>
                <td style="padding: 12px 0; color: #6b7280; font-size: 15px;">Program Base Fee (MRP)</td>
                <td style="padding: 12px 0; text-align: right; text-decoration: line-through; color: #9ca3af; font-size: 15px;">${formatCurrency(mrpAmount)}</td>
              </tr>
              <tr>
                <td style="padding: 12px 0; color: #15803d; font-weight: 600; font-size: 15px;">Scholarship Applied</td>
                <td style="padding: 12px 0; text-align: right; color: #15803d; font-weight: 600; font-size: 15px;">-${formatCurrency(scholarshipAmount)}</td>
              </tr>
              <tr>
                <td style="padding: 20px 0 0 0; color: #111827; font-weight: 800; font-size: 18px; border-top: 1px dashed #e5e7eb;">Final Enrollment Fee</td>
                <td style="padding: 20px 0 0 0; text-align: right; color: #2563eb; font-weight: 900; font-size: 26px; border-top: 1px dashed #e5e7eb;">${formatCurrency(finalFee)}</td>
              </tr>
            </table>

            <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
              Please note that this offer is strictly valid for the next <strong>48 hours</strong>. Due to limited cohort sizes, we encourage you to secure your seat at the earliest.
            </p>

            <div style="margin-top: 40px; text-align: center;">
              <a href="https://internx.ai/checkout/b2c?scholarshipCode=${scholarshipCode}&planName=${planName}" style="background-color: #2563eb; color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block;">
                Claim Scholarship & Enroll
              </a>
            </div>

            <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #f3f4f6;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Looking forward to welcoming you to the cohort.</p>
              <p style="margin: 5px 0 0 0; font-weight: 700; color: #1f2937; font-size: 15px;">Admissions Team, InternX AI</p>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            &copy; 2026 InternX by Career Lab Consulting. All rights reserved.
          </div>
        </div>
      `,
    });

    await transporter.sendMail({
      from: `"InternX System" <${process.env.SMTP_USER}>`,
      to: 'careerlabconsulting@gmail.com',
      bcc: 'mr.deepanshujoshi@gmail.com',
      subject: `✅ NEW LEAD: ${name} (${discount}%) - ${planName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; border-left: 5px solid #2563eb; background: #fafafa;">
            <h2 style="color: #2563eb; margin-top: 0;">New Scholarship Lead Captured</h2>
            
            <table style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
                <tr><td style="padding: 6px 0; color: #555; width: 140px;">Candidate Name:</td><td style="font-weight: bold; color: #111;">${name}</td></tr>
                <tr><td style="padding: 6px 0; color: #555;">Email:</td><td style="font-weight: bold; color: #111;">${email}</td></tr>
                <tr><td style="padding: 6px 0; color: #555;">Phone / WA:</td><td style="font-weight: bold; color: #111;">${phone}</td></tr>
                <tr><td style="padding: 6px 0; color: #555;">Location:</td><td style="font-weight: bold; color: #111;">${city}, ${state}</td></tr>
            </table>

            <h4 style="margin: 20px 0 10px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Academic Context</h4>
            <table style="width: 100%; max-width: 600px; border-collapse: collapse; font-size: 14px;">
                <tr><td style="padding: 6px 0; color: #555; width: 140px;">Qualification:</td><td style="font-weight: bold; color: #111;">${qualification}</td></tr>
                <tr><td style="padding: 6px 0; color: #555;">Institution:</td><td style="font-weight: bold; color: #111;">${collegeName}</td></tr>
            </table>

            <h4 style="margin: 20px 0 10px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Test Results & Offer</h4>
            <table style="width: 100%; max-width: 600px; border-collapse: collapse; font-size: 14px;">
                <tr><td style="padding: 6px 0; color: #555; width: 140px;">Program:</td><td style="font-weight: bold; color: #111;">${planName}</td></tr>
                <tr><td style="padding: 6px 0; color: #555;">Score:</td><td style="font-weight: bold; color: #111;">${score}/${totalQuestions * 2}</td></tr>
                <tr><td style="padding: 6px 0; color: #555;">Discount Given:</td><td style="font-weight: bold; color: #16a34a;">${discount}% (${formatCurrency(scholarshipAmount)})</td></tr>
                <tr><td style="padding: 6px 0; color: #555;">Coupon Code:</td><td style="font-weight: bold; color: #2563eb; font-family: monospace; font-size: 16px;">${scholarshipCode}</td></tr>
                <tr><td style="padding: 6px 0; color: #555;">Final Fee:</td><td style="font-weight: bold; color: #111;">${formatCurrency(finalFee)}</td></tr>
            </table>
            
            <p style="margin-top: 25px; font-size: 12px; color: #888;">
                <em>Action: Review their MCQ details in the admin dashboard before placing a nurturing call.</em>
            </p>
        </div>
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