var express = require('express');
var app = express();
var router = express.Router();
var bodyParser = require('body-parser');
var pool = require('../Database/dbconfig');
var path = require('path');
var Promise = require('mpromise');




var nodemailer = require('nodemailer');
const { log } = require('console');
router.use(express.json())

router.get('/markDetailsssss', function (req, res) {
	var parse = "";
	var parse_count = "";
	console.log(req.query);
	var empId = req.query.user_id;

	pool.query("SELECT user_type,user_name from users where user_id = $1", [empId], function (err, result) {
		var emp_access = result.rows['0'].user_type;
		const user = result.rows['0']
		console.log("result", result.rows['0'].user_type);


		pool.query("SELECT project_id from project_master_tbl where project_mgr = $1   order by project_id asc", [empId], function (err, result) {
			// and closure_flg='N' --> it is not presend in and del_flg='N' db
			if (err) throw err;


			projectid = result.rows;
			console.log(result);
			projectid_count = result.rowCount;

			const details = {

				ename: user.user_name,
				eid: empId,
				emp_access: emp_access,
				projectid: projectid[0].project_id,
				projectid_count: projectid_count,
				parse_count: parse_count,
				parse: parse
			}

			res.json({ message: "redirect to mark details", data: details })

		});
	});
});



router.post('/fetchMark',(req, res)=> {
	console.log(req.body.Item);
	var empId = req.body.userid;
	console.log(empId);

	pool.query("SELECT user_type FROM users WHERE user_id = $1", [empId], function (err, result) {
		if (err) {
			console.error("Error fetching user_type:", err);
			return res.status(500).json({ error: "Internal Server Error" });
		}

		// Check if any rows were returned
		if (result.rows.length === 0) {
			console.error("No user found with user_id:", empId);
			return res.status(404).json({ error: "User not found" });
		}

		var emp_access = result.rows[0].user_type;
		console.log("emp_access:", emp_access);

		var project_id = req.body.Item.projectId;
		console.log(project_id);

		pool.query("SELECT project_id FROM project_master_tbl WHERE project_mgr = $1 AND closure_flg='N' ORDER BY project_id ASC", [empId], function (err, result) {
			if (err) {
				console.error("Error fetching project_id:", err);
				return res.status(500).json({ error: "Internal Server Error" });
			}

			// console.log(result.rows);
			var projectid = result.rows;
			var projectid_count = result.rowCount;

			console.log("projectid:::", projectid);
			console.log("projectid_count:::", projectid_count);

			pool.query("SELECT project_id,serial_number,milestone_name,lchg_user_id,capture_per,rcre_user_id,paid_flg,direct_amount,del_flg,milestone_exp_date,confirm_flg,confirmed_date FROM milestone_proj_tbl WHERE project_id = $1 AND confirm_flg='N' AND paid_flg='N' AND del_flg='N' ORDER BY serial_number ASC", [project_id], function (err, result) {
				if (err) {
					console.error("Error fetching milestone data:", err);
					return res.status(500).json({ error: "Internal Server Error" });
				}
				console.log(result.rows);
				var parse = result.rows;
				var serial_number = result.serial_number;
				var milestone_name = result.milestone_name;
				var capture_per = result.capture_per
				var direct_amount = result.direct_amount
				var del_flg = result.del_flg
				var milestone_exp_date = result.milestone_exp_date
				var confirm_flg = result.confirm_flg
				var paid_flg = result.paid_flg
				var rcre_user_id = result.rcre_user_id
				var lchg_user_id = result.lchg_user_id
				var rcre_time = result.rcre_time
				var lchg_time = result.lchg_time
				var confirmed_date = result.confirmed_date
				var paid_date = result.paid_date
				var parse_count = result.rowCount;
				console.log("milestone data:::", parse);
				console.log("milestone count:::", parse_count);

				res.json({
					message: "redirect to recall mile stone",
					data: {
						project_id: project_id,
						ename: req.user_name,
						eid: req.user_id,
						emp_access: emp_access,
						projectid_count: projectid_count,
						parse_count: parse_count,
						parse: parse,
						serial_number: serial_number,
						milestone_name: milestone_name,
						capture_per: capture_per,
						direct_amount: direct_amount,
						del_flg: del_flg,
						milestone_exp_date: milestone_exp_date,
						confirm_flg: confirm_flg,
						paid_flg: paid_flg,
						rcre_user_id: rcre_user_id,
						lchg_user_id: lchg_user_id,
						rcre_time: rcre_time,
						lchg_time: lchg_time,
						confirmed_date: confirmed_date,
						paid_date: paid_date

					}
				});
			});
		});
	});
})






