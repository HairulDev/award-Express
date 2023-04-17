const knex = require("#config/database");
const { dateLocalISOString } = require("#lib/helper");

// const getMenu = () => {
//   return knex("tender.MENU").select("*");
// };

const menuSetting = async (params, token) => {
  return new Promise(async (resolve, reject) => {
    const { menu_name, menu_description, menu_url } = params;
    const { email } = token;

    const select = await knex("menu").select(["*"]).where("menu_id", id);

    if (select.length === 0) {
      await knex.transaction((trx) => {
        knex("menu")
          .returning(["*"])
          .insert({
            menu_name: menu_name,
            menu_description: menu_description,
            menu_url: menu_url,
            menu_usercreated: email,
            menu_timecreated: dateLocalISOString(),
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
        knex("menu")
          .transacting(trx)
          .where({ menu_id: id })
          .update(
            {
              menu_name: menu_name,
              menu_description: menu_description,
              menu_url: menu_url,
              menu_userupdated: email,
              menu_timeupdated: dateLocalISOString(),
            },
            [
              "menu_name",
              "menu_description",
              "menu_url",
              "menu_userupdated	",
              "menu_timeupdated",
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

module.exports = {
  menuSetting,
};
