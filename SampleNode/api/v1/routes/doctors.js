var express = require('express');
var router = express.Router();
var handlers = require('../../../handlers');
var middleware = require('../../../middlewares');
var checkconnection = require('./checkconnection')
const doctorService = require('../services/doctorService');
const hasgenrator = require('../services/authentication/hashgenrator');
const cons = require('consolidate');
const V1Constants = require('../../../env/constants').CONSTANTS;
const multer = require('../services/multer');

/**
 * @api {post} authentication/doctorRegister 1.1. Doctor registration.
 * @apiVersion 0.1.0
 * @apiName Register
 * @apiGroup 1. Doctor
 * @apiPermission Doctor
 *
 * @apiParam {Number} mobile Doctor Mobile number.
 * @apiParam {String} email Doctor email.
 * @apiParam {String} password Doctor password.
 * @apiParam {String} name Doctor name.
 * @apiParam {String} gender Doctor Gender i.e 'Male', 'Female', 'TransGender'
 * 
 * @apiDescription * Register service will help to register Doctor using listed fields.
 *
 *
 * @apiSuccess {Boolean} status status of the API i.e true.
 * @apiSuccess {String} Message  Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "Message": "Success."
 *     }
 *
 * @apiError {Boolean} status status of the API i.e false.
 * @apiError {String} Message  Error message.
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Something went wrong."
 *     }
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Email Already Registered"
 *     }
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Mobile already taken"
 *     }
 * 
 */

router.post('/doctorRegister', [checkconnection.connection], function (req, res, next) {
    doctorService.GetdoctorByEmail(req.body.email).then(GetdoctorByEmailResult => {
      if (GetdoctorByEmailResult.status == false) {
        doctorService.GetdoctorBymobile(req.body.mobile).then(GetdoctorBymobileresult => {
          if (GetdoctorBymobileresult.status == false) {
            hasgenrator.genratepasskey(req.body.password).then(genratepasskeyResult => {
              let Mobile_otp = Math.floor(1000 + Math.random() * 9000);
              doctorService.insertdoctor(req.body.name, req.body.gender, req.body.email, req.body.mobile, 0, req.body.password, genratepasskeyResult.salt, genratepasskeyResult.hash, Mobile_otp).then(insertdoctorResult => {
                if (insertdoctorResult.status) {
                    const params = new URL(V1Constants.SMS_API_URL);
                    params.searchParams.append('username', V1Constants.SMS_USER_NAME);
                    params.searchParams.append('password', V1Constants.SMS_PASS);
                    params.searchParams.append('mobile', req.body.mobile);
                    params.searchParams.append('sendername', V1Constants.SMS_SENDER);
                    params.searchParams.append('message', "Dear Customer, Your OTP for user registration is " + Mobile_otp + ". Use OTP for registration");
                    handlers.remoteapicall.getAPICall(params).then(result => {
                      res.jsonp({ status: true, mobile: req.body.mobile, otp: Mobile_otp,  Message: "Success" });
                    }).catch(error => {
                      console.log("errorapiremote");
                      console.log(error);
                      res.jsonp({ status: true, Message: "Registration success but invalid mobile number" });
                    })
                } else {
                  res.jsonp({ status: false, Message: "pelase Try after some time" });
                }
              }).catch(err => {
                res.jsonp(err);
              })
            }).catch(err => {
              res.jsonp({ status: false, Message: "pelase Try after some time" });
            })
          } else {
            res.jsonp({ status: false, Message: "Mobile already taken" });
          }
        })
      } else {
        res.jsonp({ status: false, Message: "Email Already Registered" });
      }
    }).catch(error => {
      res.jsonp(error);
    })
  });
  


/**
 * @api {post} authentication/doctorLogin 1.2. Doctor login
 * @apiVersion 0.1.0
 * @apiName Login
 * @apiGroup 1. Doctor
 * @apiPermission Doctor
 *
 * @apiDescription * Doctor Login service will help to login Verified doctor using email/mobile and password. (Mobile Verification Mandatory)
 * 
 * @apiParam {String} email/mobile Doctors unique email or mobile.
 * @apiParam {String} password Doctors Password.
 *
 * @apiSuccess {String} status status of the API i.e true.
 * @apiSuccess {String} Message Message.
 * @apiSuccess {String} token  authentication Token.
 * @apiSuccess {Object} doctorDetails  Object of doctor profile details.
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "Message": "Success.",
 *       "token": "YOUR-AUTHENTICATION-TOKEN",
 *       "doctorDetails" :{Object of Doctor details}
 *     }
 *
 * @apiError doctorNotFound wrong email or password. / Doctor not active. / Something went wrong.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Wrong email or password. / Something went wrong."
 *       "code": 401
 *     }
 *     HTTP/1.1 403 user Not
 *     {  
 *       "status" : false,
 *       "Message": "Doctor not active.",
 *       "code": 403
 *     }
 */