//////////////////////////////////////////////////////markpost///////////////////////////////////////
router.post('/markpost', (req, res) => {


	console.log(" inside miletsone post function");

	var array = req.body.button;
	console.log(req.body.button, "================");

	// var milestonedata = req.body.milestonedata;
	// console.log(" project_id", milestonedata);

	var project_id = req.project_id;
	var empId = req.user_id;
	var eid = req.user_id;
	var now = new Date();
	var rcreuserid = empId;
	var rcretime = now;
	var lchguserid = empId;
	var lchgtime = now;
	var confirmed_date = now;

	pool.query("SELECT project_mgr from project_master_tbl  where project_id=$1 ", [project_id], function (err, result) {
		var projmgr = result.rows['0'].project_mgr;

		if (projmgr == empId) {

			pool.query("select project_id,serial_number,milestone_name from milestone_proj_tbl where project_id=$1 and  confirm_flg='N' and paid_flg='N' and del_flg='N'", [milestonedata], function (err, result) {
				pid = result.rows[array].project_id;
				milestoneName = result.rows[array].milestone_name;
				serial_number = result.rows[array].serial_number;
				var confirm_amt = req.body["confirm_amt_" + array];


				pool.query("insert into milestone_proj_tbl_hist select * from milestone_proj_tbl where project_id=$1 ", [milestonedata], function (err, result) {
					if (err) throw err;
				});

				pool.query("update milestone_proj_tbl set confirm_flg=$1,lchg_user_id=$2,lchg_time=$3,confirmed_date=$4,status_flg=$8,confirm_amount=$9 where project_id=$5 and milestone_name=$6 and serial_number=$7 ", ['Y', lchguserid, lchgtime, confirmed_date, milestonedata, milestoneName, serial_number, 'Y', confirm_amt], function (err, done) {
					if (err) throw err;

				});

				var smtpTransport = nodemailer.createTransport('SMTP',
					{
						service: 'gmail',
						auth:
						{
							user: 'amber@nurture.co.in',
							pass: 'nurture@123'
						}
					});


				pool.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ", [rcreuserid], function (err, result) {
					createdgrname = result.rows['0'].emp_name;

					pool.query("SELECT comm_code_desc from common_code_tbl where code_id='MAIL' and comm_code_id='PROJ' ", function (err, result) {
						maillist = result.rows['0'].comm_code_desc;

						pool.query("select project_mgr,delivery_mgr from project_master_tbl where project_id=$1", [pid], function (err, result) {
							var projectmgr = result.rows['0'].project_mgr;
							var deliverymgr = result.rows['0'].delivery_mgr;


							pool.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ", [deliverymgr], function (err, result) {
								delname = result.rows['0'].emp_name;


								pool.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ", [projectmgr], function (err, result) {
									projmgrname = result.rows['0'].emp_name;

									pool.query("SELECT emp_email from emp_master_tbl where emp_id =$1", [projectmgr], function (err, result) {
										projectmgremail = result.rows['0'].emp_email;

										pool.query("SELECT emp_email from emp_master_tbl where emp_id =$1", [deliverymgr], function (err, result) {
											deliverymgremail = result.rows['0'].emp_email;

											pool.query("SELECT reporting_mgr from emp_master_tbl where emp_id=$1", [deliverymgr], function (err, result) {
												delrpt = result.rows['0'].reporting_mgr;

												pool.query("SELECT emp_email from emp_master_tbl where emp_id=$1", [delrpt], function (err, result) {
													delrptmail = result.rows['0'].emp_email;

													pool.query("SELECT comm_code_desc from common_code_tbl where code_id='FIN'", function (err, result) {
														finemail = result.rows['0'].comm_code_desc;


														var mailids = projectmgremail + "," + deliverymgremail;

														var cclist = finemail + "," + delrptmail;

														var mailOptions = {
															to: mailids,
															cc: cclist,
															from: 'amber@nurture.co.in',
															subject: 'Milestone Confirmation Notification ',
															html: '<img src="http://11735-presscdn-0-72.pagely.netdna-cdn.com/wp-content/uploads/confirmed-580x410.jpg" height="85"><br><br>' +
																'<h3>Dear Team,<br>Milestone has been marked as confirmed for following project</b>,<br><br>' +
																'<table style="border: 10px solid black;"><tr style="border: 10px solid black;"><th style="border: 10px solid black;">Project ID</th><th style="border: 10px solid black;">' + milestonedata + '</th></tr><tr style="border: 10px solid black;"><td style="border: 10px solid black;">Milestone Name</td><td style="border: 10px solid black;">' + milestoneName + '</td></tr><tr style="border: 10px solid black;"><td style="border: 10px solid black;">Milestone Confirmation By</td><td style="border: 10px solid black;">' + rcreuserid + '-' + createdgrname + '</td></tr></table><br><br>' +
																'URL: http://amber.nurture.co.in <br>' +
																'Finance Team can further proceed to raise the invoice.<br><br><br>' +
																'- Regards,<br><br>Amber</h3>'
														};



														smtpTransport.sendMail(mailOptions, function (err) {
														});

														console.log("success message", milestonedata);
														console.log("success message", milestoneName);
														req.flash('success', "Milestone " + milestoneName + " for the Project Id " + milestonedata + "  has been successfully Marked As Confirmed.")
														res.redirect('/markModule/markDetails/markDetails');

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
		}
		else {
			req.flash('error', "Project manager can only mark the milestone as confirmed")
			res.redirect('/markModule/markDetails/markDetails');
		}
	});
});


router.get('/recallmilestone', function (req, res) {

	var parse = "";
	var parse_count = "";
	var eid = req.user.rows['0'].user_id;

	pool.query("select distinct p.project_id from project_master_tbl p,milestone_proj_tbl m where p.project_id = m.project_id and m.confirm_flg='Y' and m.paid_flg='N' and m.status_flg='Y' and m.del_flg='N' and p.del_flg='N' and project_mgr = $1", [eid], function (err, result) {
		if (err) throw err;
		projectid = result.rows;
		projectid_count = result.rowCount;
		var emp_access = req.user.rows['0'].user_type;

		res.render('markModule/recallmilestone', {
			ename: req.user.rows['0'].user_name,
			eid: req.user.rows['0'].user_id,
			emp_access: emp_access,
			projectid: projectid,
			projectid_count: projectid_count,
			parse_count: parse_count,
			parse: parse
		});
	});
});


router.post('/recallbeforepost', recallbeforepost);
function recallbeforepost(req, res) {
	var project_id = req.body.projectid;
	console.log("project_id from crit page ", project_id);

	pool.query("SELECT project_id from project_master_tbl where closure_flg='N'  order by project_id asc", function (err, result) {
		if (err) throw err;
		projectid = result.rows;
		projectid_count = result.rowCount;

		pool.query("select * from project_master_tbl p,milestone_proj_tbl m where p.project_id = m.project_id and m.confirm_flg='Y' and m.paid_flg='N' and m.status_flg='Y' and m.del_flg='N' and p.del_flg='N' and m.project_id=$1 order by m.milestone_exp_date asc", [project_id], function (err, result) {
			parse = result.rows;
			parse_count = result.rowCount;

			res.render('markModule/recallmilestone', {
				project_id: project_id,
				ename: req.user.rows['0'].user_name,
				eid: req.user.rows['0'].user_id,
				emp_access: req.user.rows['0'].user_type,
				projectid_count: projectid_count,
				parse_count: parse_count,
				parse: parse
			});
		});
	});
};


router.post('/postrecallmilestone', postrecallmilestone);
function postrecallmilestone(req, res) {

	var array = req.body.button;
	var milestonedata = req.body.milestonedata;
	console.log(" project_id", milestonedata);
	var empId = req.user.rows['0'].user_id;
	var eid = req.user.rows['0'].user_id;
	var now = new Date();
	var rcreuserid = empId;
	var rcretime = now;
	var lchguserid = empId;
	var lchgtime = now;
	var confirmed_date = now;

	pool.query("SELECT project_mgr from project_master_tbl  where project_id=$1 ", [milestonedata], function (err, result) {
		projmgr = result.rows['0'].project_mgr;
		console.log("Project manager name:::", projmgr);
		console.log("Employee iD name:::", projmgr);


		if (projmgr == empId) {
			pool.query("select m.project_id,m.serial_number,m.milestone_name from project_master_tbl p,milestone_proj_tbl m where p.project_id = m.project_id and m.confirm_flg='Y' and m.paid_flg='N' and m.status_flg='Y' and m.del_flg='N' and p.del_flg='N' and m.project_id=$1 order by m.milestone_exp_date asc", [milestonedata], function (err, result) {
				pid = result.rows[array].project_id;
				milestoneName = result.rows[array].milestone_name;
				serial_number = result.rows[array].serial_number;
				confirm_amt = req.body["confirm_amt_" + array];
				console.log("pid", pid);
				console.log("confirm_amt", confirm_amt);
				console.log("milestoneName", milestoneName);
				console.log("serial_number", serial_number);

				pool.query("insert into milestone_proj_tbl_hist select * from milestone_proj_tbl where project_id=$1 and serial_number=$2 ", [milestonedata, serial_number], function (err, result) {
					if (err) throw err;
				});

				pool.query("update milestone_proj_tbl  set confirm_flg=$1,lchg_user_id=$2,lchg_time=$3,confirmed_date=$4,status_flg=$8,confirm_amount=$9  where project_id=$5 and milestone_name=$6 and serial_number=$7  ", ['N', lchguserid, lchgtime, null, milestonedata, milestoneName, serial_number, 'N', '0'], function (err, done) {
					if (err) throw err;

				});

				var smtpTransport = nodemailer.createTransport('SMTP', {
					service: 'gmail',
					auth:
					{
						user: 'amber@nurture.co.in',
						pass: 'nurture@123'
					}
				});



				pool.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ", [rcreuserid], function (err, result) {
					createdgrname = result.rows['0'].emp_name;
					console.log("created user name:::", createdgrname);

					pool.query("SELECT comm_code_desc from common_code_tbl where code_id='MAIL' and comm_code_id='PROJ' ", function (err, result) {
						maillist = result.rows['0'].comm_code_desc;
						console.log("mail list:::", maillist);

						pool.query("select project_mgr,delivery_mgr from project_master_tbl where project_id=$1", [pid], function (err, result) {
							var projectmgr = result.rows['0'].project_mgr;
							console.log("projectmgr!!!", projectmgr);
							var deliverymgr = result.rows['0'].delivery_mgr;
							console.log("deliverymgr!!", deliverymgr);
							pool.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ", [deliverymgr], function (err, result) {
								delname = result.rows['0'].emp_name;
								console.log("delname:::", delname);


								pool.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ", [projectmgr], function (err, result) {
									projmgrname = result.rows['0'].emp_name;
									console.log("project manager name:::", projmgrname);

									pool.query("SELECT emp_email from emp_master_tbl where emp_id =$1", [projectmgr], function (err, result) {
										projectmgremail = result.rows['0'].emp_email;
										console.log("projectmgremail--", projectmgremail);

										pool.query("SELECT emp_email from emp_master_tbl where emp_id =$1", [deliverymgr], function (err, result) {
											deliverymgremail = result.rows['0'].emp_email;
											console.log("deliverymgremail--", deliverymgremail);

											pool.query("SELECT reporting_mgr from emp_master_tbl where emp_id=$1", [deliverymgr], function (err, result) {
												delrpt = result.rows['0'].reporting_mgr;
												console.log("delivery manager's manager");

												pool.query("SELECT emp_email from emp_master_tbl where emp_id=$1", [delrpt], function (err, result) {
													delrptmail = result.rows['0'].emp_email;
													console.log("delivery manager's manager email");

													pool.query("SELECT comm_code_desc from common_code_tbl where code_id='FIN'", function (err, result) {
														finemail = result.rows['0'].comm_code_desc;
														console.log("finance mail", finemail);


														var mailids = projectmgremail + "," + deliverymgremail;
														console.log("mailids", mailids);

														var cclist = finemail + "," + delrptmail;
														console.log("cclist", cclist);

														var mailOptions = {
															to: mailids,
															cc: cclist,
															from: 'amber@nurture.co.in',
															subject: 'Milestone Recall Notification ',
															html: '<img src="" height="85"><br><br>' +
																'<h3>Dear Team,<br>Milestone has been recalled for following project</b>,<br><br>' +
																'<table style="border: 10px solid black;"><tr style="border: 10px solid black;"><th style="border: 10px solid black;">Project ID</th><th style="border: 10px solid black;">' + milestonedata + '</th></tr><tr style="border: 10px solid black;"><td style="border: 10px solid black;">Milestone Name</td><td style="border: 10px solid black;">' + milestoneName + '</td></tr><tr style="border: 10px solid black;"><td style="border: 10px solid black;">Milestone Confirmation By</td><td style="border: 10px solid black;">' + rcreuserid + '-' + createdgrname + '</td></tr></table><br><br>' +
																'URL: http://amber.nurture.co.in <br>' +
																'Project Manager can further proceed to mark the milestone again.<br><br><br>' +
																'- Regards,<br><br>Amber</h3>'
														};


														smtpTransport.sendMail(mailOptions, function (err) {
														});


														console.log("success message", milestonedata);
														console.log("success message", milestoneName);
														req.flash('success', "Milestone " + milestoneName + " for the Project Id " + milestonedata + "  has been successfully  recalled.")
														res.redirect('/markModule/markDetails/recallmilestone');

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
		}
		else {
			req.flash('error', "Only Project manager can recall the Milestone.")
			res.redirect('/markModule/markDetails/recallmilestone');
		}
	});
};


router.get('/markFAQDetails', markFAQDetails);
function markFAQDetails(req, res) {
	var emp_id = req.user.rows[0].user_id;
	var emp_name = req.user.rows[0].user_name;
	var emp_access = req.user.rows[0].user_type;

	res.render('markModule/markFAQDetails',
		{
			emp_id: emp_id,
			emp_name: emp_name,
			emp_access: emp_access
		});
};



////////////////////////////////////////////////////////////////////////

module.exports = router;
