console.log('cms module enterd');

const multer = require('multer');

const path = require('path');

var util = require('util');
const fs = require('fs');

const express = require('express');
var router = express.Router();
var pool = require('../Database/dbconfig');

var archiver = require('archiver'),
    archive = archiver('zip');

var moment = require('moment');
const formidable = require('formidable');

var bodyParser = require('body-parser');

var nodemailer = require('nodemailer');

var mailId = "";
var newName = "";
var cpath = [];
var docs = [];
var policyTag = "";
var magzYear = [], magzDoc = [], magzTot = [], magzQtr = [];
var doc = "";
var panFlg = "N", aadharFlg = "N", sslcFlg = "N", preunivFlg = "N", degreeFlg = "N";






////////////////////////////////// Mahesh ////////////////////////////

//////////////////////////////////////--->    Documents  <<--///////////////////////////////////////////////////////

/////////////////////////////////////// upload documents ////////////////////////

router.post('/cmsUploadPost', cmsUploadPostEmployee);
function cmsUploadPostEmployee(req, res) {
    console.log("Upload post Entered ");
    // console.log(req);
    var emp_access = "";
    var eid = "";


    doc = "";

    const form = new formidable.IncomingForm();
    console.log("entred to emp post");
    form.parse(req, function (err, fields, files) {
        console.log("req", req);
        var eid = req.body.user_id;
        var emp_access = req.body.user_type;
        var docCat = req.body.docCat;
        var docType = req.body.docType;
        var docCatText = req.body.docCatText;
        var docTypeText = req.body.docTypeText;

        var empId = eid;
        console.log("EmpId--> " + empId);
        console.log("EmpAccess--> " + emp_access);
        console.log("docCat--> " + docCat);
        console.log("docType--> " + docType);
        console.log("docCatText--> " + docCatText);
        console.log("docTypeText--> " + docTypeText);

        if (emp_access != "A1") {

            console.log("1.docat--> " + docCat);
            if (docCat == "1" || docCat == "2") {

                console.log("2.docType--> " + docType);

                if (docCat == "2") {
                    if (docType == "12") {
                        console.log("3.docTypeText " + docTypeText);
                        docTypeText = docTypeText.replace(/ /g, '_').toUpperCase();
                    }
                }
            }

            if (docCat == "7" || docCat == "8" || docCat == "4") {

                docCatText = docCatText.replace(/ /g, '_').toUpperCase();
            }

            if (docCat == "1") {
                if (docType == "1") {
                    doc = "GOVT_PASSPORT";
                }
                if (docType == "2") {
                    doc = "GOVT_PANCARD";
                }
                if (docType == "3") {
                    doc = "GOVT_VOTERID";
                }
                if (docType == "4") {
                    doc = "GOVT_DRIVLIC";
                }
                if (docType == "5") {
                    doc = "GOVT_AADHAR";
                }
            }
            if (docCat == "2") {
                if (docType == "1") {
                    doc = "EDUC_SSLC";
                }
                if (docType == "2") {
                    doc = "EDUC_PRE_UNIV";
                }
                if (docType == "3") {
                    doc = "EDUC_SEM1";
                }
                if (docType == "4") {
                    doc = "EDUC_SEM2";
                }
                if (docType == "5") {
                    doc = "EDUC_SEM3";
                }
                if (docType == "6") {
                    doc = "EDUC_SEM4";
                }
                if (docType == "7") {
                    doc = "EDUC_SEM5";
                }
                if (docType == "8") {
                    doc = "EDUC_SEM6";
                }
                if (docType == "9") {
                    doc = "EDUC_SEM7";
                }
                if (docType == "10") {
                    doc = "EDUC_SEM8";
                }
                if (docType == "11") {
                    doc = "EDUC_DEGREE";
                }
                if (docType == "12") {
                    doc = "EDUC_OTHERS_" + docTypeText;
                }
            }
            if (docCat == "3") {
                doc = "MEDICAL";
            }
            if (docCat == "4") {
                doc = "EXPERIENCE_" + docCatText;
            }
            if (docCat == "5") {
                doc = "PHOTO";
            }
            if (docCat == "6") {
                doc = "RESUME";
            }
            if (docCat == "7") {
                doc = "CERT_" + docCatText;
            }
            if (docCat == "8") {
                doc = "OTHR_" + docCatText;
            }

            var dir2 = './data/CMS/employee/uploadDoc/' + empId + "/";
            if (!fs.existsSync(dir2)) {
                fs.mkdirSync(dir2);
            }
            if (docCat == "5") {
                var newName = empId + "_" + doc + "_uv.jpg";
            }
            else if (docCat == "6") {
                var newName = empId + "_" + doc + "_uv.doc";
            }
            else {
                console.log("creating the pdf file name...");
                var newName = empId + "_" + doc + "_uv.pdf";
                console.log("New file Name--> " + newName);
            }

            var trejFoleder = './data/CMS/employee/rejectDoc/' + empId + "/";
            var treasFoleder = './data/CMS/employee/rejectReason/' + empId + "/";
            if (!fs.existsSync(trejFoleder)) {
                console.log("No rejected documents");
            }
            else {
                fs.readdirSync(trejFoleder).forEach(
                    function (name) {
                        var searchPattern = empId + "_" + doc;
                        var resValue = name.search(searchPattern);
                        if (resValue != -1) {
                            if (doc == "PHOTO") {
                                var rejFile = trejFoleder + searchPattern + "_rj.jpg";
                            }
                            else if (doc == "RESUME") {
                                var rejFile = trejFoleder + searchPattern + "_rj.doc";
                            }
                            else {
                                var rejFile = trejFoleder + searchPattern + "_rj.pdf";
                            }
                            var reasFile = treasFoleder + searchPattern + "_rj.txt";
                            fs.unlinkSync(rejFile);
                            fs.unlinkSync(reasFile);
                        }
                    });
            }


            var newPath = dir2 + newName;

            fs.rename(oldPath, newPath, function (err) {
                if (err) throw err;
                res.json({ notification: "Document Uploaded Successfully" })
                // res.redirect(req.get('referer'));
            });



        }



        else {



            updQuery = "", panFlg = "N", aadharFlg = "N", sslcFlg = "N", preunivFlg = "N", degreeFlg = "N";



            if (docCat == "1" || docCat == "2" || docCat == "10") {



                if (docCat == "2") {
                    if (docType == "12") {
                        docTypeText = docTypeText.replace(/ /g, '_').toUpperCase();

                    }
                }
            }
            if (docCat == "7" || docCat == "8" || docCat == "4") {

                docCatText = docCatText.replace(/ /g, '_').toUpperCase();
            }
            if (docCat == "1") {
                if (docType == "1") {
                    doc = "GOVT_PASSPORT";
                }
                if (docType == "2") {
                    doc = "GOVT_PANCARD";
                    panFlg = "Y";
                }
                if (docType == "3") {
                    doc = "GOVT_VOTERID";
                }
                if (docType == "4") {
                    doc = "GOVT_DRIVLIC";
                }
                if (docType == "5") {
                    doc = "GOVT_AADHAR";
                    aadharFlg = "Y";
                }
            }
            if (docCat == "2") {
                if (docType == "1") {
                    doc = "EDUC_SSLC";
                    sslcFlg = "Y";
                }
                if (docType == "2") {
                    doc = "EDUC_PRE_UNIV";
                    preunivFlg = "Y";
                }
                if (docType == "3") {
                    doc = "EDUC_SEM1";
                }
                if (docType == "4") {
                    doc = "EDUC_SEM2";
                }
                if (docType == "5") {
                    doc = "EDUC_SEM3";
                }
                if (docType == "6") {
                    doc = "EDUC_SEM4";
                }
                if (docType == "7") {
                    doc = "EDUC_SEM5";
                }
                if (docType == "8") {
                    doc = "EDUC_SEM6";
                }
                if (docType == "9") {
                    doc = "EDUC_SEM7";
                }
                if (docType == "10") {
                    doc = "EDUC_SEM8";
                }
                if (docType == "11") {
                    doc = "EDUC_DEGREE";
                    degreeFlg = "Y";
                }
                if (docType == "12") {
                    doc = "EDUC_OTHERS_" + docTypeText;
                }
            }
            if (docCat == "3") {
                doc = "MEDICAL";
            }
            if (docCat == "4") {
                doc = "EXPERIENCE_" + docCatText;
            }
            if (docCat == "5") {
                doc = "PHOTO";
            }
            if (docCat == "6") {
                doc = "RESUME";
            }
            if (docCat == "7") {
                doc = "CERT_" + docCatText;
            }
            if (docCat == "8") {
                doc = "OTHR_" + docCatText;
            }
            if (docCat == "9") {
                doc = "BACKGROUND";
            }
            if (docCat == "10") {
                if (docType == "1") {
                    doc = "HR_OFFER_LETTER";
                }
                if (docType == "2") {
                    doc = "HR_BOND";
                }
                if (docType == "3") {
                    doc = "HR_APPOINMENT_LETTER";
                }
                if (docType == "4") {
                    doc = "HR_CONFIRMATION_LETTER";
                }
                if (docType == "5") {
                    doc = "HR_ONSITE_DEPLOYMENT_DOCKET";
                }
                if (docType == "6") {
                    var d = new Date();
                    var n = d.getFullYear();
                    doc = "HR_REVISION_LETTER_" + n;
                }
                if (docType == "7") {
                    doc = "HR_COMPENSATION_LETTER";
                }
                if (docType == "8") {
                    doc = "HR_EXIT_INTERVIEW_LETTER";
                }
                if (docType == "9") {
                    doc = "HR_RELIEVING_LETTER";
                }
            }

            var dir2 = './data/CMS/employee/uploadDoc/' + empId + "/";
            if (!fs.existsSync(dir2)) {
                fs.mkdirSync(dir2);
            }
            if (docCat == "5") {
                var newName = empId + ".jpg";
                dir2 = './public/images/profile/';
            }
            else if (docCat == "6") {
                var newName = empId + "_" + doc + ".doc";
                dir2 = './data/CMS/employee/uploadDoc/' + empId + "/";
            }
            else {
                var newName = empId + "_" + doc + ".pdf";
                dir2 = './data/CMS/employee/uploadDoc/' + empId + "/";
            }

            var trejFoleder = './data/CMS/employee/rejectDoc/' + empId + "/";
            var treasFoleder = './data/CMS/employee/rejectReason/' + empId + "/";
            if (!fs.existsSync(trejFoleder)) {
                console.log("No rejected documents");
            }
            else {
                fs.readdirSync(trejFoleder).forEach(
                    function (name) {
                        console.log("name", name);
                        var searchPattern = empId + "_" + doc;
                        var resValue = name.search(searchPattern);
                        if (resValue != -1) {
                            if (doc == "PHOTO") {
                                var rejFile = trejFoleder + searchPattern + "_rj.jpg";
                            }
                            else if (doc == "RESUME") {
                                var rejFile = trejFoleder + searchPattern + "_rj.doc";
                            }
                            else {
                                var rejFile = trejFoleder + searchPattern + "_rj.pdf";
                            }

                            var reasFile = treasFoleder + searchPattern + "_rj.txt";
                            fs.unlinkSync(rejFile);
                            fs.unlinkSync(reasFile);
                        }
                    });
            }

            console.log(oldPath);
            var newPath = dir2 + newName;
            console.log(newPath);

            fs.rename(oldPath, newPath,
                function (err) {
                    if (err) throw err;

                    if (panFlg == "Y") {
                        pool.query("UPDATE E_DOCKET_TBL SET PAN_FLG = $1 WHERE EMP_ID = $2", [panFlg, empId],
                            function (err, done) {
                                if (err) throw err;

                                res.json({ notification: "Document Uploaded Successfully" });

                            });
                    }
                    else if (aadharFlg == "Y") {
                        pool.query("UPDATE E_DOCKET_TBL SET AADHAR_FLG = $1 WHERE EMP_ID = $2", [aadharFlg, empId],
                            function (err, done) {
                                if (err) throw err;

                                res.json({ notification: "Document Uploaded Successfully" });

                            });
                    }
                    else if (sslcFlg == "Y") {
                        pool.query("UPDATE E_DOCKET_TBL SET SSLC_FLG = $1 WHERE EMP_ID = $2", [sslcFlg, empId],
                            function (err, done) {
                                if (err) throw err;

                                res.json({ notification: "Document Uploaded Successfully" });

                            });
                    }
                    else if (preunivFlg == "Y") {
                        pool.query("UPDATE E_DOCKET_TBL SET PREUNIV_FLG = $1 WHERE EMP_ID = $2", [preunivFlg, empId],
                            function (err, done) {
                                if (err) throw err;

                                res.json({ notification: "Document Uploaded Successfully" });

                            });
                    }
                    else if (degreeFlg == "Y") {
                        pool.query("UPDATE E_DOCKET_TBL SET DEGREE_FLG = $1 WHERE EMP_ID = $2", [degreeFlg, empId],
                            function (err, done) {
                                if (err) throw err;

                                res.json({ notification: " Document Uploaded Successfully" });

                            });
                    }
                    else {

                        res.json({ notification: " Document Uploaded Successfully" });
                    }
                });

        }


    });

    console.log(">>>> 3");
    var oldName = "doc.pdf";
    var dir1 = './data/CMS/employee/uploadDoc/' + eid + "/";;
    var oldPath = dir1 + oldName;
    if (!fs.existsSync(dir1)) {
        fs.mkdirSync(dir1);
    }
    var storage = multer.diskStorage({
        destination: function (req, file, callback) {
            console.log(file);
            callback(null, dir1)
        },
        filename: function (req, file, callback) {
            callback(null, oldName)
        }
    })

    var upload = multer({ storage: storage }).single('uploadDoc')
    upload(req, res, function (err) {
        if (err) {
            return res.end("Something went wrong!");
        }
    });




}

