console.log("Login entered");

const express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();
const multer = require('multer');
var pool = require('../Database/dbconfig');
var bcrypt = require('bcryptjs')
var passport = require('passport')
var LocalStrategy = require('passport-local').Strategy;
var generatePassword = require("password-generator");
var fs = require('fs');
var moment = require('moment');







//////////////////////////////////////// LOGIN API  /////////////////////////////////////////////////////////////

const path = require('path');
const { request } = require('http');
const { Pool } = require('pg');
const { error } = require('console');

// //////////////////////////// /////////// FunctionS///////////////////////////////////////////////////////////////////////



const getUserByuser_id = function (user_id, callback) {


    var query = pool.query("SELECT u.user_name,u.password,u.user_id,u.user_type,u.client_ip,u.session_id FROM users u WHERE LOWER(u.user_id) = LOWER($1)", [user_id], function (err, result) {

        if (err) throw err;
        console.log('result user', result.rows);
        callback(null, result);
    });
}

const comparePasswordpwd = function (candidatePassword, hash, callback) {
    console.log("comparing password while login2 ")

    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
        // console.log("pwd checking3")
        //  console.log(isMatch);
    });
}
const comparePassword = function (candidatePassword, hash, callback) {
    console.log("comparing password while login")
    console.log("password");
    bcrypt.compare(candidatePassword, hash, function (err, isMatch) {

        if (err) throw err;
        isMatch = "true";
        callback(null, isMatch);
        console.log(isMatch);
        console.log("pwd checking3");
    });
}

passport.use(new LocalStrategy(

    function (user_id, password, done) {
        pool.query("SELECT login_attempts from users where LOWER(user_id) = LOWER($1)",
            [user_id], function (err, result) {
                console.log(user_id);

                if (err) throw err;
                console.log("userid -error")
                attempts = result.rows['0'].login_attempts;
            });

        getUserByuser_id(user_id, function (err, user) {
            if (err) throw err

            if (user.rows == "") {
                console.log("user doesnt existssss")
                return done(null, false, { message: 'user doesnt exist' });
            }

            comparePassword(password, user.rows[0].password, function (err, isMatch) {

                if (err) throw err;

                if (isMatch) {
                    return done(null, user);
                }
                else if (attempts < 4) {

                    attempts++;

                    pool.query("UPDATE users SET login_attempts=$1 WHERE LOWER(user_id)=LOWER($2)", [attempts, user_id]);


                    return done(null, false, { message: 'Wrong Passcode. Please try again. ' + (4 - attempts) + ' attempts remaining.' });
                }
                else if (attempts == 4) {

                    pool.query("UPDATE users SET login_allowed=$1,login_attempts=$2 WHERE LOWER(user_id)=LOWER($3)", ['N', attempts, user_id]);



                    return done(null, false, {
                        message: 'Your Account is locked. Please contact administrator.'
                    });
                }
            });
        });
    }));

passport.serializeUser(function (user, done) {
    console.log("checked");
    done(null, user.rows[0].user_id);
});

passport.deserializeUser(function (user_id, done) {
    User.getUserById(user_id, function (err, user) {
        done(err, user);
    });
    //console.log('checked1');
});


