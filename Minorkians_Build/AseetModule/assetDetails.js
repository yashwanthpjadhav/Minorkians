console.log('Asset entered');

const express = require('express');
var router = express.Router();
var pool = require('../Database/dbconfig');

////////////////////////////////////////////////////////////
router.post('/additasset', additasset);
router.get('/removeAsset/:asset_id', removeAsset);

///////////////////////////////////COCD////////////////////////////////////////////

router.get('/cocd', function (req, res) {
  pool.query("SELECT  COMM_CODE_ID,COMM_CODE_DESC FROM COMMON_CODE_TBL WHERE CODE_ID = 'IT'  ORDER BY COMM_CODE_ID ASC", function (err, result) {
      product = result.rows;

          res.json({
              data: {
                  product: product,
      
              }
          });
      });     
  }
  );
  
////////////////////////////////////////////////add it asset/////////////////////////////


function additasset(req, res) {

  console.log("inside asset post");
  var now = new Date();
  var rcre_user_id = "ADMIN";
  var rcre_time = now;
  var lchg_user_id = "ADMIN";
  var lchg_time = now;
  var code = "";
  var code1 = "";
  var code2 = "";
  var seq = "";
  var product = req.body.product;
  if (product == "Laptop") { code = "SYS"; }
  if (product == "Desktop") { code = "SYS"; }
  if (product == "Datacard") { code = "DAC"; }
  if (product == "Server") { code = "SER"; }
  if (product == "Others") { code = "OTH"; }
  var asset_id = "NR-" + code + "-"
  var product = req.body.product;
  var make = req.body.make;
  var model = req.body.model;
  var serial_no = req.body.serial_no;
  var host_name = req.body.host_name;
  var os = req.body.os;
  var os_type = req.body.os_type;
  var software = req.body.software;
  var ram = req.body.ram;
  var processor = req.body.processor;
  var hard_disk = req.body.hard_disk;
  var accessories = req.body.accessories;
  var window_product_key = req.body.window_product_key;
  var ip_addr = req.body.ip_addr;

  console.log("product", product);
  console.log("code", code);
  console.log("assetid", asset_id);

  if (code == "SYS") { seq = "asset_sys"; }
  if (code == "DAC") { seq = "asset_dac"; }
  if (code == "SER") { seq = "asset_ser"; }
  if (code == "OTH") { seq = "asset_oth"; }


  pool.query("SELECT $1 || lpad(nextval($2)::text, '4', '0') AS code1", [asset_id, seq], function (err, result) {

    if (err) throw err;

    var code1 = result.rows[0].code1;
    console.log("select done");
    console.log("code1", code1);



    pool.query("INSERT INTO asset_it_master_tbl(asset_id,product,make,model,serial_no,host_name,os,os_type,software,ram,processor,hard_disk,accessories,window_product_key,ip_addr,del_flg,app_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21)", [code1, product, make, model, serial_no, host_name, os, os_type, software, ram, processor, hard_disk, accessories, window_product_key, ip_addr, 'N', 'Y', rcre_user_id, rcre_time, lchg_user_id, lchg_time], function (err, done) {
      if (err) throw err;

      res.json({
        message: "redirect to view page",
        notification: "success Asset Details for Added Successfully"
      })

    });
  });

}


////////////////////////////view it asset/////////////////////////////////////////////




router.get('/assetViewDetails', function (req, res) {

  // var id = "";
  // var ptype = "";
  // var make = "";
  // var model = "";
  // var sno = "";
  // var hname = "";
  // var os = "";
  // var ost = "";
  // var sw = "";
  // var ram = "";
  // var procr = "";
  // var hrd = "";
  // var accs = "";
  // var wpkey = "";
  // var ipadd = "";


  // var emp_id = req.body.user_id;
  // var emp_access = req.body.user_type;
  // console.log(emp_access);
  // console.log(emp_id);

  // var my_id = req.body.user_id;
  // var my_name = req.body.user_name;

  pool.query("SELECT  * from asset_it_master_tbl where del_flg = 'N' order by serial_no asc", function (err, result) {

    if (err) {
      console.error('Error with table query', err);
    }
    else {
      var resultData = result.rows;
      console.log(resultData, '---------');

    }

    res.json({
      message: "redirect to viewItAsset",
      data: resultData

    });
  });
});






/////////////////////////////////////////////////  view it asset by id //////////////////////////////////////////////////////

router.get('/assetViewDetail', function (req, res) {
  var assetId = req.query.assetId;

  pool.query("SELECT * FROM asset_it_master_tbl WHERE asset_id = $1", [assetId], function (err, result) {
    if (err) {
      console.error('Error with table query', err);
      res.status(500).json({ error: 'An error occurred while fetching the data.' });
    } else {
      var assetData = result.rows[0];
      res.json({ data: assetData });
    }
  });
});

/////////////////////////////////////////////////modify It Asset//////////////////////////////////////////////////////

