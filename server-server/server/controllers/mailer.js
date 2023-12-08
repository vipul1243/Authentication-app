const nodemailer = require("nodemailer");
const mailgen = require("mailgen");

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'emmalee55@ethereal.email',
        pass: 'TySQaSdfrdSeCtw4Q9'
    }
});

let MailGenerator = new mailgen({
  theme: "default",
  product: {
    name: "Mailgen",
    link: "https://mailgen.js/",
  },
});

exports.registerMail = async (req, res) => {
  const { username, userEmail, text, subject } = req.body;

  // body of the email
  var email = {
    body: {
      name: username,
      intro:
        text || "Welcome to HaTi! We're very excited to have you on board.",
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };

  var emailBody = MailGenerator.generate(email);

  let message = {
    from: process.env.EMAIL,
    to: userEmail,
    subject: subject || "Signup Successful",
    html: emailBody,
  };

  // send mail
  transporter
    .sendMail(message)
    .then(() => {
      return res.send({
        success: true,
        message: "You should receive an email from us.",
      });
    })
    .catch((error) =>
      res.send({
        success: false,
        message: error.message,
      })
    );
};
