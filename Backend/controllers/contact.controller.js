const connection = require('../database/mysqldb')


function Addcontact(req, res) {
    try {
        const { user_id, name, email, number } = req.body
        if (!name && !email && !number) {
            return res.send({ status: false, message: "field is required" })
        }
        const sql = 'INSERT INTO my_tech.contact_tbl (user_id,name,email, contact) VALUES (?, ?,?,?)';
        const values = [user_id, name, email, number];
        connection.query(sql, values, (err, result) => {
            if (err) {
                return res.status(200).json({ status: false, error: true, message: err, data: null })
            }
            else {
                return res.status(200).json({ status: true, error: false, message: 'success' })

            }
        })
    } catch (error) {
        return res.status(500).json({ status: false, error: true, message: error, data: null })

    }
}


module.exports = { Addcontact }