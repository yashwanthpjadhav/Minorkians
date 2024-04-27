console.log("Employee Details");
var loginjs = require('../loginModule/login')

var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var app = express();
var Promise = require('mpromise');
var pool = require('../Database/dbconfig');
var nodemailer = require('nodemailer');

var bcrypt = require('bcryptjs');
var generatePassword = require("password-generator");
var { format } = require('date-fns')
router.use(express.json())



//////////////////////////////////// Employee Admin View starts Here ////////////////////////////////
router.get('/employeeDetails', function (req, res) {
	res.header('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');

	var empId = req.query.user_id;

	pool.query("SELECT comm_code_id, comm_code_desc FROM common_code_tbl WHERE code_id = 'BLG' ORDER BY comm_code_id ASC", (err, result) => {
		if (err) {
			reject(err);
			return;
		}
		const comm_code_blood = result.rows;
		const comm_code_blood_count = result.rowCount;

		pool.query("SELECT comm_code_id, comm_code_desc FROM common_code_tbl WHERE code_id = 'SHR' ORDER BY comm_code_id ASC", (err, result) => {
			if (err) {
				reject(err);
				return;
			}
			const comm_code_shirt = result.rows;
			const comm_code_shirt_count = result.rowCount;

			pool.query("SELECT comm_code_id, comm_code_desc FROM common_code_tbl WHERE code_id = 'STA' ORDER BY comm_code_id ASC", (err, result) => {
				if (err) {
					reject(err);
					return;
				}
				const comm_code_state = result.rows;
				const comm_code_state_count = result.rowCount;

				pool.query("SELECT comm_code_id, comm_code_desc FROM common_code_tbl WHERE code_id = 'MAR' ORDER BY comm_code_id ASC", (err, result) => {
					if (err) {
						reject(err);
						return;
					}
					const comm_code_maritalstatus = result.rows;
					const comm_code_maritalstatus_count = result.rowCount;

					pool.query("SELECT comm_code_id, comm_code_desc FROM common_code_tbl WHERE code_id = 'DSG' ORDER BY comm_code_id ASC", (err, result) => {
						if (err) {
							reject(err);
							return;
						}
						const comm_code_dsg = result.rows;
						const comm_code_dsg_count = result.rowCount;

						pool.query("SELECT comm_code_id, comm_code_desc FROM common_code_tbl WHERE code_id = 'PCR' ORDER BY comm_code_id ASC", (err, result) => {
							if (err) {
								reject(err);
								return;
							}
							const comm_code_curr = result.rows;
							const comm_code_cur_count = result.rowCount;

							pool.query("SELECT comm_code_id, comm_code_desc FROM common_code_tbl WHERE code_id = 'ACC' ORDER BY comm_code_id ASC", (err, result) => {
								if (err) {
									reject(err);
									return;
								}
								const comm_code_class = result.rows;
								const comm_code_class_count = result.rowCount;

								pool.query("SELECT comm_code_id, comm_code_desc FROM common_code_tbl WHERE code_id = 'RPT' ORDER BY comm_code_id ASC", (err, result) => {
									if (err) {
										reject(err);
										return;
									}
									const comm_code_rpt = result.rows;
									const comm_code_rpt_count = result.rowCount;

									const cocd = {
										comm_code_blood,
										comm_code_blood_count,
										comm_code_shirt,
										comm_code_shirt_count,
										comm_code_state,
										comm_code_state_count,
										comm_code_maritalstatus,
										comm_code_maritalstatus_count,
										comm_code_curr,
										comm_code_cur_count,
										comm_code_class,
										comm_code_class_count,
										comm_code_rpt,
										comm_code_rpt_count,
										comm_code_dsg,
										comm_code_dsg_count
									};

									res.json({cocd:cocd})
								});
							});
						});
					});
				});
			});
		});
	});
});

/////////////////////////// View other employee details /////////////////////////
//to view all employee detailslogged

