console.log("Travel Enter");
var express = require('express');
var multer = require('multer');
var app = express();
var util = require('util');
var path = require('path');
var fs = require('fs');
var router = express.Router();
var pool = require('../Database/dbconfig');
var nodemailer = require('nodemailer');
const { log } = require('console');
router.use(express.json())
var { format } = require('date-fns')
var moment = require('moment');
const { request } = require('https');

router.get('/travel', travel);
function travel(req, res) {
    var emp_id = req.query.employeeId;
    pool.query("SELECT emp_access FROM emp_master_tbl WHERE emp_id = $1", [emp_id], function (err, result) {
        if (err) throw err;
        var emp_access = result.rows[0].emp_access;
        if (emp_access === 'A1') {
            pool.query("SELECT DISTINCT emp_master_tbl.emp_id, project_alloc_tbl.project_id, emp_master_tbl.emp_name, emp_manager_tbl.emp_name AS reporting_manager_name, emp_manager_tbl.emp_id AS reporting_manager  FROM project_alloc_tbl JOIN emp_master_tbl ON project_alloc_tbl.emp_id = emp_master_tbl.emp_id JOIN emp_master_tbl AS emp_manager_tbl ON project_alloc_tbl.emp_reporting_mgr = emp_manager_tbl.emp_id", function (err, result) {
                if (err) throw err;
                console.log(result.rows[0]);
                res.json({ redirect: '/travel', pidRptName: result.rows })

            })
        }
        else {
            pool.query(
                "SELECT project_alloc_tbl.project_id, project_alloc_tbl.emp_reporting_mgr, emp_master_tbl.emp_name AS emp_reporting_mgr_name " +
                "FROM project_alloc_tbl " +
                "JOIN emp_master_tbl ON project_alloc_tbl.emp_reporting_mgr = emp_master_tbl.emp_id " +
                "WHERE project_alloc_tbl.emp_id = $1",
                [emp_id],
                function (err, result) {
                    if (err) throw err;
                    data = result.rows[0];
                    console.log(result.rows);
                    res.json({ redirect: '/travel', pidRptName: data })
                }
            );
        }
    })
}

