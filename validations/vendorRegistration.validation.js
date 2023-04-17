const Joi = require("joi");

const vendorRegSubmit = {
  body: Joi.object().keys({
    usr_id: Joi.optional().label("User ID"),
    usr_email: Joi.string().required().label("Email Address"),
    usr_name: Joi.string().required().label("Username"),
    usr_phone: Joi.string().required().label("User Phone Number"),
    usr_referenceemail: Joi.optional().label("Email Refference"),
    vdo_name: Joi.optional().label("Vendor Name"),
    vdo_id: Joi.optional().label("Vendor ID"),
    vdo_sapid: Joi.optional().label("SAP ID Vendor"),
    vdo_type: Joi.optional().label("Vendor Type"),
    vdo_province: Joi.optional().label("Province"),
    vdo_regency: Joi.optional().label("Regency"),
    vdo_city: Joi.optional().label("City"),
    vdo_address: Joi.optional().label("Address"),
    vdo_zipcode: Joi.optional().label("Zipcode"),
    vdo_faxnumber: Joi.optional().label("Fax Number"),
    vdo_phonenumber: Joi.optional().label("Vendor Phone Number"),
    vdo_bankname: Joi.optional().label("Bank Name"),
    vdo_npwp: Joi.optional().label("NPWP Number"),
    vdo_business_type: Joi.optional().label("Business Type"),
    vdo_accountnumber: Joi.optional().label("Account Number"),
    mt_id: Joi.optional().label("Master Tagging"),
    id_attachment_code: Joi.optional().label("File Attachment"),
    req_url: Joi.optional().label("req_url"),
  }),
};

const vendorEditAccountVendor = {
  body: Joi.object().keys({
    usr_id: Joi.required().label("User ID"),
    usr_phone: Joi.string().required().label("User Phone Number"),
    vdo_id: Joi.required().label("Vendor ID"),
    vdo_name: Joi.optional().label("Vendor Name"),
    vdo_type: Joi.optional().label("Vendor Type"),
    vdo_province: Joi.optional().label("Province"),
    vdo_regency: Joi.optional().label("Regency"),
    vdo_city: Joi.optional().label("City"),
    vdo_address: Joi.optional().label("Address"),
    vdo_zipcode: Joi.optional().label("Zipcode"),
    vdo_faxnumber: Joi.optional().label("Fax Number"),
    vdo_phonenumber: Joi.optional().label("Vendor Phone Number"),
    vdo_bankname: Joi.optional().label("Bank Name"),
    vdo_npwp: Joi.optional().label("NPWP Number"),
    vdo_business_type: Joi.optional().label("Business Type"),
    vdo_accountnumber: Joi.optional().label("Account Number"),
    mt_id: Joi.optional().label("Master Tagging"),
    id_attachment_code: Joi.optional().label("File Attachment"),
  }),
};

const vendorEditAccountStaf = {
  body: Joi.object().keys({
    usr_id: Joi.required().label("User ID"),
    vdo_id: Joi.required().label("Vendor ID"),
    vdo_sapid: Joi.required().label("SAP ID Vendor"),
    vdo_business_type: Joi.optional().label("Business Type"),
    mt_id: Joi.optional().label("Master Tagging"),
    id_attachment_code: Joi.optional().label("File Attachment"),
  }),
};

module.exports = {
  vendorRegSubmit,
  vendorEditAccountVendor,
  vendorEditAccountStaf,
};
