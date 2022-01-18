var jwt = require("jsonwebtoken");
var JWT_SECRET_KEY = "jozLCJ1c2VyX25hbWUiOiJBZG1pbiIsInVzZXJfdHlwZSI6MiwiUm9sZU5hbasdfasdfasdWUiOiJBZG2";
function genUsrToken(user, setExpire) {
    return new Promise(function(resolve,reject){
        let expiresIn = (24*60) - (new Date().getMinutes() + (new Date().getHours()*60));
        var options = {
           expiresIn: expiresIn+'m'
        };
        jwt.sign(user, JWT_SECRET_KEY, options, function (error, token) {
            if (error) {
                reject({status : false, Message : "Something went Wrong, Please try again"});
            } else {
                let params = { status : user.status, Message: "Login Success"}
                params.token = token;
                resolve(params); 
            }
        })
    })
}

function verifyUsrToken(acsTokn) {
    return new Promise(function (resolve, reject) {
        if (acsTokn) {
            return jwt.verify(acsTokn, JWT_SECRET_KEY, function (error, verifyresult) {
                if (error) {
                    reject({status:401, Message : 'Session expired'})
                } else {
                    resolve(verifyresult)
                }
            })
        } else {
            reject({status:false, Message : 'Authintication failed'})
        }
    })
 }


module.exports = {
    genUsrToken,
    verifyUsrToken
};