import nodemailer from "nodemailer";


const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  service: process.env.SMTP_SERVICE,
  port: process.env.SMTP_PORT, 
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendJobEmail = async ({ email, subject, message }) => {
    console.log("sendJobEmail",email,subject)
  try {
    // Check fields
    if (!email || !subject || !message) {
      throw new Error("Email, subject, and message are required fields.");
    }

    const options = {
      from: process.env.SMTP_MAIL,
      to: email,
      subject: subject,
      text: message,
    };

    // Send email
    const info = await transporter.sendMail(options); // Correct method to send email
    console.log("info",info)
    console.log(`Email sent: ${info.response}`);
  } catch (error) {
    console.error(`Error sending email: ${error.message}`);
    throw error; // Rethrow the error to be caught in sendJobCrone
  }
};
