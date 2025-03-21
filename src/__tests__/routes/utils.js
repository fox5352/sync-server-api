const CryptoJS = require("crypto-js");

function encrypt(data, key) {
    return CryptoJS.AES.encrypt(JSON.stringify(data), key).toString();    
}

function decrypt(data, key) {
    return JSON.parse(CryptoJS.AES.decrypt(data, key).toString(CryptoJS.enc.Utf8));
}

module.exports = {
    encrypt,
    decrypt
};