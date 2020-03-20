/***** Imports *****/
var log = require("../tools/log.js");

/***** Constants *****/
const valueTuyaColour = "colour";
const valueTuyaWhite = "white";
const colorReset = "\x1b[0m";
const colorRed = "\x1b[31m";
const colorGreen = "\x1b[32m";
const colorYellow = "\x1b[33m";
const colorBlue = "\x1b[34m";

/***************************************************
 *
 * 					Tuya devices Interface
 *
 * *************************************************/

function _setEventListener(device, callBackFailure) {
  device.on("error", error => {
    console.error(`Error from device: '${device.id}'`, error);
  });
  device.on("connected", () => {
    console.log("Connected to device");
  });
  device.on("disconnected", async () => {
    console.log("Disconnected from device");
    callBackFailure();
  });
}

async function _init(device) {
  await device.find();
  console.log("Device found");
  try {
    await device.connect();
  } catch (error) {
    console.error(`Connection failed: ${error}`);
  }
}

function _reset(device) {
  device.disconnect();
}

async function _setStatus(newStatus, device, dpsNums) {
  var currentStatus;

  await device
    .get({ dps: dpsNums[0] })
    .then(status => (currentStatus = status));

  if (currentStatus != undefined && currentStatus != newStatus) {
    for (i = 0; i < dpsNums.length; i++) {
      await device.set({ dps: dpsNums[i], set: newStatus });
    }
    await device
      .get({ dps: dpsNums[0] })
      .then(status => (currentStatus = status));
    log.logStatus("Current status: ", currentStatus);
  } else {
    console.log(`${colorYellow}%s${colorReset}`, "Nothing change");
  }
  return currentStatus;
}

async function _getStatus(device, dpsNum) {
  var currentStatus;

  await device.get({ dps: dpsNum }).then(status => (currentStatus = status));
  log.logStatus("Current status: ", currentStatus);
  return currentStatus;
}

async function _setFlash(uTimer, uFlashTimer, device, dpsNum) {
  var currentStatus;
  var newStatus = false;
  var startSimulateTime = Date.now();
  const startTime = Date.now();

  // time of the flash
  while (Date.now() - startTime <= uTimer) {
    startSimulateTime = Date.now();
    newStatus = !newStatus;
    // time between turnOn and turnOff (macro)
    while (Date.now() - startSimulateTime <= uFlashTimer);
    currentStatus = await _setStatus(newStatus, device, dpsNum);
  }
  return currentStatus;
}

function _getColourFromHex(newColor, colorHexArray) {
  var whiteOrColour;

  if (newColor == "white") {
    whiteOrColour = valueTuyaWhite;
  } else {
    whiteOrColour = valueTuyaColour;
  }
  return [whiteOrColour, _convertColorToHex(newColor, colorHexArray)];
}

function _convertColorToHex(color, colorHexArray) {
  const colorHexMap = new Map(colorHexArray);
  return colorHexMap.get(color);
}

function _convertHexToColor(hex, hexColorArray) {
  const hexColorMap = new Map(hexColorArray);
  return hexColorMap.get(hex);
}

module.exports = {
  setEventListener: _setEventListener,
  init: _init,
  reset: _reset,
  setStatus: _setStatus,
  getStatus: _getStatus,
  setFlash: _setFlash,
  getColourFromHex: _getColourFromHex,
  convertColorToHex: _convertColorToHex,
  convertHexToColor: _convertHexToColor
};
