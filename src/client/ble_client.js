/***** Imports *****/
var zeroRpc = require("zerorpc");

/***** Globals *****/
var bleClient = new zeroRpc.Client();

/***************************************************
 *
 * 					Init STM BLE Client
 *
 * *************************************************/

function _initialise(ipAdress, port) {
  console.log("STM BLE Client initialisation...");

  ipAdress = ipAdress.split(" ").join("");
  bleClient.connect("tcp://" + ipAdress + ":" + port);
  bleClient.on("error", function(err) {
    console.error(err);
  });
  connectDevice();
}

/***************************************************
 *
 * 					STM BLE Functions
 *
 * *************************************************/

function serverInvokation(rpcName, callback) {
  bleClient.invoke(rpcName, function(error, result, more) {
    if (error) {
      console.error(error);
    }
    if (callback) {
      callback(result);
    }
  });
}

function connectDevice() {
  return serverInvokation("connect_to_device");
}

function _getTemperature(callback) {
  return serverInvokation("get_temperature", callback);
}

function _getHumidity(callback) {
  return serverInvokation("get_humidity", callback);
}

function _getPressure(callback) {
  return serverInvokation("get_pressure", callback);
}

function _getMagnetometer(callback) {
  return serverInvokation("get_magnetometer", callback);
}

function _getGyroscope(callback) {
  return serverInvokation("get_gyroscope", callback);
}

function _getAccelerometer(callback) {
  return serverInvokation("get_accelerometer", callback);
}

module.exports = {
  initialise: _initialise,
  getTemperature: _getTemperature,
  getHumidity: _getHumidity,
  getPressure: _getPressure,
  getMagnetometer: _getMagnetometer,
  getGyroscope: _getGyroscope,
  getAccelerometer: _getAccelerometer
};
