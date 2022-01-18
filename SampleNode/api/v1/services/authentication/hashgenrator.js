var constants = require('../../../../env/constants');
var crypto = require('crypto');


/**
 * generates random string of characters i.e salt
 * @function
 * @param {number} length - Length of the random string.
 */

var genRandomString = function (length) {
    return crypto.randomBytes(Math.ceil(length / 2))
        .toString('hex') /** convert to hexadecimal format */
        .slice(0, length);   /** return required number of characters */
};

/**
 * hash password with sha512.
 * @function
 * @param {string} password - List of required fields.
 * @param {string} salt - Data to be validated.
 */
var sha512 = function (password, salt) {
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt: salt,
        passwordHash: value
    };
};


var genratepasskey = function (password) {
    return new Promise(function (resolve, reject) {
        if (password) {
            var salt = genRandomString(64); /** Gives us salt of length 16 */
            var passwordData = sha512(password, salt);
            resolve({ hash: passwordData.passwordHash, salt: passwordData.salt });
        } else {
            reject({ Status: false, Message: "Something went wrong." });
        }
    })
}

var comparepasskey = function (passkey, hash, salt) {
    return new Promise(function (resolve, reject) {
        const saltFromDb = salt;
        const hashedPassFromDB = hash;

        var passwordData = sha512(passkey, saltFromDb);

        if (passwordData.passwordHash === hashedPassFromDB) {
            resolve({ Status: true, Message: "Passward match" });
        } else {
            reject({ Status: false, Message: "Wrong user name or Password" });
        }
    })
}

// var comparepasskey = function (passkey, hash, salt) {
//     return new Promise(function(resolve,reject){
//         bcrypt.compare(passkey, hash, function(err, res) {
//             if (res) {
//                 resolve(res);
//             }else{
//                 reject(res);
//             }
//         });
//     })
// }

module.exports = {
    genratepasskey,
    comparepasskey
}


// var crypto = require('crypto');
// var btoa = require('btoa')
// console.log("passkey");
// console.log(passkey)
// console.log('salt')
// console.log(salt);
// var combinedPassword = passkey.concat(salt)
// var bytes = btoa(combinedPassword);
// console.log('bytes');
// console.log(bytes);
// var hash = crypto.createHash('sha256').update(bytes.toString('utf8'),'utf8').digest()
// console.log('hash');
// console.log(hash);