/////////////////////////////////////////// Approve /////////////////////////////////////////

router.get('/cmsApprIndvAdmin', cmsApprIndvAdmin);
function cmsApprIndvAdmin(req, res) {

    console.log("approve entered");
    panFlg = "N", aadharFlg = "N", sslcFlg = "N", preunivFlg = "N", degreeFlg = "N";

    var empId = req.query.empId;
    var doc = req.query.doc;

    var caseInp1 = doc?.length - 7;

    // var name = doc.substring(0, caseInp1);
    var dir1 = './data/CMS/employee/uploadDoc/' + empId + "/";
    var oldPath = dir1 + doc;
    var resValue = doc ? doc.search("PHOTO") : -1;

    console.log("empid-->" + empId);
    console.log("doc-->" + doc);
    console.log("caseInp-->" + caseInp1);
    console.log("oldPath-->" + oldPath);
    console.log("resValue-->" + resValue);

    if (doc && doc.length > 7) {
        var name = doc.substring(0, caseInp1);

        if (resValue != -1) {
            var newName = empId + ".jpg";
            var dir2 = './data/CMS/employee/uploadDoc/';
        }
        else {
            var resValue1 = name ? name.search("RESUME") : -1;
            if (resValue1 != -1) {
                var newName = name + ".doc";
            }
            else {
                var newName = name + ".pdf";
                var apprPattern = name ? name.search("GOVT_PANCARD") : -1;
                if (apprPattern != -1) {
                    panFlg = "Y";
                }
                var apprPattern = name.search("GOVT_AADHAR");
                if (apprPattern != -1) {
                    aadharFlg = "Y";
                }
                var apprPattern = name.search("EDUC_SSLC");
                if (apprPattern != -1) {
                    sslcFlg = "Y";
                }
                var apprPattern = name.search("EDUC_PRE_UNIV");
                if (apprPattern != -1) {
                    preunivFlg = "Y";
                }
                var apprPattern = name.search("EDUC_DEGREE");
                if (apprPattern != -1) {
                    degreeFlg = "Y";
                }
                var apprPattern = name.search("PHOTO");
                if (apprPattern != -1) {

                }
            }
            var dir2 = './data/CMS/employee/uploadDoc/' + empId + "/";
        }
    }
    var newPath = dir2 + newName;

    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error while moving the file" });
        }

        else if (panFlg == "Y") {
            pool.query("UPDATE E_DOCKET_TBL SET PAN_FLG = $1 WHERE EMP_ID = $2", [panFlg, empId],
                function (err, done) {
                    if (err) throw err;
                    res.json({
                        notification: "Documents Approved Successfully"
                    })
                });
        }
        else if (aadharFlg == "Y") {
            pool.query("UPDATE E_DOCKET_TBL SET AADHAR_FLG = $1 WHERE EMP_ID = $2", [aadharFlg, empId],
                function (err, done) {
                    if (err) throw err;
                    res.json({
                        notification: "Documents Approved Successfully"
                    })
                });

        }
        else if (sslcFlg == "Y") {
            pool.query("UPDATE E_DOCKET_TBL SET SSLC_FLG = $1 WHERE EMP_ID = $2", [sslcFlg, empId],
                function (err, done) {
                    if (err) throw err;
                    res.json({
                        notification: "Documents Approved Successfully"
                    })
                });

        }
        else if (preunivFlg == "Y") {
            pool.query("UPDATE E_DOCKET_TBL SET PREUNIV_FLG = $1 WHERE EMP_ID = $2", [preunivFlg, empId],
                function (err, done) {
                    if (err) throw err;
                    res.json({
                        notification: "Documents Approved Successfully"
                    })
                });

        }
        else if (degreeFlg == "Y") {
            pool.query("UPDATE E_DOCKET_TBL SET DEGREE_FLG = $1 WHERE EMP_ID = $2", [degreeFlg, empId],
                function (err, done) {
                    if (err) throw err;
                    res.json({
                        notification: "Documents Approved Successfully"
                    })
                });

        }
        else {
            res.json({
                notification: "Documents Approved Successfully"
            })
        }
    });
}

