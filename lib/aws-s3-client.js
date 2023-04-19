const vars = require("#config/vars");
const {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const fs = require("fs");

const S3Bucket = vars.awsBucket;
const client = new S3Client({
  region: vars.awsRegion,
  credentials: {
    accessKeyId: vars.awsAccessKey,
    secretAccessKey: vars.awsSecretKey,
  },
});

const uploadImageToS3 = async (fileName, base64Content) => {
  console.log({ fileName });
  try {
    const buf = Buffer.from(
      base64Content.replace(/^data:image\/\w+;base64,/, ""),
      "base64"
    );
    const params = {
      Bucket: S3Bucket,
      Key: fileName,
      Body: buf,
      ContentEncoding: "base64",
    };
    const command = new PutObjectCommand(params);
    const data = await client.send(command);
    return Promise.resolve(data);
  } catch (error) {
    return Promise.reject(error);
  }
};


async function deleteObjectFromS3(bucketName, objectKey) {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: objectKey,
  });
  try {
    await client.send(command);
    console.log(`Objek ${objectKey} berhasil dihapus dari bucket ${bucketName}`);
  } catch (err) {
    console.log(`Gagal menghapus objek ${objectKey} dari bucket ${bucketName}: ${err}`);
    throw err;
  }
}


const viewFile = async (fileName) => {
  try {
    const params = {
      Bucket: S3Bucket,
      Key: "tender_" + fileName,
    };
    const command = new GetObjectCommand(params);
    const response = await client.send(command);
    const stream = response.Body;
    return new Promise((resolve, reject) => {
      const chunks = [];
      stream.on("data", (chunk) => chunks.push(chunk));
      stream.once("end", () =>
        resolve({
          statusCode: stream.statusCode,
          data: Buffer.concat(chunks).toString("base64"),
        })
      );
      stream.once("error", reject);
    });
  } catch (error) {
    return Promise.reject(error);
  }
};

module.exports = { uploadImageToS3, viewFile, deleteObjectFromS3 };
