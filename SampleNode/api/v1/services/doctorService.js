const cons = require('consolidate');
var env = require('../../../env/environment-dev');
const connection = env.connection.connection;
var hasgenrator = require('./authentication/hashgenrator');
const handlers  = require('../../../handlers');

/**
 * 
 * To get doctorBy email (Used while register to check existing doctor)
 * 
 */
function doctorlogin(req) {
  return new Promise(function (resolve, reject) {
    if (req.body.mobile) {
      var query =  "Select *, DATE_FORMAT(dob,'%Y-%m-%d') as dob from tbldoctor where mobile=?";
      var condition = [req.body.mobile];
    } else if (req.body.email) {
      var query = "Select *, DATE_FORMAT(dob,'%Y-%m-%d') as dob  from tbldoctor where Email=?";
      var condition = [req.body.email];
    }else if(req.body.username){
      var query = "Select *, DATE_FORMAT(dob,'%Y-%m-%d') as dob  from tbldoctor where Email=? or mobile =?";
      var condition = [req.body.username, req.body.username];
    }
    connection.query(query, condition, (err, doctorresult) => {
      if (err) {
        resolve({ status: false, Message: "Something went wrong.", code: 401 });
      } else {
        if (doctorresult.length > 0) {
          if (doctorresult[0].isActive) {
            hasgenrator.comparepasskey(req.body.password, doctorresult[0].Password_Hash, doctorresult[0].Password_Salt).then(comparepasskeyResult => {
              var datatosend = {
                IsEnabled: doctorresult[0].isActive,
                email: doctorresult[0].email,
                id: doctorresult[0].doctor_id,
                mobile: doctorresult[0].mobile,
                name: doctorresult[0].name,
              }
              handlers.jwtHandler.genUsrToken({ status: true, data: datatosend, Message: "Success." }).then(function (params) {
                login_logs(req, { status: true, Message: 'Login Success' }, 'login').then((result) => {
                  delete doctorresult[0].password;
                  delete doctorresult[0].Password_Salt;
                  delete doctorresult[0].Password_Hash;
                  delete doctorresult[0].Forgot_Pass_OTP;
                  delete doctorresult[0].otp_mobile;
                  delete doctorresult[0].otp_email;
                  // delete doctorresult[0].dob;
                  if (!req.body.username) {
                    params.doctorDetails = doctorresult[0];  
                  }
                  resolve(params);
                }).catch(loginlogerror => {
                  resolve(loginlogerror);
                })
              }).catch(function (error) {
                resolve(error);
              })
            }).catch(error => {
              login_logs(req, error, 'login').then((result) => {
                resolve({ status: false, Message: "Wrong Mobile/Email or password.", code: 401 });
              }).catch(loginlogerror => {
                resolve(loginlogerror);
              })
            })
          } else {
            login_logs(req, { status: false, Message: "User not active." }, 'login').then((result) => {
              resolve({ status: false, Mobile: doctorresult[0].Mobile, Message: "User not active.", code: 403 });
            }).catch(loginlogerror => {
              resolve(loginlogerror);
            })
          }
        } else {
          login_logs(req, { status: false, Message: "Wrong Mobile/Email or password." }, 'login').then((result) => {
            resolve({ status: false, Message: "Wrong Mobile/Email or password.", code: 401  });
          }).catch(loginlogerror => {
            resolve(loginlogerror);
          })
        }
      }
    })
  })
}
  

/**
 * 
 * To get doctorBy email (Used while register to check existing doctor)
 * 
 */
function GetdoctorByEmail(email) {
  return new Promise(function (resolve, reject) {
    connection.query('Select doctor_id, email, isActive, Forgot_Pass_OTP from tbldoctor where email=?', [email], (err, doctorresult) => {
      if (err) {
        console.log("GetdoctorByEmail_err")
        console.log(err)
        reject({ status: false, Message: "Something went wrong." });
      } else {
        if (doctorresult.length > 0) {
          resolve({ status: true, doctor: doctorresult[0] , Message: "Success." });
        } else {
          resolve({ status: false, Message: "doctor Not found." });
        }
      }
    })
  })
}

/**
 * 
 * To get doctorBy email (Used while register to check existing doctor)
 * 
 */
