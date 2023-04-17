const Joi = require("joi");

const setupTender = {
  body: Joi.object().keys({
    ACTION: Joi.optional().label("Tender ACTION"),
    TH_ID: Joi.optional().label("Tender ID"),
    TH_NAME: Joi.string().required().label("Tender Name"),
    TENDER_TYPE: Joi.string().required().label("Tender Type"),
    DESC: Joi.required().label("Tender Description"),
    TENDER_STATUS: Joi.required().label("Tender Status"),
    mt_id: Joi.required().label("Master Tagging"),
    TH_CURR: Joi.required().label("Currency"),
    id_attachment_code: Joi.required().label("File Attachment"),
    PARTICIPANT_VENDOR: Joi.string().required().label("Participant Vendor"),
    TOTALBUDGET: Joi.number().required().label("Total Budget"),
    VENDOR_EVALUATIONTEMP: Joi.optional().label("Template"),
    LIST_VENDOR: Joi.optional().label("List Vendor"),
    PARTICIPANT_COMMITE: Joi.optional().label("Participant Commite"),
    LIST_PR: Joi.required().label("PR Item"),
  }),
};

module.exports = {
  setupTender,
};