router.get('/employeeDetailsView', function (req, res) {
	var empId = req.query.employeeId;
	console.log(empId);

	pool.query("SELECT user_type from users where user_id = $1", [empId], function (err, result) {
		const emp_access = result.rows['0'].user_type;

		// if (emp_access != "A1") {
		// res.json({ message: "redirect ot dashboard" });
		// }
		// else {

		var empid = "";
		var empName = "";
		var email = "";
		var empAccess = "";
		var jDate = "";
		var desig = "";
		var empClass = "";
		var salary = "";
		var salary_curr = "";
		var salary_curr_desc = "";
		var pid = "";
		var rptMan = "";
		var rptMan_desc = "";
		var probPeriod = "";
		var preem = "";
		var preExpyear = "";
		var preExpmonth = "";
		var preEmp = "";
		var preEmp2 = "";
		var preEmp3 = "";
		var preEmp4 = "";
		var preEmp5 = "";
		var gender = "";
		var dob = "";
		var bgroup = "";
		var shirt = "";
		var commAdd = "";
		var state = "";
		var city = "";
		var pincode = "";
		var resAdd = "";
		var state1 = "";
		var city1 = "";
		var pincode1 = "";
		var mobNum = "";
		var telNum = "";
		var econNum = "";
		var emerPer = "";
		var fathersName = "";
		var mothersName = "";
		var maritalstatus = "";
		var spouseName = "";
		var panNum = "";
		var passNum = "";
		var aadhaarNum = "";
		var dlNum = "";
		var uan = "";
		var nameinBank = "";
		var bankName = "";
		var branchName = "";
		var acctNum = "";
		var ifscCode = "";
		var enFlg = "";
		var cflag = "";

		pool.query("SELECT emp_id from emp_master_tbl order by emp_id asc", function (err, result) {
			employee = result.rows;
			emp_id_count = result.rowCount;

			pool.query("SELECT emp_name from emp_master_tbl order by emp_id asc", function (err, result) {
				empname = result.rows;
				empname_count = result.rowCount;

				res.json({
					message: "redirect to emp detailsview", data: {
						emp_access: emp_access,
						// ename: req.user.rows['0'].user_name,
						eid: req.query.user_id,
						employee: employee,
						emp_id_count: emp_id_count,
						empname: empname,
						empid: empid,
						empName: empName,
						email: email,
						empAccess: empAccess,
						jDate: jDate,
						desig: desig,
						empClass: empClass,
						salary: salary,
						salary_curr: salary_curr,
						salary_curr_desc: salary_curr_desc,
						pid: pid,
						rptMan: rptMan,
						rptMan_desc: rptMan_desc,
						probPeriod: probPeriod,
						preem: preem,
						preExpyear: preExpyear,
						preExpmonth: preExpmonth,
						preEmp: preEmp,
						preEmp2: preEmp2,
						preEmp3: preEmp3,
						preEmp4: preEmp4,
						preEmp5: preEmp5,
						gender: gender,
						dob: dob,
						bgroup: bgroup,
						shirt: shirt,
						commAdd: commAdd,
						state: state,
						city: city,
						pincode: pincode,
						resAdd: resAdd,
						state1: state1,
						city1: city1,
						pincode1: pincode1,
						mobNum: mobNum,
						telNum: telNum,
						econNum: econNum,
						emerPer: emerPer,
						fathersName: fathersName,
						mothersName: mothersName,
						maritalstatus: maritalstatus,
						spouseName: spouseName,
						panNum: panNum,
						passNum: passNum,
						aadhaarNum: aadhaarNum,
						dlNum: dlNum,
						uan: uan,
						nameinBank: nameinBank,
						bankName: bankName,
						branchName: branchName,
						acctNum: acctNum,
						ifscCode: ifscCode,
						enFlg: enFlg,
						cflag: cflag
						//closing bracket of render
					}
				});

			});
		});
		// }
	});
});
/////////////////////////////////// Admin Modify Employee Professinal Details  is pending../////////////////////////////////////////////////////////////////////////////
router.post('/addmodempdet', function (req, res) {
	console.log(req.body);
	var now = new Date();
	var rcreuserid = req.body.user_id;
	var rcretime = now;
	var lchguserid = req.body.user_id;
	var lchgtime = now;
	var empid = req.body.empid;
	var empName = req.body.empName;
	var email = req.body.email;
	var empAccess = req.body.empAccess;
	var jDate = req.body.jDate;
	var desig = req.body.desig;
	var empClass = req.body.empClass;
	var salary = req.body.salary;
	var sal_curr = req.body.sal_curr;
	var rptMan = req.body.rptMan;
	var probPeriod = req.body.probPeriod;
	var preem = req.body.preem;
	if (preem == "Y") {
		var preExpyear = req.body.preExpyear;
		var preExpmonth = req.body.preExpmonth;
		var preEmp = req.body.preEmp;
		var preEmp2 = req.body.preEmp2;
		var preEmp3 = req.body.preEmp3;
		var preEmp4 = req.body.preEmp4;
		var preEmp5 = req.body.preEmp5;
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

	var entity_cre_flg = "Y";

	pool.query("select * from emp_master_tbl_hist where emp_id = $1", [empid], function (err, done) {
		var hist_count = done.rowCount;


		if (hist_count == "1") {

			pool.query("delete from emp_master_tbl_hist where emp_id = $1", [empid], function (err, done) {
				if (err) throw err;
			});

			pool.query("insert into emp_master_tbl_hist select * from emp_master_tbl where emp_id=$1 ", [empid], function (err, result) {
				if (err) throw err;
			});
		}
		else {

			pool.query("insert into emp_master_tbl_hist select * from emp_master_tbl where emp_id=$1 ", [empid], function (err, result) {
				if (err) throw err;
			});
		}


		pool.query("UPDATE emp_master_tbl set emp_name=$2,emp_email=$3,emp_access=$4,joining_date=$5,designation=$6,salary=$7,reporting_mgr=$8,emp_prob=$9,prev_expr_year=$10,prev_expr_month=$11,prev_empr=$12,prev_empr2=$13,prev_empr3=$14,prev_empr4=$15,prev_empr5=$16,del_flg=$17,rcre_user_id=$18,rcre_time=$19,lchg_user_id=$20,lchg_time=$21,entity_cre_flg=$22,pre_emp_flg=$23,emp_classification=$24,salary_curr=$25 where emp_id=$1", [empid, empName, email, empAccess, jDate, desig, salary, rptMan, probPeriod, preExpyear, preExpmonth, preEmp, preEmp2, preEmp3, preEmp4, preEmp5, 'N', rcreuserid, rcretime, lchguserid, lchgtime, entity_cre_flg, preem, empClass, sal_curr], function (err, done) {
			if (err) throw err;

			pool.query("UPDATE users set user_type=$2 where user_id=$1", [empid, empAccess], function (err, done) {
				if (err) throw err;



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
					subject: 'Modification made on your Professional Details',
					html: '<h3><p> Dear <b> ' + empName + ' </b> , <br><br>' +
						'You are receiving this mail because HR has modified your Professional details.<br>' +
						'Please go through the details and cross check from your end<br>' +
						'In case of any clarifications/concerns feel free to contact HR.<br>' +
						'URL: http://amber.nurture.co.in <br><br><br><br><br>' +
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
		});
	});

	// req.flash('success', "Employee Professional Details has been Modified sucessfully for the Employee Id :" + empid + ".")
	// res.redirect('/employeeModule/employeeDetails/employeeDetailsModify');
	res.json({
		message: "redirect to modify employeeDetails", notification: "Employee Professional Details has been Modified sucessfully for the Employee Id :" + empid + "."
	})

})
/////////////////////////////////////////// View Emp Details//////////////////////////////////////////////////////////////////////////////////////
router.post('/viewempdet', (req, res) => {

	var user_id = req.body.userid;
	console.log(user_id);

	var empId = req.body.Item.employeeId;
	console.log(empId);
	console.log("enter");

	pool.query("SELECT user_type from users where user_id = $1", [user_id], function (err, result) {
		const user_type = result.rows['0'].user_type;
		if (user_type == 'A1') {

			pool.query("SELECT user_type from users where user_id = $1", [empId], function (err, result) {

				emp_access = result.rows['0'].user_type;

				pool.query("SELECT * from emp_master_tbl where LOWER(emp_id)=LOWER($1)", [empId], function (err, check) {
					rcount_master = check.rowCount;

					pool.query("SELECT * from emp_info_tbl where LOWER(emp_id)=LOWER($1)", [empId], function (err, test) {
						rcount_info = test.rowCount;

						pool.query("SELECT * from emp_info_tbl_temp where LOWER(emp_id)=LOWER($1)", [empId], function (err, test) {
							var flag = test.rowCount;

							pool.query("SELECT * from emp_info_tbl where LOWER(emp_id)=LOWER($1)", [empId], function (err, main) {
								var mflag = main.rowCount;

								var cflag = "Y";

								if (flag == 1) {
									var enFlg = "N";
								}

								if (mflag == 1) {
									var enFlg = "Y";
								}

								if (flag == mflag) {
									var enFlg = "N";
								}

								if (rcount_master == rcount_info) {

									//query 1 to fetch professional details

									pool.query('select * from emp_master_tbl where emp_id=$1', [empId], function (err, resultset) {
										if (err) throw err;
										console.log(resultset.rows);

										var empid = resultset.rows['0'].emp_id;
										var empName = resultset.rows['0'].emp_name;
										var email = resultset.rows['0'].emp_email;
										var empAccess = resultset.rows['0'].emp_access;
										var jDate = resultset.rows['0'].joining_date;
										var jDate = jDate//dateFormat(jDate, "yyyy-mm-dd");
										var desig = resultset.rows['0'].designation;
										var empClass = resultset.rows['0'].emp_classification;
										var salary = resultset.rows['0'].salary;
										var salary_curr = resultset.rows['0'].salary_curr;
										var rptMan = resultset.rows['0'].reporting_mgr;
										var probPeriod = resultset.rows['0'].emp_prob;
										var preem = resultset.rows['0'].pre_emp_flg;
										var preExpyear = resultset.rows['0'].prev_expr_year;
										var preExpmonth = resultset.rows['0'].prev_expr_month;
										var preEmp = resultset.rows['0'].prev_empr;
										var preEmp2 = resultset.rows['0'].prev_empr2;
										var preEmp3 = resultset.rows['0'].prev_empr3;
										var preEmp4 = resultset.rows['0'].prev_empr4;
										var preEmp5 = resultset.rows['0'].prev_empr5;


										pool.query("select * from project_alloc_tbl where emp_id = $1", [empid], function (err, resultset) {
											if (err) throw err;
											pidcount = resultset.rowCount;

											if (pidcount > 1) {
												var pid = "MULTIPLE";

											}

											if (pidcount == 1) {
												pool.query("select project_id from project_alloc_tbl where emp_id = $1", [empid], function (err, resultset) {
													if (err) throw err;
													pid = resultset.rows['0'].project_id;
												});
											}

											if (pidcount == 0) {
												var pid = "Not Allocated";

											}

											//query 2 to fetch personal details
											pool.query("select gender,dob,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,phone1,phone2,father_name,mother_name,martial_status,spouse_name,pan_number,passport_num,aadhaar_num,license_num,blood_group,shirt_size,emergency_num,emergency_con_person,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code from emp_info_tbl where LOWER(emp_id)=LOWER($1)", [empId], function (err, result) {
												if (err) throw err;
												console.log(result.rows, "enterrrr");
												var gender = result.rows['0'].gender;
												var dob = result.rows['0'].dob;
												var dob = jDate// dateFormat(dob, "yyyy-mm-dd");
												var bgroup = result.rows['0'].blood_group;
												var shirt = result.rows['0'].shirt_size;
												var commAdd = result.rows['0'].comm_addr1;
												var state = result.rows['0'].state;
												var city = result.rows['0'].city;
												var pincode = result.rows['0'].pincode;
												var resAdd = result.rows['0'].comm_addr2;
												var state1 = result.rows['0'].state1;
												var city1 = result.rows['0'].city1;
												var pincode1 = result.rows['0'].pincode1;
												var mobNum = result.rows['0'].phone1;
												var telNum = result.rows['0'].phone2;
												var econNum = result.rows['0'].emergency_num;
												var emerPer = result.rows['0'].emergency_con_person;
												var fathersName = result.rows['0'].father_name;
												var mothersName = result.rows['0'].mother_name;
												var maritalstatus = result.rows['0'].martial_status;
												var spouseName = result.rows['0'].spouse_name;
												var panNum = result.rows['0'].pan_number;
												var passNum = result.rows['0'].passport_num;
												var aadhaarNum = result.rows['0'].aadhaar_num;
												var dlNum = result.rows['0'].license_num;
												var uan = result.rows['0'].uan_num;
												var nameinBank = result.rows['0'].name_in_bank;
												var bankName = result.rows['0'].bank_name;
												var branchName = result.rows['0'].branch_name;
												var acctNum = result.rows['0'].account_num;
												var ifscCode = result.rows['0'].ifsc_code;

												//Setting Values for designation List

												pool.query("select comm_code_desc from common_code_tbl where code_id='ACC' and comm_code_id=$1", [empAccess], function (err, resultset) {
													empAccess = resultset.rows['0'].comm_code_desc;

													//Setting Values for designation List

													pool.query("select emp_name from emp_master_tbl where emp_id=$1", [rptMan], function (err, resultset) {
														rptMan_desc = resultset.rows['0'].emp_name;

														//Setting Values for designation List

														pool.query("select comm_code_desc from common_code_tbl where code_id='DSG' and comm_code_id=$1", [desig], function (err, resultset) {
															desig = resultset.rows['0'].comm_code_desc;

															//Setting Values for Marriage List

															pool.query("select comm_code_desc from common_code_tbl where code_id='MAR' and comm_code_id=$1", [maritalstatus], function (err, resultset) {
																maritalstatus = resultset.rows['0'].comm_code_desc;

																//Setting Values for Gender List

																if (gender == "M") { gender = "MALE"; }
																if (gender == "F") { gender = "FEMALE"; }

																//Setting Values for Gender List

																if (probPeriod == "Y") { probPeriod = "YES"; }
																if (probPeriod == "N") { probPeriod = "NO"; }

																// setting values for previous experience
																if (preem == "Y") { preem = "YES"; }
																if (preem == "N") { preem = "NO"; }

																//Setting Values for Shirt List

																pool.query("select comm_code_desc from common_code_tbl where code_id='BLG' and comm_code_id=$1", [bgroup], function (err, resultset) {
																	bgroup = resultset.rows['0'].comm_code_desc;

																	//Setting Values for Shirt List

																	pool.query("select comm_code_desc from common_code_tbl where code_id='SHR' and comm_code_id=$1", [shirt], function (err, resultset) {
																		shirt = resultset.rows['0'].comm_code_desc;

																		//Setting Values for State List

																		pool.query("select comm_code_desc from common_code_tbl where code_id='STA' and comm_code_id=$1", [state], function (err, resultset) {
																			state = resultset.rows['0'].comm_code_desc;

																			//Setting Values for State List

																			// pool.query("select comm_code_desc from common_code_tbl where code_id='STA' and comm_code_id=$1", [state1], function (err, resultset) {

																			pool.query("select comm_code_desc from common_code_tbl where code_id='PCR' and comm_code_id=$1", [salary_curr], function (err, resultset) {
																				salary_curr_desc = resultset.rows['0'].comm_code_desc;
																				console.log("check1");

																				res.json({
																					message: 'redirect to employee details view', data: {
																						enFlg: enFlg,
																						cflag: cflag,
																						emp_access: emp_access,
																						// ename: req.user.rows['0'].user_name,
																						// eid: req.user.rows['0'].user_id,
																						empid: empid,
																						emp_name: empName,
																						emp_email: email,
																						emp_access: empAccess,
																						joining_date: jDate,
																						designation: desig,
																						emp_classification: empClass,
																						salary: salary,
																						// salary_curr: salary_curr,
																						// salary_curr_desc: salary_curr_desc,
																						project_id: pid,
																						reporting_mgr: rptMan,
																						rptman_desc: rptMan_desc,
																						preem: preem,
																						emp_prob: probPeriod,
																						prev_expr_year: preExpyear,
																						prev_expr_month: preExpmonth,
																						prev_empr: preEmp,
																						prev_empr2: preEmp2,
																						prev_empr3: preEmp3,
																						prev_empr4: preEmp4,
																						prev_empr5: preEmp5,
																						gender: gender,
																						dob: dob,
																						blood_group: bgroup,
																						shirt_size: shirt,
																						com_addr1: commAdd,
																						state: state,
																						city: city,
																						pincode: pincode,
																						comm_addr2: resAdd,
																						state1: state1,
																						city1: city1,
																						pincode1: pincode1,
																						phone1: mobNum,
																						phone2: telNum,
																						emergency_num: econNum,
																						emergency_con_person: emerPer,
																						father_name: fathersName,
																						mother_name: mothersName,
																						martial_status: maritalstatus,
																						spouse_name: spouseName,
																						pan_number: panNum,
																						passport_num: passNum,
																						aadhaar_num: aadhaarNum,
																						license_num: dlNum,
																						uan_num: uan,
																						name_in_bank: nameinBank,
																						bank_name: bankName,
																						branch_name: branchName,
																						account_num: acctNum,
																						ifsc_code: ifscCode
																						//closing bracket of query1
																					}
																				});
																				//closing bracket of query1
																			});
																			//closing bracket of query2
																			// });
																		});
																	});
																});
															});
														});
													});
												});
											});
										});
									});
									//closing of if loop
								}
								else {
									//query 1 to fetch professional details
									pool.query("select emp_id,emp_name,emp_email,emp_access,joining_date,designation,salary,reporting_mgr,prev_expr_year,prev_expr_month,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5,emp_prob,pre_emp_flg,emp_classification from emp_master_tbl where LOWER(emp_id)=LOWER($1)", [empId], function (err, resultset) {
										// ,salary_curr--> it is not present in db
										pool.query("select gender,dob,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,phone1,phone2,father_name,mother_name,martial_status,spouse_name,pan_number,passport_num,aadhaar_num,license_num,blood_group,shirt_size,emergency_num,emergency_con_person,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code from data_emp_info_tbl_temp where LOWER(emp_id)=LOWER($1)", [empId], function (err, result) {
											if (err) throw err;
											var empid = resultset.rows['0'].emp_id;
											var empName = resultset.rows['0'].emp_name;
											var email = resultset.rows['0'].emp_email;
											var empAccess = resultset.rows['0'].emp_access;
											var jDate = resultset.rows['0'].joining_date;
											var jDate = jDate //dateFormat(jDate, "yyyy-mm-dd");
											var desig = resultset.rows['0'].designation;
											var empClass = resultset.rows['0'].emp_classification;
											var salary = resultset.rows['0'].salary;
											// var salary_curr = resultset.rows['0'].salary_curr;
											var rptMan = resultset.rows['0'].reporting_mgr;
											var probPeriod = resultset.rows['0'].emp_prob;
											var preem = resultset.rows['0'].pre_emp_flg;
											var preExpyear = resultset.rows['0'].prev_expr_year;
											var preExpmonth = resultset.rows['0'].prev_expr_month;
											var preEmp = resultset.rows['0'].prev_empr;
											var preEmp2 = resultset.rows['0'].prev_empr2;
											var preEmp3 = resultset.rows['0'].prev_empr3;
											var preEmp4 = resultset.rows['0'].prev_empr4;
											var preEmp5 = resultset.rows['0'].prev_empr5;




											var gender = result.rows['0'].gender;
											var dob = result.rows['0'].dob;
											var dob = jDate// dateFormat(dob, "yyyy-mm-dd");
											var bgroup = result.rows['0'].blood_group;
											var shirt = result.rows['0'].shirt_size;
											var commAdd = result.rows['0'].comm_addr1;
											var state = result.rows['0'].state;
											var city = result.rows['0'].city;
											var pincode = result.rows['0'].pincode;
											var resAdd = result.rows['0'].comm_addr2;
											var state1 = result.rows['0'].state1;
											var city1 = result.rows['0'].city1;
											var pincode1 = result.rows['0'].pincode1;
											var mobNum = result.rows['0'].phone1;
											var telNum = result.rows['0'].phone2;
											var econNum = result.rows['0'].emergency_num;
											var emerPer = result.rows['0'].emergency_con_person;
											var fathersName = result.rows['0'].father_name;
											var mothersName = result.rows['0'].mother_name;
											var maritalstatus = result.rows['0'].martial_status;
											var spouseName = result.rows['0'].spouse_name;
											var panNum = result.rows['0'].pan_number;
											var passNum = result.rows['0'].passport_num;
											var aadhaarNum = result.rows['0'].aadhaar_num;
											var dlNum = result.rows['0'].license_num;
											var uan = result.rows['0'].uan_num;
											var nameinBank = result.rows['0'].name_in_bank;
											var bankName = result.rows['0'].bank_name;
											var branchName = result.rows['0'].branch_name;
											var acctNum = result.rows['0'].account_num;
											var ifscCode = result.rows['0'].ifsc_code;



											pool.query("select * from project_alloc_tbl where emp_id = $1", [empid], function (err, resultset) {
												if (err) throw err;
												pidcount = resultset.rowCount;
												if (pidcount > 1) {
													var pid = "MULTIPLE";

												}

												if (pidcount == 1) {
													pool.query("select project_id from project_alloc_tbl where emp_id = $1", [empid], function (err, resultset) {
														if (err) throw err;
														pid = resultset.rows['0'].project_id;
													});
												}

												if (pidcount == 0) {
													var pid = "Not Allocated";
												}

												//Setting Values for designation List

												pool.query("select comm_code_desc from common_code_tbl where code_id='ACC' and comm_code_id=$1", [empAccess], function (err, resultset) {
													empAccess = resultset.rows['0'].comm_code_desc;

													pool.query("select emp_name from emp_master_tbl where emp_id=$1", [rptMan], function (err, resultset) {

														rptMan_desc = resultset.rows['0'].emp_name;

														//Setting Values for designation List

														pool.query("select comm_code_desc from common_code_tbl where code_id='DSG' and comm_code_id=$1", [desig], function (err, resultset) {
															desig = resultset.rows['0'].comm_code_desc;

															pool.query("select comm_code_desc from common_code_tbl where code_id='CURR' and comm_code_id=$1", [desig], function (err, resultset) {
																// salary_curr_desc = resultset.rows['0'].comm_code_desc;

																//Setting Values for Gender List

																if (gender == "M") { gender = "MALE"; }
																if (gender == "F") { gender = "FEMALE"; }

																//Setting Values for Gender List

																if (probPeriod == "Y") { probPeriod = "YES"; }
																if (probPeriod == "N") { probPeriod = "NO"; }

																// setting values for previous experience
																if (preem == "Y") { preem = "YES"; }
																if (preem == "N") { preem = "NO"; }
																console.log("check2");
																res.json({
																	message: 'redirect to employee details view', data: {
																		enFlg: enFlg,
																		cflag: cflag,
																		emp_access: emp_access,
																		// ename: req.user.rows['0'].user_name,
																		// eid: req.user.rows['0'].user_id,
																		empid: empid,
																		emp_name: empName,
																		emp_email: email,
																		emp_access: empAccess,
																		joining_date: jDate,
																		designation: desig,
																		emp_classification: empClass,
																		salary: salary,
																		// salary_curr: salary_curr,
																		// salary_curr_desc: salary_curr_desc,
																		project_id: pid,
																		reporting_mgr: rptMan,
																		rptman_desc: rptMan_desc,
																		preem: preem,
																		emp_prob: probPeriod,
																		prev_expr_year: preExpyear,
																		prev_expr_month: preExpmonth,
																		prev_empr: preEmp,
																		prev_empr2: preEmp2,
																		prev_empr3: preEmp3,
																		prev_empr4: preEmp4,
																		prev_empr5: preEmp5,
																		gender: gender,
																		dob: dob,
																		blood_group: bgroup,
																		shirt_size: shirt,
																		com_addr1: commAdd,
																		state: state,
																		city: city,
																		pincode: pincode,
																		comm_addr2: resAdd,
																		state1: state1,
																		city1: city1,
																		pincode1: pincode1,
																		phone1: mobNum,
																		phone2: telNum,
																		emergency_num: econNum,
																		emergency_con_person: emerPer,
																		father_name: fathersName,
																		mother_name: mothersName,
																		martial_status: maritalstatus,
																		spouse_name: spouseName,
																		pan_number: panNum,
																		passport_num: passNum,
																		aadhaar_num: aadhaarNum,
																		license_num: dlNum,
																		uan_num: uan,
																		name_in_bank: nameinBank,
																		bank_name: bankName,
																		branch_name: branchName,
																		account_num: acctNum,
																		ifsc_code: ifscCode
																		//closing bracket of query1
																	}
																});
															});
														});
													});
												});
											});
										});
									});
									//closing of else loop
								}
								//closing of check
							});
						});
						//closing of test
					});
				});

			});
		}
		else {
			res.json({ message: "redirect to serchmodify", notification: "user Dont have access" })
		}
		//closing of function
	});

});

//////////////////////////////////////////// Adding Employee Details ////////////////////////////////

router.get('/employeeAddpersonal', (req, res) => {

	var empId = req.user_id;
	console.log(req.user_id);

	pool.query("SELECT * from emp_info_tbl where emp_id = $1", [empId], function (err, result) {
		mtbl = result.rowCount;

		pool.query("SELECT * from emp_info_tbl_temp where emp_id = $1", [empId], function (err, result) {
			ttbl = result.rowCount;

			pool.query("SELECT * from data_emp_info_tbl_temp where emp_id = $1", [empId], function (err, result) {
				dtbl = result.rowCount;

				pool.query("SELECT user_type from users where user_id = $1", [empId], function (err, result) {
					emp_access = result.rows['0'].user_type;

					if (emp_access == "A1") {
						res.redirect('/admin-dashboard/adminDashboard/admindashboard');
					}
					else {

						pool.query("SELECT emp_id from emp_master_tbl where emp_id = $1", [empId], function (err, result) {
							empid = result.rows['0'].emp_id;

							pool.query("SELECT emp_name from emp_master_tbl where emp_id = $1", [empId], function (err, result) {
								empName = result.rows['0'].emp_name;

								// to fetch blood group
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

												res.render('employeeModule/employeeAddpersonal', {
													mtbl: mtbl,
													ttbl: ttbl,
													dtbl: dtbl,
													emp_access: emp_access,
													ename: req.user.rows['0'].user_name,
													eid: req.user.rows['0'].user_id,
													empid: empid,
													empName: empName,
													comm_code_blood: comm_code_blood,
													comm_code_blood_count: comm_code_blood_count,
													comm_code_shirt: comm_code_shirt,
													comm_code_shirt_count: comm_code_shirt_count,
													comm_code_state: comm_code_state,
													comm_code_state_count: comm_code_state_count

												});
											});
										});
									});
								});
							});
						});
					}
				});
			});
		});
	});
});



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
	var bankName = req.body.bankname;
	var branchName = req.body.branchname;
	var acctNum = req.body.accountnum;
	var ifscCode = req.body.ifsccode;
	var entity_cre_flg = "N";

	pool.query("SELECT * from data_emp_master_tbl_temp e where LOWER(e.emp_id) = LOWER($1)", [empid], function (err, resultset) {
		if (err) throw err;
		var mcount = resultset.rowCount;

		pool.query("SELECT * from data_emp_info_tbl_temp e where LOWER(e.emp_id) = LOWER($1)", [empid], function (err, resultset) {
			if (err) throw err;
			var tcount = resultset.rowCount;

			pool.query("SELECT * from emp_info_tbl where emp_id = $1", [empid], function (err, result) {
				var main_count = result.rowCount;
				console.log("main_count", main_count);

				pool.query("SELECT * from emp_info_tbl_temp where emp_id = $1", [empid], function (err, result) {
					var maintmp_count = result.rowCount;
					console.log("main_counttmp", maintmp_count);

					if (main_count == 0) {
						if (maintmp_count == 0) {
							if (mcount == 0) {
								if (tcount == 0) {
									pool.query("INSERT INTO data_emp_info_tbl_temp(emp_id,emp_name,gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code,del_flg,entity_cre_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38)", [empid, empName, gender, dob, bgroup, shirt, commAdd, state, city, pincode, resAdd, state1, city1, pincode1, maritalstatus, mobNum, telNum, econNum, emerPer, fathersName, mothersName, spouseName, panNum, passNum, dlNum, aadhaarNum, uan, nameinBank, bankName, branchName, acctNum, ifscCode, 'N', entity_cre_flg, rcreuserid, rcretime, lchguserid, lchgtime], function (err, done) {
										if (err) throw err;

										res.json({
											notification: "Employee Details Captured successfully",
											message: "redirect to login page"
										});
									});
								} else {
									const message = {
										notification: "Record Pending for Verification",
										message: "redirect to login page"
									};
									res.send(message);
								}
							} else {
								if (tcount == 1) {
									const message = {
										notification: "Record Pending for Verification",
										message: "redirect to login page"
									};
									res.send(message);
								} else {
									pool.query("INSERT INTO data_emp_info_tbl_temp(emp_id,emp_name,gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code,del_flg,entity_cre_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38)", [empid, empName, gender, dob, bgroup, shirt, commAdd, state, city, pincode, resAdd, state1, city1, pincode1, maritalstatus, mobNum, telNum, econNum, emerPer, fathersName, mothersName, spouseName, panNum, passNum, dlNum, aadhaarNum, uan, nameinBank, bankName, branchName, acctNum, ifscCode, 'N', entity_cre_flg, rcreuserid, rcretime, lchguserid, lchgtime], function (err, done) {
										if (err) throw err;
										pool.query('SELECT * FROM data_emp_info_tbl_temp WHERE emp_id = $1', [empid], function (err, result) {
											if (err) {
												callback(err, null);
												return;

											}


											userDetails.emp_details = result.rows[0];

											res.json({
												notification: "Employee Details Captured successfully",
												message: "redirect to employee details view", Data: userDetails.emp_details
											});



										})
									});
								}
							}
						} else {
							const message = {
								notification: "Employee Details Already Present in Amber for verification",
								message: "redirect to login page"
							};
							res.send(message);
						}
					} else {
						const message = {
							notification: "Employee Details Already Present in Amber",
							message: "redirect to login page"
						};
						res.send(message);
					}
				});
			});
		});
	});

})

