/***** Imports *****/
var net = require("net");

/***** Globals *****/
var armClient = new net.Socket();
const _armSuccess = "OK";

/***************************************************
 *
 * 					Init STM ARM Board Client
 *
 * *************************************************/

function _initialise(ipAdress, port) {
  console.log("STM ARM Client initialisation...");

  ipAdress = ipAdress.split(" ").join("");
  armClient.connect(port, ipAdress, function() {
    console.log("\nSTM ARM Client connected on " + ipAdress + ":" + port);
  });
  armClient.on("error", function(err) {
    console.error(err);
  });
}

/***************************************************
 *
 * 					STM ARM Functions
 *
 * *************************************************/

function serverInvokation(funcName) {
  armClient.write(funcName);
}

function _setEventListener(callback) {
  armClient.on("data", result =>
    callback(
      result
        .toString()
        .split(" ")
        .join("")
    )
  );
}

function _turnOnLed() {
  return serverInvokation("ledOn");
}

async function _turnOffLed(callback) {
  return serverInvokation("ledOff", callback);
}

function _getTemperature(callback) {
  return serverInvokation("getTemperature", callback);
}

function _getHumidity(callback) {
  return serverInvokation("getHumidity", callback);
}

function _getPressure(callback) {
  return serverInvokation("getPressure", callback);
}

function _isMagnet(callback) {
  return serverInvokation("isMagnet", callback);
}

function _isHorizontal(callback) {
  return serverInvokation("isHorizontal", callback);
}

function _isMoving(callback) {
  return serverInvokation("isMoving", callback);
}

module.exports = {
  armSuccess: _armSuccess,
  initialise: _initialise,
  setEventListener: _setEventListener,
  turnOnLed: _turnOnLed,
  turnOffLed: _turnOffLed,
  getTemperature: _getTemperature,
  getHumidity: _getHumidity,
  getPressure: _getPressure,
  isMagnet: _isMagnet,
  isHorizontal: _isHorizontal,
  isMoving: _isMoving
};
