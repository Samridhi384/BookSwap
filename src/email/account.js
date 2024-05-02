require("dotenv").config();
const sgMail = require("@sendgrid/mail");

const sendgridApiKey = process.env.SENDGRID_API_KEY;

sgMail.setApiKey(sendgridApiKey);

const sendWelcomeMail = (email, name) => {
  sgMail.send({
    to: email,
    from: process.env.FROM_EMAIL,
    subject: "Thanks for contributing",
    text: `Hello ${name}, Welcome to the team! \n Gratitude for your immence participation`,
  });
};

const sendResetPasswordMail = (email, token) => {
  sgMail.send({
    to: email,
    from: process.env.FROM_EMAIL,
    subject: "Reset your password",
    text: `Dear User,
              As per your request this is link to reset password http://localhost:5000/reset-password/${token} Link is valid for 1 hour.`,
  });
};

module.exports = {
  sendWelcomeMail,
  sendResetPasswordMail,
};