router.post('/doctorLogin', [checkconnection.connection], function (req, res, next) {
    doctorService.doctorlogin(req).then(doctorloginResult=>{
      if (doctorloginResult.code) {
        res.status(doctorloginResult.code);
      }
      res.jsonp(doctorloginResult);
    }).catch(error=>{
        res.jsonp(error);
    })
});


 /**
 * @api {post} authentication/verifyuser 1.3. Mobile verification.
 * @apiVersion 0.1.0
 * @apiName Verify Mobile
 * @apiGroup 1. Doctor
 * @apiPermission Doctor
 *
 * @apiParam {Number} mobile User Mobile.
 * @apiParam {number} otp Doctor OTP.
 * 
 * @apiDescription * Verify user API will help to activate user. Use after registration successful.
 *
 *
 * @apiSuccess {Boolean} status status of the API i.e true.
 * @apiSuccess {String} Message  Success message.
 * @apiSuccess {String} token  Authinticatin Token.
 * @apiSuccess {Object} doctorDetails  Object of doctor profile details.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "Message": "User Verified Successfully."
 *       "token": "YOUR-AUTHENTICATION-TOKEN",
 *       "doctorDetails" :{Object of Doctor details}
 *     }
 *
 * @apiError {Boolean} status status of the API i.e false.
 * @apiError {String} Message  Error message.
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Something went wrong."
 *     }
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "User not found"
 *     }
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Wrong OTP"
 *     }
 * 
 */
router.post('/verifyuser', [checkconnection.connection], function (req, res, next) {
  doctorService.GetdoctorBymobile(req.body.mobile).then(GetdoctorBymobileresult => {
    if (GetdoctorBymobileresult.status == false) {
      res.jsonp({ status: false, Message: "User not found" });
    } else {
      if (GetdoctorBymobileresult.doctor.IsActive == 1) {
        res.jsonp({ status: false, Message: "User Already Active" });
      } else {
        if (GetdoctorBymobileresult.doctor.otp_mobile == req.body.otp) {
          doctorService.verifyUser_mobile(GetdoctorBymobileresult.doctor.doctor_id, "mobile").then(verifyUser_mobileResult => {
            if (verifyUser_mobileResult.status) {
              var datatosend = {
                IsEnabled: GetdoctorBymobileresult.doctor.isActive,
                email: GetdoctorBymobileresult.doctor.email,
                id: GetdoctorBymobileresult.doctor.doctor_id,
                name: GetdoctorBymobileresult.doctor.name,
                mobile: GetdoctorBymobileresult.doctor.mobile
              }
              handlers.jwtHandler.genUsrToken({ status: true, data: datatosend, Message: "Success." }).then(function (params) {
                // res.jsonp(params);
                doctorService.login_logs(req, { status: true, Message: 'Verification success' }, 'vewrify user').then((result) => {
                  delete GetdoctorBymobileresult.doctor.password;
                  delete GetdoctorBymobileresult.doctor.Password_Salt;
                  delete GetdoctorBymobileresult.doctor.Password_Hash;
                  delete GetdoctorBymobileresult.doctor.Forgot_Pass_OTP;
                  delete GetdoctorBymobileresult.doctor.otp_mobile;
                  delete GetdoctorBymobileresult.doctor.otp_email;
                  params.doctorDetails = GetdoctorBymobileresult.doctor;
                  res.jsonp(params);
                }).catch(loginlogerror => {
                  res.jsonp(loginlogerror);
                })
              }).catch(function (error) {
                res.jsonp(error);
              })
            } else {
              res.jsonp(verifyUser_mobileResult);
            }
          }).catch(error => {
            res.jsonp(error);
          })
        } else {
          res.jsonp({ status: false, Message: "Wrong OTP" });
        }
      }
    }
  }).catch(error => {
    res.jsonp({ status: false, Message: "pelase Try after some time" });
  })
});