///////////////////////////////////////// admin add the details ////////////////////////////////////////////////////
router.post('/addempdet', addempdet);
function addempdet(req, res) {
	// var test = req.body.test;

	// if (test == "Add Profile") {





	console.log(req.body);
	var now = new Date();
	var rcreuserid = req.body.rcreusedid;
	var rcretime = now;
	var lchguserid = req.body.rcreusedid;
	var lchgtime = now;
	var empid = req.body.employeeId;
	var empname = req.body.employeeName;
	var email = req.body.email_ID;
	var empaccess = req.body.emp_acess;
	var jDate = req.body.joiningDate;
	var desig = req.body.designation;
	var empClass = req.body.empClass;
	var salary = req.body.Salary;
	var sal_curr = req.body.sal_curr;
	var rptman = req.body.rptMgr;
	var probPeriod = req.body.probPeriod;
	var preem = req.body.preem;
	if (preem == "Y") {
		var preExpyear = req.body.preExpyear;
		var preExpmonth = req.body.preExpmonth;
		var preEmp = req.body.preEmp;
		var preEmp2 = req.body.preEmp2;
		var preEmp3 = req.body.preEmp3;
		var preEmp4 = req.body.preEmp4;
		var preEmp5 = req.body.preEmp5;
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

	var entity_cre_flg = "Y";
	var reset_flg = "N";

	// added for e-docket
	var pan_flg = "N";
	var aadhar_flg = "N";
	var sslc_flg = "N";
	var preuniv_flg = "N";
	var degree_flg = "N";
	var del_flg = "N";

	pool.query("SELECT * from users u INNER JOIN emp_master_tbl e ON u.user_id=e.emp_id where LOWER(u.user_id) = LOWER($1)",
		[empid], function (err, resultset) {
			if (err) throw err;
			var rcount = resultset.rowCount;
			if (rcount == 0) {


				pool.query("SELECT * from emp_master_tbl where emp_email=$1", [email], function (err, test) {
					if (err) throw err;
					var emailcheck = test.rowCount;

					if (emailcheck >= 1) {
						res.json({ message: "This Email-Id :" + email + " is registered with Amber" })
						// res.redirect(req.get('referer'));
					}
					else {

						pool.query("INSERT INTO emp_master_tbl(emp_id,emp_name,emp_access,emp_email,joining_date,designation,salary,reporting_mgr,prev_expr_year,prev_expr_month,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5,emp_prob,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time,entity_cre_flg,pre_emp_flg,emp_classification,salary_curr) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)", [empid, empname, empaccess, email, jDate, desig, salary, rptman, preExpyear, preExpmonth, preEmp, preEmp2, preEmp3, preEmp4, preEmp5, probPeriod, 'N', rcreuserid, rcretime, lchguserid, lchgtime, entity_cre_flg, preem, empClass, sal_curr], function (err, done) {
							if (err) throw err;



							pool.query("INSERT INTO users(user_name,user_id,user_type,expiry_date,login_allowed,login_attempts,del_flag,login_check,reset_flg,session_id,client_ip) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [empname, empid, empaccess, '01-01-2099', 'Y', '0', 'N', 'N', 'Y', '', ''], function (err, done) {
								// if (err) { throw err; } else { console.log("inserted in user"); }
								if (err) throw err

								pool.query("insert into e_docket_tbl(emp_id,pan_flg,aadhar_flg,sslc_flg,preuniv_flg,degree_flg,del_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)", [empid, pan_flg, aadhar_flg, sslc_flg, preuniv_flg, degree_flg, del_flg, rcreuserid, rcretime, lchguserid, lchgtime], function (err, done) {
									// req.flash('success', "User successfully added and an E-mail has been sent to " + email + " with further instructions.")
									// res.redirect(req.get('referer'));


									res.json({ message: "redirect to refer", notification: "User successfully added and an E-mail has been sent to " + email + " with further instructions." })


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
										subject: 'Register',
										html: `
										<style>
										body {
										font-family: Arial, sans-serif;
										font-size: 14px;
										line-height: 1.4;
										color: #333333;
										}
		
										a {
										color: white;
										text-decoration: none;
										}
										</style>
										
										Dear ${empname},<br>
										<img href="http://www.minorks.com/images/logo_white.png"></img><br><br>
										We are delighted to welcome you to our company! As a new member, we kindly request you to complete your account registration process to gain access to our systems and resources.<br>
										
										To finalize your registration and create your unique User ID, please follow the steps below:<br>
										
										1. Click on the registration link provided below:<br>
										<a href="http://localhost:4200/register">Click Here For Register</a><br>
										
										2. You will be directed to the registration page where you can begin the process.<br>
										
										3. Enter your personal details accurately and ensure all required fields are completed.<br>
										
										4. Once you have provided your personal details wait for Admin Aproval.<br>
										
										<h4 style="color:blue"> Your User ID: ${empid}</h4><br><br>
										
										If you have any questions or need further assistance, please feel free to reach out to our HR department.<br>
										
										Best regards,<br>
										Minorks Technology (HR)
										`
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

						});
					}
				});
			}
			else {
				// req.flash('error', "Employee Details Already Added for this Employee:" + empname)
				// res.redirect(req.get('referer'));
				pool.query(
					"UPDATE emp_master_tbl SET emp_name=$2, emp_access=$3, emp_email=$4, joining_date=$5, designation=$6, salary=$7, reporting_mgr=$8, prev_expr_year=$9, prev_expr_month=$10, prev_empr=$11, prev_empr2=$12, prev_empr3=$13, prev_empr4=$14, prev_empr5=$15, emp_prob=$16, lchg_user_id=$17, lchg_time=$18, emp_classification=$19, salary_curr=$20 WHERE emp_id=$1",
					[empid, empname, empaccess, email, jDate, desig, salary, rptman, preExpyear, preExpmonth, preEmp, preEmp2, preEmp3, preEmp4, preEmp5, probPeriod, lchguserid, lchgtime, empClass, sal_curr],
					function (err, done) {
						if (err) throw err;
						res.json({ message: "redirect to refer", notification: "Employee Details Added for this Employee:" + empname })
					}
				);

			}

		});
	//For fetching Which Value on click of submit(if loop)
	// }

};

///////////////////////////////////////////////////////////// Admin Dahboard ///////////////////////////////////////////////////////////////////////
router.get('/admindashboard', function (req, res) {


	var emp_id = req.query.userId;
	console.log(emp_id);
	var emp_access = req.query.userType;
	var emp_details = ''


	var now = new Date();
	var docPendingCount = 0; //Added by arun 21-07-2017 16:15
	//to check the number of unread messages
	pool.query("SELECT * FROM users where user_id=$1", [emp_id], function (err, result) {

		if (err) throw err;
		emp_details = result.rows[0];

		console.log("INside Admin Dashboard");
		pool.query("SELECT * FROM messages  where del_flg = $1 and to_user_id = $2 and read_flg= $3", ['N', emp_id, 'N'], function (err, unreadCountList) {
			if (err) {
				console.error('Error with table query', err);
			}
			else {
				unReadCount = unreadCountList.rowCount;
			}

			pool.query("SELECT * from project_master_tbl where project_mgr = $1 and closure_flg='N' and del_flg='N' order by project_id asc", [emp_id], function (err, result) {
				if (err) {
					console.error('Error with table query', err);
				}
				else {
					markCount = result.rowCount;
				}

				//to check the number of users online
				pool.query("SELECT * FROM users  where login_check = $1 and user_id != $2", ['Y', emp_id], function (err, onlinelist) {
					if (err) {
						console.error('Error with table query', err);
					}
					else {
						onlineCount = onlinelist.rowCount;
						onlineData = onlinelist.rows;
					}

					//to get phone numbers
					pool.query("select empMaster.emp_email, empMaster.emp_name,empMaster.emp_id, phone1, phone2, emergency_num from emp_info_tbl empInfo,emp_master_tbl empMaster where  empMaster.emp_id = empInfo.emp_id and empInfo.del_flg = $1 and empMaster.del_flg= $2 order by empMaster.emp_name asc", ['N', 'N'], function (err, directoryList) {
						if (err) {
							console.error('Error with table query', err);
						}
						else {
							directoryCount = directoryList.rowCount;
							directoryData = directoryList.rows;
						}

						//select dob,cast(dob + ((extract(year from age(dob)) + 1) * interval '1' year) as date) as next_birthday from emp_info_tbl

						pool.query("SELECT dob, emp_name, cast(dob + ((extract(year from age(dob)) + 1) * interval '1' year) as date) as next_birthday from emp_info_tbl where del_flg = $1   order by next_birthday asc ", ['N'], function (err, bdayList) {
							if (err) {
								console.error('Error with table query', err);
							}
							else {
								bdayCount = bdayList.rowCount;
								bdayData = bdayList.rows;
							}

							// to get the pending appraisal related counts
							pool.query("SELECT APPRAISAL_MONTH, APPRAISAL_YEAR FROM appraisal_master_table where emp_id =$1 and app_flg =$2 and app_conf =$3 and rej_flg=$4", [emp_id, 'N', 'N', 'N'], function (err, resultNotApproved) {
								if (err) {
									console.error('Error with table query', err);
								}
								else {
									app_notApproved = resultNotApproved.rowCount;
								}


								pool.query("SELECT APPRAISAL_MONTH, APPRAISAL_YEAR FROM appraisal_master_table where emp_id =$1 and app_flg =$2 and app_conf=$3 and rej_flg=$4", [emp_id, 'Y', 'N', 'N'], function (err, resultNotAccepted) {
									if (err) {
										console.error('Error with table query', err);
									}
									else {
										app_pendingAccep = resultNotAccepted.rowCount
									}

									//REJECTED APPRAISALS
									pool.query("SELECT APPRAISAL_MONTH, APPRAISAL_YEAR FROM appraisal_master_table where emp_id =$1 and app_flg =$2 and app_conf=$3 and rej_flg=$4", [emp_id, 'Y', 'N', 'Y'], function (err, resultRejected) {
										if (err) {
											console.error('Error with table query', err);
										} else {
											app_rejPendClosure = resultRejected.rowCount
										}

										var appraisal_main = parseInt(app_notApproved) + parseInt(app_pendingAccep) + parseInt(app_rejPendClosure);


										// added by srikanth //
										pool.query("SELECT * from emp_master_tbl_temp where entity_cre_flg='N'", function (err, getInfo) {
											if (err) {
												console.error('Error with table query', err);
											}
											else {
												pending_empProf = getInfo.rowCount
											}

											pool.query("SELECT * from emp_info_tbl_temp where entity_cre_flg='N'", function (err, getdata) {
												if (err) {
													console.error('Error with table query', err);
												}
												else {
													pending_empPer = getdata.rowCount
												}


												var emp_main = parseInt(pending_empProf) + parseInt(pending_empPer);

												pool.query("SELECT * from emp_info_tbl_temp where entity_cre_flg='N' and emp_id=$1", [emp_id], function (err, getdet) {
													if (err) {
														console.error('Error with table query', err);
													}
													else {
														showFlg = getdet.rowCount
														var empCounter1 = getdet.rowCount;

														if (showFlg == "0") {
															var showFlg = "No Records for Verification";
															var empCounter = "0";
														}
														else {
															var showFlg = "Awaiting Verification";
															var empCounter = "1";
														}
													}

													// added for invoice module from srikanth on 05-10-2017 10:22 AM

													// invoice due
													pool.query("select * from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e,emp_master_tbl s where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and s.emp_id = p.project_mgr and m.confirm_flg='N' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' order by m.milestone_exp_date asc", function (err, getdata) {
														if (err) {
															console.error('Error with table query', err);
														}
														else {
															pending_invoiceDue = getdata.rowCount
														}


														// invoice raise
														pool.query("select * from project_master_tbl p,milestone_proj_tbl m,emp_master_tbl e,emp_master_tbl s where p.project_id = m.project_id and e.emp_id = p.delivery_mgr and s.emp_id = p.project_mgr and m.confirm_flg='Y' and m.paid_flg='N' and m.del_flg='N' and p.del_flg='N' order by m.milestone_exp_date asc", function (err, getdata) {
															if (err) {
																console.error('Error with table query', err);
															}
															else {
																pending_invoiceRaise = getdata.rowCount
															}


															// invoice to be paid
															pool.query("SELECT * from invoice_mast_tbl where confirm_flg = 'Y' and paid_flg = 'N' and del_flg = 'N'", function (err, getdata) {
																if (err) {
																	console.error('Error with table query', err);
																}
																else {
																	pending_invoicePay = getdata.rowCount
																}

																var invoice_main = parseInt(pending_invoiceDue) + parseInt(pending_invoiceRaise) + parseInt(pending_invoicePay);


																// added by srikanth ends here //
																//End

																//added by Divya for pending details in Claims and Travel module strts
																console.log("BEFORE travel request CALL in dashboard:::");
																var trvlPendngRowData = 0;
																pool.query("SELECT req_id,emp_id FROM travel_master_tbl_temp where approver_id=$1 and appr_flg=$2 and del_flg=$3 order by req_id::integer desc", [emp_id, 'N', 'N'], function (err, trvlPendingData) {
																	if (err) {
																		console.error('Error with table query', err);
																	} else {

																		console.log("inside travel request query in dashboard:::");
																		var rowData = trvlPendingData.rows;
																		console.log("row in dashboard:::", rowData);
																		var trvlPendngRowData = trvlPendingData.rowCount;
																	}

																	pool.query("SELECT req_id,emp_id FROM travel_master_tbl where appr_flg=$1 and confrm_flg=$2 and reject_flg=$3 and del_flg=$4 order by req_id::integer desc", ['Y', 'N', 'N', 'N'], function (err, pendingResult) {
																		if (err) {
																			console.error('Error with table query', err);
																		} else {


																			pendingStatusData = pendingResult.rows;
																			var trvlPendngCount = pendingResult.rowCount;



																		}
																		pool.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date FROM reimbursement_master_tbl where repmgr_id=$1 and status=$2 and del_flg=$3 order by remb_id::integer desc", [emp_id, 'pending', 'N'], function (err, claimResult) {
																			if (err) {
																				console.error('Error with table query', err);
																			} else {


																				var claimRowDataPending = claimResult.rows;
																				var claimPendngCount = claimResult.rowCount;



																			}
																			pool.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date FROM reimbursement_master_tbl where hr_id=$1 and status=$2 and hr_status=$3 and del_flg=$4 order by remb_id::integer desc", [emp_id, 'approved', 'pending', 'N'], function (err, claimResulthr) {
																				if (err) {
																					console.error('Error with table query', err);
																				} else {


																					var claimRowPending = claimResulthr.rows;
																					var claimPendngHrCount = claimResulthr.rowCount;



																				}

																				pool.query("SELECT remb_id,emp_id,emp_name,repmgr_id,project_id ,hr_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date FROM reimbursement_master_tbl where hr_id=$1 and status=$2 and hr_status=$3 and del_flg=$4 and settlement_paid_flg=$5 order by remb_id::integer desc", [emp_id, 'approved', 'confirmed', 'N', 'N'], function (err, claimsettleStatus) {
																					if (err) {
																						console.error('Error with table query', err);
																					} else {


																						var claimStatusRowPending = claimsettleStatus.rows;
																						var claimsettleStatusCount = claimsettleStatus.rowCount;
																					}

																					/// added by srikanth for leave

																					pool.query("SELECT comm_code_desc cocd ,emp_name emp, * from leaves l,common_code_tbl cocd , emp_master_tbl emp where  emp.del_flg ='N' and  l.del_flg='N' and l.emp_id =$1 and l.approver_id = emp.emp_id and cocd.del_flg ='N'and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP' and l.app_flg='N' and l.rej_flg='N'", [emp_id], function (err, resultleave) {
																						if (err) {
																							console.error('Error with table query', err);
																						}
																						else {
																							var leave_tobe_approved = resultleave.rowCount;
																						}


																						pool.query("SELECT  comm_code_desc cocd ,emp_name emp,* from leaves l, emp_master_tbl emp, common_code_tbl cocd  where l.del_flg= 'N' and l.approver_id =$1 and l.app_flg = 'N' and l.emp_id = emp.emp_id and rej_flg = 'N' and cocd.del_flg ='N' and emp.del_flg ='N' and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP' and l.app_flg='N' and l.rej_flg='N'", [emp_id], function (err, resultleave) {
																							if (err) {
																								console.error('Error with table query', err);
																							}
																							else {
																								var leave_to_approve = resultleave.rowCount;
																							}

																							var total_leave_count = parseInt(leave_tobe_approved) + parseInt(leave_to_approve);

																							//End



																							// added to filter dashboard pending tasks

																							if (emp_access == "A1") {

																								totalAppPending = parseInt(app_notApproved) + parseInt(app_pendingAccep) + parseInt(app_rejPendClosure) + parseInt(docPendingCount) + parseInt(pending_empProf) + parseInt(pending_empPer) + parseInt(total_leave_count);

																							}
																							else {
																								// overides the total count only for finace
																								if (emp_access == "F1") {

																									totalAppPending = parseInt(app_notApproved) + parseInt(app_pendingAccep) + parseInt(app_rejPendClosure) + parseInt(docPendingCount) + parseInt(empCounter) + parseInt(pending_invoiceDue) + parseInt(pending_invoiceRaise) + parseInt(pending_invoicePay) + parseInt(trvlPendngCount) + parseInt(claimPendngHrCount) + parseInt(claimsettleStatusCount) + parseInt(total_leave_count);


																								}
																								else if (emp_access == "L1" || emp_access == "L2") {
																									totalAppPending = parseInt(app_notApproved) + parseInt(app_pendingAccep) + parseInt(app_rejPendClosure) + parseInt(docPendingCount) + parseInt(empCounter) + parseInt(trvlPendngRowData) + parseInt(claimPendngCount) + parseInt(total_leave_count);
																								}

																								else {
																									totalAppPending = parseInt(app_notApproved) + parseInt(app_pendingAccep) + parseInt(app_rejPendClosure) + parseInt(docPendingCount) + parseInt(empCounter) + parseInt(total_leave_count);
																								}

																							}

																							//added by nandhini 08-09-2017 for reimbursement module
																							var document_date = "";
																							// var nowDate = moment().format('YYYY-MM-DD');

																							pool.query("SELECT document_date,remb_id FROM reimbursement_master_tbl where emp_id =$1 and status =$2 and hr_status=$3", [emp_id, 'approved', 'pending'], function (err, approvedResult) {
																								if (err) {
																									console.error('Error with table query', err);
																								} else {
																									approvedResultCount = approvedResult.rowCount
																									var approvedDataResult = approvedResult.rows;

																									console.log('approvedDataResult.length', approvedDataResult.length);
																									for (var i = 0; i < approvedDataResult.length; i++) {
																										document_dateString = approvedDataResult[i].document_date;
																										remb_id = approvedDataResult[i].remb_id

																										var duration = moment.duration(moment(document_dateString).diff(nowDate));
																										var days = duration.asDays();

																										if (days < 0) {
																											pool.query("UPDATE  reimbursement_master_tbl set  status = $1 where remb_id=$2", ['autoreject', remb_id], function (err, done) {
																												if (err)
																													console.error('Error with table query', err);
																												pool.query("UPDATE  reimbursement_master_tbl_hist set  status = $1 where remb_id=$2", ['autoreject', remb_id], function (err, done) {
																													if (err)
																														console.error('Error with table query', err);
																												});
																											});

																											pool.query("select emp_name , emp_email from emp_master_tbl where emp_id=$1", [emp_id], function (err, empResult) {
																												if (err) {
																													console.error('Error with table query', err);
																												} else {
																													employee_name = empResult.rows['0'].emp_name;
																													employee_email = empResult.rows['0'].emp_email;
																												}
																											});
																											var smtpTransport = nodemailer.createTransport('SMTP', {
																												service: 'gmail',
																												auth: {
																													user: 'nurtureportal',
																													pass: 'nurture@123'
																												}
																											});
																											var mailOptions = {
																												to: employee_email,
																												from: 'nurtureportal@gmail.com',
																												subject: 'IS:Reimbursement request autoreject',
																												text: ' The reimbursement request raised for' + remb_id + 'Id is autorejected since document submission date  exceeds the deadline.\n' + '\n' + ' -Reimbursement System'
																											};
																											smtpTransport.sendMail(mailOptions, function (err) { });
																										}

																									}




																								}
																							});
																							pool.query("SELECT from_date,req_id FROM travel_master_tbl_temp where emp_id =$1 and appr_flg =$2", [emp_id, 'N'], function (err, pendingResult) {
																								if (err) {
																									console.error('Error with table query', err);
																								} else {
																									pendingResultCount = pendingResult.rowCount
																									var pendingDataResult = pendingResult.rows;

																									console.log('pendingDataResult.length', pendingDataResult.length);
																									for (var i = 0; i < pendingDataResult.length; i++) {
																										document_dateString = pendingDataResult[i].from_date;
																										req_id = pendingDataResult[i].req_id;

																										var duration = moment.duration(moment(document_dateString).diff(nowDate));
																										var days = duration.asDays();

																										if (days < 0) {
																											pool.query("UPDATE  travel_master_tbl_temp set  del_flag = $1 where req_id=$2", ['Y', req_id], function (err, done) {
																												if (err)
																													console.error('Error with table query', err);
																												pool.query("UPDATE  reimbursement_master_tbl_hist set  del_flag = $1 where req_id=$2", ['Y', req_id], function (err, done) {
																													if (err)
																														console.error('Error with table query', err);
																												});
																											});

																											pool.query("select emp_name , emp_email from emp_master_tbl where emp_id=$1", [emp_id], function (err, empResult) {
																												if (err) {
																													console.error('Error with table query', err);
																												} else {
																													employee_name = empResult.rows['0'].emp_name;
																													employee_email = empResult.rows['0'].emp_email;
																												}
																											});
																											var smtpTransport = nodemailer.createTransport('SMTP', {
																												service: 'gmail',
																												auth: {
																													user: 'nurtureportal',
																													pass: 'nurture@123'
																												}
																											});
																											var mailOptions = {
																												to: employee_email,
																												from: 'nurtureportal@gmail.com',
																												subject: 'IS:Reimbursement request autoreject',
																												text: ' The reimbursement request raised for' + remb_id + 'Id is autorejected since document submission date  exceeds the deadline.\n' + '\n' + ' -Reimbursement System'
																											};
																											smtpTransport.sendMail(mailOptions, function (err) { });


																										}

																									}




																								}
																							});
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



																															var cocd = {

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
																															res.json({
																																message: 'redirect to admin dashboard', userData: emp_details, cocd: cocd, Data: {
																																	// ename: req.query.user_name,

																																	eid: req.query.user_id,
																																	emp_access: req.query.user_type,
																																	unReadCount: unReadCount,
																																	onlineCount: onlineCount,
																																	onlineData: onlineData,
																																	bdayCount: bdayCount,
																																	bdayData: bdayData,
																																	currentDate: now,
																																	pending_empProf: pending_empProf,    //added by srikanth
																																	pending_empPer: pending_empPer, //added by srikanth
																																	showFlg: showFlg, // added by srikanth
																																	pending_invoiceDue: pending_invoiceDue, // added by srikanth
																																	pending_invoiceRaise: pending_invoiceRaise, // added by srikanth
																																	pending_invoicePay: pending_invoicePay, // added by srikanth
																																	totalAppPending: totalAppPending,
																																	app_notApproved: app_notApproved,
																																	app_pendingAccep: app_pendingAccep,
																																	app_rejPendClosure: app_rejPendClosure,
																																	docPendingCount: docPendingCount,         //Added by arun 27-01-2017 16:15
																																	trvlPendngRowData: trvlPendngRowData,
																																	trvlPendngCount: trvlPendngCount,
																																	claimPendngCount: claimPendngCount,
																																	claimsettleStatusCount: claimsettleStatusCount,
																																	claimPendngHrCount: claimPendngHrCount,
																																	markCount: markCount,
																																	appraisal_main: appraisal_main,
																																	emp_main: emp_main,
																																	empCounter1: empCounter1,
																																	invoice_main: invoice_main,
																																	leave_tobe_approved: leave_tobe_approved,
																																	leave_to_approve: leave_to_approve,
																																	total_leave_count: total_leave_count
																																}


																															})

																														})
																													})

																												});
																											});
																										});
																									});
																								});


																							});
																						});
																					});
																				});
																			});
																		});
																	});
																});
															});
														});
													});
												});
											});
										});
									});
								});
							});
						});
					});
				});
			});
		});
	})
});

