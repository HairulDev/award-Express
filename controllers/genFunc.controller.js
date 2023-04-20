const helper = require("#lib/response");
const { email } = require("#lib/index");
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const s3 = require("#lib/s3");
const { Octokit } = require('@octokit/rest');
const sharp = require('sharp');
const vars = require("#config/vars");

const sendEmail = async (to, from, subject, data, urlPathFile) => {
  let pathFile = path.join(__dirname, `../template/${urlPathFile}`);
  let readFile = fs.readFileSync(pathFile);
  let template = handlebars.compile(readFile.toString());
  let text = template(data);
  const mailOptionsNodeMailer = {
    to: to,
    subject: subject,
    html: text,
  };
  try {
    await email.send(mailOptionsNodeMailer); // nodemailer
  } catch (error) {
    console.error(error);
  }
};

const uploadFile = async (file, path, req, res) => {
  let filenameFormatted = "";
  const extension = file.name.split(".");
  const ext =
    extension.length > 1 ? "." + extension[extension.length - 1] : "";
  filenameFormatted = `${new Date() / 1}${ext}`;

  if (!file)
    return helper.errorHelper(req, res, 400, {
      success: false,
      message: `Empty File`,
    });

  try {
    const data = await file.mv(`${path}/${filenameFormatted}`, (err) => {
      if (err) return helper.errorHelper(req, res, 400, {
        success: false,
        message: err,
      });
    });
    return ({ filenameFormatted, data });
  } catch (error) {
    return helper.errorHelper(req, res, 400, {
      success: false,
      message: error,
    });
  }
};

const deleteFile = async (filenameFormatted, path, req, res) => {
  try {
    // cek apakah file tersebut ada
    if (fs.existsSync(`${path}/${filenameFormatted}`)) {
      // hapus file menggunakan fungsi unlink
      fs.unlink(`${path}/${filenameFormatted}`, (err) => {
        if (err) {
          return helper.errorHelper(req, res, 400, {
            success: false,
            message: err,
          });
        }
      });
    } else {
      return helper.errorHelper(req, res, 400, {
        success: false,
        message: `File tidak ditemukan`,
      });
    }
    return { filenameFormatted }
  } catch (error) {
    return helper.errorHelper(req, res, 400, {
      success: false,
      message: error,
    });
  }
};



const uploadAWS = async (file, path, req, res) => {
  let filenameFormatted = "";
  const extension = file.name.split(".");
  const ext =
    extension.length > 1 ? "." + extension[extension.length - 1] : "";
  filenameFormatted = `${new Date() / 1}${ext}`;

  if (!file)
    return helper.errorHelper(req, res, 400, {
      success: false,
      message: `Empty File`,
    });

  try {
    // upload to s3
    const upload = await s3.put(file.tempFilePath, `${path}/${filenameFormatted}`);
    if (upload.status == false) {
      return helper.errorHelper(req, res, 400, {
        success: false,
        message: upload.message,
      });
    }
    return { filenameFormatted, upload }

  } catch (error) {
    console.error(error);
    return error;
  }
};

const deleteAWS = async (filenameFormatted, path, req, res) => {
  try {
    // upload to s3
    const fileSource = `${path}/${filenameFormatted}`;
    const deleting = await s3.remove(fileSource);

    return { filenameFormatted, deleting }

  } catch (error) {
    console.error(error);
    return error;
  }
};

module.exports = {
  sendEmail,
  uploadFile,
  deleteFile,
  uploadAWS,
  deleteAWS,
};