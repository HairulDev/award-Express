const knex = require("#config/database");
const { dateLocalISOString } = require("#lib/helper");
const { string } = require("#utils/index");


const sessionChange = (actived, params) => {
  return new Promise(async (resolve, reject) => {

    if (actived === 'Active') {
      console.log("masuk ke ======= Active");
      await knex.transaction((trx) => {
        knex("user_login")
          .transacting(trx)
          .where({ usr_email: params })
          .update(
            {
              usr_is_active: true,
              usr_userupdated: params,
              usr_timeupdated: dateLocalISOString(),
            },
            [
              "usr_email",
              "usr_userupdated",
              "usr_timeupdated",
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
      }); // end knex
    } else if (actived === 'Destroy') {
      console.log("masuk ke ======= Destroy");
      await knex.transaction((trx) => {
        knex("user_login")
          .transacting(trx)
          .where({ usr_email: params })
          .update(
            {
              usr_is_active: false,
              usr_userupdated: params,
              usr_timeupdated: dateLocalISOString(),
            },
            [
              "usr_email",
              "usr_userupdated",
              "usr_timeupdated",
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

const tableSelect = (id) => {
  return knex("master_param")
    .where("mpa_id", id)
    .first();
};

const dataSelect = (table, cols, condition, ignoreCols) => {
  let select;
  if (!string.isEmpty(ignoreCols)) {
    select = cols.filter(col => !ignoreCols.includes(col))
  } else if (string.isEmpty(ignoreCols)) {
    select = cols
  }

  const { where, value } = condition;
  if (!string.isEmpty(where || value)) {
    return knex(table)
      .select(select)
      .where(`${where}`, `${value}`)
      .first();
  } else {
    return knex(table)
      .select(select)
  }
};

const dataCount = (table, cols, condition, count) => {
  const { where, value } = condition;
  const { col, as } = count;
  if (!string.isEmpty(where || value)) {
    return knex(table)
      .where(`${where}`, value)
      .count(`${col}`, { as: `${as}` })
      .first()
  } else {
    return knex(table)
      .count(`${col}`, { as: `${as}` })
      .first()
  }
};

module.exports = {
  tableSelect,
  dataSelect,
  dataCount,
  sessionChange,
};