/////////////////////////////////////////////////////////////////////////////////// Employee Aproval By Admin ///////////////////////////////////////////////////
router.get('/employeeApprovalDetails', (req, res) => {

	var empId = req.query.user_id;


	pool.query("SELECT user_type from users where user_id = $1", [empId], function (err, result) {
		emp_access = result.rows[0].user_type;

		if (emp_access != "A1") {
			res.redirect('/admin-dashboard/adminDashboard/admindashboard');
		}
		else {

			pool.query("select * from emp_info_tbl_temp where entity_cre_flg='N' order by emp_id asc", function (err, done) {
				if (err) throw err;
				const emp = done.rows;
				console.log(done.rows);
				emp_count = done.rowCount;

				pool.query("")
				res.json({
					message: 'routing to show data page [personalDetails]', Data: emp
				});
			});
		}

	});
});
////////////////////////////////////////////////////////////// view Details to be approved////////////////////////////////////////////////////////////


router.post('/approval', apprPen);
function apprPen(req, res) {
	var emp_id = req.body.empid;


	// var empId = req.user.rows['0'].user_id;

	// pool.query("SELECT user_type from users where user_id = $1", [emp_id], function (err, result) {
	// 	emp_access = result.rows['0'].user_type;

		pool.query("select emp_id,emp_name,gender,dob,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,phone1,phone2,father_name,mother_name,martial_status,spouse_name,pan_number,passport_num,aadhaar_num,license_num,blood_group,shirt_size,emergency_num,emergency_con_person,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code from emp_info_tbl_temp where LOWER(emp_id)=LOWER($1)", [emp_id], function (err, result) {
			if (err) throw err;

			const personal = result.rows[0];
			// console.log(personal);


			pool.query("select emp_id,emp_name,emp_email,emp_access,joining_date,designation,salary,reporting_mgr,emp_prob,prev_expr_year,prev_expr_month,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5,pre_emp_flg,emp_classification from emp_master_tbl where emp_id=$1", [emp_id], function (err, resultset) {
				// data_emp_master_tbl_temp --->replace to emp-master_tbl because admin already added the profesionaldetails so it defult added in emp_master_tbl
				if (err) throw err;

				var empid = resultset.rows['0'].emp_id;
				var empName = resultset.rows['0'].emp_name;
				var email = resultset.rows['0'].emp_email;
				var empAccess = resultset.rows['0'].emp_access;
				var jDate = resultset.rows['0'].joining_date;
				// var jDate = dateFormat(jDate, "yyyy-mm-dd");
			
				var desig = resultset.rows['0'].designation;
				var empClass = resultset.rows['0'].emp_classification;
				var salary = resultset.rows['0'].salary;
				var rptMan = resultset.rows['0'].reporting_mgr;
				var probPeriod = resultset.rows['0'].emp_prob;
				var preem = resultset.rows['0'].pre_emp_flg;
				var preExpyear = resultset.rows['0'].prev_expr_year;
				var preExpmonth = resultset.rows['0'].prev_expr_month;
				var preEmp = resultset.rows['0'].prev_empr;
				var preEmp2 = resultset.rows['0'].prev_empr2;
				var preEmp3 = resultset.rows['0'].prev_empr3;
				var preEmp4 = resultset.rows['0'].prev_empr4;
				var preEmp5 = resultset.rows['0'].prev_empr5;
				//query to select description of employee Access
				

				pool.query("select comm_code_desc from common_code_tbl where code_id='ACC' and comm_code_id=$1", [empAccess], function (err, resultset) {
					empAccess_desc = resultset.rows['0'].comm_code_desc;

					//query to fetch other Data from Table for employee Access

					pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'ACC' ", function (err, result) {
						comm_code_empAccess = result.rows;
						comm_code_empAccess_count = result.rowCount;

						//query to select description of designation

						pool.query("select comm_code_desc from common_code_tbl where code_id='DSG' and comm_code_id=$1", [desig], function (err, resultset) {
							desig_desc = resultset.rows['0'].comm_code_desc;

							//query to fetch other Data from Table for designation

							pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'DSG' ", function (err, result) {
								comm_code_desig = result.rows;
								comm_code_desig_count = result.rowCount;


							

								//query to fetch other Data from Table for reporting manager

								pool.query("SELECT emp_name from emp_master_tbl where emp_id =$1 order by emp_id", [rptMan], function (err, result) {
									rptMan_desc = result.rows['0'].emp_name;

									//query to select employee id,employee name for reporting manager

									pool.query("SELECT emp_id,emp_name from emp_master_tbl where emp_id!=$1 order by emp_id", [empid], function (err, result) {
										comm_code_rptMan = result.rows;
										comm_code_rptMan_count = result.rowCount;


										pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'CURR' ", function (err, result) {
											sal_curr = result.rows;
											sal_curr_count = result.rowCount;

											res.json({
												message: 'redirect to aproval View', Professional_details: {
													empid: empid,
													empName: empName,
													// ename: req.user.rows['0'].user_name,
													eid: req.body.user_id,
													email: email,
													empAccess: empAccess,
													empAccess_desc: empAccess_desc,
													comm_code_empAccess: comm_code_empAccess,
													comm_code_empAccess_count: comm_code_empAccess_count,
													jDate: format(jDate, 'yyyy-MM-dd'),
													desig: desig,
													desig_desc: desig_desc,
													comm_code_desig: comm_code_desig,
													comm_code_desig_count: comm_code_desig_count,
													empClass: empClass,
													salary: salary,
													sal_curr: sal_curr,
													sal_curr_count: sal_curr_count,
													rptMan: rptMan,
													rptMan_desc: rptMan_desc,
													probPeriod: probPeriod,
													preem: preem,
													comm_code_rptMan: comm_code_rptMan,
													comm_code_rptMan_count: comm_code_rptMan_count,
													preExpyear: preExpyear,
													preExpmonth: preExpmonth,
													preEmp: preEmp,
													preEmp2: preEmp2,
													preEmp3: preEmp3,
													preEmp4: preEmp4,
													preEmp5: preEmp5
												}, Personal_Data: {
													empid: personal.emp_id,
													empName: personal.emp_name,
													gender: personal.gender,
													// dob : personal.dob,
													dob: format(personal.dob, "yyyy-MM-dd"),
													bgroup: personal.blood_group,

													shirt: personal.shirt_size,
													commAdd: personal.comm_addr1,
													state: personal.state,
													city: personal.city,
													pincode: personal.pincode,
													resAdd: personal.comm_addr2,
													state1: personal.state1,
													city1: personal.city1,
													pincode1: personal.pincode1,
													mobNum: personal.phone1,
													telNum: personal.phone2,
													econNum: personal.emergency_num,
													emerPer: personal.emergency_con_person,
													fathersName: personal.father_name,
													mothersName: personal.mother_name,
													maritalstatus: personal.martial_status,
													spouseName: personal.spouse_name,
													panNum: personal.pan_number,
													passNum: personal.passport_num,
													aadhaarNum: personal.aadhaar_num,
													dlNum: personal.license_num,
													uan: personal.uan_num,
													nameinBank: personal.name_in_bank,
													bankName: personal.bank_name,
													branchName: personal.branch_name,
													acctNum: personal.account_num,
													ifscCode: personal.ifsc_code,
												}
											});
										});
									});
								});
							});
						});
					});
				});
			});

		});
	// });
}


