console.log("Project enterd");
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
// const roundTo = require('round-to');
const roundTo = require('math-round');




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// Child Project Add (GET) ///////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/childproject', function (req, res) {
	var empId = req.query.empid;
	console.log(empId);
	pool.query("SELECT user_type from users where user_id = $1", [empId], function (err, result) {
		var emp_access = result.rows[0].user_type;
		console.log(emp_access);
		pool.query("SELECT emp_id,emp_name from emp_master_tbl ", function (err, result) {
			var employee = result.rows;
			console.log("empid:::", employee);

			pool.query("SELECT customer_id ,customer_name  from customer_master_tbl ", function (err, result) {
				var customer_id = result.rows;
				console.log("cid:::", customer_id);

				pool.query("SELECT comm_code_id,comm_code_desc  from common_code_tbl where code_id = 'CUS' order by comm_code_id asc", function (err, result) {
					var comm_code_id = result.rows;
					console.log("classid:::", comm_code_id);

					pool.query("SELECT comm_code_id ,comm_code_desc from common_code_tbl where code_id = 'PCR'  order by comm_code_id asc", function (err, result) {
						var comm_code_pcr = result.rows;
						var comm_code_pcr_count = result.rowCount;
						console.log("classdesc::", comm_code_pcr);
						console.log("classdesc_count:::", comm_code_pcr_count);

						pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PTY'  order by comm_code_id asc", function (err, result) {
							var comm_code_pty = result.rows;
							console.log("classdesc::", comm_code_pty);

							pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TNU'  order by comm_code_id asc", function (err, result) {
								comm_code_tnu = result.rows;

								console.log("classdesc::", comm_code_tnu);


								pool.query("SELECT emp_name,emp_id  from emp_master_tbl where emp_access in ('L1','L2') order by emp_id asc", function (err, result) {
									var delname = result.rows;
									console.log("delname:::", delname);

									pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PAT' order by comm_code_id asc", function (err, result) {
										var comm_paymentype = result.rows;
										var comm_paymentype_count = result.rowCount;
										console.log("classpayment:::", comm_paymentype);
										console.log("classpayment_count:::", comm_paymentype_count);

										pool.query("select project_id from project_master_tbl where closure_flg='N'  order by project_id asc ", function (err, result) {
											// and chld_flg='N' --->this coloumn is not present in a table
											var parpid = result.rows;
											var parpid_count = result.rowCount;
											console.log("at end");

											res.json({
												message: 'redirect to child project',
												data: {
													employee: employee,
													comm_code_id: comm_code_id,
													customer_id: customer_id,
													comm_code_pcr: comm_code_pcr,
													comm_code_pty: comm_code_pty,
													comm_code_tnu: comm_code_tnu,
													delname: delname,
													comm_paymentype: comm_paymentype,
													parpid: parpid
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
	});

});




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// Child Parent Project Fetch ////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.get('/fetchDet', (req, res) => {

	var parpid = req.query.parpid;
	console.log("project id", parpid);
	pool.query("select cid,delivery_mgr,payment_type,customer_class,team_size,rate,po_number,project_mgr,project_type,project_curr,bill_addrline1,bill_addrline2,bill_country,bill_city,bill_pin_code,project_loc,perdium_amount_per_day,perdium_curr_per_day from project_master_tbl where project_id=$1", [parpid], function (err, result) {
		console.log(result.rows);
		// console.log(result);
		const cid = result.rows[0].cid
		console.log(cid);
		var delmgr = result.rows[0].delivery_mgr;
		var paymenttype = result.rows[0].payment_type;
		console.log("paymenttype", paymenttype);
		var classid = result.rows[0].customer_class;
		var projectsize = result.rows[0].team_size;
		var projmgr = result.rows[0].project_mgr;
		var projtype = result.rows[0].project_type;
		var projcur = result.rows[0].project_curr;
		var clientaddr1 = result.rows[0].bill_addrline1;
		var clientaddr2 = result.rows[0].bill_addrline2;
		var countryId = result.rows[0].bill_country;
		var cityId = result.rows[0].bill_city;
		var pincode = result.rows[0].bill_pin_code;
		var perloc = result.rows[0].project_loc;
		var perdiumamt = result.rows[0].perdium_amount_per_day;
		var perprocurr = result.rows[0].perdium_curr_per_day;
		var po_number = result.rows[0].po_number;
		var rate = result.rows[0].rate;




		pool.query("SELECT customer_id,customer_name from customer_master_tbl where customer_id=$1", [cid], function (err, result) {
			var customer_name = result.rows['0'].customer_name;
			var cid = result.rows['0'].customer_id;


			pool.query("SELECT emp_id,emp_name from emp_master_tbl where emp_id=$1", [delmgr], function (err, result) {
				var delmgr_name = result.rows['0'].emp_name;
				var delmgr = result.rows['0'].emp_id;
				var delmgr = delmgr + "-" + delmgr_name;

				pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'CUS' and comm_code_id=$1", [classid], function (err, result) {
					var class_id_name = result.rows['0'].comm_code_desc;
					var classid = result.rows['0'].comm_code_id;
					var classid = classid + "-" + class_id_name;

					pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PTY' and comm_code_id=$1", [projtype], function (err, result) {
						var project_type_name = result.rows['0'].comm_code_desc;
						var projtype = result.rows['0'].comm_code_id;



						res.json({ key: cid, key1: delmgr, key2: paymenttype, key3: classid, key4: projectsize, key5: projmgr, key6: projtype, key7: projcur, key8: clientaddr1, key9: clientaddr2, key10: countryId, key11: cityId, key12: pincode, key13: perloc, key14: perdiumamt, key15: perprocurr, key16: parpid, key17: po_number, key18: rate });

					});
				});
			});
		});

	});
})




/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// Child Project Add (POST) //////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////

router.post('/addchildproject', (req, res) => {
	console.log(req.body, "/..........");
	var empId = req.body.user_id;
	var eid = req.body.user_id;
	var now = new Date();
	var rcreuserid = empId;
	var rcretime = now;
	var lchguserid = empId;
	var lchgtime = now;


	var parpid = req.body.item.parentProjectid;
	console.log(parpid);
	var paymenttype = req.body.item.paymentType;
	var projectsize = req.body.item.projectTeamSize;
	var projectmgr = req.body.item.projectManager;
	var projcur = req.body.item.projectCurrency;
	var projsdate = req.body.item.startDate;
	var projcdate = req.body.item.endDate;
	var Projbud = req.body.item.projectBudget;
	var targmar = req.body.item.targetMarginPercentage;
	var Totalbud = req.body.item.totalBudget;
	var salary = req.body.item.salary;
	var perdium = req.body.item.perdiem;
	var travel = req.body.item.travel;
	var other = req.body.item.others;
	var module = req.body.item.module;
	var nousers = req.body.item.nousers;
	var nobranch = req.body.item.nobranch;
	var fpexpdate = req.body.item.fpexpdate;
	var millength = req.body.item.millength;

	if (fpexpdate == "") {
		var fpexpdate = null;
	}

	var tenure = req.body.tenure;
	var projexpdate = req.body.item.projexpdate;

	if (projexpdate == "") {
		var projexpdate = null;
	}

	var subper = req.body.item.subper;
	var subamt = req.body.item.subamt;
	var povalue = req.body.item.povalue;
	var Noofppl = req.body.item.Noofppl;
	var perloc = req.body.item.perloc;
	var perdiumamt = req.body.item.perdiumamt;
	var percur = req.body.item.percur;
	var rateamt = req.body.item.rateamt;
	var ponumber = req.body.item.ponumber;
	var rmks = req.body.item.rmks;
	var perloc = req.body.item.perloc;
	var perdiumamt = req.body.item.perdiumamt;
	var perprocurr = req.body.item.perprocurr;
	var salarycurr = req.body.item.salarycurr;
	var perdiemamtcurr = req.body.item.perdiemamtcurr;
	var travelamtcurr = req.body.item.travelamtcurr;
	var otheramtcurr = req.body.item.otheramtcurr;
	var projectid = 0;
	var milcount = 0;
	var datetime = new Date();
	var salrate = req.body.item.salrate;
	var perrate = req.body.item.perrate;
	var travelrate = req.body.item.travelrate;
	var otherrate = req.body.item.otherrate;
	var salconamt = req.body.item.salconamt;
	var perconamt = req.body.item.perconamt;
	var traconamt = req.body.item.traconamt;
	var othconamt = req.body.item.othconamt;


	pool.query("select cid,delivery_mgr,customer_class,team_size,project_type,bill_addrline1,bill_addrline2,bill_country,bill_city,bill_pin_code from project_master_tbl where project_id=$1", [parpid], function (err, result) {
		console.log(result);
		var cid = result.rows[0].cid
		var delmgr = result.rows[0].delivery_mgr;
		var classid = result.rows[0].customer_class;
		var projectsize = result.rows[0].team_size;
		var projtype = result.rows[0].project_type;
		var clientaddr1 = result.rows[0].bill_addrline1;
		var clientaddr2 = result.rows[0].bill_addrline2;
		var countryId = result.rows[0].bill_country;
		var cityId = result.rows[0].bill_city;
		var pincode = result.rows[0].bill_pin_code;



		pool.query("SELECT chld_cnt from project_master_tbl where project_id = $1", [parpid], function (err, result) {
			if (err) throw err;

			var proj_count = result.rows[0].chld_cnt;
			console.log("child count", proj_count);

			if (proj_count == 0) {
				proj_count = 1;
			}
			else {
				proj_count = (proj_count - 0) + (1 - 0);
			}

			projectid = classid + "-" + cid + "-" + projtype + "-" + "C" + "-" + proj_count;
			console.log("project id", projectid);

			pool.query("SELECT * from project_master_tbl where LOWER(project_id) = LOWER($1)", [projectid], function (err, resultset) {
				if (err) throw err;
				var rcount = resultset.rowCount;
				console.log("rcount", rcount);

				if (rcount == 0) {
					console.log("inside rcount");

					var milname_arr = [];
					var caper_arr = [];
					var diramt_arr = [];
					var milDate_arr = [];

					pool.query("INSERT INTO project_master_tbl(project_id,cid,project_loc,payment_type,customer_class,team_size,project_mgr,delivery_mgr,project_type,project_curr,project_budget,target_margin,tot_budget,salary,salarycurr,perdium,perdiumcurr,travel,travelcurr,other_exp,other_expcurr,fl_modules_included,fl_num_users,fl_num_of_branches,start_date,end_date,rcre_user_id,rcre_time,lchg_user_id,lchg_time,del_flg,perdium_amount_per_day,perdium_curr_per_day,bill_addrline1,bill_addrline2,bill_country,bill_city,bill_pin_code,rate,po_number,remarks,closure_flg,sow_upld,chld_flg,chld_parent_prj,salary_rate,perdiem_rate,travel_rate,other_rate,salary_converted_amt,travel_converted_amt,perdiem_converted_amt,other_converted_amt) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25,$26,$27,$28,$29,$30,$31,$32,$33,$34,$35,$36,$37,$38,$39,$40,$41,$42,$43,$44,$45,$46,$47,$48,$49,$50,$51,$52,$53)", [projectid, cid, perloc, paymenttype, classid, projectsize, projectmgr, delmgr, projtype, projcur, Projbud, targmar, Totalbud, salary, salarycurr, perdium, perdiemamtcurr, travel, travelamtcurr, other, otheramtcurr, module, nousers, nobranch, projsdate, projcdate, rcreuserid, rcretime, lchguserid, lchgtime, 'N', perdiumamt, perprocurr, clientaddr1, clientaddr2, countryId, cityId, pincode, rateamt, ponumber, rmks, 'N', 'N', 'Y', parpid, salrate, perrate, travelrate, otherrate, salconamt, perconamt, traconamt, othconamt], function (err, done) {
						if (err) throw err;
						//var millength1 = (millength - 0) - (1 - 0);

						for (i = 0; i < millength; i++) {
							var milname = req.body["milname_" + i];
							var caper = req.body["caper_" + i];
							var diramt = req.body["diramt_" + i];
							var milDate = req.body["milDate_" + i];
							console.log("name", milname);
							console.log("caper", caper);
							console.log("diramt", diramt);
							console.log("milDate", milDate);

							if (typeof milname === 'undefined') {

							}
							else {
								milname_arr.push(milname);
								caper_arr.push(caper);
								diramt_arr.push(diramt);
								milDate_arr.push(milDate);
								milcount = (milcount - 0) + (1 - 0);

								pool.query("INSERT INTO milestone_proj_tbl(project_id,serial_number,milestone_name,capture_per,direct_amount,milestone_exp_date,del_flg,rcre_user_id,lchg_user_id,rcre_time,lchg_time,confirm_flg,paid_flg,status_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)", [projectid, i, milname, caper, diramt, milDate, 'N', rcreuserid, lchguserid, rcretime, lchgtime, 'N', 'N', 'N'], function (err, done) {
									if (err) throw err;
								});

								pool.query("update project_master_tbl set chld_cnt=$1 where project_id=$2", [proj_count, parpid], function (err, result) {
								});

							}
						}


						pool.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ", [delmgr], function (err, result) {
							var delname = result.rows['0'].emp_name;
							console.log("delname:::", delname);

							pool.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ", [projectmgr], function (err, result) {
								var projmgrname = result.rows['0'].emp_name;
								console.log("project manager name:::", projmgrname);

								pool.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ", [rcreuserid], function (err, result) {
									var createdgrname = result.rows['0'].emp_name;
									console.log("created user name:::", createdgrname);

									pool.query("select project_mgr,delivery_mgr from project_master_tbl where project_id=$1", [projectid], function (err, result) {
										var projectmgr = result.rows['0'].project_mgr;
										var deliverymgr = result.rows['0'].delivery_mgr;
										console.log("projectmgr!!!", projectmgr);
										console.log("deliverymgr!!", deliverymgr);

										pool.query("SELECT emp_email from emp_master_tbl where emp_id =$1", [projectmgr], function (err, result) {
											var projectmgremail = result.rows['0'].emp_email;
											console.log("projectmgremail--", projectmgremail);

											pool.query("SELECT emp_email from emp_master_tbl where emp_id =$1", [deliverymgr], function (err, result) {
												var deliverymgremail = result.rows['0'].emp_email;
												console.log("deliverymgremail--", deliverymgremail);

												pool.query("SELECT reporting_mgr from emp_master_tbl where emp_id=$1", [delmgr], function (err, result) {
													var delrpt = result.rows['0'].reporting_mgr;
													console.log("delivery manager's manager");

													pool.query("SELECT emp_email from emp_master_tbl where emp_id=$1", [delrpt], function (err, result) {
														var delrptmail = result.rows['0'].emp_email;
														console.log("delivery manager's manager email");


														pool.query("SELECT comm_code_desc from common_code_tbl where code_id='FIN'", function (err, result) {
															var finemail = result.rows['0'].comm_code_desc;
															console.log("finance mail", finemail);

															var mailids = projectmgremail + "," + deliverymgremail;
															console.log("mailids", mailids);

															var cclist = finemail + "," + delrptmail;
															console.log("cclist", cclist);

															const transporter = nodemailer.createTransport({
																service: 'gmail',
																auth: {
																	user: 'mohammadsab@minorks.com',
																	pass: '9591788719'
																}
															});
															const mailOptions = {
																from: 'mohammadsab@minorks.com',
																to: mailids,
																cc: cclist,
																from: 'amber@nurture.co.in',
																subject: 'Project Creation Notification ',
																text: 'Hi Team ,\n\n' +
																	' Child Project Creation Details.\n\n' +
																	' Parent Project ID   : ' + parpid + ' .\n' +
																	' Child Project ID    : ' + projectid + ' .\n' +
																	' Delivery manager    : ' + delmgr + '-' + delname + ' .\n' +
																	' Project manager     : ' + projectmgr + '-' + projmgrname + '\n' +
																	' Project created by  : ' + rcreuserid + '-' + createdgrname + '.\n\n\n\n' +
																	'- Regards,\n Amber'
																// text: 'This is a test email sent from Node.js using Nodemailer.'
															};
															transporter.sendMail(mailOptions, function (error, info) {
																if (error) {
																	console.error('Error sending email', error);
																} else {
																	console.log('Email sent:', info.response);
																}


															});


															// req.flash('success', "Child Project :" + projectid + " created sucessfully for Parent Project :" + parpid + ".")
															// res.redirect('/projectModule/childproject/childproject');
															res.json({ message: 'redirect to childProject', notification: 'Child Project :" + projectid + " created sucessfully for Parent Project :" + parpid + ".' })

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
					// req.flash('error', "Project Details Already Added")
					// res.redirect(req.get('referer'));
					res.json({ message: 'redirect to reffer', notification: "Project Details Already Added" })
				}

			});
		});
	});
});

/////////////////////////// child project End///////////////////////////////////////////////////////////


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// project start //////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////



////////////////////////////////////////////// Coustomer Creation ///////////////////////////////////////////////////////////////////

router.post('/customercreation', customercre);

function customercre(req, res) {
	console.log(req.body);
	console.log("111");
	var now = new Date();
	var rcreuserid = req.body.user_id;
	var rcretime = now;
	var lchguserid = req.body.user_id;
	var lchgtime = now;

	var cname = req.body.Item.customerName;
	var cid = req.body.Item.customerID;
	var clientaddr1 = req.body.Item.clientAddressLine1;
	var clientaddr2 = req.body.Item.clientAddressLine2;
	var clientname1 = req.body.Item.clientName1;
	var clientname2 = req.body.Item.clientName2;
	var cemail1 = req.body.Item.clientEmialId1;
	var cemail2 = req.body.Item.clientEmialId2;
	var clientph1 = req.body.Item.clinetContactNumber1;
	var clientph2 = req.body.Item.clinetContactNumber2;
	var gstno = req.body.Item.GSTNumber;
	var pannum = req.body.Item.PANNumber;
	var countryId = req.body.Item.countryName;
	var cityId = req.body.Item.cityName;
	var rmks = req.body.Item.remarks;

	console.log("userid", rcreuserid);
	console.log("rtime", rcretime);
	console.log("luserid", lchguserid);
	console.log("ltime", lchgtime);
	console.log("cname", cname);
	console.log("cid", cid);
	console.log("gstno", gstno);
	console.log("pannum", pannum);
	console.log("countryId", countryId);
	console.log("cityId", cityId);
	console.log("clientname1", clientname1);
	console.log("cemail1", cemail1);
	console.log("clientph1", clientph1);
	console.log("clientname2", clientname2);
	console.log("cemail2", cemail2);
	console.log("clientph2", clientph2);
	console.log("rmks", rmks);
	console.log("clientaddr1", clientaddr1);
	console.log("clientaddr2", clientaddr2);


	pool.query("SELECT  * from customer_master_tbl  where LOWER(customer_id) = LOWER($1)",
		[cid], function (err, resultset) {
			if (err) throw err;
			var rcount = resultset.rowCount;
			console.log("rcount", rcount);


			if (rcount == 0) {

				pool.query("INSERT INTO customer_master_tbl(customer_name,customer_id,customer_addr1,customer_addr2,client_name1,client_email1,client_contact1,client_name2,client_email2,client_contact2,rcre_user_id,rcre_time,lchg_user_id,lchg_time,del_flg,gstno,pannum,customer_country,customer_city,remarks) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)", [cname, cid, clientaddr1, clientaddr2, clientname1, cemail1, clientph1, clientname2, cemail2, clientph2, rcreuserid, rcretime, lchguserid, lchgtime, 'N', gstno, pannum, countryId, cityId, rmks], function (err, done) {
					if (err) throw err;

					res.json({
						notification: "Customer Details  Added Successfully: " + cid, message: 'redirect to customerview', customerViewData: {
							// emp_access: emp_access,
							// ename: req.user.rows['0'].user_name,
							// eid: req.user.rows['0'].user_id,
							cname: cname,
							cid: cid,
							clientaddr1: clientaddr1,
							countryId: countryId,
							cityId: cityId,
							clientname1: clientname1,
							cemail1: cemail1,
							clientph1: clientph1,
							clientname2: clientname2,
							cemail2: cemail2,
							clientph2: clientph2,
							rmks: rmks,
							gstno: gstno,
							pannum: pannum,
							clientaddr2: clientaddr2,

						}
					});
				});
			}
			else {
				res.json({ notification: "Customer Details Already Added", message: 'redirect to Customercreation', });

			}


		});

};
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////// project add //////////////////////////////////////////////
/////////////////////////////////////////////////////////////////////////////////////////////////////////////////


router.get('/fetchProjectAddDetails', function (req, res) {
	var empId = req.query.user_id;
	pool.query("SELECT user_type from users where user_id = $1", [empId], function (err, result) {
		var emp_access = result.rows['0'].user_type;

		if (emp_access != "A1") {
			res.redirect('/admin-dashboard/adminDashboard/admindashboard');
		}
		else {
			pool.query("SELECT emp_id,emp_name from emp_master_tbl order by emp_id asc", function (err, result) {
				var employee = result.rows;
				var empid_count = result.rowCount;
				console.log("empid:::", employee);
				console.log("empid_count:::", empid_count);

				pool.query("SELECT emp_name from emp_master_tbl order by emp_id asc", function (err, result) {
					var empname = result.rows;
					var empname_count = result.rowCount;
					console.log("empname:::", empname);
					console.log("empname_count:::", empname_count);

					pool.query("SELECT customer_id,customer_name from customer_master_tbl order by customer_id asc", function (err, result) {
						var customer = result.rows;

						console.log("cid:::", customer);

						pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'CUS' order by comm_code_id asc", function (err, result) {
							var comm_code_id_cus = result.rows;
							console.log("classid:::", comm_code_id_cus);

							pool.query("SELECT comm_code_id from common_code_tbl where code_id = 'PCR'  order by comm_code_id asc", function (err, result) {
								var comm_code_pcr = result.rows;
								console.log("classdesc::", comm_code_pcr);

								pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PTY'  order by comm_code_id asc", function (err, result) {
									var comm_code_pty = result.rows;
									console.log("classdesc::", comm_code_pty);

									pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TNU'  order by comm_code_id asc", function (err, result) {
										comm_code_tnu = result.rows;
										console.log("classdesc::", comm_code_tnu);

										pool.query("SELECT emp_name,emp_id from emp_master_tbl where emp_access in ('L1','L2') order by emp_id asc", function (err, result) {
											var delname = result.rows;
											console.log("delname:::", delname);

											pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PAT' order by comm_code_id asc", function (err, result) {
												var comm_paymentype = result.rows;
												console.log("classpayment:::", comm_paymentype);

												pool.query("select project_id from project_master_tbl where closure_flg='N' and chld_flg='N' order by project_id asc ", function (err, result) {
													var parpid = result.rows;

													pool.query("SELECT emp_id,emp_name from emp_master_tbl where designation='PM'", function (err, result) {
														var projMgr = result.rows;
														res.json({
															deAddProjDet: {
																emp_access: emp_access,
																parpid: parpid,
																employee: employee,
																comm_code_id_cus: comm_code_id_cus,
																comm_code_pty: comm_code_pty,
																comm_code_pcr: comm_code_pcr,
																comm_code_tnu: comm_code_tnu,
																customer: customer,
																delname: delname,
																comm_paymentype: comm_paymentype,
																projMgr: projMgr
															}
														});
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
		}
	});
});
///////////////////////////////////////////////////////////////////////////////////add project details//////////////////////////////////
router.post('/addproductdetails', addproductdetails);
function addproductdetails(req, res) {
	console.log(req.body);
	var empId = req.body.user_id;
	var eid = req.body.user_id;
	var now = new Date();
	var rcreuserid = empId;
	var rcretime = now;
	var lchguserid = empId;
	var lchgtime = now;
	var cid = req.body.Item.customerId;
	var paymenttype = req.body.Item.paymentType;
	var classid = req.body.Item.customerClass;
	var projectsize = req.body.Item.projectsize;
	var projectmgr = req.body.Item.projectManager;
	var projtype = req.body.Item.projectType;
	var projcur = req.body.Item.projectCurrency;
	var projsdate = req.body.Item.startDate;
	var projcdate = req.body.Item.endDate;
	var delmgr = req.body.Item.deliveryManager;
	var rateamt = req.body.Item.rateamt;
	var ponumber = req.body.Item.poNumber;
	var rmks = req.body.Item.remarks;
	var projectid = 0;
	pool.query("SELECT count(*) as cnt from project_master_tbl where LOWER(cid)= LOWER($1) ", [cid], function (err, result) {
		if (err) throw err;
		var proj_count = result.rows[0].cnt;
		console.log("rcount", proj_count);

		if (proj_count == 0) {
			proj_count = 1;
		}
		else {
			proj_count = (proj_count - 0) + (1 - 0);
		}

		console.log("classcount count", proj_count);

		projectid = classid + "-" + cid + "-" + projtype + "-" + proj_count;
		console.log("project id", projectid);


		pool.query("SELECT  * from project_master_tbl  where LOWER(project_id) = LOWER($1)",
			[projectid], function (err, resultset) {
				if (err) throw err;
				var rcount = resultset.rowCount;
				console.log("rcount", rcount);
				if (rcount == 0) {
					var milname_arr = [];
					var caper_arr = [];
					var diramt_arr = [];
					var milDate_arr = [];

					pool.query("INSERT INTO project_master_tbl(project_id,cid,payment_type,customer_class,team_size,project_mgr,delivery_mgr,project_type,project_curr,start_date,end_date,rcre_user_id,rcre_time,lchg_user_id,lchg_time,del_flg,rate,po_number,remarks,closure_flg,sow_upld,chld_cnt,chld_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23)", [projectid, cid, paymenttype, classid, projectsize, projectmgr, delmgr, projtype, projcur, projsdate, projcdate, rcreuserid, rcretime, lchguserid, lchgtime, 'N', rateamt, ponumber, rmks, 'N', 'N', '0', 'N'], function (err, done) {

						pool.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ", [projectmgr], function (err, result) {
							console.log(result.rows);
							projmgrname = result.rows['0'].emp_name;
							console.log("project manager name:::", projmgrname);

							pool.query("SELECT emp_name from emp_master_tbl where emp_id=$1 ", [rcreuserid], function (err, result) {
								createdgrname = result.rows['0'].emp_name;
								console.log("created user name:::", createdgrname);

								pool.query("SELECT comm_code_desc from common_code_tbl where code_id='MAIL' and comm_code_id='PROJ' ", function (err, result) {
									maillist = result.rows['0'].comm_code_desc;
									console.log("mail list:::", maillist);

									pool.query("select project_mgr,delivery_mgr from project_master_tbl where project_id=$1", [projectid], function (err, result) {
										projectmgr = result.rows['0'].project_mgr;
										deliverymgr = result.rows['0'].delivery_mgr;
										console.log("projectmgr!!!", projectmgr);
										console.log("deliverymgr!!", deliverymgr);


										pool.query("SELECT emp_name from  emp_master_tbl where emp_id=$1 ", [deliverymgr], function (err, result) {
											delname = result.rows['0'].emp_name;
											console.log("delname:::", delname);


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


																// var smtpTransport = nodemailer.createTransport('SMTP', {
																// 	service: 'gmail',
																// 	auth:
																// 	{
																// 		user: 'amber@nurture.co.in',
																// 		pass: 'nurture@123'
																// 	}
																// });


																// var mailOptions = {
																// 	to: mailids,
																// 	cc: cclist,
																// 	from: 'amber@nurture.co.in',
																// 	subject: 'Project Creation Notification ',
																// 	text: 'Dear Team,\n\n' +
																// 		'Product Creation Details.\n\n' +
																// 		'Project ID:  ' + projectid + '\n' +
																// 		'Delivery manager:  ' + deliverymgr + '-' + delname + '\n' +
																// 		'Project manager:   ' + projectmgr + '-' + projmgrname + '\n' +
																// 		'Project created by ' + rcreuserid + '-' + createdgrname + '.\n\n\n\n' +
																// 		'- Regards,\n Amber'
																// };

																// smtpTransport.sendMail(mailOptions, function (err) {
																// });
																const transporter = nodemailer.createTransport({
																	service: 'gmail',
																	auth: {
																		user: 'mohammadsab@minorks.com',
																		pass: '9591788719'
																	}
																});



																const mailOptions = {
																	from: 'mohammadsab@minorks.com',
																	to: mailids,
																	cc: cclist,

																	subject: 'Project Creation Notification ',
																	text: 'Dear Team,\n\n' +
																		'Product Creation Details.\n\n' +
																		'Project ID:  ' + projectid + '\n' +
																		'Delivery manager:  ' + deliverymgr + '-' + delname + '\n' +
																		'Project manager:   ' + projectmgr + '-' + projmgrname + '\n' +
																		'Project created by ' + rcreuserid + '-' + createdgrname + '.\n\n\n\n' +
																		'- Regards,\n Amber'
																	// text: 'This is a test email sent from Node.js using Nodemailer.'
																};
																console.log(mailOptions, "mailll");
																transporter.sendMail(mailOptions, function (error, info) {
																	if (error) {
																		console.error('Error sending email', error);
																	} else {
																		console.log('Email sent:', info.response);
																	}

																	res.json({ message: 'redirect to addproductdetals', notification: "Product Id created successfully with Project Id " + projectid + "" })

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

						// req.flash('success', "Product Id created successfully with Project Id " + projectid + ".")
						// res.redirect('/projectModule/productdetails/productdetails');
						res.json({ message: 'redirect to addproductdetals', notification: "Product Id created successfully with Project Id " + projectid + "" })
						if (err) throw err;
					});

				}
				else {
					// req.flash('error', "Project Details Already Added")
					// res.redirect(req.get('referer'));
					res.json({ message: 'redirect to addProductDetails', notification: 'Project Details Already Added ' })
				}

			});
	});
};

////////////////// project allocation ////////////////////////////////////////////////////////////////////////////////////////
router.get('/fetchaddPjtAlldetails', function (req, res) {
	console.log(req.body);
	var empId = req.body.user_id;

	pool.query("SELECT customer_name,project_id from project_master_tbl p INNER JOIN customer_master_tbl c ON c.customer_id=p.cid where p.closure_flg='N' and p.del_flg='N' AND SOW_UPLD = 'Y' order by p.project_id asc", function (err, result) {
		projectname = result.rows;
		projid_count = result.rowCount;

		pool.query("select e.emp_name,e.emp_id,(select COALESCE( NULLIF(sum(b.percentage_alloc),null) ,0) from project_alloc_tbl b where b.del_flg='N' and b.emp_id=e.emp_id) as alloc from emp_master_tbl e inner join e_docket_tbl d on e.emp_id=d.emp_id  where e.emp_access in ('L2','L3','L1') and pan_flg='Y' and aadhar_flg='Y' and sslc_flg='Y' and preuniv_flg='Y' and degree_flg='Y' and d.del_flg='N' and e.emp_id not in (select a.emp_id from project_alloc_tbl a group by a.emp_id having sum(percentage_alloc) =100) order by e.emp_name asc", function (err, result) {
			empname = result.rows;
			empname_count = result.rowCount;

			pool.query("select e.emp_id,e.emp_name from emp_master_tbl e inner join e_docket_tbl d on e.emp_id=d.emp_id  where e.emp_access in ('L3') and pan_flg='Y' and aadhar_flg='Y' and sslc_flg='Y' and preuniv_flg='Y' and degree_flg='Y' and d.del_flg='N' order by e.emp_id asc", function (err, result) {
				manager = result.rows;
				id_count = result.rowCount;

				pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'PCR'  ", function (err, result) {
					home_cur = result.rows;
					home_cur_count = result.rowCount;
					console.log("home currency is", home_cur);
					console.log("home currency count :::", home_cur_count);


					res.json({
						fetchaddPjtAlldetails: {
							manager: manager,
							empname: empname,
							home_cur: home_cur,
							projectname: projectname
						}
					});


				});
			});
		});
	});

});
function round(val, precision) {
	if (typeof val !== 'number') {
		throw new TypeError('Expected value to be a number');
	}

	if (!Number.isInteger(precision)) {
		throw new TypeError('Expected precision to be an integer');
	}

	const roundedNumber = Number(val.toFixed(precision));
	return roundedNumber;
}
router.post('/projectAllocation', projectalloc);

function projectalloc(req, res) {

	console.log(req.body);
	var now = new Date();
	var rcreuserid = req.body.user_id;
	var rcretime = now;
	var lchguserid = req.body.user_id;
	var lchgtime = now;
	var empsel = req.body.empselected;
	var noofdays = req.body.item.noofworkingdays;
	var noofmonths = req.body.item.noofworkingmonths;
	var firstmonthdays = req.body.item.firstmonthdays;
	var lastmonthdays = req.body.item.lastmonthdays;
	var firstnoofdays = req.body.item.firstnoofhdays;
	var lastnoofdays = req.body.item.lastnoofhdays;
	var projid = req.body.item.projectid;
	var projman = req.body.item.projectReportingManager;
	var peralloc = req.body.item.projectAllocation;
	var padate = req.body.item.allocationStartDate;
	var pedate = req.body.item.allocationEndDate;
	var employeebillable = req.body.item.employeeBillable;
	var employeeloc = req.body.item.employeeLocationType;
	var homecur = req.body.homecur;
	var convRate = req.body.item.convRate;
	var totempsal = "";
	var ftxt1 = "";
	var ftxt2 = "";
	var ftxt3 = "";
	var errlength = 0;
	var error_flg = "N";
	if (convRate == "") {
		convRate = 1;
	}
	console.log("userid", rcreuserid)
	console.log('noofdays', noofdays);
	console.log('noofmonths', noofmonths);
	console.log('firstmonthdays', firstmonthdays);
	console.log('lastmonthdays', lastmonthdays);
	console.log('firstnoofdays', firstnoofdays);
	console.log('lastnoofdays', lastnoofdays);
	console.log("userid", rcreuserid);
	console.log("rtime", rcretime);
	console.log("luserid", lchguserid);
	console.log("ltime", lchgtime);
	console.log("selected", empsel);
	console.log("projectid", projid);
	console.log("projman", projman);
	console.log("%alloc", peralloc);
	console.log("padate", padate);
	console.log("pedate", pedate);
	console.log("homecur", homecur);
	console.log("employeebillable", employeebillable);
	console.log("emplocation", employeeloc);
	console.log("convertionrate", convRate);

	console.log(typeof (empsel));
	var emplist = empsel.slice();
	console.log(emplist, typeof (emplist));
	// var arr = emplist.split("-").map(function (val) { return +val + 0; });
	var arr = Object.entries(emplist);

	console.log("arrayemp", arr);
	var rArr = arr;
	var i = 0;
	var j = 0;
	emp = "";
	totperalloc = 0;
	perremalloc = 0;
	var totempcnt = 0;
	var totutilizedper = 0;
	var len = arr.length;
	var arraycnt = 0;
	console.log('arr len', len);

	if (len > 1) {
		peralloc = 100;
	}

	pool.query("SELECT sow_upld from project_master_tbl where project_id=$1", [projid], function (err, resultset) {
		if (err) throw err;
		var sow_upld_flg = resultset.rows[0].sow_upld;

		if (sow_upld_flg != "Y") {
			// req.flash('error', "Project Allocation cannot be done , Since Project Sow Details have not been Uploaded")
			// res.redirect('/projectModule/projectDetails/projectAllocation');
			res.json({ message: 'redirect to project allocation', notification: "Project Allocation cannot be done , Since Project Sow Details have not been Uploaded" })
		}
		else {
			pool.query("SELECT  comm_code_desc from common_code_tbl where del_flg='N' and code_id ='MAIL' and comm_code_id = 'PROJ' ", function (err, resultset) {
				if (err) throw err;
				var mail1 = resultset.rows[0].comm_code_desc;
				console.log('mail1', mail1);


				pool.query("select emp_email from emp_master_tbl where emp_id =$1", [rcreuserid], function (err, resultset) {
					if (err) throw err;
					var mail = resultset.rows[0].emp_email;

					pool.query("SELECT  count(*) as cnt from project_master_tbl where closure_flg='N' and project_id =$1 and start_date<=$2", [projid, padate], function (err, resultset) {
						if (err) throw err;
						var count = resultset.rows[0].cnt;

						if (count == 0) {
							error_flg = "Y";
						}

						pool.query("SELECT  count(*) as cnt from project_master_tbl where closure_flg='N' and project_id =$1 and end_date>=$2", [projid, pedate], function (err, resultset) {
							if (err) throw err;
							var cnt = resultset.rows[0].cnt;

							if (cnt == 0) {
								error_flg = "Y";

							}

							pool.query("SELECT salary,project_curr,rate,salarycurr,perdiumcurr,perdium_curr_per_day from project_master_tbl where closure_flg='N' and project_id =$1", [projid], function (err, resultset) {
								if (err) throw err;
								var usablesalary = resultset.rows[0].salary;
								var projcurr = resultset.rows[0].project_curr;
								var rate = resultset.rows[0].rate;
								var salcurr = resultset.rows[0].salarycurr;
								var perdiumcurr = resultset.rows[0].perdiumcurr;
								var perdiumcurrperday = resultset.rows[0].perdium_curr_per_day;


								usablesalary = (usablesalary - 0) * (convRate - 0);
								console.log(usablesalary);

								pool.query("SELECT sum(salary_reserved) as allocsalary from project_alloc_tbl where project_id =$1 and emp_loc_type='ONSITE' and del_flg='N'", [projid], function (err, resultset) {
									if (err) throw err;
									var allocatedsalary = resultset.rows[0].allocsalary;

									arraycnt = 0;
									var totempsal = 0;

									arr.forEach(function (value) {

										console.log('noofmonths1', noofmonths);
										console.log('firstmonthdays1', firstmonthdays);
										console.log('lastmonthdays1', lastmonthdays);
										console.log('allocatedsalary1', allocatedsalary);
										console.log('firstnoofdays1', firstnoofdays);
										console.log('lastnoofdays1', lastnoofdays);
										console.log('usablesalary', usablesalary);

										//pool.query("select salary from emp_master_tbl where emp_id=$1 group by salary_curr",[value],function(err,resultset){
										console.log(value[1]);
										pool.query("select salary from emp_master_tbl where emp_id=$1 ", [value[1]], function (err, resultset) {
											if (err) throw err;
											var emp_sal = resultset.rows[0].salary;
											console.log('emp_sal', emp_sal);

											var firstsalperday = (emp_sal - 0) / (firstnoofdays - 0);
											var firstsal = (firstsalperday - 0) * (firstmonthdays - 0);
											console.log('firstsal', firstsal);

											var lastsalperday = (emp_sal - 0) / (lastnoofdays - 0);
											var lastsal = (lastsalperday - 0) * (lastmonthdays - 0);
											console.log('lastsal', lastsal);

											var monthsal = (emp_sal - 0) * (noofmonths - 0);
											console.log('monthsal', monthsal);

											if (noofmonths < 0) {
												lastsal = 0;
												monthsal = 0;
											}

											totempsal = (totempsal - 0) + (firstsal - 0) + (lastsal - 0) + (monthsal - 0);

											arraycnt = (arraycnt - 0) + (1 - 0);
											console.log(arraycnt, error_flg);
											if ((arraycnt <= len) && (error_flg != "Y")) {

												totempsal = (totempsal - 0) * (convRate - 0);

												totsal = (totempsal - 0) + (allocatedsalary - 0);
												console.log('totsal', totsal);

												console.log("check 2");

												if (totsal > usablesalary) {
													var diff = (totsal - 0) - (usablesalary - 0);
													var Budjetdiff = roundTo(diff, 2);

													const transporter = nodemailer.createTransport({
														service: 'gmail',
														auth: {
															user: 'mohammadsab@minorks.com',
															pass: '9591788719'
														}
													});



													const mailOptions = {
														from: 'mohammadsab@minorks.com',
														to: mail1,
														cc: mail,
														subject: 'Salary Budjet Exceeding',
														text: 'Hi Team,\n\n' +
															'You are receiving this mail because you (or someone else) has tried modifying employee allocation for:\n' +
															'Project ID' + projid + '\n' +
															'Salary Budget is Exceeding by ' + Budjetdiff + ' ' + projcurr + '\n\n\n\n' +
															'- Regards,\nAmber'
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

												}


												if (employeeloc == "ONSITE") {
													pool.query("SELECT perdium,perdium_amount_per_day from project_master_tbl where closure_flg='N' and project_id =$1", [projid], function (err, resultset) {
														if (err) throw err;
														var usableperdium = resultset.rows[0].perdium;
														var locperdium = resultset.rows[0].perdium_amount_per_day;




														usableperdium = (usableperdium - 0) * (convRate - 0);
														locperdium = (locperdium - 0) * (convRate - 0);


														console.log('usableperdium', usableperdium);
														console.log('locperdium', locperdium);

														pool.query("SELECT sum(working_days) as totdays from project_alloc_tbl where project_id =$1 and emp_loc_type='ONSITE' and del_flg='N'", [projid], function (err, resultset) {
															if (err) throw err;
															var workdays = resultset.rows[0].totdays;

															var newworkdays = (len - 0) * (noofdays - 0);
															var totworkdays = (newworkdays - 0) + (workdays - 0);
															totutilizedper = (locperdium - 0) * (totworkdays - 0);

															var reservedperdium = (locperdium - 0) * (noofdays - 0);
															console.log('--------per reserved-----', reservedperdium);
															var empreservedperdium = roundTo(reservedperdium, 2);

															if (totutilizedper > usableperdium) {

																var diff = (totutilizedper - 0) - (usableperdium - 0);
																var Budjetdiff = roundTo(diff, 2);
																const transporter = nodemailer.createTransport({
																	service: 'gmail',
																	auth: {
																		user: 'mohammadsab@minorks.com',
																		pass: '9591788719'
																	}
																});



																const mailOptions = {
																	from: 'mohammadsab@minorks.com',
																	to: mail1,
																	cc: mail,
																	subject: 'Salary Budjet Exceeding',
																	text: 'Hi Team,\n\n' +
																		'You are receiving this mail because you (or someone else) has tried modifying employee allocation for:\n' +
																		'Project ID' + projid + '\n' +
																		'Salary Budget is Exceeding by ' + Budjetdiff + ' ' + projcurr + '\n\n\n\n' +
																		'- Regards,\nAmber'
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
															}


															if (error_flg != "Y") {
																arr.forEach(function (value) {


																	pool.query("select salary from emp_master_tbl where emp_id=$1", [value[1]], function (err, resultset) {
																		if (err) throw err;
																		var emp_sal = resultset.rows[0].salary;
																		console.log('emp_sal', emp_sal);
																		var firstsalperday = (emp_sal - 0) / (firstnoofdays - 0);
																		var firstsal = (firstsalperday - 0) * (firstmonthdays - 0);
																		console.log('firstsal', firstsal);

																		var lastsalperday = (emp_sal - 0) / (lastnoofdays - 0);
																		var lastsal = (lastsalperday - 0) * (lastmonthdays - 0);
																		console.log('lastsal', lastsal);

																		var monthsal = (emp_sal - 0) * (noofmonths - 0);
																		console.log('monthsal', monthsal);

																		if (noofmonths < 0) {
																			lastsal = 0;
																			monthsal = 0;

																		}
																		var reservedsal = (firstsal - 0) + (lastsal - 0) + (monthsal - 0);
																		reservedsal = (reservedsal - 0) * (convRate - 0);
																		var empreservedsal = roundTo(reservedsal, 2);
																		console.log(' employee salary reserved', empreservedsal);

																		pool.query("SELECT  count(*) as cnt from project_alloc_tbl  where del_flg='N' and emp_id =$1 and project_id =$2", [value[1], projid], function (err, resultset) {
																			if (err) throw err;
																			var ecount = resultset.rows[0].cnt;
																			console.log('ecount', ecount);
																			if (ecount == 0) {
																				pool.query("SELECT  count(*) as cnt from project_alloc_tbl  where del_flg='N' and emp_id =$1", [value[1]], function (err, resultset) {
																					if (err) throw err;
																					var rcount = resultset.rows[0].cnt;
																					if (rcount > 0) {
																						pool.query("select sum(percentage_alloc) as salloc from project_alloc_tbl WHERE del_flg='N' and emp_id=$1", [value[1]], function (err, result) {
																							if (err) throw err;
																							var sAlloc = result.rows[0].salloc;
																							console.log('sumalloc', sAlloc);
																							totperalloc = (sAlloc - 0) + (peralloc - 0);
																							perremalloc = (100 - 0) - (sAlloc - 0)
																							if (totperalloc < 100) {
																								pool.query("INSERT INTO public.project_alloc_tbl(project_id, emp_id,emp_loc_type, emp_reporting_mgr, project_allocation_date, emp_billable_flg, emp_project_relieving_date, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3, percentage_alloc,working_days,salary_reserved,perdium_reserved,project_crncy,convertion_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)", [projid, value[1], employeeloc, projman, padate, employeebillable, pedate, rcreuserid, rcretime, lchguserid, lchgtime, 'N', ftxt1, ftxt2, ftxt3, peralloc, noofdays, empreservedsal, empreservedperdium, projcurr, convRate], function (err, result) {
																									if (err) throw err;
																									pool.query("update emp_master_tbl set reporting_mgr=$1,project_id=$2 where emp_id=$3", [projman, projid, value[1]], function (err, done) {
																										if (err) throw err;
																									});
																								});

																							}
																							if (perremalloc > 0) {
																								pool.query("INSERT INTO public.project_alloc_tbl(project_id, emp_id,emp_loc_type, emp_reporting_mgr, project_allocation_date, emp_billable_flg, emp_project_relieving_date, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3, percentage_alloc,working_days,salary_reserved,perdium_reserved,project_crncy,convertion_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)", [projid, value[1], employeeloc, projman, padate, employeebillable, pedate, rcreuserid, rcretime, lchguserid, lchgtime, 'N', ftxt1, ftxt2, ftxt3, perremalloc, noofdays, empreservedsal, empreservedperdium, projcurr, convRate], function (err, result) {
																									if (err) throw err;
																									pool.query("update emp_master_tbl set reporting_mgr=$1,project_id=$2 where emp_id=$3", [projman, projid, value[1]], function (err, done) {
																										if (err) throw err;
																									});
																								});
																							}

																						});
																					}
																					else {
																						pool.query("INSERT INTO public.project_alloc_tbl(project_id, emp_id,emp_loc_type, emp_reporting_mgr, project_allocation_date, emp_billable_flg, emp_project_relieving_date, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3, percentage_alloc,working_days,salary_reserved,perdium_reserved,project_crncy,conertio_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)", [projid, value[1], employeeloc, projman, padate, employeebillable, pedate, rcreuserid, rcretime, lchguserid, lchgtime, 'N', ftxt1, ftxt2, ftxt3, peralloc, noofdays, empreservedsal, empreservedperdium, projcurr, convRate], function (err, result) {
																							if (err) throw err;
																							pool.query("update emp_master_tbl set reporting_mgr=$1,project_id=$2 where emp_id=$3", [projman, projid, value[1]], function (err, done) {
																								if (err) throw err;
																							});
																						});

																					}
																					return res.json({ notification: "Employees Allocated to " + projid + " successfully" })
																					// res.redirect(req.get('referer'));
																				});
																			}
																			else {
																				console.log("already allocated");

																			}

																		});

																	});/*salary query*/

																});



															}

														});

													});

												}

												/*For OFFSHORE Location*/
												else {

													var reservedperdium = 0;
													var empreservedperdium = roundTo(reservedperdium, 2);

													arr.forEach(function (value) {

														console.log('in OFFSHORE else');

														var empreservedsal = 0;
														pool.query("select salary from emp_master_tbl where emp_id=$1", [value[1]], function (err, resultset) {
															if (err) throw err;
															var emp_sal = resultset.rows[0].salary;
															console.log('emp_sal', emp_sal);
															var firstsalperday = (emp_sal - 0) / (firstnoofdays - 0);
															var firstsal = (firstsalperday - 0) * (firstmonthdays - 0);
															console.log('firstsal', firstsal);

															var lastsalperday = (emp_sal - 0) / (lastnoofdays - 0);
															var lastsal = (lastsalperday - 0) * (lastmonthdays - 0);
															console.log('lastsal', lastsal);

															var monthsal = (emp_sal - 0) * (noofmonths - 0);
															console.log('monthsal', monthsal);

															if (noofmonths < 0) {
																lastsal = 0;
																monthsal = 0;

															}

															var reservedsal = (firstsal - 0) + (lastsal - 0) + (monthsal - 0);

															/*if (projcurr == "USD")
															{
																reservedsal = ( reservedsal - 0 ) / ( rate - 0 ); 
															}
											    
															if (projcurr == "GBP")
															{
																reservedsal = ( reservedsal - 0 ) / ( rate - 0 ); 
															}*/
															reservedsal = (reservedsal - 0) * (convRate - 0);
															var empreservedsal = roundTo(reservedsal, 2);
															console.log(' employee salary reserved', empreservedsal);

															pool.query("SELECT  count(*) as cnt from project_alloc_tbl  where del_flg='N' and emp_id =$1 and project_id =$2", [value, projid], function (err, resultset) {
																if (err) throw err;
																var ecount = resultset.rows[0].cnt;
																console.log('ecount', ecount);
																if (ecount == 0) {
																	pool.query("SELECT  count(*) as cnt from project_alloc_tbl  where del_flg='N' and emp_id =$1", [value], function (err, resultset) {
																		if (err) throw err;
																		var rcount = resultset.rows[0].cnt;
																		if (rcount > 0) {
																			pool.query("select sum(percentage_alloc) as salloc from project_alloc_tbl WHERE del_flg='N' and emp_id=$1", [value], function (err, result) {
																				if (err) throw err;
																				var sAlloc = result.rows[0].salloc;
																				console.log('sumalloc', sAlloc);
																				totperalloc = (sAlloc - 0) + (peralloc - 0);
																				perremalloc = (100 - 0) - (sAlloc - 0)
																				if (totperalloc < 100) {
																					pool.query("INSERT INTO public.project_alloc_tbl(project_id, emp_id,emp_loc_type, emp_reporting_mgr, project_allocation_date, emp_billable_flg, emp_project_relieving_date, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3, percentage_alloc,working_days,salary_reserved,perdium_reserved,project_crncy,convertion_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)", [projid, value, employeeloc, projman, padate, employeebillable, pedate, rcreuserid, rcretime, lchguserid, lchgtime, 'N', ftxt1, ftxt2, ftxt3, peralloc, noofdays, empreservedsal, empreservedperdium, projcurr, convRate], function (err, result) {
																						if (err) throw err;
																						pool.query("update emp_master_tbl set reporting_mgr=$1,project_id=$2 where emp_id=$3", [projman, projid, value], function (err, done) {
																							if (err) throw err;
																						});
																					});

																				}
																				if (perremalloc > 0) {
																					pool.query("INSERT INTO public.project_alloc_tbl(project_id, emp_id,emp_loc_type, emp_reporting_mgr, project_allocation_date, emp_billable_flg, emp_project_relieving_date, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3, percentage_alloc,working_days,salary_reserved,perdium_reserved,project_crncy,convertion_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)", [projid, value, employeeloc, projman, padate, employeebillable, pedate, rcreuserid, rcretime, lchguserid, lchgtime, 'N', ftxt1, ftxt2, ftxt3, perremalloc, noofdays, empreservedsal, empreservedperdium, projcurr, convRate], function (err, result) {
																						if (err) throw err;
																						pool.query("update emp_master_tbl set reporting_mgr=$1,project_id=$2 where emp_id=$3", [projman, projid, value], function (err, done) {
																							if (err) throw err;
																						});
																					});
																				}

																			});
																		}
																		else {
																			console.log(value[1]);

																			pool.query("INSERT INTO public.project_alloc_tbl(project_id, emp_id,emp_loc_type, emp_reporting_mgr, project_allocation_date, emp_billable_flg, emp_project_relieving_date, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3, percentage_alloc,working_days,salary_reserved,perdium_reserved,project_crncy,convertion_rate) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)", [projid, value[1], employeeloc, projman, padate, employeebillable, pedate, rcreuserid, rcretime, lchguserid, lchgtime, 'N', ftxt1, ftxt2, ftxt3, peralloc, noofdays, empreservedsal, empreservedperdium, projcurr, convRate], function (err, result) {
																				if (err) throw err;
																				console.log(value[1]);
																				pool.query("update emp_master_tbl set reporting_mgr=$1,project_id=$2 where emp_id=$3", [projman, projid, value[1]], function (err, done) {
																					if (err) throw err;
																				});
																			});

																			res.json({
																				message: "redirect ot refere", notification: "Employees Allocated to " + projid + " successfully"
																			})

																		}
																	});
																}
																else {
																	console.log("already allocated");
																	res.json({
																		message: "redirect ot refere", notification: "already allocated"
																	})

																}

															});
														});/*salary query*/

													});

												}  /*else end For OFFSHORE Location*/
												arraycnt = -1;
											}/*if for arrcnt and err_flg*/
										}); /*emp sal query*/
									}); /* first sal for loop */
								});/*reserved salary query*/
							});/*usable salary query*/

						});
					});
				});
			});
		}//close of sow 
	});
};


router.get('/fetchaddPjtDeAlldetails', function (req, res) {
	var emp_access = req.query.user_type;
	console.log("empaccess", emp_access);
	if (emp_access === "A1") {

		pool.query("select  distinct a.project_id as project_id,c.customer_name from project_alloc_tbl a inner join project_master_tbl p on a.project_id=p.project_id inner join customer_master_tbl c on c.customer_id = p.cid where a.del_flg='N' order by a.project_id asc", function (err, result) {
			var project = result.rows;
			var projid_count = result.rowCount;

			res.json({
				message: 'redirect to projDealloc', fetchaddPjtDeAlldetails: {
					emp_access: emp_access,
					project: project,

				}
			});

		});
	}

});

router.post('/projDeallocation', projdeallocation);
function projdeallocation(req, res) {
	console.log(req.body);
	var logged_emp_id = req.body.user_id;
	var now = new Date();
	var lchguserid = logged_emp_id;
	var lchgtime = now;
	var emprelievedate = now;
	var projId = req.body.projid.projectid;
	console.log(projId);

	pool.query("insert into project_alloc_tbl_hist select * from project_alloc_tbl where project_id=$1", [projId], function (err, result) {
		if (err) throw err;

		pool.query("delete from project_alloc_tbl where project_id=$1", [projId], function (err, done) {
			if (err) throw err;

			pool.query("update project_alloc_tbl_hist set del_flg=$1,emp_project_relieving_date=$2,lchg_user_id=$3,lchg_time=$4 where project_id=$5", ['Y', emprelievedate, lchguserid, lchgtime, projId], function (err, done) {
				if (err) throw err;
				console.log("done");
				res.json({ message: "redirect to projectDeallocation", notification: "Project  " + projId + " De-Allocated successfully" })
			});
		});
	});
};
//////////////////////////////////////////////////// Project DeAllocation End ////////////////////////////////////////////////////////////


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////// Coustomer Modification Start //////////////////////////////////////////////////////////////////////


////////////////////////////////////////////////////// Fetching coustomer Modification Details ////////////////////////////////////////////
router.post('/ModcustDetails', ModcustDetails);

function ModcustDetails(req, res) {
	var cid = req.body.coustomerID;
	console.log("customer id", cid);

	pool.query("select customer_name,customer_id,customer_addr1,customer_country,customer_city,client_name1,client_email1,client_contact1,client_name2,client_email2,client_contact2,remarks,gstno,pannum,customer_addr2 from customer_master_tbl where del_flg='N' and customer_id=$1", [cid], function (err, resultset) {
		console.log(resultset.rows);
		var rowCount = resultset.rowCount;
		if (rowCount > 0) {
			if (err) throw err;
			var customer_name = resultset.rows['0'].customer_name;
			console.log(resultset.rows);
			var customer_id = resultset.rows['0'].customer_id;
			var customer_addr1 = resultset.rows['0'].customer_addr1;
			var customer_country = resultset.rows['0'].customer_country;
			var customer_city = resultset.rows['0'].customer_city;
			var client_name1 = resultset.rows['0'].client_name1;
			var client_email1 = resultset.rows['0'].client_email1;
			var client_contact1 = resultset.rows['0'].client_contact1;
			var client_name2 = resultset.rows['0'].client_name2;
			var client_email2 = resultset.rows['0'].client_email2;
			var client_contact2 = resultset.rows['0'].client_contact2;
			var remarks = resultset.rows['0'].remarks;
			var gstno = resultset.rows['0'].gstno;
			var pannum = resultset.rows['0'].pannum;
			var customer_addr2 = resultset.rows['0'].customer_addr2;

			res.json({
				modadta: {
					customer_name: customer_name,
					customer_id: customer_id,
					customer_addr1: customer_addr1,
					customer_country: customer_country,
					customer_city: customer_city,
					client_name1: client_name1,
					client_email1: client_email1,
					client_contact1: client_contact1,
					client_name2: client_name2,
					client_email2: client_email2,
					client_contact2: client_contact2,
					remarks: remarks,
					gstno: gstno,
					pannum: pannum,
					customer_addr2: customer_addr2

				}
			});
		} else {
			res.json({ notification: "Coustoer ID Does Not Exist" })
		}

	});
};

////////////////////////////////////////////////////// Adding coustomer Modification Details ////////////////////////////////////////////

router.post('/customerModification', customermod);

function customermod(req, res) {
	console.log(req.body);
	console.log("111");
	var now = new Date();
	var rcreuserid = req.body.user_id;
	var rcretime = now;
	var lchguserid = req.body.user_id;
	var lchgtime = now;

	var cname = req.body.item.customerName;
	var cid = req.body.item.customerID;
	var clientaddr1 = req.body.item.clientAddressLine1;
	var clientaddr2 = req.body.item.clientAddressLine2;
	var clientname1 = req.body.item.clientName1;
	var clientname2 = req.body.item.clientName2;
	var cemail1 = req.body.item.clientEmialId1;
	var cemail2 = req.body.item.clientEmialId2;
	var clientph1 = req.body.item.clinetContactNumber1;
	var clientph2 = req.body.item.clinetContactNumber2;
	var gstno = req.body.item.GSTNumber;
	var pannum = req.body.item.PANNumber;
	var countryId = req.body.item.countryName;
	var cityId = req.body.item.cityName;
	var rmks = req.body.item.remarks;

	console.log("userid", rcreuserid);
	console.log("rtime", rcretime);
	console.log("luserid", lchguserid);
	console.log("ltime", lchgtime);
	console.log("cname", cname);
	console.log("cid", cid);
	console.log("gstno", gstno);
	console.log("pannum", pannum);
	console.log("countryId", countryId);
	console.log("cityId", cityId);
	console.log("clientname1", clientname1);
	console.log("cemail1", cemail1);
	console.log("clientph1", clientph1);
	console.log("clientname2", clientname2);
	console.log("cemail2", cemail2);
	console.log("clientph2", clientph2);
	console.log("rmks", rmks);
	console.log("clientaddr1", clientaddr1);
	console.log("clientaddr2", clientaddr2);


	pool.query("select * from customer_master_tbl_hist where customer_id=$1 ", [cid], function (err, result) {
		var hiscount = result.rowCount;

		if (hiscount == "0") {

			pool.query("insert into customer_master_tbl_hist select * from customer_master_tbl where customer_id=$1 ", [cid], function (err, result) {
			});

			pool.query("delete from customer_master_tbl where customer_id=$1 ", [cid], function (err, result) {
			});

		}
		else {
			pool.query("delete from customer_master_tbl_hist where customer_id=$1 ", [cid], function (err, result) {
			});

			pool.query("insert into customer_master_tbl_hist select * from customer_master_tbl where customer_id=$1 ", [cid], function (err, result) {
			});

			pool.query("delete from customer_master_tbl where customer_id=$1 ", [cid], function (err, result) {
			});

		}


		pool.query("INSERT INTO customer_master_tbl(customer_name,customer_id,customer_addr1,customer_addr2,client_name1,client_email1,client_contact1,client_name2,client_email2,client_contact2,rcre_user_id,rcre_time,lchg_user_id,lchg_time,del_flg,gstno,pannum,customer_country,customer_city,remarks) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)", [cname, cid, clientaddr1, clientaddr2, clientname1, cemail1, clientph1, clientname2, cemail2, clientph2, rcreuserid, rcretime, lchguserid, lchgtime, 'N', gstno, pannum, countryId, cityId, rmks], function (err, done) {


			if (err) throw err;
			var message = "Customer Details " + cname + " Modified Successfully"

			res.json({
				message: 'redirect to customermodview', ModifiedData: {

					cname: cname,
					cid: cid,
					clientaddr1: clientaddr1,
					countryId: countryId,
					cityId: cityId,
					clientname1: clientname1,
					cemail1: cemail1,
					clientph1: clientph1,
					clientname2: clientname2,
					cemail2: cemail2,
					clientph2: clientph2,
					rmks: rmks,
					gstno: gstno,
					pannum: pannum,
					clientaddr2: clientaddr2,

				}, notification: message
			});
		});
	});
}

/////////////////////////////////////////////////////// Coustomer Modification Done //////////////////////////////////////////////////////////////////

////////////////////////////////////////////////////// Project Document Uplaod Start //////////////////////////////////////////////////////////////


router.get('/fecthProjectDoc', function (req, res) {
	pool.query("select project_id from project_master_tbl where sow_upld='N'", function (err, result) {
		if (err) throw err
		console.log(result.rows);
		projectid = result.rows
		res.json({ projectId: projectid })
	})
})


const formidable = require('formidable');
const moment = require('moment');
const { ok } = require('assert');


router.post('/projectDoc', projectDocUpl);


function projectDocUpl(req, res) {
	doc = "";
	var form = new formidable.IncomingForm();
	form.parse(req, function (err, fields, files) {
		if (err) throw err

		var projId = JSON.stringify(form.fields.projectid);
		console.log(form.fields);
		console.log("checking", projId);
		var docType = JSON.stringify(form.fields.DocType);
		var projectTag = JSON.stringify(form.fields.Tag);
		console.log("chking4", typeof (docType));



		projectTag = projectTag.replace(/ /g, '_').toUpperCase();

		var d = new Date();
		var n = moment(d).format('YYYYMMDD:hhmmss:a');
		n = n.replace(/:/g, '_').toUpperCase();

		var doc = "";
		if (docType == "1") {
			doc = "SOW_" + projectTag + "_" + n;
		}
		if (docType == "2") {
			doc = "PO_" + projectTag + "_" + n;
		}
		if (docType == "3") {
			doc = "MileStone_" + projectTag + "_" + n;
		}
		if (docType == "4") {
			doc = "Closure_" + projectTag + "_" + n;
		}
		if (docType == "5") {
			doc = "FeedBack_" + projectTag + "_" + n;
		}
		if (docType == "6") {
			doc = "Attendance_" + projectTag + "_" + n;
		}

		projId = projId.replace(/[\["\]]/g, '');

		var dir2 = './data/CMS/project/projDocs/' + projId + "/";
		if (!fs.existsSync(dir2)) {
			fs.mkdirSync(dir2);
		}
		var newName = projId + "_" + doc + ".pdf";
		var newPath = dir2 + newName;
		console.log(newPath);

		fs.rename(oldPath, newPath,
			function (err) {
				if (err) throw err;
				docType = docType.replace(/[\["\]]/g, '');
				console.log("check6", typeof (docType), docType);
				if (docType == 1) {
					console.log();
					console.log(projId);
					pool.query("update project_master_tbl set sow_upld='Y' where project_id=$1", [projId], function (err, done) {
						if (err) {
						}
						res.json({ message: 'redirect to refer', notification: "Document Uploaded Successfully" });
					});

				}

			});
	});

	var oldName = "doc.pdf";
	var dirOld = './data/CMS/project/temp/';
	var oldPath = dirOld + oldName;

	if (!fs.existsSync(dirOld)) {
		fs.mkdirSync(dirOld, { recursive: true });
	}

	var storage = multer.diskStorage({
		destination: function (req, file, callback) {
			callback(null, dirOld);
		},
		filename: function (req, file, callback) {
			callback(null, oldName);
		}
	});

	var upload = multer({ storage: storage }).single('uploadDoc');
	upload(req, res, function (err) {
		if (err) {
			return res.status(500).json({ error: "File upload failed" });
		}
	});
}

//////////////////////////////////////////////////////// Project Doc View////////////////////////////////////////////////////////////
router.post('/projectDocView', projectDocsView);
function projectDocsView(req, res) {
	sowLen = 0, poLen = 0, mileLen = 0, cloLen = 0, fbLen = 0, aLen = 0;
	// var eid = req.user.rows[0].user_id;
	// var ename = req.user.rows[0].user_name;
	// var emp_access = req.user.rows['0'].user_type;
	var projId = req.body.projId;
	var docType = req.body.docType;
	console.log(projId);
	console.log("docType : ", docType);
	var testFolder = './data/CMS/project/projDocs/' + projId + "/";
	if (!fs.existsSync(testFolder)) {
		req.flash('error', "No details found for this project")
		res.redirect(req.get('referer'));
	}
	else {
		pool.query("SELECT cid,project_id from project_master_tbl where project_id =$1 ", [projId],
			function (err, result) {
				project = result.rows;
				console.log(project);
				projid_count = result.rowCount;
				fs.readdirSync(testFolder).forEach(
					function (name) {
						resValue1 = name.search("SOW");
						if (resValue1 != -1) {
							sowDocs[sowLen] = name;
							sowLen = sowLen + 1;
						}
						resValue1 = name.search("PO");
						if (resValue1 != -1) {
							poDocs[poLen] = name;
							poLen = poLen + 1;
						}
						resValue1 = name.search("MileStone");
						if (resValue1 != -1) {
							mileDocs[mileLen] = name;
							mileLen = mileLen + 1;
						}
						resValue1 = name.search("Closure");
						if (resValue1 != -1) {
							cloDocs[cloLen] = name;
							cloLen = cloLen + 1;
						}
						resValue1 = name.search("FeedBack");
						if (resValue1 != -1) {
							fbDocs[fbLen] = name;
							fbLen = fbLen + 1;
						}
						resValue1 = name.search("Attendance");
						if (resValue1 != -1) {
							aDocs[aLen] = name;
							aLen = aLen + 1;
						}
					});
				if (sowLen == 0 && poLen == 0 && mileLen == 0 && cloLen == 0 && fbLen == 0 && aLen == 0) {
					// req.flash('error', "No details found for this project")
					// res.redirect(req.get('referer'));
					res.json({ message: 'redirect to reffer', notification: "No details found for this project" })
				}
				else {
					res.json({
						message: 'projectModule/projectDocView', data: {
							sowDocs: sowDocs, sowLen: sowLen,
							poDocs: poDocs, poLen: poLen,
							mileDocs: mileDocs, mileLen: mileLen,
							cloDocs: cloDocs, cloLen: cloLen,
							fbDocs: fbDocs, fbLen: fbLen,
							aDocs: aDocs, aLen: aLen,
							project: project,
							docType: docType,
							projid_count: projid_count,
							eid: eid,
							projId: projId,
							ename: ename,
							emp_access: emp_access
						}
					});
				}
			});
	}
}
module.exports = router;
