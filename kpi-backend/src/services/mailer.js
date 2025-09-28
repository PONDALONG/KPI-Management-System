import nodemailer from "nodemailer";

let transporter;
export function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    secure: false,
    auth: { user: process.env.MAIL_USER, pass: process.env.MAIL_PASS }
  });
  return transporter;
}

export async function sendKPIUpdateMail(to, subject, html) {
  if (!process.env.MAIL_HOST) return; // ไม่มีการตั้งค่า -> ข้าม
  const t = getTransporter();
  await t.sendMail({
    from: process.env.MAIL_FROM,
    to,
    subject,
    html
  });
}