/////////////////// All travel Request [trvel req,cancel,modified,etc......]//////////////////////////////////
router.post('/travelReq', travelReq);
function travelReq(req, res) {
    var test = req.body.test;
    var test1 = req.body.test1;
    var test2 = req.body.test2;

    var pnr_number = "";
    var ticket_number = "";
    var free_text_1 = "";
    var hr_remarks = "";
    //////////////////////////////////////////////////////////////////// Intiate travel Request //////////////////////////////////////////////////////////////////////////////////////
    if (test == "Submit") {
        console.log("test::::", test);
        var tenDate = req.body.tenDate;
        var emp_id = req.body.user_id;
        var empname = req.body.user_name;
        var empaccess = req.body.user_type;
        if (empaccess == 'A1') {
            console.log(req.body);
            emp_id = req.body.item.employeeId;
            pool.query("select emp_name,emp_access from emp_master_tbl where emp_id=$1", [emp_id], function (err, result) {
                if (err) throw err;
                empname = result.rows[0].emp_name;
                empaccess = result.rows[0].emp_access;
            })
        }
        var travelDate = req.body.item.travelDate;
        var now = new Date();
        var rcreuserid = emp_id;
        var rcretime = now;
        var lchguserid = emp_id;
        var lchgtime = now;

        var pid = req.body.item.projectId;
        var travelDate = req.body.item.travelDate;
        var tenDate = req.body.item.tentativeReturnDate;
        var fromLoc = req.body.item.fromLocation;
        var toLoc = req.body.item.toLocation;
        var rmks = req.body.item.remarks;
        // var free_text_1 = req.body.free_text_1;
        var emp_access = empaccess;
        var emp_Name = empname;
        var val_from_date = "";
        var val_from_location = "";
        var valFlag = "";
        var masterTblFlag = "";
        var checkFlag = "";
        var success = "";
        console.log('emp_Name::emp_access', emp_access);
        console.log('emp_id', emp_id.length);
        console.log('travelDate', travelDate);
        console.log('pid', pid);
        var notification = '';

        pool.query("SELECT * from travel_master_tbl_temp where emp_id = $1 and project_id = $2 and del_flg = $3", [emp_id, pid, 'N'], function (err, valDateLoc) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                console.log("valDateLoc.rowCount::", valDateLoc.rowCount);
                // console.log("result::", valDateLoc);
            }

            pool.query("SELECT * from travel_master_tbl where emp_id = $1 and project_id = $2 and del_flg = $3 and request_status NOT IN ($4,$5,$6,$7,$8,$9)", [emp_id, pid, 'N', 'CAN', 'RJF', 'RJD', 'RJM', 'CPF', 'CAF'], function (err, masterTblcheck) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    console.log("masterTblcheck.rowCount::", masterTblcheck.rowCount);
                    // console.log("result:masterTblcheck:::", masterTblcheck);
                }
                if (valDateLoc.rowCount != 0 || masterTblcheck.rowCount != 0) {
                    console.log(":either of  rowcount !==0::::::");
                    if (valDateLoc.rowCount != 0) {
                        console.log(":if valDateLoc.rowCount !==0::::::");
                        for (i = 0; i < valDateLoc.rowCount; i++) {

                            console.log("inside valDateLoc validation for loop:::");
                            val_from_date = format(valDateLoc.rows[i].from_date, 'yyyy-MM-dd');
                            console.log("from_date", val_from_date);
                            val_from_location = valDateLoc.rows[i].from_location;

                            console.log("from_location ::val_from_location:", val_from_location);
                            var duration = moment.duration(moment(travelDate).diff(moment(val_from_date)));
                            var days = duration.asDays();
                            console.log("days ::val_from_location:", days);
                            //	if ( travelDate == val_from_date && fromLoc ==  val_from_location){
                            if (days == 0 && fromLoc.toUpperCase() == val_from_location) {
                                console.log("***********INSIDE VAL IF*************");
                                notification: "Travel request  with  same travel date for the same location has been raised already"
                                valFlag = true;

                            }
                            else {
                                valFlag = false;
                                if (masterTblcheck.rowCount == 0) {
                                    masterTblFlag = false;
                                }
                            }
                            console.log("11111111::valFlag:::", valFlag);
                            if (valFlag == true) {
                                console.log("::::@@@@@@@@:::");
                                break;
                            }
                        }
                    }
                    if (masterTblcheck.rowCount != 0) {
                        console.log(":if masterTblcheck.rowCount !==0::::::");
                        for (i = 0; i < masterTblcheck.rowCount; i++) {

                            console.log("inside masterTblcheck validation for loop:::");
                            val_from_date = masterTblcheck.rows[i].from_date;
                            console.log("from_date::masterTblcheck::", val_from_date);
                            val_from_location = masterTblcheck.rows[i].from_location;

                            console.log("from_location ::masterTblcheck:", val_from_location);
                            var duration1 = moment.duration(moment(travelDate).diff(moment(val_from_date)));
                            var days1 = duration1.asDays();
                            console.log("days ::masterTblcheck:", days);
                            //	if ( travelDate == val_from_date && fromLoc ==  val_from_location){
                            if (days1 <= 0 && fromLoc == val_from_location) {
                                console.log("***********INSIDE masterTblcheck IF*************");
                                notification: ('error', "Travel request  with  same travel date for the same location has been raised already");
                                masterTblFlag = true;
                            }
                            else {
                                masterTblFlag = false;
                                if (valDateLoc.rowCount == 0) {
                                    valFlag = false;
                                }
                            }
                            console.log("11111111::masterTblFlag:::", masterTblFlag);
                            if (masterTblFlag == true) {
                                console.log("::::@@@@masterTblFlag@@@@:::");
                                break;
                            }
                        }
                    } console.log("22222222::valFlag:::", valFlag);
                    console.log("22222222::masterTblFlag:::", masterTblFlag);
                    if (valFlag == true && masterTblFlag == true) {
                        checkFlag = true;
                    }
                    if (valFlag == true && masterTblFlag == false) {
                        checkFlag = true;
                    }
                    if (valFlag == false && masterTblFlag == true) {
                        checkFlag = true;
                        console.log("inside flag if condition check OR::::", checkFlag);
                    }
                    if (valFlag == false && masterTblFlag == false) {

                        checkFlag = false;
                        console.log("inside flag else condition check::::", checkFlag);
                    }
                }
                if (valDateLoc.rowCount == 0 && masterTblcheck.rowCount == 0) {
                    checkFlag = false;
                }
                console.log("11111111::checkFlag:::", checkFlag);
                if (checkFlag == true) {
                    console.log("checkFlag::::truetruetruetrue");

                    res.json({ message: 'travelModule/travel', notification: "Travel request  with  same travel date for the same location has been raised already" });
                }
                else if (checkFlag == false) {

                    console.log("checkFlag::::falsefalsefalsefalsefalse");

                    pool.query("SELECT emp_id, emp_name FROM emp_master_tbl WHERE emp_id IN (SELECT emp_reporting_mgr FROM project_alloc_tbl WHERE emp_id = $1 AND project_id = $2)", [emp_id, pid], function (err, result2) {
                        if (err) {
                            console.error('Error with table query', err);
                        } else {
                            empName = result2.rows['0'].emp_name;
                            console.log("empName", empName);
                            approverid = result2.rows['0'].emp_id;
                            console.log("approverid ::HII:", approverid);

                        }



                        pool.query("SELECT * from travel_master_tbl_temp", function (err, resultset) {
                            if (err) throw err;
                            rcount = resultset.rowCount;
                            console.log("rcount", rcount);
                            var seq = "travelreq";


                            pool.query("select nextval($1)::text code1", [seq], function (err, result) {
                                if (err) throw err;
                                code1 = result.rows['0'].code1;
                                console.log("select done");
                                console.log("code1", code1);
                                console.log("code1", code1);
                                req_id = code1;
                                console.log("req_id after generating", req_id);
                                console.log("approverid after generating", approverid);
                                console.log("tenDate", tenDate);
                                console.log("tenDate.length", tenDate.length);
                                //tenDate=tenDate.toString();
                                console.log("tenDate.length", tenDate.length);

                                if (tenDate.length != "0") {
                                    console.log("tenDate", tenDate);
                                    pool.query("INSERT INTO travel_master_tbl_temp(req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,modify_flg,request_status,appr_flg,confrm_flg,reject_flg) values($1,$2,$3,$4,$5,$6,$7,upper($8),upper($9),upper($10),$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)", [req_id, emp_id, empname, empaccess, pid, travelDate, tenDate, fromLoc, toLoc, rmks, approverid, 'N', rcreuserid, rcretime, lchguserid, lchgtime, 'N', 'CPM', 'N', 'N', 'N'], function (err, done) {
                                        if (err) throw err;
                                        //  req.flash('success',"Travel request has been submitted successfully with Request Id:"+ req_id +".");
                                        // res.redirect('/travelModule/travelCyber');
                                        //res.redirect(req.get('referer'));
                                        //  res.redirect('/travelModule/travel/travel');

                                        pool.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl_temp where req_id=$1)", [req_id], function (err, done) {
                                            if (err) throw err;
                                            success = "Travel request has been initiated successfully with Request Id:" + req_id + ".";


                                            console.log("emp_id", emp_id);
                                            console.log("req_id inside loop1", req_id);
                                            pool.query("SELECT * FROM travel_master_tbl_temp WHERE emp_id = $1 AND req_id = $2", [emp_id, req_id], function (err, resultValue) {
                                                if (err) throw err;
                                                var rcount = resultValue.rowCount;
                                                console.log("Inside count", rcount);


                                                var row = resultValue.rows[0]; // Access the first row of the result set

                                                var emp_id = row.emp_id;
                                                var emp_name = row.emp_name;
                                                var emp_access = row.emp_access;
                                                var project_id = row.project_id;
                                                var from_date = row.from_date;
                                                var to_date = row.to_date;
                                                var from_location = row.from_location;
                                                var to_location = row.to_location;
                                                var remarks = row.remarks;
                                                var pnr_number = row.pnr_number;
                                                var free_text_1 = row.free_text_1;
                                                var ticket_number = row.ticket_number;

                                                // Do something with the retrieved data here
                                                // For example, you can use the variables above or call a function with these variables as arguments



                                                pool.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id IN (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id = $1 and project_id =$2 )", [emp_id, pid], function (err, result) {
                                                    if (err) {
                                                        console.error('Error with table query1', err);
                                                    } else {
                                                        //   var empName = result.rows['0'].emp_name;
                                                        empName = result.rows['0'].emp_name;
                                                        console.log("empName", empName);
                                                        approverid = result.rows['0'].emp_id;
                                                        console.log('hii APPVER', approverid);
                                                    }


                                                    //  from_date = from_date.toDateString();
                                                    //  to_date = to_date.toDateString();

                                                    pool.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl_temp where req_id=$1)", [req_id], function (err, empResult) {
                                                        if (err) {
                                                            console.error('Error with table query', err);
                                                        } else {
                                                            approver_name = empResult.rows['0'].emp_name;
                                                            approver_email = empResult.rows['0'].emp_email;
                                                            console.log('manager name ', approver_name);
                                                            console.log('manager id ', approver_email);
                                                        }
                                                        console.log('smtpTransport call ');
                                                        const transporter = nodemailer.createTransport({
                                                            service: 'gmail',
                                                            auth: {
                                                                user: 'mohammadsab@minorks.com',
                                                                pass: '9591788719'
                                                            }
                                                        });
                                                        const mailOptions = {
                                                            from: 'mohammadsab@minorks.com',
                                                            to: approver_email,
                                                            subject: 'Travel Request notification',
                                                            text: `Dear Approver,
                                                        
                                                            Travel Request ${req_id} has been raised for your approval.
                                                            
                                                            Details:
                                                            Project ID: ${project_id}
                                                            Employee Name: ${empname} (${emp_id})
                                                            Travel Dates: From ${fromLoc} to ${toLoc} on ${from_date}.
                                                            
                                                            Please review and take appropriate action.
                                                            
                                                            Thank you,
                                                            Travel Request System`

                                                            // text: 'This is a test email sent from Node.js using Nodemailer.'
                                                        };


                                                        console.log('mailOptions', mailOptions);
                                                        transporter.sendMail(mailOptions, function (error, info) {
                                                            if (error) {
                                                                console.error('Error sending email', error);
                                                            } else {
                                                                console.log('Email sent:', info.response);
                                                            }


                                                        });

                                                        res.json({
                                                            message: 'travelModule/travelCyber', data: {

                                                                emp_id: emp_id,
                                                                emp_name: empname,
                                                                empName: empName,
                                                                project_id: project_id,
                                                                emp_access: emp_access,
                                                                from_date: from_date,
                                                                to_date: to_date,
                                                                from_location: from_location,
                                                                to_location: to_location,
                                                                remarks: remarks,
                                                                success: success,
                                                                approverid: approverid,
                                                                pnr_number: pnr_number,
                                                                free_text_1: free_text_1,
                                                                ticket_number: ticket_number,


                                                            }, notification: success
                                                        });

                                                    });
                                                });
                                            });
                                        });
                                    });
                                }




                                console.log("req_id", req_id);

                                if (tenDate.length == "0") {
                                    console.log("inside else tenDate", tenDate);
                                    pool.query("INSERT INTO travel_master_tbl_temp(req_id,emp_id,emp_name,emp_access,project_id,from_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,modify_flg,request_status) values($1,$2,$3,$4,$5,$6,$7,upper($8),upper($9),upper($10),$11,$12,$13,$14,$15,$16,$17)", [req_id, emp_id, empname, empaccess, pid, travelDate, fromLoc, toLoc, rmks, approverid, 'N', rcreuserid, rcretime, lchguserid, lchgtime, 'N', 'CPM'], function (err, done) {
                                        if (err) throw err;
                                        else {

                                        }
                                        //req.flash('success',"Travel request has been rised Successfully with request_id:"+ req_id +".");
                                        // res.redirect('/travelModule/travelCyber');
                                        //res.redirect(req.get('referer'));
                                        //  res.redirect('/travelModule/travel/travel');
                                        pool.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl_temp where req_id=$1)", [req_id], function (err, done) {
                                            if (err) throw err;

                                            console.log("emp_id", emp_id);
                                            console.log("req_id", req_id);
                                            pool.query("SELECT req_id,emp_id,emp_name,emp_access,project_id,from_date,to_date,from_location,to_location,remarks,approver_id,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,free_text_1,pnr_number,ticket_number from travel_master_tbl_temp where emp_id = LOWER($1) and req_id=$2", [emp_id, req_id], function (err, resultValue) {
                                                if (err) throw err;
                                                //var emp_id=resultValue.rows;
                                                var rcount = resultValue.rowCount;
                                                console.log("Inside count", rcount);
                                                //console.log("emp_id",emp_id);


                                                var emp_id = resultValue.rows['0'].emp_id;
                                                var emp_name = resultValue.rows['0'].emp_name;
                                                var emp_access = resultValue.rows['0'].emp_access;
                                                var project_id = resultValue.rows['0'].project_id;
                                                var from_date = resultValue.rows['0'].from_date;
                                                var to_date = resultValue.rows['0'].to_date;
                                                var from_location = resultValue.rows['0'].from_location;
                                                var to_location = resultValue.rows['0'].to_location;
                                                var remarks = resultValue.rows['0'].remarks;
                                                var pnr_number = resultValue.rows['0'].pnr_number;
                                                var free_text_1 = resultValue.rows['0'].free_text_1;
                                                var ticket_number = resultValue.rows['0'].ticket_number;

                                                pool.query("SELECT emp_id, emp_name from emp_master_tbl where emp_id in (SELECT emp_reporting_mgr from project_alloc_tbl where emp_id=LOWER($1) and project_id=$2)", [emp_id, pid], function (err, result) {
                                                    if (err) {
                                                        console.error('Error with table query1', err);
                                                    } else {
                                                        empName = result.rows['0'].emp_name;
                                                        console.log("empName", empName);
                                                        approverid = result.rows['0'].emp_id;
                                                        console.log('hii', approverid);
                                                    }
                                                    success = "Travel request has been initiated successfully with Request Id:" + req_id + ".";
                                                    req.flash('success', "Travel request has been initiated Successfully with request_id:" + req_id + ".");

                                                    // from_date = from_date.toDateString();

                                                    pool.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select approver_id from travel_master_tbl_temp where req_id=$1)", [req_id], function (err, empResult) {
                                                        if (err) {
                                                            console.error('Error with table query', err);
                                                        } else {
                                                            approver_name = empResult.rows['0'].emp_name;
                                                            approver_email = empResult.rows['0'].emp_email;
                                                            console.log('manager name ', approver_name);
                                                            console.log('manager id ', approver_email);
                                                        }
                                                        console.log('smtpTransport call ');
                                                        const transporter = nodemailer.createTransport({
                                                            service: 'gmail',
                                                            auth: {
                                                                user: 'mohammadsab@minorks.com',
                                                                pass: '9591788719'
                                                            }
                                                        });
                                                        var mailOptions = {
                                                            to: approver_email,
                                                            from: 'mohammadsab@minorks.com',
                                                            subject: 'Travel Request Notification',
                                                            text: `Dear Approver,
                                                        
                                                        Travel Request ${req_id} has been raised for your approval.
                                                        
                                                        Details:
                                                        Project ID: ${project_id}
                                                        Employee Name: ${empname} (${emp_id})
                                                        Travel Dates: From ${fromLoc} to ${toLoc} on ${from_date}.
                                                        
                                                        Please review and take appropriate action.
                                                        
                                                        Thank you,
                                                        Travel Request System`
                                                        };

                                                        console.log('mailOptions', mailOptions);
                                                        smtpTransport.sendMail(mailOptions, function (err) { });
                                                        // from_date= from_date.toDateString();
                                                        //to_date= to_date.toDateString();
                                                        res.render('travelModule/travelCyber', {

                                                            emp_id: emp_id,
                                                            emp_name: empname,
                                                            approverid: approverid,
                                                            empName: empName,
                                                            project_id: project_id,
                                                            emp_access: emp_access,
                                                            from_date: from_date,
                                                            to_date: to_date,
                                                            from_location: from_location,
                                                            to_location: to_location,
                                                            remarks: remarks,
                                                            success: success,
                                                            pnr_number: pnr_number,
                                                            free_text_1: free_text_1,
                                                            ticket_number: ticket_number,
                                                            newError: newError
                                                        });
                                                    });
                                                });

                                            });
                                        });
                                    });

                                };
                            });
                        });

                    });


                }

            });

        });

    }
    //////////////////////////////////////////////////////////////////// Modified Travel Request/////////////////////////////////////////////////////////////////////////////////
    if (test1 == 'Submit') {
        var emp_id = req.body.item.emp_id;
        var req_id = req.body.item.req_id;
        var travelDate = req.body.item.travelDate;
        var now = new Date();
        var lchgtime = now;
        var pid = req.body.item.project_id;
        var travelDate = req.body.item.travelDate;
        var tenDate = req.body.item.tentativeReturnDate;
        var fromLoc = req.body.item.from_location;
        var toLoc = req.body.item.to_location;
        var rmks = req.body.item.remarks;
        console.log(travelDate, tenDate, fromLoc, toLoc);
        pool.query("Update travel_master_tbl_temp set from_date=$1, to_date=$2, from_location=upper($3), to_location=upper($4) where req_id=$5", [travelDate, tenDate, fromLoc, toLoc, req_id], function (err, done) {
            if (err) throw err;
            pool.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl_temp where req_id=$1)", [req_id], function (err, done) {
                if (err) throw err;

                pool.query('select emp_email from emp_master_tbl where emp_id=$1', [emp_id], function (err, result) {
                    if (err) throw err;
                    var emp_email = result.rows[0].emp_email;
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'mohammadsab@minorks.com',
                            pass: '9591788719'
                        }
                    });
                    const mailOptions = {
                        from: 'mohammadsab@minorks.com',
                        to: emp_email,
                        subject: 'Travel Request notification',
                        text: `Dear Approver,
    
                        Travel Request ${req_id} has been modified successfully and is awaiting your approval.
                        
                        Details:
                        Project ID: ${pid}
                        Travel Dates: From ${fromLoc} to ${toLoc} on ${travelDate} to ${tenDate}.
                        
                        Please review the changes and take appropriate action.
                        
                        Thank you,
                        Travel Request System
                        `

                        // text: 'This is a test email sent from Node.js using Nodemailer.'
                    };



                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.error('Error sending email', error);
                        } else {
                            console.log('Email sent:', info.response);
                        }


                    });
                    res.json({ notification: "Travel Request has been modified successfully " })
                })

            })
        })
    }
    /////////////////////////////////////////////////////////////////// Cancel Travel Request ///////////////////////////////////////////////////////////////////////////////////////
    if (test2 == "Submit for Cancellation") {
        console.log("Inside test2::::test2", test2);
        console.log(req.body);
        var emp_id = req.body.user_id;
        var emp_name = req.body.user_name;
        var empaccess = req.body.user_type;
        var pid = req.body.item.project_id;
        var now = new Date();
        var rcreuserid = emp_id;
        var rcretime = now;
        var lchguserid = emp_id;
        var lchgtime = now;
        var req_id = req.body.item.req_id;

        var pid = req.body.item.project_id;
        var travelDate = req.body.item.travelDate;
        var tenDate = req.body.item.tentativeReturnDate;
        var fromLoc = req.body.item.fromLocation;
        var toLoc = req.body.item.toLocation;
        var rmks = req.body.item.remarks;
        var emp_access = empaccess;
        var emp_email = '';
        var status = req.body.item.request_status;
        var rejectReson = req.body.rejectReson;

        if (emp_access == 'L1') {
            if (status == 'CPM') {
                pool.query('update travel_master_tbl_temp set request_status= $1 where req_id=$2', ['CAN', req_id], function (err, result) {
                    if (err) throw err;
                    pool.query("INSERT INTO travel_master_tbl_hist(select * from travel_master_tbl_temp where req_id=$1)", [req_id], function (err, done) {
                        if (err) throw err;
                        pool.query('select emp_email from emp_master_tbl where emp_id=$1', [emp_id], function (err, result) {
                            if (err) throw err;
                            emp_email = result.rows[0].emp_email;
                            console.log(emp_Name, req_id, pid, fromLoc, toLoc);
                            const transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: 'mohammadsab@minorks.com',
                                    pass: '9591788719'
                                }
                            });
                            const mailOptions = {
                                from: 'mohammadsab@minorks.com',
                                to: emp_email,
                                subject: 'Travel Request cacncled',
                                html: `
                           
                        
                            Dear ${emp_name},<br>
                            <img src="http://www.minorks.com/images/logo_white.png" alt="Minorks Technology Logo" /><br><br>
                            We  inform you that your recent travel request has been Canceld by you .<br>
                           
                            Travel Request Details:<br>
                            ----------------------------------------<br>
                            Employee Name: ${emp_name} <br>
                            Request ID: ${req_id}<br>
                            Project ID: ${pid}<br>
                            From Location: ${fromLoc}<br>
                            To Location: ${toLoc}<br>
                          
                            If you have any questions or need further assistance, please feel free to reach out to the HR department or your reporting manager.<br>
                        
                            Best regards,<br>
                            Minorks Technology (HR)
                            `
                            };
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.error('Error sending email', error);
                                } else {
                                    console.log('Email sent:', info.response);
                                }


                            });
                            pool.query("select req_id,project_id,emp_id,emp_name,from_location,to_location,request_status,comm_code_desc as status from common_code_tbl JOIN travel_master_tbl_temp ON travel_master_tbl_temp.request_status=common_code_tbl.comm_code_id and travel_master_tbl_temp.reject_flg ='N' and  travel_master_tbl_temp.emp_id=$1 and travel_master_tbl_temp.request_status NOT IN ('RJM','RJF','CAN')  ORDER BY req_id ASC", [emp_id], function (err, result) {
                                if (err) throw err;
                                console.log(result.rows);

                                res.json({ notification: 'Travel Request is Cancel To ' + req_id + ' Succesfully', cancelTravelReqView: result.rows })
                            })



                        })
                    })

                })




            }
            if (status == 'CPF') {
                var cancel_reson = req.body.rejectReson;
                console.log(cancel_reson);
                pool.query('update travel_master_tbl_temp set request_status= $1 ,cancel_reson=$3 where req_id=$2', ['CBM', req_id, cancel_reson], function (err, result) {
                    if (err) throw err;
                    pool.query("select req_id,project_id,emp_id,emp_name,from_location,to_location,request_status,comm_code_desc as status from common_code_tbl JOIN travel_master_tbl_temp ON travel_master_tbl_temp.request_status=common_code_tbl.comm_code_id and travel_master_tbl_temp.reject_flg ='N' and  travel_master_tbl_temp.emp_id=$1 and travel_master_tbl_temp.request_status NOT IN ('RJM','RJF','CAN','CBM')  ORDER BY req_id ASC", [emp_id], function (err, result) {
                        if (err) throw err;
                        console.log(result.rows);

                        res.json({ notification: '`Travel Request is Cancelled To ${req_id} Successfully. Approve Pending With Manager.', cancelTravelReqView: result.rows })
                    })

                })

            }
           
        }
        if (emp_access == 'L3' || emp_access == 'F1') {
            console.log('inside the L3 and f1');
            console.log(req.body);
            var user_id = req.body.user_id
            var req_id = req.body.item.req_id;
            var emp_id = req.body.item.emp_id;
            var emp_name = req.body.item.emp_name;
            var cancel_reson = req.body.item.cancel_reson;
            var status = req.body.item.req_id;
            var rejectReson = req.body.rejectReson;
            var action = req.body.action;
            var project_id = req.body.item.project_id;
            var from_location = req.body.item.from_location;
            var to_location = req.body.item.to_location;
            

            if (emp_access == 'L3') {
                if (action == 'apr') {
                    pool.query('update travel_master_tbl_temp set request_status=$1 where req_id=$2', ['CAM', req_id], function (err, result) {
                        if (err) throw err;

                        pool.query('INSERT INTO travel_master_tbl_hist (SELECT * FROM travel_master_tbl_temp WHERE req_id = $1)',[req_id],function(err,result){
                            if(err) throw err;
                            
                            pool.query('select emp_email from emp_master_tbl where emp_id IN ($1,$2)', [emp_id, user_id], function (err, results) {
                                if (err) throw err;
                                var result = results.rows;
                                console.log(emp_Name);
                                console.log(result);
                                var approver_email = result[0].emp_email; // Assign the first email to approver_email
                                var manager_email = result[1].emp_email;
                                const transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: 'mohammadsab@minorks.com',
                                        pass: '9591788719'
                                    }
                                });
    
                                const mailOptions = {
                                    from: 'mohammadsab@minorks.com',
                                    to: approver_email,
                                    cc: manager_email,
                                    subject: 'Travel Request Approval Notification',
                                    html: `<p>Dear Approver,</p>
                                    <p>Travel Request ${req_id} has been raised for your approval.</p>
                                    <p><strong>Details:</strong></p>
                                    <p><strong>Project ID:</strong> ${project_id}</p>
                                    <p><strong>Employee Name:</strong> ${emp_name} (${emp_id})</p>
                                    <p><strong>Travel Dates:</strong> From ${from_location} to ${to_location} .</p>
                                    <p>The Cancel request has been approved.</p>
                                    <p>Please review and take appropriate action.</p>
                                    <p>Thank you,</p>
                                    <p>Travel Request System</p>`
                                };
    
                                console.log('mailOptions', mailOptions);
    
                                transporter.sendMail(mailOptions, function (error, info) {
                                    if (error) {
                                        console.error('Error sending email', error);
                                    } else {
                                        console.log('Email sent:', info.response);
                                    }
                                });
    
                            })
                            pool.query("select req_id,project_id,emp_id,emp_name,from_location,cancel_reson,to_location,request_status,comm_code_desc as status from common_code_tbl JOIN travel_master_tbl_temp ON travel_master_tbl_temp.request_status=common_code_tbl.comm_code_id and travel_master_tbl_temp.reject_flg ='N' and travel_master_tbl_temp.request_status IN ($1)  ORDER BY req_id ASC", ['CBM'], function (err, result) {
                                if (err) throw err;
                                console.log(result.rows);
    
                                res.json({notification:' Cancel Request Approved Successfully', cancelTravelReqView: result.rows })
    
                            })
                        } )
                        
                    })
                }
                else if (action =='rjt') {
                    pool.query('update travel_master_tbl_temp set request_status=$1 where req_id=$2', ['CPF', req_id], function (err, result) {
                        if (err) throw err;

                        pool.query('select emp_email from emp_master_tbl where emp_id IN ($1,$2)', [emp_id, user_id], function (err, results) {
                            if (err) throw err;
                            var result = results.rows;
                            console.log(result);
                            var approver_email = result[0].emp_email; // Assign the first email to approver_email
                            var manager_email = result[1].emp_email;

                            const transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: 'mohammadsab@minorks.com',
                                    pass: '9591788719'
                                }
                            });
                            
                            const mailOptions = {
                                from: 'mohammadsab@minorks.com',
                                to: approver_email,
                                cc: manager_email, // CC the manager's email
                                subject: 'Travel Request Reject Notification',
                                text: `Dear Approver,
                            
                            Travel Request ${req_id} has been raised for your approval.
                            
                            Details:
                            Project ID: ${project_id}
                            Employee Name: ${emp_name}  (${emp_id})
                            Travel Dates: From ${fromLoc} to ${toLoc} .
                            Reject Reson: ${rejectReson}.
                            
                            The request has been Rejected and Proceeded further. 
                            
                            Please review and take appropriate action.
                            
                            Thank you,
                            Travel Request System`
                            };
                            
                            console.log('mailOptions', mailOptions);
                            
                            transporter.sendMail(mailOptions, function (error, info) {
                                if (error) {
                                    console.error('Error sending email', error);
                                } else {
                                    console.log('Email sent:', info.response);
                                }
                            });
                            pool.query("select req_id,project_id,emp_id,emp_name,from_location,cancel_reson,to_location,request_status,comm_code_desc as status from common_code_tbl JOIN travel_master_tbl_temp ON travel_master_tbl_temp.request_status=common_code_tbl.comm_code_id and travel_master_tbl_temp.reject_flg ='N' and travel_master_tbl_temp.request_status IN ($1)  ORDER BY req_id ASC", ['CBM'], function (err, result) {
                                if (err) throw err;
                                console.log(result.rows);
    
                                res.json({notification:' Cancel Request Rejected Successfully', cancelTravelReqView: result.rows })
    
                            })
                        })
                        
                    })
                }
            }
            else if (emp_access == 'F1') {
            }
        }




    };
}

