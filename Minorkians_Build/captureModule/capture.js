console.log("capture entered");

////////////////////////// Capture MODULLE START HERE //////////////////////////////////////////////////////////////
const express = require('express');
const bodyParser = require('body-parser');
var nodemailer = require('nodemailer');
var router = express.Router();
var pool = require('../Database/dbconfig');



//////////// Register Employee ID Checking ///////////////////

router.use(express.json())
router.post('/registerEmpId', (req, res) => {



    var empid = req.body.employeeId
    console.log("empid", empid);

    pool.query("SELECT * from data_emp_master_tbl_temp where emp_id = $1", [empid], function (err, result) {
        mcount = result.rowCount;
        console.log(mcount, "mcount");

        pool.query("SELECT * from data_emp_info_tbl_temp where emp_id = $1", [empid], function (err, resultset) {
            icount = resultset.rowCount;
            console.log("icount", icount);


            if (mcount == 0) {
                if (icount == 0) {
                    
                    pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'BLG' order by comm_code_id asc", function (err, result) {
                        comm_code_blood = result.rows;
                        comm_code_blood_count = result.rowCount;

                        // to fetch shirt size
                        pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'SHR' order by comm_code_id asc", function (err, result) {
                            comm_code_shirt = result.rows;
                            comm_code_shirt_count = result.rowCount;

                            // to fetch state group
                            pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'STA' order by comm_code_id asc", function (err, result) {
                                comm_code_state = result.rows;
                                comm_code_state_count = result.rowCount;

                                // to fetch maritial status
                                pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'MAR' order by comm_code_id asc", function (err, result) {
                                    comm_code_maritalstatus = result.rows;
                                    comm_code_maritalstatus_count = result.rowCount;

                                    pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'DSG' order by comm_code_id asc", function (err, result) {

                                        comm_code_dsg = result.rows;
                                        comm_code_dsg_count = res.rowCount

                                        pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PCR' order by comm_code_id asc", function (err, result) {

                                            comm_code_curr = result.rows
                                            comm_code_cur_count = res.rowCount

                                            pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'ACC' order by comm_code_id asc", function (err, result) {
                                                comm_code_class = result.rows
                                                comm_code_class_count = res.rowCount

                                                pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'RPT' order by comm_code_id asc", function (err, result) {
                                                    comm_code_rpt = result.rows
                                                    comm_code_rpt_count = res.rowCount

                                                    const cocd = {
                                                        empid: empid,
                                                        comm_code_blood: comm_code_blood,
                                                        comm_code_blood_count: comm_code_blood_count,
                                                        comm_code_shirt: comm_code_shirt,
                                                        comm_code_shirt_count: comm_code_shirt_count,
                                                        comm_code_state: comm_code_state,
                                                        comm_code_state_count: comm_code_state_count,
                                                        comm_code_maritalstatus: comm_code_maritalstatus,
                                                        comm_code_maritalstatus_count: comm_code_maritalstatus_count,
                                                        comm_code_curr: comm_code_curr,
                                                        comm_code_cur_count: comm_code_cur_count,
                                                        comm_code_class: comm_code_class,
                                                        comm_code_class_count: comm_code_class_count,
                                                        comm_code_rpt: comm_code_rpt,
                                                        comm_code_rpt_count: comm_code_rpt_count,
                                                        comm_code_dsg: comm_code_dsg,
                                                        comm_code_dsg_count: comm_code_dsg_count
                                                    }
                                                    console.log('m count if enterd');
                                                    const message = {
                                                        message: "redirect to personal Details ",
                                                        cocd: cocd
                                                    }
                                                    return res.send(message);
                                                })

                                            })
                                        })

                                    });
                                });
                            });
                        });
                    });




                }
                else {


                    const message = {
                        message: "redirect to register ",
                        notification: "Verification Pending for this Employee Id1:  " + empid
                    }
                    res.send(message);



                }

            }
            else {
                if (icount == 1) {
                    // req.flash('error', "Verification Pending for this Employee Id:  " + empid)
                    // res.redirect('/captureModule/captureDetail/index');
                    const message = {
                        message: "redirect to register ",
                        notification: "Verification Pending for this Employee Id2:  " + empid
                    }
                    res.send(message);

                    // return res.status(200).json()



                }
                else {


                    const message = {
                        message: "redirect to personal Details "
                    }
                    return res.send(message);
                    // console.log("400 2nd returned");
                    // return res.send('Condition is not met');


                }
            }

        });
    });
})





