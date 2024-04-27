console.log("Request-3 entered");

var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var pool = require('../Database/dbconfig');
const { format } = require('date-fns');



router.get('/viewLeave', viewLeave);
router.get('/approveView', aprroverView);
router.get('/markedview', markedview);
router.post('/levBalance', levBalance);
router.post('/cancelLeave', cancelLeave);
router.get('/cancelLeavePage', cancelLeavePage);


function viewLeave(req, res) {

  var emp_id = req.query.user_id;
  console.log(emp_id);

  pool.query("SELECT comm_code_desc cocd ,emp_name emp, * from leaves l,common_code_tbl cocd , emp_master_tbl emp where  emp.del_flg ='N' and  l.del_flg='N' and l.emp_id =$1 and l.approver_id = emp.emp_id and  cocd.del_flg ='N'and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP'", [emp_id], function (err, leavesList) {
    if (err) {
      console.error('Error with table query', err);
    } else {
      leaveData = leavesList.rows;
      // console.log('leaveData value', leaveData);

      //  console.log(leaveData[0].emp_id);
      //  console.log(leaveData[0].emp);
      //  console.log(leaveData[0].app_flg);
    }

    res.json({ Data: leaveData });
  })


}

function aprroverView(req, res) {
  var emp_id = req.query.user_id;
  console.log(emp_id + " --aprrover id");

  pool.query("SELECT  comm_code_desc cocd ,emp_name emp,* from leaves l, emp_master_tbl emp, common_code_tbl cocd  where l.del_flg= 'N' and l.approver_id =$1 and l.app_flg = 'P' and l.emp_id = emp.emp_id and rej_flg = 'N' and cocd.del_flg ='N' and emp.del_flg ='N' and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP'", [emp_id], function (err, leavesList) {
    if (err) {
      console.error('Error with table query', err);
    } else {
      leaveData = leavesList.rows;
      console.log('leaveData value', leaveData);

      //  console.log(leaveData[0].emp_id);
      //  console.log(leaveData[0].emp);
      //  console.log(leaveData[0].app_flg);
    }

    res.json({ message: "admin viewed", Data: leaveData });
  })
}

function markedview(req, res) {

  var emp_id = req.query.user_id;
  console.log(emp_id);

  pool.query("SELECT  comm_code_desc cocd ,emp_name emp,* from leaves l, emp_master_tbl emp, common_code_tbl cocd  where l.del_flg= 'N' and l.rcre_user_id =$1 and l.app_flg = 'P' and l.emp_id = emp.emp_id and rej_flg = 'N' and cocd.del_flg ='N' and emp.del_flg ='N' and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP'", [emp_id], function (err, leavesList) {
    if (err) {
      console.error('Error with table query', err);
    } else {
      leaveData = leavesList.rows;
      console.log('leaveData value', leaveData);
    }

    res.json({ Data: leaveData });
  })

}

function levBalance(req, res) {

  var user_id = req.body.userinfo.user_id;
  var usertype = req.body.userinfo.leave_type;
  var now = new Date();
  var year = now.getFullYear();

  pool.query("SELECT * from leave_master where emp_id =$1 and del_flg=$2 and leave_type = $3 and year = $4", [user_id, 'N', usertype, year], function (err, done) {
    if (err) {
      console.error('Error with table query', err);
    } else {

      var rowdat = done.rowCount;
      console.log("rowdat" + rowdat);

      if (rowdat != 0) {
        var rowdata1 = done.rows;
        var available_leaves_data = rowdata1[0].credited_leaves;
        console.log(available_leaves_data);
        var availed_Data = rowdata1[0].availed_leaves;
        console.log(availed_Data);
        var lev_year = rowdata1[0].year;

        res.send({ message: "Balance fetched", Data: { available_leaves: available_leaves_data, availed_Lev: availed_Data, year: lev_year } })
      }
      else {
        res.send({ message: "Apply leave first" })
      }
    }

  });
}


//////////////////////////////////////////cancel leave///////////////////////////////////////