////////////////////////////////////////////////////// View Travel Reques///////////////////////////////////////////////////////////
router.get('/viewTravelReq', viewTravelReq);
function viewTravelReq(req, res) {
    console.log(req.query);
    var emp_id = req.query.user_id;
    var status = req.query.status;
    if (status == 'All') {
        pool.query("select req_id,project_id,emp_name,from_location,to_location,comm_code_desc as status from common_code_tbl JOIN travel_master_tbl_temp ON travel_master_tbl_temp.request_status=common_code_tbl.comm_code_id and travel_master_tbl_temp.reject_flg ='N' and  travel_master_tbl_temp.emp_id=$1", [emp_id], function (err, result) {
            if (err) throw err;
            console.log(result.rows)
            res.json({ viewTravelReq: result.rows })
        })
    }
    else {
        pool.query("select req_id,project_id,emp_name,from_location,to_location,comm_code_desc as status from common_code_tbl JOIN travel_master_tbl_temp ON travel_master_tbl_temp.request_status=common_code_tbl.comm_code_id and travel_master_tbl_temp.reject_flg ='N' and  travel_master_tbl_temp.emp_id=$1 and travel_master_tbl_temp.request_status=$2 ", [emp_id, status], function (err, result) {
            if (err) throw err;
            console.log(result.rows)
            if (result.rowCount > 0) {
                res.json({ viewTravelReq: result.rows })
            }
            else {
                res.json({ notification: 'No Such Record Found' })
            }
        })
    }
}

