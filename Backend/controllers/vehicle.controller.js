const connection = require('../database/mysqldb')

const { findStates } = require('../model/vehicle');

function vehicleAdd(req, res) {
    try {

        const { product_id, user_id, vehicle_type, brand_name, modal_name, reg_no, current_city, location } = req.body
        if (!req.body) {
            return res.status(500).json({ status: false, error: 'fill field ' });

        }
        connection.query('SELECT * FROM my_tech.purchase_QR_tbl where user_id = "' + user_id + '" AND product_id="' + product_id + '" ',
            (err, result) => {
                if (err) {
                    return res.status(500).json({ status: false, error: err });
                }
                if (result[0] == undefined) {
                    return res.status(200).json({ status: false, message: "The product not be purchase" });
                } else {
                    connection.query('SELECT * FROM my_tech.vehicle_info_tbl WHERE user_id = "' + user_id + '" AND product_id = "' + product_id + '"', (error, findVichelInfo) => {
                        if (error) {
                            return res.status(200).json({ status: false, error: err });

                        } if (findVichelInfo[0] == undefined) {
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
                                    return res.status(500).json({ status: false, error: err });
                                }

                                if (result.affectedRows == 1) {
                                    connection.query('UPDATE my_tech.purchase_QR_tbl SET status= "1" WHERE user_id = "' + user_id + '" AND product_id = "' + product_id + '"', (error, updateStatus) => {
                                        console.log(updateStatus, 'updateStatusupdateStatusupdateStatus');
                                        if (error) {
                                            return res.status(200).json({ status: false, error: error });
                                        }
                                        if (updateStatus.affectedRows == 1) {

                                            connection.query('UPDATE my_tech.product_tbl SET delivered_status_scan	= "1" WHERE id = "' + product_id + '"', (error, statusdata) => {
                                                console.log(statusdata.affectedRows, 'statusdata');

                                                if (error) {
                                                    return res.status(200).json({ status: false, error: error });
                                                }
                                                if (statusdata.affectedRows == 1) {
                                                    return res.status(200).json({ status: true, message: 'Successfully' });
                                                } else {
                                                    return res.status(500).json({ status: false, error: 'Error inserting data into the database' });
                                                }
                                            })

                                            // return res.status(200).json({ status: true, message: 'Successfully' });
                                        } else {
                                            return res.status(500).json({ status: false, error: 'Error inserting data into the database' });
                                        }
                                    })
                                } else {
                                    const error = "QR code not scan";
                                    return res.status(500).json({ status: false, error: `${error}` });
                                }
                            });
                        } else {
                            return res.status(500).json({ status: false, message: "Vichel Info Already Add" });
                        }
                    })
                }
            })

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
                result.forEach(element => {
                    element.Image = `http://192.168.29.179:5501/Backend/public/${element.Image}`;
                });
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
        connection.query(`SELECT my_tech.vehicle_info_tbl.*, my_tech.product_tbl.QR_code,my_tech.product_tbl.delivered_status_scan	
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
                // result.forEach(element => {
                //     element.Image = `http://192.168.29.179:5501/Backend/public/${element.Image}`;
                // });
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
                result.forEach(element => {
                    element.Image = `http://192.168.29.179:5501/Backend/public/${element.Image}`;
                });
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

function myorder(req, res) {
    const { user_id } = req.body

    connection.query('SELECT * FROM my_tech.purchase_QR_tbl  WHERE user_id="' + user_id + '"', (err, result) => {
        if (err) {
            return res.send({ status: false, message: err })

        } else {
            return res.send({ status: true, message: result })
        }
    })
}
module.exports = { vehicleAdd, getallvehicle, updateVehicle, deleteVehicle, gteByid, ProjuctgteByid, getStates, getCity, myorder }