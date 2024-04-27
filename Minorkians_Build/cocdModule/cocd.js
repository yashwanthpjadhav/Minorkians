console.log("Cocd entered");

var express = require('express');
var router = express.Router();
var pool = require('../Database/dbconfig');


// /////////////// common code ////////////////////


//insert data to database
router.post("/", (req, res) => {

  const { code_id, comm_code_id, comm_code_desc,del_flg} = req.body;
  const text = 'INSERT INTO common_code_tbl(code_id, comm_code_id, comm_code_desc,del_flg) VALUES ($1, $2, $3, $4) RETURNING *';
  const values = [code_id, comm_code_id, comm_code_desc,del_flg];

  pool.query(text, values, (err, result) => {
    if (err) {
        console.error(err);
        res.status(500).send('Error updating data');
      } 
      else {
          console.log(result.rows[0]);
        const message = {
            message: "Data Saved successfully"
        }
        res.send(message);
      }
});
});



//get data from database
router.get("/", (req, res) => {
    var sql = "SELECT * FROM common_code_tbl";
    pool.query(sql, function (error, result) {
      if (error) {
        console.log("Error Connecting to DB");
      } else {
        res.send({ status: true, data: result });
      }
    });
  });


//delete data
router.delete("/:code_id", (req, res) => {
    const code_id = req.params.code_id;
    const text = 'DELETE FROM common_code_tbl WHERE code_id = $1';
    const values = [code_id];
  
    pool.query(text, values, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).send('Error updating data');
          } 
          else {
            const message = {
                message: "Data Deleted successfully"
            }
            res.send(message);
          }
    });
  });

// //update data
  router.put("/:code_id", (req, res) => {
     const code_id = req.params.code_id;
    const {  comm_code_id, comm_code_desc, } = req.body;
  
    const text = 'UPDATE common_code_tbl SET comm_code_id=$1, comm_code_desc=$2  WHERE code_id=$3';
    const values = [ comm_code_id, comm_code_desc,code_id];
    
    pool.query(text, values, (err, result) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error updating data');
      } 
      else {
        const message = {
            message: "Data updated successfully"
        }
        res.send(message);
      }
    });
  });


  module.exports = router;