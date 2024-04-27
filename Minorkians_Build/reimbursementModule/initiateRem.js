var express = require('express');
var router = express.Router();
const bodyParser = require('body-parser');
var app = express();
var Promise = require('mpromise');
var pool = require('../Database/dbconfig');
var nodemailer = require('nodemailer');
var fs = require('fs');

var bcrypt = require('bcryptjs');
var generatePassword = require("password-generator");
var { format } = require('date-fns')
router.use(express.json())

console.log('reimbursement');

// router.post('/shadow', function (req, res) {
//     console.log('shadow', req.path);
//     res.send("message to be routed to bluetooth");
// });

router.get('/initiateRem', initiateRem);
function initiateRem(req, res) {
    console.log(req.query);
    var emp_access = req.query.user_type;
    var emp_id = req.query.user_id;
    if (emp_access == 'L3' || emp_access == 'A1') {

        var empL1 = "L1";
        var empL2 = "L2";
        pool.query("SELECT emp_name from emp_master_tbl where emp_id= $1 ", [emp_id], function (err, result2) {
            var emp_name = result2.rows[0].emp_name

            pool.query("SELECT project_id from project_alloc_tbl where emp_id= $1 ", [emp_id], function (err, result2) {
                if (err) {
                    throw err

                }
                else {
                    var project_id = result2.rows[0].project_id;
                    // console.log(project_id, "projectid");

                    if (err) {
                        console.error('Error with table query', err);
                    } else {
                        console.log("result in remb", result2);
                        var pid = result2.rows;
                        console.log("pid in remb", pid);
                        var pid_count = result2.rowCount;
                        console.log("pid_count in remb", pid_count);
                    }
                    pool.query("SELECT project_id from project_alloc_tbl where emp_id=$1 order by percentage_alloc desc", [emp_id], function (err, projectList) {
                        if (err) {
                            console.error('Error with table query', err);
                        } else {

                            console.log("projectList", projectList);
                            if (projectList.rowCount != 0) {
                                var defProjectId = projectList.rows[0].project_id;
                                console.log("defProjectId", defProjectId);
                                var pLst_count = projectList.rowCount;
                                console.log("pLst_count", pLst_count);
                            }
                        }
                        pool.query("SELECT emp_name,emp_id from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where project_id=$1 and emp_id=$2)", [defProjectId, emp_id], function (err, result2) {
                            if (err) {
                                console.error('Error with table query', err);
                            } else {
                                console.log("result", result2.rows);
                                var empName = result2.rows;
                                if (result2.rowCount != 0) {
                                    Manager_name = result2.rows['0'].emp_name;
                                    Manager_id = result2.rows['0'].emp_id
                                    console.log("Manager_name", Manager_name);
                                    console.log(("manager_id", Manager_id));
                                }
                                else {
                                    Manager_name = "";
                                    Manager_id = "";
                                }

                            }
                            pool.query("SELECT project_allocation_date,emp_project_relieving_date from project_alloc_tbl where project_id=$1 and emp_id=$2", [defProjectId, emp_id], function (err, locresult) {
                                if (err) {
                                    console.error('Error with table query', err);
                                } else {
                                    if (locresult.rowCount != 0) {
                                        var project_allocation_date = locresult.rows['0'].project_allocation_date;
                                        var relieving_date = locresult.rows['0'].emp_project_relieving_date;
                                    } else {
                                        var project_allocation_date = "";
                                        var relieving_date = "";
                                    }
                                    var resultList = locresult.rows;
                                    console.log("project_allocation_date", project_allocation_date);
                                    console.log("relieving_date", relieving_date);
                                }
                                // for Fetching the from location and to location
                                //   pool.query("SELECT project_loc from project_master_tbl where project_id in ($1,$2)", [defProjectId], function(err, result2) {
                                // if (err) {
                                //     console.error('Error with table query', err);
                                // } else {
                                //     console.log("result", result2);
                                // }
                                // pool.query("SELECT emp_id, emp_name from emp_master_tbl where emp_access in ($1,$2)", [empL1, empL2], function(err, result3) {
                                //     if (err) {
                                //         console.error('Error with table query', err);
                                //     } else {
                                //         console.log("result in remb", result3);
                                //         var access = result3.rows;
                                //         console.log("access in remb", access);
                                //         var access_count = result3.rowCount;
                                //         console.log("access_count in remb", access_count);
                                //         var reprtMgrId = result3.emp_id;
                                //         var reportingMgr = result3.emp_name;
                                //         console.log("reprtMgrId in remb", reprtMgrId);
                                //         console.log("reportingMgr in remb", reportingMgr);
                                //     }
                                pool.query("SELECT emp_id, emp_name from emp_master_tbl where emp_access in ($1)", ['F1'], function (err, result4) {
                                    if (err) {
                                        console.error('Error with table query', err);
                                    } else {
                                        // console.log("result in remb", result4.rows);
                                        var hraccess = result4.rows;

                                        console.log(result4.rows);
                                        var financemgrid = result4.rows[0].emp_id;
                                        var financemgrname = result4.rows[0].emp_name;
                                        console.log(financemgrname, "financemgrname");

                                        // console.log("access in remb", hraccess);
                                        var hraccess_count = result4.rowCount;
                                        // console.log("hraccess_count in remb", hraccess_count);
                                        var hrId = result4.emp_id;
                                        var hrName = result4.emp_name;
                                        // console.log("hrId in remb", hrId);
                                        // console.log("hrName in remb", hrName);
                                    }
                                    pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'TOB'  order by comm_code_id asc", function (err, result) {
                                        comm_code_tnu = result.rows;
                                        comm_code_tnu_count = result.rowCount;
                                        console.log("classdesc::", comm_code_tnu);
                                        console.log("classdesc_count:::", comm_code_tnu_count);


                                        res.json({
                                            message: 'reimbursementModule/initiateRem', fetchaddRemDeAlldetails: {
                                                emp_name: emp_name,
                                                emp_id: emp_id,
                                                financemgrid: financemgrid,
                                                financemgrname: financemgrname,
                                                emp_access: emp_access,
                                                pid: pid,
                                                project_id: project_id,
                                                Manager_name: Manager_name,
                                                Manager_id: Manager_id,
                                                defProjectId: defProjectId,
                                                empName: empName,
                                                // hrName: hrName,
                                                // hrId: hrId,
                                                pid_count: pid_count,
                                                hraccess: hraccess,
                                                hraccess_count: hraccess_count,
                                                // amt_payable: amt_payable,
                                                // remarks: remarks,
                                                // user_remarks: user_remarks,
                                                // recCount: recCount,
                                                comm_code_tnu_count: comm_code_tnu_count,
                                                comm_code_tnu: comm_code_tnu,
                                                // resultList: resultList

                                            }
                                        })
                                    });
                                });
                            });
                        });
                    });
                }
            });
        });
        //});
        //});
    } else {
        res.json({ message: '/admin-dashboard/adminDashboard/admindashboard' });
    }
}

//////////////////////////////////////////////////////////////////////remb request////////////////////////////////////////////////////////////