function forgotSendMail(empId) {
    return new Promise((resolve, reject) => {
        const userId = empId;
        console.log('userId', userId);

        const ranPass = generatePassword(4, false);
        console.log('ranPass', ranPass);

        const finalPass = `${userId}@${ranPass}`;
        console.log('finalPass', finalPass);

        pool.query('SELECT user_name, password, user_id, user_type FROM users WHERE user_id = $1', [userId], (err, result) => {
            if (err) {
                console.error('Error with table query', err);
                reject({ error: 'Internal Server Error' });
            } else {
                const rowCount = result.rowCount;
                console.log(result.rows[0]);
                const user_id = result.rows[0];

                if (rowCount === 0) {
                    resolve({ message: 'redirect to reset page', notification: 'Employee does not exist' });
                } else {
                    pool.query('SELECT emp_email, emp_name FROM emp_master_tbl WHERE LOWER(emp_id) = LOWER($1)', [userId], (err, resultset) => {
                        if (err) {
                            console.error('Error with table query', err);
                            reject({ error: 'Internal Server Error' });
                        } else {
                            const email = resultset.rows[0].emp_email;
                            const employeeName = resultset.rows[0].emp_name;
                            console.log('email', email);

                            pool.query('UPDATE users SET reset_flg = \'Y\' WHERE user_id = $1', [userId], (err, done) => {
                                if (err) {
                                    console.error('Error with table query', err);
                                    reject({ error: 'Internal Server Error' });
                                } else {
                                    bcrypt.hash(finalPass, 10, (err, hash) => {
                                        if (err) {
                                            console.error('Error with bcrypt hash', err);
                                            reject({ error: 'Internal Server Error' });
                                        } else {
                                            hashpassword = hash;
                                            console.log(hashpassword);

                                            pool.query('UPDATE users SET password = $1 WHERE user_id = $2', [hash, userId], (err, done) => {
                                                if (err) {
                                                    console.error('Error with table query', err);
                                                    reject({ error: 'Internal Server Error' });
                                                } else {
                                                    pool.query('UPDATE users SET otp = \'\' WHERE user_id = $1', [userId], (err, done) => {
                                                        console.log('posted');
                                                        if (err) {
                                                            console.error('Error with table query', err);
                                                            reject({ error: 'Internal Server Error' });
                                                        } else {
                                                            resolve({ message: 'redirect to reset page', notification: 'OTP verified, mail sent', user_id: userId });
                                                        }
                                                    });
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            }
        });
    });
}

function getUserByuser_idpwd1(user_id, callback) {

    var query = pool.query("SELECT user_name,password,user_id,user_type FROM users WHERE user_id=$1", [user_id], function (err, result) {


        // ,client_ip,session_id ---> it is not present in db
        if (err) throw err;
        callback(null, result);
    });
}

function fetchUserDetails(user_id, callback) {
    const userDetails = {};

    pool.query('SELECT * FROM users WHERE user_id = $1', [user_id], function (err, result) {
        if (err) {
            callback(err, null);
            return;
        }
        userDetails.user_details = result.rows[0];

        pool.query('SELECT * FROM data_emp_info_tbl_temp join emp_master_tbl on data_emp_info_tbl_temp.emp_id =emp_master_tbl.emp_id where data_emp_info_tbl_temp.emp_id=$1 ', [user_id], function (err, result) {
            if (err) {
                callback(err, null);
                return;

            }
            rowCount = result.rowCount;
            if (rowCount > 0) {

                userDetails.emp_details = result.rows[0];
            }
            else {
                userDetails.emp_details = null;

            }

            pool.query('SELECT * FROM leaves WHERE emp_id = $1', [user_id], function (err, result) {
                if (err) {
                    callback(err, null);
                    return;
                }
                userDetails.leave_details = result.rows[0];

                // pool.query('SELECT * FROM holidays', function (err, result) {
                //     if (err) {
                //         callback(err, null);
                //         return;
                //     }
                //     userDetails.holiday_details = result.rows;

                //     // Yash added.........
                //     pool.query('SELECT * FROM leave_master where emp_id=$1', [user_id], function (err, result) {
                //         if (err) {
                //             callback(err, null);
                //             return;
                //         }
                //         userDetails.leave_master = result.rows;

                callback(null, userDetails);

                // });
                // });
            });
        });
    });
}


/ /////////////////////////////////////////////////LOG IN API //////////////////////////////////////////////////////////////



router.post('/forgotpwd', (req, res) => {
    var userid = req.body.empid;
    console.log('userid', userid);
    var ranpass = generatePassword(4, false);
    console.log('ranpass', ranpass);
    finalpass = userid + "@" + ranpass;
    console.log('finalpass', finalpass);



    getUserByuser_idpwd1(userid, function (err, user) {


        if (err) throw err;
        if (user.rowCount == 0) {

            res.json({ notification: "Employee does not exist", message: "redirect to forget page" });
        }
        else {
            pool.query("select emp_email,emp_name from emp_master_tbl where LOWER(emp_id)=LOWER($1)", [userid], function (err, resultset) {
                if (err) throw err;
                var email = resultset.rows['0'].emp_email;
                var employee_name = resultset.rows['0'].emp_name;
                console.log('email', email);

                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: 'mohammadsab@minorks.com',
                        pass: '9591788719'
                    }
                });

                pool.query("update users set reset_flg='Y' where user_id=$1 ", [userid], function (err, done) {
                    // ,client_ip='',session_id='' --> it is not present in db
                    if (err) throw err;
                });
                const mailOptions = {
                    from: 'mohammadsab@minorks.com',
                    to: email,
                    // subject: 'Test Email',

                    subject: 'Forgot Password',
                    html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSyvnOH41NjMz_1n8KlR4I388BASwPfRMNx44Es9Ru17aen8HTLqQ" height="95"><br><br>' +
                        '<h3>Dear ' + employee_name + ',<br><br>' +
                        '<p>Please reset your Password with following details</p><br>' +
                        '<table style="border: 10px solid black;"> ' +
                        '<tr style="border: 10px solid black;"> ' +
                        '<th style="border: 10px solid black;">User Id</th> ' +
                        '<th style="border: 10px solid black;">' + userid + '</th>' +
                        '</tr>' +

                        '<tr style="border: 10px solid black;"> ' +
                        '<th style="border: 10px solid black;">New Password</td> ' +
                        '<th style="border: 10px solid black;">' + finalpass + '</td> ' +
                        '</tr>' +
                        '</table> ' +
                        '<br><br>' +
                        'Kindly do not share your password with anyone else.<br><br>' +
                        'URL: http://amber.nurture.co.in <br><br><br>' +
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

                bcrypt.hash(finalpass, 10, function (err, hash) {

                    hashpassword = finalpass;
                    hashpassword = hash;

                    pool.query("update users set password=$1 where user_id=$2 ", [hash, userid], function (err, done) {
                        //  ,client_ip='',session_id='' ---> these column is not in db
                        if (err) throw err;

                        res.json({ notofication: 'New Password generated successfully and mailed to your registered mail id', message: "redirect to login" });

                    });
                });
            });


        }

    });


});



////////////////////////////////////////////// PROFILE PHOTO ///////////////////////////////////////////////
const storage = multer.diskStorage({
    destination: './uploads',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({ storage });

// API endpoint for file upload
router.post('/upload-profile', upload.single('profile'), (req, res) => {
    const file = req.file;
    console.log(req.body.user_id);
    const user_id = req.body.user_id

    if (!file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }

    // Store the file details in the database
    const query = 'INSERT INTO profiles (filename, mimetype, path,user_name) VALUES ($1, $2, $3,$4)';
    const values = [file.filename, file.mimetype, file.path, user_id];

    pool.query(query, values, (err, result) => {
        if (err) {
            console.error('Error storing profile:', err);
            res.status(500).json({ error: 'Failed to store profile' });
        } else {
            res.json({ message: 'Profile picture uploaded successfully' });
        }
    });
});


//////////////////// for password change / reset/forget /////////////////////////////////////////////////////

router.get('/generateOtp', (req, res) => {
    const empid = req.query.employeeId;
    console.log("emp_id", empid);

    pool.query("SELECT emp_email, emp_name FROM emp_master_tbl WHERE emp_id=$1", [empid], function (err, result) {
        if (err) {
            console.error('Error with table query', err);
        } else {
            var emp_cnt = result.rowCount;
            console.log("emp_cnt", emp_cnt);

            if (emp_cnt > 0) {
                var emp_email = result.rows[0].emp_email;
                console.log("emp_email", emp_email);
                var emp_name = result.rows[0].emp_name;
                console.log("emp_name", emp_name);
                var notification = "OTP SENT";
                console.log("err_display", notification);

                var ranpass = generatePassword(4, false);

                pool.query("UPDATE users SET otp=$2 WHERE user_id=$1", [empid, ranpass], function (err, result) {


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
                        // subject: 'Test Email',
                        subject: 'One Time password for Password Reset',
                        html: '<img src="http://www.smartvision.ae/portals/0/OTP-sms-service.jpg" height="85"><br><br>' +
                            '<h3>Dear <b>' + emp_name + '</b>,<br><br>' +
                            'You are receiving this mail because you (or someone else) has attempted to change your password in <b>Amber</b>.<br>' +
                            'Please go through the below details to change your password : <br><br>' +
                            '<table style="border: 10px solid black;"><tr style="border: 10px solid black;"><th style="border: 10px solid black;">User Id</th><th style="border: 10px solid black;">' + empid + '</th></tr><tr style="border: 10px solid black;"><td style="border: 10px solid black;"> Otp </td><td style="border: 10px solid black;">' + ranpass + '</td></tr></table><br><br>' +
                            'URL: http://localhost:4200/forgotPassword <br><br>' +
                            'Contact HR for any clarifications.<br>' +
                            'Kindly do not share your otp with anyone else.<br><br><br><br>' +
                            '- Regards,<br><br>Amber</h3>'
                        // text: 'This is a test email sent from Node.js using Nodemailer.'
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
            } else {
                var notification = "Employee Id Does not Exist";
                console.log("err_display", notification);
                res.json({ key: notification });
            }
        }
    });
});



router.get('/validateOtp', (req, res) => {
    const empId = req.query.employeeId;
    console.log('emp_id', empId);

    const otp = req.query.otp;
    console.log('otp', otp);

    pool.query('SELECT otp FROM users WHERE user_id = $1', [empId], (err, result) => {
        if (err) {
            console.error('Error with table query', err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else {
            const empCount = result.rowCount;
            console.log('empCount', empCount);

            if (empCount > 0) {
                const tblOtp = result.rows[0].otp;
                console.log('tblOtp', tblOtp);

                if (tblOtp !== otp) {
                    const displayErr = 'Invalid Otp';
                    console.log('displayErr', displayErr);
                    res.json({ key: displayErr });
                } else {
                    console.log('OTP verified, sending email');
                    message = forgotSendMail(empId);
                    message.then((message) => {
                        console.log(message); // Handle the resolved value of the promise
                        res.json(message);
                    }).catch((error) => {
                        console.error('Error with forgotSendMail', error);
                        res.status(500).json({ error: 'Internal Server Error' });
                    });
                    // console.log(message);
                    // res.json(message);
                }
            } else {
                const displayErr = 'Employee Id Does not Exist';
                console.log('displayErr', displayErr);
                res.json({ message: 'redirect to forget page', notification: 'Employee Id Does not Exist' });
            }
        }
    });
});







/// update pwd//



router.post('/updatepwd', (req, res) => {
    var userid = req.body.empid;
    var oldpasscode = req.body.oldpass;
    var newpasscode = req.body.newpass;
    var conpasscode = req.body.conpass;
    var error1 = "";
    var pwdarr = [];

    pool.query("SELECT user_name,password,user_id,user_type FROM users WHERE user_id=$1", [userid], function (err, result) {
        rowCount = result.rowCount;
        console.log(rowCount);
        pwd = result.rows[0];
        console.log(pwd);
        if (err) throw err;
        if (rowCount == 0) {


            res.json({
                Notification: "Employee Id and Password doesn't match",
                message: "redirect to reset page"
            });
        }
        else {

            comparePassword(oldpasscode, pwd.password, function (err, isMatch) {

                if (err) {

                    res.json({
                        Notification: "Employee Id and Password doesn't match",
                        message: "redirect to reset page"
                    });
                }

                if (!isMatch) {

                    res.json({
                        Notification: 'Incorrect Old Password',
                        message: "redirect to reset page"
                    });

                }
                if (isMatch) {

                    comparePasswordpwd(newpasscode, pwd.password, function (err, isMatch) {

                        if (err) throw err;
                        if (isMatch) {
                            res.json({
                                notification: 'New Password cannot be same as Old Password',
                                message: "redirect to reset page"
                            });
                        }
                        else {
                            bcrypt.genSalt(10, function (err, salt) {
                                bcrypt.hash(newpasscode, salt, function (err, hash) {
                                    var storepass = newpasscode;
                                    var storepass = hash;
                                    pool.query('UPDATE users SET password=$1, login_allowed=$2, reset_flg=$3 WHERE user_id=$4', [storepass, 'Y', 'N', userid], function (err, result1) {
                                        // ,client_ip,session_id --> these field not exist in table u need create
                                        if (err) {
                                            console.log(err);
                                        }
                                        else {
                                            console.log("reseted flag");

                                            res.json({
                                                message: "redierct to login",
                                                notification: "pasword updated successfully"
                                            })
                                        }

                                    });
                                });
                            });
                        }
                    });
                }
            });
        }
    })
});


////////////////////////////////////////////////////////////////// login Check //////////////////////////////////////////////////////////////
router.post('/login', (req, res) => {
    const user_id = req.body.userid;
    const password = req.body.password;
    console.log(typeof (user_id), "user ID");
    console.log(typeof (password), "type password");
    if (typeof (user_id) != undefined || user_id != " ") {
        pool.query("SELECT * from users where user_id = $1", [user_id], function (err, result) {

            if (err) {
                console.error('Error fetching photo:', err);
                return res.status(500).json({ error: 'Error fetching photo' });
            }
            var row = result.rowCount;
            var user = result.rows[0];
            var attempts = user.login_attempts
            console.log(user);
            if (row > 0) {


                comparePasswordpwd(password, user.password, function (err, isMatch) {
                    if (err) throw err;
                    if (isMatch) {
                        var hu = ['AU', 'RU'];
                        var queryres = "";
                        var ename = "";
                        var eid = "";
                        var email = "";
                        var desig = "";
                        var unReadCount = "";
                        var docPendingCount = 0;
                        var now = new Date();
                        module.exports.usertype = "";
                        module.exports.users = "";
                        module.exports.usercount = "";
                        module.exports.lastlogin = "";
                        module.exports.role = "";
                        module.exports.userid = "";
                        module.exports.reportcounts = "";
                        module.exports.downloadcounts = "";
                        module.exports.datecheck = "";
                        module.exports.sessiontimeout = "";
                        module.exports.activeuser = "";
                        module.exports.user_email = "";
                        module.exports.username = "";
                        module.exports.email = "";
                        module.exports.listofrecords = "";
                        module.exports.profilepic = "";
                        module.exports.reminderlist = "";
                        module.exports.reminderlist_count = "";
                        module.exports.reminderlist_past = "";

                        var emp_access = user.user_type;
                        pool.query("SELECT reset_flg FROM users where user_id=$1", [user_id], function (err, flg) {
                            if (err) {
                                console.error('Error with table query', err)
                            }
                            var check = flg.rows['0'].reset_flg;
                            if (check == 'Y') {
                                res.json({
                                    message: "redirect to reset",
                                    notification: "Please Change The Default Password and Proceed",
                                    data: user
                                })

                            }
                        })

                        if (emp_access === 'A1') {
                            pool.query('SELECT * FROM users WHERE user_id = $1', [user_id], function (err, result) {
                                if (err) {
                                    callback(err, null);
                                    return;
                                }
                                const userDetails = result.rows[0];

                                res.redirect(`/employeeDetails/admindashboard?userId=${user_id}&userType=${emp_access}`);

                            })

                        }
                        else {
                            pool.query("SELECT login_check,LOWER(user_id),user_type,expiry_date from users where LOWER(user_id) = LOWER($1) and (expiry_date>=$2 and login_allowed=$3) and(del_flag=$4)", [user_id, now, 'Y', 'N'], function (err, result) {
                                if (err) throw err;

                                if (result.rows['0'] != null) {
                                    console.log("within case check");
                                    logincheck = result.rows['0'].login_check;
                                    if (logincheck == "N") {
                                        userid = result.rows['0'].user_id;
                                        queryres = result.rows['0'].user_type;
                                        datecheck = result.rows['0'].expiry_date;
                                        console.log('user_type', queryres);
                                        attempts = 0;

                                        pool.query("UPDATE users SET login_attempts=$1,login_check=$2,reset_flg='N' where LOWER(user_id)=LOWER($3)", [attempts, 'Y', user_id]);
                                        console.log("after update");
                                        fetchUserDetails(user_id, function (err, userDetails) {
                                            if (err) {
                                                console.error(err);
                                                // Handle the error case
                                                return;
                                            }
                                            // Access the userDetails object here
                                            const detail = userDetails;



                                            res.json({ message: "redirect to dashboard", notification: "login Successful", Data: detail });

                                        });

                                    }
                                    else {
                                        fetchUserDetails(user_id, function (err, userDetails) {
                                            if (err) {
                                                console.error(err);
                                                // Handle the error case
                                                return;
                                            }
                                            // Access the userDetails object here
                                            const detail = userDetails;


                                            res.json({ message: "redirect to dashboard", notification: "login Successful", Data: detail });

                                        });


                                    }
                                }
                                else if (attempts < 4) {

                                    attempts++;
                                    console.log(attempts);
                                    console.log();
                                    pool.query("UPDATE users SET login_attempts=$1 WHERE LOWER(user_id)=LOWER($2)", [attempts, user.user_id]);
                                    return res.json({ notification: 'Wrong Passcode. Please try again. ' + (4 - attempts) + ' attempts remaining.', message: "redirect to login" });
                                }
                                else {

                                    fetchUserDetails(user_id, function (err, userDetails) {
                                        if (err) {
                                            console.error(err);
                                            // Handle the error case
                                            return;
                                        }
                                        // Access the userDetails object here
                                        const detail = userDetails;


                                        res.json({ message: "redirect to dashboard", notification: "login Successful", Data: detail });

                                    });

                                    pool.query("UPDATE users SET login_allowed=$1,login_attempts=$2 WHERE LOWER(user_id)=LOWER($3)", ['N', attempts, user.username]);

                                    res.json({ message: "redirect to login", notification: "Your Account is locked. Please Contact administration" })
                                }
                            })

                        }

                    }
                    else {
                        return res.json({ message: "redirect to login", notification: "incorrect password" });
                    }

                });
            } else {
                return res.json({ message: "redirect to login", notification: "please Enter User ID and Password" });
            }


        });
    } else {
        res.json({ message: "redirect to login", notification: "User ID does not  exist" })
    }
})





//////////////////////////////////////////////////////////////////////// LOG OUT //////////////////////////////////////////////////////////////////////////////////


router.get('/logout', (req, res) => {
    const user_id = req.query.user_id;

    // console.log('user_type',req.user.rows['0'].user_type)
    // console.log('emp_name',req.user.rows['0'].user_name)

    pool.query("UPDATE users SET login_check=$1,client_ip='',session_id='' where user_id=$2", ['N', user_id],
        function (err, result) {
            if (err) throw err;


            res.json({ message: "redirect to login", notification: "You are successfully Logged Out" })

        }
    );


});


module.exports = router;