router.post('/assetmoddet', assetmoddet);
function assetmoddet(req, res) {

  console.log("modify");

  var now = new Date();
  var rcreuserid = "ADMIN";
  var rcretime = now;
  var lchg_user_id = "ADMIN";
  var lchg_time = now;
  var asset_id = req.body.asset_id;
  var ptype = req.body.ptype;
  var make = req.body.make;
  var model = req.body.model;
  var serial_no = req.body.serial_no;
  var host_name = req.body.host_name;
  var os = req.body.os;
  var os_type = req.body.os_type;
  var software = req.body.software;
  var ram = req.body.ram;
  var processor = req.body.procr;
  var hard_disk = req.body.hard_disk;
  var accessories = req.body.accessories;
  var window_product_key = req.body.window_product_key;
  var ip_addr = req.body.ip_addr;


  console.log("assetid", asset_id);

  pool.query("UPDATE asset_it_master_tbl set make=$1,model=$2,serial_no=$3,host_name=$4,os=$5,os_type=$6,software=$7,ram=$8,processor=$9,hard_disk=$10,accessories=$11,window_product_key=$12,ip_addr=$13,del_flg=$14,lchg_user_id=$15,lchg_time=$16 where asset_id =$17", [make, model, serial_no, host_name, os, os_type, software, ram, processor, hard_disk, accessories, window_product_key, ip_addr, 'N', lchg_user_id, lchg_time, asset_id], function (err, done) {

    if (err) throw err;

    res.json({
      message: "redirect to referer",
      notification: "Asset Details  Updated Successfully"
    });

    console.log("modify success");
  });

}



/////////////////////////////////////////// view Modify It asset //////////////////////////////////////////////////////



router.post('/assetmodView', assetmodView);

function assetmodView(req, res) {
  // console.log(req,"=============");

  // var asset_id = req.parms.asset_id;
  var asset_id = req.body.userinfo.asset_id;
  console.log(asset_id);
  var emp_id = req.query.user_id;
  var emp_access = req.query.user_type;
  var my_id = req.query.user_id;
  var my_name = req.query.user_name;

  pool.query("SELECT asset_id,product,make,model,serial_no,host_name,os,os_type,software,ram,processor,hard_disk,accessories,window_product_key,ip_addr from asset_it_master_tbl where upper(asset_id) = upper($1)", [asset_id], function (err, resultset) {
    // console.log(resultset, "result");

    if (err) throw err;

    // var asset_id = resultset.rows[0].asset_id;
    // console.log(asset_id, "==========");
    var rowdata = resultset.rows;
    // var product = rowdata[0].product;
    // console.log(product);
    var make = rowdata[0].make;
    console.log(make);
    var model = rowdata[0].model;
    var serial_no = rowdata[0].serial_no;
    var host_name = rowdata[0].host_name;
    var os = rowdata[0].os;
    var os_type = rowdata[0].os_type;
    var software = rowdata[0].software;
    var ram = rowdata[0].ram;
    var processor = rowdata[0].processor;
    var hard_disk = rowdata[0].hard_disk;
    var accessories = rowdata[0].accessories;
    var window_product_key = rowdata[0].window_product_key;
    var ip_addr = rowdata[0].ip_addr;


    console.log("make", make);
    console.log("serial_no", serial_no);
    console.log("asset_id", asset_id);


    // var make ;
    // var serial_no ;
    res.send({
      data: {

        // product: product,
        model: model,
        make: make,
        serial_no: make,
        host_name: host_name,
        os: os,
        os_type: os_type,
        software: software,
        ram: ram,
        processor: processor,
        hard_disk: hard_disk,
        accessories: accessories,
        window_product_key: window_product_key,
        ip_addr: ip_addr,
        emp_access: emp_access,
        my_name: my_name,
        my_id: my_id
      }
    })
  });

}

// //////////////////////////////////////////////////////////////////////////

router.get('/asset/:assetId', (req, res) => {
  const assetId = req.params.assetId;

  pool.query(
    'SELECT asset_id, product, make, model, serial_no, host_name, os, os_type, software, ram, processor, hard_disk, accessories, window_product_key, ip_addr FROM asset_it_master_tbl WHERE upper(asset_id) = upper($1)',
    [assetId],
    (err, result) => {
      if (err) {
        console.error('Error occurred while fetching asset details:', err);
        res.status(500).json({ error: 'An error occurred while fetching asset details' });
        return;
      }

      if (result.rows.length === 0) {
        res.status(404).json({ error: 'Asset not found' });
        return;
      }

      const assetDetails = result.rows[0];
      res.json({ data: assetDetails });
    }
  );
});

//////////////////////////////////////////delete it  asset id//////////////////////////////////////

router.get('/assetDelete/:asset_id', assetDelete);
function assetDelete(req, res) {

  var emp_id = req.body.user_id;
  var emp_access = req.body.user_type;

  var my_id = req.body.user_id;
  var my_name = req.body.user_name;

  var asset_id = req.params.asset_id;
  console.log("asset_id", asset_id);


  pool.query("UPDATE asset_it_master_tbl set del_flg = $1 where asset_id = $2 ", ['Y', asset_id], function (err, done) {
    if (err) {
      console.error('Error with table query', err);
    }
    else {

      //               console.log('111111111111111111111111111');
    }

    pool.query("SELECT * FROM asset_it_master_tbl where del_flg='N' ", function (err, result) {
      if (err) {
        console.error('Error with table query', err);
      }
      else {
        rowData = result.rows;
      }

      success = 'assetItDetails entry removed successfully';
      res.json({
        message: "redirect to viewAssetAlloc",
        data: {
          rowData: rowData,
          result: result
        }
      });
    })
  });

}


///////////////////////////////////////////////// add non it asset details //////////////////////////////////////////////////////



router.post('/assetnItasset', assetnItasset);

