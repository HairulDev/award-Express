const { emailGmailUser, emailGmailPass, emailProvider, emailWITSMPTP, emailWITPort, emailWITUser, emailTesting, nodeEnv } = require("#config/vars");
const nodemailer = require("nodemailer");

/**
 * Send an email
 *
 * @param {object} options - Object data of {destination, subject, content}
 */
const send = async (options) => {
  return new Promise(async (resolve, reject) => {
    try {
      let transporterConfig = {
        host: "smtp.gmail.com",
        port: 465,
        secure: true,
        auth: {
          user: emailGmailUser,
          pass: emailGmailPass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      };
      let emailSender = emailGmailUser;
      if (emailProvider == "WIT") {
        transporterConfig = {
          host: emailWITSMPTP,
          port: emailWITPort,
          tls: { secureProtocol: "TLSv1_method" },
        };
        emailSender = options.emailSender
          ? options.emailSender
          : emailWITUser;
      }
      options.from = emailSender;

      // set email to user test if development
      if (nodeEnv === "development") {
        Object.assign(options, { to: emailTesting });
        if (options.cc) {
          Object.assign(options, { cc: emailTesting });
        }
      }

      const transporter = nodemailer.createTransport(transporterConfig);
      await transporter.sendMail(options, function (error, info) {
        if (error) {
          resolve({ success: true, info: error });
        } else {
          resolve({ success: true, info: info });
        }
      });
    } catch (error) {
      resolve({ success: true, info: error });
    }
  });
};

module.exports = {
  send,
};
