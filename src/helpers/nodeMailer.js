import nodeMailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

export const sendMail = async (recipientEmail, subject, template) => {
  //* create transporter
  const mailTransporter = nodeMailer.createTransport({
    host: process.env.GM_MAIL_HOST,
    port: process.env.GM_MAIL_PORT,
    secure: false,
    auth: {
      user: process.env.GM_EMAIL,
      pass: process.env.GM_PASSWORD,
    },
  });

  //* create mail options
  const mailOptions = {
    from: process.env.GM_EMAIL,
    to: recipientEmail,
    subject,
    html: template,
  };

  //* send mail
  mailTransporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log('❌ SEND MAIL FAILURE: ', error);
    }
  });
};
