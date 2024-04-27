console.log("Request-1 entered");

var express = require('express');
var router = express.Router();
var nodemailer = require('nodemailer');
var pool = require('../Database/dbconfig');


router.post('/applyLeave', applyLeave);
router.post('/markpostLeave', markpostLeave);
router.post('/unmarkLeavePost', unmarkLeavePost);


function applyLeave(req, res) {

    // Input from UI
    var sessiontyp = req.body.item.sessionType;
    console.log(sessiontyp);
    var leave_type = req.body.item.leaveType;
    console.log(leave_type);
    var from_date = req.body.item.fromDate;
    console.log("From Date: " + from_date);
    var to_date = req.body.item.toDate;
    console.log("To Date: " + to_date);
    var applNorDays = req.body.item.appliedNoOfDays;
    var reason = req.body.item.description;

    // Input from user login
    var emp_id = req.body.user_id;
    console.log("EID: " + emp_id);
    var emp_name = req.body.user_name;
    console.log("ENAME: " + emp_name);
    // var emp_access = req.body.user_type;


    // var availed_leaves = req.body.availed_leaves;
    // console.log("availed_leaves" + availed_leaves);

    // var available_leaves = req.body.available_leaves;
    // console.log("available_leaves" + available_leaves);

    // var quater_leaves = req.body.quater_leaves;
    // console.log("quater_leaves", quater_leaves);

    // var borr_leaves = req.body.borr_leaves;
    // console.log("borr_leaves", borr_leaves);

    var sessiontime = req.body.sessions;
    var tempList = '';
    var carry_forwarded = '';
    var now = new Date();

    // recent adds
    var del_flg;
    var app_flg;
    var rej_flg;
    var rcre_user_id;
    var rcre_time = now;
    var lchg_user_id;
    var lchg_time = now;
    var year = now.getFullYear();

    if (leave_type == "EL") {
        console.log("el");

        // if (borr_leaves == "0") {
        //     var borr_leaves = parseFloat(quater_leaves) - parseFloat(availed_leaves);
        //     console.log("borr_leaves", borr_leaves);
        // }
        // else {
        //     var borr_leaves = borr_leaves * -1;
        //     console.log("borr_leaves", borr_leaves);
        // }

        pool.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('H') order by sel_date asc", function (err, holidayList) {
            if (err) {
                console.error('Error with table query', err);
            }
            else {
                var holiday_list = holidayList.rows; //All the table data will come in Json
                var holiday_count = holidayList.rowCount; // counts the number of rows in table
            }

            pool.query("SELECT * from leaves ", function (err, done) {
                if (err) {
                    console.error('Error with table query', err);
                }
                else {
                    leave_id_value = done.rowCount;
                    console.log('leave_id_value', leave_id_value);
                    leave_id_value = leave_id_value + 100;
                    console.log('leave_id_value', leave_id_value);
                    leave_id = leave_id_value + 1;
                    console.log('leave_id', leave_id);
                }


                // var rest_leaves = parseFloat(available_leaves) - parseFloat(availed_leaves);
                // console.log('rest_leaves', rest_leaves);

                pool.query("SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1  ", [emp_id], function (err, repotmanagerMail) {
                    if (err) {
                        console.error('Error with table query', err);
                    }
                    else {
                        rowData2 = repotmanagerMail.rows;
                        approver_id = rowData2[0].reporting_mgr;
                        console.log('Approver ID: ', approver_id);
                    }
                })
                ///
                pool.query("select * from LEAVES where del_flg = $1 and emp_id =$2  and  ((from_date <= ($3) and to_date >= ($3)) or (from_date <= ($4) and to_date >= ($4))) and rej_flg= $5 and year=$6", ['N', emp_id, from_date, to_date, 'N', year], function (err, leaveOverlapList) {
                    if (err) {
                        console.error('Error with table query', err);
                    }
                    else {
                        var leaveOverlapList_count = leaveOverlapList.rowCount;
                        console.log('leaveOverlapList_count value', leaveOverlapList_count);
                    }

                    if (leaveOverlapList_count == 0) {
                        console.log(approver_id + " ================");
                        pool.query("INSERT INTO leaves(leave_type, from_date,to_date, del_flg, availed_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, reason,approver_id, leave_id,emp_id,app_flg,rej_flg,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)", [leave_type, from_date, to_date, 'N', applNorDays, emp_id, rcre_time, emp_id, rcre_time, reason, approver_id, leave_id, emp_id, 'P', 'N', year], function (err, done) {
                            if (err) throw err;
                            console.log("Data Inserted to leaves table");
                        });


                        pool.query("select * from leave_master where del_flg = $1 and emp_id =$2  and leave_type = $3 and year = $4 ", ['N', emp_id, leave_type, year], function (err, leaveMasterList) {
                            if (err) {
                                console.error('Error with table query', err);
                            }
                            else {
                                var leaveMasterList_count = leaveMasterList.rowCount;
                                if (leaveMasterList_count != 0) {
                                    ///
                                    var availed_leaves_master = leaveMasterList.rows[0].availed_leaves;
                                }
                                else {
                                    var availed_leaves_master = 0;
                                }

                                console.log('leaveMasterList_count value', leaveMasterList_count);
                                console.log('availed_leaves_master value', availed_leaves_master);
                            }

                            console.log("0");
                            if (leaveMasterList_count == 0) {
                                console.log("1");
                                pool.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2", [emp_id, 'N'], function (err, done) {
                                    if (err) {
                                        console.error('Error with table query', err);
                                    }
                                    else {
                                        carry_forwarded = 0;
                                    }
                                    console.log("3");
                                    console.log('carry_forwarded value', carry_forwarded);
                                    ///////////////////////////////////


                                    pool.query("select * from leave_config where del_flg = $1 and leave_type = $2 and year=$3", ['N', leave_type, year], function (err, leaveConfigList) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        }
                                        else {
                                            credited_leaves = leaveConfigList.rows[0].allocated_leaves;
                                            console.log('credited_leaves value', credited_leaves);
                                        }


                                        pool.query("INSERT INTO leave_master (emp_id, leave_type, del_flg,availed_leaves,carry_forwarded,credited_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, year, quaterly_leave) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)", [emp_id, leave_type, 'N', '0', carry_forwarded, credited_leaves, emp_id, rcre_time, emp_id, rcre_time, year, '0'], function (err, done) {
                                            if (err) throw err;
                                        });
                                    });

                                });
                            }
                            else {

                                console.log('please do it');
                                // total_leaves = parseFloat(availed_leaves_master) + parseFloat(availed_leaves);
                                // console.log('total_leaves value', total_leaves);

                                pool.query("update leave_master set availed_leaves = $1 , lchg_user_id = $2, lchg_time =$3 ,quaterly_leave =$6 where year = $4 and emp_id = $5 and leave_type = $7 ", [availed_leaves_master, emp_id, rcre_time, year, emp_id, '0', leave_type], function (err, done) {
                                    if (err) throw err;
                                });
                            }

                            pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ", [emp_id], function (err, empResult) {
                                if (err) {
                                    console.error('Error with table query', err);
                                }
                                else {
                                    console.log("2  pick emp_email");
                                    employee_email = empResult.rows['0'].emp_email;
                                    console.log('employee_email: ', employee_email);
                                }

                                pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='HR'", function (err, hrMailList) {
                                    if (err) {
                                        console.error('Error with table query', err);
                                    }
                                    else {
                                        console.log("3  pick HR_email");
                                        var hrEmail = hrMailList.rows['0'].comm_code_desc;
                                        tempList = hrEmail + ',' + employee_email;
                                        console.log('tempList:', tempList);
                                    }


                                    pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='INFO'", function (err, cmpyMailList) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        }
                                        else {
                                            console.log("4  pick Company Email");
                                            cmpyEmail = cmpyMailList.rows['0'].comm_code_desc;
                                            console.log('Company Email: ', cmpyEmail);
                                        }

                                    })


                                    pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ", [approver_id], function (err, managerMail) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        }
                                        else {
                                            console.log("5  pick Manager Email");
                                            rowData1 = managerMail.rows;
                                            managerMailId = rowData1[0].emp_email;
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


                                        if (leave_type == "EL") {
                                            var leave_type1 = "Annual Leave";
                                        }

                                        if (sessiontyp == "FD") {
                                            var session1 = "FULL DAY";
                                            var sessiontime1 = "Session 1 - Session 2";
                                        }
                                        else {
                                            var session1 = "HALF DAY";

                                            if (sessiontime == "s1") {
                                                var sessiontime1 = "Session 1";
                                            }
                                            else {
                                                var sessiontime1 = "Session 2";
                                            }
                                        }

                                        var mailOptions = {
                                            from: cmpyEmail,
                                            to: managerMailId,
                                            cc: tempList,
                                            subject: 'Leave Requested',
                                            html: '<img src="https://www.theplanner.co.uk/sites/default/files/Web_Submitted_shutterstock_434614015.jpg" height="85"><br><br>' +
                                                '<h3> Submitted Leave Application Details for Managers Approval<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                '<tr style="border: 10px solid black;"> ' +
                                                '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                '<th style="border: 10px solid black;">' + leave_type1 + '</th>' +
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
                                                '<th style="border: 10px solid black;">' + applNorDays + '</td> ' +
                                                '</tr>' +

                                                '<tr style="border: 10px solid black;"> ' +
                                                '<th style="border: 10px solid black;"> Reason </td> ' +
                                                '<th style="border: 10px solid black;">' + reason + '</td> ' +
                                                '</tr>' +

                                                '<tr style="border: 10px solid black;"> ' +
                                                '<th style="border: 10px solid black;"> Session Type </td> ' +
                                                '<th style="border: 10px solid black;">' + session1 + '</td> ' +
                                                '</tr>' +

                                                '<tr style="border: 10px solid black;"> ' +
                                                '<th style="border: 10px solid black;"> Session Time </td> ' +
                                                '<th style="border: 10px solid black;">' + sessiontime1 + '</td> ' +
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


                                    });

                                    pool.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)", [emp_id], function (err, emp_data) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        }
                                        else {
                                            emp_data_app = emp_data.rows;
                                        }


                                        pool.query("SELECT * from holidays where del_flg =$1", ['N'], function (err, holidayList) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            }
                                            else {
                                                holidayData = holidayList.rows;
                                            }
                                        });
                                    });

                                });
                            });
                        });


                        success = 'Leave request submitted successfully';

                        res.json({ message: "Leave request submitted successfully" })
                    }
                    else {
                        res.json({ message: "Leave dates overlap please recheck" });
                    }
                });
            });
        });
    }

    /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

    if ((leave_type != "EL") && (leave_type != "RL")) {
        console.log("it's not el and not rl");
        pool.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('H') order by sel_date asc", function (err, holidayList) {
            if (err) {
                console.error('Error with table query', err);
            }
            else {
                var holiday_list = holidayList.rows;
                // console.log(holiday_list);
                var holiday_count = holidayList.rowCount;
                console.log(holiday_count);
            }

            pool.query("SELECT * from leaves ", function (err, done) {
                if (err) {
                    console.error('Error with table query', err);
                }
                else {
                    leave_id_value = done.rowCount;
                    console.log('leave_id_value', leave_id_value);
                    leave_id_value = leave_id_value + 100;
                    console.log('leave_id_value', leave_id_value);
                    leave_id = leave_id_value + 1;
                    console.log('leave_id', leave_id);
                }

                ///
                pool.query("SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1  ", [emp_id], function (err, repotmanagerMail) {
                    if (err) {
                        console.error('Error with table query', err);
                    }
                    else {
                        rowData2 = repotmanagerMail.rows;
                        approver_id = rowData2[0].reporting_mgr;
                        console.log('Approver ID: ', approver_id);
                    }
                })
                ///

                // var rest_leaves = parseFloat(available_leaves) - parseFloat(availed_leaves);
                // console.log(available_leaves);
                // console.log(availed_leaves);
                // console.log('rest_leaves', rest_leaves);

                var now = new Date();
                var rcretime = now;
                var year = now.getFullYear();
                var leaveOverlapList_count = 0;
                var leaveMasterList_count = 0;

                pool.query("select * from LEAVES where del_flg = $1 and emp_id =$2  and  ((from_date <= ($3) and to_date >= ($3)) or (from_date <= ($4) and to_date >= ($4))) and rej_flg= $5 and year=$6", ['N', emp_id, from_date, to_date, 'N', year], function (err, leaveOverlapList) {
                    if (err) {
                        console.error('Error with table query', err);
                    }
                    else {
                        leaveOverlapList_count = leaveOverlapList.rowCount;
                        console.log('leaveOverlapList_count value', leaveOverlapList_count);
                    }

                    console.log("leaveOverlapList_countkkkkkkkkkk" + leaveOverlapList_count);

                    if (leaveOverlapList_count == 0) {

                        pool.query("INSERT INTO leaves(leave_type, from_date, to_date, del_flg,availed_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, reason,approver_id, leave_id, emp_id, app_flg, rej_flg, year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)",
                            [leave_type, from_date, to_date, 'N', applNorDays, emp_id, rcretime, emp_id, rcretime, reason, approver_id, leave_id, emp_id, 'P', 'N', year], function (err, done) {
                                if (err) throw err;
                                console.log("Inserted into leaves table!!!!!!!!!!!!!");
                            });
                        res.json({
                            message: "Leave request submitted successfully", notification: "redirect to leaves",
                            // Data: {
                            //     leave_type,
                            //     from_date,
                            //     to_date,
                            //     del_flg,
                            //     availed_leaves,
                            //     rcre_user_id,
                            //     rcre_time,
                            //     lchg_user_id,
                            //     lchg_time,
                            //     reason,
                            //     approver_id,
                            //     leave_id,
                            //     emp_id,
                            //     app_flg,
                            //     rej_flg,
                            //     year
                            // }
                        })



                        pool.query("select * from leave_master where del_flg = $1 and emp_id =$2  and leave_type = $3 and year = $4 ", ['N', emp_id, leave_type, year], function (err, leaveMasterList) {
                            if (err) {
                                console.error('Error with table query', err);
                            }
                            else {
                                leaveMasterList_count = leaveMasterList.rowCount;
                                if (leaveMasterList_count != 0) {
                                    var availed_leaves_master = leaveMasterList.rows[0].availed_leaves;
                                    console.log("Last used leaves:-- "+ availed_leaves_master);
                                }
                                else {
                                    var availed_leaves_master = 0;
                                }

                                console.log('leaveMasterList_count value is:', leaveMasterList_count);
                                console.log('availed_leaves_master value is:', availed_leaves_master);
                            }

                            if (leaveMasterList_count == 0) {

                                pool.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2", [emp_id, 'N'], function (err, done) {
                                    if (err) {
                                        console.error('Error with table query', err);
                                    }
                                    else {
                                        carry_forwarded = 0;
                                    }

                                    console.log(":: 1 ::");
                                    console.log('carry_forwarded value', carry_forwarded);

                                    pool.query("select * from leave_config where del_flg = $1 and leave_type = $2 and year=$3", ['N', leave_type, year], function (err, leaveConfigList) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        }
                                        else {
                                            credited_leaves = leaveConfigList.rows[0].allocated_leaves;
                                            console.log(":: 3 ::");
                                            console.log('credited_leaves value', credited_leaves);
                                        }

                                        pool.query("INSERT INTO leave_master(emp_id, leave_type,del_flg,availed_leaves,carry_forwarded,credited_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [emp_id, leave_type, 'N', availed_leaves_master, carry_forwarded, credited_leaves, emp_id, rcretime, emp_id, rcretime, year], function (err, done) {
                                            if (err) throw err;
                                        });
                                        console.log("Inserted into leave_master!!!!!!!!!!!!!");
                                       
                                    });

                                });
                            }
                            else {
                                console.log('please do it');
                                // total_leaves = parseFloat(availed_leaves_master) + parseFloat(availed_leaves);
                                // console.log('total_leaves value', total_leaves);

                                pool.query("update leave_master set availed_leaves = $1 , lchg_user_id = $2, lchg_time =$3 where year = $4 and emp_id = $5 and leave_type = $6 ", [availed_leaves_master, emp_id, rcretime, year, emp_id, leave_type], function (err, done) {
                                    if (err) throw err;
                                });
                            }

                            pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ", [emp_id], function (err, empResult) {
                                if (err) {
                                    console.error('Error with table query', err);
                                }
                                else {
                                    console.log("2  pick emp_email");
                                    employee_email = empResult.rows['0'].emp_email;
                                    console.log('employee_email: ', employee_email);
                                }

                                pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='HR'", function (err, hrMailList) {
                                    if (err) {
                                        console.error('Error with table query', err);
                                    }
                                    else {
                                        console.log("4  pick HR_email");
                                        var hrEmail = hrMailList.rows['0'].comm_code_desc;
                                        tempList = hrEmail + ',' + employee_email;
                                        console.log('tempList: ', tempList);
                                    }


                                    pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='INFO'", function (err, cmpyMailList) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        }
                                        else {
                                            console.log("5  pick Company Email");
                                            cmpyEmail = cmpyMailList.rows['0'].comm_code_desc;
                                            console.log('Company Email: ', cmpyEmail);
                                        }

                                    })


                                    pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ", [approver_id], function (err, managerMail) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        }
                                        else {
                                            console.log("6  pick Manager Email");
                                            rowData1 = managerMail.rows;
                                            managerMailId = rowData1[0].emp_email;
                                            console.log('managerMailId: ', managerMailId);
                                        }



                                        console.log("Ready to send mail");
                                        const transporter = nodemailer.createTransport({
                                            service: 'gmail',
                                            auth: {
                                                user: 'mohammadsab@minorks.com',
                                                pass: '9591788719'
                                            }
                                        });

                                        if (leave_type == "SL") {
                                            var leave_type1 = "Sick Leave";
                                        }
                                        if (leave_type == "ML") {
                                            var leave_type1 = "Maternity Leave";
                                        }
                                        if (sessiontyp == "FD") {
                                            var session1 = "FULL DAY";
                                            var sessiontime1 = "Session 1 - Session 2";
                                        }
                                        else {
                                            var session1 = "HALF DAY";

                                            if (sessiontime == "s1") {
                                                var sessiontime1 = "Session 1";
                                            }
                                            else {
                                                var sessiontime1 = "Session 2";
                                            }
                                        }

                                        var mailOptions = {
                                            from: cmpyEmail,
                                            to: managerMailId,
                                            cc: tempList,
                                            subject: 'Leave Requested',
                                            html: '<img src="https://www.theplanner.co.uk/sites/default/files/Web_Submitted_shutterstock_434614015.jpg" height="85"><br><br>' +
                                                '<h3> Submitted Leave Application Details for Managers Approval<br><br>' +
                                                '<table style="border: 10px solid black;"> ' +
                                                '<tr style="border: 10px solid black;"> ' +
                                                '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                '<th style="border: 10px solid black;">' + leave_type1 + '</th>' +
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
                                                '<th style="border: 10px solid black;">' + applNorDays + '</td> ' +
                                                '</tr>' +

                                                '<tr style="border: 10px solid black;"> ' +
                                                '<th style="border: 10px solid black;"> Reason </td> ' +
                                                '<th style="border: 10px solid black;">' + reason + '</td> ' +
                                                '</tr>' +

                                                '<tr style="border: 10px solid black;"> ' +
                                                '<th style="border: 10px solid black;"> Session Type </td> ' +
                                                '<th style="border: 10px solid black;">' + session1 + '</td> ' +
                                                '</tr>' +

                                                '<tr style="border: 10px solid black;"> ' +
                                                '<th style="border: 10px solid black;"> Session Time </td> ' +
                                                '<th style="border: 10px solid black;">' + sessiontime1 + '</td> ' +
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

                                    });

                                    pool.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)", [emp_id], function (err, emp_data) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        }
                                        else {
                                            emp_data_app = emp_data.rows;
                                        }


                                        pool.query("SELECT * from holidays where del_flg =$1", ['N'], function (err, holidayList) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            }
                                            else {
                                                holidayData = holidayList.rows;
                                            }
                                        });
                                    });

                                });
                            });
                        });


                        success = 'Leave request submitted successfully';

                    }
                    else {
                        res.json({ message: "Leave dates overlap please recheck" })
                    }
                });
            });
        });
    }



    ///////////////////////////////////////////////////////////////////////////////

    if (leave_type == "RL") {
        console.log("is rl");
        var leave_type1 = req.body.leave_type1;
        console.log("leave_type1", leave_type1);

        var res_leave = req.body.res_leave;
        console.log("res_leave", res_leave);

        var apply_to1 = req.body.apply_to1;
        console.log("apply_to1", apply_to1);

        var availed_leaves1 = req.body.availed_leaves1;
        console.log("availed_leaves1", availed_leaves1);

        var desc1 = req.body.desc1;
        console.log("desc1", desc1);

        var available_leaves1 = req.body.available_leaves1;
        console.log("available_leaves1", available_leaves1);


        if (res_leave != "B") {
            console.log("not birthday");

            var res_leave = req.body.res_leave;
            console.log("res_leave", res_leave);
            var res_leave = dateFormat(res_leave, "yyyy-mm-dd");
            console.log("res_leave", res_leave);

            // bcs restricted leave is only one day

            var from_date = res_leave;
            var to_date = res_leave;


            pool.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function (err, holidayList) {
                if (err) {
                    console.error('Error with table query', err);
                }
                else {
                    var holiday_list = holidayList.rows;
                    var holiday_count = holidayList.rowCount;
                }

                pool.query("SELECT * from leaves ", function (err, done) {
                    if (err) {
                        console.error('Error with table query', err);
                    }
                    else {
                        leave_id_value = done.rowCount;
                        console.log('leave_id_value', leave_id_value);
                        leave_id_value = leave_id_value + 100;
                        console.log('leave_id_value', leave_id_value);
                        leave_id = leave_id_value + 1;
                        console.log('leave_id', leave_id);
                    }


                    ////////////////////////////////////////


                    pool.query("select * from leaves where leave_type='RL' and emp_id =$1 and del_flg ='N' and year=$2", [emp_id, year], function (err, result) {
                        var rcount = result.rowCount;
                        console.log("rcountrl", rcount);

                        if (rcount < 2) {
                            var rest_leaves = parseFloat(available_leaves1) - parseFloat(availed_leaves1);
                            console.log('rest_leaves', rest_leaves);
                            var now = new Date();
                            var rcretime = now;
                            var year = now.getFullYear();
                            var leaveOverlapList_count = 0;
                            pool.query("select * from LEAVES where del_flg = $1 and emp_id =$2  and  ((from_date <= ($3) and to_date >= ($3)) or (from_date <= ($4) and to_date >= ($4))) and rej_flg= $5 and year=$6", ['N', emp_id, from_date, to_date, 'N', year], function (err, leaveOverlapList) {
                                if (err) {
                                    console.error('Error with table query', err);
                                }
                                else {
                                    leaveOverlapList_count = leaveOverlapList.rowCount;
                                    console.log('leaveOverlapList_count value', leaveOverlapList_count);
                                }

                                if (leaveOverlapList_count == 0) {

                                    pool.query("INSERT INTO leaves(leave_type, from_date,to_date, del_flg,availed_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, reason,approver_id, leave_id,emp_id,app_flg,rej_flg,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)", [leave_type1, from_date, to_date, 'N', availed_leaves1, emp_id, rcretime, emp_id, rcretime, desc1, apply_to1, leave_id, emp_id, 'N', 'N', year], function (err, done) {
                                        if (err) throw err;
                                    });


                                    pool.query("select * from leave_master where del_flg = $1 and emp_id =$2  and leave_type = $3 and year = $4 ", ['N', emp_id, leave_type1, year], function (err, leaveMasterList) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        }
                                        else {
                                            leaveMasterList_count = leaveMasterList.rowCount;
                                            if (leaveMasterList_count != 0) {
                                                availed_leaves_master = leaveMasterList.rows[0].availed_leaves;
                                            }
                                            else {
                                                availed_leaves_master = 0;
                                            }

                                            console.log('leaveMasterList_count value', leaveMasterList_count);
                                            console.log('availed_leaves_master value', availed_leaves_master);
                                        }

                                        if (leaveMasterList_count == 0) {

                                            pool.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2", [emp_id, 'N'], function (err, done) {
                                                if (err) {
                                                    console.error('Error with table query', err);
                                                }
                                                else {
                                                    carry_forwarded = 0;
                                                }

                                                console.log('carry_forwarded value', carry_forwarded);

                                                pool.query("select * from leave_config where del_flg = $1 and leave_type = $2 and year=$3", ['N', leave_type1, year], function (err, leaveConfigList) {
                                                    if (err) {
                                                        console.error('Error with table query', err);
                                                    }
                                                    else {
                                                        credited_leaves = leaveConfigList.body.allocated_leaves;
                                                        console.log('credited_leaves value', credited_leaves);
                                                    }

                                                    pool.query("INSERT INTO leave_master(emp_id, leave_type,del_flg,availed_leaves,carry_forwarded,credited_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [emp_id, leave_type1, 'N', availed_leaves1, carry_forwarded, credited_leaves, emp_id, rcretime, emp_id, rcretime, year], function (err, done) {
                                                        if (err) throw err;
                                                    });
                                                });

                                            });
                                        }
                                        else {

                                            console.log('please do it');
                                            total_leaves = parseFloat(availed_leaves_master) + parseFloat(availed_leaves);
                                            console.log('total_leaves value', total_leaves);

                                            pool.query("update leave_master set availed_leaves = $1 ,lchg_user_id = $2, lchg_time =$3 where year = $4 and emp_id = $5 and leave_type = $6 ", [total_leaves, emp_id, rcretime, year, emp_id, leave_type1], function (err, done) {
                                                if (err) throw err;
                                            });
                                        }

                                        pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ", [emp_id], function (err, empResult) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            }
                                            else {
                                                employee_email = empResult.rows['0'].emp_email;
                                                console.log('employee_email', employee_email);
                                            }


                                            pool.query("SELECT comm_code_desc from common_code_tbl where code_id='HR' and comm_code_id='HR'", function (err, hrMailList) {
                                                if (err) {
                                                    console.error('Error with table query', err);
                                                }
                                                else {
                                                    var hrEmail = hrMailList.rows['0'].comm_code_desc;

                                                    tempList = hrEmail + ',' + employee_email;
                                                    console.log('tempList', tempList);
                                                }


                                                pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ", [apply_to1], function (err, managerMail) {
                                                    if (err) {
                                                        console.error('Error with table query', err);
                                                    }
                                                    else {
                                                        rowData1 = managerMail.rows;
                                                        managerMailId = rowData1[0].emp_email;
                                                        console.log('managerMailId', managerMailId);
                                                    }

                                                    var smtpTransport = nodemailer.createTransport('SMTP', {
                                                        service: 'gmail',
                                                        auth:
                                                        {
                                                            user: 'amber@nurture.co.in',
                                                            pass: 'nurture@123'
                                                        }
                                                    });


                                                    var session = "FD";
                                                    if (session == "FD") {
                                                        var session = "FULL DAY";
                                                        var sessiontime = "Session 1 - Session 2";
                                                    }


                                                    var mailOptions = {
                                                        to: managerMailId,
                                                        cc: tempList,
                                                        from: 'amber@nurture.co.in',
                                                        subject: 'Leave Requested',
                                                        html: '<img src="https://www.theplanner.co.uk/sites/default/files/Web_Submitted_shutterstock_434614015.jpg" height="85"><br><br>' +
                                                            '<h3> Submitted Leave Application Details for Managers Approval<br><br>' +
                                                            '<table style="border: 10px solid black;"> ' +
                                                            '<tr style="border: 10px solid black;"> ' +
                                                            '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                            '<th style="border: 10px solid black;">' + leave_type1 + '</th>' +
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
                                                            '<th style="border: 10px solid black;">' + availed_leaves1 + '</td> ' +
                                                            '</tr>' +

                                                            '<tr style="border: 10px solid black;"> ' +
                                                            '<th style="border: 10px solid black;"> Reason </td> ' +
                                                            '<th style="border: 10px solid black;">' + reason + '</td> ' +
                                                            '</tr>' +

                                                            '<tr style="border: 10px solid black;"> ' +
                                                            '<th style="border: 10px solid black;"> Session Type </td> ' +
                                                            '<th style="border: 10px solid black;">' + session + '</td> ' +
                                                            '</tr>' +

                                                            '<tr style="border: 10px solid black;"> ' +
                                                            '<th style="border: 10px solid black;"> Session Time </td> ' +
                                                            '<th style="border: 10px solid black;">' + sessiontime + '</td> ' +
                                                            '</tr>' +
                                                            '</table> ' +
                                                            '<br><br>' +
                                                            'URL: http://amber.nurture.co.in <br><br><br>' +
                                                            '- Regards,<br><br>Amber</h3>'
                                                    };



                                                    smtpTransport.sendMail(mailOptions, function (err) {
                                                    });

                                                });

                                                pool.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)", [emp_id], function (err, emp_data) {
                                                    if (err) {
                                                        console.error('Error with table query', err);
                                                    }
                                                    else {
                                                        emp_data_app = emp_data.rows;
                                                    }


                                                    pool.query("SELECT * from holidays where del_flg =$1", ['N'], function (err, holidayList) {
                                                        if (err) {
                                                            console.error('Error with table query', err);
                                                        }
                                                        else {
                                                            holidayData = holidayList.rows;
                                                        }
                                                    });
                                                });
                                            });
                                        });
                                    });

                                    success = 'Leave request submitted successfully';
                                    res.render('requestModule/applyLeave', {
                                        emp_id: emp_id,
                                        emp_name: emp_name,
                                        emp_access: emp_access,
                                        no_of_leaves: rest_leaves,
                                        emp_data_app: emp_data_app,
                                        holidayData: holidayData,
                                        holiday_list: holiday_list,
                                        holiday_count: holiday_count,
                                        success: success
                                    });
                                }
                                else {
                                    req.flash('error', "Leave dates overlap please recheck")
                                    res.redirect('/requestModule/applyLeave/applyLeave');
                                }
                            });
                        }
                        else {
                            req.flash('error', "Restricted Leave Type already utilised for 2 days")
                            res.redirect('/requestModule/applyLeave/applyLeave');
                        }
                    });
                });
            });
        }
        else {
            console.log("Birthday");

            var leave_type1 = req.body.leave_type1;
            console.log("leave_type1", leave_type1);

            var res_leave = req.body.res_leave;
            console.log("res_leave", res_leave);

            var apply_to1 = req.body.apply_to1;
            console.log("apply_to1", apply_to1);

            var availed_leaves1 = req.body.availed_leaves1;
            console.log("availed_leaves1", availed_leaves1);

            var desc1 = req.body.desc1;
            console.log("desc1", desc1);

            var available_leaves1 = req.body.available_leaves1;
            console.log("available_leaves1", available_leaves1);


            pool.query("SELECT * from emp_info_tbl where emp_id = $1", [emp_id], function (err, result) {
                var mcount = result.rowCount;

                if (mcount == "0") {
                    req.flash('error', "Birthday data not available or Verification pending by the Admin")
                    res.redirect(req.get('referer'));
                }
                else {
                    console.log("Success Birthday");
                    pool.query("SELECT dob, emp_name, cast(dob + ((extract(year from age(dob)) + 1) * interval '1' year) as date) as next_birthday from emp_info_tbl where emp_id = $1 and del_flg = 'N' ", [emp_id], function (err, result) {

                        var res_leave = result.rows['0'].next_birthday;
                        var res_leave = dateFormat(res_leave, "yyyy-mm-dd");
                        console.log("res_leave", res_leave);

                        // bcs restricted leave is only one day

                        var from_date = res_leave;
                        var to_date = res_leave;


                        pool.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function (err, holidayList) {
                            if (err) {
                                console.error('Error with table query', err);
                            }
                            else {
                                var holiday_list = holidayList.rows;
                                var holiday_count = holidayList.rowCount;
                            }

                            pool.query("SELECT * from leaves ", function (err, done) {
                                if (err) {
                                    console.error('Error with table query', err);
                                }
                                else {
                                    leave_id_value = done.rowCount;
                                    console.log('leave_id_value', leave_id_value);
                                    leave_id_value = leave_id_value + 100;
                                    console.log('leave_id_value', leave_id_value);
                                    leave_id = leave_id_value + 1;
                                    console.log('leave_id', leave_id);
                                }


                                ////////////////////////////////////////


                                pool.query("select * from leaves where leave_type='RL' and emp_id=$1 and del_flg ='N' and year =$2", [emp_id, year], function (err, result) {
                                    var rcount = result.rowCount;
                                    if (rcount < 2) {
                                        var rest_leaves = parseFloat(available_leaves1) - parseFloat(availed_leaves1);
                                        console.log('rest_leaves', rest_leaves);
                                        var now = new Date();
                                        var rcretime = now;
                                        var year = now.getFullYear();

                                        pool.query("select * from LEAVES where del_flg = $1 and emp_id =$2  and  ((from_date <= ($3) and to_date >= ($3)) or (from_date <= ($4) and to_date >= ($4))) and rej_flg= $5 and year = $6", ['N', emp_id, from_date, to_date, 'N', year], function (err, leaveOverlapList) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            }
                                            else {
                                                leaveOverlapList_count = leaveOverlapList.rowCount;
                                                console.log('leaveOverlapList_count value', leaveOverlapList_count);
                                            }

                                            if (leaveOverlapList_count == 0) {

                                                pool.query("INSERT INTO leaves(leave_type, from_date,to_date, del_flg,availed_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, reason,approver_id, leave_id,emp_id,app_flg,rej_flg,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)", [leave_type1, from_date, to_date, 'N', availed_leaves1, emp_id, rcretime, emp_id, rcretime, desc1, apply_to1, leave_id, emp_id, 'N', 'N', year], function (err, done) {
                                                    if (err) throw err;
                                                });


                                                pool.query("select * from leave_master where del_flg = $1 and emp_id =$2  and leave_type = $3 and year = $4 ", ['N', emp_id, leave_type1, year], function (err, leaveMasterList) {
                                                    if (err) {
                                                        console.error('Error with table query', err);
                                                    }
                                                    else {
                                                        leaveMasterList_count = leaveMasterList.rowCount;
                                                        if (leaveMasterList_count != 0) {
                                                            availed_leaves_master = leaveMasterList.rows[0].availed_leaves;
                                                        }
                                                        else {
                                                            availed_leaves_master = 0;
                                                        }

                                                        console.log('leaveMasterList_count value', leaveMasterList_count);
                                                        console.log('availed_leaves_master value', availed_leaves_master);
                                                    }

                                                    if (leaveMasterList_count == 0) {

                                                        pool.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2", [emp_id, 'N'], function (err, done) {
                                                            if (err) {
                                                                console.error('Error with table query', err);
                                                            }
                                                            else {
                                                                carry_forwarded = 0;
                                                            }

                                                            console.log('carry_forwarded value', carry_forwarded);

                                                            pool.query("select * from leave_config where del_flg = $1 and leave_type = $2 and year=$3", ['N', leave_type1, year], function (err, leaveConfigList) {
                                                                if (err) {
                                                                    console.error('Error with table query', err);
                                                                }
                                                                else {
                                                                    credited_leaves = leaveConfigList.rows[0].allocated_leaves;
                                                                    console.log('credited_leaves value', credited_leaves);
                                                                }

                                                                pool.query("INSERT INTO leave_master(emp_id, leave_type,del_flg,availed_leaves,carry_forwarded,credited_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [emp_id, leave_type1, 'N', availed_leaves1, carry_forwarded, credited_leaves, emp_id, rcretime, emp_id, rcretime, year], function (err, done) {
                                                                    if (err) throw err;
                                                                });
                                                            });
                                                        });
                                                    }
                                                    else {

                                                        console.log('please do it');
                                                        total_leaves = parseFloat(availed_leaves_master) + parseFloat(availed_leaves);
                                                        console.log('total_leaves value', total_leaves);

                                                        pool.query("update  leave_master set availed_leaves = $1 , lchg_user_id = $2, lchg_time =$3 where year = $4 and emp_id = $5 and leave_type = $6 ", [total_leaves, emp_id, rcretime, year, emp_id, leave_type1], function (err, done) {
                                                            if (err) throw err;
                                                        });
                                                    }

                                                    pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ", [emp_id], function (err, empResult) {
                                                        if (err) {
                                                            console.error('Error with table query', err);
                                                        }
                                                        else {
                                                            employee_email = empResult.rows['0'].emp_email;
                                                            console.log('employee_email', employee_email);
                                                        }

                                                        pool.query("SELECT comm_code_desc from common_code_tbl where code_id='HR' and comm_code_id='HR'", function (err, hrMailList) {
                                                            if (err) {
                                                                console.error('Error with table query', err);
                                                            }
                                                            else {
                                                                var hrEmail = hrMailList.rows['0'].comm_code_desc;

                                                                tempList = hrEmail + ',' + employee_email;
                                                                console.log('tempList', tempList);
                                                            }

                                                            pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ", [apply_to1], function (err, managerMail) {
                                                                if (err) {
                                                                    console.error('Error with table query', err);
                                                                }
                                                                else {
                                                                    rowData1 = managerMail.rows;
                                                                    managerMailId = rowData1[0].emp_email;
                                                                    console.log('managerMailId', managerMailId);
                                                                }

                                                                var smtpTransport = nodemailer.createTransport('SMTP', {
                                                                    service: 'gmail',
                                                                    auth:
                                                                    {
                                                                        user: 'amber@nurture.co.in',
                                                                        pass: 'nurture@123'
                                                                    }
                                                                });

                                                                var session = "FD";
                                                                if (session == "FD") {
                                                                    var session = "FULL DAY";
                                                                    var sessiontime = "Session 1 - Session 2";
                                                                }


                                                                var mailOptions = {
                                                                    to: managerMailId,
                                                                    cc: tempList,
                                                                    from: 'amber@nurture.co.in',
                                                                    subject: 'Leave Requested',
                                                                    html: '<img src="https://www.theplanner.co.uk/sites/default/files/Web_Submitted_shutterstock_434614015.jpg" height="85"><br><br>' +
                                                                        '<h3> Submitted Leave Application Details for Managers Approval<br><br>' +
                                                                        '<table style="border: 10px solid black;"> ' +
                                                                        '<tr style="border: 10px solid black;"> ' +
                                                                        '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                                        '<th style="border: 10px solid black;">' + leave_type1 + '</th>' +
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
                                                                        '<th style="border: 10px solid black;">' + availed_leaves1 + '</td> ' +
                                                                        '</tr>' +

                                                                        '<tr style="border: 10px solid black;"> ' +
                                                                        '<th style="border: 10px solid black;"> Reason </td> ' +
                                                                        '<th style="border: 10px solid black;">' + reason + '</td> ' +
                                                                        '</tr>' +

                                                                        '<tr style="border: 10px solid black;"> ' +
                                                                        '<th style="border: 10px solid black;"> Session Type </td> ' +
                                                                        '<th style="border: 10px solid black;">' + session + '</td> ' +
                                                                        '</tr>' +

                                                                        '<tr style="border: 10px solid black;"> ' +
                                                                        '<th style="border: 10px solid black;"> Session Time </td> ' +
                                                                        '<th style="border: 10px solid black;">' + sessiontime + '</td> ' +
                                                                        '</tr>' +
                                                                        '</table> ' +
                                                                        '<br><br>' +
                                                                        'URL: http://amber.nurture.co.in <br><br><br>' +
                                                                        '- Regards,<br><br>Amber</h3>'
                                                                };

                                                                smtpTransport.sendMail(mailOptions, function (err) {
                                                                });

                                                            });

                                                            pool.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)", [emp_id], function (err, emp_data) {
                                                                if (err) {
                                                                    console.error('Error with table query', err);
                                                                }
                                                                else {
                                                                    emp_data_app = emp_data.rows;
                                                                }


                                                                pool.query("SELECT * from holidays where del_flg =$1", ['N'], function (err, holidayList) {
                                                                    if (err) {
                                                                        console.error('Error with table query', err);
                                                                    }
                                                                    else {
                                                                        holidayData = holidayList.rows;
                                                                    }
                                                                });
                                                            });
                                                        });
                                                    });
                                                });

                                                success = 'Leave request submitted successfully';
                                                res.render('requestModule/applyLeave', {
                                                    emp_id: emp_id,
                                                    emp_name: emp_name,
                                                    emp_access: emp_access,
                                                    no_of_leaves: rest_leaves,
                                                    emp_data_app: emp_data_app,
                                                    holidayData: holidayData,
                                                    holiday_list: holiday_list,
                                                    holiday_count: holiday_count,
                                                    success: success
                                                });
                                            }
                                            else {
                                                req.flash('error', "Leave dates overlap please recheck")
                                                res.redirect('/requestModule/applyLeave/applyLeave');
                                            }
                                        });
                                    }
                                    else {
                                        req.flash('error', "Restricted Leave Type already utilised for 2 days")
                                        res.redirect('/requestModule/applyLeave/applyLeave');
                                    }
                                });
                            });
                        });
                    });
                }

            });
        }
    }

};