///////////// PROFESSIONAL DETAILS  ////////////////////
router.post('/insert', (req, res) => {


    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1; // Months are zero-based, so adding 1
    const day = currentDate.getDate();

    console.log('Year:', year);
    console.log('Month:', month);
    console.log('Day:', day);
    var date = year + '-' + month + '-' + day;
    var now = date
    console.log(date);
    var now = date;
    var rcreuserid = "ADMIN"
    var rcretime = now;
    var lchguserid = "ADMIN"
    var lchgtime = now;
    var empid = req.body.employeeId;
    console.log(req.body.employeeId);
    var empname = req.body.employeeName;
    var email = req.body.email_ID;
    var empaccess = "L3"
    var jDate = req.body.joiningDate;
    var desig = "T"
    var empClass = "A1";
    var salary = "0";
    var rptman = "0001";
    var probPeriod = req.body.probation_Period;
    var preem = req.body.previous_Experience;
    if (preem == "Y") {
        var preExpyear = req.body.years;
        var preExpmonth = req.body.month;
        var preEmp = req.body.previous_Employer_One;
        var preEmp2 = req.body.previous_Employer_Two;
        var preEmp3 = req.body.previous_Employer_Three;
        var preEmp4 = req.body.previous_Employer_Four;
        var preEmp5 = req.body.previous_Employer_Five;
    }
    else {
        var preExpyear = "0";
        var preExpmonth = "0";
        var preEmp = "";
        var preEmp2 = "";
        var preEmp3 = "";
        var preEmp4 = "";
        var preEmp5 = "";
    }
    var entity_cre_flg = "N";

    pool.query("SELECT * from data_emp_master_tbl_temp where emp_id = $1", [empid], function (err, result) {
        var mcount = result.rowCount;
        console.log("mcount", mcount);

        pool.query("SELECT * from emp_master_tbl where emp_id = $1", [empid], function (err, result) {
            var main_count = result.rowCount;
            console.log("main_count", main_count);

            if (main_count == 0) {
                if (mcount == 0) {
                    pool.query("INSERT INTO data_emp_master_tbl_temp(emp_id,emp_name,emp_access,emp_email,joining_date,designation,salary,reporting_mgr,prev_expr_year,prev_expr_month,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5,emp_prob,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,entity_cre_flg,pre_emp_flg,emp_classification) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24)", [empid, empname, empaccess, email, jDate, desig, salary, rptman, preExpyear, preExpmonth, preEmp, preEmp2, preEmp3, preEmp4, preEmp5, probPeriod, 'N', rcreuserid, rcretime, lchguserid, lchgtime, entity_cre_flg, preem, empClass], function (err, done) {
                        if (err) throw err;
                        console.log("added");


                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'mohammadsab@minorks.com',
                                pass: '9591788719'
                            }
                        });
                        const mailOptions = {
                            from: 'mohammadsab@minorks.com',
                            to: email,
                            // subject: 'Test Email',

                            subject: 'Forgot Password',
                            html: '<img src="http://www.confessionsofareviewer.com/wp-content/uploads/2017/05/welcome-on-board.jpg" height="85"><br><br>' +
                                '<h3>Dear <b>' + empname + '</b>,<br><br>' +
                                'You are receiving this mail because you (or someone else) has filled in the details <b>Amber</b>.<br>' +
                                'Registered Account details : <br><br>' +
                                '<table style="border: 10px solid black;"><tr style="border: 10px solid black;"><th style="border: 10px solid black;">User Id</th><th style="border: 10px solid black;">' + empid + '</th></tr><tr style="border: 10px solid black;"><td style="border: 10px solid black;"> Employee Name </td><td style="border: 10px solid black;">' + empname + '</td></tr></table><br><br>' +
                                'Password will be generated once HR routerroves your Record<br>' +
                                'Contact administrator for any clarifications<br><br><br>' +
                                '- Regards,<br><br>Amber</h3>'
                            // text: 'This is a test email sent from Node.js using Nodemailer.'
                        };






                        transporter.sendMail(mailOptions, function (error, info) {
                            if (error) {
                                console.error('Error sending email', error);
                            } else {
                                console.log('Email sent:', info.response);
                            }


                        });


                        // req.flash('success', "User successfully added and An e-mail has been sent to " + email + " with further instructions.")
                        //res.redirect('/captureModule/captureDetail/captureDetailPersonal');
                        const message = {
                            message: "redirect to add profile",
                            notification: "User successfully added and An e-mail has been sent to " + email + " with further instructions."
                        }
                        res.send(message)

                        // pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'BLG' order by comm_code_id asc", function (err, result) {
                        //     comm_code_blood = result.rows;
                        //     comm_code_blood_count = result.rowCount;

                        //     // to fetch shirt size
                        //     pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'SHR' order by comm_code_id asc", function (err, result) {
                        //         comm_code_shirt = result.rows;
                        //         comm_code_shirt_count = result.rowCount;

                        //         // to fetch state group
                        //         pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'STA' order by comm_code_id asc", function (err, result) {
                        //             comm_code_state = result.rows;
                        //             comm_code_state_count = result.rowCount;

                        //             // to fetch maritial status
                        //             pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'MAR' order by comm_code_id asc", function (err, result) {
                        //                 comm_code_maritalstatus = result.rows;
                        //                 comm_code_maritalstatus_count = result.rowCount;

                        //                 res.render('captureModule/captureDetailPersonal', {
                        //                     empid: empid,
                        //                     comm_code_blood: comm_code_blood,
                        //                     comm_code_blood_count: comm_code_blood_count,
                        //                     comm_code_shirt: comm_code_shirt,
                        //                     comm_code_shirt_count: comm_code_shirt_count,
                        //                     comm_code_state: comm_code_state,
                        //                     comm_code_state_count: comm_code_state_count

                        //                 });
                        //             });
                        //         });
                        //     });
                        // });
                    });
                }
                else {
                    // req.flash('error', "Verification Pending By Admin")
                    // res.redirect('/captureModule/captureDetail/index');
                    const message = {
                        message: "redirect to register",
                        notification: "Verification Pending By Admin"
                    }
                    res.send(message)

                }

            }
            else {
                // req.flash('error', "You have Already been registered in Amber")
                // res.redirect('/captureModule/captureDetail/index');
                const message = {
                    message: "redirect to register",
                    notification: "You have Already been registered in Amber"
                }
                res.send(message)
            }
        });
    });

});