function cancelLeave(req, res) {

  // console.log(req, "=======");
  var emp_id = req.body.user_id;
  console.log(emp_id, "emp_id");
  var emp_access = req.body.Data.user_type;
  var emp_name = req.body.Data.user_name;
  var leave_id = req.body.Data.leave_id;
  console.log(leave_id, "leave_id");
  var leaves = req.body.Data.leaves;
  var leave_type = req.body.Data.leave_type;



  var now = new Date();
  var year = now.getFullYear();
  var lchgtime = now;
  var tempList = '';
  var tempList1 = '';
  var current_date = now;
  var current_date = format(current_date, "yyyy-MM-dd");


  pool.query("select from_date,to_date from leaves where emp_id=$1 and leave_id=$2 and del_flg='N'", [emp_id, leave_id], function (err, done) {

    var rowdata = done.rows;

    var from_date = rowdata[0].from_date;
    var fromData = format(from_date, 'yyyy-MM-dd');
    console.log("FromData: " + fromData);

    var to_date = rowdata[0].to_date;
    var toData = format(to_date, 'yyyy-MM-dd');
    console.log("To Date: ", toData);

    if (to_date < current_date) {
      res.json({ message: "Applied Leave cannot be cancelled since it has passed the Leave Date." })
    }

    else {
      pool.query("UPDATE leaves set del_flg = $1, lchg_user_id = $2 , lchg_time = $3 where leave_id = $4 ", ['Y', emp_id, lchgtime, leave_id], function (err, done) {
        if (err) {
          console.error('Error with table query', err);
        }

        pool.query("SELECT * from leave_master where emp_id =$1 and del_flg=$2 and leave_type = $3 and year = $4", [emp_id, 'N', leave_type, year], function (err, done) {
          if (err) {
            console.error('Error with table query', err);
          }
          else {
            no_of_leaves = done.rows['0'].availed_leaves;
            var quater_leave = done.rows['0'].quaterly_leave;
          }

          // rest_leaves = parseFloat(no_of_leaves) - parseFloat(leaves);

          if (parseFloat(quater_leave) < 0) {

            var quater_leave = parseFloat(quater_leave) + parseFloat(leaves);
            console.log("less than 0", quater_leave);

          }
          else {
            var quater_leave = parseFloat(quater_leave) + parseFloat(leaves);
            console.log("greater than 0", quater_leave);
          }


          // pool.query("UPDATE leave_master set quaterly_leave=$1 where emp_id = $2 and leave_type = $3 and year = $4", [ quater_leave, emp_id, leave_type, year], function (err, done) {
          //   if (err) {
          //     console.error('Error with table query', err);
          //   }
          //   else {
          //                   console.log('111111111111111111111111111');
          //   }

          pool.query("SELECT * FROM leaves where leave_id =$1", [leave_id], function (err, leaveDataID) {
            if (err) {
              console.error('Error with table query', err);
            }
            else {
              var rowData2 = leaveDataID.rows;
              var approver_id = rowData2['0'].approver_id;
              var availed_leaves = rowData2['0'].availed_leaves;
              var accepted_flg = rowData2['0'].app_flg;
              var leave_type = rowData2['0'].leave_type;

              // if (accepted_flg == 'Y') {
              //   pool.query("SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1  ", [managerID], function (err, repMgr) {
              //     if (err) {
              //       console.error('Error with table query', err);
              //     }
              //     else {
              //       repMgr_id = repMgr.rows['0'].reporting_mgr;
              //       console.log('repMgr_id', repMgr_id);
              //     }

              //     pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ", [repMgr_id], function (err, repMgrEmail) {
              //       if (err) {
              //         console.error('Error with table query', err);
              //       }
              //       else {
              //         repMgrEmail_id = repMgrEmail.rows['0'].emp_email;
              //         console.log('repMgrEmail_id', repMgrEmail_id);
              //       }
              //     });
              //   });
              // }
            }

            ////////////////////////////////my logic
            pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ", [emp_id], function (err, empResult) {
              if (err) {
                console.error('Error with table query', err);
              }
              else {
                console.log("1  pick emp_email");
                var employee_email = empResult.rows['0'].emp_email;
                console.log('employee_email: ', employee_email);
              }

              pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='HR'", function (err, hrMailList) {
                if (err) {
                  console.error('Error with table query', err);
                }
                else {
                  console.log("2  pick HR_email");
                  var hrEmail = hrMailList.rows['0'].comm_code_desc;
                  tempList = hrEmail + ',' + employee_email;
                  console.log('tempList:', tempList);
                }


                pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='INFO'", function (err, cmpyMailList) {
                  if (err) {
                    console.error('Error with table query', err);
                  }
                  else {
                    console.log("3  pick Company Email");
                    cmpyEmail = cmpyMailList.rows['0'].comm_code_desc;
                    console.log('Company Email: ', cmpyEmail);
                  }

                })


                pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ", [approver_id], function (err, managerMail) {
                  if (err) {
                    console.error('Error with table query', err);
                  }
                  else {
                    console.log("4  pick Manager Email");
                    var rowData1 = managerMail.rows;
                    var managerMailId = rowData1[0].emp_email;
                    console.log('ManagerMailId: ', managerMailId);
                  }


                  console.log("Ready to send mail");
                  const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                      user: 'mohammadsab@minorks.com',
                      pass: '9591788719'
                    }
                  });

                  var mailOptions = {
                    from: cmpyEmail,
                    to: managerMailId,
                    cc: tempList,
                    subject: 'Leave cancel notification',
                    html: '<img src="https://freepresskashmir.com/wp-content/uploads/2017/05/Cancelled_stamp_cropped_B383BBCE28349.jpg" height="85"><br><br>' +
                      '<h3>You have Cancelled your Leave for the following <br><br>' +
                      '<table style="border: 10px solid black;"> ' +
                      '<tr style="border: 10px solid black;"> ' +
                      '<th style="border: 10px solid black;">Leave Type</th> ' +
                      '<th style="border: 10px solid black;">' + leave_type + '</th>' +
                      '</tr>' +

                      '<tr style="border: 10px solid black;"> ' +
                      '<th style="border: 10px solid black;">Employee Id</th> ' +
                      '<th style="border: 10px solid black;">' + emp_id + '</th>' +
                      '</tr>' +

                      '<tr style="border: 10px solid black;"> ' +
                      '<th style="border: 10px solid black;">Employee Name</th> ' +
                      '<th style="border: 10px solid black;">' + emp_name + '</th>' +
                      '</tr>' +

                      '<tr style="border: 10px solid black;"> ' +
                      '<th style="border: 10px solid black;"> From Date </td> ' +
                      '<th style="border: 10px solid black;">' + from_date + '</td> ' +
                      '</tr>' +

                      '<tr style="border: 10px solid black;"> ' +
                      '<th style="border: 10px solid black;">To Date</th> ' +
                      '<th style="border: 10px solid black;">' + to_date + '</th>' +

                      '</tr>' +

                      '<tr style="border: 10px solid black;"> ' +
                      '<th style="border: 10px solid black;"> Number of days </td> ' +
                      '<th style="border: 10px solid black;">' + availed_leaves + '</td> ' +
                      '</tr>' +
                      '</table> ' +
                      '<br><br>' +
                      'URL: http://amber.nurture.co.in <br><br><br>' +
                      '- Regards,<br><br>Amber</h3>'
                  };



                  console.log(mailOptions, "mailll");

                  transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                      console.error('Error sending email', error);
                    } else {
                      console.log('Email sent:', info.response);
                    }
                  });

                  success = 'Leave request cancelled successfully';

                  res.json({ message: success });
                });
              });
            });
          });
          // });
        });
      });
    }
  });
}


