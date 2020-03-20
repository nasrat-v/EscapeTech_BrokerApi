/***** Imports *****/
var superagent = require("superagent");

/***** Constants *****/
const tuyaError = "Bad Color";
const colorReset = "\x1b[0m";
const colorRed = "\x1b[31m";
const colorGreen = "\x1b[32m";
const colorYellow = "\x1b[33m";
const colorBlue = "\x1b[34m";

/***** Globals *****/
var ledMessengerIp = "";
var ledMessengerUrl = "";

/***************************************************
 *
 * 					Led Messenger
 *
 * *************************************************/

function _setIpAdress(ip) {
  ledMessengerIp = ip;
  ledMessengerUrl = "http://" + ledMessengerIp + "/";
}

async function _setStatus(msg, its, spd, stc) {
  var result;

  if (ledMessengerIp == "" || ledMessengerUrl == "") {
    return;
  }

  console.log(`Set message: ${colorBlue}'%s'${colorReset}`, `${msg}`);
  console.log(`Set intensity: ${its}`);
  console.log(`Set speed: ${spd}`);
  console.log(`Set static: ${stc}`);

  await superagent
    .get(ledMessengerUrl)
    .query({ message: msg, intensity: its, speed: spd, static: stc })
    .then(res => (result = res.text));

  return result;
}

module.exports = {
  setIpAdress: _setIpAdress,
  setStatus: _setStatus
};