function markpostLeave(req, res) {

    // console.log(req,"======================");

    var eid = req.body.user_id;
    console.log(eid);
    var ename = req.body.user_name;
    console.log(ename);

    var emp_id = req.body.item.employeeId;
    console.log("Employee ID: " + emp_id);

    var leave_type = req.body.item.leaveType;
    var sessionType = req.body.item.sessionType;
    var sessions = req.body.item.sessions;
    var from_date = req.body.item.fromDate;
    var to_date = req.body.item.toDate;
    var numofDays = req.body.item.appliedNoOfDays;
    var reason = req.body.item.reason;


    // var approver_id = req.body.apply_to;
    // var available_leaves = req.body.available_leaves;
    // var quater_leaves = req.body.quater_leaves;
    var borr_leaves = 0;
    // var session = req.body.session;
    // var sessiontime = req.body.sessiontime;
    // var tempList = '';
    // var carry_forwarded = '';
    var now = new Date();
    var rcretime = now;
    var year = now.getFullYear();

    if (leave_type == "EL") {
        console.log("el");


        pool.query("SELECT emp_name from emp_master_tbl where emp_id = $1 and del_flg ='N'", [emp_id], function (err, result) {
            if (err) {
                console.error('Error with table query', err);
            }
            else {
                var emp_name = result.rows[0].emp_name;
                console.log("emp_name", emp_name);
            }

            // var borr_leaves = req.body.borr_leaves;
            // console.log("before if borr_leaves", borr_leaves);

            // if (borr_leaves == 0) {
            //     var borr_leaves = parseFloat(quater_leaves) - parseFloat(availed_leaves);
            //     console.log("borr_leaves0", borr_leaves);
            // }
            // else {
            //     var borr_leaves = borr_leaves * -1;
            //     console.log("borr_leaves1", borr_leaves);
            // }

            pool.query("SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1  ", [emp_id], function (err, empResult) {
                if (err) {
                    console.error('Error with table query', err);
                }
                else {

                    approver_id = empResult.rows['0'].reporting_mgr;
                    console.log('Approver ID: ', approver_id);

                }




                pool.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function (err, holidayList) {
                    if (err) {
                        console.error('Error with table query', err);
                    }
                    else {
                        var holiday_list = holidayList.rows;
                        var holiday_count = holidayList.rowCount;
                    }

                    pool.query("SELECT * from leaves ", function (err, done) {
                        if (err) {
                            console.error('Error with table query', err);
                        }
                        else {
                            leave_id_value = done.rowCount;
                            console.log('leave_id_value', leave_id_value);
                            leave_id_value = leave_id_value + 100;
                            console.log('leave_id_value', leave_id_value);
                            leave_id = leave_id_value + 1;
                            console.log('leave_id', leave_id);
                        }

                        // var rest_leaves = parseFloat(available_leaves) - parseFloat(availed_leaves);
                        // console.log('rest_leaves', rest_leaves);
                        var now = new Date();
                        var rcretime = now;
                        var year = now.getFullYear();

                        pool.query("select * from LEAVES where del_flg = $1 and emp_id =$2  and  ((from_date <= ($3) and to_date >= ($3)) or (from_date <= ($4) and to_date >= ($4))) and rej_flg= $5 and year=$6", ['N', emp_id, from_date, to_date, 'N', year], function (err, leaveOverlapList) {
                            if (err) {
                                console.error('Error with table query', err);
                            }
                            else {
                                var leaveOverlapList_count = leaveOverlapList.rowCount;
                                console.log('leaveOverlapList_count value', leaveOverlapList_count);
                            }

                            if (leaveOverlapList_count == 0) {

                                pool.query("INSERT INTO leaves(leave_type, from_date,to_date, del_flg, availed_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, reason,approver_id, leave_id,emp_id,app_flg,rej_flg,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)", [leave_type, from_date, to_date, 'N', numofDays, eid, rcretime, eid, rcretime, reason, approver_id, leave_id, emp_id, 'P', 'N', year], function (err, done) {
                                    if (err) throw err;
                                    console.log("INSERTED TO LEAVES");
                                });


                                pool.query("select * from leave_master where del_flg = $1 and emp_id =$2 and leave_type = $3 and year = $4 ", ['N', emp_id, leave_type, year], function (err, leaveMasterList) {
                                    if (err) {
                                        console.error('Error with table query', err);
                                    }
                                    else {
                                        var leaveMasterList_count = leaveMasterList.rowCount;
                                        if (leaveMasterList_count != 0) {
                                            var availed_leaves_master = leaveMasterList.rows[0].availed_leaves;
                                        }
                                        else {
                                           var availed_leaves_master = 0;
                                        }

                                        console.log('leaveMasterList_count value', leaveMasterList_count);
                                        console.log('availed_leaves_master value', availed_leaves_master);
                                    }

                                    if (leaveMasterList_count == 0) {
                                        console.log("0");

                                        pool.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2", [emp_id, 'N'], function (err, done) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            }
                                            else {
                                                carry_forwarded = 0;
                                            }

                                            console.log('carry_forwarded value', carry_forwarded);

                                            pool.query("select * from leave_config where del_flg = $1 and leave_type = $2 and year=$3", ['N', leave_type, year], function (err, leaveConfigList) {
                                                if (err) {
                                                    console.error('Error with table query', err);
                                                }
                                                else {
                                                    credited_leaves = leaveConfigList.rows[0].allocated_leaves;
                                                    console.log('credited_leaves value', credited_leaves);
                                                }
                                                pool.query("INSERT INTO leave_master(emp_id, leave_type,del_flg,availed_leaves,carry_forwarded,credited_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, year, quaterly_leave) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",
                                                    [emp_id, leave_type, 'N', '0', carry_forwarded, credited_leaves, eid, rcretime, eid, rcretime, year, borr_leaves], function (err, done) {
                                                        if (err) throw err;
                                                    });
                                            });

                                        });
                                    }
                                    else {

                                        console.log('please do it');
                                        // total_leaves = parseFloat(availed_leaves_master) - parseFloat(numofDays);
                                        // console.log('total_leaves value', total_leaves);

                                        pool.query("update leave_master set availed_leaves = $1,lchg_user_id = $2,lchg_time =$3,quaterly_leave =$6 where year = $4 and emp_id = $5 and leave_type = $7 ", [availed_leaves_master, eid, rcretime, year, emp_id, borr_leaves, leave_type], function (err, done) {
                                            if (err) throw err;
                                        });
                                    }

                                    pool.query("SELECT emp_email,reporting_mgr FROM emp_master_tbl where emp_id =$1  ", [emp_id], function (err, empResult) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        }
                                        else {
                                            console.log("1  pick Emp_email");
                                            employee_email = empResult.rows['0'].emp_email;
                                            console.log('Employee_email', employee_email);

                                            approver_id = empResult.rows['0'].reporting_mgr;
                                            console.log('Approver ID: ', approver_id);

                                        }

                                        pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='HR'", function (err, hrMailList) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            }
                                            else {
                                                console.log("2  pick HR_email");
                                                var hrEmail = hrMailList.rows['0'].comm_code_desc;
                                                tempList = hrEmail + ',' + employee_email;
                                                console.log('tempList: ', tempList);
                                            }


                                            pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='INFO'", function (err, cmpyMailList) {
                                                if (err) {
                                                    console.error('Error with table query', err);
                                                }
                                                else {
                                                    console.log("3  pick Company Email");
                                                    var cmpyEmail = cmpyMailList.rows['0'].comm_code_desc;
                                                    console.log('Company Email: ', cmpyEmail);
                                                }

                                            


                                            pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ", [approver_id], function (err, managerMail) {
                                                if (err) {
                                                    console.error('Error with table query', err);
                                                }
                                                else {
                                                    console.log("4  pick Manager Email");
                                                    rowData1 = managerMail.rows;
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

                                                if (leave_type == "EL") {
                                                    var leave_type1 = "Annual Leave";
                                                }

                                                if (sessionType == "FD") {
                                                    var session = "FULL DAY";
                                                    var sessiontime = "Session 1 - Session 2";
                                                }
                                                else {
                                                    var session = "HALF DAY";

                                                    if (sessions == "s1") {
                                                        var sessiontime = "Session 1";
                                                    }
                                                    else {
                                                        var sessiontime = "Session 2";
                                                    }
                                                }


                                                var mailOptions = {
                                                    from: cmpyEmail,
                                                    to: managerMailId,
                                                    cc: tempList,
                                                    subject: 'Marked Leave Notification',
                                                    html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQri5Z0Jek6mmeJGUIXq9IgTcdMWcDdcY1iJvswJx2GdSd64-lN" height="85"><br><br>' +
                                                        '<h3>Marked Leave Application Details by HR<br><br>' +
                                                        '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                        '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                        '<th style="border: 10px solid black;">' + leave_type1 + '</th>' +
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
                                                        '<th style="border: 10px solid black;">' + numofDays + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                        '<th style="border: 10px solid black;"> Reason </td> ' +
                                                        '<th style="border: 10px solid black;">' + reason + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                        '<th style="border: 10px solid black;"> Session Type </td> ' +
                                                        '<th style="border: 10px solid black;">' + session + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                        '<th style="border: 10px solid black;"> Session Time </td> ' +
                                                        '<th style="border: 10px solid black;">' + sessiontime + '</td> ' +
                                                        '</tr>' +
                                                        '</table> ' +
                                                        '<br><br>' +
                                                        'URL: http://amber.nurture.co.in <br><br>' +
                                                        'This Leave has been approved by HR , In case of clarification/concern please contact HR(Usha) for more Info.<br><br><br>' +
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


                                            });
                                        });
                                            pool.query("select emp_id,emp_name from emp_master_tbl where emp_id in(SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)", [emp_id], function (err, emp_data) {
                                                if (err) {
                                                    console.error('Error with table query', err);
                                                }
                                                else {
                                                    emp_data_app = emp_data.rows;
                                                }


                                                pool.query("SELECT * from holidays where del_flg =$1", ['N'], function (err, holidayList) {
                                                    if (err) {
                                                        console.error('Error with table query', err);
                                                    }
                                                    else {
                                                        holidayData = holidayList.rows;
                                                    }
                                                });
                                            });

                                        });
                                    });
                                });

                                success = 'Marked successfully';

                                res.json({ message: "Leave Marked successfully" })
                            }
                            else {
                                res.json({ message: "Leave dates overlap please recheck" });
                            }
                        });
                    });
                });
            });
        });
    }


    if ((leave_type != "EL") && (leave_type != "RL")) {
        console.log("not el and rl");


        pool.query("SELECT emp_name from emp_master_tbl where emp_id = $1 and del_flg ='N'", [emp_id], function (err, result) {
            if (err) {
                console.error('Error with table query', err);
            }
            else {
                var emp_name = result.rows[0].emp_name;
                console.log("emp_name", emp_name);
            }

            // var borr_leaves = req.body.borr_leaves;
            // console.log("before if borr_leaves", borr_leaves);

            // if (borr_leaves == 0) {
            //     var borr_leaves = parseFloat(quater_leaves) - parseFloat(availed_leaves);
            //     console.log("borr_leaves0", borr_leaves);
            // }
            // else {
            //     var borr_leaves = borr_leaves * -1;
            //     console.log("borr_leaves1", borr_leaves);
            // }

            pool.query("SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1  ", [emp_id], function (err, empResult) {
                if (err) {
                    console.error('Error with table query', err);
                }
                else {

                    approver_id = empResult.rows['0'].reporting_mgr;
                    console.log('Approver ID: ', approver_id);

                }




                pool.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function (err, holidayList) {
                    if (err) {
                        console.error('Error with table query', err);
                    }
                    else {
                        var holiday_list = holidayList.rows;
                        var holiday_count = holidayList.rowCount;
                    }

                    pool.query("SELECT * from leaves ", function (err, done) {
                        if (err) {
                            console.error('Error with table query', err);
                        }
                        else {
                            leave_id_value = done.rowCount;
                            console.log('leave_id_value', leave_id_value);
                            leave_id_value = leave_id_value + 100;
                            console.log('leave_id_value', leave_id_value);
                            leave_id = leave_id_value + 1;
                            console.log('leave_id', leave_id);
                        }

                        // var rest_leaves = parseFloat(available_leaves) - parseFloat(availed_leaves);
                        // console.log('rest_leaves', rest_leaves);
                        var now = new Date();
                        var rcretime = now;
                        var year = now.getFullYear();

                        pool.query("select * from LEAVES where del_flg = $1 and emp_id =$2  and  ((from_date <= ($3) and to_date >= ($3)) or (from_date <= ($4) and to_date >= ($4))) and rej_flg= $5 and year=$6", ['N', emp_id, from_date, to_date, 'N', year], function (err, leaveOverlapList) {
                            if (err) {
                                console.error('Error with table query', err);
                            }
                            else {
                                var leaveOverlapList_count = leaveOverlapList.rowCount;
                                console.log('leaveOverlapList_count value', leaveOverlapList_count);
                            }

                            if (leaveOverlapList_count == 0) {

                                pool.query("INSERT INTO leaves(leave_type, from_date,to_date, del_flg, availed_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, reason,approver_id, leave_id,emp_id,app_flg,rej_flg,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)", [leave_type, from_date, to_date, 'N', numofDays, eid, rcretime, eid, rcretime, reason, approver_id, leave_id, emp_id, 'P', 'N', year], function (err, done) {
                                    if (err) throw err;
                                    console.log("INSERTED TO LEAVES");
                                });


                                pool.query("select * from leave_master where del_flg = $1 and emp_id =$2 and leave_type = $3 and year = $4 ", ['N', emp_id, leave_type, year], function (err, leaveMasterList) {
                                    if (err) {
                                        console.error('Error with table query', err);
                                    }
                                    else {
                                        var leaveMasterList_count = leaveMasterList.rowCount;
                                        if (leaveMasterList_count != 0) {
                                           var  availed_leaves_master = leaveMasterList.rows[0].availed_leaves;
                                           
                                        }
                                        else {
                                            var availed_leaves_master = 0;
                                        }

                                        console.log('leaveMasterList_count value', leaveMasterList_count);
                                        console.log('availed_leaves_master value', availed_leaves_master);
                                    }

                                    if (leaveMasterList_count == 0) {
                                        console.log("0");

                                        pool.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2", [emp_id, 'N'], function (err, done) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            }
                                            else {
                                                carry_forwarded = 0;
                                            }

                                            console.log('carry_forwarded value', carry_forwarded);

                                            pool.query("select * from leave_config where del_flg = $1 and leave_type = $2 and year=$3", ['N', leave_type, year], function (err, leaveConfigList) {
                                                if (err) {
                                                    console.error('Error with table query', err);
                                                }
                                                else {
                                                    credited_leaves = leaveConfigList.rows[0].allocated_leaves;
                                                    console.log('credited_leaves value', credited_leaves);
                                                }
                                                pool.query("INSERT INTO leave_master(emp_id, leave_type,del_flg,availed_leaves,carry_forwarded,credited_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, year, quaterly_leave) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)",
                                                    [emp_id, leave_type, 'N', '0', carry_forwarded, credited_leaves, eid, rcretime, eid, rcretime, year, borr_leaves], function (err, done) {
                                                        if (err) throw err;
                                                    });
                                            });

                                        });
                                    }
                                    else {

                                        console.log('please do it');
                                        // total_leaves = parseFloat(availed_leaves_master) - parseFloat(numofDays);
                                        // console.log('total_leaves value', total_leaves);

                                        pool.query("update leave_master set availed_leaves = $1,lchg_user_id = $2,lchg_time =$3,quaterly_leave =$6 where year = $4 and emp_id = $5 and leave_type = $7 ", [availed_leaves_master, eid, rcretime, year, emp_id, borr_leaves, leave_type], function (err, done) {
                                            if (err) throw err;
                                        });
                                    }

                                    pool.query("SELECT emp_email,reporting_mgr FROM emp_master_tbl where emp_id =$1  ", [emp_id], function (err, empResult) {
                                        if (err) {
                                            console.error('Error with table query', err);
                                        }
                                        else {
                                            console.log("1  pick Emp_email");
                                            employee_email = empResult.rows['0'].emp_email;
                                            console.log('Employee_email', employee_email);

                                            approver_id = empResult.rows['0'].reporting_mgr;
                                            console.log('Approver ID: ', approver_id);

                                        }

                                        pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='HR'", function (err, hrMailList) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            }
                                            else {
                                                console.log("2  pick HR_email");
                                                var hrEmail = hrMailList.rows['0'].comm_code_desc;
                                                tempList = hrEmail + ',' + employee_email;
                                                console.log('tempList: ', tempList);
                                            }


                                            pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='INFO'", function (err, cmpyMailList) {
                                                if (err) {
                                                    console.error('Error with table query', err);
                                                }
                                                else {
                                                    console.log("3  pick Company Email");
                                                    var cmpyEmail = cmpyMailList.rows['0'].comm_code_desc;
                                                    console.log('Company Email: ', cmpyEmail);
                                                }

                                            


                                            pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ", [approver_id], function (err, managerMail) {
                                                if (err) {
                                                    console.error('Error with table query', err);
                                                }
                                                else {
                                                    console.log("4  pick Manager Email");
                                                    rowData1 = managerMail.rows;
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

                                                if (leave_type == "SL") {
                                                    var leave_type1 = "Sick Leave";
                                                }
                                                if (leave_type == "ML") {
                                                    var leave_type1 = "Maternity Leave";
                                                }

                                                if (sessionType == "FD") {
                                                    var session = "FULL DAY";
                                                    var sessiontime = "Session 1 - Session 2";
                                                }
                                                else {
                                                    var session = "HALF DAY";

                                                    if (sessions == "s1") {
                                                        var sessiontime = "Session 1";
                                                    }
                                                    else {
                                                        var sessiontime = "Session 2";
                                                    }
                                                }


                                                var mailOptions = {
                                                    from: cmpyEmail,
                                                    to: managerMailId,
                                                    cc: tempList,
                                                    subject: 'Marked Leave Notification',
                                                    html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQri5Z0Jek6mmeJGUIXq9IgTcdMWcDdcY1iJvswJx2GdSd64-lN" height="85"><br><br>' +
                                                        '<h3>Marked Leave Application Details by HR<br><br>' +
                                                        '<table style="border: 10px solid black;"> ' +
                                                        '<tr style="border: 10px solid black;"> ' +
                                                        '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                        '<th style="border: 10px solid black;">' + leave_type1 + '</th>' +
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
                                                        '<th style="border: 10px solid black;">' + numofDays + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                        '<th style="border: 10px solid black;"> Reason </td> ' +
                                                        '<th style="border: 10px solid black;">' + reason + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                        '<th style="border: 10px solid black;"> Session Type </td> ' +
                                                        '<th style="border: 10px solid black;">' + session + '</td> ' +
                                                        '</tr>' +

                                                        '<tr style="border: 10px solid black;"> ' +
                                                        '<th style="border: 10px solid black;"> Session Time </td> ' +
                                                        '<th style="border: 10px solid black;">' + sessiontime + '</td> ' +
                                                        '</tr>' +
                                                        '</table> ' +
                                                        '<br><br>' +
                                                        'URL: http://amber.nurture.co.in <br><br>' +
                                                        'This Leave has been approved by HR , In case of clarification/concern please contact HR(Usha) for more Info.<br><br><br>' +
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


                                            });
                                        });
                                            pool.query("select emp_id,emp_name from emp_master_tbl where emp_id in(SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)", [emp_id], function (err, emp_data) {
                                                if (err) {
                                                    console.error('Error with table query', err);
                                                }
                                                else {
                                                    emp_data_app = emp_data.rows;
                                                }


                                                pool.query("SELECT * from holidays where del_flg =$1", ['N'], function (err, holidayList) {
                                                    if (err) {
                                                        console.error('Error with table query', err);
                                                    }
                                                    else {
                                                        holidayData = holidayList.rows;
                                                    }
                                                });
                                            });

                                        });
                                    });
                                });

                                success = 'Marked successfully';

                                res.json({ message: "Leave Marked successfully" })
                            }
                            else {
                                res.json({ message: "Leave dates overlap please recheck" });
                            }
                        });
                    });
                });
            });
        });
    }

    if (leave_type == "RL") {
        console.log("is rl");
        var leave_type1 = req.body.leave_type1;
        console.log("leave_type1", leave_type1);

        var res_leave = req.body.res_leave;
        console.log("res_leave", res_leave);

        var apply_to1 = req.body.apply_to1;
        console.log("apply_to1", apply_to1);
        var availed_leaves1 = req.body.availed_leaves1;
        console.log("availed_leaves1", availed_leaves1);

        var desc1 = req.body.desc1;
        console.log("desc1", desc1);

        var available_leaves1 = req.body.available_leaves1;
        console.log("available_leaves1", available_leaves1);


        if (res_leave != "B") {
            console.log("not birthday");

            var emp_id1 = req.body.emp_id1;
            console.log("emp_id1", emp_id1);

            pool.query("SELECT emp_name from emp_master_tbl where emp_id = $1 and del_flg ='N'", [emp_id1], function (err, result) {
                if (err) {
                    console.error('Error with table query', err);
                }
                else {
                    var emp_name = result.rows[0].emp_name;
                }


                var res_leave = req.body.res_leave;
                console.log("res_leave", res_leave);
                var res_leave = dateFormat(res_leave, "yyyy-mm-dd");
                console.log("res_leave", res_leave);

                // bcs restricted leave is only one day

                var from_date = res_leave;
                var to_date = res_leave;


                pool.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function (err, holidayList) {
                    if (err) {
                        console.error('Error with table query', err);
                    }
                    else {
                        var holiday_list = holidayList.rows;
                        var holiday_count = holidayList.rowCount;
                    }

                    pool.query("SELECT * from leaves ", function (err, done) {
                        if (err) {
                            console.error('Error with table query', err);
                        }
                        else {
                            leave_id_value = done.rowCount;
                            console.log('leave_id_value', leave_id_value);
                            leave_id_value = leave_id_value + 100;
                            console.log('leave_id_value', leave_id_value);
                            leave_id = leave_id_value + 1;
                            console.log('leave_id', leave_id);
                        }


                        ////////////////////////////////////////


                        pool.query("select * from leaves where leave_type='RL' and emp_id =$1 and del_flg ='N' and year=$2", [emp_id1, year], function (err, result) {
                            var rcount = result.rowCount;

                            if (rcount < 2) {
                                var rest_leaves = parseFloat(available_leaves1) - parseFloat(availed_leaves1);
                                console.log('rest_leaves', rest_leaves);
                                var now = new Date();
                                var rcretime = now;
                                var year = now.getFullYear();

                                pool.query("select * from LEAVES where del_flg = $1 and emp_id =$2  and  ((from_date <= ($3) and to_date >= ($3)) or (from_date <= ($4) and to_date >= ($4))) and rej_flg= $5 and year=$6", ['N', emp_id1, from_date, to_date, 'N', year], function (err, leaveOverlapList) {
                                    if (err) {
                                        console.error('Error with table query', err);
                                    }
                                    else {
                                        leaveOverlapList_count = leaveOverlapList.rowCount;
                                        console.log('leaveOverlapList_count value', leaveOverlapList_count);
                                    }

                                    if (leaveOverlapList_count == 0) {
                                        pool.query("INSERT INTO leaves(leave_type, from_date,to_date, del_flg,availed_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, reason,approver_id, leave_id,emp_id,app_flg,rej_flg,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)", [leave_type1, from_date, to_date, 'N', availed_leaves1, eid, rcretime, eid, rcretime, desc1, apply_to1, leave_id, emp_id1, 'Y', 'N', year], function (err, done) {
                                            if (err) throw err;
                                        });


                                        pool.query("select * from leave_master where del_flg = $1 and emp_id =$2  and leave_type = $3 and year = $4 ", ['N', emp_id1, leave_type1, year], function (err, leaveMasterList) {
                                            if (err) {
                                                console.error('Error with table query', err);
                                            }
                                            else {
                                                leaveMasterList_count = leaveMasterList.rowCount;
                                                if (leaveMasterList_count != 0) {
                                                    availed_leaves_master = leaveMasterList.rows[0].availed_leaves;
                                                }
                                                else {
                                                    availed_leaves_master = 0;
                                                }

                                                console.log('leaveMasterList_count value', leaveMasterList_count);
                                                console.log('availed_leaves_master value', availed_leaves_master);
                                            }

                                            if (leaveMasterList_count == 0) {

                                                pool.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2", [emp_id1, 'N'], function (err, done) {
                                                    if (err) {
                                                        console.error('Error with table query', err);
                                                    }
                                                    else {
                                                        carry_forwarded = 0;
                                                    }

                                                    console.log('carry_forwarded value', carry_forwarded);

                                                    pool.query("select * from leave_config where del_flg = $1 and leave_type = $2 and year=$3", ['N', leave_type1, year], function (err, leaveConfigList) {
                                                        if (err) {
                                                            console.error('Error with table query', err);
                                                        }
                                                        else {
                                                            credited_leaves = leaveConfigList.rows[0].allocated_leaves;
                                                            console.log('credited_leaves value', credited_leaves);
                                                        }

                                                        pool.query("INSERT INTO leave_master(emp_id, leave_type,del_flg,availed_leaves,carry_forwarded,credited_leaves, rcre_user_id,rcre_time,lchg_user_id, lchg_time,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [emp_id1, leave_type1, 'N', availed_leaves1, carry_forwarded, credited_leaves, eid, rcretime, eid, rcretime, year], function (err, done) {
                                                            if (err) throw err;
                                                        });
                                                    });

                                                });
                                            }
                                            else {

                                                console.log('please do it');
                                                total_leaves = parseFloat(availed_leaves_master) + parseFloat(availed_leaves);
                                                console.log('total_leaves value', total_leaves);

                                                pool.query("update leave_master set availed_leaves = $1 ,lchg_user_id = $2, lchg_time =$3 where year = $4 and emp_id = $5 and leave_type = $6 ", [total_leaves, eid, rcretime, year, emp_id1, leave_type1], function (err, done) {
                                                    if (err) throw err;
                                                });
                                            }

                                            pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1", [emp_id1], function (err, empResult) {
                                                if (err) {
                                                    console.error('Error with table query', err);
                                                }
                                                else {
                                                    employee_email = empResult.rows['0'].emp_email;
                                                    console.log('employee_email', employee_email);
                                                }


                                                pool.query("SELECT comm_code_desc from common_code_tbl where code_id='HR' and comm_code_id='HR'", function (err, hrMailList) {
                                                    if (err) {
                                                        console.error('Error with table query', err);
                                                    }
                                                    else {
                                                        var hrEmail = hrMailList.rows['0'].comm_code_desc;

                                                        tempList = hrEmail + ',' + employee_email;
                                                        console.log('tempList', tempList);
                                                    }


                                                    pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1", [apply_to1], function (err, managerMail) {
                                                        if (err) {
                                                            console.error('Error with table query', err);
                                                        }
                                                        else {
                                                            rowData1 = managerMail.rows;
                                                            managerMailId = rowData1[0].emp_email;
                                                            console.log('managerMailId', managerMailId);
                                                        }

                                                        var smtpTransport = nodemailer.createTransport('SMTP', {
                                                            service: 'gmail',
                                                            auth:
                                                            {
                                                                user: 'amber@nurture.co.in',
                                                                pass: 'nurture@123'
                                                            }
                                                        });

                                                        var mailOptions = {
                                                            to: managerMailId,
                                                            cc: tempList,
                                                            from: 'amber@nurture.co.in',
                                                            subject: 'Marked Leave Notification',
                                                            html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQri5Z0Jek6mmeJGUIXq9IgTcdMWcDdcY1iJvswJx2GdSd64-lN" height="85"><br><br>' +
                                                                '<h3>Marked Leave Application Details by HR<br><br>' +
                                                                '<table style="border: 10px solid black;"> ' +
                                                                '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                                '<th style="border: 10px solid black;">' + leave_type1 + '</th>' +
                                                                '</tr>' +

                                                                '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Employee Name </td> ' +
                                                                '<th style="border: 10px solid black;">' + emp_name + '</td> ' +
                                                                '</tr>' +

                                                                '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;">Employee ID</th> ' +
                                                                '<th style="border: 10px solid black;">' + emp_id1 + '</th>' +

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
                                                                '<th style="border: 10px solid black;">' + availed_leaves1 + '</td> ' +
                                                                '</tr>' +

                                                                '<tr style="border: 10px solid black;"> ' +
                                                                '<th style="border: 10px solid black;"> Reason </td> ' +
                                                                '<th style="border: 10px solid black;">' + reason + '</td> ' +
                                                                '</tr>' +
                                                                '</table> ' +
                                                                '<br><br>' +
                                                                'URL: http://amber.nurture.co.in <br><br>' +
                                                                'This Leave has been approved by HR , In case of clarification/concern please contact HR(Usha) for more Info.<br><br><br>' +
                                                                '- Regards,<br><br>Amber</h3>'
                                                        };


                                                        smtpTransport.sendMail(mailOptions, function (err) {
                                                        });

                                                    });

                                                    pool.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)", [emp_id1], function (err, emp_data) {
                                                        if (err) {
                                                            console.error('Error with table query', err);
                                                        }
                                                        else {
                                                            emp_data_app = emp_data.rows;
                                                        }


                                                        pool.query("SELECT * from holidays where del_flg =$1", ['N'], function (err, holidayList) {
                                                            if (err) {
                                                                console.error('Error with table query', err);
                                                            }
                                                            else {
                                                                holidayData = holidayList.rows;
                                                            }
                                                        });
                                                    });
                                                });
                                            });
                                        });

                                        req.flash('success', "Leave request submitted successfully")
                                        res.redirect(req.get('referer'));
                                    }
                                    else {
                                        req.flash('error', "Leave dates overlap please recheck")
                                        res.redirect(req.get('referer'));
                                    }
                                });
                            }
                            else {
                                req.flash('error', "Restricted Leave Type already utilised for 2 days")
                                res.redirect(req.get('referer'));
                            }
                        });
                    });
                });
            });
        }
        else {
            console.log("Birthday");
            var leave_type1 = req.body.leave_type1;
            console.log("leave_type1", leave_type1);

            var res_leave = req.body.res_leave;
            console.log("res_leave", res_leave);

            var apply_to1 = req.body.apply_to1;
            console.log("apply_to1", apply_to1);

            var availed_leaves1 = req.body.availed_leaves1;
            console.log("availed_leaves1", availed_leaves1);

            var desc1 = req.body.desc1;
            console.log("desc1", desc1);

            var available_leaves1 = req.body.available_leaves1;
            console.log("available_leaves1", available_leaves1);

            var emp_id1 = req.body.emp_id1;
            console.log("emp_id1", emp_id1);


            pool.query("SELECT emp_name from emp_master_tbl where emp_id = $1 and del_flg ='N'", [emp_id1], function (err, result) {
                if (err) {
                    console.error('Error with table query', err);
                }
                else {
                    var emp_name = result.rows[0].emp_name;
                }


                pool.query("SELECT * from emp_info_tbl where emp_id = $1", [emp_id1], function (err, result) {
                    var mcount = result.rowCount;

                    if (mcount == "0") {
                        req.flash('error', "Birthday data not available or Verification pending by the Admin")
                        res.redirect(req.get('referer'));
                    }
                    else {
                        console.log("Success Birthday");
                        pool.query("SELECT dob, emp_name, cast(dob + ((extract(year from age(dob)) + 1) * interval '1' year) as date) as next_birthday from emp_info_tbl where emp_id = $1 and del_flg = 'N'", [emp_id1], function (err, result) {

                            var res_leave = result.rows['0'].next_birthday;
                            var res_leave = dateFormat(res_leave, "yyyy-mm-dd");
                            console.log("res_leave", res_leave);

                            // bcs restricted leave is only one day
                            var from_date = res_leave;
                            var to_date = res_leave;


                            pool.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('O') order by sel_date asc", function (err, holidayList) {
                                if (err) {
                                    console.error('Error with table query', err);
                                }
                                else {
                                    var holiday_list = holidayList.rows;
                                    var holiday_count = holidayList.rowCount;
                                }

                                pool.query("SELECT * from leaves ", function (err, done) {
                                    if (err) {
                                        console.error('Error with table query', err);
                                    }
                                    else {
                                        leave_id_value = done.rowCount;
                                        console.log('leave_id_value', leave_id_value);
                                        leave_id_value = leave_id_value + 100;
                                        console.log('leave_id_value', leave_id_value);
                                        leave_id = leave_id_value + 1;
                                        console.log('leave_id', leave_id);
                                    }


                                    ////////////////////////////////////////


                                    pool.query("select * from leaves where leave_type='RL' and del_flg ='N' and emp_id =$1 and year =$2", [emp_id1, year], function (err, result) {
                                        var rcount = result.rowCount;
                                        if (rcount < 2) {
                                            var rest_leaves = parseFloat(available_leaves1) - parseFloat(availed_leaves1);
                                            console.log('rest_leaves', rest_leaves);
                                            var now = new Date();
                                            var rcretime = now;
                                            var year = now.getFullYear();

                                            pool.query("select * from LEAVES where del_flg = $1 and emp_id =$2  and  ((from_date <= ($3) and to_date >= ($3)) or (from_date <= ($4) and to_date >= ($4))) and rej_flg= $5 and year = $6", ['N', emp_id1, from_date, to_date, 'N', year], function (err, leaveOverlapList) {
                                                if (err) {
                                                    console.error('Error with table query', err);
                                                }
                                                else {
                                                    leaveOverlapList_count = leaveOverlapList.rowCount;
                                                    console.log('leaveOverlapList_count value', leaveOverlapList_count);
                                                }

                                                if (leaveOverlapList_count == 0) {

                                                    pool.query("INSERT INTO leaves(leave_type, from_date,to_date, del_flg,availed_leaves, rcre_user_id, rcre_time, lchg_user_id, lchg_time, reason,approver_id, leave_id,emp_id,app_flg,rej_flg,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)", [leave_type1, from_date, to_date, 'N', availed_leaves1, eid, rcretime, eid, rcretime, desc1, apply_to1, leave_id, emp_id1, 'Y', 'N', year], function (err, done) {
                                                        if (err) throw err;
                                                    });


                                                    pool.query("select * from leave_master where del_flg = $1 and emp_id =$2  and leave_type = $3 and year = $4 ", ['N', emp_id1, leave_type1, year], function (err, leaveMasterList) {
                                                        if (err) {
                                                            console.error('Error with table query', err);
                                                        }
                                                        else {
                                                            leaveMasterList_count = leaveMasterList.rowCount;
                                                            if (leaveMasterList_count != 0) {
                                                                availed_leaves_master = leaveMasterList.rows[0].availed_leaves;
                                                            }
                                                            else {
                                                                availed_leaves_master = 0;
                                                            }

                                                            console.log('leaveMasterList_count value', leaveMasterList_count);
                                                            console.log('availed_leaves_master value', availed_leaves_master);
                                                        }

                                                        if (leaveMasterList_count == 0) {

                                                            pool.query("SELECT * from emp_info_tbl where emp_id =$1 and del_flg=$2", [emp_id1, 'N'], function (err, done) {
                                                                if (err) {
                                                                    console.error('Error with table query', err);
                                                                }
                                                                else {
                                                                    carry_forwarded = 0;
                                                                }

                                                                console.log('carry_forwarded value', carry_forwarded);

                                                                pool.query("select * from leave_config where del_flg = $1 and leave_type = $2 and year=$3", ['N', leave_type1, year], function (err, leaveConfigList) {
                                                                    if (err) {
                                                                        console.error('Error with table query', err);
                                                                    }
                                                                    else {
                                                                        credited_leaves = leaveConfigList.rows[0].allocated_leaves;
                                                                        console.log('credited_leaves value', credited_leaves);
                                                                    }

                                                                    pool.query("INSERT INTO leave_master(emp_id, leave_type,del_flg,availed_leaves,carry_forwarded,credited_leaves,rcre_user_id,rcre_time,lchg_user_id,lchg_time,year) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [emp_id1, leave_type1, 'N', availed_leaves1, carry_forwarded, credited_leaves, eid, rcretime, eid, rcretime, year], function (err, done) {
                                                                        if (err) throw err;
                                                                    });
                                                                });
                                                            });
                                                        }
                                                        else {

                                                            console.log('please do it');
                                                            total_leaves = parseFloat(availed_leaves_master) + parseFloat(availed_leaves);
                                                            console.log('total_leaves value', total_leaves);

                                                            pool.query("update  leave_master set availed_leaves = $1 , lchg_user_id = $2, lchg_time =$3 where year = $4 and emp_id = $5 and leave_type = $6 ", [total_leaves, eid, rcretime, year, emp_id1, leave_type1], function (err, done) {
                                                                if (err) throw err;
                                                            });
                                                        }

                                                        pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1", [emp_id1], function (err, empResult) {
                                                            if (err) {
                                                                console.error('Error with table query', err);
                                                            }
                                                            else {
                                                                employee_email = empResult.rows['0'].emp_email;
                                                                console.log('employee_email', employee_email);
                                                            }

                                                            pool.query("SELECT comm_code_desc from common_code_tbl where code_id='HR' and comm_code_id='HR'", function (err, hrMailList) {
                                                                if (err) {
                                                                    console.error('Error with table query', err);
                                                                }
                                                                else {
                                                                    var hrEmail = hrMailList.rows['0'].comm_code_desc;

                                                                    tempList = hrEmail + ',' + employee_email;
                                                                    console.log('tempList', tempList);
                                                                }
                                                                pool.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1", [apply_to1], function (err, managerMail) {
                                                                    if (err) {
                                                                        console.error('Error with table query', err);
                                                                    }
                                                                    else {
                                                                        rowData1 = managerMail.rows;
                                                                        managerMailId = rowData1[0].emp_email;
                                                                        console.log('managerMailId', managerMailId);
                                                                    }

                                                                    var smtpTransport = nodemailer.createTransport('SMTP', {
                                                                        service: 'gmail',
                                                                        auth:
                                                                        {
                                                                            user: 'amber@nurture.co.in',
                                                                            pass: 'nurture@123'
                                                                        }
                                                                    });


                                                                    var mailOptions = {
                                                                        to: managerMailId,
                                                                        cc: tempList,
                                                                        from: 'amber@nurture.co.in',
                                                                        subject: 'Marked Leave Notification',
                                                                        html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQri5Z0Jek6mmeJGUIXq9IgTcdMWcDdcY1iJvswJx2GdSd64-lN" height="85"><br><br>' +
                                                                            '<h3>Marked Leave Application Details by HR<br><br>' +
                                                                            '<table style="border: 10px solid black;"> ' +
                                                                            '<tr style="border: 10px solid black;"> ' +
                                                                            '<th style="border: 10px solid black;">Leave Type</th> ' +
                                                                            '<th style="border: 10px solid black;">' + leave_type1 + '</th>' +
                                                                            '</tr>' +

                                                                            '<tr style="border: 10px solid black;"> ' +
                                                                            '<th style="border: 10px solid black;"> Employee Name </td> ' +
                                                                            '<th style="border: 10px solid black;">' + emp_name + '</td> ' +
                                                                            '</tr>' +

                                                                            '<tr style="border: 10px solid black;"> ' +
                                                                            '<th style="border: 10px solid black;">Employee ID</th> ' +
                                                                            '<th style="border: 10px solid black;">' + emp_id1 + '</th>' +

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
                                                                            '<th style="border: 10px solid black;">' + availed_leaves1 + '</td> ' +
                                                                            '</tr>' +

                                                                            '<tr style="border: 10px solid black;"> ' +
                                                                            '<th style="border: 10px solid black;"> Reason </td> ' +
                                                                            '<th style="border: 10px solid black;">' + reason + '</td> ' +
                                                                            '</tr>' +
                                                                            '</table> ' +
                                                                            '<br><br>' +
                                                                            'URL: http://amber.nurture.co.in <br><br>' +
                                                                            'This Leave has been approved by HR , In case of clarification/concern please contact HR(Usha) for more Info.<br><br><br>' +
                                                                            '- Regards,<br><br>Amber</h3>'
                                                                    };

                                                                    smtpTransport.sendMail(mailOptions, function (err) {
                                                                    });

                                                                });
                                                                pool.query("select emp_id, emp_name from emp_master_tbl where emp_id in( SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1)", [emp_id1], function (err, emp_data) {
                                                                    if (err) {
                                                                        console.error('Error with table query', err);
                                                                    }
                                                                    else {
                                                                        emp_data_app = emp_data.rows;
                                                                    }


                                                                    pool.query("SELECT * from holidays where del_flg =$1", ['N'], function (err, holidayList) {
                                                                        if (err) {
                                                                            console.error('Error with table query', err);
                                                                        }
                                                                        else {
                                                                            holidayData = holidayList.rows;
                                                                        }
                                                                    });
                                                                });
                                                            });
                                                        });
                                                    });

                                                    req.flash('success', "Leave request submitted successfully")
                                                    res.redirect(req.get('referer'));
                                                }
                                                else {
                                                    req.flash('error', "Leave dates overlap please recheck")
                                                    res.redirect(req.get('referer'));
                                                }
                                            });
                                        }
                                        else {
                                            req.flash('error', "Restricted Leave Type already utilised for 2 days")
                                            res.redirect(req.get('referer'));
                                        }
                                    });
                                });
                            });
                        });
                    }

                });
            });
        }
    }
};




