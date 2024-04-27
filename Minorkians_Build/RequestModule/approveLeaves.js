console.log("Request-2 entered");

var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var pool = require('../Database/dbconfig');
const { format } = require('date-fns');


router.put('/approveAppliedLeaves', approveAppliedLeaves);
router.post('/rejectLeaves', rejectAppliedLeaves);
router.post('/unmarkLeave', unmarkLeave);



function approveAppliedLeaves(req, res) {

  // console.log(req);

  var eid = req.body.user_id;
  console.log(req.body.user_id);

  var leaves = req.body.Data.availed_leaves;
  var leaveType = req.body.Data.cocd;
  var leavetype = req.body.Data.leave_type;
  var year = req.body.Data.year;
  var leave_id = req.body.Data.leave_id;
  var emp_id = req.body.Data.emp_id;
  var tempList = '';
  var now = new Date();
  var lchgtime = now;
  var employee_email = req.body.Data.emp_email;


  pool.query("select from_date,to_date from leaves where emp_id=$1 and leave_id=$2 and del_flg='N'", [emp_id, leave_id], function (err, done) {
    var from_date = done.rows['0'].from_date;
    var fromData = format(from_date, 'yyyy-MM-dd');
    console.log("From Date: ", fromData);


    var to_date = done.rows['0'].to_date;
    var toData = format(to_date, 'yyyy-MM-dd');
    console.log("To Date: ", toData);



    pool.query("UPDATE  leaves set app_flg = $1, lchg_user_id = $2 , lchg_time = $3 where  leave_id = $4 ", ['Y', eid, lchgtime, leave_id], function (err, done) {
      if (err) {
        console.error('Error with table query', err);
      } else {
        console.log("updated to leaves Table");
      }

      pool.query("SELECT * from leave_master where emp_id =$1 and del_flg=$2 and leave_type = $3 and year = $4", [emp_id, 'N', leavetype, year], function (err, done) {
        if (err) {
          console.error('Error with table query', err);
        } else {
          no_of_leaves = done.rows['0'].availed_leaves;
          cre_leaves = done.rows['0'].credited_leaves;
        }

        console.log(no_of_leaves + "      :old availed");
        console.log(cre_leaves + "        :old available");

        var newavailedleaves = parseInt(no_of_leaves) + parseInt(leaves);
        console.log("New availed leaves: " + newavailedleaves);


        var newCreditedleaves = parseInt(cre_leaves) - parseInt(leaves);
        console.log("New Credited Leaves: " + newCreditedleaves);

        pool.query("UPDATE  leave_master set  availed_leaves = $1 , credited_leaves = $2  where  emp_id = $3 and leave_type = $4 and year = $5", [newavailedleaves, newCreditedleaves, emp_id, leavetype, year], function (err, done) {
          if (err) {
            console.error('Error with table query', err);
          } else {
            console.log("updated to leave_master Table");
          }

          pool.query("SELECT  emp_email from emp_master_tbl where emp_id=$1 ", [eid], function (err, manager) {
            if (err) {
              console.error('Error with table query', err);
            } else {

              var managerRes = manager.rows;
              var managerEmail = managerRes[0].emp_email;
              console.log("2 picking manager email \n" + managerEmail);
            }


            pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='HR'", function (err, hrMailList) {
              if (err) {
                console.error('Error with table query', err);
              }
              else {
                console.log("3  pick HR_email");
                var hrEmail = hrMailList.rows['0'].comm_code_desc;
              }


              tempList = hrEmail + ',' + managerEmail;
              console.log('tempList', tempList);

              pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='INFO'", function (err, cmpyMailList) {
                if (err) {
                  console.error('Error with table query', err);
                }
                else {
                  console.log("4  pick Company Email");
                  cmpyEmail = cmpyMailList.rows['0'].comm_code_desc;
                  console.log('Company Email: ', cmpyEmail);
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
                  to: employee_email,
                  cc: tempList,
                  subject: 'Leave Approval notification',
                  html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR83_eDMGIsgkz4JLMxwqzPqWqSyEa5awPs7bJmiyrMbkeoy35X" height="85"><br><br>' +
                    '<h3>Your Leave has been Approved for the following<br><br>' +
                    '<table style="border: 10px solid black;"> ' +
                    '<tr style="border: 10px solid black;"> ' +
                    '<th style="border: 10px solid black;">Leave Type</th> ' +
                    '<th style="border: 10px solid black;">' + leaveType + '</th>' +
                    '</tr>' +

                    '<tr style="border: 10px solid black;"> ' +
                    '<th style="border: 10px solid black;"> From Date </td> ' +
                    '<th style="border: 10px solid black;">' + fromData + '</td> ' +
                    '</tr>' +

                    '<tr style="border: 10px solid black;"> ' +
                    '<th style="border: 10px solid black;">To Date</th> ' +
                    '<th style="border: 10px solid black;">' + toData + '</th>' +

                    '</tr>' +

                    '<tr style="border: 10px solid black;"> ' +
                    '<th style="border: 10px solid black;"> Number of days </td> ' +
                    '<th style="border: 10px solid black;">' + leaves + '</td> ' +
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


                success = 'Leave request approved successfully';
                res.json({ message: success });

              });
            });
          });
        });
      })
    });
  });
}


