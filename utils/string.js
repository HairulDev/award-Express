/**
 * Serialize object data
 *
 * @param {object} obj - Object data
 */
const serialize = function (obj) {
  let str = [];
  for (let p in obj)
    if (obj.hasOwnProperty(p)) {
      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
    }
  return str.join("&");
};

/**
 * Format employee's SN with leading zero
 *
 * @param {string} sn - The employee's SN
 */
const employeeSN = (sn) => {
  sn = sn.replace(/ /g, "");
  if (sn.length < 8) {
    return sn.padStart(8, "0");
  } else {
    return sn;
  }
};

/**
 * Remove all same leading character
 *
 * @param {string} str - string to modify
 * @param {char} c - all same leading character to remove
 */
const removeLeadingChar = (str, c) => {
  if (str[0] == c) {
    strNew = str.substring(1);
    return removeLeadingChar(strNew, c);
  } else {
    return str;
  }
};

const isEmpty = (obj) => {
  try {
    let json = {};
    let arr = [];
    if (
      obj === null ||
      obj === "" ||
      obj === {} ||
      obj === undefined ||
      ((json.constructor === obj.constructor ||
        arr.constructor === obj.constructor) &&
        Object.keys(obj).length === 0) ||
      (obj && obj.length === 0)
    ) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    return true;
  }
  // (
  // value === undefined ||
  // value === null ||
  // (typeof value === 'object' && Object.keys(value).length === 0) ||
  // (typeof value === 'string' && value.trim().length === 0)
  // )
};

const fullSN = (sn) => {
  try {
    sn = sn.replace(/ /g, "");
    if (sn.length < 8) {
      var newsn = `00000000${sn}`;
      return newsn.substring(newsn.length - 8, newsn.length);
    } else {
      return sn;
    }
  } catch (e) {
    return "";
  }
};

const betweenRandomNumber = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1) + min);
};

const generateRandomPassword = () => {
  // const chars = 'abcdefghijklmnopqrstuwxyzABCDEFGHIJKLMNOPQRSTUWXYZ0123456789!@#$*'
  // let randomPassword = ''
  // for (var i = 0; i < 10; i++){
  //   index = Math.floor(Math.random() * chars.length)
  //   randomPassword += chars.charAt(index)
  // }
  // return randomPassword
  return betweenRandomNumber(1000, 9999);
};

const crypto = require("crypto");
const encrypt = (text, key) => {
  try {
    if (key.length < 32) {
      key = key.padStart(32, "0");
    } else {
      key = key.substring(0, 32);
    }
    const IV_LENGTH = 16; // For AES, this is always 16
    let iv = crypto.randomBytes(IV_LENGTH);
    let cipher = crypto.createCipheriv("aes-256-cbc", Buffer.from(key), iv);
    let encrypted = cipher.update(text);

    encrypted = Buffer.concat([encrypted, cipher.final()]);

    return iv.toString("hex") + ":" + encrypted.toString("hex");
  } catch (err) {
    console.log(err);
    throw err;
  }
};
const decrypt = (text, key) => {
  try {
    if (key.length < 32) {
      key = key.padStart(32, "0");
    } else {
      key = key.substring(0, 32);
    }
    let textParts = text.split(":");
    let iv = Buffer.from(textParts.shift(), "hex");
    let encryptedText = Buffer.from(textParts.join(":"), "hex");
    let decipher = crypto.createDecipheriv("aes-256-cbc", Buffer.from(key), iv);
    let decrypted = decipher.update(encryptedText);

    decrypted = Buffer.concat([decrypted, decipher.final()]);

    return decrypted.toString();
  } catch (err) {
    console.log(err);
    throw err;
  }
};
const left = (param, len) => {
  return param.substring(0, len);
};
const right = (param, len) => {
  let strlen = param.length;
  if (len < strlen && len > 0) {
    return param.substring(strlen - len, strlen);
  } else {
    return param;
  }
};
const formatNumber = (num, decimals, code = "id-ID") =>
  Number(num).toLocaleString(code, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
module.exports = {
  isEmpty,
  fullSN,
  serialize,
  employeeSN,
  removeLeadingChar,
  generateRandomPassword,
  encrypt,
  decrypt,
  left,
  right,
  formatNumber,
};