function GetdoctorBymobile(mobile) {
  return new Promise((resolve, reject) => {
    connection.query("Select tbldoctor.*, DATE_FORMAT(dob,'%Y-%m-%d') as dob from tbldoctor where mobile=?", [mobile], (err, doctorresult) => {
      if (err) {
        reject({ status: false, Message: "Something went wrong." });
      } else {
        if (doctorresult.length > 0) {
          resolve({ status: true, doctor: doctorresult[0], Message: "Success." });
        } else {
          resolve({ status: false, Message: "doctor Not found." });
        }
      }
    })
  })
}

function insertdoctor(name, gender, Email, mobile, IsActive, password, Password_Salt, Password_Hash, Mobile_otp) {
  return new Promise((resolve, reject) => {
    let query = "INSERT INTO tbldoctor (name, gender, email, mobile, isActive, password, Password_Salt, Password_Hash, otp_mobile, isOnboard, created_on) VALUES (?,?,?,?,?,?,?,?,?,?,current_timestamp())";
    connection.query(query, [name, gender, Email, mobile, IsActive, password, Password_Salt, Password_Hash, Mobile_otp, 1], (err, doctorResult) => {
      if (err) {
        if (err.code == 'ER_WARN_DATA_OUT_OF_RANGE') {
          reject({ status: false, Message: "Please enter 10 digits mobile number." });   
        } else {
          reject({ status: false, Message: "Something went wrong." });  
        }
      } else {
        if (doctorResult.affectedRows > 0) {
          resolve({ status: true, Message: "Registration Success." });
        } else {
          resolve({ status: false, Message: "Something Went wrong." });
        }
      }
    })
  })
}

function login_logs(requestbody, result, action) {
  return new Promise((resolve, reject) => {
    if (requestbody.headers["postman-token"]) {
      requestbody.headers.referer = requestbody.headers["postman-token"]
    }
    var sql = "INSERT INTO tbllog_logins (Login_Action, Login_UserName, Login_Password, Login_status, Login_Message, Login_Date_Time, Login_user_IP, Login_Url, Login_Url_Method, Login_Url_Ref, Login_user_Agent_Details, Login_portal, Login_user_Agent) VALUES (?,?,?,?,?,current_date(),?,?,?,?,?,?,?)";
    var data = [action, requestbody.body.email || requestbody.body.mobile || requestbody.body.username,  requestbody.body.password, result.status, result.Message, requestbody.ip, requestbody.headers.referer, requestbody.method, requestbody.originalUrl, requestbody.get('user-Agent'), 'ET', requestbody.useragent.browser]
    connection.query(sql, data, (err, queryresult) => {
      resolve(result);
    })
  })
}

function verifyUser_mobile(doctor_id, flag = 'mobile') {
  return new Promise((resolve, reject) => {
    if (flag == "mobile") {
      var query = "UPDATE tbldoctor SET isActive=?, Is_Mobile_Verified=? WHERE doctor_id=?"; 
    } else {
      var query = "UPDATE tbldoctor SET isActive=?, Is_email_Verified=? WHERE doctor_id=?";
    }
    connection.query(query, [1, 1, doctor_id], (err, insertUserResult) => {
      if (err) {
        reject({ status: false, Message: "Something went wrong." });
      } else {
        if (insertUserResult.affectedRows > 0) {
          resolve({ status: true, Message: "User Verified Successfully." });
        } else {
          resolve({ status: false, Message: "Something Went wrong." });
        }
      }
    })
  })
}


function updateDoctor_otp(doctor_id, otp, value="", updatereason = "requestOTP_mobile") {
  return new Promise((resolve, reject) => {
    if (updatereason == "requestOTP_mobile") {
      var updatefield = "otp_mobile=?, Is_mobile_verified = 0";
    } else if (updatereason == "forgotpass_Email") {
      updatefield = "otp_email=?, Is_email_verified=0";
    } else if (updatereason == "forgotpass") {
      updatefield = "Forgot_Pass_OTP=?";
    }else if(updatereason == "changemobile"){
      var updatefield = "otp_mobile=?, mobile='"+value+"', Is_mobile_verified = 0";
    }else if(updatereason == "changeemail"){
      var updatefield = "otp_email=?, email='"+value+"', Is_email_verified = 0";
    }

    let query = "UPDATE tbldoctor SET " + updatefield + " WHERE doctor_id=?";

    connection.query(query, [otp, doctor_id], (err, updateotpResult) => {
      if (err) {
        reject({ status: false, Message: "Something went wrong." });
      } else {
        if (updateotpResult.affectedRows > 0) {
          resolve({ status: true, Message: "Success." });
        } else {
          resolve({ status: false, Message: "Something Went wrong." });
        }
      }
    })
  })
}

