/***** Imports *****/
var tuyaLightClient = require("../client/tuya_light_client.js");
var tuyaSocketClient = require("../client/tuya_socket_client.js");
var bleClient = require("../client/ble_client.js");
var armClient = require("../client/arm_client.js");

/***** Constants *****/
const baseIntConvert = 10;
const uTimer = 30000;
const intensityLed = 13;
const speedLed = 40;
const staticLed = 0;

/***** Globals *****/
var triggerList = [];

/***************************************************
 *
 * 					Trigger
 *
 * *************************************************/

async function runTriggeringFunction(trigger) {
  switch (trigger.triggeringFunction) {
    case "temperature":
      bleClient.getTemperature(result => {
        checkIntegerValueTrigger(result, trigger);
      });
      break;
    case "pressure":
      bleClient.getPressure(result => {
        checkIntegerValueTrigger(result, trigger);
      });
      break;
    case "humidity":
      bleClient.getHumidity(result => {
        checkIntegerValueTrigger(result, trigger);
      });
      break;
    case "gyroscope":
      bleClient.getGyroscope(result => {
        checkIntegerValueTrigger(result, trigger);
      });
      break;
    case "accelerometer":
      bleClient.getAccelerometer(result => {
        checkIntegerValueTrigger(result, trigger);
      });
      break;
    case "magnetometer":
      bleClient.getMagnetometer(result => {
        checkIntegerValueTrigger(result, trigger);
      });
    case "lightStatus":
      var result = await tuyaLightClient.getStatus();
      checkBooleanValueTrigger(result, trigger);
      break;
    case "socketStatus":
      var result = await tuyaSocketClient.getStatus();
      checkBooleanValueTrigger(result, trigger);
      break;
    case "armIsMagnet":
      armClient.isMagnet(result => {
        checkBooleanValueTrigger(result, trigger);
      });
      break;
    case "armIsHorizontal":
      armClient.isHorizontal(result => {
        checkBooleanValueTrigger(result, trigger);
      });
      break;
    case "armIsMoving":
      armClient.isMoving(result => {
        console.log(result);
        checkBooleanValueTrigger(result, trigger);
      });
      break;
  }
}

function checkBooleanValueTrigger(result, trigger) {
  var val = trigger.value;
  var res = result;
  var status = "default";

  if (val === "true") {
    status = true;
  } else if (val === "false") {
    status = false;
  }
  if (result === "YES") {
    res = true;
  } else if (result === "NO") {
    res = false;
  }
  console.log(status);
  if (res == status) {
    console.log("ok");
    runTriggeredFunction(trigger);
  }
}

function checkIntegerValueTrigger(result, trigger) {
  var res = parseInt(result, baseIntConvert);
  var val = parseInt(trigger.value, baseIntConvert);

  switch (trigger.comparator) {
    case ">":
      if (res > val) {
        runTriggeredFunction(trigger);
      }
      break;
    case "<":
      if (res < val) {
        runTriggeredFunction(trigger);
      }
      break;
    case "==":
      if (res == val) {
        runTriggeredFunction(trigger);
      }
      break;
    case "!=":
      if (res != val) {
        runTriggeredFunction(trigger);
      }
      break;
  }
}

function runTriggeredFunction(trigger) {
  var arg = trigger.argument;

  switch (trigger.triggeredFunction) {
    case "lightStatus":
      console.log("light");
      runTriggeredFuncLight(arg);
      break;
    case "socketStatus":
      runTriggeredFuncSocket(arg);
      break;
    case "ledMessenger":
      ledMessengerSetStatus(arg, intensityLed, speedLed, staticLed);
      break;
    case "armLedStatus":
      runTriggeredFuncArm(arg);
  }
}

function runTriggeredFuncArm(arg) {
  var status = "default";

  if (arg === "true") {
    status = true;
  } else if (arg === "false") {
    status = false;
  }
  if (status == true) {
    armClient.turnOnLed();
  } else if (status == false) {
    armClient.turnOffLed();
  }
}

function runTriggeredFuncLight(arg) {
  var status = "default";

  console.log(status);
  if (arg === "true") {
    status = true;
  } else if (arg === "false") {
    status = false;
  } else {
    status = arg;
  }
  if (status == true || status == false) {
    tuyaLightClient.setStatus(status);
  } else if (status === "flash") {
    tuyaLightClient.setFlash(uTimer);
  } else {
    tuyaLightClient.setColor(status);
  }
}

function runTriggeredFuncSocket(arg) {
  var status = "default";

  if (arg === "true") {
    status = true;
  } else if (arg === "false") {
    status = false;
  } else {
    status = arg;
  }
  if (status == true || status == false) {
    tuyaSocketClient.setStatus(status);
  } else if (status === "flash") {
    tuyaSocketClient.setFlash(uTimer);
  } else {
    tuyaSocketClient.setColor(status);
  }
}

function _add(triggeredFct, triggeringFct, cmp, val, arg) {
  triggerList.push({
    id: _getLastId() + 1,
    triggeredFunction: triggeredFct,
    triggeringFunction: triggeringFct,
    comparator: cmp,
    value: val,
    argument: arg
  });
}

function _delete(id) {
  var nb = 0;
  var int_id = parseInt(id, baseIntConvert);

  triggerList.forEach(trigger => {
    if (trigger.id == int_id) {
      triggerList.splice(nb, 1);
    }
    nb++;
  });
}

function _getLastId() {
  if (triggerList.length == 0) {
    return -1;
  }
  return triggerList[triggerList.length - 1].id;
}

function _getList() {
  return triggerList;
}

function _asyncRun() {
  triggerList.forEach(trigger => {
    runTriggeringFunction(trigger);
  });
}

module.exports = {
  add: _add,
  delete: _delete,
  getLastId: _getLastId,
  getList: _getList,
  asyncRun: _asyncRun
};