router.post('/rembReq', rembReq);
var remb_id = "";
function rembReq(req, res) {
    var test = req.body.test;

    if (test == "Submit") {

        console.log(req);
        var emp_id = req.body.item.emp_id;
        var emp_name = req.body.item.emp_name;
        var emp_access = req.body.item.user_type;


        var project_id = req.body.item.project_id;
        var repMgrid = req.body.item.Manager_id;
        console.log(emp_id, emp_name, project_id.repMgrid);
        // var repMgr_id = "";
        // var Mgrid = req.body.access;
        // var urlValue1 = Mgrid.split("-");
        // repMgr_id = urlValue1[1].trim();

        var hr_id = "";
        var hrvalue = req.body.hraccess;
        // var urlValue2 = hrvalue.split(":");
        // hrid = urlValue2[0].trim();
        // hr_id = urlValue2[1].trim();

        var adv_amt = req.body.AdvPaid;
        var now = new Date();
        var lodge_date = now;
        var doc_date = now;
        var rcre_user_id = req.body.emp_id;
        var rcre_time = now;
        var lchg_user_id = req.body.emp_id;
        var lchg_time = now;
        // var adv_amt = req.body.AdvPaid;
        var free_text_1 = req.body.free_text_1;
        var free_text_2 = req.body.free_text_2;
        var free_text_3 = req.body.free_text_3;
        var del_flg = "N";
        var status = "pending";
        var user_remarks = req.body.item.remarks;
        //  var amt_payable = req.body.amt_payable;
        var net_amt_payable = "";
        var billList = req.body.item.millength;
        var travelExp_ = req.body.item.NatureofExpenses;

        pool.query("SELECT * from reimbursement_master_tbl", function (err, resultset) {
            if (err) throw err;
            rcount = resultset.rowCount;
            console.log("rcount resultset", rcount);
            var seq = "riembreq";
            pool.query("select nextval($1)::text code1", [seq], function (err, result) {
                if (err) throw err;
                code1 = result.rows['0'].code1;
                console.log("select done");
                console.log("code1", code1);
                console.log("code1", code1);
                remb_id = code1;
                console.log("remb_id after creating sequence::", remb_id);
                console.log("billList in rembReq::", billList);

                // for (i = 0; i < billList; i++) {

                var billDate = req.body.item.BillDate;
                var travelDesc = req.body.item.Description
                var travelAmt = req.body.item.totalAmount
                var ticktno = req.body.item.BillId;
                var remarks = req.body.item.remarks

                console.log("ticktno in rembReq::", ticktno);
                console.log("billDate in rembReq::", billDate);
                console.log("travelDesc in rembReq::", travelDesc);
                console.log("travelAmt in rembReq::", travelAmt);
                console.log("nature_of_expenses description in rembReq::", remarks);

                /*if (billDate == undefined) {
                     console.log("inside billDate for undefined");  
                     billList++;
                    break;
                }*/
                if (typeof billDate === 'undefined') {
                    console.log("otside billDate for undefined");
                }
                else {
                    pool.query("INSERT INTO reimbursement_details_tbl(remb_id, bill_id, bill_date, nature_of_expenses, ticket_amt, remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)", [remb_id, ticktno, billDate, travelDesc, travelAmt, remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, del_flg, free_text_1, free_text_2, free_text_3], function (err, result) {
                        if (err) throw err;
                        else {
                            console.log("result inserting into details table");
                            console.log("result", result);
                        }
                    });
                }
                // }
                // var totAmt=travelAmt + travelAmt;
                var totAmt = req.body.item.totalAmount;
                console.log("totAmt in rembReq::", totAmt);
                //var remarks=req.body.remarks;
                var hrRemarks = "";
                var mgrRemarks = "";
                var hr_status = "pending";
                var settlement_paid_flg = "N";
                net_amt_payable = totAmt - adv_amt;
                console.log("net_amt_payable in rembReq::", net_amt_payable);
                console.log("repMgr_id:::::::::", repMgrid);
                console.log(emp_id, "empid");
                pool.query("INSERT INTO reimbursement_master_tbl(remb_id, emp_id, emp_name, repmgr_id, project_id, hr_id, amt_payable, net_amt_payable, advance_amt, del_flg, status, lodge_date, document_date, user_remarks, manager_remarks, hr_remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3,hr_status,settlement_paid_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)", [remb_id, emp_id, emp_name, repMgrid, project_id, hr_id, totAmt, net_amt_payable, adv_amt, del_flg, status, lodge_date, doc_date, user_remarks, mgrRemarks, hrRemarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3, hr_status, settlement_paid_flg], function (err, result6) {
                    if (err) throw err;
                    else {
                        var success = "Request has been submitted successfully with  Id:" + remb_id + ".";
                        console.log("sUCCES INSIDE  Insert", success);
                    }
                    pool.query("INSERT INTO reimbursement_master_tbl_hist(remb_id, emp_id, emp_name, repmgr_id, project_id, hr_id, amt_payable, net_amt_payable, advance_amt, del_flg, status, lodge_date, document_date, user_remarks, manager_remarks, hr_remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3,hr_status,settlement_paid_flg) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,$25)", [remb_id, emp_id, emp_name, repMgrid, project_id, hr_id, totAmt, net_amt_payable, adv_amt, del_flg, status, lodge_date, doc_date, user_remarks, mgrRemarks, hrRemarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3, hr_status, settlement_paid_flg], function (err, result7) {
                        if (err) throw err;

                        pool.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function (err, empResult) {
                            if (err) {
                                console.error('Error with table query', err);
                            } else {


                                console.log(empResult.rows);
                                employee_name = empResult.rows['0'].emp_name;
                                employee_email = empResult.rows['0'].emp_email;
                                console.log('employee name ', employee_name);
                                console.log('employee id ', employee_email);
                            }
                            pool.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select repmgr_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function (err, empResult) {
                                if (err) {
                                    console.error('Error with table query', err);
                                } else {
                                    approver_name = empResult.rows['0'].emp_name;
                                    approver_email = empResult.rows['0'].emp_email;
                                    console.log('manager name ', approver_name);
                                    console.log('manager id ', approver_email);
                                }
                                // in (select emp_reporting_mgr from project_alloc_tbl where emp_id=$1)
                                pool.query("select emp_name , emp_email from emp_master_tbl where emp_id=$1", [repMgrid], function (err, empResult) {
                                    if (err) {
                                        console.error('Error with table query', err);
                                    } else {
                                        // if (empResult.rowCount != 0) {
                                        var deliverymgr_name = empResult.rows['0'].emp_name;
                                        var deliverymgr_email = empResult.rows['0'].emp_email;
                                        console.log('deliverymgr_name name ', deliverymgr_name);
                                        console.log('manager id ', deliverymgr_email);

                                    }

                                    const transporter = nodemailer.createTransport({
                                        service: 'gmail',
                                        auth: {
                                            user: 'mohammadsab@minorks.com',
                                            pass: '9591788719'
                                        }
                                    });


                                    var mailOptions = {
                                        to: approver_email,
                                        cc: employee_email, deliverymgr_email,
                                        from: 'mohammadsab@minorks.com',
                                        subject: 'Reimbursement Request notification',
                                        html: '<h3>Reimbursement Request has been initiated by the employee for following Details<br><br>' +
                                            '<table style="border: 10px solid black;"> ' +
                                            '<tr style="border: 10px solid black;"> ' +
                                            '<th style="border: 10px solid black;">Reimbursement Id</th> ' +
                                            '<th style="border: 10px solid black;">' + remb_id + '</th>' +
                                            '</tr>' +

                                            '<tr style="border: 10px solid black;"> ' +
                                            '<th style="border: 10px solid black;"> Project Id </td> ' +
                                            '<th style="border: 10px solid black;">' + project_id + '</td> ' +
                                            '</tr>' +

                                            '<tr style="border: 10px solid black;"> ' +
                                            '<th style="border: 10px solid black;"> Employee Id </th> ' +
                                            '<th style="border: 10px solid black;">' + emp_id + '</th>' +

                                            '</tr>' +

                                            '<tr style="border: 10px solid black;"> ' +
                                            '<th style="border: 10px solid black;">Employee Name</td> ' +
                                            '<th style="border: 10px solid black;">' + emp_name + '</td> ' +
                                            '</tr>' +
                                            '</table> ' +
                                            '<br><br>' +
                                            'Kindly proceed further<br><br>' +
                                            'URL: http://amber.nurture.co.in <br><br><br>' +
                                            '- Regards,<br><br>Amber</h3>'
                                    };

                                    transporter.sendMail(mailOptions, function (error, info) {
                                        if (error) {
                                            console.error('Error sending email', error);
                                        } else {
                                            console.log('Email sent:', info.response);
                                        }


                                    });
                                    res.json({
                                        message: 'reimbursementModule/reimburseViewDetails', notification: 'Reimbursement Request notification', remdata: {
                                            remb_id: remb_id,
                                            emp_id: emp_id,
                                            emp_name: emp_name,
                                            emp_access: emp_access,
                                            pid: project_id,
                                            project_id: project_id,
                                            // pid_count: pid_count,
                                            // repMgrid: repMgrid,
                                            // hr_id: hr_id,
                                            // adv_amt: adv_amt,
                                            // hrid: hrid,
                                            // user_remarks: user_remarks,
                                            // net_amt_payable: net_amt_payable,
                                            totAmt: totAmt,
                                            // hrRemarks: hrRemarks,
                                            // mgrRemarks: mgrRemarks,
                                            //  net_amt_payable: net_amt_payable,
                                            // free_text_1: free_text_1,
                                            // free_text_2: free_text_2,
                                            // free_text_3: free_text_3,
                                            success: success
                                        }
                                    });
                                });
                            });
                        });
                    });
                });
            });
        });

    }


}

////////////////////////////////////////////////rembapprove///////////////////////////////