///////////////////////////////// view approval request ///////////////////////////////////////////////////////
router.get('/aproverTvlreq', aproverTvlreq);
function aproverTvlreq(req, res) {
    console.log(req.query);
    var emp_id = req.query.user_id;
    var emp_access = req.query.user_type;

    if (emp_access === 'L3') {
        pool.query("select req_id,project_id,emp_name,from_location,to_location ,request_status from travel_master_tbl_temp where approver_id=$1 and request_status='CPM'", [emp_id], function (err, result) {
            if (err) throw err;
            if (result.rowCount > 0) {
                for (let index = 0; index < result.rowCount; index++) {
                    result.rows[index].request_status = 'Pending'
                    console.log(result.rows);
                }

                res.json({ approvalReqView: result.rows })
            } else {
                res.json({ notification: 'No Pendig Aprovals' })
            }

        })

    } else {
        var confrm_flg = ''
        var request_status = ''
        if (emp_access == 'A1') {
            confrm_flg = 'N'
            request_status = 'CPM'
        }
        else {
            confrm_flg = 'Y'
            request_status = 'CPF'

        }
        console.log("else enterd");
        pool.query("select req_id,project_id,emp_name,from_location,to_location,request_status from travel_master_tbl_temp where confrm_flg=$1 and  request_status=$2", [confrm_flg, request_status], function (err, result) {
            if (err) throw err;
            console.log(result.rows);
            if (result.rowCount > 0) {
                for (let index = 0; index < result.rowCount; index++) {
                    result.rows[index].request_status = 'Pending'
                    console.log(result.rows);
                }


                res.json({ approvalReqView: result.rows })
            } else {
                res.json({ notification: 'No Pendig Aprovals' })
            }

        })
    }



}