function assetnItasset(req, res) {
  var emp_id = req.body.user_id;
  var emp_access = req.body.user_type;
  var my_id = req.body.user_id;
  var my_name = req.body.user_name;
  console.log("inside non it asset post");
  var now = new Date();
  var rcreuserid = "ADMIN";
  var rcretime = now;
  var lchguserid = "ADMIN";
  var lchgtime = now;
  var code = "";
  var code1 = "";
  var code2 = "";
  var seq = "";
  //var assetid = req.body.assetid;
  var asset_nid = "NR-NONIT-"
  var particulr = req.body.particulr;
  var quant = req.body.quant;
  var rmks = req.body.rmks;
  console.log("quant", quant);
  console.log(req.particulr, '---------');
  var seq = "nitasset";


  pool.query("select $1||lpad(nextval($2)::text,'4','0') code1", [asset_nid, seq], function (err, result) {
    if (err) throw err;
    var code1 = result.rows['0'].code1;
    console.log("select done");
    console.log("code1", code1);


    pool.query("INSERT INTO asset_nit_master_tbl(asset_id,particulr,quant,rmks,del_flg,app_flg,rcre_user_id,rcre_time,lchg_user_id,lchg_time)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)", [code1, particulr, quant, rmks, 'N', 'Y', rcreuserid, rcretime, lchguserid, lchgtime], function (err, done) {
      if (err) throw err;

      res.json({
        message: "redirect to view page",
        notification: "success Asset Details for Added Successfully"
      })

    });
  });

};




////////////////////////////////////////////////////// modify non it asset details////////////////////////////////////////////////////



router.post('/assetnmoddet', assetnmoddet);
function assetnmoddet(req, res) {


  var now = new Date();
  var rcreuserid = "ADMIN";
  var rcretime = now;
  var lchguserid = "ADMIN";
  var lchgtime = now;
  var asset_nid = req.body.asset_nid;
  var particulr = req.body.particulr;
  var quant = req.body.quant;
  var rmks = req.body.rmks;

  console.log();

  pool.query("UPDATE asset_nit_master_tbl set particulr=$1,quant=$2,rmks=$3,del_flg=$4,lchg_user_id=$5,lchg_time=$6 where asset_id =$7", [particulr, quant, rmks, 'N', lchguserid, lchgtime, asset_nid], function (err, done) {
    if (err) throw err;
    res.json({
      message: "redirect to referer",
      notification: "success Asset Details for updated Successfully"
    })

    console.log("modify success");
  });

}



///////////////////////////////////////////////////view non it asset details////////////////////////////////////////////////

router.get('/assetnItViewDetails', function (req, res) {

  var nid = "";
  var particulr = "";
  var nos = "";
  var rmks = "";
  var emp_id = req.query.user_id;
  var emp_access = req.query.user_type;
  var my_id = req.query.user_id;
  var my_name = req.query.user_name;

  pool.query("SELECT * from asset_nit_master_tbl where del_flg = 'N' order by asset_id asc", function (err, result) {

    if (err) {
      console.error('Error with table query', err);
    }
    else {
      var resultData = result.rows;
      console.log(resultData, '---------');
      var nonItAssetCount = 0;


      for (var i = 0; i < resultData.length; i++) {
        var assetId = resultData[i].asset_nid;

        // Check if the asset ID exists
        if (assetId) {
          nonItAssetCount++;
        }
      }
    }

    res.json({
      message: "redirect to viewNonItAsset",
      data: resultData,
      nonItAssetCount: nonItAssetCount
    });
  });
});


/////////////////////////////////////view non it details by id /////////////////////////////////////////////////////


router.get('/nonAssetViewDetail', function (req, res) {
  var asset_id = req.query.asset_nid;

  pool.query("SELECT * FROM asset_nit_master_tbl WHERE asset_id = $1", [asset_id], function (err, result) {
    if (err) {
      console.error('Error with table query', err);
      res.status(500).json({ error: 'An error occurred while fetching the data.' });
    } else {
      var assetData = result.rows[0];
      res.json({ data: assetData });
    }
  });
});

////////////////////////////////////////////////delete by Non IT asset///////////////////////////////////////////////////////////////////

router.get('/assetDelete/:asset_id', assetDelete);
function assetDelete(req, res) {

  var emp_id = req.body.user_id;
  var emp_access = req.body.user_type;

  var my_id = req.body.user_id;
  var my_name = req.body.user_name;

  var asset_id = req.params.asset_id;
  console.log("asset_id", asset_id);


  pool.query("UPDATE asset_nit_master_tbl set del_flg = $1 where asset_id = $2 ", ['Y', asset_id], function (err, done) {
    if (err) {
      console.error('Error with table query', err);
    }
    else {

      //               console.log('111111111111111111111111111');
    }

    pool.query("SELECT * FROM asset_nit_master_tbl where del_flg='N' ", function (err, result) {
      if (err) {
        console.error('Error with table query', err);
      }
      else {
        rowData = result.rows;
      }

      success = 'assetNonItDetails entry removed successfully';
      res.json({
        message: "redirect to viewNonAsset",
        data: {
          rowData: rowData,
          result: result
        }
      });
    })
  });

}
///////////////////////////////////////////////////add it allocation details ////////////////////////////////////////////////////////////////////