///////////////////////////////////////////Reject //////////////////////////////////////////

router.get('/cmsApprRejectAdmin', cmsApprRejectAdmin);

function cmsApprRejectAdmin(req, res) {
    console.log("reject entered");

    var empId = req.query.empId;
    var doc = req.query.doc;
    var reas = req.query.reas;
    console.log("empid-->" + empId);
    console.log("doc-->" + doc);
    console.log("reas-->" + reas);

    var dirRej = './data/CMS/employee/rejectDoc/' + empId + "/";
    if (!fs.existsSync(dirRej)) {
        fs.mkdirSync(dirRej, { recursive: true });
    }

    var caseInp1 = doc.length - 7;
    console.log("caseInp1", caseInp1);
    var name = doc.substring(0, caseInp1);

    var resValue = name.search("PHOTO");
    if (resValue !== -1) {
        var newName = name + "_rj.jpg";
    } else {
        var resValue1 = name.search("RESUME");
        if (resValue1 !== -1) {
            var newName = name + "_rj.doc";
        } else {
            var newName = name + "_rj.pdf";
        }
    }

    var newPath = dirRej + newName;

    var dirReas = './data/CMS/employee/rejectReason/' + empId + "/";
    if (!fs.existsSync(dirReas)) {
        fs.mkdirSync(dirReas, { recursive: true });
    }
    var reastxt = name + "_rj.txt";
    var reasNewfile = dirReas + reastxt;

    var dirOld = './data/CMS/employee/uploadDoc/' + empId + "/";
    var oldPath = dirOld + doc;

    fs.rename(oldPath, newPath, function (err) {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Error while moving the file" });
        }

        fs.writeFile(reasNewfile, reas, function (err) {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: "Error while writing reject reason" });
            }

            len = 0;
            var testFolder = './data/CMS/employee/uploadDoc/' + empId + "/";
            fs.readdirSync(testFolder).forEach(
                function (name) {
                    var resValue = name.search("uv");
                    if (resValue != -1) {
                        docs[len] = name;
                        cpath[len] = testFolder + name;
                        len = len + 1;
                    }
                });
            res.json({
                notification: "Document Rejected Successfully"
            });
        });
    });
    // } else {
    //     res.json({
    //         message: "redirect to admin "
    //     });
    // }
}