////////////////////////////////////////// Aprov or reject Api ///////////////////////////////////////////////////////////////////////////////////
router.post('/aproveRejTvlreq', aproveRejTvlreq);
function aproveRejTvlreq(req, res) {
    console.log(req.body);
    var user_id = req.body.user_id;
    var user_type = req.body.user_type;
    var action = req.body.action;
    var req_id = req.body.tq.req_id;
    var project_id = req.body.tq.project_id;
    var emp_name = req.body.tq.emp_name;

    var updateStatus = ''
    var aprover = ''
    var appr_flg = ''
    var confirm_flg = ''
    if (action == 'apr') {
        if (user_type == 'L3') {
            confirm_flg = 'N'
            updateStatus = 'CPF'
            aprover = 'Reporting Manager'
            appr_flg = 'N'
        } else {
            updateStatus = 'CAF'
            aprover = 'Finance Manager'
            appr_flg = 'Y'
            confirm_flg = 'Y'
        }
    }
    else {
        if (user_type == 'L3') {

            updateStatus = 'RJM'
            aprover = 'Reporting Manager'
        } else {
            updateStatus = 'RJF'
            aprover = 'Finance Manager'
        }
    }
    var useremial = ''
    pool.query('select emp_email from emp_master_tbl where emp_name=$1', [emp_name], function (err, result) {
        if (err) throw err
        useremial = result.rows[0].emp_email;

    });
    /////////////////////////// if user is admin /////////////////
    if (user_type == 'A1') {
        if (action == 'apr') {
            console.log("in user a1");

            var bookedticketfare = req.body.tq.bookedticketfare
            var pnrnumber = req.body.tq.pnrnumber
            var ticketnumber = req.body.tq.ticketnumber

            pool.query('update travel_master_tbl_temp set confrm_flg=$1,pnr_number=$3,ticket_number=$4,fair_ticket=$5 where  req_id=$2', ['Y', req_id, pnrnumber, ticketnumber, bookedticketfare], function (err, result) {
                if (err) throw err;
                res.json({ notification: "travel request is aproved" })
            })
        }
        else {
            pool.query('UPDATE travel_master_tbl_temp SET request_status = $4,reject_flg=$5 WHERE emp_name = $1 AND project_id = $2 AND req_id = $3', [emp_name, project_id, req_id, updateStatus, 'Y'], function (err, result) {
                if (err) throw err;

                var rejectReson = req.body.rejectReson;

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'mohammadsab@minorks.com',
                        pass: '9591788719'
                    }
                });
                const mailOptions = {
                    from: 'mohammadsab@minorks.com',
                    to: useremial,
                    subject: 'Travel Request Rejected',
                    html: `
                   
                
                    Dear ${emp_name},<br>
                    <img src="http://www.minorks.com/images/logo_white.png" alt="Minorks Technology Logo" /><br><br>
                    We regret to inform you that your recent travel request has been rejected by your Hr .<br>
                    Reject Reson :${rejectReson} <br>
                    Travel Request Details:<br>
                    ----------------------------------------<br>
                    Employee Name: ${emp_name} <br>
                    Request ID: ${req_id}<br>
                    Project ID: ${project_id}<br>
                    From Location: ${req.body.tq.from_location}<br>
                    To Location: ${req.body.tq.to_location}<br>
                    Status: Rejected by Reporting Manager <br>
                
                    If you have any questions or need further assistance, please feel free to reach out to the HR department or your reporting manager.<br>
                
                    Best regards,<br>
                    Minorks Technology (HR)
                    `
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.error('Error sending email', error);
                    } else {
                        console.log('Email sent:', info.response);
                    }


                });
                res.json({ notification: 'Travel Request is Rejected To ' + emp_name + 'Succesfully' })


            })
        }

    }
    if (user_type === 'L3' || user_type === 'F1') {
        if (action == 'apr') {
            console.log("check", updateStatus);

            pool.query('UPDATE travel_master_tbl_temp SET request_status = $4, appr_flg = $5, confrm_flg = $6 WHERE emp_name = $1 AND project_id = $2 AND req_id = $3 ', [emp_name, project_id, req_id, updateStatus, appr_flg, confirm_flg], function (err, result) {
                if (err) throw err;
                if (user_type == 'F1') {
                    pool.query('INSERT INTO Travel_master_tbl (SELECT * FROM travel_master_tbl_temp WHERE req_id=$2 AND project_id=$1)', [project_id, req_id], function (err, result) {
                        if (err) throw err;
                        console.log("updated");
                        // Your code for handling the query result goes here
                    });
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'mohammadsab@minorks.com',
                            pass: '9591788719'
                        }
                    });
                    const mailOptions = {
                        from: 'mohammadsab@minorks.com',
                        to: useremial,
                        subject: 'Travel Request Approved',

                        html: `
                       
                    Dear ${emp_name},<br>
                    <img src="http://www.minorks.com/images/logo_white.png" alt="Minorks Technology Logo" /><br><br>
                    We are delighted to inform you that your recent travel request has been approved by your ${aprover}.<br>
                
                    Travel Request Details:
                    ----------------------------------------
                    Employee Name: ${emp_name}
                    Request ID: ${req_id}
                    Project ID: ${project_id}
                    From Location: ${req.body.tq.from_location}
                    To Location: ${req.body.tq.to_location}
                    PNR Number:${pnrnumber}
                    Ticket Number:${ticketnumber}
                    Status: Rejected by Reporting Manager
                
                    If you have any questions or need further assistance, please feel free to reach out to the HR department or your reporting manager.<br>
                
                    Best regards,<br>
                    Minorks Technology (HR)
                    `
                    };
                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.error('Error sending email', error);
                        } else {
                            console.log('Email sent:', info.response);
                        }


                    });

                    res.json({ notification: 'Travel Request is approved To ' + emp_name })

                } else {
                    res.json({ notification: 'Travel Request is approved To ' + emp_name })

                }
            })
        }
        else {
            pool.query('UPDATE travel_master_tbl_temp SET request_status = $4,reject_flg=$5 WHERE emp_name = $1 AND project_id = $2 AND req_id = $3', [emp_name, project_id, req_id, updateStatus, 'Y'], function (err, result) {
                if (err) throw err;

                var rejectReson = req.body.rejectReson;

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'mohammadsab@minorks.com',
                        pass: '9591788719'
                    }
                });
                const mailOptions = {
                    from: 'mohammadsab@minorks.com',
                    to: useremial,
                    subject: 'Travel Request Rejected',
                    html: `
                   
                
                    Dear ${emp_name},<br>
                    <img src="http://www.minorks.com/images/logo_white.png" alt="Minorks Technology Logo" /><br><br>
                    We regret to inform you that your recent travel request has been rejected by your ${aprover} .<br>
                    Reject Reson :${rejectReson} <br>
                    Travel Request Details:<br>
                    ----------------------------------------<br>
                    Employee Name: ${emp_name} <br>
                    Request ID: ${req_id}<br>
                    Project ID: ${project_id}<br>
                    From Location: ${req.body.tq.from_location}<br>
                    To Location: ${req.body.tq.to_location}<br>
                    Status: Rejected by Reporting Manager <br>
                
                    If you have any questions or need further assistance, please feel free to reach out to the HR department or your reporting manager.<br>
                
                    Best regards,<br>
                    Minorks Technology (HR)
                    `
                };
                transporter.sendMail(mailOptions, function (error, info) {
                    if (error) {
                        console.error('Error sending email', error);
                    } else {
                        console.log('Email sent:', info.response);
                    }


                });
                res.json({ notification: 'Travel Request is Rejected To ' + emp_name + 'Succesfully' })


            })
        }

    }
}


