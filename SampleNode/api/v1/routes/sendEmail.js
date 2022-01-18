const transporter = require('../../../env/environment-dev').connection.transporter;
const connection = require("../../../env/environment-dev").connection.connection;
var fs = require('fs');
var handlebars = require('handlebars');
var path = require('path');

function registerVerify(receivername, toEmails, otp, subject) {
    return new Promise((resolve, reject) => {
        var EmailTemplatePath = path.join(__dirname, '..', 'emailtemplates', 'registerVerify.html');
        var readHTMLFile = function (path, callback) {
            fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
                if (err) {
                    throw err;
                    callback(err);
                } else {
                    callback(null, html);
                }
            });
        };
        readHTMLFile(EmailTemplatePath, function (err, html) {
            var template = handlebars.compile(html);
            var replacements = {
                // favimage: "http://pio.npav.net:3000/assets/images/NPAVFLAT.svg",
                Name: receivername,
                OTP: otp,
            };
            var htmlToSend = template(replacements);
            var mailOptions = {
                from: "mandarj0119@gmail.com",
                to: toEmails,
                subject: subject,
                html: htmlToSend
            };
            transporter.sendMail(mailOptions, function (error, response) {

                if (error) {
                    resolve(error)
                } else {
                    resolve(response)
                }
            })
        });
    })
}

function verifySuccess(receivername, toEmails, Message = "Verification successfull.") {
    return new Promise((resolve, reject) => {
        var mailmatter = "<p>Hello <strong>" + receivername + "!</strong></p>";
        mailmatter += "<p style='margin-top:5px;'>"+Message+"</p>";
        mailmatter += "<p style='margin-top:5px;'><strong>Thank You!</strong></p>";
        mailmatter += "<p style='margin-top:5px;'><strong>NPAV</strong></p><p>________________________________________</p>"

        var mailOptions = {
            from: "mandarj0119@gmail.com",
            to: toEmails,
            subject: 'Veirfication success.',
            html: mailmatter
        };
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
                resolve(error)
            } else {
                resolve(info)
            }
        });
    });
}

module.exports = {
    registerVerify,
    verifySuccess
}