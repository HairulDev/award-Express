const { UrlName } = require("../list");
const apiUrl = process.env.SOURCE_API;

function isHTML(str) {
  return tmp1.match(/<title[^>]*>([^<]+)<\/title>/)[1];
}

const getUniqGroupList = (data, val) => {
  var grouped = [];
  data.forEach(function (a) {
    if (!this[a[val]]) {
      this[a[val]] = {
        Type: a[val],
        items: [],
      };
      grouped.push(this[a[val]]);
    }
    this[a[val]].items.push(a);
  }, Object.create(null));

  return grouped;
};

const getDate = (num, dt) => {
  var date = new Date();
  var d = new Date(date);
  var month = "" + (d.getMonth() + 1);
  var day = "" + d.getDate();
  var year = d.getFullYear();
  d.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });

  if (month.length < 2) month = "0" + month;
  if (day.length < 2) day = "0" + day;

  var formattedNumber = ("0000" + num).slice(-4);
  var df = year + month + day;
  var tmp1 = dt !== df ? df : dt;
  return tmp1 + "-" + formattedNumber;
};

const isUrl = (id) => {
  return apiUrl + id + UrlName.requestHistory;
};

const retnum = (str) => {
  var num = str.replace(/[^0-9]/g, "");
  return parseInt(num);
};

const convertDateTime = (value) => {
  var date = retnum(value);
  var tmp1 = new Date(date).toLocaleString("fr-CA", {
    timeZone: "Asia/Jakarta",
    // hour12: true,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return `${tmp1}T00:00:00.137Z`;
};

const dateToSAP = (date) => {
  if (!date) return "";

  const d = new Date(date);
  const ye = d.getFullYear();
  const mo = d.getMonth() + 1;
  const da = d.getDate();
  const bulan = mo < 10 ? "0" + mo : mo;
  const hari = da < 10 ? "0" + da : da;
  return `${hari}.${bulan}.${ye}`;
};

const dateFromSAP = (date) => {
  if (!date) return "";
  const split = date.split(".");

  const day = split[1];
  const month = split[0];
  const year = split[2];
  const d = new Date(`${day}.${month}.${year}`);
  const actualDate = new Date(new Date().setDate(d.getDate()));
  return actualDate;
};

const sortByKey = (array, key) => {
  return array.sort(function (a, b) {
    var x = a[key];
    var y = b[key];

    if (typeof x == "string") {
      x = ("" + x).toLowerCase();
    }
    if (typeof y == "string") {
      y = ("" + y).toLowerCase();
    }

    return x < y ? -1 : x > y ? 1 : 0;
  });
};

const sortByKeyAndOrderBy = (field, reverse, primer) => {
  const key = primer
    ? function (x) {
        return primer(x[field]);
      }
    : function (x) {
        return x[field];
      };

  reverse = !reverse ? 1 : -1;

  return function (a, b) {
    return (a = key(a)), (b = key(b)), reverse * ((a > b) - (b > a));
  };
};

const convertDateDot = (data) => {
  let [day, month, year] = data.split(".");
  isParse = parseInt(day);
  if (isParse < 10) {
    day = "0" + isParse;
  }
  const result = `${day}.${month}.${year}`;
  return result;
};

const minmax = (m, key, arr) => {
  const tmp0 = new Date(
    Math[m](
      ...arr.map((el0) => {
        const date = new Date(el0[key]);
        date.toLocaleString("en-US", { timeZone: "Asia/Jakarta" });
        return date;
      })
    )
  );
  return tmp0.toISOString().split("T")[0];
};

const noPort = () => {
  const noport = apiUrl.substring(0, 28);
  return noport;
};

const isDate = () => {
  var tmp0 = new Date().toLocaleString("fr-CA", {
    timeZone: "Asia/Jakarta",
    // hour12: true,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return dateTosap(tmp0);
};

const dateTosap = (date) => {
  if (!date) {
    return "";
  }
  const d = new Date(date);
  const ye = d.getFullYear();
  const mo = d.getMonth() + 1;
  const da = d.getDate();
  const bulan = mo < 10 ? "0" + mo : mo;
  const hari = da < 10 ? "0" + da : da;
  return `${hari}.${bulan}.${ye}`;
};

const dateLocalISOString = () => {
  const tzOffset = new Date().getTimezoneOffset() * 60000;
  return new Date(Date.now() - tzOffset).toISOString();
};

const formatLocaltoISOString = (tanggalJam) => {
  const [dateValues, timeValues] = tanggalJam.split(" ");
  // misal 01-09-2022 10:30 => 2022-09-01 10:30:00.000Z

  const [day, month, year] = dateValues.split("-");
  const [hours, minutes] = timeValues.split(":");

  const date = new Date(+year, month - 1, +day + 1, hours - 17, +minutes);
  const result = date.toISOString();
  return result;
};

module.exports = {
  dateTosap,
  noPort,
  isDate,
  minmax,
  convertDateDot,
  sortByKeyAndOrderBy,
  convertDateTime,
  retnum,
  isHTML,
  getUniqGroupList,
  isUrl,
  sortByKey,
  getDate,
  dateToSAP,
  dateFromSAP,
  dateLocalISOString,
  formatLocaltoISOString,
};
