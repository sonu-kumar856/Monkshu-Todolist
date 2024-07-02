const path = require("path");
APP_ROOT = `${path.resolve(`${__dirname}/../../`)}`;
exports.APP_ROOT = APP_ROOT;
exports.CONF_DIR = `${APP_ROOT}/conf`;
exports.LIB_PATH = path.resolve(__dirname + "/../lib");
exports.API_RESPONSE_TRUE = { result: true };
exports.API_RESPONSE_FALSE = { result: false };