router.get('/reimburseApprove', reimburseApprove)
var remb_id = ""
function reimburseApprove(req, res) {
    // console.log(req, "enter by maheeee");
    var emp_id = req.query.user_id;
    var emp_access = req.query.user_type;
    var emp_name = req.user_name;

    if (emp_access == 'L3' || emp_access == 'L2' || emp_access == 'L1') {


        var test = req.body.test;
        var id = req.query.id;
        var duplicate_flag = "N";
        var billupld_flg = "Y";
        console.log('id', id);
        console.log('reimburseUserDetails func ');
        var urlValue = id.split(":");
        remb_id = urlValue[0].trim();
        // lodge_date = urlValue[1].trim();
        //emp_Id=urlValue[2].trim();
        console.log('remb_id', remb_id);
        //console.log('remb_id',remb_id.length);
        // console.log('lodge_date', lodge_date);
        //console.log('lodge_date',lodge_date.length);
        //console.log('User emp_Id',emp_Id);
        pool.query("SELECT remb_id, emp_id, emp_name, hr_id, repmgr_id, project_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date, settlement_amount,settlement_remarks,hr_status FROM reimbursement_master_tbl where remb_id =$1 and  del_flg=$2", [remb_id, 'N'], function (err, empResult) {
            if (err) {
                console.error('Error with table query', err);
            } else {
                var rowData = empResult.rows;
                console.log("row", rowData);
                remburse_id = empResult.rows['0'].remb_id;
                empname = empResult.rows['0'].emp_name;
                empid = empResult.rows['0'].emp_id;
                project_id = empResult.rows['0'].project_id;
                hr_id = empResult.rows['0'].hr_id;
                repmgr_id = empResult.rows['0'].repmgr_id;
                amt_payable = empResult.rows['0'].amt_payable;
                advance_amt = empResult.rows['0'].advance_amt
                net_amt_payable = empResult.rows['0'].net_amt_payable;
                user_remarks = empResult.rows['0'].user_remarks;
                manager_remarks = empResult.rows['0'].manager_remarks;
                hr_remarks = empResult.rows['0'].hr_remarks;
                status = empResult.rows['0'].status;
                lodge_date = empResult.rows['0'].lodge_date;
                settlement_amount = empResult.rows['0'].settlement_amount;
                settlement_remarks = empResult.rows['0'].settlement_remarks;
                hr_status = empResult.rows['0'].hr_status;
                console.log("remburse_id", remburse_id);
            }
            console.log(repmgr_id, "repmger");
            pool.query("SELECT emp_name from emp_master_tbl where emp_id =$1 and del_flg=$2", [repmgr_id, 'N'], function (err, result2) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    // console.log("result", result2);
                    reporting_mgr = result2.rows['0'].emp_name;
                    console.log("reporting_mgr", reporting_mgr);
                }
                // pool.query("SELECT emp_name from emp_master_tbl where emp_id =$1 and del_flg=$2", [hr_id, 'N'], function (err, result2) {
                //     if (err) {
                //         console.error('Error with table query', err);
                //     } else {
                //         console.log("result", result2);
                //         hr_name = result2.rows['0'].emp_name;
                //         console.log("hr_name", hr_name);
                //     }
                pool.query("SELECT remb_id, bill_date, bill_id, nature_of_expenses,ticket_amt,remarks from reimbursement_details_tbl where remb_id =$1 and del_flg=$2", [remb_id, 'N'], function (err, billData) {
                    if (err) {
                        console.error('Error with table query', err);
                    } else {
                        // console.log("billData", billData);
                        var billData = billData.rows;
                        //billDataCount=billData.rowCount;
                        // hr_name=result2.rows['0'].emp_name;
                        console.log("billData.rowCount", billData.rowCount);

                        //console.log("billData.length", billData.length);
                    }

                    var billDocs = [];
                    var billLen = 0

                    var targetDir = './data/CMS/bills/' + empid + "/";
                    var finaltargetDir = targetDir + remburse_id + "/";
                    console.log("finaltargetDir", finaltargetDir);
                    if (!fs.existsSync(finaltargetDir)) {
                        //req.flash('error',"No records found")
                    }
                    else {
                        fs.readdirSync(finaltargetDir).forEach(
                            function (name) {
                                billDocs[billLen] = name;
                                billLen = billLen + 1;
                            });
                    }


                    console.log("settlement_amount", settlement_amount);
                    res.json({
                        message: 'reimbursementModule/reimburseViewDetails', notification: 'Reimbursement Request notification', remdata: {
                            rowData: rowData,
                            billData: billData,
                            emp_id: emp_id,
                            empid: empid,
                            emp_name: emp_name,
                            empname: empname,
                            remburse_id: remburse_id,
                            project_id: project_id,
                            // hr_id: hr_id,
                            // hr_name: hr_name,
                            reporting_mgr: reporting_mgr,
                            emp_access: emp_access,
                            repmgr_id: repmgr_id,
                            amt_payable: amt_payable,
                            net_amt_payable: net_amt_payable,
                            advance_amt: advance_amt,
                            user_remarks: user_remarks,
                            manager_remarks: manager_remarks,
                            hr_remarks: hr_remarks,
                            status: status,
                            lodge_date: lodge_date,
                            billDocs: billDocs,
                            billLen: billLen,
                            settlement_amount: settlement_amount,
                            settlement_remarks: settlement_remarks,
                            hr_status: hr_status,
                            duplicate_flag: duplicate_flag,
                            billupld_flg: billupld_flg
                        }
                    });
                });
            });
        });
        // });
    } else {
        res.json('/admin-dashboard/adminDashboard/admindashboard');
    }
}




////////////////////////////////////////////////////////////////user details/////////////////////////////////////////////////////////////
router.post('/reimburseUserDetails', reimburseUserDetails);


function reimburseUserDetails(req, res) {
    // console.log(req);

    var emp_id = req.body.user_id;
    var emp_access = req.body.user_type;
    var emp_name = req.body.user_name;
    // if (emp_access == 'L3' || emp_access == 'L2' || emp_access == 'L1' || emp_access == 'A1' || emp_access == 'F1') {
    var id = req.body.ReimbusmentId;

    var urlValue = id.split(":");

    var remb_id = urlValue
    lodge_date = urlValue;
    emp_Id = urlValue;



    // pool.query("SELECT remb_id, emp_id, emp_name, hr_id, repmgr_id, project_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date,settlement_amount,settlement_remarks,hr_status,settlement_paid_flg  FROM reimbursement_master_tbl where remb_id =$1 ", [emp_id], function (err, empResult) {
    pool.query("select * from reimbursement_master_tbl where remb_id =$1 ", [id], function (err, empResult) {
        if (empResult.rows.length === 0) {
            console.error('Error with table query', err);
        }
        else {

            var rowData = empResult.rows;

            remburse_id = empResult.rows['0'].remb_id;
            empname = empResult.rows['0'].emp_name;
            empid = empResult.rows['0'].emp_id;
            project_id = empResult.rows['0'].project_id;
            hr_id = empResult.rows['0'].hr_id;
            repmgr_id = empResult.rows['0'].repmgr_id;
            amt_payable = empResult.rows['0'].amt_payable;
            advance_amt = empResult.rows['0'].advance_amt
            net_amt_payable = empResult.rows['0'].net_amt_payable;
            user_remarks = empResult.rows['0'].user_remarks;
            manager_remarks = empResult.rows['0'].manager_remarks;
            hr_remarks = empResult.rows['0'].hr_remarks;
            status = empResult.rows['0'].status;
            lodge_date = empResult.rows['0'].lodge_date;
            settlement_amount = empResult.rows['0'].settlement_amount;
            settlement_remarks = empResult.rows['0'].settlement_remarks;
            hr_status = empResult.rows['0'].hr_status;
            settlement_paid_flg = empResult.rows['0'].settlement_paid_flg;

            pool.query("SELECT emp_name from emp_master_tbl where emp_id =$1", [repmgr_id], function (err, result2) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    console.log("result", result2);
                    if (result2.rowCount != 0) {
                        reporting_mgr = result2.rows['0'].emp_name;
                    }
                    console.log("reporting_mgr", reporting_mgr);

                }

                // pool.query("SELECT emp_name from emp_master_tbl where emp_id =$1", [hr_id], function (err, result2) {
                //     if (err) {
                //         console.error('Error with table query', err);
                //     } else {
                //         console.log("result", result2);
                //         hr_name = result2.rows['0'].emp_name;
                //         console.log("hr_name", hr_name);

                //     }

                pool.query("SELECT remb_id, bill_date, bill_id, nature_of_expenses,ticket_amt,remarks from reimbursement_details_tbl where remb_id =$1", [remb_id], function (err, billDataResult) {
                    if (err) {
                        console.error('Error with table query', err);
                    } else {
                        console.log("billDataResult", billDataResult);
                        var billData = billDataResult.rows;

                        console.log("billData.rowCount", billDataResult.rowCount);
                        console.log("billData.length", billData.length);

                    }
                    var billDocs = [];
                    var billLen = 0

                    var targetDir = './data/CMS/bills/' + emp_id + "/";
                    var finaltargetDir = targetDir + remburse_id + "/"
                    if (!fs.existsSync(finaltargetDir)) {
                    }
                    else {
                        fs.readdirSync(finaltargetDir).forEach(
                            function (name) {
                                billDocs[billLen] = name;
                                billLen = billLen + 1;
                            });

                    }

                    res.json({
                        message: 'redirect to employee details view', notification: 'Reimbursement Request notification', reimbusrowData: {

                            rowData: rowData,

                            billData: billData,
                            billDocs: billDocs,
                            billLen: billLen,
                            emp_id: emp_id,
                            empid: empid,
                            emp_name: emp_name,
                            empname: empname,
                            remburse_id: remburse_id,
                            project_id: project_id,
                            // hr_id: hr_id,
                            // hr_name: hr_name,
                            hr_status: hr_status,
                            reporting_mgr: reporting_mgr,
                            emp_access: emp_access,
                            repmgr_id: repmgr_id,
                            amt_payable: amt_payable,
                            net_amt_payable: net_amt_payable,
                            advance_amt: advance_amt,
                            user_remarks: user_remarks,
                            manager_remarks: manager_remarks,
                            hr_remarks: hr_remarks,
                            status: status,
                            settlement_amount: settlement_amount,
                            //bill_image_upload:bill_image_upload,
                            //image_filename:image_filename,
                            //image_filesize:image_filesize,
                            lodge_date: lodge_date,
                            settlement_remarks: settlement_remarks,
                            settlement_paid_flg: settlement_paid_flg,

                        }

                    });
                });

            });
        }
    });




}

