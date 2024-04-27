console.log('Holiday entered');

const express = require('express');
var router = express.Router();
var pool = require('../Database/dbconfig');



//////////Holidays/////////////
router.post('/addHolidays', addHolidays);
router.get('/viewHolidays', viewHolidays);
router.get('/removeHolidays/:hol_id', removeHolidays);
// router.delete('/deleteHoliday/:hol_id', deleteHolidays);


/////////ConfigLeaves/////////////
router.post('/configureLeaves', configureLeaves);
router.get('/ViewConfigureLeavesPage', ViewConfigureLeavesPage);
router.put('/modifyLeaves/:leave_id', modifyLeaves);
router.get('/removeLeavePage/:leave_id', removeLeavePage);
router.delete('/:leave_id', deleteLeaves);



// router.get('/holidays', holidays);
// router.get('/viewWorkingDays', viewWorkingDays);
// router.get('/removeWorkingDays', removeWorkingDays);
// router.get('/searchHolidays', searchHolidays);
// router.get('/searchHolidaysLeave', searchHolidaysLeave);
// router.get('/searchWorkingDays', searchWorkingDays);
// router.get('/viewHolidaysLeave', viewHolidaysLeave);
// router.get('/removeLeaveData', removeLeaveData);
// router.get('/modifyLeaveData', modifyLeaveData);
// router.get('/viewLeaveTypes', viewLeaveTypes);

///////////////////////////////////COCD////////////////////////////////////////////