//////////////////////////////////////--->    Ploicy  <<--///////////////////////////////////////////////////////


////////////////////////  Upload Policy  /////////////////////////////////////
router.get('/policyUploadAdmin', function (req, res) {
 
        pool.query("SELECT  COMM_CODE_ID,COMM_CODE_DESC FROM COMMON_CODE_TBL WHERE CODE_ID = 'POL'  ORDER BY COMM_CODE_ID ASC", function (err, result) {
            policyTag = result.rows;
            policy_count = result.rowCount;

            res.json({
          data:{
                policyTag: policyTag,
                policy_count: policy_count
          }
            });
        });
    }
);



router.post('/policyUploadPostAdmin', policyUploadPostAdmin);
function policyUploadPostAdmin(req, res) {

    const form = new formidable.IncomingForm();
    console.log("Entred to ADMIN post");
    form.parse(req, function (err, fields, files) {
        // console.log("req", req);

        policyTag = req.body.policyTag;

        console.log("policytag--->", policyTag);

        policyTag = policyTag.replace(/ /g, '_').toUpperCase();

        var docName = req.body.docName;
        // var docName = fields["docName"];
        console.log("docname--->", docName);

        docName = docName.replace(/ /g, '_').toUpperCase();
        var dir2 = './data/CMS/policy/uploadDoc/';
        if (!fs.existsSync(dir2)) {
            fs.mkdirSync(dir2);
        }
        var d = new Date();
        d = moment(d).format('YYYY-MM-DD:hh-mm:a');
        d = d.replace(/:/g, '_').toUpperCase();
        var newName = policyTag + "_" + docName + "_" + d + ".pdf";
        var newPath = dir2 + newName;

        /*	fs.readdirSync(dir2).forEach(
            function (name)
            {
                if(name == newName)
                {
                    req.flash('error',"File already exists with same name")
                    res.redirect(req.get('referer'));
                }
            });*/

        fs.rename(oldPath, newPath,
            function (err) {
                if (err) throw err;
                res.json({
                    notification: "Documents upload Successfully"
                })

            });
    });

    var oldName = "doc.pdf"
    var dirOld = './data/CMS/policy/temp/';
    var oldPath = dirOld + oldName;
    if (!fs.existsSync(dirOld)) {
        fs.mkdirSync(dirOld);
    }

    var storage = multer.diskStorage({
        destination: function (req, file, callback) {
            console.log(file);
            callback(null, dirOld)
        },
        filename: function (req, file, callback) {
            callback(null, oldName)
        }
    })
    var upload = multer({ storage: storage }).single('uploadDoc')
    upload(req, res, function (err) {
        if (err) {
            return res.end("Something went wrong!");
        }
    });
}








//            ↓↓↓↓    Policy View and Delete Done by Jadav below↓    ↓↓↓↓




//////////////////////////////////////--->    Magazine  <<--///////////////////////////////////////////////////////


/////////////////////// Upload Magazine  //////////////////////////////////////


router.get('/magazineUploadAdmin', function (req, res) {
    var eid = req.query.user_id;
    var ename = req.query.user_name;
    var emp_access = req.query.user_type;
    if (emp_access == "A1") {
        res.json(
            {
                ename: ename,
                eid: eid,
                emp_access: emp_access
            }
        );
    }
    else {
        res.json('redirect to Admin-dashboard');
    }
});


