var multer = require('multer');
// const cons = require('consolidate');
var path = require('path');
const fs = require('fs');
const env = require('../../../env/environment-dev')
  function hltcareUploadLogo(req, res, next) {
    return new Promise((resolve, reject)=>{
      fs.mkdir(path.resolve('api/uploads/V1/profile')+"/"+req.user.data.id+"/"+req.body.tblhcc_id, { recursive: true, mask: 0777 }, function(err) {
        if (err) {
          console.log(err)
          res.jsonp({ status: false, Message: "Something went wrong." });
        } else { 
          var filename= Date.now()+".png";
          var base64Data = req.body.logo.replace(/^data:image\/png;base64,/, "");
          fs.writeFile(path.resolve('api/uploads/V1/profile')+"/"+req.user.data.id+"/"+req.body.tblhcc_id+"/"+filename, base64Data, 'base64', function(err) {
              if (err) {
                res.jsonp({ status: false, Message: "Something went wrong." });
              } else {
                delete req.body.logo;
                req.body.filename = env.connection.host +req.user.data.id+"/"+req.body.tblhcc_id+"/"+filename;
                next();
                // res.jsonp({ status: true, Message: "Success.", logo: req.body.filename});
              }
          });
        } // successfully created folder
      });
    })
  }

  

  function uploadimage(data, imagepathtoUpload, hosttoattach) {
    return new Promise((resolve, reject)=>{
    var filename= Date.now()+".png";
    var base64Data = data.replace(/^data:image\/png;base64,/, "");
      fs.mkdir(path.resolve(imagepathtoUpload), { recursive: true, mask: 0777 }, function(err) {
        if (err) {
          res.jsonp({ status: false, Message: "Something went wrong." });
        } else { 
          fs.writeFile(path.resolve(imagepathtoUpload)+"/"+filename, base64Data, 'base64', function(err) {
            if (err) {
              reject({ status: false, Message: "Something went wrong.." });
            } else {
              resolve({filename: env.connection.host+hosttoattach+"/"+filename})
            }
          });
        }
      });
    })
  }

  
  function userUploadLogo(req, res, next) {
    return new Promise((resolve, reject)=>{
      fs.mkdir(path.resolve('api/uploads/V1/profile')+"/"+req.user.data.id, { recursive: true, mask: 0777 }, function(err) {
        if (err) {
          res.jsonp({ status: false, Message: "Something went wrong." });
        } else { 
          var filename= Date.now()+".png";
          var base64Data = req.body.logo.replace(/^data:image\/png;base64,/, "");
          fs.writeFile(path.resolve('api/uploads/V1/profile')+"/"+req.user.data.id+"/"+filename, base64Data, 'base64', function(err) {
              if (err) {
                res.jsonp({ status: false, Message: "Something went wrong." });
              } else {
                delete req.body.logo;
                req.body.filename = env.connection.host + req.user.data.id+"/"+filename;
                next();
              }
          });
        } // successfully created folder
      });
    })
  }


  //////////////////WeB save Prescription using multer-------------

  
var uploadappointmentstorage = multer.diskStorage({
  destination: function (req, file, cb) {
      fs.mkdirSync(path.resolve('api/uploads/V1/profile')+"/"+req.user.data.id+"/appointment", { recursive: true });
      cb(null, path.resolve('api/uploads/V1/profile')+"/"+req.user.data.id+"/appointment");
  },
  filename: function (req, file, cb) {
      cb(null, Date.now() + '.png')
  }
});

  var uploadappointmentprescription = multer({
    storage: uploadappointmentstorage
  });

  module.exports = {
    uploadimage,
    hltcareUploadLogo,
    userUploadLogo,
    uploadappointmentprescription
  }