/**
 * @api {post} authentication/resendotp_mobile 1.4. Resend OTP for Mobile verification.
 * @apiVersion 0.1.0
 * @apiName Resend OTP For Mobile
 * @apiGroup 1. Doctor
 *
 * @apiDescription * Resend OTP Service is use to resend OTP while registration if not receive. ( Use if OTP do not received while registration )
 * 
 * @apiParam {String} mobile User Mobile number.
 * 
 *
 * @apiSuccess {Boolean} status Status of the API i.e true.
 * @apiSuccess {String} Message  Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "Message": "Success."
 *     }
 *
 * @apiError {Boolean} status Status of the API i.e false.
 * @apiError {String} Message  Error message.
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Something went wrong." / "pelase Try after some time"
 *     }
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "User not found." / "User Already Active", "Invalid mobile number" / "Please contact to supprot"->"If status of user other than active/inactive"
 *     }
 */

router.post('/resendotp_mobile', (req, res, next) => {
  doctorService.GetdoctorBymobile(req.body.mobile).then(GetdoctorBymobileresult => {
    if (GetdoctorBymobileresult.status == false) {
      res.jsonp({ status: false, Message: "User not found" });
    } else {
      if (GetdoctorBymobileresult.doctor.isActive == 1) {
        res.jsonp({ status: false, Message: "User Already Active" });
      } else if (GetdoctorBymobileresult.doctor.isActive == 0) {
        let otp = Math.floor(1000 + Math.random() * 9000);
        doctorService.updateDoctor_otp(GetdoctorBymobileresult.doctor.doctor_id, otp, req.body.mobile, "requestOTP_mobile").then(updateDoctor_otpResult => {
          if (updateDoctor_otpResult.status) {
            const params = new URL(V1Constants.SMS_API_URL);
            params.searchParams.append('username', V1Constants.SMS_USER_NAME);
            params.searchParams.append('password', V1Constants.SMS_PASS);
            params.searchParams.append('mobile', req.body.mobile);
            params.searchParams.append('sendername', V1Constants.SMS_SENDER);
            params.searchParams.append('message', "Dear Customer, Your OTP for user Verification is " + otp + ". Use OTP for Verification");
            handlers.remoteapicall.getAPICall(params).then(result => {
              res.jsonp({ status: true,  Message: "Success" });
            }).catch(error => {
              res.jsonp({ status: true, Message: "Invalid mobile number" });
            })
          } else {
            res.jsonp({ status: false, Message: "pelase Try after some time" });
          }
        }).catch(err => {
          console.log("err")
          console.log(err)
          res.jsonp({ status: false, Message: "pelase Try after some time" });
        })
      } else {
        res.jsonp({ status: false, Message: "Please contact to supprot" });
      }
    }
  })
})


/**
 * @api {post} authentication/fgtpass_otp 1.5. Send OR Resend OTP For Forgot Password
 * @apiVersion 0.1.0
 * @apiName Send OR Resend OTP To Forgot Password
 * @apiGroup 1. Doctor
 *
 * @apiDescription * Forgot Password OTP is used to send or Resend Forgot Password OTP.
 * 
 * @apiParam {String} mobile User Mobile number.
 * 
 * @apiSuccess {Boolean} status Status of the API i.e true.
 * @apiSuccess {String} Message  Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "Message": "Success."
 *     }
 *
 * @apiError {Boolean} status Status of the API i.e false.
 * @apiError {String} Message  Error message.
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Something went wrong." / "pelase Try after some time"
 *     }
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "User not found." /  "Invalid mobile number" / "Please contact to supprot"->"If status of user other than active/inactive"
 *     }
 */

router.post('/fgtpass_otp', (req, res, next) => {
  doctorService.GetdoctorBymobile(req.body.mobile).then(GetdoctorBymobileresult => {
    if (GetdoctorBymobileresult.status == false) {
      res.jsonp({ status: false, Message: "User not found" });
    } else {
      if (GetdoctorBymobileresult.doctor.isActive == 1) {
        let otp = Math.floor(1000 + Math.random() * 9000);
        doctorService.updateDoctor_otp(GetdoctorBymobileresult.doctor.doctor_id, otp, req.body.mobile, "forgotpass").then(updateDoctor_otpResult => {
          if (updateDoctor_otpResult.status) {
            const params = new URL(V1Constants.SMS_API_URL);
            params.searchParams.append('username', V1Constants.SMS_USER_NAME);
            params.searchParams.append('password', V1Constants.SMS_PASS);
            params.searchParams.append('mobile', req.body.mobile);
            params.searchParams.append('sendername', V1Constants.SMS_SENDER);
            params.searchParams.append('message', "Dear Customer, Your OTP for Forgot Password is " + otp + ". Use OTP for Forgot Password");
            handlers.remoteapicall.getAPICall(params).then(result => {
              res.jsonp({ status: true,  Message: "Success" });
            }).catch(error => {
              res.jsonp({ status: true, Message: "Invalid mobile number" });
            })
          } else {
            res.jsonp({ status: false, Message: "pelase Try after some time" });
          }
        }).catch(err => {
          res.jsonp({ status: false, Message: "pelase Try after some time" });
        })
      } else if (GetdoctorBymobileresult.doctor.isActive == 0) {
        res.jsonp({ status: false, Message: "User not Active" });
      } else {
        res.jsonp({ status: false, Message: "Please contact to supprot" });
      }
    }
  })
})



