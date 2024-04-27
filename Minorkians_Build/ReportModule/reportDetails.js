console.log("Report module entered");
var express = require('express');
var pool = require('../Database/dbconfig');
var router = express.Router();
var app = express();
var nodemailer = require('nodemailer');
var bcrypt = require('bcryptjs');

var cron = require('node-cron');
const XLSX = require('xlsx');





// ------------------------------>>>       Mahesh <<<----------------------------------------------------

///////////////////////// PANEL CHOOSE WHETHER BULK OR COMP /////////////////////////////////////
router.get('/reportDetails', function (req, res) {

    var eid = req.body.user_id;
    var ename = req.body.user_name;

    pool.query("SELECT user_type from users where user_id = $1", [eid], function (err, result) {
        var emp_access = result.rows['0'].user_type;

        console.log("emp_access", emp_access);

        if (emp_access != "A1" && emp_access != "F1") {
            res.json('redirect to admin-dashboard');
        }
        else {
            res.json({
                data: {
                    ename: ename,
                    eid: eid,
                    emp_access: emp_access

                }

            });
        }
    });
});


router.post('/getReport', getReport);
function getReport(req, res) {

    var module = req.body.module;
    var emp_id = req.body.emp_id;
    var now = new Date();
    var year = now.getFullYear();

    console.log("module", module);
    console.log("emp_id", emp_id);

    // add this to display messages if report is not present
    if (module > "4") {
        res.json('redirect to admin-dashboard');
    }

    // module 1 refer as employee personal details in compact Type
    if (module == "1") {
        console.log("if entered");
        pool.query("select emp_id,emp_name,gender,to_char(dob,'dd/mm/yyyy') as dob1,blood_group,shirt_size,father_name,mother_name,martial_status,spouse_name,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,phone1,phone2,emergency_num,emergency_con_person,pan_number,aadhaar_num,passport_num,license_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code from data_emp_info_tbl_temp where entity_cre_flg='Y' and del_flg='N' and emp_id=$1 order by emp_id asc", [emp_id], function (err, result1) {
            console.log(result1); 
            var rowdata = result1.rows;
            console.log("Data-->", rowdata);
            const xlsData = XLSX.utils.json_to_sheet(rowdata);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, xlsData, 'EmployeePersonalDetails');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const buffer = Buffer.from(excelBuffer);
            res.end(buffer);

        });
    }

    // module 2 refer as employee Professional details in compact Type
    if (module == "2") {
        console.log("if entered");
        pool.query("SELECT emp_id,emp_name,to_char(joining_date,'dd/mm/yyyy') as jdate,emp_access,emp_email,designation,emp_classification,salary,project_id,reporting_mgr,pre_emp_flg,prev_expr_year,prev_expr_month,emp_prob,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5,salary_curr from emp_master_tbl where emp_id = $1 and entity_cre_flg='Y' and del_flg='N' order by emp_id asc", [emp_id], function (err, result) {
            var rowdata = result.rows;
            console.log("Data-->", rowdata);
            const xlsData = XLSX.utils.json_to_sheet(rowdata);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, xlsData, 'EmployeeProfessionalDetails');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const buffer = Buffer.from(excelBuffer);
            res.end(buffer);

        });
    }

    // module 3 refer as empolyee Leave data in compact Type
    if (module == "3") {
        console.log("if entered");
        pool.query("select l.leave_type,l.emp_id,e.emp_name,reason,to_char(l.from_date,'dd/mm/yyyy') as fromdate,to_char(l.to_date,'dd/mm/yyyy') as todate,l.approver_id,f.emp_name as approver_name from leaves l,emp_master_tbl e,emp_master_tbl f where l.emp_id = $1 and e.emp_id = l.emp_id and f.emp_id = l.approver_id and l.del_flg='N' and l.app_flg ='Y' and l.rej_flg='N' and l.year=$2 order by l.leave_type asc", [emp_id, year], function (err, result) {
            var rowdata = result.rows;
            console.log("Data-->", rowdata);

            const xlsData = XLSX.utils.json_to_sheet(rowdata);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, xlsData, 'EmpolyeeLeaveData');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const buffer = Buffer.from(excelBuffer);
            res.end(buffer);

        });
    }

    // module 4 refer as empolyee Leave data in compact Type
    if (module == "4") {
        console.log("if entered");

         pool.query("SELECT l.leave_type, l.emp_id, e.emp_name, (l.credited_leaves::numeric + l.carry_forwarded::numeric - l.availed_leaves::numeric) AS total, quaterly_leave FROM leave_master l, emp_master_tbl e WHERE l.leave_type != '' AND l.del_flg = 'N' AND l.emp_id = $1 AND e.emp_id = l.emp_id AND l.year = $2 ORDER BY l.emp_id ASC", [emp_id, year], function (err, result) {

        if (err) {
                console.error("Error executing the query:", err);
                return res.status(500).json({ error: "An error occurred while fetching data." });
            }
            if (!result || !result.rows) {
                console.error("No data or invalid result format received.");
                return res.status(404).json({ error: "No data found." });
            }

            var rowdata = result.rows;
            console.log("Data-->", rowdata);

            const xlsData = XLSX.utils.json_to_sheet(rowdata);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, xlsData, 'EmpolyeeLeaveBalance');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const buffer = Buffer.from(excelBuffer);
            res.end(buffer);
        });
    }
    
};