function setForgotPassword(doctor_id, password) {
  return new Promise((resolve, reject) => {
    if (password != null && password != undefined) {
      hasgenrator.genratepasskey(password.toString()).then(genratepasskeyResult => {
        let query = "UPDATE tbldoctor SET password=?, Password_Salt=?, Password_Hash=? WHERE doctor_id=?";
        connection.query(query, [password, genratepasskeyResult.salt, genratepasskeyResult.hash, doctor_id], (err, updtaepwsswrdquryresult) => {
          if (err) {
            reject({ status: false, Message: "Something went wrong." });
          } else {
            if (updtaepwsswrdquryresult.affectedRows > 0) {
              resolve({ status: true, Message: "Password updated Successfully." });
            } else {
              resolve({ status: false, Message: "Something Went wrong." });
            }
          }
        })
      }).catch(err => {
        reject({ status: false, Message: "pelase Try after some time1111" });
      })
    } else {
      reject({ status: false, Message: "Password should not be empty." });
    }
  })
}


/**
 * 
 * To get doctorBy doctor_id (Used to get loged in doctors details)
 * 
 */
function getdoctorbyid(id) {
  return new Promise((resolve, reject) => {
    connection.query('Select mobile, Password_Hash, Password_Salt, name, Forgot_Pass_OTP, otp_mobile, otp_email, isActive, email, doctor_id from tbldoctor where doctor_id=?', [id], (err, doctorresult) => {
      if (err) {
        reject({ status: false, Message: "Something went wrong." });
      } else {
        if (doctorresult.length > 0) {
          resolve({ status: true, doctor: doctorresult[0], Message: "Success." });
        } else {
          resolve({ status: false, Message: "doctor Not found." });
        }
      }
    })
  })
}


function changePassword(newpassword, id) {
  return new Promise((resolve, reject) => {
    hasgenrator.genratepasskey(newpassword).then(genratepasskeyResult=>{
      let query = "UPDATE tbldoctor SET password=?, Password_Salt=?, Password_Hash=? WHERE doctor_id=?";
      connection.query(query, [newpassword.toString(), genratepasskeyResult.salt, genratepasskeyResult.hash, id], (err, changePasswordResult) => {
        if (err) {
          reject({ status: false, Message: "Something went wrong." });
        } else {
          if (changePasswordResult.affectedRows > 0) {
            resolve({ status: true, Message: "Success." });
          } else {
            resolve({ status: false, Message: "Something Went wrong." });
          }
        }
      })
    }).catch(err => {
      reject({ status: false, Message: "pelase Try after some time" });
    })
  })
}


function updateuserprofile(setParams, whereCondition, data) {
  return new Promise((resolve, reject) => {
    let query = "UPDATE tbldoctor SET "+setParams+" WHERE "+whereCondition+"";
    connection.query(query, data, (err, updateuserprofileResult) => {
      if (err) {
        console.log("err_updateuserprofile");
        console.log(err);
        if (err.code == 'ER_DUP_ENTRY') {
          resolve({ status: false, Message: "Registration number is present."});
        } else {
          resolve({ status: false, Message: "Something went wrong."});  
        }
      } else {
        console.log("updateuserprofileResult");
        console.log(updateuserprofileResult);
        if (updateuserprofileResult.changedRows > 0) {
          resolve({ status: true, Message: "User Update Successfully." });
        } else {
          resolve({ status: false, Message: "Please check, Doctor should not on board or nothing to change" });
        }
      }
    })
  })
}

module.exports = {
  doctorlogin,
  login_logs,
  GetdoctorByEmail,
  GetdoctorBymobile,
  insertdoctor,
  verifyUser_mobile,
  updateDoctor_otp,
  setForgotPassword,
  getdoctorbyid,
  changePassword,
  updateuserprofile
}