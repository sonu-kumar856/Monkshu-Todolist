const crypto = require('crypto');

module.exports.uniqid = () => crypto.randomBytes(16).toString("hex");

module.exports.getCurrentTimestamp = () => Math.floor(Date.now() / 1000);