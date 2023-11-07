const connection = require('../database/mysqldb');

const findStates = (callBack) => {
    connection.query('SELECT * FROM my_tech.tbl_states', (error, result) => {
        if (error) {
            return callBack(error, null)
        }
        if (result[0] == undefined) {
            const error = "States not found";
            return callBack(error, null)
        } else {
            return callBack(null, result)
        }
    })
};

module.exports = { findStates };