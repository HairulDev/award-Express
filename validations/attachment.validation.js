const Joi = require("joi");

const attachmentSubmit = {
  body: Joi.object().keys({
    attachment: Joi.optional().label("File"),
    file_type: Joi.string().required().label("File Type"),
    usr_email: Joi.string().required().label("User Email"),
  }),
};

const attachmentEdit = {
  body: Joi.object().keys({
    fa_id: Joi.number().required().label("File ID"),
    attachment: Joi.optional().label("File"),
    file_type: Joi.string().required().label("File Type"),
    usr_email: Joi.string().required().label("User Email"),
  }),
};

const attachmentDownload = {
  query: Joi.object().keys({
    filename: Joi.string().required().label("File Name"),
  }),
};

module.exports = {
  attachmentSubmit,
  attachmentEdit,
  attachmentDownload,
};