function rejectAppliedLeaves(req, res) {

  console.log(req);

  var eid = req.body.user_id;
  console.log(req.body.user_id);

  var rejreason = req.body.Reason;
  var leaves = req.body.Data.availed_leaves;
  var leaveType = req.body.Data.cocd;
  var leave_id = req.body.Data.leave_id;
  var emp_id = req.body.Data.emp_id;
  var employeeName = req.body.Data.emp;
  var tempList = '';
  var now = new Date();
  var lchgtime = now;
  var employee_email = req.body.Data.emp_email;



  // var ename = req.user.rows[0].user_name;
  // var leave_id = req.body.leave_id;
  // var emp_id = req.body.emp_id;
  // var emp_name = req.body.emp_name;
  // var leaves = req.body.leaves;
  // var reason = req.body.desc;
  // var leave_type = req.body.leave_type;
  // console.log('leave_type', leave_type);
  // //var emp = req.query.emp;
  // var tempList = '';

  // var now = new Date();
  // var year = now.getFullYear();
  // var lchgtime = now;
  // console.log('reject leave_id', leave_id);
  // console.log('reject leaves', leaves);
  // console.log('reject reason', reason);

  pool.query("select from_date,to_date from leaves where emp_id=$1 and leave_id=$2 and del_flg='N'", [emp_id, leave_id], function (err, done) {
    var from_date = done.rows['0'].from_date;
    var fromData = format(from_date, 'yyyy-MM-dd');
    console.log("From Date: ", fromData);


    var to_date = done.rows['0'].to_date;
    var toData = format(to_date, 'yyyy-MM-dd');
    console.log("To Date: ", toData);



    pool.query("UPDATE  leaves set   rej_flg = $1,app_flg =$2, lchg_user_id = $3 , lchg_time = $4 , rej_reason = $5 where  leave_id = $6 ", ['Y', 'N', eid, lchgtime, rejreason, leave_id], function (err, done) {
      if (err) {
        console.error('Error with table query', err);
      } else {
        console.log("updated to leaves Table --->");
      }



      pool.query("SELECT  emp_email from emp_master_tbl where emp_id=$1 ", [eid], function (err, manager) {
        if (err) {
          console.error('Error with table query', err);
        } else {

          var managerRes = manager.rows;
          var managerEmail = managerRes[0].emp_email;
          console.log("2 picking manager email \n" + managerEmail);
        }


        pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='HR'", function (err, hrMailList) {
          if (err) {
            console.error('Error with table query', err);
          }
          else {
            console.log("3  pick HR_email");
            var hrEmail = hrMailList.rows['0'].comm_code_desc;
          }


          tempList = hrEmail + ',' + managerEmail;
          console.log('tempList', tempList);

          pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='INFO'", function (err, cmpyMailList) {
            if (err) {
              console.error('Error with table query', err);
            }
            else {
              console.log("4  pick Company Email");
              cmpyEmail = cmpyMailList.rows['0'].comm_code_desc;
              console.log('Company Email: ', cmpyEmail);
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
              to: employee_email,
              cc: tempList,
              from: 'amber@nurture.co.in',
              subject: 'Leave Reject notification ',
              html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF3AN6vk9aZnh5KQ_KPzHWYwlVWNNCxzAFK-994yO9WY6UwfiSIA" height="85"><br><br>' +
                '<h3>Your leave application has been rejected for following<br><br>' +
                '<table style="border: 10px solid black;"> ' +
                '<tr style="border: 10px solid black;"> ' +
                '<th style="border: 10px solid black;">Leave Type</th> ' +
                '<th style="border: 10px solid black;">' + leaveType + '</th>' +
                '</tr>' +

                '<tr style="border: 10px solid black;"> ' +
                '<th style="border: 10px solid black;">Employee Id</th> ' +
                '<th style="border: 10px solid black;">' + emp_id + '</th>' +
                '</tr>' +

                '<tr style="border: 10px solid black;"> ' +
                '<th style="border: 10px solid black;">Leave Type</th> ' +
                '<th style="border: 10px solid black;">' + employeeName + '</th>' +
                '</tr>' +

                '<tr style="border: 10px solid black;"> ' +
                '<th style="border: 10px solid black;"> From Date </td> ' +
                '<th style="border: 10px solid black;">' + fromData + '</td> ' +
                '</tr>' +

                '<tr style="border: 10px solid black;"> ' +
                '<th style="border: 10px solid black;">To Date</th> ' +
                '<th style="border: 10px solid black;">' + toData + '</th>' +

                '</tr>' +

                '<tr style="border: 10px solid black;"> ' +
                '<th style="border: 10px solid black;"> Number of days </td> ' +
                '<th style="border: 10px solid black;">' + leaves + '</td> ' +
                '</tr>' +

                '<tr style="border: 10px solid black;"> ' +
                '<th style="border: 10px solid black;"> Rejection reason </td> ' +
                '<th style="border: 10px solid black;">' + rejreason + '</td> ' +
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


            success = 'Leave request Rejected successfully';
            res.json({ message: success });

          });
        });
      });

    });
  });

}