// ------------------------------>>>      Jadhav    <<<----------------------------------------------------

router.post('/displayReport', displayReport);
function displayReport(req, res) {
    var array = req.body.button;
    console.log("Array--->", array);


    // value of button describes a module Example button 0 refers to employee Module

    if (array == "1") {
        pool.query("SELECT emp_id,emp_name,to_char(joining_date,'dd/mm/yyyy') as jdate,emp_access,emp_email,designation,emp_classification,salary,salary_curr,project_id,reporting_mgr,pre_emp_flg,prev_expr_year,prev_expr_month,emp_prob,prev_empr,prev_empr2,prev_empr3,prev_empr4,prev_empr5 from emp_master_tbl where entity_cre_flg='Y' and del_flg='N' order by emp_id asc", function (err, result) {
            var rowdata = result.rows;
            // var data_count = result.rowCount;
            // res.json({
            //     eid: eid,
            //     ename: ename,
            //     emp_access: emp_access,
            //     button: array,
            //     data: data,
            //     data_count: data_count
            // });
            // console.log("Data-->", rowdata);
            const xlsData = XLSX.utils.json_to_sheet(rowdata);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, xlsData, 'EmployeeProfessionalDetails');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const buffer = Buffer.from(excelBuffer);
            res.end(buffer);
        });
    }

    if (array == "2") {
        pool.query("select emp_id,emp_name,gender,to_char(dob,'dd/mm/yyyy') as dob1,blood_group,shirt_size,father_name,mother_name,martial_status,spouse_name,comm_addr1,state,city,pincode,comm_addr2,state1,city1,pincode1,phone1,phone2,emergency_num,emergency_con_person,pan_number,aadhaar_num,passport_num,license_num,uan_num,name_in_bank,bank_name,branch_name,account_num,ifsc_code from data_emp_info_tbl_temp where entity_cre_flg='Y' and del_flg='N' order by emp_id asc", function (err, result) {
            var rowdata = result.rows;
            const xlsData = XLSX.utils.json_to_sheet(rowdata);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, xlsData, 'EmployeePersonalDetails');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const buffer = Buffer.from(excelBuffer);
            res.end(buffer);
        });
    }

    if (array == "3") {
        pool.query("select e.emp_id,e.emp_name,p.project_id from emp_master_tbl e, project_alloc_tbl p where e.entity_cre_flg='Y' and e.del_flg='N' order by emp_id asc", function (err, result) {
            var rowdata = result.rows;
            const xlsData = XLSX.utils.json_to_sheet(rowdata);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, xlsData, 'ProjectAllocationHistory');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const buffer = Buffer.from(excelBuffer);
            res.end(buffer);
        });
    }


    if (array == "4") {
        var current_date = new Date();
        var year = current_date.getFullYear();

        pool.query("select l.leave_type,to_char(from_date,'dd/mm/yyyy') as fromdate,to_char(to_date,'dd/mm/yyyy') as todate,l.emp_id,e.emp_name,l.approver_id,f.emp_name as empname from leaves l,emp_master_tbl e,emp_master_tbl f where l.leave_type ='EL' and e.emp_id=l.emp_id and f.emp_id=l.approver_id and l.del_flg='N' and l.year=$1 order by l.emp_id asc", [year], function (err, result) {
            var rowdata = result.rows;
            const xlsData = XLSX.utils.json_to_sheet(rowdata);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, xlsData, 'EmployeesAvailedEarnedLeaves');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const buffer = Buffer.from(excelBuffer);
            res.end(buffer);
        });
    }


    if (array == "5") {
        var current_date = new Date();
        var year = current_date.getFullYear();

        pool.query("select l.leave_type,to_char(from_date,'dd/mm/yyyy') as fromdate,to_char(to_date,'dd/mm/yyyy') as todate,l.emp_id,e.emp_name,l.approver_id,f.emp_name as empname from leaves l,emp_master_tbl e,emp_master_tbl f where l.leave_type ='SL' and e.emp_id=l.emp_id and f.emp_id=l.approver_id and l.del_flg='N' and l.year=$1 order by l.emp_id asc", [year], function (err, result) {
            var rowdata = result.rows;
            const xlsData = XLSX.utils.json_to_sheet(rowdata);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, xlsData, 'EmployeesAvailedSickLeaves');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const buffer = Buffer.from(excelBuffer);
            res.end(buffer);
        });
    }

    if (array == "6") {
        var current_date = new Date();
        var year = current_date.getFullYear();

        pool.query("select l.leave_type,to_char(from_date,'dd/mm/yyyy') as fromdate,to_char(to_date,'dd/mm/yyyy') as todate,l.emp_id,e.emp_name,l.approver_id,f.emp_name as empname from leaves l,emp_master_tbl e,emp_master_tbl f where l.leave_type ='LOP' and e.emp_id=l.emp_id and f.emp_id=l.approver_id and l.del_flg='N' and l.year=$1 order by l.emp_id asc", [year], function (err, result) {
            var rowdata = result.rows;
            const xlsData = XLSX.utils.json_to_sheet(rowdata);
            const workbook = XLSX.utils.book_new(); 
            XLSX.utils.book_append_sheet(workbook, xlsData, 'EmployeesAvailedL.O.PLeaves');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const buffer = Buffer.from(excelBuffer);
            res.end(buffer);
        });
    }


    if (array == "7") {
        var current_date = new Date();
        var year = current_date.getFullYear();

        pool.query("select l.leave_type,l.emp_id,e.emp_name, (l.credited_leaves::numeric + l.carry_forwarded::numeric - l.availed_leaves::numeric) AS total,l.quaterly_leave from leave_master l , emp_master_tbl e where l.leave_type='EL' and l.del_flg='N' and e.emp_id = l.emp_id and l.year = $1 order by l.emp_id", [year], function (err, result) {
            var rowdata = result.rows;
            const xlsData = XLSX.utils.json_to_sheet(rowdata);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, xlsData, 'EmployeesEarnedLeaveBal');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const buffer = Buffer.from(excelBuffer);
            res.end(buffer);
        });
    }


    if (array == "8") {
        var current_date = new Date();
        var year = current_date.getFullYear();

        pool.query("select l.leave_type,l.emp_id,e.emp_name,(l.credited_leaves::numeric + l.carry_forwarded::numeric - l.availed_leaves::numeric) AS total from leave_master l , emp_master_tbl e where l.leave_type='SL' and l.del_flg='N' and e.emp_id = l.emp_id and l.year=$1 order by l.emp_id", [year], function (err, result) {
            var rowdata = result.rows;
            const xlsData = XLSX.utils.json_to_sheet(rowdata);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, xlsData, 'EmployeesSickLeaveBal');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const buffer = Buffer.from(excelBuffer);
            res.end(buffer);
        });
    }


    if (array == "9") {
        pool.query("select e.emp_id,e.emp_name,e.reporting_mgr,m.emp_name as mgr_name from emp_master_tbl e,emp_master_tbl m where e.del_flg='N' and e.entity_cre_flg='Y' and m.emp_id = e.reporting_mgr order by e.emp_id", function (err, result) {
            var rowdata = result.rows;
            const xlsData = XLSX.utils.json_to_sheet(rowdata);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, xlsData, 'ReportingManagerList');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const buffer = Buffer.from(excelBuffer);
            res.end(buffer);
        });
    }

    if (array == "10") {

        pool.query("SELECT * from holidays where del_flg =$1", ['N'], function (err, holidayList) {
            if (err) {
                console.error('Error with table query', err);
            }
            else {
                holidayData = holidayList.rows;
            }

            var current_date = new Date();
            var current_year = current_date.getFullYear();

            pool.query("SELECT * from leave_config where year=$1 and del_flg = 'N' ", [current_year], function (err, leaveConfigList) {
                if (err) {
                    console.error('Error with table query', err);
                }
                else {
                   var leaveConfigData = leaveConfigList.rows;
                }
                // res.json({
                //     eid: eid,
                //     ename: ename,
                //     emp_access: emp_access,
                //     leaveConfigData: leaveConfigData,
                //     holidayData: holidayData

                // });
                const xlsData = XLSX.utils.json_to_sheet(leaveConfigData);
                const workbook = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(workbook, xlsData, 'AllleaveTypes');
                const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
                const buffer = Buffer.from(excelBuffer);
                res.end(buffer);
            });
        });
    }
}