router.post('/magazineUploadPostAdmin', magazineUploadPostAdmin);
function magazineUploadPostAdmin(req, res) {
    var form = new formidable.IncomingForm();
    console.log("enter magazine");
    form.parse(req, function (err, fields, files) {
        // console.log("req-->",req);

        var magYear = req.body.magYear;
        var magQuarter = req.body.magQuarter;

        var dir2 = './data/CMS/magazine/uploadDoc/' + magYear + '/';

        console.log("dir2-->", dir2);

        if (!fs.existsSync(dir2)) {
            fs.mkdirSync(dir2);
        }
        var newName = "laCarta" + "_" + magYear + "_" + magQuarter + ".pdf";

        var newPath = dir2 + newName;

        console.log("newName-->", newName);
        fs.rename(oldPath, newPath,
            function (err) {
                if (err) throw err;
                res.json({ notification: "Document Uploaded Successfully" })
            });
    });

    console.log("newName-->", newName);
    fs.rename(oldPath, newPath,
        function (err) {
            if (err) throw err;
            res.json({ notification: "Document Uploaded Successfully" })
        });

    console.log("enterd to create floder");

    var oldName = "doc.pdf"
    var dirOld = './data/CMS/magazine/temp/';
    console.log("dirOld-->", dirOld);
    var oldPath = dirOld + oldName;
    console.log("oldpath-->", oldPath);
    if (!fs.existsSync(dirOld)) {
        fs.mkdirSync(dirOld);
    }

    var oldName = "doc.pdf"
    var dirOld = './data/CMS/magazine/temp/';
    console.log("dirOld-->", dirOld);
    var oldPath = dirOld + oldName;
    console.log("oldpath-->", oldPath);
    if (!fs.existsSync(dirOld)) {
        fs.mkdirSync(dirOld);
    }

    var storage = multer.diskStorage({
        destination: function (req, file, callback) {
            console.log(file);
            callback(null, dirOld)
        },
        filename: function (req, file, callback) {
            callback(null, oldName)
        }
    })
    var upload = multer({ storage: storage }).single('uploadDoc')
    upload(req, res, function (err) {
        if (err) {
            return res.end("Something went wrong!");
        }
    });
}



/////////////////////// view Magazine  //////////////////////////////////////

router.get('/magazineViewAdmin', magazineViewAdmin);
function magazineViewAdmin(req, res) {

    console.log("view magazine entered");
    totYear = 0;
    len2 = 0;
    totLen = 0;
    i = 0;
    var eid = req.query.user_id;
    var ename = req.query.user_name;
    var emp_access = req.query.user_type;


    var testFolder = './data/CMS/magazine/uploadDoc/';
    fs.readdirSync(testFolder).forEach(function (magYear) {
        magzYear[totYear] = magYear;
        len2 = 0;
        var testFolder1 = './data/CMS/magazine/uploadDoc/' + magYear + '/';
        fs.readdirSync(testFolder1).forEach(function (magDoc) {
            magzDoc[totLen] = magDoc;
            var resultDoc = magDoc.search("Q1");
            if (resultDoc != -1) {
                magzQtr[totLen] = "Q1";
            }
            resultDoc = magDoc.search("Q2");
            if (resultDoc != -1) {
                magzQtr[totLen] = "Q2";
            }
            resultDoc = magDoc.search("Q3");
            if (resultDoc != -1) {
                magzQtr[totLen] = "Q3";
            }
            resultDoc = magDoc.search("Q4");
            if (resultDoc != -1) {
                magzQtr[totLen] = "Q4";
            }
            len2 = len2 + 1;
            totLen = totLen + 1;
        });

        magzTot[totYear] = len2;
        totYear = totYear + 1;
    });

    res.json(
        {
            data: {
                magzDoc: magzDoc,
                magzYear: magzYear,
                ename: ename,
                eid: eid,
                emp_access: emp_access
            }
        });



}


router.get('/magazineViewFilesAdmin', magazineViewFilesAdmin);
function magazineViewFilesAdmin(req, res) {
    console.log("view Magazine entered");

    var yr = req.query.yr;
    var magdoc = req.query.magdoc;
    var magFolder = './data/CMS/magazine/uploadDoc/' + yr + '/';
    var magfile = magFolder + magdoc;
    fs.readFile(magfile,
        function (err, file) {
            //res.setHeader('Content-disposition', 'attachment; filename=' + magfile);
            //res.download(magfile);

            res.writeHead(200, { "Content-Type": "application/pdf" });
            res.write(file, "binary");
            res.end();
        });
}





// <===============================  Jadhav ===============================>>



///////////////// Modify Profile Photo ////////////////////

router.post('/cmsUploadPhotoEmployee', cmsUploadPhotoEmployee);
function cmsUploadPhotoEmployee(req, res) {
    console.log("Profile API Entry");

    doc = "";
    var eid = "";

    var form = new formidable.IncomingForm();
    form.parse(req,
        function (err, fields, files) {
            // console.log("Req----> ", req);
            var emp_id = req.body.user_id;
            console.log("2222222222222222:- " + emp_id);
            eid = emp_id;

            var dir2 = './cmsModule/public/images/profile/';
            newName = eid + ".jpg";
            var newPath = dir2 + newName;

            fs.rename(oldPath, newPath,
                function (err) {
                    if (err) throw err;
                    console.log("Profile Pic Renamed Successfully");
                    res.json({ notification: "Profile Photo Uploaded Successfully" })
                });
        });

    console.log("check", eid);

    var oldName = "doc.jpg";
    var dir1 = './data/CMS/employee/uploadDoc/' + eid + "/";;
    var oldPath = dir1 + oldName;
    if (!fs.existsSync(dir1)) {
        fs.mkdirSync(dir1);
    }
    var storage = multer.diskStorage({
        destination: function (req, file, callback) {
            console.log(file);
            callback(null, dir1)
        },
        filename: function (req, file, callback) {
            callback(null, oldName)
        }
    })

    var upload = multer({ storage: storage }).single('file')
    upload(req, res, function (err) {
        if (err) {
            return res.end("Something went wrong!");
        }
    });
}

//////////////  Profile photo Api..........

router.get('/profile-photo/:eid', (req, res) => {
    const eid = req.params.eid;
    const photoPath = path.join(__dirname, `./public/images/profile/${eid}.jpg`);
    res.sendFile(photoPath);
    console.log("Choosing the loc:---> " + photoPath);
});