/**
 * @api {post} authentication/makePassword 1.6. Make password (OTP).
 * @apiVersion 0.1.0
 * @apiName Make Password
 * @apiGroup 1. Doctor
 *
 * @apiParam {String} username User mobile or Email.
 * @apiParam {String} password User New Password.
 * @apiParam {Number} otp Otp.
 * 
 * @apiDescription * Make password API will help to make forgot password. Use after fgtpass_otp Service call to make new password using listed fields.
 *
 *
 * @apiSuccess {Boolean} status Status of the API i.e true.
 * @apiSuccess {String} Message  Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "Message": "Success."
 *     }
 *
 * @apiError {Boolean} status Status of the API i.e false.
 * @apiError {String} Message  Error message.
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Something went wrong."
 *     }
 *   
 */

router.post('/makePassword', [checkconnection.connection], function (req, res, next) {
  doctorService.GetdoctorByEmail(req.body.username).then(GetdoctorByEmailResult => {
    if (GetdoctorByEmailResult.status == false) {
      doctorService.GetdoctorBymobile(req.body.username).then(GetdoctorBymobile => {
        if (GetdoctorBymobile.status == false) {
          res.jsonp({ status: false, Message: "User not found" });
        } else {
          if (GetdoctorBymobile.doctor.isActive == 1) {
            if (GetdoctorBymobile.doctor.Forgot_Pass_OTP == req.body.otp) {
              doctorService.setForgotPassword(GetdoctorBymobile.doctor.doctor_id, req.body.password).then(setForgotPasswordResult => {
                if (setForgotPasswordResult.status) {
                  // let Toemails = ['nikhilk.banchhor.nkb277@gmail.com', 'mandar0119@outlook.com', GetdoctorBymobile.doctor.email];
                  // sendmail.verifySuccess(GetdoctorBymobile.doctor.Full_Name, Toemails, "Password reset successfully").then(verifySuccessResult => {
                  //   res.jsonp(setForgotPasswordResult);
                  // })
                  res.jsonp(setForgotPasswordResult);
                } else {
                  res.jsonp(setForgotPasswordResult);
                }
              }).catch(error => {
                res.jsonp(error);
              })
            } else {
              res.jsonp({ status: false, Message: "Wrong OTP" });
            }
          } else if (GetdoctorBymobile.doctor.isActive == 0) {
            res.jsonp({ status: false, Message: "User not Active" });
          } else {
            res.jsonp({ status: false, Message: "Please Contact to supprot" });
          }
        }
      }).catch(error => {
        console.log(error);
        res.jsonp({ status: false, Message: "pelase Try after some time" });
      })
    } else {
      if (GetdoctorByEmailResult.doctor.isActive == 1) {

        if (GetdoctorByEmailResult.doctor.Forgot_Pass_OTP == req.body.otp) {
          doctorService.setForgotPassword(GetdoctorByEmailResult.doctor.doctor_id, req.body.password).then(setForgotPasswordResult => {
            if (setForgotPasswordResult.status) {
              // let Toemails = ['nikhilk.banchhor.nkb277@gmail.com', 'mandar0119@outlook.com', GetdoctorByEmailResult.doctor.Email];
              // sendmail.verifySuccess(GetdoctorByEmailResult.doctor.name, Toemails, "Password reset successfully").then(verifySuccessResult => {
              //   res.jsonp(setForgotPasswordResult);
              // })
              res.jsonp(setForgotPasswordResult);
            } else {
              res.jsonp(setForgotPasswordResult);
            }
          }).catch(error => {
            res.jsonp(error);
          })
        } else {
          res.jsonp({ status: false, Message: "Wrong OTP" });
        }
      } else {
        res.jsonp({ status: false, Message: "User not Active" });
      }
    }
  }).catch(error => {
    res.jsonp({ status: false, Message: "pelase Try after some time" });
  })
});



