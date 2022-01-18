var handlers = require('../handlers');

//========================== Load Modules End =============================

var __verifyTok = function (acsTokn) {
    return new Promise(function (resolve, reject) {
        handlers.jwtHandler.verifyUsrToken(acsTokn)
        .then(function (tokenPayload) {
            resolve(tokenPayload);
        })
        .catch(function (err) {
            reject(err);
        })    
    })
    
};

var autntctTkn = function (req, res, next) {
    var acsToken1 = '';
    var acc = req.body.Authorization;
    var acsToken = req.get('Authorization'); 
    if(typeof acsToken !=  'undefined' && acsToken != ''){
        acsToken1 = acsToken;
    }else{
        acsToken1 = acc;
    }

    __verifyTok(acsToken1)
        .then(function (tokenPayload) {
            req.user = tokenPayload;
            next()
        })
        .catch(function (err) {
            res.status(401);
            res.jsonp(err);
        })
}

module.exports = {
    autntctTkn
};