router.post('/assetaddAlloc', assetaddAlloc);
function assetaddAlloc(req, res) {
  console.log("Insert");
  var now = new Date();
  var rcre_user_id = "ADMIN";
  var rcre_time = now;
  var lchg_user_id = "ADMIN";
  var lchg_time = now;
  var asset_id = req.body.asset_id;
  var empId = req.body.empId;
  var emp_name = req.body.emp_name;
  var allocdate = req.body.allocdate;
  var rdate = req.body.rdate;


  var emp_id = req.body.user_id;
  var emp_access = req.body.user_type;

  var my_id = req.body.user_id;
  var my_name = req.body.user_name;


  pool.query("SELECT * from asset_it_master_tbl WHERE asset_id = $1", [asset_id], function (err, result) {
    if (err) throw err;
    var rcount = result.rowCount;
    console.log("IT rcount", rcount);

    if (rcount != 0) {

      // var app_flg = result.rows[0].app_flg;
      var app_flg = result.rows[0].app_flg.trim();
      console.log(app_flg, 'IT App_flg ');

      if (app_flg === 'Y') {
        console.log("Chekkkkkkk");
        // Take count of alloc master tbl

        pool.query("SELECT * from asset_alloc_master_tbl WHERE asset_id = $1", [asset_id], function (err, result1) {
          if (err) throw err;

          var rcount1 = result1.rowCount;
          console.log("Allocate count", rcount1);

          if (rcount1 == 0) {
            // Insert New
            pool.query("INSERT INTO asset_alloc_master_tbl(asset_id,emp_id,emp_name,allocdate,rdate,del_flg,status,rcre_user_id,rcre_time,lchg_user_id,lchg_time,asset_type)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)", [asset_id, empId, emp_name, allocdate, rdate, 'N', 'Allocated', rcre_user_id, rcre_time, lchg_user_id, lchg_time, 'IT'], function (err, done) {

              pool.query("INSERT INTO asset_alloc_hist_tbl(asset_id,emp_id,emp_name,allocdate,rdate,del_flg,status,rcre_user_id,rcre_time,lchg_user_id,lchg_time,asset_type)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)", [asset_id, empId, emp_name, allocdate, rdate, 'N', 'Allocated', rcre_user_id, rcre_time, lchg_user_id, lchg_time, 'IT'], function (err, done) {
                if (err) throw err;


                pool.query("update asset_it_master_tbl set app_flg='N' where asset_id=$1", [asset_id], function (err, done) {
                  if (err) throw err;

                  res.json({
                    notification: "IT Asset Allocated Successfully"
                  })

                })


              });

            })
          }
          else {
            // Update old
            pool.query("update asset_alloc_master_tbl set emp_id=$1,emp_name=$2,allocdate=$3,rdate=$4,del_flg='N',status='Allocated', asset_type='IT' where asset_id =$5", [empId, emp_name, allocdate, rdate, asset_id], function (err, done) {

              pool.query("INSERT INTO asset_alloc_hist_tbl(asset_id,emp_id,emp_name,allocdate,rdate,del_flg,status,rcre_user_id,rcre_time,lchg_user_id,lchg_time,asset_type)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)", [asset_id, empId, emp_name, allocdate, rdate, 'N', 'Allocated', rcre_user_id, rcre_time, lchg_user_id, lchg_time, 'NON IT'], function (err, done) {
                if (err) throw err;

                pool.query("update asset_it_master_tbl set app_flg='N' where asset_id=$1", [asset_id], function (err, done) {
                  if (err) throw err;

                  res.json({
                    notification: "IT Asset Allocated Successfully"
                  })

                })

              });

            })
          }
        });

      }
      else {
        res.json({
          message: "ASSET ALREADY IN USE!!!"
        })

      }

    }
    else {
      // For Non IT
      pool.query("SELECT * from asset_nit_master_tbl WHERE asset_id = $1", [asset_id], function (err, result) {
        if (err) throw err;

        var rowdata = result.rowCount;
        console.log("Non IT rowcount: " + rowdata);

        if (rowdata != 0) {

          var app_flg1 = result.rows[0].app_flg.trim();
          console.log(app_flg1, 'Non IT App_flg ');

          if (app_flg1 === 'Y') {
            console.log("Chekk 2");
            // Take count of alloc master tbl

            pool.query("SELECT * from asset_alloc_master_tbl WHERE asset_id = $1", [asset_id], function (err, result1) {
              if (err) throw err;

              var rcount1 = result1.rowCount;
              console.log("Allocate count", rcount1);

              if (rcount1 == 0) {
                // Insert New
                pool.query("INSERT INTO asset_alloc_master_tbl(asset_id,emp_id,emp_name,allocdate,rdate,del_flg,status,rcre_user_id,rcre_time,lchg_user_id,lchg_time,asset_type)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)", [asset_id, empId, emp_name, allocdate, rdate, 'N', 'Allocated', rcre_user_id, rcre_time, lchg_user_id, lchg_time, 'NON IT'], function (err, done) {

                  pool.query("INSERT INTO asset_alloc_hist_tbl(asset_id,emp_id,emp_name,allocdate,rdate,del_flg,status,rcre_user_id,rcre_time,lchg_user_id,lchg_time,asset_type)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)", [asset_id, empId, emp_name, allocdate, rdate, 'N', 'Allocated', rcre_user_id, rcre_time, lchg_user_id, lchg_time, 'NON IT'], function (err, done) {
                    if (err) throw err;


                    pool.query("update asset_nit_master_tbl set app_flg='N' where asset_id=$1", [asset_id], function (err, done) {
                      if (err) throw err;

                      res.json({
                        notification: "NON IT Asset Allocated Successfully"
                      })

                    })


                  });

                })
              }
              else {
                // Update old
                pool.query("update asset_alloc_master_tbl set emp_id=$1,emp_name=$2,allocdate=$3,rdate=$4,del_flg='N',status='Allocated', asset_type='NON IT' where asset_id =$5", [empId, emp_name, allocdate, rdate, asset_id], function (err, done) {

                  pool.query("INSERT INTO asset_alloc_hist_tbl(asset_id,emp_id,emp_name,allocdate,rdate,del_flg,status,rcre_user_id,rcre_time,lchg_user_id,lchg_time,asset_type)values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)", [asset_id, empId, emp_name, allocdate, rdate, 'N', 'Allocated', rcre_user_id, rcre_time, lchg_user_id, lchg_time, 'NON IT'], function (err, done) {
                    if (err) throw err;

                    pool.query("update asset_nit_master_tbl set app_flg='N' where asset_id=$1", [asset_id], function (err, done) {
                      if (err) throw err;

                      res.json({
                        notification: "NON IT Asset Allocated Successfully"
                      })

                    })

                  });

                })
              }
            });

          }
          else {
            res.json({
              message: "ASSET ALREADY IN USE!!!"
            })

          }

        }
        else {
          res.json({ notification: "Asset Not Exist Pls contact the Admin!!" })
          console.log("Asset Not Exist Pls contact the Admin");
        }

      })

    }
  });
}
//////////////////////////////////////////////////delete it allocation details////////////////////////


