const axios = require("axios").default;
const { defaultTimeout } = require("#config/vars");

const request = axios.create({
  timeout: defaultTimeout,
});

module.exports = request;
