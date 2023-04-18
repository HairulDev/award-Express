const fs = require("fs");
const aws = require("aws-sdk");
const vars = require("#config/vars");
const { env } = require("process");

aws.config.update({
  accessKeyId: vars.awsAccessKey,
  secretAccessKey: vars.awsSecretKey,
  region: vars.awsRegion,
});

/**
 * Get a file from S3 bucket
 *
 * @param {string} filepath - The file path
 */
const get = (filepath) => {
  const s3 = new aws.S3();
  const path = filepath.split("/");
  const filename = path[path.length - 1];
  const localPath = "/tmp/" + filename;
  const writeStream = fs.createWriteStream(localPath);

  const params = {
    Bucket: process.env.S3_BUCKET_AWS,
    Key: filepath,
  };

  return new Promise((resolve, reject) => {
    const readStream = s3.getObject(params).createReadStream();

    // Error handling in read stream
    readStream.on("error", (err) => {
      console.log(err);
      reject({ err });
    });

    // Resolve if done writing
    writeStream.once("finish", () => {
      resolve({ file: localPath });
    });

    // pipe will automatically finish the write stream once done
    readStream.pipe(writeStream);
  });
};

/**
 * Upload a file to S3 bucket
 *
 * @param {*} fileSource
 * @param {*} fileDestination
 */
const put = (fileSource, fileDestination) => {
  const s3 = new aws.S3();

  const params = {
    Bucket: process.env.S3_BUCKET_AWS,
    Body: fs.createReadStream(fileSource),
    Key: fileDestination,
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      if (err) {
        console.log(err);
        resolve({ status: false, message: err });
      } else {
        console.log(data);
        resolve({ status: true, message: "upload success", data: data });
      }
    });
  });
};

/**
 * Delete a file from S3 bucket
 *
 * @param {*} fileSource
 */
const remove = (fileSource) => {
  const s3 = new aws.S3();

  const params = {
    Bucket: process.env.S3_BUCKET_AWS,
    Key: fileSource,
  };

  return new Promise((resolve, reject) => {
    s3.deleteObject(params, function (err, data) {
      if (err) {
        console.log(err);
        resolve({ status: false, message: err });
      } else {
        console.log(data);
        resolve({ status: true, message: "Delete success", data: data });
      }
    });
  });
};

/**
 * Copy file from a directory to another
 * @param {*} fileSource source file
 * @param {*} targetFile target file
 * @returns
 */
const copy = (fileSource, targetFile) => {
  const s3 = new aws.S3();

  const params = {
    Bucket: process.env.S3_BUCKET_AWS,
    CopySource: `${process.env.S3_BUCKET_AWS}/${fileSource}`,
    Key: targetFile,
  };

  return new Promise((resolve, reject) => {
    s3.copyObject(params, function (err, data) {
      if (err) {
        resolve({ status: false, message: err });
      } else {
        resolve({ status: true, message: "Copy success", data: data });
      }
    });
  });
};

/**
 * Move file from a directory to another
 * @param {*} fileSource source file
 * @param {*} targetFile target file
 * @returns
 */
const move = (fileSource, targetFile) => {
  const s3 = new aws.S3();

  const params = {
    Bucket: process.env.S3_BUCKET_AWS,
    CopySource: `${process.env.S3_BUCKET_AWS}/${fileSource}`,
    Key: targetFile,
  };

  return new Promise((resolve, reject) => {
    s3.copyObject(params, function (err, data) {
      if (err) {
        resolve({ status: false, message: err });
      } else {
        if (data) {
          const deleteParams = {
            Bucket: process.env.S3_BUCKET_AWS,
            Key: fileSource,
          };

          s3.deleteObject(deleteParams, function (err, deleteData) {
            if (err) {
              resolve({ status: false, message: err });
            } else {
              resolve({ status: true, message: "Delete success", data: data });
            }
          });
        } else {
          resolve({ status: true, message: "Delete success" });
        }
      }
    });
  });
};

/**
 * List file in a directory or find file using prefix
 * @param {String} path path of the file on s3
 * @param {String} filename searched file
 * @returns
 */

const list = (path, filename = "") => {
  const s3 = new aws.S3();
  if (path.charAt(path.length - 1) !== "/") {
    path += "/";
  }

  const params = {
    Bucket: process.env.S3_BUCKET_AWS,
    Prefix: path + filename,
  };

  return new Promise((resolve, reject) => {
    s3.listObjectsV2(params, function (err, data) {
      if (err) {
        resolve({ status: false, message: err });
      } else {
        resolve({ status: true, message: "List success", data: data });
      }
    });
  });
};

/**
 * Upload stream to S3 bucket
 *
 * @param {*} fileStream
 * @param {*} fileDestination
 */
const putStream = (fileStream, fileDestination) => {
  const s3 = new aws.S3();

  const params = {
    Bucket: process.env.S3_BUCKET_AWS,
    Body: fileStream,
    Key: fileDestination,
  };

  return new Promise((resolve, reject) => {
    s3.upload(params, function (err, data) {
      if (err) {
        resolve({ status: false, message: err });
      } else {
        resolve({ status: true, message: "upload success", data: data });
      }
    });
  });
};

module.exports = { get, put, remove, copy, move, list, putStream };