//////////////////////////////////////////////////////////////////////////////////////////////////////////





//------------------------    Employee pending Doc View  ----------------------


router.get('/cmsPenViewSts', cmsStatusView);
function cmsStatusView(req, res) {

    var eid = req.query.user_id;
    console.log("CMS API ID:- " + eid);


    // if (emp_access != "A1") {
    var govDocs = [], eduDocs = [], medDocs = [], expDocs = [], phDocs = [], resDocs = [], hrDocs = [], cerDocs = [], othrDocs = [], bgDocs = [], polDocs = [];
    var govLen = 0, eduLen = 0, medLen = 0, expLen = 0, phLen = 0, resLen = 0, hrLen = 0, cerLen = 0, othrLen = 0, bgLen = 0, polLen = 0, policy_count = 0;

    var resValue1;

    var testFolder = './data/CMS/employee/uploadDoc/' + eid + "/";
    if (!fs.existsSync(testFolder)) {
        res.json({ notification: "No records found" })
    }
    else {
        fs.readdirSync(testFolder).forEach(
            function (name) {
                console.log(name);
                var resValue = name.search("uv");
                // console.log("resValue sir: " + resValue);

                // var resValue = '-1';
                // console.log("resValue Mine: " + resValue);

                if (resValue != -1) {

                    resValue1 = name.search("GOVT");
                    // console.log("GOVT resValue1 sir:- " + resValue1);
                    // resValue1 = '2';
                    // console.log("GOVT resValue1:- "+resValue1);
                    if (resValue1 != -1) {
                        govDocs[govLen] = name;
                        govLen = govLen + 1;
                    }


                    resValue1 = name.search("EDUC");
                    if (resValue1 != -1) {
                        eduDocs[eduLen] = name;
                        eduLen = eduLen + 1;
                    }


                    resValue1 = name.search("MEDICAL");
                    if (resValue1 != -1) {
                        medDocs[medLen] = name;
                        medLen = medLen + 1;
                    }

                    resValue1 = name.search("EXPERIENCE");
                    if (resValue1 != -1) {
                        expDocs[expLen] = name;
                        expLen = expLen + 1;
                    }

                    resValue1 = name.search("PHOTO");
                    if (resValue1 != -1) {
                        phDocs[phLen] = name;
                        phLen = phLen + 1;
                    }

                    resValue1 = name.search("RESUME");
                    if (resValue1 != -1) {
                        resDocs[resLen] = name;
                        resLen = resLen + 1;
                    }
                    resValue1 = name.search("_HR");
                    if (resValue1 != -1) {
                        hrDocs[hrLen] = name;
                        hrLen = hrLen + 1;
                    }
                    resValue1 = name.search("CERT");
                    if (resValue1 != -1) {
                        cerDocs[cerLen] = name;
                        cerLen = cerLen + 1;
                    }
                    resValue1 = name.search("BACKGROUND");
                    if (resValue1 != -1) {
                        bgDocs[bgLen] = name;
                        bgLen = bgLen + 1;
                    }
                    resValue1 = name.search("OTHR");
                    if (resValue1 != -1) {
                        othrDocs[othrLen] = name;
                        othrLen = othrLen + 1;
                    }
                }

            });


        res.json({


            govDocs: govDocs, govLen: govLen,
            eduDocs: eduDocs, eduLen: eduLen,
            medDocs: medDocs, medLen: medLen,
            expDocs: expDocs, expLen: expLen,
            phDocs: phDocs, phLen: phLen,
            resDocs: resDocs, resLen: resLen,
            othrDocs: othrDocs, othrLen: othrLen,
            hrDocs: hrDocs, hrLen: hrLen,
            cerDocs: cerDocs, cerLen: cerLen,
            bgDocs: bgDocs, bgLen: bgLen,

            eid: eid,

        });
    }
    // }

    // else {
    //     res.json({ notification: "Redirect to Admin Dashboard" });
    // }
}

//------------------------    Employee Rejected Doc View  ----------------------


router.get('/cmsRejViewSts', cmsrejView);
function cmsrejView(req, res) {

    var eid = req.query.user_id;
    console.log("CMS Rej API ID:- " + eid + " \n");


    var rdocs = [];
    var rpath = [];
    var rreas = [];
    var rlen = 0;


    var rFolder = './data/CMS/employee/rejectDoc/' + eid + "/";
    if (!fs.existsSync(rFolder)) {
        console.log('No records found for rejection');
    }
    else {
        fs.readdirSync(rFolder).forEach(
            function (name) {
                console.log(name);
                var resValue = name.search("rj");
                if (resValue != -1) {
                    rdocs[rlen] = name;
                    rpath[rlen] = rFolder + name;
                    var chklen = name.length - 3;
                    var txtfile = name.substring(0, chklen);
                    txtfile = './data/CMS/employee/rejectReason/' + eid + "/" + txtfile + "txt";
                    var dataContent = fs.readFileSync(txtfile, 'utf8');
                    rreas[rlen] = dataContent;
                    rlen = rlen + 1;
                }
            });
    }

    res.json({
        rdocs: rdocs, rpath: rpath, rlen: rlen, rreas: rreas,
        eid: eid,
    });
}

//------------------------    Employee Doc View  ----------------------

