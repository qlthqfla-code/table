import nodemailer from "nodemailer";

let transporter: ReturnType<typeof nodemailer.createTransport> | null = null;

function getTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });
  }
  return transporter;
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  await getTransporter().sendMail({
    from: `"الأكاديمية الحديثة" <${process.env.GMAIL_USER}>`,
    to,
    subject: "إعادة تعيين الباسورد — نظام كشف تعارض الجداول",
    html: `
      <div dir="rtl" style="font-family: Tahoma, Arial, sans-serif; max-width: 480px; margin: 0 auto;">
        <h2 style="color:#142c63;">إعادة تعيين الباسورد</h2>
        <p>وصلنا طلب إعادة تعيين الباسورد بتاع حسابك. دوس على الزرار ده خلال 30 دقيقة:</p>
        <p style="text-align:center; margin: 24px 0;">
          <a href="${resetUrl}" style="background:#1e46a4; color:#fff; padding:12px 24px; border-radius:8px; text-decoration:none; font-weight:bold;">
            إعادة تعيين الباسورد
          </a>
        </p>
        <p style="color:#666; font-size:13px;">لو انت مش اللي طلبت ده، تجاهل الإيميل ده ببساطة — حسابك آمن.</p>
      </div>
    `,
  });
}
