const connection = require('../database/mysqldb')

const { findStates } = require('../model/vehicle');

function vehicleAdd(req, res) {
    try {
        const { product_id, user_id, vehicle_type, brand_name, modal_name, reg_no, current_city, location } = req.body
        if (!req.body) {
            return res.status(500).json({ status: false, error: 'fill field ' });

        }
        const sql = 'INSERT INTO my_tech.vehicle_info_tbl (product_id,user_id, vehicle_type, brand_name, modal_name,reg_no,current_city,location) VALUES (?, ?, ?,?,?,?,?,?)';
        const values = [
            product_id,
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
        connection.query(`SELECT my_tech.vehicle_info_tbl.*, my_tech.product_tbl.Image
        FROM my_tech.vehicle_info_tbl 
        LEFT JOIN my_tech.product_tbl 
        ON my_tech.vehicle_info_tbl.product_id = my_tech.product_tbl.id  where my_tech.vehicle_info_tbl.user_id = ${user_id}`, (err, result) => {
            console.log();
            if (err) {
                return res.status(500).json({ status: false, error: 'Error get  data  the database' });
            }
            if (result.length == 0) {
                return res.status(500).json({ status: false, data: null, error: 'vehicle not found' });

            } else {
                return res.status(200).json({ status: true, data: result, message: 'success' });
            }
        })

    } catch (error) {
        return res.send({ data: null, message: error, status: false })

    }
}
function ProjuctgteByid(req, res) {
    try {
        const { vehicle_id } = req.body
        console.log(vehicle_id);
        connection.query(`SELECT my_tech.vehicle_info_tbl.*, my_tech.product_tbl.Image
        FROM my_tech.vehicle_info_tbl 
        LEFT JOIN my_tech.product_tbl 
        ON my_tech.vehicle_info_tbl.product_id = my_tech.product_tbl.id  where my_tech.vehicle_info_tbl.id = ${vehicle_id}`, (err, result) => {
            console.log();
            if (err) {
                return res.status(500).json({ status: false, error: 'Error get  data  the database' });
            }
            if (result.length == 0) {
                return res.status(500).json({ status: false, error: 'vehicle not found' });

            } else {
                let product = result[0]
                return res.status(200).json({ status: true, data: product, message: 'success' });
            }
        })

    } catch (error) {
        return res.send({ data: error, status: false })

    }
};

const getStates = (req, res) => {
    try {
        findStates((error, ressult) => {
            if (error) {
                return res.status(200).json({ status: false, message: `${error}`, data: error });
            } else {
                return res.status(200).json({ status: true, message: "successfully find states", data: ressult });
            }
        })
    } catch (error) {
        return res.status(200).json({ status: false, message: "Failed to get states", data: error });
    }
}

function getCity(req, res) {
    try {
        const { state_id } = req.body
        connection.query('SELECT * FROM my_tech.tbl_cities WHERE state_id="' + state_id + '"', (err, result) => {
            if (err) {
                return res.status(200).json({ status: false, message: "Failed to get states", data: err });

            } else {
                return res.status(200).json({ status: true, message: "successfully find city", data: result });

            }
        })

    } catch (error) {
        return res.status(200).json({ status: false, message: "Failed to get states", data: error });

    }
}

module.exports = { vehicleAdd, getallvehicle, updateVehicle, deleteVehicle, gteByid, ProjuctgteByid, getStates, getCity }