function removeAsset(req, res) {

  var emp_id = req.body.user_id;
  var emp_access = req.body.user_type;

  var my_id = req.body.user_id;
  var my_name = req.body.user_name;

  var asset_id = req.params.asset_id;
  console.log("asset_id", asset_id);


  pool.query("UPDATE asset_alloc_master_tbl set del_flg = $1,status = $2 where asset_id = $3 ", ['Y', 'DeAllocated', asset_id], function (err, done) {
    if (err) {
      console.error('Error with table query', err);
    }
    else {

      //               console.log('111111111111111111111111111');
    }
    pool.query("UPDATE asset_alloc_hist_tbl set del_flg = $1, status= $2 where asset_id = $3 ", ['Y', 'DeAllocated', asset_id], function (err, done) {
      if (err) {
        console.error('Error with table query', err);
      }
      else {

        //               console.log('111111111111111111111111111');
      }

      //To check Asset IT or Non IT+++++++
      pool.query("SELECT * from asset_it_master_tbl WHERE asset_id = $1", [asset_id], function (err, result) {
        if (err) throw err;
        var rcount = result.rowCount;
        console.log("IT rcount", rcount);

        if (rcount != 0) {

          pool.query("UPDATE asset_it_master_tbl set app_flg = 'Y' ", function (err, done) {
            if (err) {
              console.error('Error with table query', err);
            }
            else {
              console.log("Updated to IT Master");
            }


          });
        }
        else {
          pool.query("UPDATE asset_it_master_tbl set app_flg = 'Y' ", function (err, done) {
            if (err) {
              console.error('Error with table query', err);
            }
            else {
              console.log("Updated to NON I Master");
            }


          });
        }



        pool.query("SELECT * FROM asset_alloc_master_tbl where del_flg='N' ", function (err, result) {
          if (err) {
            console.error('Error with table query', err);
          }
          else {
            rowData = result.rows;
          }

          success = 'assetAlloc entry removed successfully';
          res.json({
            message: "redirect to viewAssetAlloc",
            data: {
              rowData: rowData,
              result: result
            }

          });
        });
      });
    });
  });

}





// ////////////////////////////////////////////////modify it allocation details //////////////////////////////////////////////////////////

router.post('/assetmodAlloc', assetmodAlloc);
function assetmodAlloc(req, res) {
  console.log("Modify");

  var now = new Date();
  var rcre_user_id = "ADMIN";
  var rcre_time = now;
  var lchg_user_id = "ADMIN";
  var lchg_time = now;
  var asset_id = req.body.asset_id;
  var empId = req.body.empId;
  var emp_name = req.body.emp_name;
  var allocdate = req.body.allocdate;
  var rdate = req.body.rdate;


  pool.query("SELECT * from asset_alloc_master_tbl where emp_id =$1", [empId], function (err, resultset) {
    if (err) throw err;
    var rcount = resultset.rowCount;
    console.log("rcount", rcount);
    console.log("empId", empId);

    pool.query("UPDATE asset_alloc_master_tbl set emp_id=$1,emp_name=$2,allocdate=$3,rdate=$4 where asset_id =$5", [empId, emp_name, allocdate, rdate, asset_id], function (err, done) {
      if (err) throw err;
      res.json({
        message: "redirect to viewItAllocDetail",
        notification: "success Asset Details for updated Successfully"
      })

      console.log("modify success");
    });
  });
};


/////////////////////////////////////////////////////View It Allocation Details////////////////////////////////////////////////////////

router.get('/assetItAllocViewDetails', function (req, res) {


  pool.query("SELECT * from asset_alloc_master_tbl  order by asset_id asc", function (err, result) {

    if (err) {
      console.error('Error with table query', err);
    }
    else {
      var result = result.rows;

      console.log(result);
    }

    res.json({
      message: "redirect to viewItAllocationAsset",
      data: result
    })

  });
});

