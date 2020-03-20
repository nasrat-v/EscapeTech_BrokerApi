/***** Imports *****/
var tuyApi = require("tuyapi");
var tuyaDevice = require("./tuya_device_interface.js");
var log = require("../tools/log.js");

/***** Constants *****/
const tuyaError = "Bad Color";
const colorReset = "\x1b[0m";
const colorRed = "\x1b[31m";
const colorGreen = "\x1b[32m";
const colorYellow = "\x1b[33m";
const colorBlue = "\x1b[34m";
const uSocketFlashTimer = 500;
const dpsSocketLight = [27];
const dpsSocket = [1, dpsSocketLight];
const dpsSocketColour = [28];
const dpsSocketColourHex = [31];
const socketHexToColorArray = [
  ["ff040000016464", "red"],
  ["47ff000067ffff", "green"],
  ["0033ff00e3ffff", "blue"],
  ["ffc400002effff", "yellow"],
  ["magenff00e90131ffffta", "magenta"],
  ["00ffdb00abffff", "cyan"],
  ["ff00000000ffff", "white"]
];
const socketColorToHexArray = [
  ["red", "ff040000016464"],
  ["green", "47ff000067ffff"],
  ["blue", "0033ff00e3ffff"],
  ["yellow", "ffc400002effff"],
  ["magenta", "ff00e90131ffff"],
  ["cyan", "00ffdb00abffff"],
  ["white", "ff00000000ffff"]
];
const deviceSocket = new tuyApi({
  id: "23106066bcddc298d80e",
  key: "5b54ec105194edd9"
});

/***************************************************
 *
 * 					Tuya smart socket
 *
 * *************************************************/

function _setEventListener(callBackFailure) {
  tuyaDevice.setEventListener(deviceSocket, callBackFailure);
}

async function _init() {
  console.log("* Smart Socket init");
  await tuyaDevice.init(deviceSocket);
}

function _reset() {
  tuyaDevice.reset(deviceSocket);
}

async function _setStatus(newStatus) {
  log.logStatus("New status: ", newStatus);
  var currentStatus = await tuyaDevice.setStatus(
    newStatus,
    deviceSocket,
    dpsSocket
  );
  return currentStatus;
}

async function _getStatus() {
  var currentStatus = await tuyaDevice.getStatus(deviceSocket, dpsSocket[0]);
  return currentStatus;
}

async function _setColor(newColor) {
  log.logStatus("New color: ", newColor);
  const [whiteOrColour, valueColorHex] = tuyaDevice.getColourFromHex(
    newColor,
    socketColorToHexArray
  );

  if (valueColorHex == undefined) {
    console.log(`Error: ${colorRed}${tuyaError}${colorReset}`);
    return tuyaError;
  }
  console.log("* Define white or colour");
  await tuyaDevice.setStatus(whiteOrColour, deviceSocket, dpsSocketColour);
  console.log("* Set new color");
  var currentStatus = await tuyaDevice.setStatus(
    valueColorHex,
    deviceSocket,
    dpsSocketColourHex
  );

  return _interpretColor(currentStatus);
}

async function _setFlash(uTimer) {
  var currentStatus = await tuyaDevice.setFlash(
    uTimer,
    uSocketFlashTimer,
    deviceSocket,
    dpsSocketLight
  );
  return currentStatus;
}

function _interpretColor(hex) {
  return tuyaDevice.convertHexToColor(hex, socketHexToColorArray);
}

function _getDevice() {
  return deviceSocket;
}

module.exports = {
  setEventListener: _setEventListener,
  init: _init,
  reset: _reset,
  setStatus: _setStatus,
  getStatus: _getStatus,
  setColor: _setColor,
  setFlash: _setFlash,
  interpretColor: _interpretColor,
  getDevice: _getDevice
};