function cancelLeavePage(req, res) {
  var emp_id = req.user.rows[0].user_id;
  var emp_access = req.user.rows[0].user_type;
  var emp_name = req.user.rows[0].user_name;
  var leave_id = req.query.id;
  var leaves = req.query.leaves;


  pdbconnect.query("SELECT description leave_config,  * from leaves l,leave_config lconfig  where   l.del_flg =$1 and l.leave_id= $2 and  lconfig.leave_type = l.leave_type", ['N', leave_id], function (err, done) {
    if (err) {
      console.error('Error with table query', err);
    } else {
      rowData = done.rows;
      approver_id = rowData[0].approver_id;
      console.log('rowData value', rowData);
      //  console.log('rowData value1',done.rows['0']);


    }


    pdbconnect.query("SELECT emp_name from emp_master_tbl where   del_flg =$1 and emp_id= $2", ['N', approver_id], function (err, done1) {
      if (err) {
        console.error('Error with table query', err);
      } else {
        rowData1 = done1.rows;
        approver_name = rowData1[0].emp_name;
        console.log('rowData value', rowData1);
        //  console.log('rowData value1',done.rows['0']);


      }



      res.json({

        emp_id: emp_id,
        emp_name: emp_name,
        emp_access: emp_access,
        approver_name: approver_name,
        leave_id: leave_id,
        leaves: leaves,
        rowData: rowData


      });
    });

  });

}


/////////////////////////////////////////////////////////////////////////////////
module.exports = router;