//////////////////////////////////////////////////////view allocated history deatails /////////////////////////////////////////////////////////////

router.get('/assetItHistoryAllocViewDetails', function (req, res) {


  pool.query("SELECT * from asset_alloc_hist_tbl order by allocdate desc", function (err, result) {

    if (err) {
      console.error('Error with table query', err);
    }
    else {
      var result = result.rows;

      console.log(result);
    }

    res.json({
      message: "redirect to viewItAllocationAsset",
      data: result
    })

  });
});








router.post('/assetnmoddet', assetnmoddet);
function assetnmoddet(req, res) {


  var now = new Date();
  var rcreuserid = "ADMIN";
  var rcretime = now;
  var lchguserid = "ADMIN";
  var lchgtime = now;
  var asset_nid = req.body.asset_nid;
  var particulr = req.body.particulr;
  var quant = req.body.quant;
  var rmks = req.body.rmks;

  console.log();



}

router.get('/assetDetails', function (req, res) {

  var emp_id = req.query.user_id;
  var emp_access = req.query.user_type;

  var my_id = req.query.user_id;
  var my_name = req.query.user_name;

  console.log('req value ', req.query.user_id);
  console.log('emp_access', req.query.user_type);



  res.json({
    data: {
      emp_access: emp_access,
      my_name: my_name,
      my_id: my_id
    }
  })


  //   res.render('assetModule/assetDetails',{
  //     emp_access:emp_access,
  //     my_name:my_name,
  //     my_id:my_id
  //   });


});

router.get('/assetItDetails', function (req, res) {
  var emp_id = req.query.user_id;
  var emp_access = req.query.user_type;

  var my_id = req.query.user_id;
  var my_name = req.query.user_name;
  console.log('req value ', req.query.user_id);
  console.log('emp_access', req.query.user_type);
  res.render('assetModule/assetItDetails', {
    emp_access: emp_access,
    my_name: my_name,
    my_id: my_id
  });
});




//////////////////////////////////////////             /////////////////////////////////////////////////////////////


router.post('/assetiddet', assetiddet);
function assetiddet(req, res) {

  var emp_id = req.body.user_id;
  var emp_access = req.body.user_type;

  var my_id = req.body.user_id;
  var my_name = req.body.user_name;
  var asset_id = req.body.asset_id;
  pool.query("SELECT * from asset_it_master_tbl where asset_id = $1 order by asset_id asc", [asset_id], function (err, check) {
    asset_id_count = check.rowCount;


    if (asset_id_count != 0) {
      pool.query("SELECT asset_id,product,make,model,serial_no,host_name,os,os_type,software,ram,processor,hard_disk,accessories,window_product_key,ip_addr from asset_it_master_tbl where upper(asset_id) = upper($1)", [asset_id], function (err, resultset) {
        if (err) throw err;
        var id = resultset.query.asset_id;
        var ptype = resultset.query.product;
        var make = resultset.query.make;
        var model = resultset.query.model;
        var sno = resultset.query.serial_no;
        var hname = resultset.query.host_name;
        var os = resultset.query.os;
        var ost = resultset.query.os_type;
        var sw = resultset.query.software;
        var ram = resultset.query.ram;
        var procr = resultset.query.processor;
        var hrd = resultset.query.hard_disk;
        var accs = resultset.query.accessories;
        var wpkey = resultset.query.window_product_key;
        var ipadd = resultset.query.ip_addr;

        console.log("make", make);


        res.json({
          data: {
            //asset : asset,
            //asset_id_count :asset_id_count,
            //assetid:assetid,
            //ptype:ptype,
            id: id,
            ptype: ptype,
            make: make,
            model: model,
            sno: sno,
            hname: hname,
            os: os,
            ost: ost,
            sw: sw,
            ram: ram,
            procr: procr,
            hrd: hrd,
            accs: accs,
            wpkey: wpkey,
            ipadd: ipadd,
            emp_access: emp_access,
            my_name: my_name,
            my_id: my_id
          }
        })

      });
    }

    else {
      //ptype = "";
      id = "";
      ptype = "";
      make = "";
      model = "";
      sno = "";
      hname = "";
      os = "";
      ost = "";
      sw = "";
      ram = "";
      procr = "";
      hrd = "";
      accs = "";
      wpkey = "";
      ipadd = "";



      res.json({
        data: {
          //asset : asset,
          //asset_id_count :asset_id_count,
          //assetid:assetid,
          //ptype:ptype,
          id: id,
          ptype: ptype,
          make: make,
          model: model,
          sno: sno,
          hname: hname,
          os: os,
          ost: ost,
          sw: sw,
          ram: ram,
          procr: procr,
          hrd: hrd,
          accs: accs,
          wpkey: wpkey,
          ipadd: ipadd,
          emp_access: emp_access,
          my_name: my_name,
          my_id: my_id
        }
      })
    }
  });

};


router.get('/assetnItDetails', function (req, res) {
  var emp_id = req.user.rows[0].user_id;
  var emp_access = req.user.rows[0].user_type;
  var my_id = req.user.rows[0].user_id;
  var my_name = req.user.rows[0].user_name;

  res.render('assetModule/assetnItDetails', {
    emp_access: emp_access,
    my_name: my_name,
    my_id: my_id

  });
});




