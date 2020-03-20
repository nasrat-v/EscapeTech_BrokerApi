/***** Imports *****/
var net = require("net");

/***** Globals *****/
var armClient = new net.Socket();

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

function serverInvokation(funcName, callback) {
  armClient.on("data", result => {
    var res = result
      .toString()
      .split(" ")
      .join("");

    if (callback) {
      callback(res);
      callback = null;
      return;
    }
  });
  armClient.write(funcName);
}

function _turnOnLed() {
  return serverInvokation("ledOn");
}

async function _turnOffLed() {
  return serverInvokation("ledOff");
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
  initialise: _initialise,
  turnOnLed: _turnOnLed,
  turnOffLed: _turnOffLed,
  getTemperature: _getTemperature,
  getHumidity: _getHumidity,
  getPressure: _getPressure,
  isMagnet: _isMagnet,
  isHorizontal: _isHorizontal,
  isMoving: _isMoving
};
