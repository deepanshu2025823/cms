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
    
    // CAPTURING THE 6 NEW FIELDS FROM REQUEST BODY
    const fatherName = String(body.fatherName || 'N/A');
    const fatherOccupation = String(body.fatherOccupation || 'N/A');
    const motherName = String(body.motherName || 'N/A');
    const motherOccupation = String(body.motherOccupation || 'N/A');
    const pincode = String(body.pincode || 'N/A');
    const address = String(body.address || 'N/A');

    const testType = String(body.testType || 'scholarship'); 
    const testResponses = body.testResponses || null; 

    if (!email) {
       return NextResponse.json({ error: 'Email is required' }, { status: 400, headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    // PRISMA UPSERT INCLUDING NEW FIELDS
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
        testType: testType,
        fatherName: fatherName,
        fatherOccupation: fatherOccupation,
        motherName: motherName,
        motherOccupation: motherOccupation,
        pincode: pincode,
        address: address,
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
        testType: testType, 
        fatherName: fatherName,
        fatherOccupation: fatherOccupation,
        motherName: motherName,
        motherOccupation: motherOccupation,
        pincode: pincode,
        address: address,
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);
    };

    const hireXLogoHtml = `
        <div style="margin-bottom: 20px;">
            <span style="font-family: 'Arial Black', sans-serif; font-size: 28px; font-style: italic; font-weight: 900; color: #1e293b; letter-spacing: -1px;">
                Hire<span style="color: #2563eb;">X</span>
            </span>
            <div style="font-family: 'Courier New', monospace; font-size: 10px; font-weight: bold; color: #64748b; text-transform: uppercase; letter-spacing: 1px; margin-top: -2px;">Your gateway to jobs and top talent</div>
        </div>`;

    const clcLogoHtml = `<img src="https://careerlabconsulting.com/logo.png" alt="Career Lab Consulting" width="160" style="display: block; margin-bottom: 20px; border: none;">`;

    // --- 1. DISQUALIFIED HANDLER ---
    if (status === 'disqualified') {
        await transporter.sendMail({
            from: `"HireX Security" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `Action Required: Test Session Terminated - HireX`,
            html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #fee2e2; border-radius: 12px; overflow: hidden; background-color: #ffffff;">
                    <div style="background-color: #ef4444; padding: 25px; text-align: center;">
                        <h1 style="color: white; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">Session Terminated</h1>
                    </div>
                    <div style="padding: 35px 30px;">
                        ${hireXLogoHtml}
                        <p style="font-size: 16px; color: #1f2937; margin-top: 0;">Dear <strong>${name}</strong>,</p>
                        <p style="color: #4b5563; line-height: 1.6;">
                            This is to inform you that your test session for the <strong>${planName}</strong> was automatically terminated by our automated proctoring system.
                        </p>
                        <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 15px 20px; margin: 25px 0;">
                            <strong style="color: #991b1b; display: block; margin-bottom: 5px;">Reason for Termination:</strong>
                            <span style="color: #7f1d1d; font-size: 14px;">Multiple occurrences of tab switching or window focus loss were detected, violating our strict anti-cheating policy.</span>
                        </div>
                        <p style="color: #6b7280; font-size: 14px; line-height: 1.5;">
                            HireX maintains a zero-tolerance policy to ensure a fair assessment environment for all applicants. A report has been logged with our administrative team.
                        </p>
                        <div style="margin-top: 35px; border-top: 1px solid #f3f4f6; padding-top: 20px;">
                            <p style="margin: 0; color: #9ca3af; font-size: 13px;">Regards,<br><strong style="color: #4b5563;">HireX Administrative Team</strong></p>
                        </div>
                    </div>
                </div>`
        });

        await transporter.sendMail({
            from: `"HireX System" <${process.env.SMTP_USER}>`,
            to: 'careerlabconsulting@gmail.com',
            subject: `🚩 SECURITY ALERT: Test Disqualified - ${name}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border-left: 5px solid #ef4444; background: #fafafa;">
                    <h2 style="color: #ef4444; margin-top: 0;">User Disqualified (Proctoring Violation)</h2>
                    <table style="width: 100%; max-width: 500px; border-collapse: collapse; margin-top: 15px;">
                        <tr><td style="padding: 8px 0; color: #666; width: 120px;">Name:</td><td style="font-weight: bold;">${name}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666;">Email:</td><td style="font-weight: bold;">${email}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666;">Phone:</td><td style="font-weight: bold;">${phone}</td></tr>
                        <tr><td style="padding: 8px 0; color: #666;">Plan:</td><td style="font-weight: bold;">${planName} (${testType})</td></tr>
                    </table>
                    <hr style="border: 0; border-top: 1px solid #ddd; margin: 20px 0;"/>
                    <h4 style="margin: 0 0 10px 0; color: #333;">Profile Context:</h4>
                    <p style="margin: 4px 0; color: #555;"><strong>Edu:</strong> ${qualification} from ${collegeName}</p>
                    <p style="margin: 4px 0; color: #555;"><strong>Loc:</strong> ${address}, ${city}, ${state} - ${pincode}</p>
                </div>`
        });

        return NextResponse.json({ success: true, message: 'Disqualification processed and saved' }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    if (testType === 'aptitude') {
        await transporter.sendMail({
            from: `"HireX Hiring" <${process.env.SMTP_USER}>`,
            to: email, 
            subject: `Assessment Completed: HireX College Hiring Program`,
            html: `
              <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif; color: #1f2937; max-width: 650px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
                <div style="background: linear-gradient(135deg, #1e293b 0%, #334155 100%); padding: 40px 30px; text-align: left;">
                  <img src="https://careerlabconsulting.com/favicon.ico" width="120" height="40" alt="HireX"> <span style="font-family: 'Arial Black', sans-serif; font-size: 32px; font-style: italic; font-weight: 900; color: #ffffff; letter-spacing: -1px;">Hire<span style="color: #60a5fa;">X</span></span>
                  <h1 style="color: #ffffff; margin: 15px 0 0 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">Assessment Submitted</h1>
                </div>
                <div style="padding: 40px 35px;">
                  <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-top: 0;">
                      Dear <strong>${name}</strong>,<br><br>
                      Thank you for completing the HireX College Hiring Aptitude Test. We have successfully received your technical assessment responses.
                  </p>
                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 25px; margin: 30px 0; text-align: center;">
                    <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Your Score</span><br/>
                    <span style="font-size: 36px; font-weight: 900; color: #0f172a; line-height: 1.2;">${score}<span style="font-size: 18px; color: #94a3b8; font-weight: 500;">/${totalQuestions * 2}</span></span>
                  </div>
                  <p style="color: #4b5563; font-size: 15px; line-height: 1.6;">
                    Our recruitment team will now review your detailed technical report and academic background (${collegeName}). We will reach out to you shortly regarding the next steps in the hiring process.
                  </p>
                  <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #f3f4f6;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">Best regards,</p>
                    <p style="margin: 5px 0 0 0; font-weight: 700; color: #1f2937; font-size: 15px;">Recruitment Team, HireX</p>
                  </div>
                </div>
              </div>`
        });

        await transporter.sendMail({
            from: `"HireX System" <${process.env.SMTP_USER}>`,
            to: 'careerlabconsulting@gmail.com',
            subject: `🚀 HIRING LEAD: ${name} (Score: ${score}) - ${collegeName}`,
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border-left: 5px solid #2563eb; background: #fafafa;">
                    <h2 style="color: #2563eb; margin-top: 0;">New Aptitude Test Submitted</h2>
                    <table style="width: 100%; max-width: 600px; border-collapse: collapse; margin-top: 15px; font-size: 14px;">
                        <tr><td style="padding: 6px 0; color: #555; width: 140px;">Candidate Name:</td><td style="font-weight: bold; color: #111;">${name}</td></tr>
                        <tr><td style="padding: 6px 0; color: #555;">Email:</td><td style="font-weight: bold; color: #111;">${email}</td></tr>
                        <tr><td style="padding: 6px 0; color: #555;">Father Info:</td><td>${fatherName} (${fatherOccupation})</td></tr>
                        <tr><td style="padding: 6px 0; color: #555;">Mother Info:</td><td>${motherName} (${motherOccupation})</td></tr>
                        <tr><td style="padding: 6px 0; color: #555;">Location:</td><td>${address}, ${city}, ${state} - ${pincode}</td></tr>
                    </table>
                    <h4 style="margin: 20px 0 10px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Academic Context</h4>
                    <table style="width: 100%; max-width: 600px; border-collapse: collapse; font-size: 14px;">
                        <tr><td style="padding: 6px 0; color: #555; width: 140px;">Qualification:</td><td style="font-weight: bold; color: #111;">${qualification}</td></tr>
                        <tr><td style="padding: 6px 0; color: #555;">Institution:</td><td style="font-weight: bold; color: #111;">${collegeName}</td></tr>
                    </table>
                    <h4 style="margin: 20px 0 10px 0; color: #333; border-bottom: 1px solid #ddd; padding-bottom: 5px;">Test Results</h4>
                    <table style="width: 100%; max-width: 600px; border-collapse: collapse; font-size: 14px;">
                        <tr><td style="padding: 6px 0; color: #555; width: 140px;">Test Type:</td><td style="font-weight: bold; color: #111;">Aptitude (All Hard)</td></tr>
                        <tr><td style="padding: 6px 0; color: #555;">Score:</td><td style="font-weight: bold; color: #2563eb; font-size: 18px;">${score}/${totalQuestions * 2}</td></tr>
                    </table>
                </div>`
        });

        return NextResponse.json({ success: true, message: 'Aptitude saved and emails sent' }, { headers: { 'Access-Control-Allow-Origin': '*' } });
    }

    const mrpAmount = planName === 'Foundation' ? 120000 : 200000;
    const scholarshipAmount = Math.round((mrpAmount * discount) / 100);
    const finalFee = mrpAmount - scholarshipAmount;

    await transporter.sendMail({
      from: `"InternX Admissions" <${process.env.SMTP_USER}>`,
      to: email, 
      subject: `🏆 Your InternX Scholarship Results are in! (${discount}% Awarded)`,
      html: `
        <div style="font-family: 'Inter', -apple-system, BlinkMacSystemFont, Arial, sans-serif; color: #1f2937; max-width: 650px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
          <div style="background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%); padding: 40px 30px; text-align: center;">
            <div style="margin-bottom: 20px;">${clcLogoHtml}</div>
            <p style="color: #bfdbfe; margin: 0 0 10px 0; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px;">InternX ${planName} Program</p>
            <h1 style="color: #ffffff; margin: 0; font-size: 32px; font-weight: 800; letter-spacing: -0.5px;">Congratulations, ${name.split(' ')[0]}!</h1>
          </div>
          <div style="padding: 40px 35px;">
            <p style="font-size: 16px; line-height: 1.6; color: #4b5563; margin-top: 0;">
                We have successfully reviewed your assessment. Based on your performance and background from <strong>${collegeName}</strong>, we are thrilled to offer you a scholarship.
            </p>
            <div style="display: flex; gap: 15px; margin: 30px 0;">
              <div style="flex: 1; background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; text-align: center;">
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Test Score</span><br/>
                <span style="font-size: 28px; font-weight: 900; color: #0f172a; line-height: 1.2;">${score}<span style="font-size: 14px; color: #94a3b8; font-weight: 500;">/${totalQuestions * 2}</span></span>
              </div>
              <div style="flex: 1; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 20px; text-align: center;">
                <span style="font-size: 12px; color: #166534; text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Scholarship</span><br/>
                <span style="font-size: 28px; font-weight: 900; color: #15803d; line-height: 1.2;">${discount}%</span>
              </div>
            </div>
            <div style="background-color: #eff6ff; border: 1px dashed #93c5fd; border-radius: 12px; padding: 25px; text-align: center; margin-bottom: 30px;">
                <p style="margin: 0 0 10px 0; color: #1e3a8a; font-size: 14px; font-weight: 600;">YOUR UNIQUE ENROLLMENT CODE</p>
                <div style="font-size: 28px; font-weight: 900; color: #2563eb; letter-spacing: 2px; font-family: monospace;">${scholarshipCode}</div>
            </div>
            <div style="margin-top: 40px; text-align: center;">
              <a href="https://careerlabconsulting.com/checkout/b2c?scholarshipCode=${scholarshipCode}&planName=${planName}" style="background-color: #2563eb; color: #ffffff; padding: 16px 36px; text-decoration: none; border-radius: 8px; font-weight: 700; font-size: 16px; display: inline-block;">Claim & Enroll Now</a>
            </div>
            <div style="margin-top: 40px; padding-top: 25px; border-top: 1px solid #f3f4f6;">
              <p style="margin: 0; color: #6b7280; font-size: 14px;">Best regards,</p>
              <p style="margin: 5px 0 0 0; font-weight: 700; color: #1f2937; font-size: 15px;">Admissions Team, InternX AI</p>
            </div>
          </div>
          <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0;">
            &copy; 2026 InternX by Career Lab Consulting. All rights reserved.
          </div>
        </div>`
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
                <tr><td style="padding: 6px 0; color: #555;">Parent Info:</td><td>${fatherName} (${fatherOccupation})</td></tr>
                <tr><td style="padding: 6px 0; color: #555;">Contact:</td><td>${email} | ${phone}</td></tr>
                <tr><td style="padding: 6px 0; color: #555;">Location:</td><td>${address}, ${city}, ${state} - ${pincode}</td></tr>
                <tr><td style="padding: 6px 0; color: #555;">Discount Given:</td><td style="font-weight: bold; color: #16a34a;">${discount}%</td></tr>
            </table>
        </div>`
    });

    return NextResponse.json({ success: true, message: 'Data saved and emails sent' }, { headers: { 'Access-Control-Allow-Origin': '*' } });

  } catch (error) {
    let errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    console.error('Email/DB Saving Error:', errorMessage);
    return NextResponse.json({ error: 'Failed to process request', details: errorMessage }, { status: 500, headers: { 'Access-Control-Allow-Origin': '*' } });
  }
}