router.get('/assetnItModDetails', function (req, res) {

  var emp_id = req.user.rows[0].user_id;
  var emp_access = req.user.rows[0].user_type;
  var my_id = req.user.rows[0].user_id;
  var my_name = req.user.rows[0].user_name;
  var nid = "";
  var particulr = "";
  var nos = "";
  var rmks = "";

  pool.query("SELECT asset_nid from asset_nit_master_tbl where del_flg = 'N' order by asset_nid asc", function (err, result) {
    asset = result.rows;
    asset_nid_count = result.rowCount;
    console.log("asset_id_count", asset_nid_count);
    console.log("asset", asset);

    pool.query("SELECT asset_nid from asset_nit_master_tbl where del_flg = 'N' order by asset_nid asc", function (err, result) {
      asset1 = result.rows;
      asset1_nid_count = result.rowCount;
      console.log("asset_id_count", asset1_nid_count);
      console.log("asset", asset1);

      //res.render('assetModule/assetViewDetails');
      res.render('assetModule/assetnItModDetails', {
        asset: asset,
        asset_nid_count: asset_nid_count,
        asset1: asset1,
        asset1_nid_count: asset1_nid_count,
        //assetid:assetid,
        //ptype:ptype,
        nid: nid,
        particulr: particulr,
        nos: nos,
        rmks: rmks,
        emp_access: emp_access,
        my_name: my_name,
        my_id: my_id

      });
    });
  });
});



router.post('/assetnmodView', assetnmodView);
function assetnmodView(req, res) {
  var emp_id = req.user.rows[0].user_id;
  var emp_access = req.user.rows[0].user_type;

  var my_id = req.user.rows[0].user_id;
  var my_name = req.user.rows[0].user_name;

  var asset_nid = req.body.asset_nid;

  pool.query("SELECT asset_nid,particulr,quant,rmks from asset_nit_master_tbl where upper(asset_nid) = upper($1)", [asset_nid], function (err, resultset) {
    if (err) throw err;
    var id = resultset.rows['0'].asset_nid;
    var particulr = resultset.rows['0'].particulr;
    var nos = resultset.rows['0'].quant;
    var rmks = resultset.rows['0'].rmks;

    res.render('assetModule/assetnItModDetails', {
      //asset : asset,
      //asset_id_count :asset_id_count,
      //assetid:assetid,
      //ptype:ptype,
      nid: id,
      particulr: particulr,
      nos: nos,
      rmks: rmks,
      emp_access: emp_access,
      my_name: my_name,
      my_id: my_id

    });
  });

}





router.get('/assetnItViewDetails', function (req, res) {

  var nid = "";
  var particulr = "";
  var nos = "";
  var rmks = "";
  var emp_id = req.user.rows[0].user_id;
  var emp_access = req.user.rows[0].user_type;

  var my_id = req.user.rows[0].user_id;
  var my_name = req.user.rows[0].user_name;


  pool.query("SELECT asset_nid from asset_nit_master_tbl where del_flg = 'N' order by asset_nid asc", function (err, result) {
    asset = result.rows;
    asset_nid_count = result.rowCount;
    console.log("asset_id_count", asset_nid_count);
    console.log("asset", asset);

    pool.query("SELECT asset_nid from asset_nit_master_tbl where del_flg = 'N' order by asset_nid asc", function (err, result) {
      asset1 = result.rows;
      asset1_nid_count = result.rowCount;
      console.log("asset_id_count", asset1_nid_count);
      console.log("asset", asset1);

      //res.render('assetModule/assetViewDetails');
      res.render('assetModule/assetnItViewDetails', {
        asset: asset,
        asset_nid_count: asset_nid_count,
        asset1: asset1,
        asset1_nid_count: asset1_nid_count,
        //assetid:assetid,
        //ptype:ptype,
        nid: nid,
        particulr: particulr,
        nos: nos,
        rmks: rmks,
        emp_access: emp_access,
        my_name: my_name,
        my_id: my_id

      });
    });
  });
});




router.post('/assetniddet', assetniddet);
function assetniddet(req, res) {
  var emp_id = req.user.rows[0].user_id;
  var emp_access = req.user.rows[0].user_type;

  var my_id = req.user.rows[0].user_id;
  var my_name = req.user.rows[0].user_name;

  var asset_nid = req.body.asset_nid;

  pool.query("SELECT asset_nid,particulr,quant,rmks from asset_nit_master_tbl where upper(asset_nid) = upper($1)", [asset_nid], function (err, resultset) {
    if (err) throw err;
    var id = resultset.rows['0'].asset_nid;
    var particulr = resultset.rows['0'].particulr;
    var nos = resultset.rows['0'].quant;
    var rmks = resultset.rows['0'].rmks;

    res.render('assetModule/assetnItViewDetails', {
      //asset : asset,
      //asset_id_count :asset_id_count,
      //assetid:assetid,
      //ptype:ptype,
      nid: id,
      particulr: particulr,
      nos: nos,
      rmks: rmks,
      emp_access: emp_access,
      my_name: my_name,
      my_id: my_id

    });
  });

}