router.get('/cocd', function (req, res) {

    pool.query("SELECT  COMM_CODE_ID,COMM_CODE_DESC FROM COMMON_CODE_TBL WHERE CODE_ID = 'LTYP'  ORDER BY COMM_CODE_ID ASC", function (err, result) {
        leave_type = result.rows;


        pool.query("SELECT  COMM_CODE_ID,COMM_CODE_DESC FROM COMMON_CODE_TBL WHERE  CODE_ID ='CNYR'  ORDER BY COMM_CODE_ID ASC", function (err, result) {
            year = result.rows;


            res.json({
                data: {
                    leave_type: leave_type,
                    year: year,
                }
            });
        });
    }
    )}
    );

    ////////////////////////////////////////// Add Holidays/////////////////////////////////////////////////////////

    function addHolidays(req, res) {

        var emp_id = req.body.user_id;
        var emp_access = req.body.user_type;
        var emp_name = req.body.user_name;
        var action = req.body.day_type;
        console.log('action', action);
        var sel_date = req.body.sel_date;
        console.log('Seletedate', sel_date);
        var desc = req.body.description;
        console.log('desc', desc);
        var now = new Date();
        var rcretime = now;

        // var splitValues = leaveTypeValue.split("-");
        // var leaveTypeId = splitValues[0];
        // var leaveTypeDesc = splitValues[1]
        ///////////////

        var year;
        var rowCount;



        pool.query("SELECT * from holidays", function (err, done) {
            if (err) {
                console.error('Error with table query', err);
            }
            else {
                hol_id_value = done.rowCount;
                console.log('hol_id_value', hol_id_value);
                hol_id_value = hol_id_value + 100;
                console.log(' hol_id_value', hol_id_value);
                hol_id = hol_id_value + 1;
                console.log(' hol_id', hol_id);
            }

            //logic added by srikanth

            pool.query("select * from holidays where sel_date = $1 and del_flg='N'", [sel_date], function (err, done) {
                if (err) {
                    console.error('Error with table query', err);
                }
                else {
                    var hcount = done.rowCount
                }


                if (hcount == "0") {

                    pool.query("INSERT INTO holidays(day_type, sel_date, del_flg, rcre_user_id, rcre_time, lchg_user_id, lchg_time, description,year,hol_id) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)", [action, sel_date, 'N', emp_id, rcretime, emp_id, rcretime, desc, year, hol_id], function (err, done) {
                        if (err) throw err;
                    });



                    res.json({

                        // req.flash('success', "Entry added successfully")
                        // res.redirect(req.get('referer'));

                        message: "redirect to referer",
                        notification: "Entry added successfully",
                        data: {
                            action: action,
                            sel_date: sel_date,
                            desc: desc,

                        }
                    })

                }
                else {
                    res.json({
                        message: "redirect to referer",
                        notification: "Holiday Type Already Added for this Year , Try Modifying the Holiday Type"
                    })

                    // req.flash('error', "Leave Type Already Added for this Year , Try Modifying the Leave Type")
                    // res.redirect(req.get('referer'));

                }
            });
        });
    }




    //////////////////////////////////////////////////////viewHolidays/////////////////////////////////////////////


    function viewHolidays(req, res) {

        var eid = req.query.user_id;
        var emp_access = req.query.user_type;
        var ename = req.query.user_name;
        var year = req.query.year;
        var now = new Date();
        var rcretime = now;
        //   and del_flg ='N'
        //pool.query("SELECT * FROM holidays where del_flg =$1 and day_type in ('H','O') AND year = $2 ",['N',year], function(err, holidayList) {
        pool.query("SELECT * FROM holidays where day_type in ('H','W') and del_flg='N'  order by current_date", function (err, holidayList) {
            if (err) {
                console.error('Error with table query', err);
            }
            else {
                var holiday_list = holidayList.rows;
                var holiday_count = holidayList.rowCount;
                console.log(holiday_list);
            }


            res.json({
                message: "redirect to viewHolidays",
                data: holiday_list
            })

            // res.render('holidaysModule/viewHolidays',{
            //     holiday_list:holiday_list,
            //     holiday_count:holiday_count,
            //     eid:eid,
            //     ename:ename,
            //     emp_access:emp_access,
            //     year:year
            //                                                 });

        });

    }


    ////////////////////////////////////////////////Remove Holidays/////////////////////////////////////////////////////////



    function removeHolidays(req, res) {
        var emp_id = req.query.user_id;
        var emp_access = req.query.user_type;
        var emp_name = req.query.user_name;
        var hol_id = req.params.hol_id;
        console.log("hol_id", hol_id);
        var now = new Date();
        var lchgtime = now;
        var year = now.getFullYear();
        var rcretime = now;


        pool.query("UPDATE holidays set del_flg = $1, lchg_user_id = $2 , lchg_time = $3 where  hol_id = $4 ", ['Y', emp_id, lchgtime, hol_id], function (err, done) {
            if (err) {
                console.error('Error with table query', err);
            }
            else {

                //               console.log('111111111111111111111111111');
            }

            pool.query("SELECT * FROM holidays where del_flg =$1 and day_type in ('H','O') AND year = $2 ", ['N', year], function (err, holidayList) {
                if (err) {
                    console.error('Error with table query', err);
                }
                else {
                    rowData = holidayList.rows;
                }

                pool.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('H','O') order by current_date", function (err, holidayList) {
                    if (err) {
                        console.error('Error with table query', err);
                    }
                    else {
                        var holiday_list = holidayList.rows;
                        var holiday_count = holidayList.rowCount;
                    }


                    console.log(holidayList);
                    success = 'Holiday entry removed successfully';
                    res.json({
                        message: "redirect to viewHolidays",
                        data: {
                            rowData: rowData,
                            emp_id: emp_id,
                            emp_name: emp_name,
                            emp_access: emp_access,
                            year: year,
                            success: success,
                            holiday_list: holiday_list,
                            holiday_count: holiday_count
                        }
                    })
                    // res.render('holidaysModule/viewHolidays', {
                    //     rowData: rowData,
                    //     emp_id: emp_id,
                    //     emp_name: emp_name,
                    //     emp_access: emp_access,
                    //     year: year,
                    //     success: success,
                    //     holiday_list: holiday_list,
                    //     holiday_count: holiday_count
                    // });
                });
            });
        });
    }



    // //delete HoildayData
    // function deleteHolidays(req, res) {

    //     const hol_id = req.params.hol_id;
    //     const text = 'DELETE FROM holidays WHERE hol_id = $1';
    //     const values = [hol_id];

    //     pool.query(text, values, (err, result) => {
    //         if (err) {
    //             console.error(err);
    //             res.status(500).send('Error updating data');
    //           } 
    //           else {
    //             const message = {
    //                 message: "Data Deleted successfully"
    //             }
    //             res.send(message);
    //           }
    //     });

    // }



    /////////////////////////////////////////////////ADD Config Details////////////////////////////////////////////////////



    function configureLeaves(req, res) {
        var emp_id = req.body.user_id;
        var emp_access = req.body.user_type;
        var emp_name = req.body.user_name;
        var leaveTypeValue = req.body.leave_type;
        var configyears = req.body.configyears;

        var nod = req.body.nod;
        var cnod = req.body.cnod;
        var now = new Date();
        var rcretime = now;
        // var splitValues = leaveTypeValue.split("-");
        // var leaveTypeId = splitValues[0];
        // var leaveTypeDesc = splitValues[1]
        ///////////////
        var leaveTypeId = req.body.leave_type;
        var nod = req.body.allocated_leaves;
        var desc = req.body.description;
        var configyears = req.body.year;

        console.log("configyears", configyears);
        console.log(leaveTypeId);
        console.log(nod);
        console.log(desc);
        console.log(configyears);


        pool.query("SELECT * from leave_config", function (err, done) {
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

            //logic added by srikanth

            pool.query("SELECT * from leave_config where leave_type=$1 and del_flg='N' and year=$2", [leaveTypeId, configyears], function (err, done) {
                if (err) {
                    console.error('Error with table query', err);
                }
                else {
                    var leave_cnt = done.rowCount
                }


                if (leave_cnt == "0") {

                    pool.query("INSERT INTO leave_config(leave_type, del_flg ,allocated_leaves, rcre_user_id , rcre_time ,lchg_user_id,lchg_time,description,year,leave_id) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)", [leaveTypeId, 'N', nod, emp_id, rcretime, emp_id, rcretime, desc, configyears, leave_id], function (err, done) {
                        if (err) throw err;
                    });



                    res.json({

                        // req.flash('success', "Entry added successfully")
                        // res.redirect(req.get('referer'));
                        message: "redirect to referer",
                        notification: "Entry added successfully",
                        data: {
                            leaveTypeId: leaveTypeId,
                            nod: nod,
                            desc: desc,
                            configyears: configyears
                        }
                    })

                }
                else {
                    res.json({
                        message: "redirect to referer",
                        notification: "Leave Type Already Added for this Year , Try Modifying the Leave Type"
                    })

                    // req.flash('error', "Leave Type Already Added for this Year , Try Modifying the Leave Type")
                    // res.redirect(req.get('referer'));

                }
            });
        });
    }




    //////////////////////////////////////////////View Config Details//////////////////////////////////////////////////////


    function ViewConfigureLeavesPage(req, res) {

        var emp_id = req.body.user_id;
        var emp_access = req.body.user_type;
        var emp_name = req.body.user_name;
        var current_date = new Date();


        pool.query("SELECT * FROM leave_config where del_flg='N' ", function (err, leaveList) {
            if (err) {
                console.error('Error with table query', err);
            }
            else {
                var leaveList = leaveList.rows;

                console.log(leaveList);
            }


            res.json({
                message: "redirect to viewHolidays",
                data: leaveList
            })

        });

    }


    ////////////////////////////////////////////////////Modify Config Details//////////////////////////////////////////



    function modifyLeaves(req, res) {
        var emp_id = req.body.user_id;
        var emp_access = req.body.user_type;
        var emp_name = req.body.user_name;
        var leave_type = req.body.leave_type;
        var leave_id = req.params.leave_id;
        var year = req.body.year;
        var description = req.body.leaveType;
        var nod = req.body.allocated_leaves;
        var cnod = req.body.carry_fwd;
        var now = new Date();
        var rcretime = now;

        console.log(leave_type)
        console.log(year)
        console.log(nod);
        console.log(cnod);
        console.log(now);
        console.log(leave_id);

        pool.query("UPDATE leave_config set lchg_user_id = $1 , lchg_time = $2 , allocated_leaves = $3, carry_fwd =$4 ,leave_type = $5 , year = $6 where leave_id=$7", [emp_id, rcretime, nod, cnod, leave_type, year, leave_id], function (err, leaveList) {
            if (err) {
                console.error(err);

            } else {

                console.log("updated sucessfully");


            }

            pool.query("SELECT comm_code_desc cocd ,* FROM leave_config l, common_code_tbl cocd where cocd.del_flg ='N'and l.del_flg ='N' and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP' order by year", function (err, leaveList) {
                if (err) {
                    console.error('Error with table query', err);
                }
                else {
                    rowData = leaveList.rows;
                }

                success = 'Leave data modified successfully';


                res.json({
                    message: "redirect to holidays",
                    notification: "Entry added successfully",
                    data: {
                        emp_id: emp_id,
                        emp_name: emp_name,
                        emp_access: emp_access,
                        success: success,
                        leave_type: leave_type,
                        nod: nod,
                        cnod: cnod,
                        year: year
                    }

                });
            })

            //  res.render('holidaysModule/viewLeaveTypes',{
            //    emp_id:emp_id, 
            //     emp_name:emp_name,
            //     emp_access:emp_access,
            //     success:success,
            //     rowData:rowData
            //                         });

        });

    }


    /////////////////////////////////////////////////Remove Config Details//////////////////////////////////////////////////




    function removeLeavePage(req, res) {

        var emp_id = req.query.user_id;
        var emp_access = req.query.user_type;
        var emp_name = req.query.user_name;
        var leave_type = req.params.leaveId;
        var leave_id = req.params.leave_id;
        console.log("leave_id", leave_id);
        var configyears = req.query.configyears;
        var now = new Date();
        var lchgtime = now;
        var year = req.query.year;
        var rcretime = now;



        pool.query("UPDATE leave_config  set del_flg = $1, lchg_user_id = $2 , lchg_time = $3 where  leave_id = $4 ", ['Y', emp_id, lchgtime, leave_id], function (err, done) {
            if (err) {
                console.error('Error with table query', err);
            }
            else {

                console.log('111111111111111111111111111');
            }


            // pool.query("SELECT * FROM leave_config where del_flg =$1 and leave_type= $2 and year=$3", ['N', leave_type, year], function (err, leaveList) {
            //     if (err) {
            //         console.error('Error with table query', err);
            //     }
            //     else {
            //          var rowData = leaveList.rows;
            //         // leave_type_value = query.description;
            //         leave_id = query.leave_type;
            //         no_of_days =query.allocated_leaves;
            //         carry_fwd = query.carry_fwd;
            //         configyears = query.year;
            //         var leaveList = leaveList.rows;

            //         console.log(leaveList);
            //     }


            res.json({
                message: "redirect to removeLeavePage",

            })

            // res.render('holidaysModule/removeLeavePage', {
            //     rowData: rowData,
            //     emp_id: emp_id,
            //     emp_name: emp_name,
            //     emp_access: emp_access,
            //     leave_type_value: leave_type_value,
            //     no_of_days: no_of_days,
            //     carry_fwd: carry_fwd,
            //     leave_id: leave_id,
            //     configyears: configyears
            // });

        });
    }



    //////////////////////////////            or             ///////////////////////



    // //delete LeaveData
    function deleteLeaves(req, res) {

        const leave_id = req.params.leave_id;
        const text = 'DELETE FROM leave_config WHERE leave_id = $1';
        const values = [leave_id];

        pool.query(text, values, (err, result) => {
            if (err) {
                console.error(err);
                res.status(500).send('Error updating data');
            }
            else {
                const message = {
                    message: "Data Deleted successfully"
                }
                res.send(message);
            }
        });

    }

    ////////////////////////////////////////////////////////////////////////////////////////////


















    // function viewLeaveTypes(req, res) {
    //     var emp_id = req.query.user_id;
    //     var emp_access = req.query.user_type;
    //     var emp_name = req.query.user_name;


    //     pool.query("SELECT comm_code_desc  cocd, * FROM leave_config l, common_code_tbl cocd where cocd.del_flg ='N'and l.del_flg ='N' and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP' order by l.year", function (err, leaveList) {
    //         if (err) {
    //             console.error('Error with table query', err);
    //         } else {
    //             rowData = leaveList.rows;
    //         }

    //         res.json({
    //             message: "redirect to viewLeaveTypes",
    //             data: {
    //                 rowData: rowData,
    //                 emp_id: emp_id,
    //                 emp_name: emp_name,
    //                 emp_access: emp_access
    //             }
    //         })


    //         // res.render('holidaysModule/viewLeaveTypes', {
    //         //     rowData: rowData,
    //         //     emp_id: emp_id,
    //         //     emp_name: emp_name,
    //         //     emp_access: emp_access
    //         // });

    //     });
    // }

















    // function modifyLeaveData(req, res) {

    //     var emp_id = req.user.query.user_id;
    //     var emp_access = req.user.query.user_type;
    //     var emp_name = req.user.query.user_name;
    //     var leave_type = req.query.id;
    //     var configyears = req.query.year;
    //     var now = new Date();
    //     var lchgtime = now;
    //     var rcretime = now;

    //     pool.query("SELECT * FROM leave_config where del_flg =$1 and leave_type= $2 and year=$3 order by year", ['N', leave_type, configyears], function (err, leaveList) {
    //         if (err) {
    //             console.error('Error with table query', err);
    //         }
    //         else {
    //             rowData = leaveList.rows;
    //             leave_type_value = query.description;
    //             leave_id = query.leave_type;
    //             no_of_days = query.allocated_leaves;
    //             carry_fwd = query.carry_fwd;
    //             configyears = query.year;
    //         }

    //         res.json({
    //             message: "redirect to modifyLeavePage",
    //             data: {
    //                 rowData: rowData,
    //                 emp_id: emp_id,
    //                 emp_name: emp_name,
    //                 emp_access: emp_access,
    //                 leave_type_value: leave_type_value,
    //                 no_of_days: no_of_days,
    //                 carry_fwd: carry_fwd,
    //                 leave_id: leave_id,
    //                 configyears: configyears
    //             }
    //         })

    //         // res.render('holidaysModule/modifyLeavesPage', {
    //         //     rowData: rowData,
    //         //     emp_id: emp_id,
    //         //     emp_name: emp_name,
    //         //     emp_access: emp_access,
    //         //     leave_type_value: leave_type_value,
    //         //     no_of_days: no_of_days,
    //         //     carry_fwd: carry_fwd,
    //         //     leave_id: leave_id,
    //         //     configyears: configyears
    //         // });

    //     });

    // }


    // function removeLeaveData(req, res) {
    //     var emp_id = req.user.query.user_id;
    //     var emp_access = req.user.query.user_type;
    //     var emp_name = req.user.query.user_name;
    //     var leave_type = req.params.leaveId;
    //     var leave_id = req.params.leave_id;
    //     var configyears = req.query.configyears;
    //     var now = new Date();
    //     var lchgtime = now;
    //     var rcretime = now;

    //     // leave_type = $4 and year=$5 
    //     //leave_type, configyears
    //     pool.query("UPDATE leave_config set del_flg = $1, lchg_user_id = $2 , lchg_time = $3 where leave_id=$6" ['Y', emp_id, lchgtime ,leave_id], function (err, done) {
    //         if (err) {
    //             console.error('Error with table query', err);
    //         }
    //         else {
    //             //               console.log('111111111111111111111111111');
    //         }

    //         pool.query("SELECT comm_code_desc cocd ,* FROM leave_config l, common_code_tbl cocd where cocd.del_flg ='N'and l.del_flg ='N' and cocd.comm_code_id = l.leave_type and cocd.code_id ='LTYP' ", function (err, leaveList) {
    //             if (err) {
    //                 console.error('Error with table query', err);
    //             }
    //             else { 
    //                 rowData = leaveList.rows;
    //                 console.log("rowData", rowData);
    //             }


    //             success = 'Leave type entry removed successfully';
    //             res.json({
    //                 message: "redirect to  viewLeaveTypes",
    //                 data: {
    //                     rowData: rowData,
    //                     emp_id: emp_id,
    //                     emp_name: emp_name,
    //                     emp_access: emp_access,
    //                     success: success
    //                 }
    //             })

    //             // res.render('holidaysModule/viewLeaveTypes', {
    //             //     rowData: rowData,
    //             //     emp_id: emp_id,
    //             //     emp_name: emp_name,
    //             //     emp_access: emp_access,
    //             //     success: success
    //             // });

    //         });
    //     });
    // }





    // function holidays(req, res) {
    //     var emp_id = req.query.user_id;
    //     var emp_access = req.query.user_type;
    //     var emp_name = req.query.user_name;

    //     res.json({
    //         message: "redirect to holidays",
    //         data: {

    //             emp_id: emp_id,
    //             emp_name: emp_name,
    //             emp_access: emp_access

    //         }
    //     })

    //     // res.render('holidaysModule/holidays', {

    //     //     emp_id: emp_id,
    //     //     emp_name: emp_name,
    //     //     emp_access: emp_access

    //     // });

    // }








    // function viewHolidaysLeave(req, res) {
    //     var eid = req.query.user_id;
    //     var emp_access = req.query.user_type;
    //     var ename = req.query.user_name;
    //     var year = req.query.year;
    //     var now = new Date();
    //     var rcretime = now;

    //     //pool.query("SELECT * FROM holidays where del_flg =$1 and day_type in ('H','O') AND year = $2 ",['N',year], function(err, holidayList) {

    //     pool.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg ='N' and day_type in ('H','O') order by current_date", function (err, holidayList) {
    //         if (err) {
    //             console.error('Error with table query', err);
    //         }
    //         else {
    //             var holiday_list = holidayList.rows;
    //             var holiday_count = holidayList.rowCount;
    //         }


    //         res.json({
    //             message: "redirect to viewHolidaysLeave",
    //             data: {
    //                 holiday_list: holiday_list,
    //                 holiday_count: holiday_count,
    //                 eid: eid,
    //                 ename: ename,
    //                 emp_access: emp_access,
    //                 year: year
    //             }
    //         })

    //         // res.render('requestModule/viewHolidaysLeave',{
    //         // holiday_list:holiday_list,
    //         // holiday_count:holiday_count,
    //         // eid:eid,
    //         // ename:ename,
    //         // emp_access:emp_access,
    //         // year:year
    //         // 					});

    //     });
    // }


    // function searchHolidays(req, res) {
    //     var emp_id = req.query.user_id;
    //     var emp_access = req.query.user_type;
    //     var emp_name = req.query.user_name;

    //     var year = req.query.year;
    //     var now = new Date();
    //     //var year = now.getFullYear();   
    //     var rcretime = now;



    //     pool.query("SELECT * FROM holidays where del_flg =$1 and day_type in ('H','O') AND year = $2 ", ['N', year], function (err, holidayList) {
    //         if (err) {
    //             console.error('Error with table query', err);
    //         } else {
    //             rowData = holidayList.rows;
    //         }

    //         res.json({
    //             message: "redirect to viewHolidays",
    //             data: {
    //                 rowData: rowData,
    //                 emp_id: emp_id,
    //                 emp_name: emp_name,
    //                 emp_access: emp_access,
    //                 year: year
    //             }
    //         })

    //         // res.render('holidaysModule/viewHolidays',{
    //         // rowData:rowData,
    //         // emp_id:emp_id,
    //         // emp_name:emp_name,
    //         // emp_access:emp_access,
    //         // year:year
    //         // });

    //     });
    // }

    // function searchHolidaysLeave(req, res) {
    //     var eid = req.query.user_id;
    //     var emp_access = req.query.user_type;
    //     var ename = req.query.user_name;
    //     var year = req.query.year;
    //     var now = new Date();
    //     //var year = now.getFullYear();   
    //     var rcretime = now;


    //     //pool.query("SELECT * FROM holidays where del_flg =$1 and day_type in ('H','O') AND year = $2 ",['N',year], function(err, holidayList) {
    //     pool.query("SELECT day_type,sel_date,description,year FROM holidays where del_flg =$1 and day_type in ('H','O')", function (err, holidayList) {
    //         if (err) {
    //             console.error('Error with table query', err);
    //         } else {
    //             var holiday_list = holidayList.rows;
    //             var holiday_count = holidayList.rowCount;
    //         }


    //         res.json({
    //             message: "redirect to viewHolidayLeave",
    //             data: {
    //                 holiday_list: holiday_list,
    //                 holiday_count: holiday_count,
    //                 eid: eid,
    //                 ename: ename,
    //                 emp_access: emp_access,
    //                 year: year
    //             }
    //         })

    //         // res.render('requestModule/viewHolidaysLeave', {
    //         //     holiday_list: holiday_list,
    //         //     holiday_count: holiday_count,
    //         //     eid: eid,
    //         //     ename: ename,
    //         //     emp_access: emp_access,
    //         //     year: year
    //         // });

    //     });
    // }


    // function searchWorkingDays(req, res) {
    //     var emp_id = req.query.user_id;
    //     var emp_access = req.query.user_type;
    //     var emp_name = req.query.user_name;

    //     var year = req.query.year;
    //     var now = new Date();
    //     //var year = now.getFullYear();   
    //     var rcretime = now;



    //     pool.query("SELECT * FROM holidays where del_flg =$1 and day_type in ('W') AND year = $2 ", ['N', year], function (err, holidayList) {
    //         if (err) {
    //             console.error('Error with table query', err);
    //         } else {
    //             rowData = holidayList.rows;
    //         }

    //         console.log(holidayList);

    //         res.json({
    //             message: "redirect to viewWorkingDays",
    //             data: {
    //                 holiday_list: holiday_list,
    //                 holiday_count: holiday_count,
    //                 eid: eid,
    //                 ename: ename,
    //                 emp_access: emp_access,
    //                 year: year
    //             }
    //         })


    //         // res.render('holidaysModule/viewWorkingDays', {
    //         //     rowData: rowData,
    //         //     emp_id: emp_id,
    //         //     emp_name: emp_name,
    //         //     emp_access: emp_access,
    //         //     year: year
    //         // });

    //     });
    // }





    // function removeWorkingDays(req, res) {
    //     var emp_id = req.body.user_id;
    //     var emp_access = req.body.user_type;
    //     var emp_name = req.body.user_name;
    //     var hol_id = req.query.id;
    //     var now = new Date();
    //     var lchgtime = now;
    //     var year = now.getFullYear();
    //     var rcretime = now;
    //   console.log("emp_id:"+emp_id);
    //     pool.query("UPDATE  holidays set   del_flg = $1, lchg_user_id = $2 , lchg_time = $3 where  hol_id = $4 ", ['Y', emp_id, lchgtime, hol_id], function (err, done) {

    //         if (err) {
    //             console.error('Error with table query', err);
    //         }
    //         else {
    //             //               	console.log('111111111111111111111111111');
    //         }

    //         pool.query("SELECT * FROM holidays where del_flg =$1 and day_type in ('W') AND year = $2 ", ['N', year], function (err, holidayList) {
    //             if (err) {
    //                 console.error('Error with table query', err);
    //             }
    //             else {
    //                 rowData = holidayList.rows;
    //             }

    //             pool.query("SELECT * FROM holidays where del_flg =$1 and day_type in ('W') AND year = $2 ", ['N', year], function (err, holidayList) {
    //                 if (err) {
    //                     console.error('Error with table query', err);
    //                 }
    //                 else {
    //                     var holiday_list = holidayList.rows;
    //                     var holiday_count = holidayList.rowCount;
    //                 }

    //                 console.log(holidayList);
    //                 success = 'Working day entry removed successfully';
    //                 res.json({
    //                     message: "redirect to viewWorkingDays",
    //                     data: {
    //                         rowData: rowData,
    //                         emp_id: emp_id,
    //                         emp_name: emp_name,
    //                         emp_access: emp_access,
    //                         year: year,
    //                         holiday_list: holiday_list,
    //                         holiday_count: holiday_count,
    //                         success: success
    //                     }
    //                 })

    //                 // res.render('holidaysModule/viewWorkingDays', {
    //                 //     rowData: rowData,
    //                 //     emp_id: emp_id,
    //                 //     emp_name: emp_name,
    //                 //     emp_access: emp_access,
    //                 //     year: year,
    //                 //     holiday_list: holiday_list,
    //                 //     holiday_count: holiday_count,
    //                 //     success: success
    //                 // });

    //             });
    //         });
    //     });
    // }




    // function viewWorkingDays(req, res) {
    //     var eid = req.body.user_id;
    //     var emp_access = req.body.user_type;
    //     var ename = req.body.user_name;
    //     var now = new Date();
    //     var year = now.getFullYear();
    //     var rcretime = now;


    //     pool.query("SELECT * FROM holidays where del_flg =$1 and day_type in ('W') AND year = $2 ", ['N', year], function (err, holidayList) {
    //         if (err) {
    //             console.error('Error with table query', err);
    //         }
    //         else {
    //             var holiday_list = holidayList.rows;
    //             console.error('holiday_list', holiday_list);
    //             var holiday_count = holidayList.rowCount;
    //             console.error('holiday_count', holiday_count);
    //         }

    //         console.log(holidayList);


    //         res.json({
    //             message: "redirect to viewWorkingDays",
    //             data: {
    //                 holiday_list: holiday_list,
    //                 holiday_count: holiday_count,
    //                 eid: eid,
    //                 ename: ename,
    //                 emp_access: emp_access,
    //                 year: year
    //             }
    //         })

    //         // res.render('holidaysModule/viewWorkingDays', {
    //         //     holiday_list: holiday_list,
    //         //     holiday_count: holiday_count,
    //         //     eid: eid,
    //         //     ename: ename,
    //         //     emp_access: emp_access,
    //         //     year: year
    //         // });

    //     });

    // }


    /////////////////////////////////////////////////////////////////////

    module.exports = router;