router.get('/reqdetails', reqdetails);

function reqdetails(req, res) {
    console.log(req.query);
    var user_type = req.query.user_type;
    if (user_type == 'A1') {

        pool.query("select * from reimbursement_master_tbl where status=$1", ['pending'], function (err, empResult) {
            if (empResult.rows.length === 0) {
                console.error('Error with table query', err);
            }
            else {

                var data = empResult.rows;

                remburse_id = empResult.rows['0'].remb_id;
                empname = empResult.rows['0'].emp_name;
                empid = empResult.rows['0'].emp_id;
                project_id = empResult.rows['0'].project_id;
                hr_id = empResult.rows['0'].hr_id;
                repmgr_id = empResult.rows['0'].repmgr_id;
                amt_payable = empResult.rows['0'].amt_payable;
                advance_amt = empResult.rows['0'].advance_amt
                net_amt_payable = empResult.rows['0'].net_amt_payable;
                user_remarks = empResult.rows['0'].user_remarks;
                manager_remarks = empResult.rows['0'].manager_remarks;
                hr_remarks = empResult.rows['0'].hr_remarks;
                status = empResult.rows['0'].status;
                lodge_date = empResult.rows['0'].lodge_date;
                settlement_amount = empResult.rows['0'].settlement_amount;
                settlement_remarks = empResult.rows['0'].settlement_remarks;
                hr_status = empResult.rows['0'].hr_status;
                settlement_paid_flg = empResult.rows['0'].settlement_paid_flg;



            }

            res.json({
                message: 'redirect to employee details view', notification: 'Reimbursement Request notification',

                data: data,

            })
        })
    }
    if (user_type == 'F1') {
        pool.query("select * from reimbursement_master_tbl where status=$1", ['approved'], function (err, empResult) {
            if (empResult.rows.length === 0) {
                console.error('Error with table query', err);
            }
            else {

                var data = empResult.rows;

                remburse_id = empResult.rows['0'].remb_id;
                empname = empResult.rows['0'].emp_name;
                empid = empResult.rows['0'].emp_id;
                project_id = empResult.rows['0'].project_id;
                hr_id = empResult.rows['0'].hr_id;
                repmgr_id = empResult.rows['0'].repmgr_id;
                amt_payable = empResult.rows['0'].amt_payable;
                advance_amt = empResult.rows['0'].advance_amt
                net_amt_payable = empResult.rows['0'].net_amt_payable;
                user_remarks = empResult.rows['0'].user_remarks;
                manager_remarks = empResult.rows['0'].manager_remarks;
                hr_remarks = empResult.rows['0'].hr_remarks;
                status = empResult.rows['0'].status;
                lodge_date = empResult.rows['0'].lodge_date;
                settlement_amount = empResult.rows['0'].settlement_amount;
                settlement_remarks = empResult.rows['0'].settlement_remarks;
                hr_status = empResult.rows['0'].hr_status;
                settlement_paid_flg = empResult.rows['0'].settlement_paid_flg;

            }
            res.json({
                message: 'redirect to employee details view', notification: 'Reimbursement Request notification',

                data: data,
            })
        })

    }


}





//////////////////////////////////////////////////////////////////Approve/////////////////////////////////////////////////////////////////////////////////////
var moment = require('moment');


router.post('/approvee', approve);

