
const DEFAULT_ERROR_OBJ = {
  status: "INTERNAL_SERVER_ERROR",
  statusCode: 500,
  message: "Request failed unexpectedly!",
  errors: "",
};

const errorHelper = (
  req,
  res,
  status = 500,
  data = DEFAULT_ERROR_OBJ,
) => {
  // dont sent response to client if ERR_HTTP_HEADERS_SENT!
  if (res.headersSent) return;
  res.status(status).json(data);
};

const successHelper = (req, res, status = 200, data) => {
  if (res.headersSent) return;
  res.status(status).json(data);
};

module.exports = { errorHelper, successHelper };