/////////////////////////////////////// PERSONAL DETAILS /////////////////////////////////////////////////////


router.post('/addempper', (req, res) => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    const day = currentDate.getDate();
    const now = year + '-' + month + '-' + day;

    var rcreuserid = "ADMIN";
    var rcretime = now;
    var lchguserid = "ADMIN";
    var lchgtime = now;
    var empid = req.body.employeeId;
    var empName = req.body.employeeName;
    var gender = req.body.gender;
    var dob = req.body.dateOfBirth;
    var bgroup = req.body.bloodGroup;
    var shirt = req.body.tShirtSize;
    var commAdd = req.body.communicationAddress;
    var state = req.body.state;
    var city = req.body.city;
    var pincode = req.body.pinCode;
    var resAdd = req.body.parmanentAddress;
    var state1 = req.body.state1;
    var city1 = req.body.city1;
    var pincode1 = req.body.pinCode1;
    var mobNum = req.body.mobileNumber;
    var telNum = req.body.telNum;
    var econNum = req.body.emergencyContactNumber;
    var emerPer = req.body.emergencyContactPerson;
    var fathersName = req.body.fatherName;
    var mothersName = req.body.motherName;
    var maritalstatus = req.body.maritalStatus;
    var spouseName = req.body.spouseName;
    var panNum = req.body.panNumber;
    var passNum = req.body.passportNumber;
    var aadhaarNum = req.body.adharCardNumber;
    var dlNum = req.body.drivingLicenceNumber;
    var uan = req.body.uanNumber;
    var nameinBank = req.body.name;
    var bankName =req.body.bankname;
    var branchName = req.body.branchname;
    var acctNum = req.body.accountnum;
    var ifscCode = req.body.ifsccode;
    var entity_cre_flg = "N";



    pool.query("SELECT * from emp_info_tbl e where LOWER(e.emp_id) = LOWER($1)",
        [empid], function (err, resultset) {
            if (err) throw err;
            var mcount = resultset.rowCount;

            pool.query("SELECT * from emp_info_tbl_temp e where LOWER(e.emp_id) = LOWER($1)",
                [empid], function (err, resultset) {
                    if (err) throw err;
                    var tcount = resultset.rowCount;

                    if (mcount == 0) {
                        if (tcount == 0) {
                            pool.query("INSERT INTO emp_info_tbl_temp(emp_id,emp_name,gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code,del_flg,entity_cre_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38)", [empid, empName, gender, dob, bgroup, shirt, commAdd, state, city, pincode, resAdd, state1, city1, pincode1, maritalstatus, mobNum, telNum, econNum, emerPer, fathersName, mothersName, spouseName, panNum, passNum, dlNum, aadhaarNum, uan, nameinBank, bankName, branchName, acctNum, ifscCode, 'N', entity_cre_flg, rcreuserid, rcretime, lchguserid, lchgtime], function (err, done) {
                                if (err) throw err;
                            });
                            pool.query("INSERT INTO data_emp_info_tbl_temp(emp_id,emp_name,gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code,del_flg,entity_cre_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38)", [empid, empName, gender, dob, bgroup, shirt, commAdd, state, city, pincode, resAdd, state1, city1, pincode1, maritalstatus, mobNum, telNum, econNum, emerPer, fathersName, mothersName, spouseName, panNum, passNum, dlNum, aadhaarNum, uan, nameinBank, bankName, branchName, acctNum, ifscCode, 'N', entity_cre_flg, rcreuserid, rcretime, lchguserid, lchgtime], function (err, done) {
                                if (err) throw err;
                            });
                            const message = {
                                notification: "Personal Details Added sucessfully, Verification pending by Admin.",
                                message: "redirect to login page"
                            };
                            res.send(message);


                        }
                        else {

                            // req.flash('error', "Record Already Exists.")
                            // res.redirect(req.get('referer'));
                            res.json({
                                message: "redirect to login page",
                                notification: "Record Alredy Exist",

                            })
                        }

                    }
                    else {
                        if (tcount == 1) {
                            res.json({
                                message: "redirect to login page",
                                notification: "Record Alredy Exist",

                            })
                        }
                        else {

                            pool.query("INSERT INTO emp_info_tbl_temp(emp_id,emp_name,gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code,del_flg,entity_cre_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38)", [empid, empName, gender, dob, bgroup, shirt, commAdd, state, city, pincode, resAdd, state1, city1, pincode1, maritalstatus, mobNum, telNum, econNum, emerPer, fathersName, mothersName, spouseName, panNum, passNum, dlNum, aadhaarNum, uan, nameinBank, bankName, branchName, acctNum, ifscCode, 'N', entity_cre_flg, rcreuserid, rcretime, lchguserid, lchgtime], function (err, done) {
                                if (err) throw err;
                            });
                            pdbconnect.query("INSERT INTO data_emp_info_tbl_temp(emp_id,emp_name,gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code,del_flg,entity_cre_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38)", [empid, empName, gender, dob, bgroup, shirt, commAdd, state, city, pincode, resAdd, state1, city1, pincode1, maritalstatus, mobNum, telNum, econNum, emerPer, fathersName, mothersName, spouseName, panNum, passNum, dlNum, aadhaarNum, uan, nameinBank, bankName, branchName, acctNum, ifscCode, 'N', entity_cre_flg, rcreuserid, rcretime, lchguserid, lchgtime], function (err, done) {
                                if (err) throw err;
                            });
                            const message = {
                                notification: "Personal Details Added sucessfully, Verification pending by Admin.",
                                message: "redirect to login page"
                            };
                            res.send(message);
                        }


                    }
                });
        });

})

module.exports = router;