/**
 * @api {post} authentication/changePassword 1.7. Change password.
 * @apiVersion 0.1.0
 * @apiName Change Password
 * @apiGroup 1. Doctor
 * 
 * @apiHeader {String} Authorization users login access-token.
 * 
 * @apiParam {String} password User Current Password.
 * @apiParam {String} newpassword User New Password.
 * 
 * @apiDescription * Change Password API will help to change logged in use from Profile page.
 *
 * @apiSuccess {Boolean} status Status of the API i.e true.
 * @apiSuccess {String} Message  Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "Message": "Success."
 *     }
 *
 * @apiError {Boolean} status Status of the API i.e false.
 * @apiError {String} Message  Error message.
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Something went wrong." / "Current password doesnot match." / "User not Active"
 *     }
 *   
 */

router.post('/changePassword', [middleware.authenticate.autntctTkn, checkconnection.connection], function (req, res, next) {
  doctorService.getdoctorbyid(req.user.data.id).then(getdoctorbyidResult=> {
    if (getdoctorbyidResult.status == false) {
      res.jsonp({ status: false, Message: "User not found" });
    } else {
      if (getdoctorbyidResult.doctor.isActive == 1) {
        hasgenrator.comparepasskey(req.body.password, getdoctorbyidResult.doctor.Password_Hash, getdoctorbyidResult.doctor.Password_Salt).then(comparepasskeyResult => {
          doctorService.changePassword(req.body.newpassword, getdoctorbyidResult.doctor.doctor_id).then(changePasswordresult=>{
            if (changePasswordresult.status = true) {
              res.jsonp(changePasswordresult);    
            } else {
              res.jsonp(changePasswordresult);    
            }
          }).catch(error=>{
            res.jsonp(error);  
          })
        }).catch(error => {
          res.jsonp({ status: false, Message: "Current password doesnot match." });
        })
      } else {
        res.jsonp({ status: false, Message: "User not Active" });
      }
    }
  }).catch(error => {
    res.jsonp({ status: false, Message: "pelase Try after some time" });
  })
});


/**
 * @api {post} authentication/uploadprofile 1.8. Upload Profile image.
 * @apiVersion 0.1.0
 * @apiName Upload profile
 * @apiGroup 1. Doctor
 * @apiPermission Doctor.
 *
 * @apiHeader {String} Authorization users login access-token.
 * 
 * @apiParam {Base64} logo image to upload as profile image.
 * 
 * @apiDescription * Upload Profile image service will help to add profile image of login user.
 *
 *
 * @apiSuccess {Boolean} status status of the API i.e true.
 * @apiSuccess {String} Message  Success message.
 * @apiSuccess {String} profile  image name.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "Message": "Success."
 *        "profile" : "IMAGE URL"
 *     }
 *
 * @apiError {Boolean} status status of the API i.e false.
 * @apiError {String} Message  Error message.
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Something went wrong."
 *     }
 * 
 */

router.post('/uploadprofile', [middleware.authenticate.autntctTkn, checkconnection.connection, multer.userUploadLogo], function (req, res, next) {
  let setparams = "image=?, updated_on=current_timestamp()";
  let data = [req.body.filename, req.user.data.id];
  let wherecondition = "doctor_id=?";
  doctorService.updateuserprofile(setparams, wherecondition, data).then(updatehealthcareprofileResult => {
      if (updatehealthcareprofileResult.status == 1) {
        updatehealthcareprofileResult.profile = req.body.filename;
      }
      res.jsonp(updatehealthcareprofileResult);
    }).catch(err => {
      res.jsonp(err);
    })
});



/**
 * @api {post} authentication/upadteprofile 1.9. Update Profile details.
 * @apiVersion 0.1.0
 * @apiName Update profile
 * @apiGroup 1. Doctor
 * @apiPermission Doctor.
 *
 * @apiHeader {String} Authorization users login access-token.
 * 
 * @apiParam {String} name Doctor name.
 * @apiParam {String} gender Doctor Gender i.e 'Male', 'Female', 'TransGender'
 * @apiParam {String} dob Date Of Birth
 * @apiParam {String} specialization Doctors Specialization.
 * @apiParam {String} reg_no Registration Number.
 * @apiParam {String} education In short Education details of Doctor.
 * @apiParam {Number} experience Experience In years.
 * 
 * @apiDescription * Update profile Service help to update logged in User.
 *
 * @apiSuccess {Boolean} status status of the API i.e true.
 * @apiSuccess {String} Message  Success message.
 * @apiSuccess {String} profile  image name.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "Message": "Success."
 *     }
 *
 * @apiError {Boolean} status status of the API i.e false.
 * @apiError {String} Message  Error message.
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Something went wrong."
 *     }
 * 
 */