///////////////////////////////////////////////////////////////// view travel Details from finance and admin  ///////////////////////////////////////////////////////
router.get('/viewDetTvlApr', viewDetTvlApr);

function viewDetTvlApr(req, res) {
    console.log(req.query);
    var user_id = req.query.user_id;
    var user_type = req.query.user_type;
    var emp_id = req.query.emp_id;
    var req_id = req.query.req_id;
    var emp_name = req.query.emp_name;
    var project_id = req.query.project_id;
    if (user_type === 'F1') {
        pool.query('SELECT t.req_id, t.emp_id, t.req_id, t.emp_name AS emp_name, t.project_id,pnr_number,t.ticket_number,t.fair_ticket, TO_CHAR(from_date, \'YYYY-MM-DD\') as from_date, TO_CHAR(t.to_date, \'YYYY-MM-DD\') as to_date, t.from_location, t.to_location, e.emp_name AS managerName FROM travel_master_tbl_temp t JOIN emp_master_tbl e ON t.approver_id = e.emp_id and t.req_id=$1 and t.emp_name=$2 and t.project_id=$3 and t.request_status NOT IN($4,$5,$6)', [req_id, emp_name, project_id, 'RJM', 'RJF', 'CAN'], function (err, result) {
            if (err) throw err;
            res.json({ redirect: 'approvereq', viewDetTvlApr: result.rows[0] })
        })
    }
    else {
        pool.query('SELECT t.req_id, t.emp_id, t.req_id, t.emp_name AS emp_name, t.project_id, TO_CHAR(from_date, \'YYYY-MM-DD\') as from_date, TO_CHAR(t.to_date, \'YYYY-MM-DD\') as to_date, t.from_location, t.to_location, e.emp_name AS managerName FROM travel_master_tbl_temp t JOIN emp_master_tbl e ON t.approver_id = e.emp_id and t.req_id=$1 and t.emp_name=$2 and t.confrm_flg=$7 and t.project_id=$3 and t.request_status NOT IN($4,$5,$6)', [req_id, emp_name, project_id, 'RJM', 'RJF', 'CAN', 'N'], function (err, result) {
            if (err) throw err;
            res.json({ redirect: 'approvereq', viewDetTvlApr: result.rows[0] })
        })
    }


}
////////////////////////////////////////////// TRAVEL INTIATE END ////////////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
////////////////////////////////////////////// MODIFY TRAVEL REQ START //////////////////////////////////////////////////////////////////////