router.post('/reportValue', reportValue);
function reportValue(req, res) {

    console.log(req.body);

    var leaveType = req.body.leaveType;
    console.log("leaveType", leaveType);
    var fromDate = req.body.fromDate;
    console.log("fromDate", fromDate);
    var toDate = req.body.toDate;
    console.log("toDate", toDate);


    if (leaveType != "ALL") {
        pool.query("select l.emp_id,e.emp_name as emp_name,l.leave_type,to_char(l.from_date,'dd/mm/yyyy') as frm_date,to_char(l.to_date,'dd/mm/yyyy') as to_date,l.reason,l.approver_id,d.emp_name as appr_name from emp_master_tbl e,emp_master_tbl d,leaves l where e.emp_id = l.emp_id and d.emp_id = l.approver_id and l.leave_type = $1 and l.from_date between $2 and $3 order by l.emp_id", [leaveType, fromDate, toDate], function (err, result) {
            var data = result.rows;
            console.log("Notall: ", data);

            // res.json({
            //     data: data,
            //     data_count: data_count
            // });
            const xlsData = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, xlsData, 'EmployeeLeaveBalance');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const buffer = Buffer.from(excelBuffer);
            res.end(buffer);
        });

    }
    else {
        pool.query("select l.emp_id,e.emp_name as emp_name,l.leave_type,to_char(l.from_date,'dd/mm/yyyy') as frm_date,to_char(l.to_date,'dd/mm/yyyy') as to_date,l.reason,l.approver_id,d.emp_name as appr_name from emp_master_tbl e,emp_master_tbl d,leaves l where e.emp_id = l.emp_id and d.emp_id = l.approver_id and l.from_date  between $1 and $2 order by l.emp_id", [fromDate, toDate], function (err, result) {
            var data = result.rows;
            console.log("All: ", data);
            // res.json({
            //     data: data,
            //     data_count: data_count
            // });
            const xlsData = XLSX.utils.json_to_sheet(data);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, xlsData, 'EmployeeAllLeaveBalance');
            const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
            const buffer = Buffer.from(excelBuffer);
            res.end(buffer);
        });
    }
}

module.exports = router;