/***** Constants *****/
const colorReset = "\x1b[0m";
const colorRed = "\x1b[31m";
const colorGreen = "\x1b[32m";
const colorYellow = "\x1b[33m";
const colorBlue = "\x1b[34m";

/***************************************************
 *
 * 					Log function
 *
 * *************************************************/

function _logStatus(logMsg, status) {
  if (status) {
    console.log(`${logMsg}${colorGreen}%s${colorReset}`, `${status}`);
  } else {
    console.log(`${logMsg}${colorRed}%s${colorReset}`, `${status}`);
  }
}

async function _logSchema(device) {
  await device.get({ schema: true }).then(data => console.log(data));
}

module.exports = {
  logStatus: _logStatus,
  logSchema: _logSchema
};
