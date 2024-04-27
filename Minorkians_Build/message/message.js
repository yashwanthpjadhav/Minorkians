console.log("Message entered");

var express = require('express');
var router = express.Router();
var pool = require('../Database/dbconfig');
var nodemailer = require('nodemailer');


// /////////////// Message api's ////////////////////


//Post message to database
// router.post("/", (req, res) => {

//   const { to_user_id, message_content } = req.body;
//   const text = 'INSERT INTO messages(to_user_id, message_content) VALUES ($1, $2) RETURNING *';
//   const values = [to_user_id, message_content];

//   pool.query(text, values, (err, result) => {
//     if (err) {
//       console.error(err);
//       res.status(500).send('Error updating data');
//     }
//     else {
//       console.log(result.rows[0]);
//       const message = {
//         message: "Message successfully sent"
//       }
//       res.send(message);
//     }
//   });

// });


// birthday wishes post

router.post('/sendWishes', function (req, res) {

  console.log('req value', req.body);

  var emp_id = req.body.user_id;
  console.log(emp_id);
  // var emp_access = req.body.user_type;
  // var my_name = req.body.user_name;

  // var now = new Date();
  // var lchgtime = now;

  var brdName = req.body.recipient;
  console.log(brdName);
  var message_content = req.body.content;
  console.log(message_content);

  pool.query("SELECT emp_id, emp_email  FROM emp_master_tbl  where del_flg = $1  and emp_name=$2 ", ['N', brdName], function (err, empList) {
    if (err) {
      console.error('Error with table query', err);
    } else {
      usersCount = empList.rowCount;

      var brdmail = empList.rows;
      var brdEmpid = brdmail[0].emp_id;
      console.log("Emp ID of brdy person: " + brdEmpid);
      var bedEmail1 = brdmail[0].emp_email;
      console.log("Email of brdy person: " + bedEmail1);

    }
    pool.query("SELECT emp_name ,emp_email  FROM emp_master_tbl  where del_flg = $1  and emp_id=$2 ", ['N', emp_id], function (err, empList) {
      if (err) {
        console.error('Error with table query', err);
      } else {
        usersCount = empList.rowCount;

        var brdmail = empList.rows;
        var Myname = brdmail[0].emp_name;
        console.log("My Name: " + Myname);
        var MyEmail = brdmail[0].emp_email;
        console.log("My Email: " + MyEmail);

      }


      pool.query("INSERT INTO messages(to_user_id, from_user_id, message_content) values($1,$2,$3)", [brdEmpid, emp_id, message_content], function (err, done) {
        if (err) throw err;
        console.log("Inserted to Message Table!!");

        pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='HR'", function (err, hrMailList) {
          if (err) {
            console.error('Error with table query', err);
          }
          else {
            console.log("3  pick HR_email");
            var hrEmail = hrMailList.rows['0'].comm_code_desc;
          }


          tempList = hrEmail + ',' + MyEmail;
          console.log('tempList', tempList);

          pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='INFO'", function (err, cmpyMailList) {
            if (err) {
              console.error('Error with table query', err);
            }
            else {
              console.log(" pick Company Email");
              cmpyEmail = cmpyMailList.rows['0'].comm_code_desc;
              console.log('Company Email: ', cmpyEmail);
            }

            // Mail

            console.log("Ready to send mail");
            const transporter = nodemailer.createTransport({
              service: 'gmail',
              auth: {
                user: 'mohammadsab@minorks.com',
                pass: '9591788719'
              }
            });

            // https://mailmycards.ca/wp-content/uploads/2021/03/HBD-350-View-5.png
            // https://i.pinimg.com/564x/89/bd/37/89bd37b68338b7e591596bad98f56cf2.jpg
            var mailOptions = {
              from: cmpyEmail,
              to: bedEmail1,
              cc: tempList,
              subject: 'Birthday Wish!',
              html: '<img src="https://mailmycards.ca/wp-content/uploads/2021/03/HBD-350-View-5.png" alt="Birthday Image" width="180" height="140"><br><br>' +
                '<h3>Happy Birthday!</h3>' +
                '<p> Dear ' + brdName + ',</p>' +
                '<p>' + message_content + '</p> <br>' +
                '<p>Best regards,</p>' +
                '<p>' + Myname + '</p>'
            };

            console.log(mailOptions, "mailll");

            transporter.sendMail(mailOptions, function (error, info) {
              if (error) {
                console.error('Error sending email', error);
              } else {
                console.log('Email sent:', info.response);
              }
            });

            res.json({ succcess: 200, message: "redirect to admindashboard" })

          });
        });
      });
    });

  });









});





// Get message api
router.post('/sentmssg', function (req, res) {
  var user_id = req.body.user_id;

  pool.query("SELECT * FROM messages WHERE from_user_id = $1", [user_id], function (err, mssg) {
    if (err) {
      console.log("Error connecting to DB");
      res.status(500).send("Error connecting to DB");
    } else {
      var messgs = mssg.rows;
      var messages = [];

      messgs.forEach(function (message) {
        var touser = message.to_user_id;
        var content = message.message_content;

        pool.query("SELECT emp_name FROM emp_master_tbl WHERE del_flg = $1 AND emp_id = $2", ['N', touser], function (err, empList) {
          if (err) {
            console.error('Error with table query', err);
          } else {
            var toname = empList.rows;
            var tousername = toname[0].emp_name;

            messages.push({ to_user: tousername, mssg: content });

            if (messages.length === messgs.length) {
              res.send({ messages: messages });
            }
          }
        });
      });
    }
  });
});



//delete message api
router.delete('/:folder/:id', (req, res) => {
  const folder = req.params.folder;
  const messageId = req.params.id;

  // Define the SQL statement based on the folder and messageId
  let sql = '';
  if (folder === 'inbox') {
    sql = `DELETE FROM messages WHERE id = ${messageId}`;
  } else if (folder === 'sent') {
    console.log(messageId);
    const userid = `select to_user_id from messages where `
    sql = `DELETE FROM messages WHERE to_user_id = "NNN" `;
  } else {
    return res.status(400).json({ error: 'Invalid folder' });
  }

  // Execute the SQL statement
  pool.query(sql, (err, result) => {
    if (err) {
      console.error('Error deleting the message:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    console.log('Message deleted successfully');
    res.sendStatus(204); // Send a success status code (204 No Content)
  });
});



module.exports = router;