function unmarkLeavePost(req, res) {
    var eid = req.user.rows[0].user_id;
    var emp_access = req.user.rows[0].user_type;
    var ename = req.user.rows[0].user_name;
    var emp_id = req.body.employee_id;
    var emp_name = req.body.empName;
    var leave_id = req.body.leave_id;
    var leaves = req.body.leaves;
    var reason = req.body.desc;
    var leave_type = req.body.leave_type;
    var tempList = '';
    var now = new Date();
    var year = now.getFullYear();
    var lchgtime = now;

    pdbconnect.query("UPDATE leaves set del_flg = $1, lchg_user_id = $2 , lchg_time = $3 where leave_id = $4 ", ['Y', emp_id, lchgtime, leave_id], function (err, done) {
            if (err) {
                    console.error('Error with table query', err);
            }

            pdbconnect.query("SELECT * from leave_master where emp_id =$1 and del_flg=$2 and leave_type = $3 and year = $4", [emp_id, 'N', leave_type, year], function (err, done) {
                    if (err) {
                            console.error('Error with table query', err);
                    }
                    else {
                            no_of_leaves = done.rows['0'].availed_leaves;
                            var quater_leave = done.rows['0'].quaterly_leave;
                    }

                    rest_leaves = parseFloat(no_of_leaves) - parseFloat(leaves);

                    if (parseFloat(quater_leave) < 0) {
                            var quater_leave = parseFloat(quater_leave) + parseFloat(leaves);
                            console.log("less than 0", quater_leave);
                    }
                    else {
                            var quater_leave = parseFloat(quater_leave) + parseFloat(leaves);
                            console.log("greater than 0", quater_leave);
                    }


                    pdbconnect.query("UPDATE leave_master set availed_leaves = $1,quaterly_leave=$5 where emp_id = $2 and leave_type = $3 and year = $4", [rest_leaves, emp_id, leave_type, year, quater_leave], function (err, done) {
                            if (err) {
                                    console.error('Error with table query', err);
                            }
                            else {
                                    //               console.log('111111111111111111111111111');
                            }

                            pdbconnect.query("SELECT  comm_code_desc cocd ,emp_name emp,* from leaves l, emp_master_tbl emp,  common_code_tbl cocd  where l.del_flg= 'N' and l.emp_id =$1 and l.approver_id = emp.emp_id and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP' and cocd.del_flg ='N'", [emp_id], function (err, leavesList) {
                                    if (err) {
                                            console.error('Error with table query', err);
                                    }
                                    else {
                                            leaveData = leavesList.rows;
                                            //console.log('rowData value',rowData);
                                            //console.log('rowData value1',done.rows['0']);
                                    }

                                    pdbconnect.query("SELECT * FROM leaves where leave_id =$1", [leave_id], function (err, leaveDataID) {
                                            if (err) {
                                                    console.error('Error with table query', err);
                                            }
                                            else {
                                                    rowData2 = leaveDataID.rows;
                                                    managerID = leaveDataID.rows[0].approver_id;
                                                    from_date = leaveDataID.rows[0].from_date;
                                                    var from_date = dateFormat(from_date, "yyyy-mm-dd");
                                                    to_date = leaveDataID.rows[0].to_date;
                                                    var to_date = dateFormat(to_date, "yyyy-mm-dd");
                                                    availed_leaves = leaveDataID.rows[0].availed_leaves;
                                                    accepted_flg = leaveDataID.rows[0].app_flg;
                                                    console.log('managerID', managerID);
                                                    console.log('accepted_flg', accepted_flg);

                                                    if (accepted_flg == 'Y') {
                                                            pdbconnect.query("SELECT reporting_mgr FROM emp_master_tbl where emp_id =$1", [emp_id], function (err, repMgr) {
                                                                    if (err) {
                                                                            console.error('Error with table query', err);
                                                                    }
                                                                    else {
                                                                            var repMgr_id = repMgr.rows['0'].reporting_mgr;
                                                                            console.log('repMgr_id', repMgr_id);
                                                                    }

                                                                    pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1", [repMgr_id], function (err, repMgrEmail) {
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
                                            }

                                            pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ", [emp_id], function (err, empResult) {
                                                    if (err) {
                                                            console.error('Error with table query', err);
                                                    }
                                                    else {
                                                            employee_email = empResult.rows['0'].emp_email;
                                                            console.log('employee_email', employee_email);
                                                    }

                                                    pdbconnect.query("SELECT emp_email FROM emp_master_tbl where emp_id =$1  ", [managerID], function (err, managerMail) {
                                                            if (err) {
                                                                    console.error('Error with table query', err);
                                                            }
                                                            else {
                                                                    rowData1 = managerMail.rows;
                                                                    managerMailId = rowData1[0].emp_email;
                                                                    console.log('managerMailId', managerMailId);
                                                            }


                                                            pdbconnect.query("SELECT comm_code_desc from common_code_tbl where code_id='HR' and comm_code_id='HR'", function (err, hrMailList) {
                                                                    if (err) {
                                                                            console.error('Error with table query', err);
                                                                    }
                                                                    else {
                                                                            var hrMailList = hrMailList.rows[0].comm_code_desc;
                                                                    }

                                                                    tempList1 = employee_email;
                                                                    tempList2 = hrMailList + ',' + managerMailId;

                                                                    var smtpTransport = nodemailer.createTransport('SMTP', {
                                                                            service: 'gmail',
                                                                            auth:
                                                                            {
                                                                                    user: 'amber@nurture.co.in',
                                                                                    pass: 'nurture@123'
                                                                            }
                                                                    });

                                                                    var mailOptions = {
                                                                            to: tempList1,
                                                                            cc: tempList2,
                                                                            from: 'amber@nurture.co.in',
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
                                                                                    '<th style="border: 10px solid black;">' + availed_leaves + '</td> ' +
                                                                                    '</tr>' +
                                                                                    '</table> ' +
                                                                                    '<br><br>' +
                                                                                    'URL: http://amber.nurture.co.in <br><br>' +
                                                                                    'You are marked in CC because you are the Reporting Manager for the Employee <br><br><br>' +
                                                                                    '- Regards,<br><br>MD</h3>'
                                                                    };


                                                                    smtpTransport.sendMail(mailOptions, function (err) {
                                                                    });
                                                            });
                                                            req.flash('success', "Leave cancelled for the Employee Id :" + emp_id + " with Employee Name :" + emp_name + ".")
                                                            res.redirect('/requestModule/applyLeave/unmarkLeave');

                                                    });
                                            });
                                    });
                            });
                    });
            });
    });
}


// ///////////////////////////////////////////////////////////////////////////////
module.exports = router;