router.post('/upadteprofile', [middleware.authenticate.autntctTkn, checkconnection.connection], function (req, res, next) {
  let setparams = "name=?, gender=?, dob=?, specialization=?, reg_no=?, education=?, experience=?, updated_on=current_timestamp()";
  let data = [req.body.name, req.body.gender, req.body.dob, req.body.specialization, req.body.reg_no, req.body.education, req.body.experience, req.user.data.id];
  let wherecondition = "doctor_id=?";
  doctorService.updateuserprofile(setparams, wherecondition, data).then(upadteprofileResult => {
      if (upadteprofileResult.status == 1) {
        upadteprofileResult.profile = req.body.filename;
      }
      res.jsonp(upadteprofileResult);
    }).catch(err => {
      res.jsonp(err);
    })
});

/**
 * @api {post} authentication/changeMobile 2.0 Change Mobile Number
 * @apiVersion 0.1.0
 * @apiName Change Mobile Number
 * @apiGroup 1. Doctor
 *
 * @apiDescription * Change Mobile helps to change mobile of login user (Use from Profile page).
 * 
 * @apiHeader {String} Authorization users login access-token.
 * 
 * @apiParam {String} mobile User Mobile number.
 *
 * @apiSuccess {Boolean} status Status of the API i.e true.
 * @apiSuccess {String} Message  Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "Message": "OTP send on your mobile."
 *     }
 *
 * @apiError {Boolean} status Status of the API i.e false.
 * @apiError {String} Message  Error message.
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Something went wrong." / "pelase Try after some time"
 *     }
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "User not found." /  "Invalid mobile number" / "Please contact to supprot"->"If status of user other than active/inactive"
 *     }
 */

router.post('/changeMobile', [middleware.authenticate.autntctTkn, checkconnection.connection], (req, res, next) => {
  doctorService.getdoctorbyid(req.user.data.id).then(getdoctorbyidResult=> {
    if (getdoctorbyidResult.status == false) {
      res.jsonp({ status: false, Message: "User not found" });
    } else {
      if (getdoctorbyidResult.doctor.isActive == 1 && getdoctorbyidResult.doctor.mobile != req.body.mobile) {
        doctorService.GetdoctorBymobile(req.body.mobile).then(GetdoctorBymobileresult => {
          if (GetdoctorBymobileresult.status == false) {
              let otp = Math.floor(1000 + Math.random() * 9000);
              doctorService.updateDoctor_otp(getdoctorbyidResult.doctor.doctor_id, otp, req.body.mobile, "changemobile", ).then(updateDoctor_otpResult => {
                if (updateDoctor_otpResult.status) {
                  const params = new URL(V1Constants.SMS_API_URL);
                  params.searchParams.append('username', V1Constants.SMS_USER_NAME);
                  params.searchParams.append('password', V1Constants.SMS_PASS);
                  params.searchParams.append('mobile', req.body.mobile);
                  params.searchParams.append('sendername', V1Constants.SMS_SENDER);
                  params.searchParams.append('message', "Dear Customer, Your OTP for Change Mobile is " + otp + ". Use OTP for Forgot Password");
                  handlers.remoteapicall.getAPICall(params).then(result => {
                    res.jsonp({ status: true,  Message: "OTP send on your mobile number." });
                  }).catch(error => {
                    res.jsonp({ status: true, Message: "Invalid mobile number" });
                  })
                } else {
                  res.jsonp({ status: false, Message: "pelase Try after some time" });
                }
              }).catch(err => {
                res.jsonp({ status: false, Message: "pelase Try after some time" });
              })
          } else {
            res.jsonp({ status: false, Message: "Mobile already taken" });
          }
        })
      } else {
        if (getdoctorbyidResult.doctor.mobile == req.body.mobile) {
          res.jsonp({ status: false, Message: "You Are using same mobile number to change." });
        } else {
          res.jsonp({ status: false, Message: "User not Active" });  
        }
      }
    }
  })
})

