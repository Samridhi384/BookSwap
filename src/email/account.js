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

module.exports = {
  sendWelcomeMail,
};
