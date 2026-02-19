import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_APP_PASS,
  },
});

export default async function check(email, otp) {
  const composedMail = {
    from: `"ottPlatform" <${process.env.EMAIL}>`,
    to: email,
    subject: `${otp} is your verification otp`,
    text: `${otp} is your verification otp`,
    html: `<h1>${otp} is your verification otp</h1>`,
  };

  try {
    const info = await transport.sendMail(composedMail);
    return info;
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}