/**
 * @api {post} authentication/changeEmail 2.1 Change Email
 * @apiVersion 0.1.0
 * @apiName Change Email
 * @apiGroup 1. Doctor
 *
 * @apiDescription * Change Email helps to change email of login user (Use from Profile page).
 * 
 * @apiHeader {String} Authorization users login access-token.
 * 
 * @apiParam {String} email User email.
 *
 * @apiSuccess {Boolean} status Status of the API i.e true.
 * @apiSuccess {String} Message  Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "Message": "OTP send on your mobile number."
 *     }
 *
 * @apiError {Boolean} status Status of the API i.e false.
 * @apiError {String} Message  Error message.
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Something went wrong." / "pelase Try after some time"
 *     }
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "User not found." / "Please contact to supprot"->"If status of user other than active/inactive"
 *     }
 */

router.post('/changeEmail', [middleware.authenticate.autntctTkn, checkconnection.connection], (req, res, next) => {
  doctorService.getdoctorbyid(req.user.data.id).then(getdoctorbyidResult=> {
    if (getdoctorbyidResult.status == false) {
      res.jsonp({ status: false, Message: "User not found" });
    } else {
      if (getdoctorbyidResult.doctor.isActive == 1 && getdoctorbyidResult.doctor.email != req.body.email) {
        doctorService.GetdoctorByEmail(req.body.email).then(GetdoctorByemailresult => {
          if (GetdoctorByemailresult.status == false) {
              let otp = Math.floor(1000 + Math.random() * 9000);
              doctorService.updateDoctor_otp(getdoctorbyidResult.doctor.doctor_id, otp, req.body.email, "changeemail", ).then(updateDoctor_otpResult => {
                if (updateDoctor_otpResult.status) {
                  const params = new URL(V1Constants.SMS_API_URL);
                  params.searchParams.append('username', V1Constants.SMS_USER_NAME);
                  params.searchParams.append('password', V1Constants.SMS_PASS);
                  params.searchParams.append('mobile', getdoctorbyidResult.doctor.mobile);
                  params.searchParams.append('sendername', V1Constants.SMS_SENDER);
                  params.searchParams.append('message', "Dear Customer, Your OTP for Change Email is " + otp + ". Use OTP for Forgot Password");
                  handlers.remoteapicall.getAPICall(params).then(result => {
                    res.jsonp({ status: true,  Message: "OTP send on your mobile number."});
                  }).catch(error => {
                    res.jsonp({ status: true, Message: "Invalid mobile number" });
                  })
                } else {
                  res.jsonp({ status: false, Message: "pelase Try after some time" });
                }
              }).catch(err => {
                res.jsonp({ status: false, Message: "pelase Try after some time" });
              })
          } else {
            res.jsonp({ status: false, Message: "Email already registered" });
          }
        })
      } else {
        if (getdoctorbyidResult.doctor.email == req.body.email) {
          res.jsonp({ status: false, Message: "You Are using same email to change." });
        } else {
          res.jsonp({ status: false, Message: "User not Active" });  
        }
      }
    }
  })
})

/**
 * @api {post} authentication/verifyotpwithflag 2.2. Verify Mobile or Email of Login User.
 * @apiVersion 0.1.0
 * @apiName Verify Mobile or email Login User
 * @apiGroup 1. Doctor
 * 
 * @apiHeader {String} Authorization users login access-token.
 * 
 * @apiParam {String} otp Otp to verify mobile or email.
 * @apiParam {String} flag flag to check verify key.
 * 
 * @apiDescription * Verify Mobile API will help to Verify Updated mobile number or email of loged in user (use from profile page).
 *
 * @apiSuccess {Boolean} status Status of the API i.e true.
 * @apiSuccess {String} Message  Success message.
 *
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "Message": "Success."
 *     }
 *
 * @apiError {Boolean} status Status of the API i.e false.
 * @apiError {String} Message  Error message.
 * 
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Something went wrong." / "User not Active"
 *     }
 *   
 */

router.post('/verifyotpwithflag', [middleware.authenticate.autntctTkn, checkconnection.connection], function (req, res, next) {
  doctorService.getdoctorbyid(req.user.data.id).then(getdoctorbyidResult=> {
    if (getdoctorbyidResult.status == false) {
      res.jsonp({ status: false, Message: "User not found" });
    } else {
      if (getdoctorbyidResult.doctor.isActive == 1) {
        if (req.body.flag == "mobile") {
           var condotition = getdoctorbyidResult.doctor.otp_mobile == req.body.otp
        } else {
          var condotition = getdoctorbyidResult.doctor.otp_email == req.body.otp
        }
        if (condotition) {
          doctorService.verifyUser_mobile(req.user.data.id, req.body.flag).then(verifyUser_mobileResult=>{
            res.jsonp(verifyUser_mobileResult);
          }).catch(error=>{
            res.jsonp(error);
          })
        } else {
          res.jsonp({ status: false, Message: "Wrong OTP" });
        }
      } else {
        res.jsonp({ status: false, Message: "User not Active" });
      }
    }
  }).catch(error => {
    res.jsonp({ status: false, Message: "Pelase try after some time" });
  })
});

