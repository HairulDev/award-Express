const knex = require("#config/database");
const { dateLocalISOString } = require("#lib/helper");


const signIn = (param) => {
  return knex("user_login")
    .select(
      "usr_id as user_id",
      "usr_name as name",
      "usr_email as email",
      "usr_password as password",
      "usr_type as type",
      "usr_file as file"
    )
    .where("usr_email", param)
    .where("usr_activation", "Active")
    .first();
};

const signInHistory = (params) => {
  return new Promise(async (resolve, reject) => {
    const { email, signTotal } = params;

    const select = await knex("user_login_history")
      .select(["*"])
      .where("usrh_email", email);

    if (select.length === 0) {
      await knex.transaction((trx) => {
        knex("user_login_history")
          // .returning(["*"]) /// for mssql
          .insert({
            usrh_email: email,
            usrh_total_login: 1,
            usrh_usercreated: email,
            usrh_timecreated: dateLocalISOString(),
          })
          .then(async (response) => {
            await trx.commit();
            resolve(response);
          })
          .catch((err) => {
            trx.rollback;
            reject(err);
          });
      }); // end knex
    } else if (select.length == 1) {
      await knex.transaction((trx) => {
        knex("user_login_history")
          .transacting(trx)
          .where({ usrh_email: email })
          .update(
            {
              usrh_email: email,
              usrh_total_login: signTotal,
              usrh_userupdated: email,
              usrh_timeupdated: dateLocalISOString(),
            },
            [
              "usrh_id",
              "usrh_email",
              "usrh_total_login",
              "usrh_userupdated",
              "usrh_timeupdated",
            ]
          )
          .then(async (response) => {
            await trx.commit();
            resolve(response);
          })
          .catch((err) => {
            trx.rollback;
            reject(err);
          });
      });
    }
  });
};

const signUp = (params) => {
  return new Promise(async (resolve, reject) => {
    const { roleIdUser, to, password, firstName, lastName, file } = params;
    await knex.transaction((trx) => {
      knex("user_login")
        .transacting(trx)
        .returning("*")
        .insert({
          usr_name: `${firstName} ${lastName}`,
          usr_email: to,
          usr_password: password,
          usr_file: file,
          usr_activation: "Non Active",
          usr_type: roleIdUser,
          usr_usercreated: to,
          usr_timecreated: dateLocalISOString(),
        })
        .then(async (response) => {
          await trx.commit();
          resolve(response);
        })
        .catch((err) => {
          trx.rollback;
          reject(err);
        });
    });
  });
};

const activeUser = async (email) => {
  return new Promise(async (resolve, reject) => {
    await knex.transaction((trx) => {
      knex("user_login")
        .transacting(trx)
        .where({ usr_email: email })
        .update(
          {
            usr_activation: "Active",
            usr_userupdated: email,
            usr_timeupdated: dateLocalISOString(),
          },
          ["usr_email", "usr_activation", "usr_userupdated", "usr_timeupdated"]
        )
        .then(async (response) => {
          await trx.commit();
          resolve(response);
        })
        .catch((err) => {
          console.log("ERROR STATUS:", err);
          trx.rollback;
          reject(err);
        });
    });
  });
};

const changePassword = (email, params) => {
  return knex("user_login")
    .update(params)
    .where("usr_email", email)
    .returning("*");
};

const resetPassword = (params) => {
  return knex("reset_password").insert(params).returning("*");
};

const getResetPasswordCode = (code) => {
  return knex("reset_password").select("*").where("code", code).first();
};
const updateResetPassword = (code, params) => {
  return knex("reset_password").update(params).where("code", code);
};

module.exports = {
  signIn,
  signInHistory,
  signUp,
  activeUser,
  changePassword, resetPassword, getResetPasswordCode, updateResetPassword,
};