function approve(req, res) {
    console.log(req);

    var test = req.body.action;
    var bills = req.body.bills;
    var emp_id = req.body.tq.empid;
    var emp_access = req.body.user_type;
    var emp_name = req.body.tq.empname;
    var remb_id = "";
    var lodge_date = "";
    var rowDataReject = "";
    var rowDataApprvd = "";
    var rowData = "";
    var employee_email = "";
    var duplicate_flag = "N";
    var billupld_flg = "Y";
    if (emp_access == 'A1') {

        if (test == "apr") {
            var remb_id = req.body.tq.remburse_id;
            console.log("Inside approve", remb_id);
            var lodge_date = req.body.tq.lodge_date;
            console.log("Inside approve", lodge_date);
            var manager_remarks = req.body.tq.manager_remarks;
            console.log("manager_remarks", manager_remarks);
            var date = moment().add(7, 'days')
            var document_date = date.format('YYYY-MM-DD');
            console.log("Inside approve", date);
            //console.log("Inside approve",nowPlusOneDayStr);
            var manager_remarks = req.body.tq.manager_remarks;
            pool.query("UPDATE  reimbursement_master_tbl set  status = $1,hr_status=$2,manager_remarks = $3,document_date =$4 where remb_id = $5 and lodge_date = $6", ['approved', 'pending', manager_remarks, document_date, remb_id, lodge_date], function (err, done) {
                if (err) {
                    console.error('Error with table query', err);
                } else {



                    // req.json('success', "Request for Remburisement Id:" + remb_id + " " + " has been approved.");
                    var success = "Request for Remburisement Id:" + remb_id + " has been approved.";



                    // res.json({
                    //     message: "Success Request for Remburisement Id:" + remb_id + " " + " has been approved.", notification: "Request for Remburisement Id:" + remb_id + " has been approved.",
                    // })
                }




                pool.query("UPDATE  reimbursement_master_tbl_hist set  status = $1,hr_status=$2,manager_remarks = $3,document_date =$4 where remb_id = $5 and lodge_date = $6", ['approved', 'pending', manager_remarks, document_date, remb_id, lodge_date], function (err, done) {
                    if (err) {
                        console.error('Error with table query', err);
                    }
                    pool.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function (err, empResult) {
                        if (err) {
                            console.error('Error with table query', err);
                        } else {
                            employee_name = empResult.rows['0'].emp_name;
                            employee_email = empResult.rows['0'].emp_email;
                            console.log('employee_name in confirm func', employee_name);
                            console.log('employee_email in confirm func', employee_email);
                        }
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'mohammadsab@minorks.com',
                                pass: '9591788719'
                            }
                        });

                        var mailOptions = {
                            to: employee_email,
                            from: 'mohammadsab@minorks.com',
                            subject: 'Approval Notification for applied reimbursement',
                            html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSLlF0smh8vJWa4VC1QKXvfqwKH69p-wwYGYIKhPHujKQm5o4j-" height="85"><br><br>' +
                                '<h3>The reimbursement request raised for following details has been approved<br><br>' +
                                '<table style="border: 10px solid black;"> ' +
                                '<tr style="border: 10px solid black;"> ' +
                                '<th style="border: 10px solid black;">Reimbursement Id</th> ' +
                                '<th style="border: 10px solid black;">' + remb_id + '</th>' +
                                '</tr>' +

                                '<tr style="border: 10px solid black;"> ' +
                                '<th style="border: 10px solid black;">employee_name</td> ' +
                                '<th style="border: 10px solid black;">' + employee_name + '</td> ' +
                                '</tr>' +
                                '</table> ' +
                                '<br><br>' +
                                '<br></br>'+
                                // 'Kindly submit your documents on or before submission date <br><br>' +
                                // 'URL: http://amber.nurture.co.in <br><br><br>' +
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
                        // console.log(claimAppStatus,"claimAppStatus");
                        const claimAppStatus = '';
                        if (claimAppStatus == null) {
                            claimAppStatus = "PEN";
                        }



                        var queryString = "SELECT remb_id, emp_id, emp_name, repmgr_id, project_id, hr_id, amt_payable, net_amt_payable, advance_amt, del_flg, upper(status) as status , lodge_date, document_date, user_remarks, manager_remarks, hr_remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3, settlement_amount, settlement_paid_flg, settlement_remarks, upper(hr_status) as hr_status FROM reimbursement_master_tbl where repmgr_id=$1 and del_flg='N'";

                        if (claimAppStatus == "PEN") {
                            queryString = queryString + " and status = 'pending'";
                        }
                        else if (claimAppStatus == "APP") {
                            queryString = queryString + " and status = 'approved'";
                        }
                        else if (claimAppStatus == "REJ") {
                            queryString = queryString + " and status = 'rejected'";
                        }


                        queryString = queryString + " order by remb_id desc";

                        // console.log("\n\n\n queryString :: " + queryString);

                        pool.query(queryString, [emp_id], function (err, claimsResult) {
                            if (err) {
                                console.error('\n\nError with table query :: \n', err);
                            }
                            else {
                                var claimsReqList = claimsResult.rows;
                                console.log("\n\n claimsReqList :: ", claimsReqList);
                            }
                            var recordCount = "";
                            recordCount = claimsResult.rowCount;
                            console.log('\n\n\ntemp recordCount ::: ', recordCount);

                            pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'FCS' order by comm_code_id asc", function (err, result) {
                                cocd_appQueueStatus = result.rows;
                                cocd_appQueueStatus_count = result.rowCount;

                                console.log('cocd_appQueueStatus_count ::: ', cocd_appQueueStatus_count);





                                res.json({
                                    message: "reimbursementModule/viewClaimApprQueue", notification: "Request for Remburisement Id:" + remb_id + " has been approved.", data: {

                                        emp_id: emp_id,
                                        emp_name: emp_name,
                                        // emp_access: emp_access,

                                        claimAppStatus: claimAppStatus,
                                        cocd_appQueueStatus: cocd_appQueueStatus,
                                        cocd_appQueueStatus_count: cocd_appQueueStatus_count,

                                        claimsReqList: claimsReqList,
                                        recordCount: recordCount,
                                        success: success

                                    }
                                });
                            });
                        });
                    });
                });
            });
        }
        if (test == "rej") {
            var remb_id = req.body.tq.remburse_id;

            console.log("Inside approve", remb_id);
            var lodge_date = req.body.tq.lodge_date;
            console.log("Inside approve", lodge_date);
            var manager_remarks = req.body.tq.manager_remarks;
            console.log("manager_remarks", manager_remarks);
            pool.query("UPDATE  reimbursement_master_tbl set  status = $1,manager_remarks = $2 where  remb_id = $3 and lodge_date = $4", ['rejected', manager_remarks, remb_id, lodge_date], function (err, done) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    // req.flash('success', 'Request for Remburisement Id:' + remb_id + ' ' + ' has been rejected.')
                    var success = "Request for Remburisement Id:" + remb_id + " has been rejected.";
                }
                pool.query("UPDATE  reimbursement_master_tbl set  status = $1,manager_remarks = $2 where  remb_id = $3 and lodge_date = $4", ['rejected', manager_remarks, remb_id, lodge_date], function (err, done) {
                    if (err) {
                        console.error('Error with table query', err);
                    }
                    pool.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function (err, empResult) {
                        if (err) {
                            console.error('Error with table query', err);
                        } else {
                            employee_name = empResult.rows['0'].emp_name;
                            employee_email = empResult.rows['0'].emp_email;
                            console.log('employee_name in confirm func', employee_name);
                            console.log('employee_email in confirm func', employee_email);
                        }
                        const transporter = nodemailer.createTransport({
                            service: 'gmail',
                            auth: {
                                user: 'mohammadsab@minorks.com',
                                pass: '9591788719'
                            }
                        });

                        var mailOptions = {
                            to: employee_email,
                            from: 'mohammadsab@minorks.com',
                            subject: 'Reimbursement Request Rejection notification',
                            html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF3AN6vk9aZnh5KQ_KPzHWYwlVWNNCxzAFK-994yO9WY6UwfiSIA" height="85"><br><br>' +
                                '<h3>Reimbursement Request has been rejected by your manager <br><br>' +
                                '<table style="border: 10px solid black;"> ' +
                                '<tr style="border: 10px solid black;"> ' +
                                '<th style="border: 10px solid black;">Reimbursement Id</th> ' +
                                '<th style="border: 10px solid black;">' + remb_id + '</th>' +
                                '</tr>' +
                                '</table> ' +
                                '<br><br>' +
                                'Kindly get in touch with your Manager.<br><br>' +
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
                        const claimAppStatus = '';

                        if (claimAppStatus == null) {
                            claimAppStatus = "PEN";
                        }



                        var queryString = "SELECT remb_id, emp_id, emp_name, repmgr_id, project_id, hr_id, amt_payable, net_amt_payable, advance_amt, del_flg, upper(status) as status , lodge_date, document_date, user_remarks, manager_remarks, hr_remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3, settlement_amount, settlement_paid_flg, settlement_remarks, upper(hr_status) as hr_status FROM reimbursement_master_tbl where repmgr_id=$1 and del_flg='N'";

                        if (claimAppStatus == "PEN") {
                            queryString = queryString + " and status = 'pending'";
                        }
                        else if (claimAppStatus == "APP") {
                            queryString = queryString + " and status = 'approved'";
                        }
                        else if (claimAppStatus == "REJ") {
                            queryString = queryString + " and status = 'rejected'";
                        }


                        queryString = queryString + " order by remb_id desc";

                        console.log("\n\n\n queryString :: " + queryString);

                        pool.query(queryString, [emp_id], function (err, claimsResult) {
                            if (err) {
                                console.error('\n\nError with table query :: \n', err);
                            }
                            else {
                                var claimsReqList = claimsResult.rows;
                                console.log("\n\n claimsReqList :: ", claimsReqList);
                            }
                            var recordCount = "";
                            recordCount = claimsResult.rowCount;
                            console.log('\n\n\ntemp recordCount ::: ', recordCount);

                            pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'FCS' order by comm_code_id asc", function (err, result) {
                                cocd_appQueueStatus = result.rows;
                                cocd_appQueueStatus_count = result.rowCount;

                                console.log('cocd_appQueueStatus_count ::: ', cocd_appQueueStatus_count);



                                res.json({
                                    message: "reimbursementModule/viewClaimApprQueue", notification: "Request for Remburisement Id:" + remb_id + " has been approved.", data: {

                                        emp_id: emp_id,
                                        emp_name: emp_name,
                                        // emp_access: emp_access,

                                        claimAppStatus: claimAppStatus,
                                        cocd_appQueueStatus: cocd_appQueueStatus,
                                        cocd_appQueueStatus_count: cocd_appQueueStatus_count,

                                        claimsReqList: claimsReqList,
                                        recordCount: recordCount,
                                        success: success

                                    }
                                });
                            });

                        });
                    });
                });
            });
        }
    }




    // if (bills == "Upload supporting bills") {
    //     var emp_id = req.user.rows[0].user_id;
    //     var emp_access = req.user.rows[0].user_type;
    //     var emp_name = req.user.rows[0].user_name;
    //     var remb_id = req.body.remb_id;

    //     console.log("reupload bills for " + remb_id);
    //     res.render('reimbursementModule/rembReqDetails', {
    //         remb_id: remb_id,
    //         emp_id: emp_id,
    //         emp_name: emp_name,
    //         emp_access: emp_access,

    //     });
    // }
    // if (bills == "Submit") {
    //     var emp_id = req.user.rows[0].user_id;
    //     var emp_access = req.user.rows[0].user_type;
    //     var emp_name = req.user.rows[0].user_name;
    //     var billTOupload = "";
    //     var remb_id = req.body.remb_id_hidden;
    //     console.log("reupload bills for " + remb_id);
    //     pool.query("SELECT remb_id, emp_id, emp_name, hr_id, repmgr_id, project_id, amt_payable, net_amt_payable, advance_amt, user_remarks, manager_remarks, hr_remarks, status, lodge_date, document_date,settlement_amount,settlement_paid_flg,settlement_remarks,hr_status FROM reimbursement_master_tbl where remb_id =$1 and del_flg=$2", [remb_id, 'N'], function (err, empResult) {
    //         if (err) {
    //             console.error('Error with table query', err);
    //         } else {
    //             var rowData = empResult.rows;
    //             console.log("row", rowData);
    //             remburse_id = empResult.rows['0'].remb_id;
    //             empname = empResult.rows['0'].emp_name;
    //             empid = empResult.rows['0'].emp_id;
    //             project_id = empResult.rows['0'].project_id;
    //             hr_id = empResult.rows['0'].hr_id;
    //             repmgr_id = empResult.rows['0'].repmgr_id;
    //             amt_payable = empResult.rows['0'].amt_payable;
    //             advance_amt = empResult.rows['0'].advance_amt
    //             net_amt_payable = empResult.rows['0'].net_amt_payable;
    //             user_remarks = empResult.rows['0'].user_remarks;
    //             manager_remarks = empResult.rows['0'].manager_remarks;
    //             hr_remarks = empResult.rows['0'].hr_remarks;
    //             status = empResult.rows['0'].status;
    //             lodge_date = empResult.rows['0'].lodge_date;
    //             settlement_amount = empResult.rows['0'].settlement_amount;
    //             settlement_paid_flg = empResult.rows['0'].settlement_paid_flg;
    //             settlement_remarks = empResult.rows['0'].settlement_remarks;
    //             hr_status = empResult.rows['0'].hr_status;
    //             console.log("remburse_id", remburse_id);
    //         }
    //         pool.query("SELECT emp_name from emp_master_tbl where emp_id =$1 and del_flg=$2", [repmgr_id, 'N'], function (err, result2) {
    //             if (err) {
    //                 console.error('Error with table query', err);
    //             } else {
    //                 console.log("result", result2);
    //                 reporting_mgr = result2.rows['0'].emp_name;
    //                 console.log("reporting_mgr", reporting_mgr);
    //             }
    //             pool.query("SELECT emp_name from emp_master_tbl where emp_id =$1 and del_flg=$2", [hr_id, 'N'], function (err, result2) {
    //                 if (err) {
    //                     console.error('Error with table query', err);
    //                 } else {
    //                     console.log("result", result2);
    //                     hr_name = result2.rows['0'].emp_name;
    //                     console.log("hr_name", hr_name);
    //                 }
    //                 pool.query("SELECT remb_id, bill_date, bill_id, nature_of_expenses,ticket_amt,remarks from reimbursement_details_tbl where remb_id =$1 and del_flg=$2", [remb_id, 'N'], function (err, billData) {
    //                     if (err) {
    //                         console.error('Error with table query', err);
    //                     } else {
    //                         console.log("billData", billData);
    //                         var billData = billData.rows;
    //                         var billDataRows = billData.rows;
    //                         console.log("billData.rowCount", billData.rowCount);
    //                         console.log("billData.length", billData.length);
    //                     }
    //                     pool.query("SELECT count(*) from reimbursement_details_tbl where remb_id =$1 and del_flg=$2 and nature_of_expenses in ($3,$4)", [remb_id, 'N', 'HOTEL', 'TRAVEL'], function (err, natureOfExpList) {
    //                         if (err) {
    //                             console.error('Error with table query', err);
    //                         } else {
    //                             console.log("natureOfExpList", natureOfExpList);
    //                             billTOupload = natureOfExpList.rows['0'].count;
    //                             console.log("billTOupload", billTOupload);
    //                             console.log("natureOfExpList.rowCount", natureOfExpList.rowCount);

    //                         }

    //                         var billDocs = [];
    //                         var billLen = 0

    //                         var targetDir = './data/CMS/bills/' + empid + "/";
    //                         var finaltargetDir = targetDir + remburse_id + "/";
    //                         console.log("finaltargetDir", finaltargetDir);
    //                         if (!fs.existsSync(finaltargetDir)) {
    //                             //req.flash('error',"No records found")
    //                         }
    //                         else {
    //                             fs.readdirSync(finaltargetDir).forEach(
    //                                 function (name) {
    //                                     billDocs[billLen] = name;
    //                                     billLen = billLen + 1;
    //                                 });

    //                         }
    //                         console.log("billLen", billLen);
    //                         console.log("billTOupload", billTOupload);
    //                         if (billTOupload > 0) {
    //                             if (billLen < 1) {
    //                                 billupld_flg = "N";
    //                             }
    //                         }

    //                         if (parseInt(billTOupload) > parseInt(billLen)) {
    //                             req.flash('error', "Number of files uploaded is less than the claimed bills");
    //                             var error = "Number of files uploaded is less than the claimed bills";

    //                             console.log("reupload bills for " + remb_id);
    //                             res.render('reimbursementModule/rembReqDetails', {
    //                                 remb_id: remb_id,
    //                                 emp_id: emp_id,
    //                                 emp_name: emp_name,
    //                                 emp_access: emp_access,
    //                                 error: error

    //                             });
    //                         } else if (parseInt(billTOupload) == 0) {
    //                             res.render('reimbursementModule/reimburseApprove', {
    //                                 rowData: rowData,
    //                                 billData: billData,
    //                                 billDocs: billDocs,
    //                                 billLen: billLen,
    //                                 emp_id: emp_id,
    //                                 empid: empid,
    //                                 emp_name: emp_name,
    //                                 empname: empname,
    //                                 remburse_id: remburse_id,
    //                                 project_id: project_id,
    //                                 hr_id: hr_id,
    //                                 hr_name: hr_name,
    //                                 reporting_mgr: reporting_mgr,
    //                                 emp_access: emp_access,
    //                                 repmgr_id: repmgr_id,
    //                                 amt_payable: amt_payable,
    //                                 net_amt_payable: net_amt_payable,
    //                                 advance_amt: advance_amt,
    //                                 user_remarks: user_remarks,
    //                                 manager_remarks: manager_remarks,
    //                                 hr_remarks: hr_remarks,
    //                                 status: status,
    //                                 lodge_date: lodge_date,
    //                                 settlement_amount: settlement_amount,
    //                                 settlement_paid_flg: settlement_paid_flg,
    //                                 settlement_remarks: settlement_remarks,
    //                                 hr_status: hr_status,
    //                                 duplicate_flag: duplicate_flag,
    //                                 billupld_flg: billupld_flg
    //                             });
    //                         }
    //                         else {

    //                             console.log("emp_access", emp_access)
    //                             res.render('reimbursementModule/reimburseApprove', {
    //                                 rowData: rowData,
    //                                 billData: billData,
    //                                 billDocs: billDocs,
    //                                 billLen: billLen,
    //                                 emp_id: emp_id,
    //                                 empid: empid,
    //                                 emp_name: emp_name,
    //                                 empname: empname,
    //                                 remburse_id: remburse_id,
    //                                 project_id: project_id,
    //                                 hr_id: hr_id,
    //                                 hr_name: hr_name,
    //                                 reporting_mgr: reporting_mgr,
    //                                 emp_access: emp_access,
    //                                 repmgr_id: repmgr_id,
    //                                 amt_payable: amt_payable,
    //                                 net_amt_payable: net_amt_payable,
    //                                 advance_amt: advance_amt,
    //                                 user_remarks: user_remarks,
    //                                 manager_remarks: manager_remarks,
    //                                 hr_remarks: hr_remarks,
    //                                 status: status,
    //                                 lodge_date: lodge_date,
    //                                 settlement_amount: settlement_amount,
    //                                 settlement_paid_flg: settlement_paid_flg,
    //                                 settlement_remarks: settlement_remarks,
    //                                 hr_status: hr_status,
    //                                 duplicate_flag: duplicate_flag,
    //                                 billupld_flg: billupld_flg
    //                             });
    //                         }
    //                     });
    //                 });
    //             });
    //         });
    //     });

    // }


    // test1 = req.body.paid;
    // if (test1 == "Pay") {
    //     var settlement_amt = req.body.settlement_Amount;
    //     console.log("settlement_amt", settlement_amt);
    //     var remb_id = req.body.remb_id;
    //     console.log("remb_id", remb_id);
    //     var settlement_remarks = req.body.settlementRemarks;
    //     console.log("settlement_remarks", settlement_remarks);
    //     var advAmt = req.body.advAmt;
    //     console.log("advAmt", advAmt);




    //     pool.query("UPDATE  reimbursement_master_tbl set  settlement_paid_flg = $1,settlement_amount=$2,settlement_remarks=$3 where remb_id = $4", ['Y', settlement_amt, settlement_remarks, remb_id], function (err, done) {
    //         if (err) {
    //             console.error('Error with table query', err);
    //         } else {
    //             req.flash('success', 'Claim amount for Remburisement Id:' + ' ' + remb_id + ' ' + 'has been settled.');
    //             var success = 'Claim amount for Remburisement Id:' + remb_id + ' ' + 'has been settled.';
    //         }
    //         pool.query("Insert into reimbursement_master_tbl_hist(select * from reimbursement_master_tbl where remb_id = $1)", [remb_id], function (err, done) {
    //             if (err) {
    //                 console.error('Error with table query', err);
    //             }
    //             pool.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function (err, empResult) {
    //                 if (err) {
    //                     console.error('Error with table query', err);
    //                 } else {
    //                     employee_name = empResult.rows['0'].emp_name;
    //                     employee_email = empResult.rows['0'].emp_email;
    //                     console.log('employee_name in confirm func', employee_name);
    //                     console.log('employee_email in confirm func', employee_email); 
    //                 }
    //                 pool.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select repmgr_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function (err, empResult) {
    //                     if (err) {
    //                         console.error('Error with table query', err);
    //                     } else {
    //                         approver_name = empResult.rows['0'].emp_name;
    //                         approver_email = empResult.rows['0'].emp_email;
    //                         console.log('manager name ', approver_name);
    //                         console.log('manager id ', approver_email);
    //                     }
    //                     var smtpTransport = nodemailer.createTransport('SMTP', {
    //                         service: 'gmail',
    //                         auth: {
    //                             user: 'amber@nurture.co.in',
    //                             pass: 'nurture@123'
    //                         }
    //                     });

    //                     var mailOptions = {
    //                         to: employee_email,
    //                         cc: approver_email,
    //                         from: 'amber@nurture.co.in',
    //                         subject: 'Reimbursement Settlement Notification',
    //                         html: '<h3>The reimbursement request raised for following details has been Settled for Details<br><br>' +
    //                             '<table style="border: 10px solid black;"> ' +
    //                             '<tr style="border: 10px solid black;"> ' +
    //                             '<th style="border: 10px solid black;">Reimbursement Id</th> ' +
    //                             '<th style="border: 10px solid black;">' + remb_id + '</th>' +
    //                             '</tr>' +

    //                             '<tr style="border: 10px solid black;"> ' +
    //                             '<th style="border: 10px solid black;">Claim Amount</td> ' +
    //                             '<th style="border: 10px solid black;">' + settlement_amt + '</td> ' +
    //                             '</tr>' +

    //                             '<tr style="border: 10px solid black;"> ' +
    //                             '<th style="border: 10px solid black;">Document submission date</td> ' +
    //                             '<th style="border: 10px solid black;">' + document_date + '</td> ' +
    //                             '</tr>' +
    //                             '</table> ' +
    //                             '<br><br>' +
    //                             'Kindly submit your documents on or before submission date to HR<br><br>' +
    //                             'URL: http://amber.nurture.co.in <br><br><br>' +
    //                             '- Regards,<br><br>Amber</h3>'
    //                     };

    //                     smtpTransport.sendMail(mailOptions, function (err) { });

    //                     var claimFinStatus = req.body.claimFinStatus;

    //                     if (claimFinStatus == null) {
    //                         claimFinStatus = "PEN";
    //                     }



    //                     var queryString = "SELECT remb_id, emp_id, emp_name, repmgr_id, project_id, hr_id, amt_payable, net_amt_payable, advance_amt, del_flg, upper(status) as status , lodge_date, document_date, user_remarks, manager_remarks, hr_remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3, settlement_amount, settlement_paid_flg, settlement_remarks, upper(hr_status) as hr_status FROM reimbursement_master_tbl where hr_id=$1 and status='approved' and del_flg='N'";

    //                     if (claimFinStatus == "PEN") {
    //                         queryString = queryString + " and hr_status = 'pending'";
    //                     }
    //                     else if (claimFinStatus == "PPY") {
    //                         queryString = queryString + " and hr_status = 'confirmed' and settlement_paid_flg = ''";
    //                     }
    //                     else if (claimFinStatus == "PAY") {
    //                         queryString = queryString + " and hr_status = 'confirmed' and settlement_paid_flg = ''";
    //                     }
    //                     else if (claimFinStatus == "CAN") {
    //                         queryString = queryString + " and hr_status = 'cancelled'";
    //                     }


    //                     queryString = queryString + " order by remb_id desc";

    //                     console.log("\n\n\n queryString :: " + queryString);

    //                     pool.query(queryString, [emp_id], function (err, claimsResult) {
    //                         if (err) {
    //                             console.error('\n\nError with table query :: \n', err);
    //                         }
    //                         else {
    //                             var claimsReqList = claimsResult.rows;
    //                             console.log("\n\n claimsReqList :: ", claimsReqList);
    //                         }
    //                         var recordCount = "";
    //                         recordCount = claimsResult.rowCount;
    //                         console.log('\n\n\ntemp recordCount ::: ', recordCount);

    //                         pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'FCS' order by comm_code_id asc", function (err, result) {
    //                             cocd_appQueueStatus = result.rows;
    //                             cocd_appQueueStatus_count = result.rowCount;

    //                             console.log('cocd_appQueueStatus_count ::: ', cocd_appQueueStatus_count);
    //                             res.render('reimbursementModule/viewClaimFinQueue', {
    //                                 emp_id: emp_id,
    //                                 emp_name: emp_name,
    //                                 emp_access: emp_access,

    //                                 claimFinStatus: claimFinStatus,
    //                                 cocd_appQueueStatus: cocd_appQueueStatus,
    //                                 cocd_appQueueStatus_count: cocd_appQueueStatus_count,

    //                                 claimsReqList: claimsReqList,
    //                                 recordCount: recordCount,
    //                                 success: success,
    //                             });
    //                         });
    //                     });
    //                 });
    //             });
    //         });

    //     });





    // }

    if (emp_access == 'F1') {

        if (test == "apr") {
            var remb_id = req.body.tq.remburse_id;

            console.log("Inside approve", remb_id);
            var lodge_date = req.body.tq.lodge_date;
            console.log("Inside approve", lodge_date);
            var manager_remarks = req.body.tq.manager_remarks;
            console.log("manager_remarks", manager_remarks);
            var advance_amt = req.body.advanceAmt;
            // var settlement_remarks = req.body.settlementRemarks;
            console.log("advance_amt", advance_amt);
            pool.query("UPDATE  reimbursement_master_tbl set  hr_status = $1, hr_remarks =$2,advance_amt=$3 where  remb_id = $4 and lodge_date = $5", ['confirmed', hr_remarks, advance_amt, remb_id, lodge_date], function (err, done) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    var success = "Reimbursement request has been confirmed  with Remburisement Id:" + remb_id + ".";
                }
                pool.query("Insert into reimbursement_master_tbl_hist(select * from reimbursement_master_tbl where remb_id = $1)", [remb_id], function (err, done) {
                    if (err) {
                        console.error('Error with table query', err);
                    }
                    pool.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_id from reimbursement_master_tbl where remb_id=$1))", [remb_id], function (err, empResult) {
                        if (err) {
                            console.error('Error with table query', err);
                        } else {
                            employee_name = empResult.rows['0'].emp_name;
                            employee_email = empResult.rows['0'].emp_email;
                            console.log('employee_name in confirm func', employee_name);
                            console.log('employee_email in confirm func', employee_email);
                        }
                        pool.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select repmgr_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function (err, mailResult) {
                            if (err) {
                                console.error('Error with table query', err);
                            } else {
                                approver_name = mailResult.rows['0'].emp_name;
                                approver_email = mailResult.rows['0'].emp_email;
                                console.log('approver_name in confirm func', approver_name);
                                console.log('approver_email in confirm func', approver_email);
                            }
                            pool.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id in(select repmgr_id from reimbursement_master_tbl where remb_id=$1))", [remb_id], function (err, empResult) {
                                if (err) {
                                    console.error('Error with table query', err);
                                } else {
                                    if (empResult.rowCount != 0) {
                                        var deliverymgr_name = empResult.rows['0'].emp_name;
                                        var deliverymgr_email = empResult.rows['0'].emp_email;
                                        console.log('deliverymgr_name name ', deliverymgr_name);
                                        console.log('manager id ', deliverymgr_email);
                                    }
                                }

                                const transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: 'mohammadsab@minorks.com',
                                        pass: '9591788719'
                                    }
                                });

                                var mailOptions = {
                                    to: employee_email,
                                    cc: approver_email, deliverymgr_email,
                                    from: 'mohammadsab@minorks.com',
                                    subject: 'Reimbursement Request Approval Notification by Finance Manager',
                                    html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSZRgKPsbLeLG_m8ZfR9FeMTNmunb3l8IAmsJAiR71QiThN50G4" height="85"><br><br>' +
                                        '<h3>Reimbursement Request has been approved by your Finance manager <br><br>' +
                                        '<table style="border: 10px solid black;"> ' +
                                        '<tr style="border: 10px solid black;"> ' +
                                        '<th style="border: 10px solid black;">Reimbursement Id</th> ' +
                                        '<th style="border: 10px solid black;">' + remb_id + '</th>' +
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

                                const claimFinStatus = '';
                                if (claimFinStatus == null) {
                                    claimFinStatus = "PEN";
                                }



                                var queryString = "SELECT remb_id, emp_id, emp_name, repmgr_id, project_id, hr_id, amt_payable, net_amt_payable, advance_amt, del_flg, upper(status) as status , lodge_date, document_date, user_remarks, manager_remarks, hr_remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3, settlement_amount, settlement_paid_flg, settlement_remarks, upper(hr_status) as hr_status FROM reimbursement_master_tbl where hr_id=$1 and status='approved' and del_flg='N'";

                                if (claimFinStatus == "PEN") {
                                    queryString = queryString + " and hr_status = 'pending'";
                                }
                                else if (claimFinStatus == "PPY") {
                                    queryString = queryString + " and hr_status = 'confirmed' and settlement_paid_flg = ''";
                                }
                                else if (claimFinStatus == "PAY") {
                                    queryString = queryString + " and hr_status = 'confirmed' and settlement_paid_flg = ''";
                                }
                                else if (claimFinStatus == "CAN") {
                                    queryString = queryString + " and hr_status = 'cancelled'";
                                }


                                queryString = queryString + " order by remb_id desc";

                                console.log("\n\n\n queryString :: " + queryString);

                                pool.query(queryString, [emp_id], function (err, claimsResult) {
                                    if (err) {
                                        console.error('\n\nError with table query :: \n', err);
                                    }
                                    else {
                                        var claimsReqList = claimsResult.rows;
                                        console.log("\n\n claimsReqList :: ", claimsReqList);
                                    }
                                    var recordCount = "";
                                    recordCount = claimsResult.rowCount;
                                    console.log('\n\n\ntemp recordCount ::: ', recordCount);

                                    pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'FCS' order by comm_code_id asc", function (err, result) {
                                        cocd_appQueueStatus = result.rows;
                                        cocd_appQueueStatus_count = result.rowCount;

                                        console.log('cocd_appQueueStatus_count ::: ', cocd_appQueueStatus_count);

                                        res.json({
                                            message: "reimbursementModule/viewClaimApprQueue", notification: "Request for Remburisement Id:" + remb_id + " has been approved.", data: {

                                                emp_id: emp_id,
                                                emp_name: emp_name,
                                                emp_access: emp_access,

                                                claimFinStatus: claimFinStatus,
                                                cocd_appQueueStatus: cocd_appQueueStatus,
                                                cocd_appQueueStatus_count: cocd_appQueueStatus_count,

                                                claimsReqList: claimsReqList,
                                                recordCount: recordCount,
                                                success: success

                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }
        if (test == "rej") {
            var remb_id = req.body.tq.remburse_id;

            console.log("Inside approve", remb_id);
            var lodge_date = req.body.tq.lodge_date;
            console.log("Inside approve", lodge_date);
            var manager_remarks = req.body.tq.manager_remarks;
            console.log("manager_remarks", manager_remarks);
            var advance_amt = req.body.advanceAmt;


            var hr_remarks = req.body.hrremarks;
            console.log("hr_remarks", hr_remarks);
            pool.query("UPDATE  reimbursement_master_tbl set  hr_status = $1,hr_remarks=$2 where  remb_id = $3 and lodge_date = $4", ['cancelled', hr_remarks, remb_id, lodge_date], function (err, done) {
                if (err) {
                    console.error('Error with table query', err);
                } else {
                    //   req.flash('success',"Request for Reimbursement Id:"+ remb_id +" has been cancelled")
                    var success = "Request for Reimbursement Id:" + remb_id + " has been cancelled";
                }
                pool.query("Insert into reimbursement_master_tbl_hist(select * from reimbursement_master_tbl where remb_id = $1)", [remb_id], function (err, done) {
                    if (err) {
                        console.error('Error with table query', err);
                    }
                    console.log("remb_id", remb_id);
                    pool.query("select emp_name,emp_email from emp_master_tbl where emp_id in (select emp_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function (err, empResult) {
                        if (err) {
                            console.error('Error with table query', err);
                        } else {
                            console.log("remb_id", remb_id);
                            console.log("empResult.rows", empResult.rows);
                            employee_name = empResult.rows['0'].emp_name;
                            employee_email = empResult.rows['0'].emp_email;
                            console.log('employee_name in confirm func', employee_name);
                            console.log('employee_email in confirm func', employee_email);
                        }
                        pool.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select repmgr_id from reimbursement_master_tbl where remb_id=$1)", [remb_id], function (err, mailResult) {
                            if (err) {
                                console.error('Error with table query', err);
                            } else {
                                approver_name = mailResult.rows['0'].emp_name;
                                approver_email = mailResult.rows['0'].emp_email;
                                console.log('approver_name in confirm func', approver_name);
                                console.log('approver_email in confirm func', approver_email);
                            }
                            pool.query("select emp_name , emp_email from emp_master_tbl where emp_id in (select emp_reporting_mgr from project_alloc_tbl where emp_id in(select repmgr_id from reimbursement_master_tbl where remb_id=$1))", [remb_id], function (err, empResult) {
                                if (err) {
                                    console.error('Error with table query', err);
                                } else {
                                    if (empResult.rowCount != 0) {
                                        var deliverymgr_name = empResult.rows['0'].emp_name;
                                        var deliverymgr_email = empResult.rows['0'].emp_email;
                                        console.log('deliverymgr_name name ', deliverymgr_name);
                                        console.log('manager id ', deliverymgr_email);
                                    }
                                }
                                const transporter = nodemailer.createTransport({
                                    service: 'gmail',
                                    auth: {
                                        user: 'mohammadsab@minorks.com',
                                        pass: '9591788719'
                                    }
                                });

                                var mailOptions = {
                                    to: employee_email,
                                    cc: approver_email, deliverymgr_email,
                                    from: 'mohammadsab@minorks.com',
                                    subject: 'Reimbursement Request Rejection notification by Finance manager',
                                    html: '<img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRF3AN6vk9aZnh5KQ_KPzHWYwlVWNNCxzAFK-994yO9WY6UwfiSIA" height="85"><br><br>' +
                                        '<h3>Reimbursement Request has been rejected by your Finance manager <br><br>' +
                                        '<table style="border: 10px solid black;"> ' +
                                        '<tr style="border: 10px solid black;"> ' +
                                        '<th style="border: 10px solid black;">Reimbursement Id</th> ' +
                                        '<th style="border: 10px solid black;">' + remb_id + '</th>' +
                                        '</tr>' +
                                        '</table> ' +
                                        '<br><br>' +
                                        'Kindly get in touch with your Finance Manager.<br><br>' +
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


                                const claimFinStatus = '';
                                if (claimFinStatus == null) {
                                    claimFinStatus = "PEN";
                                }



                                var queryString = "SELECT remb_id, emp_id, emp_name, repmgr_id, project_id, hr_id, amt_payable, net_amt_payable, advance_amt, del_flg, upper(status) as status , lodge_date, document_date, user_remarks, manager_remarks, hr_remarks, rcre_user_id, rcre_time, lchg_user_id, lchg_time, free_text_1, free_text_2, free_text_3, settlement_amount, settlement_paid_flg, settlement_remarks, upper(hr_status) as hr_status FROM reimbursement_master_tbl where hr_id=$1 and status='approved' and del_flg='N'";

                                if (claimFinStatus == "PEN") {
                                    queryString = queryString + " and hr_status = 'pending'";
                                }
                                else if (claimFinStatus == "PPY") {
                                    queryString = queryString + " and hr_status = 'confirmed' and settlement_paid_flg = ''";
                                }
                                else if (claimFinStatus == "PAY") {
                                    queryString = queryString + " and hr_status = 'confirmed' and settlement_paid_flg = ''";
                                }
                                else if (claimFinStatus == "CAN") {
                                    queryString = queryString + " and hr_status = 'cancelled'";
                                }


                                queryString = queryString + " order by remb_id desc";

                                console.log("\n\n\n queryString :: " + queryString);

                                pool.query(queryString, [emp_id], function (err, claimsResult) {
                                    if (err) {
                                        console.error('\n\nError with table query :: \n', err);
                                    }
                                    else {
                                        var claimsReqList = claimsResult.rows;
                                        console.log("\n\n claimsReqList :: ", claimsReqList);
                                    }
                                    var recordCount = "";
                                    recordCount = claimsResult.rowCount;
                                    console.log('\n\n\ntemp recordCount ::: ', recordCount);

                                    pool.query("SELECT comm_code_id,comm_code_desc from common_code_tbl where code_id = 'FCS' order by comm_code_id asc", function (err, result) {
                                        cocd_appQueueStatus = result.rows;
                                        cocd_appQueueStatus_count = result.rowCount;

                                        console.log('cocd_appQueueStatus_count ::: ', cocd_appQueueStatus_count);
                                        res.json({
                                            message: "reimbursementModule/viewClaimApprQueue", notification: "Request for Remburisement Id:" + remb_id + " has been approved.", data: {
                                                emp_id: emp_id,
                                                emp_name: emp_name,
                                                emp_access: emp_access,

                                                claimFinStatus: claimFinStatus,
                                                cocd_appQueueStatus: cocd_appQueueStatus,
                                                cocd_appQueueStatus_count: cocd_appQueueStatus_count,

                                                claimsReqList: claimsReqList,
                                                recordCount: recordCount,
                                                success: success

                                            }
                                        });
                                    });
                                });
                            });
                        });
                    });
                });
            });
        }
    }
}

module.exports = router; 