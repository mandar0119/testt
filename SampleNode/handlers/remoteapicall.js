const cons = require('consolidate');
const fetch = require('node-fetch');

function postAPICall(url,data) {
    return new Promise((resolve, reject) => {
        var clientServerOptions = {
            body: JSON.stringify(data),
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            }
        }
        fetch(url, clientServerOptions)
            .then(res => {
                return res
            })
            .then(json => {
                resolve(json);
            }).catch(err => {
                reject({status:0, Message: 'Please try after some time.', error:err})
            });
    })
}

function getAPICall(params) {
    return new Promise((resolve, reject) => {

        var clientServerOptions = {
            method: 'GET',
            // qs : params,
            headers: {
                'Content-Type': 'application/json'
            }
        }

        fetch(params, clientServerOptions)
            .then(res => {
                return res
            })
            .then(json => {
                resolve(json);
            }).catch(err => {
                console.log(err)
                reject({status:0, Message: 'Please try after some time.', error:err})
            });
    })
}

module.exports = {
    postAPICall,
    getAPICall
}