// server/utils/mailer.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // You can use any SMTP service
  auth: {
    user: process.env.EMAIL_USER, // Add to your .env
    pass: process.env.EMAIL_PASS, // Add to your .env
  },
});

const sendSwapAcceptedEmail = async (user1, user2) => {
  const mailOptions1 = {
    from: process.env.EMAIL_USER,
    to: user1.email,
    subject: 'SkillSwap Match Accepted!',
    text: `Hi ${user1.name}, your SkillSwap request with ${user2.name} has been accepted! You can contact them at ${user2.email}.`,
  };
  const mailOptions2 = {
    from: process.env.EMAIL_USER,
    to: user2.email,
    subject: 'SkillSwap Match Accepted!',
    text: `Hi ${user2.name}, your SkillSwap request with ${user1.name} has been accepted! You can contact them at ${user1.email}.`,
  };
  await transporter.sendMail(mailOptions1);
  await transporter.sendMail(mailOptions2);
};

module.exports = { sendSwapAcceptedEmail };
