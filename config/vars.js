require("dotenv").config();

module.exports = {
  dbMongoDbOnline: process.env.DB_MONGODB_ONLINE,
  dbMongoDbOffline: process.env.DB_MONGODB_OFFLINE,
  secretKey: process.env.SECRET_KEY,
  frontendUrl: process.env.FRONTEND_URL,
  apiUrl: process.env.URL_API,
  emailProvider: process.env.EMAIL_PROVIDER,
  emailGmailUser: process.env.EMAIL_GMAIL_USER,
  emailGmailPass: process.env.EMAIL_GMAIL_PASS,
  emailWITSMPTP: process.env.EMAIL_WIT_SMTP,
  emailWITPort: process.env.EMAIL_WIT_PORT,
  emailWITUser: process.env.EMAIL_WIT_USER,
  emailTesting: process.env.EMAIL_TESTING,
  nodeEnv: process.env.NODE_ENV,

  tokenGithub: process.env.TOKEN_GITHUB,
  shaGithub: process.env.SHA_GITHUB,
  ownerGithub: process.env.OWNER_GITHUB,
  repoGithub: process.env.REPO_GITHUB,
  emailCommitGithub: process.env.EMAIL_COMMIT_GITHUB,

  awsAccessKey: process.env.ACCESS_KEY_AWS,
  awsSecretKey: process.env.SECRET_KEY_AWS,
  awsBucket: process.env.S3_BUCKET_AWS,
  awsRegion: process.env.REGION_AWS,
};
