var createError = require("http-errors");
var express = require("express");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
const fileUpload = require("express-fileupload");
const vars = require("./config/vars");
var cors = require("cors");
// import mongoose
const mongoose = require("mongoose");
mongoose.connect(vars.dbMongoDbOnline, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
});

const router = express.Router();
var v1 = require("./routes/v1");

// router admin
const adminRouter = require("./routes/admin");
const { verifyApiKey } = require("#middlewares/auth");

var app = express();

app.use(express.static('public')); // set folder upload public
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, PATCH, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});
app.use(cors({ origin: "*" }));

app.use(
  fileUpload({
    useTempFiles: true,
    tempFileDir: "/tmp/",
  })
);
app.use(logger("dev"));
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: false, limit: "50mb" }));
app.use(cookieParser());

// admin

// API Key middleware
app.use(router);
router.use("/v1", v1);
app.use(verifyApiKey);
app.use("/admin", adminRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