function unmarkLeave(req, res) {
  console.log(req, "++++++++++++++++++++++++");

  var uid = req.body.user_id;
  console.log(uid);

  // var emp_access = req.user.rows[0].user_type;
  // var ename = req.user.rows[0].user_name;
  var emp_id = req.body.Data.emp_id;
  var emp_name = req.body.Data.emp_name;
  var emp_email = req.body.Data.emp_email;
  var leave_id = req.body.Data.leave_id;
  var numofLeaves = req.body.Data.availed_leaves;
  var reason = req.body.Data.reason;
  var leave_type = req.body.Data.cocd;
  var leave_type_id = req.body.Data.leave_type;

  var tempList = '';
  var now = new Date();
  var year = now.getFullYear();
  var lchgtime = now;

  pool.query("UPDATE leaves set del_flg = $1, lchg_user_id = $2 , lchg_time = $3 where leave_id = $4 ", ['Y', uid, lchgtime, leave_id], function (err, done) {
    if (err) {
      console.error('Error with table query', err);
    }
    console.log("UPDATED TO LEAVES !!");

    pool.query("SELECT * from leave_master where emp_id =$1 and del_flg=$2 and leave_type = $3 and year = $4", [emp_id, 'N', leave_type_id, year], function (err, done) {
      if (err) {
        console.error('Error with table query', err);
      }
      else {
        var no_of_leaves = done.rows['0'].availed_leaves;
        var quater_leave = done.rows['0'].quaterly_leave;
      }

      // rest_leaves = parseFloat(no_of_leaves) - parseFloat(leaves);

      if (parseFloat(quater_leave) < 0) {
        quater_leave = parseFloat(quater_leave) + parseFloat(numofLeaves);
        console.log("less than 0", quater_leave);
      }
      else {
        quater_leave = parseFloat(quater_leave) + parseFloat(numofLeaves);
        console.log("greater than 0", quater_leave);
      }


      pool.query("UPDATE leave_master set quaterly_leave=$1 where emp_id = $2 and leave_type = $3 and year = $4", [quater_leave, emp_id, leave_type_id, year], function (err, done) {
        if (err) {
          console.error('Error with table query', err);
        }
        else {
          console.log('Updated to MASTER Table !!');
        }

        pool.query("SELECT  comm_code_desc cocd ,emp_name emp,* from leaves l, emp_master_tbl emp,  common_code_tbl cocd  where l.del_flg= 'N' and l.emp_id =$1 and l.approver_id = emp.emp_id and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP' and cocd.del_flg ='N'", [emp_id], function (err, leavesList) {
          if (err) {
            console.error('Error with table query', err);
          }
          else {
            leaveData = leavesList.rows;
          }

          pool.query("SELECT * FROM leaves where leave_id =$1", [leave_id], function (err, leaveDataID) {
            if (err) {
              console.error('Error with table query', err);
            }
            else {
              rowData2 = leaveDataID.rows;
              var ManagerID = leaveDataID.rows[0].approver_id;

              var fromdate = leaveDataID.rows[0].from_date;
              var from_date = format(fromdate, "yyyy-mm-dd");

              var todate = leaveDataID.rows[0].to_date;
              var to_date = format(todate, "yyyy-mm-dd");

              // availed_leaves = leaveDataID.rows[0].availed_leaves;
              accepted_flg = leaveDataID.rows[0].app_flg;
              console.log('ManagerID', ManagerID);
              console.log('Accepted_flg', accepted_flg);

              if (accepted_flg == 'Y') {
                console.log("APP_FLG : Y");
                pool.query("SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1", [emp_id], function (err, repMgr) {
                  if (err) {
                    console.error('Error with table query', err);
                  }
                  else {
                    var repMgr_id = repMgr.rows['0'].reporting_mgr;
                    console.log('repMgr_id', repMgr_id);
                  }

                  pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1", [repMgr_id], function (err, repMgrEmail) {
                    if (err) {
                      console.error('Error with table query', err);
                    }
                    else {
                      var repMgrEmail_id = repMgrEmail.rows['0'].emp_email;
                      console.log('repMgrEmail_id', repMgrEmail_id);
                    }
                  });
                });
              }

              console.log("APP_FLG : P");
            }

            pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ", [ManagerID], function (err, managerMail) {
              if (err) {
                console.error('Error with table query', err);
              }
              else {
                rowData1 = managerMail.rows;
                var managerMailId = rowData1[0].emp_email;
                console.log('ManagerMailId', managerMailId);
              }


              pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='HR'", function (err, hrMailList) {
                if (err) {
                  console.error('Error with table query', err);
                }
                else {
                  var hrMailList = hrMailList.rows[0].comm_code_desc;
                }

                console.log(" pick Emp,Hr, Mgr Email");
                var tempList1 = emp_email;
                var tempList2 = hrMailList + ',' + managerMailId;

                pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='INFO'", function (err, cmpyMailList) {
                  if (err) {
                    console.error('Error with table query', err);
                  }
                  else {
                    console.log(" pick Company Email");
                    cmpyEmail = cmpyMailList.rows['0'].comm_code_desc;
                    console.log('Company Email: ', cmpyEmail);
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
                    to: tempList1,
                    cc: tempList2,
                    subject: 'Leave cancel notification',
                    html: '<img src="http://econitynepal.com/wp-content/uploads/2016/04/cancellation-of-registration.jpg" height="85"><br><br>' +
                      '<h3>HR has cancelled the Leave for following<br><br>' +
                      '<table style="border: 10px solid black;"> ' +
                      '<tr style="border: 10px solid black;"> ' +
                      '<th style="border: 10px solid black;">Leave Type</th> ' +
                      '<th style="border: 10px solid black;">' + leave_type + '</th>' +
                      '</tr>' +

                      '<tr style="border: 10px solid black;"> ' +
                      '<th style="border: 10px solid black;"> Employee Name </td> ' +
                      '<th style="border: 10px solid black;">' + emp_name + '</td> ' +
                      '</tr>' +

                      '<tr style="border: 10px solid black;"> ' +
                      '<th style="border: 10px solid black;">Employee ID</th> ' +
                      '<th style="border: 10px solid black;">' + emp_id + '</th>' +

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
                      '<th style="border: 10px solid black;">' + numofLeaves + '</td> ' +
                      '</tr>' +
                      '</table> ' +
                      '<br><br>' +
                      'URL: http://amber.nurture.co.in <br><br>' +
                      'You are marked in CC because you are the Reporting Manager for the Employee <br><br><br>' +
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

                success = 'Leave UnMarked successfully';
                res.json({ message: success });

                });
              });
            });
          });
        });
      });
    });
  });
}


/////////////////////////////////////////////////////////////////////////////////
module.exports = router;