router.get('/cmsViewEmployee', cmsViewEmployee);
function cmsViewEmployee(req, res) {

    var eid = req.query.user_id;
    console.log("CMS API ID:- " + eid);


    // if (emp_access != "A1") {
    var govDocs = [], eduDocs = [], medDocs = [], expDocs = [], phDocs = [], resDocs = [], hrDocs = [], cerDocs = [], othrDocs = [], bgDocs = [], polDocs = [];
    var govLen = 0, eduLen = 0, medLen = 0, expLen = 0, phLen = 0, resLen = 0, hrLen = 0, cerLen = 0, othrLen = 0, bgLen = 0, polLen = 0, policy_count = 0;

    var resValue1;

    var testFolder = './data/CMS/employee/uploadDoc/' + eid + "/";
    if (!fs.existsSync(testFolder)) {
        res.json({ notification: "No records found" })
    }
    else {
        fs.readdirSync(testFolder).forEach(
            function (name) {
                console.log(name);

                // var resValue = name.search("uv");
                // console.log("resValue sir: " + resValue);

                // var resValue = '-1';
                // console.log("resValue Mine: " + resValue);

                // if (resValue != -1) {

                resValue1 = name.search("GOVT");
                // console.log("GOVT resValue1 sir:- " + resValue1);
                // resValue1 = '2';
                // console.log("GOVT resValue1:- "+resValue1);
                if (resValue1 != -1) {
                    govDocs[govLen] = name;
                    govLen = govLen + 1;
                }


                resValue1 = name.search("EDUC");
                if (resValue1 != -1) {
                    eduDocs[eduLen] = name;
                    eduLen = eduLen + 1;
                }


                resValue1 = name.search("MEDICAL");
                if (resValue1 != -1) {
                    medDocs[medLen] = name;
                    medLen = medLen + 1;
                }

                resValue1 = name.search("EXPERIENCE");
                if (resValue1 != -1) {
                    expDocs[expLen] = name;
                    expLen = expLen + 1;
                }

                resValue1 = name.search("PHOTO");
                if (resValue1 != -1) {
                    phDocs[phLen] = name;
                    phLen = phLen + 1;
                }

                resValue1 = name.search("RESUME");
                if (resValue1 != -1) {
                    resDocs[resLen] = name;
                    resLen = resLen + 1;
                }
                resValue1 = name.search("_HR");
                if (resValue1 != -1) {
                    hrDocs[hrLen] = name;
                    hrLen = hrLen + 1;
                }
                resValue1 = name.search("CERT");
                if (resValue1 != -1) {
                    cerDocs[cerLen] = name;
                    cerLen = cerLen + 1;
                }
                resValue1 = name.search("BACKGROUND");
                if (resValue1 != -1) {
                    bgDocs[bgLen] = name;
                    bgLen = bgLen + 1;
                }
                resValue1 = name.search("OTHR");
                if (resValue1 != -1) {
                    othrDocs[othrLen] = name;
                    othrLen = othrLen + 1;
                }
                // }

            });


        res.json({


            govDocs: govDocs, govLen: govLen,
            eduDocs: eduDocs, eduLen: eduLen,
            medDocs: medDocs, medLen: medLen,
            expDocs: expDocs, expLen: expLen,
            phDocs: phDocs, phLen: phLen,
            resDocs: resDocs, resLen: resLen,
            othrDocs: othrDocs, othrLen: othrLen,
            hrDocs: hrDocs, hrLen: hrLen,
            cerDocs: cerDocs, cerLen: cerLen,
            bgDocs: bgDocs, bgLen: bgLen,

            eid: eid

        });
    }
    // }

    // else {
    //     res.json({ notification: "Redirect to Admin Dashboard" });
    // }
}


// -----------------------   Employee Doc Download  ----------------------
// Assuming your files are stored in the 'uploadDoc' directory
const uploadDir = path.join(__dirname, '..', 'data', 'CMS', 'employee', 'uploadDoc');
router.get('/downloadFile', (req, res) => {
    const docId = req.query.id;
    console.log(docId);
    const empId = req.query.empId;
    console.log(empId);

    // Check if the file exists
    const filePath = path.join(uploadDir, empId, docId);
    console.log(filePath);

    if (!fs.existsSync(filePath)) {
        return res.status(404).send('File not found');
    }

    // Determine the content type based on the file extension
    const ext = path.extname(filePath).toLowerCase();
    let contentType = 'application/octet-stream'; 
    if (ext === '.pdf') {
        contentType = 'application/pdf';
    } else if (ext === '.jpg' || ext === '.jpeg') {
        contentType = 'image/jpeg';
    } else if (ext === '.png') {
        contentType = 'image/png';
    }

    // Set the content disposition header to force the browser to download the file
    res.setHeader('Content-disposition', `attachment; filename=${docId}`);
    res.setHeader('Content-type', contentType);

    // Stream the file to the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

});


// -----------------------  Employee Doc Email   -----------------------------
router.get('/cmsMailDoc', cmsMailDoc);
function cmsMailDoc(req, res) {
    var docmnt = req.query.id;
    console.log(docmnt);
    var empId = req.query.empId;
    console.log(empId);
    var emp_access = req.query.empAccess;
    console.log(emp_access);

    if (emp_access != "A1") {
        // var docPath = __dirname + 'data/CMS/employee/uploadDoc/' + empId + '/' + docmnt;
        // var docPath = path.join(__dirname, '..', 'data', 'CMS', 'employee', 'uploadDoc', empId, docmnt);

        console.log("Entered Mail Api");
        pool.query("SELECT emp_email, emp_name FROM emp_master_tbl where emp_id = $1 ", [empId],
            function (err, maildata) {
                if (err) {
                    console.error('Error with table query', err);
                }
                else {
                    rowData = maildata.rows;
                    mailId = rowData[0].emp_email;
                    console.log("Employee email: " + mailId);
                    var ename = rowData[0].emp_name;
                    console.log("Employee Name: " + ename);
                }

                pool.query("SELECT comm_code_desc from common_code_tbl where code_id='EMAL' and comm_code_id='INFO'", function (err, cmpyMailList) {
                    if (err) {
                        console.error('Error with table query', err);
                    }
                    else {
                        console.log(" pick Company Email");
                        var cmpyEmail = cmpyMailList.rows['0'].comm_code_desc;
                        console.log('Company Email: ', cmpyEmail);
                    }



                    console.log("Ready to send mail");
                    const transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: 'mohammadsab@minorks.com',
                            pass: '9591788719'
                        }
                    });


                    var mailOptions = {
                        from: cmpyEmail,
                        to: mailId,
                        subject: 'Amber - E-Docket Employee Document',
                        html: '<img src="https://ddvqhbgjmdkmq.cloudfront.net/wp-content/uploads/sites/2/2016/02/12000453/document_version.png" height="85"><br><br>' +
                            '<h3>Dear ' + ename + '<br><br>' +
                            '<p>As requested, we are mailing your document available in E-Docket.</p>' +
                            '<table style="border: 10px solid black;"> ' +
                            '<tr style="border: 10px solid black;"> ' +
                            '<th style="border: 10px solid black;">Document Name</th> ' +
                            '<th style="border: 10px solid black;">' + docmnt + '</th>' +
                            '</tr>' +
                            '</table> ' +
                            '<br><br>' +
                            'If you have not requested for the document, Kindly contact admin for any concerns.<br><br>' +
                            'URL: http://amber.nurture.co.in <br><br><br>' +
                            '- Regards,<br><br>Amber</h3>',

                        // attachments: [
                        //     {
                        //         fileName: docmnt,
                        //         filePath: docPath
                        //     }
                        // ]
                        attachments: [
                            {
                                filename: docmnt,
                                content: fs.createReadStream(`./data/CMS/employee/uploadDoc/${empId}/${docmnt}`), // Path to the attachment
                            },
                        ]
                    };


                    console.log(mailOptions, "mailll");

                    transporter.sendMail(mailOptions, function (error, info) {
                        if (error) {
                            console.error('Error sending email', error);
                        } else {
                            console.log('Email sent:', info.response);
                        }
                    });

                    res.json({ message: "Mail Sent Successfully" })
                });
            });

    }
    else {
        res.json({ notification: "Redirect to Admin Dashboard" });
    }
}