//////////////////////////////////////////////// verify the details by admin /////////////////////////////////////////////////////////////






//For fetching Which Value on click of submit(if loop

router.post('/verifyDetails', (req, res) => {
	console.log(req.body);
	var now = new Date();
	var rcreuserid = req.user_id;
	var rcretime = now;
	var lchguserid = req.user_id;
	var lchgtime = now;
	var empid = req.body.user_id;
	console.log(empid);

	var entity_cre_flg = "Y";
	var rejReason = req.body.rejReason;
	var deleteReason = req.body.deleteReason;



	pool.query("SELECT * FROM emp_info_tbl_temp where emp_id=$1", [empid], function (err, result) {

		if (err) throw err;
		details1 = result.rows[0];
		console.log(details1);

		var emp_id = details1.emp_id;
		var emp_name = details1.emp_name;
		var gender = details1.gender;
		var dob = details1.dob;
		var blood_group = details1.blood_group;
		var shirt_size = details1.shirt_size;
		var comm_addr1 = details1.comm_addr1;
		var state = details1.state;
		var city = details1.city;
		var pincode = details1.pincode;
		var comm_addr2 = details1.comm_addr2;
		var state1 = details1.state1;
		var city1 = details1.city1;
		var pincode1 = details1.pincode1;
		var martial_status = details1.martial_status;
		var phone1 = details1.phone1;
		var phone2 = details1.phone2;
		var emergency_num = details1.emergency_num;
		var emergency_con_person = details1.emergency_con_person;
		var father_name = details1.father_name;
		var mother_name = details1.mother_name;
		var spouse_name = details1.spouse_name;
		var pan_number = details1.pan_number;
		var passport_num = details1.passport_num;
		var license_num = details1.license_num;
		var aadhaar_num = details1.aadhaar_num;
		var uan_num = details1.uan_num;
		var name_in_bank = details1.name_in_bank;
		var bank_name = details1.bank_name;
		var branch_name = details1.branch_name;
		var account_num = details1.account_num;
		var ifsc_code = details1.ifsc_code;
		var del_flg = details1.del_flg;
		var entity_cre_flg = 'Y';
		var rcre_user_id = details1.rcre_user_id;
		var rcre_time = details1.rcre_time;
		var lchg_user_id = details1.lchg_user_id;
		var lchg_time = details1.lchg_time;




		pool.query("select emp_email from emp_master_tbl where emp_id=$1", [empid], function (err, result) {
			var email = result.rows['0'].emp_email;

			console.log(result.rows);
			var test = req.body.test;
			if (test != "") {
				if (test == "Verify Profile") {
					console.log(test);
					pool.query("select * from emp_info_tbl_hist where emp_id = $1", [empid], function (err, done) {
						var hist_count = done.rowCount;
						console.log(result.rows);

						if (hist_count == "1") {

							pool.query("delete from emp_info_tbl_hist where emp_id = $1", [empid], function (err, done) {
								if (err) throw err;
							});
							console.log(result.rows);

							pool.query("insert into emp_info_tbl_hist select * from emp_info_tbl where emp_id=$1 ", [empid], function (err, result) {
								if (err) throw err;
							});
							console.log(result.rows);
						}
						else {
							console.log("inser1");
							pool.query("insert into emp_info_tbl_hist select * from emp_info_tbl_temp where emp_id=$1", [empid], function (err, result) {
								if (err) throw err;
							});

						}


						pool.query("select * from emp_info_tbl where emp_id=$1", [empid], function (err, result) {
							var rcount = result.rowCount;

							if (rcount == 0) {

								pool.query("INSERT INTO emp_info_tbl(emp_id,emp_name,gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code,del_flg,entity_cre_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38)", [empid, emp_name, gender, dob, blood_group, shirt_size, comm_addr1, state, city, pincode, comm_addr2, state1, city1, pincode1, martial_status, phone1, phone2, emergency_num, emergency_con_person, father_name, mother_name, spouse_name, pan_number, passport_num, license_num, aadhaar_num, uan_num, name_in_bank, bank_name, branch_name, account_num, ifsc_code, 'N', entity_cre_flg, rcre_user_id, rcre_time, lchg_user_id, lchg_time], function (err, done) {
									if (err) throw err;

									pool.query("delete from emp_info_tbl_temp where emp_id=$1", [empid], function (err, done) {
										if (err) throw err;


										var userid = empid;
										var ranpass = generatePassword(4, false);
										var finalpass = userid + "@" + ranpass;
										bcrypt.hash(finalpass, 10, function (err, hash) {

											hashpassword = finalpass;
											hashpassword = hash;
											console.log("bycript enterd");
											pool.query('update users set password=$1 where user_id=$2', [hash, emp_id], function (err, result) {
												if (err) throw error;

												console.log("password updated");
											})


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
											to: email,
											// subject: 'Test Email',
											subject: 'verification succes full',
											html: '<img src="http://www.confessionsofareviewer.com/wp-content/uploads/2017/05/welcome-on-board.jpg" height="85"><br><br>' +
												'<h3>Dear <b>' + emp_name + '</b>,<br><br>' +
												'You are receiving this mail because you HR is verified your details The User id and Passwor has to sent your register email id please reset your password <b>Amber</b>.<br>' +
												'Please follow the below Account Activation details : <br><br>' +
												'<table style="border: 10px solid black;"><tr style="border: 10px solid black;"><th style="border: 10px solid black;">User Id</th><th style="border: 10px solid black;">' + empid + '</th></tr><tr style="border: 10px solid black;"><td style="border: 10px solid black;"> Password </td><td style="border: 10px solid black;">' + finalpass + '</td></tr></table><br><br>' +
												'URL: http://amber.nurture.co.in <br><br>' +
												'Contact HR for any clarifications.<br>' +
												'Kindly do not share your password with anyone else.<br><br><br><br>' +
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

										res.json({ message: "redirect ot aprove view page", notification: "Employee  Details Verified sucessfully for the user:" + empid + "." })



										// req.flash('success', "Employee Personal Details Verified sucessfully for the user:" + empid + ".")
										// res.redirect('/employeeModule/employeeDetails/employeeApprovalDetails');
									});
								});
							}
							else {

								pool.query("update emp_info_tbl SET (emp_id,emp_name,gender,dob,blood_group,shirt_size,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,martial_status,phone1,phone2,emergency_num,emergency_con_person,father_name,mother_name,spouse_name,pan_number,passport_num,license_num,aadhaar_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code,del_flg,entity_cre_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38)", [empid, emp_name, gender, dob, blood_group, shirt_size, comm_addr1, state, city, pincode, comm_addr2, state1, city1, pincode1, martial_status, phone1, phone2, emergency_num, emergency_con_person, father_name, mother_name, spouse_name, pan_number, passport_num, license_num, aadhaar_num, uan_num, name_in_bank, bank_name, branch_name, account_num, ifsc_code, 'N', entity_cre_flg, rcre_user_id, rcre_time, lchg_user_id, lchg_time], function (err, done) {

									// pool.query("update emp_info_tbl set gender=$2,dob=$3,blood_group=$4,shirt_size=$5,comm_addr1=$6,state=$7,city=$8,pincode=$9,comm_addr2=$10,state1=$11,city1=$12,pincode1=$13,martial_status=$14,phone1=$15,phone2=$16,emergency_num=$17,emergency_con_person=$18,father_name=$19,mother_name=$20,spouse_name=$21,pan_number=$22,passport_num=$23,license_num=$24,aadhaar_num=$25,uan_num=$26,name_in_bank=$27,bank_name=$28,branch_name=$29,account_num=$30,ifsc_code=$31,del_flg=$32,rcre_user_id=$33,rcre_time=$34,lchg_user_id=$35,lchg_time=$36,entity_cre_flg=$37 where emp_id=$1", [empid, gender, dob, bgroup, shirt, commAdd, state, city, pincode, resAdd, state1, city1, pincode1, maritalstatus, mobNum, telNum, econNum, emerPer, fathersName, mothersName, spouseName, panNum, passNum, dlNum, aadhaarNum, uan, nameinBank, bankName, branchName, acctNum, ifscCode, 'N', rcreuserid, rcretime, lchguserid, lchgtime, entity_cre_flg], function (err, done) {
									if (err) throw err;

									pool.query("delete from emp_info_tbl_temp where emp_id=$1", [empid], function (err, done) {
										if (err) throw err;

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
											subject: 'Verification Successful for your Personal Details Added/Modified.',
											html: '<img src="http://www.helisconsulting.com/wp-content/uploads/2017/01/Employee-Verification_Helis-Conuslting.jpg" height="85"><br><br>' +
												'<h3>Dear <b>' + empName + '</b>,<br><br>' +
												'You are receiving this mail because HR has verified the Added/Modified Personal Details.<br>' +
												'Please go through the system for affected changes.<br>' +
												'In case of any Clarifications/Concern please contact HR .<br>' +
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





										// req.flash('success', "Employee Perssonal Details Verified sucessfully for the user:" + empid + ".")
										// res.redirect('/employeeModule/employeeDetails/employeeApprovalDetails');
										res.json({ message: "redirect ot aprove view page", notification: "Employee Personal Details Verified sucessfully for the user:" + empid + "." })


									});
								});
							}
						});
					});
				}
			}

			var test1 = req.body.test;
			if (test1 != "") {
				if (test1 == "Reject Profile") {

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
						subject: 'Rejection of Employee Personal Details Added/Modified.',
						html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF3AN6vk9aZnh5KQ_KPzHWYwlVWNNCxzAFK-994yO9WY6UwfiSIA" height="85"><br><br>' +
							'<h3> Dear <b>' + empName + '</b>,<br><br>' +
							'You are receiving this mail because HR has rejected the Added/Modified Employee Personal Details.<br>' +
							'Please Provide the supporting documents or contact HR for any clarifications on the same .<br>' +
							'Rejection Reason : <u>' + rejReason + '</u>.<br><br>' +
							'URL: http://amber.nurture.co.in' + '<br><br><br>' +
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



					// req.flash('success', "Employee Personal Details has been Rejected sucessfully for Employee Id:" + empid + " and E-mail has been sent to." + email + "with further instructions.")
					// res.redirect('/employeeModule/employeeDetails/employeeApprovalDetails');
					res.json({ message: "redirect ot aprove view page", notification: "Employee Personal Details Rejected sucessfully for the user:" + empid + "." })


				}
			}

			var test2 = req.body.test;
			if (test2 != "") {
				if (test2 == "Delete Profile") {
					console.log("delete enter");
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
						subject: 'Deletion of your Personal Details Added/Modified.',
						html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRhnWZ-CQDkryjFGSvC7gHqaoaJyZFp4vGSfuPYR-nrz5IcC09ayQ" height="85"><br><br>' +
							'<h3> Dear <b>' + emp_name + '</b>,<br><br>' +
							'You are receiving this mail because HR has deleted the Added/Modified Employee Personal Details.<br>' +
							'Please make a new entry by Adding/Modifying the Personal Details.<br><br>' +
							'Deletion Reason :<u>' + deleteReason + '</u>.<br><br>' +
							'URL: http://amber.nurture.co.in' + '<br><br><br>' +
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



					pool.query("delete from emp_info_tbl_temp where emp_id=$1", [empid], function (err, done) {
						if (err) throw err;

						// req.flash('success', "Employee Personal Details has been deleted sucessfully for the Employee Id:" + empid + " and E-mail has been sent to." + email + " with further instructions.")
						// res.redirect('/employeeModule/employeeDetails/employeeApprovalDetails');
						res.json({ message: "redirect ot aprove view page", notification: "Employee Personal Details Deleted sucessfully for the user:" + empid + "." })

					});
				}
			}

		});
	});
})

/////////////////////////////// End of Employee Admin Module /////////////////////////////////////////////////



router.post('/addmodempdetper', addmodempdetper);
function addmodempdetper(req, res) {
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
	var bankName = req.body.bankname;
	var branchName = req.body.branchname;
	var acctNum = req.body.accountnum;
	var ifscCode = req.body.ifsccode;
	var entity_cre_flg = "Y";

	pool.query(
		"UPDATE emp_info_tbl SET emp_name=$2, gender=$3, dob=$4, blood_group=$5, shirt_size=$6, comm_addr1=$7, state=$8, city=$9, pincode=$10, comm_addr2=$11, state1=$12, city1=$13, pincode1=$14, martial_status=$15, phone1=$16, phone2=$17, emergency_num=$18, emergency_con_person=$19, father_name=$20, mother_name=$21, spouse_name=$22, pan_number=$23, passport_num=$24, license_num=$25, aadhaar_num=$26, uan_num=$27, name_in_bank=$28, bank_name=$29, branch_name=$30, account_num=$31, ifsc_code=$32, del_flg=$33, entity_cre_flg=$34, rcre_user_id=$35, rcre_time=$36, lchg_user_id=$37, lchg_time=$38 WHERE emp_id=$1",
		[
			empid, empName, gender, dob, bgroup, shirt, commAdd, state, city, pincode, resAdd, state1, city1, pincode1, maritalstatus, mobNum, telNum, econNum, emerPer, fathersName, mothersName, spouseName, panNum, passNum, dlNum, aadhaarNum, uan, nameinBank, bankName, branchName, acctNum, ifscCode, 'N', entity_cre_flg, rcreuserid, rcretime, lchguserid, lchgtime
		],
		function (err, done) {
			if (err) throw err;
			res.json({
				message: "redirect to modifypersonalpage",
				notification: "Employee Personal Details has been modified successfully, Verification Pending By Admin."
			});
		}
	);

};

router.post('/addmodempdet', addmodempdet);
function addmodempdet(req, res) {
	var now = new Date();
	var rcreuserid = req.user.rows['0'].user_id;
	var rcretime = now;
	var lchguserid = req.user.rows['0'].user_id;
	var lchgtime = now;
	var empid = req.body.empid;
	var empName = req.body.empName;
	var email = req.body.email;
	var empAccess = req.body.empAccess;
	var jDate = req.body.jDate;
	var desig = req.body.desig;
	var empClass = req.body.empClass;
	var salary = req.body.salary;
	var sal_curr = req.body.sal_curr;
	var rptMan = req.body.rptMan;
	var probPeriod = req.body.probPeriod;
	var preem = req.body.preem;
	if (preem == "Y") {
		var preExpyear = req.body.preExpyear;
		var preExpmonth = req.body.preExpmonth;
		var preEmp = req.body.preEmp;
		var preEmp2 = req.body.preEmp2;
		var preEmp3 = req.body.preEmp3;
		var preEmp4 = req.body.preEmp4;
		var preEmp5 = req.body.preEmp5;
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

	var entity_cre_flg = "Y";

	pdbconnect.query("select * from emp_master_tbl_hist where emp_id = $1", [empid], function (err, done) {
		var hist_count = done.rowCount;


		if (hist_count == "1") {

			pdbconnect.query("delete from emp_master_tbl_hist where emp_id = $1", [empid], function (err, done) {
				if (err) throw err;
			});

			pdbconnect.query("insert into emp_master_tbl_hist select * from emp_master_tbl where emp_id=$1 ", [empid], function (err, result) {
				if (err) throw err;
			});
		}
		else {

			pdbconnect.query("insert into emp_master_tbl_hist select * from emp_master_tbl where emp_id=$1 ", [empid], function (err, result) {
				if (err) throw err;
			});
		}


		pdbconnect.query("UPDATE emp_master_tbl set emp_name=$2,emp_email=$3,emp_access=$4,joining_date=$5,designation=$6,salary=$7,reporting_mgr=$8,emp_prob=$9,prev_expr_year=$10,prev_expr_month=$11,prev_empr=$12,prev_empr2=$13,prev_empr3=$14,prev_empr4=$15,prev_empr5=$16,del_flg=$17,rcre_user_id=$18,rcre_time=$19,lchg_user_id=$20,lchg_time=$21,entity_cre_flg=$22,pre_emp_flg=$23,emp_classification=$24,salary_curr=$25 where emp_id=$1", [empid, empName, email, empAccess, jDate, desig, salary, rptMan, probPeriod, preExpyear, preExpmonth, preEmp, preEmp2, preEmp3, preEmp4, preEmp5, 'N', rcreuserid, rcretime, lchguserid, lchgtime, entity_cre_flg, preem, empClass, sal_curr], function (err, done) {
			if (err) throw err;

			pdbconnect.query("UPDATE users set user_type=$2 where user_id=$1", [empid, empAccess], function (err, done) {
				if (err) throw err;

				// Added after new request

				var smtpTransport = nodemailer.createTransport('SMTP', {
					service: 'gmail',
					auth:
					{
						user: 'amber@nurture.co.in',
						pass: 'nurture@123'
					}
				});

				var mailOptions = {
					to: email,
					from: 'amber@nurture.co.in',
					subject: 'Modification made on your Professional Details',
					html: '<h3><p> Dear <b> ' + empName + ' </b> , <br><br>' +
						'You are receiving this mail because HR has modified your Professional details.<br>' +
						'Please go through the details and cross check from your end<br>' +
						'In case of any clarifications/concerns feel free to contact HR.<br>' +
						'URL: http://amber.nurture.co.in <br><br><br><br><br>' +
						'- Regards,<br><br>Amber</h3>'

				};

				smtpTransport.sendMail(mailOptions, function (err) {
				});
			});
		});
	});

	req.flash('success', "Employee Professional Details has been Modified sucessfully for the Employee Id :" + empid + ".")
	res.redirect('/employeeModule/employeeDetails/employeeDetailsModify');

}







module.exports = router;
