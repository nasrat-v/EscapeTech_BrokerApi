/***** Imports *****/
var superagent = require("superagent");

/***** Constants *****/
const ledMessengerIp = "192.168.2.3";
const ledMessengerUrl = "http://" + ledMessengerIp + "/";

/***************************************************
 *
 * 					Led Messenger
 *
 * *************************************************/

async function _setStatus(msg, its, spd, stc) {
  var result;

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
  setStatus: _setStatus
};
