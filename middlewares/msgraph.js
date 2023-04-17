const axios = require("#lib/axios");
const helper = require("#lib/response");
const { msGraphUrl, sharePointUrl } = require("#config/vars");
const jwt = require("jsonwebtoken");

/**
 * Verify Microsoft Graph JWT token with MS Graph scope
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const verifyToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];

  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
    const url = `${msGraphUrl}/me`;
    const headers = {
      Authorization: `Bearer ${token}`,
    };

    axios
      .get(url, { headers })
      .then((response) => {
        req.decoded = {
          ...response.data,
          pictureUrl:
            "https://i2.wp.com/news.microsoft.com/wp-content/themes/microsoft-news-center-2016/assets/img/default-avatar.png",
        };
        next();
      })
      .catch((error) => {
        const { status, statusText, data } = error.response;
        const message = data.error.message;

        return res.status(status || 401).json({
          status: statusText.toUpperCase(),
          statusCode: status,
          message:
            message || "Authentication token has expired or is not yet valid.",
          errors: data.errors || [],
        });
      });
  } else {
    res.status(401).json({
      status: "UNATHORIZED",
      statusCode: 401,
      message: "Authentication token is not supplied.",
      errors: [],
    });
  }
};

/**
 * Verify Microsoft Graph JWT token with Sharepoint scope
 *
 * @param {Object} req
 * @param {Object} res
 * @param {Function} next
 */
const verifySharepointToken = (req, res, next) => {
  let token = req.headers["x-access-token"] || req.headers["authorization"];
  const getValueByKey = (arrObj, key) => {
    const item = arrObj.find((i) => i.Key.toLowerCase() == key.toLowerCase());
    return item.Value;
  };

  if (token && token.startsWith("Bearer ")) {
    token = token.slice(7, token.length);
    const listUserUrl = `${sharePointUrl}/_api/Web/SiteUsers`;
    const headers = {
      Authorization: `Bearer ${token}`,
      Accept: "application/json;odata=verbose",
      ["Content-Type"]: "application/json;odata=verbose",
    };

    axios
      .get(listUserUrl, { headers })
      .then(async (response) => {
        const { upn } = jwt.decode(token);
        const spUser = response.data.d.results.find(
          (item) => item.UserPrincipalName?.toLowerCase() == upn?.toLowerCase()
        );
        try {
          const detailUserUrl = `${sharePointUrl}/_api/SP.UserProfiles.PeopleManager/GetPropertiesFor(accountName=@v)?@v='i:0%23.f|membership|${spUser.UserPrincipalName}'`;
          const {
            data: { d: spUserDetail },
          } = await axios.get(detailUserUrl, { headers });
          const userData = {
            "@odata.context": spUser.__metadata.id,
            businessPhones: [],
            displayName: spUserDetail.DisplayName,
            givenName: getValueByKey(
              spUserDetail.UserProfileProperties.results,
              "FirstName"
            ),
            jobTitle: detailUserUrl.Title,
            mail: spUser.Email,
            mobilePhone: getValueByKey(
              spUserDetail.UserProfileProperties.results,
              "CellPhone"
            ),
            officeLocation: getValueByKey(
              spUserDetail.UserProfileProperties.results,
              "Office"
            ),
            preferredLanguage: null,
            surname: getValueByKey(
              spUserDetail.UserProfileProperties.results,
              "LastName"
            ),
            userPrincipalName: spUser.UserPrincipalName,
            id: getValueByKey(
              spUserDetail.UserProfileProperties.results,
              "UserProfile_GUID"
            ),
            pictureUrl: getValueByKey(
              spUserDetail.UserProfileProperties.results,
              "PictureURL"
            ),
          };
          req.decoded = userData;
          next();
        } catch (error) {
          return helper.errorHelper(
            req,
            res,
            500,
            {
              status: "Error",
              statusCode: 500,
              message: error.message,
              errors: error || [],
            },
            error
          );
        }
      })
      .catch((error) => {
        if (!error.response) {
          return helper.errorHelper(
            req,
            res,
            500,
            {
              status: "Error",
              statusCode: 500,
              message: error.message,
              errors: error || [],
            },
            error
          );
        }
        const { status, statusText, data } = error.response;
        const message = data?.error?.message || "";
        return helper.errorHelper(
          req,
          res,
          401,
          {
            status: statusText.toUpperCase(),
            statusCode: status,
            message:
              message ||
              "Authentication token has expired or is not yet valid.",
            errors: data.errors || [],
          },
          error
        );
      });
  } else {
    return helper.errorHelper(req, res, 401, {
      status: "UNATHORIZED",
      statusCode: 401,
      message: "Authentication token is not supplied.",
      errors: [],
    });
  }
};

module.exports = {
  verifyToken: verifyToken,
  verifySharepointToken,
};
