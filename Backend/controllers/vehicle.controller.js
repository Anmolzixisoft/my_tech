const connection = require('../database/mysqldb')


function vehicleAdd(req, res) {
    try {
        const { user_id, vehicle_type, brand_name, modal_name, reg_no, current_city, location } = req.body
        if (!req.body) {
            return res.status(500).json({ status: false, error: 'fill field ' });

        }
        const sql = 'INSERT INTO my_tech.vehicle_info_tbl (user_id, vehicle_type, brand_name, modal_name,reg_no,current_city,location) VALUES (?, ?, ?,?,?,?,?)';
        const values = [
            user_id,
            vehicle_type,
            brand_name,
            modal_name,
            reg_no,
            current_city,
            location
        ];
        connection.query(sql, values, (err, result) => {
            if (err) {
                console.error('Database insertion error: ' + err.message);
                return res.status(500).json({ status: false, error: 'Error inserting data into the database' });
            } else {
                console.log('Data inserted into the database.');
                return res.status(200).json({ status: true, message: 'Projuct Added' });
            }
        });

    } catch (error) {
        return res.send({ data: error, status: false })

    }
}

function getallvehicle(req, res) {
    try {
        connection.query('select * from my_tech.vehicle_info_tbl ', (err, result) => {
            if (err) {
                return res.status(500).json({ status: false, error: 'Error get  data  the database' });
            } else {
                return res.status(200).json({ status: true, data: result, message: 'success' });
            }
        })
    } catch (error) {
        return res.send({ data: error, status: false })

    }
}

function updateVehicle(req, res) {
    try {
        const { id, user_id, vehicle_type, brand_name, modal_name, reg_no, current_city, location } = req.body;
        const sql = 'UPDATE my_tech.vehicle_info_tbl SET  vehicle_type= ?, brand_name= ?,	modal_name=? , reg_no=? , current_city = ?, location=? WHERE id= ? AND user_id=? '
        connection.query(sql, [vehicle_type, brand_name, modal_name, reg_no, current_city, location, id, user_id], (err, result) => {
            if (err) {
                console.error('Database update error: ' + err.message);
                return res.status(500).json({ error: 'Error updating data in the database' });
            }
            if (result.affectedRows == 0) {
                return res.status(200).json({ message: 'vehicle not found', status: false });

            }

            else {
                console.log('Data updated in the database.');
                return res.status(200).json({ message: 'vehicle info  Updated', status: true });
            }
            ;

        });
    } catch (error) {
        return res.send({ data: error, status: false })

    }
}

function deleteVehicle(req, res) {
    try {
        const { user_id, id } = req.body;
        console.log(user_id);

        connection.query('DELETE FROM my_tech.vehicle_info_tbl WHERE user_id = ? AND id=?', [user_id, id], (err, result) => {
            if (err) {
                return res.status(500).json({ status: false, error: 'Error deleting data from the database' });
            }

            if (result.affectedRows === 0) {
                return res.status(500).json({ status: false, error: 'Vehicle not found' });
            } else {
                return res.status(200).json({ status: true, message: 'Deletion successful' });
            }
        });

    } catch (error) {
        return res.send({ data: error, status: false })

    }
}

function gteByid(req, res) {
    try {
        const { user_id } = req.body
        console.log(user_id);
        connection.query('select * from my_tech.vehicle_info_tbl where user_id = "' + user_id + '"', (err, result) => {
            console.log();
            if (err) {
                return res.status(500).json({ status: false, error: 'Error get  data  the database' });
            }
            if (result.length == 0) {
                return res.status(500).json({ status: false, error: 'vehicle not found' });

            } else {
                return res.status(200).json({ status: true, data: result, message: 'success' });
            }
        })

    } catch (error) {
        return res.send({ data: error, status: false })

    }
}

module.exports = { vehicleAdd, getallvehicle, updateVehicle, deleteVehicle, gteByid }