////////////////////////////////////////////// Modify travel request start /////////////////////////////////////////////////////////////////

router.get('/modifytravelDetailsQueue', modifytravelDetailsQueue);

function modifytravelDetailsQueue(req, res) {
    console.log(req.query);
    var emp_id = req.query.user_id;
    var emp_access = req.query.user_type;


    if (emp_access == 'L1') {
        pool.query("SELECT req_id,emp_id,emp_name,emp_access,approver_id,project_id,TO_CHAR(from_date, \'YYYY-MM-DD\') as from_date, TO_CHAR(to_date, \'YYYY-MM-DD\') as to_date, from_location, to_location ,remarks,request_status ,free_text_1,free_text_2,free_text_3 FROM travel_master_tbl_temp where emp_id=$1 and request_status in($2,$3)  order by req_id::integer desc", [emp_id, 'CPM', 'MOD'], function (err, pendingResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                var pendingStatusData = pendingResult.rows;
                console.log("row", pendingStatusData);
                res.json({
                    message: 'travelModule/modifyTravelQueue', data: {
                        pendingStatusData: pendingStatusData,
                    }
                });

            }
        });
    } else {
        res.redirect('/admin-dashboard/adminDashboard/admindashboard');
    }

};

/////////////////////////////////////////////////////// Cancel Travel Request View //////////////////////////////////////////////////////////////////
router.get('/cancelTravelReqView', cancelTravelReqView);
function cancelTravelReqView(req, res) {
    console.log(req.query);
    var emp_id = req.query.user_id;
    var user_type = req.query.user_type;
    if (user_type == 'L1') {

        pool.query("select req_id,project_id,emp_id,emp_name,from_location,to_location,request_status,comm_code_desc as status from common_code_tbl JOIN travel_master_tbl_temp ON travel_master_tbl_temp.request_status=common_code_tbl.comm_code_id and travel_master_tbl_temp.reject_flg ='N' and  travel_master_tbl_temp.emp_id=$1 and travel_master_tbl_temp.request_status NOT IN ('RJM','RJF','CAN','CAF')  ORDER BY req_id ASC", [emp_id], function (err, result) {
            if (err) throw err;
            console.log(result.rows);


            res.json({ cancelTravelReqView: result.rows })

        })
    }
    if (user_type == 'L3' || user_type == 'F1') {
        var request_status = ''
        if (user_type == 'L3') {
            request_status = 'CBM';
        }
        else {
            request_status = 'CBF';
        }
        console.log(request_status);
        pool.query("select req_id,project_id,emp_id,emp_name,from_location,cancel_reson,to_location,request_status,comm_code_desc as status from common_code_tbl JOIN travel_master_tbl_temp ON travel_master_tbl_temp.request_status=common_code_tbl.comm_code_id and travel_master_tbl_temp.reject_flg ='N' and travel_master_tbl_temp.request_status IN ($1)  ORDER BY req_id ASC", [request_status], function (err, result) {
            if (err) throw err;
            console.log(result.rows);
            res.json({ cancelTravelReqView: result.rows })

        })
    }
}
module.exports = router;