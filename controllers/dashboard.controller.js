const helper = require("#lib/response");

const genFuncController = require("#controllers/genFunc.controller");
const genFuncModel = require("#models/genFunc.model");

const dashboard = async (req, res) => {
  try {

    const selectTable = await genFuncController.tableSelect(1);
    const condition = { where: "", value: "" };
    const colsObj = selectTable.colsObj;
    const ignoreCols = [colsObj.usr_id, colsObj.usr_password, colsObj.usr_timecreated]
    const getAllUser = await genFuncModel.dataSelect(selectTable.tableName, selectTable.cols, condition, ignoreCols);
    // checking total user sign in
    let totalSignInByUser = [];
    for (let i = 0; i < getAllUser.length; i++) {
      const email = getAllUser[i].usr_email;
      const selectTable = await genFuncController.tableSelect(2);
      const condition = { where: selectTable?.colsObj?.usrh_email, value: email };
      let user = await genFuncModel.dataSelect(selectTable.tableName, selectTable.cols, condition);
      totalSignInByUser.push(user)
    }

    let users = []
    for (let i = 0; i < totalSignInByUser.length; i++) {
      // get users by filter email in total user sign in
      let filterEmail = getAllUser
        .map((element) => element)
        .filter((e) => e.usr_email === totalSignInByUser[i]?.usrh_email);

      // pushing all data users and total sign in to one object
      for (let j = 0; j < filterEmail.length; j++) {
        const element = filterEmail[j];
        let resFilter = {
          usr_email: element.usr_email,
          usr_name: element.usr_name,
          usr_file: element.usr_file,
          usrh_total_login: totalSignInByUser[i].usrh_total_login,
          usr_timecreated: element.usr_timecreated
        }
        users.push(resFilter)
      }
    }

    const count = { col: selectTable?.colsObj?.usr_email, as: "total_signup" };
    const totalSignUp = await genFuncModel.dataCount(selectTable.tableName, selectTable.cols, "", count);

    const conditionCount = { where: selectTable?.colsObj?.usr_is_active, value: true };
    const countactiveToday = { col: selectTable?.colsObj?.usr_email, as: "total_active_today" };
    const activeToday = await genFuncModel.dataCount(selectTable.tableName, selectTable.cols, conditionCount, countactiveToday);

    let dashboard = {
      total_signup: totalSignUp.total_signup,
      total_active_today: activeToday.total_active_today
    }

    return helper.successHelper(req, res, 200, {
      success: true,
      dashboard,
      users
    });
  } catch (error) {
    return helper.errorHelper(
      req,
      res,
      500,
      [],
      error
    );
  }
};


module.exports = {
  dashboard
};