router.get('/assetItAlloc', function (req, res) {

  var empid = "";
  var empName = "";
  var rdate = "";
  var sdate = "";
  var asset_id = "";

  var emp_id = req.user.rows[0].user_id;
  var emp_access = req.user.rows[0].user_type;

  var my_id = req.user.rows[0].user_id;
  var my_name = req.user.rows[0].user_name;


  pool.query("SELECT asset_id from asset_it_master_tbl where del_flg = 'N' and asset_id not in (select asset_id from asset_alloc_master_tbl where del_flg = 'N') order by asset_id asc", function (err, result) {
    asset = result.rows;
    asset_id_count = result.rowCount;
    console.log("asset_id_count", asset_id_count);
    console.log("asset", asset);

    pool.query("SELECT asset_id from asset_it_master_tbl where del_flg = 'N' and asset_id not in (select asset_id from asset_alloc_master_tbl where del_flg = 'N') order by asset_id asc", function (err, result) {
      asset1 = result.rows;
      asset1_id_count = result.rowCount;
      console.log("asset_id_count", asset1_id_count);
      console.log("asset", asset1);

      pool.query("SELECT emp_id from emp_master_tbl where del_flg = 'N' and emp_id not in (select  emp_id from asset_alloc_master_tbl where del_flg = 'N') order by emp_id asc", function (err, result) {
        employee = result.rows;
        emp_id_count = result.rowCount;


        pool.query("SELECT emp_id from emp_master_tbl where del_flg = 'N' and emp_id not in (select  emp_id from asset_alloc_master_tbl where del_flg = 'N') order by emp_id asc", function (err, result) {
          employee1 = result.rows;
          emp1_id_count = result.rowCount;



          //res.render('assetModule/assetViewDetails');
          res.render('assetModule/assetItAlloc', {
            asset: asset,
            asset_id_count: asset_id_count,
            asset1: asset1,
            asset1_id_count: asset1_id_count,
            //assetid:assetid,
            //ptype:ptype,
            employee: employee,
            emp_id_count: emp_id_count,
            employee1: employee1,
            emp1_id_count: emp1_id_count,
            //empname:empname,
            empid: empid,
            empName: empName,
            sdate: sdate,
            rdate: rdate,
            emp_access: emp_access,
            my_name: my_name,
            my_id: my_id

          });
        });
      });
    });
  });
});



router.post('/assetAllocList', assetAllocList);
function assetAllocList(req, res) {
  var emp_id = req.user.rows[0].user_id;
  var emp_access = req.user.rows[0].user_type;

  var my_id = req.user.rows[0].user_id;
  var my_name = req.user.rows[0].user_name;

  var emp1_id = req.body.emp_id;
  console.log("alloc");

  pool.query("SELECT emp_id,emp_name from emp_master_tbl where upper(emp_id) = upper($1)", [emp1_id], function (err, resultset) {
    if (err) throw err;
    var id = resultset.rows['0'].emp_id;
    var empName = resultset.rows['0'].emp_name;

    res.render('assetModule/assetItAlloc', {
      //asset : asset,
      //asset_id_count :asset_id_count,
      //assetid:assetid,
      //ptype:ptype,
      empid: id,
      empName: empName,
      emp_access: emp_access,
      my_name: my_name,
      my_id: my_id

    });
  });
}




router.get('/assetItAllocMod', function (req, res) {
  console.log("test");
  var empid = "";
  var empName = "";
  var asset_id = "";
  var sdate = "";
  var rdate = "";
  var asset_list = "";
  var other_asset_id = "";
  var other_asset_id_count = "";

  var emp_id = req.user.rows[0].user_id;
  var emp_access = req.user.rows[0].user_type;

  var my_id = req.user.rows[0].user_id;
  var my_name = req.user.rows[0].user_name;

  pool.query("SELECT emp_id from asset_alloc_master_tbl order by emp_id asc", function (err, result) {
    employee = result.rows;
    emp_id_count = result.rowCount;

    res.render('assetModule/assetItAllocMod', {
      employee: employee,
      emp_id_count: emp_id_count,
      empid: empid,
      empName: empName,
      asset_id: asset_id,
      other_asset_id: other_asset_id,
      other_asset_id_count: other_asset_id_count,
      sdate: sdate,
      rdate: rdate,
      empName: empName,
      emp_access: emp_access,
      my_name: my_name,
      my_id: my_id
    });
  });
});




router.post('/assetmAllocList', assetmAllocList);
function assetmAllocList(req, res) {
  var emp_id = req.body.emp_id;
  console.log("emp id", emp_id);

  pool.query("SELECT asset_id,emp_id,emp_name,allocdate,rdate from asset_alloc_master_tbl where upper(emp_id) = upper($1)", [emp_id], function (err, resultset) {
    if (err) throw err;
    var asset_id = resultset.rows['0'].asset_id;
    var emp_id = resultset.rows['0'].emp_id;
    var empName = resultset.rows['0'].emp_name;
    var sdate = resultset.rows['0'].allocdate;
    var rdate = resultset.rows['0'].rdate;

    pool.query("SELECT asset_id from asset_alloc_master_tbl where emp_id = $1", [emp_id], function (err, result) {
      asset_id = result.rows['0'].asset_id;
      console.log("asset id is :", asset_id);

      pool.query("SELECT asset_id from asset_it_master_tbl order by asset_id asc", function (err, resultset) {
        other_asset_id = resultset.rows;
        console.log("other_asset_id", other_asset_id);
        other_asset_id_count = resultset.rowCount;
        console.log("other_asset_id_count", other_asset_id_count);


        res.render('assetModule/assetItAllocMod', {
          asset_id: asset_id,
          other_asset_id: other_asset_id,
          other_asset_id_count: other_asset_id_count,
          empid: emp_id,
          empName: empName,
          sdate: sdate,
          rdate: rdate
        });

      });
    });
  });
}


module.exports = router;


