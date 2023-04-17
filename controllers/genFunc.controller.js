const helper = require("#lib/response");
const genFuncModel = require("#models/genFunc.model");
const { sendGridAPIKey } = require("#config/vars");
const { email } = require("#lib/index");
const handlebars = require("handlebars");
const path = require("path");
const fs = require("fs");
const s3 = require("#lib/s3");
const { string } = require("#utils/index");
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

const uploadAWS = async (file, path) => {
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

const convertArrayToObject = (arr) => {
  const obj = {};
  for (let i = 0; i < arr.length; i++) {
    obj[arr[i]] = arr[i];
  }
  return obj;
}

const tableSelect = async (tableId) => {
  try {
    const tableSelect = await genFuncModel.tableSelect(tableId);
    if (tableSelect) {
      const tableName = tableSelect?.mpa_code;
      let cols = tableSelect?.mpa_paramtext.split(", ");
      let colsObj = convertArrayToObject(cols)
      return { tableName, cols, colsObj };
    }
    return ""
  } catch (error) {
    return error;
  }
}

const uploadFileGithub = async (file, path, req, res) => {
  try {
    if (!file) {
      return errorHelper(req, res, 400, {
        success: false,
        message: `Empty File`,
      });
    }
    // check if the file is an image
    if (!file.mimetype.startsWith('image/')) {
      return res.status(400).send('Only image files are allowed.');
    }

    let filenameFormatted = "";
    const extension = file.name.split(".");
    const ext =
      extension.length > 1 ? "." + extension[extension.length - 1] : "";
    filenameFormatted = `${new Date() / 1}${ext}`


    // kompresi file image menggunakan sharp
    const compressToBuffer = await sharp(file.tempFilePath)
      .resize(800, 600)
      .toFormat('jpeg')
      .toBuffer();
    // simpan file image yang sudah dikompresi di direktori 'file.tempFilePath'
    await sharp(compressToBuffer).toFile(file.tempFilePath);

    let token = vars.tokenGithub;

    const octokit = new Octokit({
      auth: token
    });

    const owner = vars.ownerGithub;
    const repo = vars.repoGithub;
    // let imageData = fs.readFileSync(compressToFile);
    let imageData = fs.readFileSync(file.tempFilePath);
    let content = imageData.toString('base64');

    const { data } = await octokit.request(`PUT /repos/${owner}/${repo}/contents/${path}/${filenameFormatted}`, {
      owner,
      repo,
      path: path,
      message: 'my commit message',
      content,
      sha: vars.shaGithub,
      committer: {
        name: vars.ownerGithub,
        email: vars.emailCommitGithub,
      },
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
    );
    return ({ filenameFormatted, data });
  } catch (error) {
    res.status(500).send(error);
  }
};

const deleteFileGithub = async (filenameFormatted, path, req, res) => {
  if (!filenameFormatted) {
    return errorHelper(req, res, 400, {
      success: false,
      message: `Empty File`,
    });
  }
  try {
    const token = vars.tokenGithub;
    const owner = vars.ownerGithub;
    const repo = vars.repoGithub;

    const octokit = new Octokit({
      auth: token
    })

    const getData =
      await octokit.request(`GET /repos/${owner}/${repo}/contents/${path}/${filenameFormatted}`, {
        owner,
        repo,
        path: path,
        headers: {
          'X-GitHub-Api-Version': '2022-11-28'
        }
      })

    await octokit.request(`DELETE /repos/${owner}/${repo}/contents/${path}/${filenameFormatted}`, {
      owner,
      repo,
      path: path,
      message: 'my commit delete message',
      committer: {
        name: vars.ownerGithub,
        email: vars.emailCommitGithub,
      },
      sha: getData.data.sha,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })

  } catch (error) {
    console.error("error deleteFileGithub=====", error);
    return errorHelper(req, res, 400, {
      success: false,
      message: error,
    });
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

    // // kompresi file image menggunakan sharp
    // const compressToBuffer = await sharp(file.tempFilePath)
    //   .resize(800, 600)
    //   .toFormat('jpeg')
    //   .toBuffer();
    // // simpan file image yang sudah dikompresi di direktori 'file.tempFilePath'
    // await sharp(compressToBuffer).toFile(file.tempFilePath);
    // let imageData = fs.readFileSync(file.tempFilePath);
    // let content = imageData.toString('base64');



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

module.exports = {
  sendEmail,
  uploadAWS,
  tableSelect,
  convertArrayToObject,
  uploadFile,
  deleteFile,
  uploadFileGithub,
  deleteFileGithub,
};
