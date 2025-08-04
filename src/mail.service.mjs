import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com", // Replace with your SMTP server
  port: 587,
  secure: false, // true for 465, false for other ports
  auth: {
    user: "agustingmez@gmail.com", // Replace with your email
    pass: "rnby zshe yrgi furq", // Replace with your password
  },
});

export async function sendMail({ from, to, subject, text, html, attachments }) {
  console.log("Sending email to:", to);
  const mailOptions = {
    from,
    to,
    subject,
    text,
    html,
    attachments, // Add attachments property
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info;
  } catch (error) {
    throw error;
  }
}