// -----------------------   Pen Doc Delete   -----------------------------
router.delete('/cmsDeletePenDocEmployee', cmsDeletePenDocEmployee);
function cmsDeletePenDocEmployee(req, res) {
    const empId = req.query.empId;
    const doc = req.query.doc;

    const rejFile = `./data/CMS/employee/uploadDoc/${empId}/${doc}`;

    if (fs.existsSync(rejFile)) {
        fs.unlinkSync(rejFile);
        res.json({ message: 'success', status: 'Document Deleted Successfully' });
    } else {
        res.status(404).json({ message: 'File not found', status: 'failure' });
    }
}


// -----------------------   Rej Doc Delete   -----------------------------
router.delete('/cmsDeleteRejDocEmployee', cmsDeleteRejDocEmployee);
function cmsDeleteRejDocEmployee(req, res) {
    const empId = req.query.empId;
    const doc = req.query.doc;


    var caseInp1 = doc.length - 3;
    var name = doc.substring(0, caseInp1);

    var rejFile = './data/CMS/employee/rejectDoc/' + empId + "/" + doc;
    var rejReasFile = './data/CMS/employee/rejectReason/' + empId + "/" + name + "txt";

    if (fs.existsSync(rejFile)) {
        fs.unlinkSync(rejFile);
        fs.unlinkSync(rejReasFile);

        res.json({ message: 'success', status: 'Document Deleted Successfully' });
    } else {
        res.status(404).json({ message: 'File not found', status: 'failure' });
    }
}








//                   ↓↑↓↑↓↑↓↑       Policy Continue here...    ↓↑↓↑↓↑↓↑ 


// -----------------------   Policy  View   -----------------------------

router.get('/policyDocsView', policyDocsView);

function policyDocsView(req, res) {
    var polDocs = []
    var policyTag = "";
    var polLen = 0

    policyTag = req.query.policyTag;
    console.log("policyTag: " + policyTag);

    if (policyTag == null || policyTag == "") {
        policyTag = "ALL";
    }
    var policyTag1 = policyTag.replace(/ /g, '_').toUpperCase();
    polLen = 0;

    var polFolder = './data/CMS/policy/uploadDoc/';
    if (!fs.existsSync(polFolder)) {
        req.flash('error', "No records found")
        res.redirect(req.get('referer'));
    }
    else {
        fs.readdirSync(polFolder).forEach(
            function (name) {
                if (policyTag == "ALL") {
                    polDocs[polLen] = name;
                    polLen = polLen + 1;
                }
                else {
                    var resultDoc = name.search(policyTag1);
                    if (resultDoc != -1) {
                        polDocs[polLen] = name;
                        polLen = polLen + 1;
                    }
                }
            });
    }
    // pdbconnect.query("SELECT COMM_CODE_DESC FROM COMMON_CODE_TBL WHERE CODE_ID = 'POL'  ORDER BY COMM_CODE_ID ASC", function (err, result) {
    //     policy = result.rows;
    //     policy_count = result.rowCount;

    res.json({
        polDocs: polDocs, polLen: polLen, policyTag: policyTag,
        // policy: policy, policy_count: policy_count,
        // eid: eid,
    });
    // });
}




// -----------------------   Policy  Download   -----------------------------

router.get('/policyDownload', policyDownLoadAll);
function policyDownLoadAll(req, res) {
    console.log("Entered Download Pol Api");

    var id = req.query.doc;
    console.log("Docs: " + id);

    // Extract the first part of the filename before the first "__"
    var firstPart = id.split('__')[0];

    var polFolder = './data/CMS/policy/uploadDoc/';
    var file1 = polFolder + id;
    let contentType = 'application/octet-stream';

    res.setHeader('Content-disposition', 'attachment; filename=' + firstPart + '.pdf');
    res.setHeader('Content-type', contentType);

    const fileStream = fs.createReadStream(file1);
    fileStream.pipe(res);
}



// -----------------------   Policy  Delete   -----------------------------

router.delete('/policyDeleteDocs', policyDeleteDocs);
function policyDeleteDocs(req, res) {
    console.log("Entered into delete Pol Api");
    var doc = req.query.doc;
    var delFile = './data/CMS/policy/uploadDoc/' + doc;

    if (fs.existsSync(delFile)) {
        fs.unlinkSync(delFile);
        res.json({ message: 'success', status: 'Document Deleted Successfully' });
    } else {
        res.status(404).json({ message: 'File not found', status: 'failure' });
    }

}




module.exports = router;