/**
 * @api {post} authentication/getDoctor 2.3. Get Doctor Using mobile number
 * @apiVersion 0.1.0
 * @apiName Get Doctor
 * @apiGroup 1. Doctor
 * @apiPermission Doctor
 *
 * @apiDescription * Get Doctor service will help to get doctor if exist (User only search while adding in helthcare).
 * 
 * @apiHeader {String} Authorization users login access-token.
 * 
 * @apiParam {String} mobile mobile number.
 *
 * @apiSuccess {String} status status of the API i.e true.
 * @apiSuccess {String} Message Message.
 * @apiSuccess {Object} doctorDetails  Object of doctor profile details.
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "Message": "Success.",
 *       "doctorDetails" :{Object of Doctor details}
 *     }
 *     HTTP/1.1 200 OK
 *     {
 *       "status": false,
 *       "Message": "Success.",
 *       "doctorDetails" :null
 *     }
 *
 * @apiError doctorNotFound Something went wrong./ Invalid Transation.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "User not found. / Something went wrong."
 *       "code": 303
 *     }
 * * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Invalid Transation.",
 *       "code": 303
 *     }
 */
router.post('/getDoctor', [middleware.authenticate.autntctTkn, checkconnection.connection], function (req, res, next) {
  doctorService.GetdoctorBymobile(req.body.mobile).then(GetdoctorBymobileResult=>{
    if (GetdoctorBymobileResult.status == 1) {
      console.log("GetdoctorBymobileResult.doctor")
      console.log(req.user.data.id == parseInt(GetdoctorBymobileResult.doctor.doctor_id))
      if (req.user.data.id != GetdoctorBymobileResult.doctor.doctor_id) {
        let doctorDetails =  {
          "name" : GetdoctorBymobileResult.doctor.name,
          "doctor_id": GetdoctorBymobileResult.doctor.doctor_id, 
          "mobile": GetdoctorBymobileResult.doctor.mobile
        }
        res.jsonp({status:true, Message:GetdoctorBymobileResult.Message, doctorDetails : doctorDetails });       
      } else {
        res.jsonp({status:false, Message:"Invalid Transation", doctorDetails : null , code :303 });
      }
    } else {
      res.jsonp({status:false, Message:GetdoctorBymobileResult.Message, doctorDetails : null });  
    }
  }).catch(error=>{
      res.jsonp(error);
  })
});



/**
 * @api {post} authentication/getprofile 2.4. Get Login User Details
 * @apiVersion 0.1.0
 * @apiName Get Profile 
 * @apiGroup 1. Doctor
 * @apiPermission Doctor
 *
 * @apiDescription * Get Profile service will help to get login doctors details.
 * 
 * @apiHeader {String} Authorization users login access-token.
 * 
 *
 * @apiSuccess {String} status status of the API i.e true.
 * @apiSuccess {String} Message Message.
 * @apiSuccess {Object} doctor  Object of doctor profile details.
 * 
 * @apiSuccessExample Success-Response:
 *     HTTP/1.1 200 OK
 *     {
 *       "status": true,
 *       "Message": "Success.",
 *       "doctor" :{Object of Doctor details}
 *     }
 *     HTTP/1.1 200 OK
 *     {
 *       "status": false,
 *       "Message": "Success.",
 *       "doctor" :null
 *     }
 *
 * @apiError doctorNotFound Something went wrong./ Invalid Transation.
 *
 * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "User not found. / Something went wrong."
 *       "code": 303
 *     }
 * * @apiErrorExample Error-Response:
 *     HTTP/1.1 401 Not Found
 *     {  
 *       "status" : false,
 *       "Message": "Invalid Transation.",
 *       "code": 303
 *     }
 */

router.post('/getprofile', [middleware.authenticate.autntctTkn, checkconnection.connection], (req, res, next)=>{
  doctorService.getdoctorbyid(req.user.data.id).then(getdoctorbyidResult=> {
    res.jsonp(getdoctorbyidResult)
  }).catch(error=>{
    res.jsonp(error);
  })
})

module.exports = router;