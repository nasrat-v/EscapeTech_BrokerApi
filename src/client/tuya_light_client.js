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
const uLightFlashTimer = 1100;
const dpsLight = [20];
const dpsLightColour = [21];
const dpsLightColourHex = [24];
const lightHexToColorArray = [
  ["000003e803e8", "red"],
  ["007603e803e8", "green"],
  ["00d903e803e8", "blue"],
  ["003503e803e8", "yellow"],
  ["013903e803e8", "magenta"],
  ["00a503e803e8", "cyan"],
  ["000000e803e8", "white"]
];
const lightColorToHexArray = [
  ["red", "000003e803e8"],
  ["green", "007603e803e8"],
  ["blue", "00d903e803e8"],
  ["yellow", "003503e803e8"],
  ["magenta", "013903e803e8"],
  ["cyan", "00a503e803e8"],
  ["white", "000000e803e8"]
];
const deviceLight = new tuyApi({
  id: "40770742dc4f227126be",
  key: "a6f51281c76ea0b4"
});

/***************************************************
 *
 * 					Tuya smart light
 *
 * *************************************************/

function _setEventListener(callBackFailure) {
  tuyaDevice.setEventListener(deviceLight, callBackFailure);
}

async function _init() {
  console.log("* Smart Light init:");
  await tuyaDevice.init(deviceLight);
}

function _reset() {
  tuyaDevice.reset(deviceLight);
}

async function _setStatus(newStatus) {
  log.logStatus("New status: ", newStatus);
  var currentStatus = await tuyaDevice.setStatus(
    newStatus,
    deviceLight,
    dpsLight
  );
  return currentStatus;
}

async function _getStatus() {
  var currentStatus = await tuyaDevice.getStatus(deviceLight, dpsLight);
  return currentStatus;
}

async function _setColor(newColor) {
  log.logStatus("New color: ", newColor);
  const [whiteOrColour, valueColorHex] = tuyaDevice.getColourFromHex(
    newColor,
    lightColorToHexArray
  );

  if (valueColorHex == undefined) {
    console.log(`Error: ${colorRed}${tuyaError}${colorReset}`);
    return tuyaError;
  }
  console.log("* Define white or colour");
  await tuyaDevice.setStatus(whiteOrColour, deviceLight, dpsLightColour);
  console.log("* Set new color");
  var currentStatus = await tuyaDevice.setStatus(
    valueColorHex,
    deviceLight,
    dpsLightColourHex
  );

  return _interpretColor(currentStatus);
}

async function _setFlash(uTimer) {
  var currentStatus = await tuyaDevice.setFlash(
    uTimer,
    uLightFlashTimer,
    deviceLight,
    dpsLight
  );
  return currentStatus;
}

function _interpretColor(hex) {
  return tuyaDevice.convertHexToColor(hex, lightHexToColorArray);
}

function _getDevice() {
  return deviceLight;
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
