/***** Imports *****/
var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var superagent = require("superagent");
var tuyApi = require("tuyapi");
var zeroRpc = require("zerorpc");

/***** Constants *****/
const colorReset = "\x1b[0m";
const colorRed = "\x1b[31m";
const colorGreen = "\x1b[32m";
const colorYellow = "\x1b[33m";
const colorBlue = "\x1b[34m";
const bleArg = "--ble";
const statusInternalServerError = 500;
const statusWrongParameter = 422;
const statusBadRequest = 404;
const statusSuccess = 200;

/***************************************************
 *
 * 					Init BLE Server
 *
 * *************************************************/

/***** Constants *****/
var bleClient = new zeroRpc.Client();

function initialiseBLE() {
  console.log("BLE Server initialisation...");
  bleClient.connect("tcp://127.0.0.1:4242");
  bleClient.on("error", function(err) {
    console.error(err);
  });
  bleDeviceConnect();
}

/***************************************************
 *
 * 					Init API Server
 *
 * *************************************************/

/***** Constants *****/
var apiHostname = "192.168.2.10";
var apiPort = 3000;
var app = express();
var myRouter = express.Router();

async function initialiseServer() {
  console.log("API Server initialisation...");
  app.use(cors());
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(myRouter);
  launchServer();
}

function launchServer() {
  app.listen(apiPort, apiHostname, function() {
    console.log(
      "\nServer launched\nListen on http://" + apiHostname + ":" + apiPort
    );
  });
}

/***************************************************
 *
 * 					Init Tuya devices
 *
 * *************************************************/

/***** Constants *****/
const deviceLight = new tuyApi({
  id: "40770742dc4f227126be",
  key: "a6f51281c76ea0b4"
});
const deviceSocket = new tuyApi({
  id: "23106066bcddc298d80e",
  key: "5b54ec105194edd9"
});

async function initiaTuyaDevices() {
  tuyaLightReset();
  tuyaSocketReset();
  await tuyaLightInit();
  await tuyaSocketInit();
}

/***************************************************
 *
 * 					Initialisation
 *
 * *************************************************/

function initialise() {
  var ble = false;

  process.argv.forEach(function(val, index, array) {
    if (val == bleArg) {
      ble = true;
    }
  });
  if (ble) {
    initialiseBLE();
  }
  initialiseServer();
  initiaTuyaDevices();
}

initialise();

/***************************************************
 *
 * 					Server Routes
 *
 * *************************************************/

myRouter.route("/").all(function(req, res) {
  res.end(
    "EscapeTech_BrokerApi. Check: https://github.com/nasrat-v/EscapeTech_BrokerApi"
  );
  logSchema(deviceLight);
});

/*************** TRIGGERS ***************/
myRouter.route("/addTrigger").post(function(req, res) {
  console.log("Add trigger method called with params", res);
  res.status(statusSuccess).send({
    response : "Trigger Added"
  });
})

myRouter.route("/getTriggers").post(function(req, res) {
  console.log("Get trigger mothod called with params", res);
  res.status(statusSuccess).send({
    response : "Trigger lists : inc soon"
  })
});



/*************** LIGHT ***************/

myRouter.route("/turnOnLight").get(function(req, res) {
  console.log("\n[Light status request]");

  (async () => {
    tuyaDeviceSetEventListener(deviceLight, () => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaLightSetStatus(true);
    res.status(statusSuccess).send({
      response: "success",
      lightIsOn: status
    });
  })();
});

myRouter.route("/turnOffLight").get(function(req, res) {
  console.log("\n[Light status request]");

  (async () => {
    tuyaDeviceSetEventListener(deviceLight, () => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaLightSetStatus(false);
    res.status(statusSuccess).send({
      response: "success",
      lightIsOn: status
    });
  })();
});

myRouter.route("/getStatusLight").get(function(req, res) {
  console.log("\n[Light status request]");

  (async () => {
    tuyaDeviceSetEventListener(deviceLight, () => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaLightGetStatus();
    res.status(statusSuccess).send({
      response: "success",
      lightIsOn: status
    });
  })();
});

myRouter.route("/setColorLight").post(function(req, res) {
  var color = req.body.color;
  console.log("\n[Light color request]");

  if (color == undefined) {
    res.status(statusBadRequest).send({
      response: "error missing color"
    });
    return;
  }
  (async () => {
    tuyaDeviceSetEventListener(deviceLight, () => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaLightSetColor(color);
    if (status != color) {
      res.status(statusWrongParameter).send({
        response: "error wrong color"
      });
      return;
    }
    res.status(statusSuccess).send({
      response: "success",
      lightColorIs: status
    });
  })();
});

myRouter.route("/flashLight").post(function(req, res) {
  var uTimer = req.body.utimer;
  console.log("\n[Light color request]");

  if (uTimer == undefined) {
    res.status(statusBadRequest).send({
      response: "error missing utimer"
    });
    return;
  }
  (async () => {
    tuyaDeviceSetEventListener(deviceLight, () => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaLightSetFlash(uTimer);
    res.status(statusSuccess).send({
      response: "success",
      lightIsOn: status
    });
  })();
});

/*************** SOCKET ***************/

myRouter.route("/turnOnSocket").get(function(req, res) {
  console.log("\n[Socket status request]");

  (async () => {
    tuyaDeviceSetEventListener(deviceSocket, () => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaSocketSetStatus(true);
    res.status(statusSuccess).send({
      response: "success",
      socketIsOn: status
    });
  })();
});

myRouter.route("/turnOffSocket").get(function(req, res) {
  console.log("\n[Socket status request]");

  (async () => {
    tuyaDeviceSetEventListener(deviceSocket, () => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaSocketSetStatus(false);
    res.status(statusSuccess).send({
      response: "success",
      socketIsOn: status
    });
  })();
});

myRouter.route("/getStatusSocket").get(function(req, res) {
  console.log("\n[Socket status request]");

  (async () => {
    tuyaDeviceSetEventListener(deviceSocket, () => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaSocketGetStatus();
    res.status(statusSuccess).send({
      response: "success",
      socketIsOn: status
    });
  })();
});

myRouter.route("/setColorSocket").post(function(req, res) {
  var color = req.body.color;
  console.log("\n[Socket color request]");

  if (color == undefined) {
    res.status(statusBadRequest).send({
      response: "error missing color"
    });
    return;
  }
  (async () => {
    tuyaDeviceSetEventListener(deviceSocket, () => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaSocketSetColor(color);
    if (status != color) {
      res.status(statusWrongParameter).send({
        response: "error wrong color"
      });
      return;
    }
    res.status(statusSuccess).send({
      response: "success",
      socketColorIs: status
    });
  })();
});

myRouter.route("/flashSocket").post(function(req, res) {
  var uTimer = req.body.utimer;
  console.log("\n[Socket color request]");

  if (uTimer == undefined) {
    res.status(statusBadRequest).send({
      response: "error missing utimer"
    });
    return;
  }
  (async () => {
    tuyaDeviceSetEventListener(deviceSocket, () => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaSocketSetFlash(uTimer);
    res.status(statusSuccess).send({
      response: "success",
      socketIsOn: status
    });
  })();
});

/*************** LED MESSENGER ***************/

myRouter.route("/ledMessenger").post(function(req, res) {
  var msg = req.body.message;
  var its = req.body.intensity;
  var spd = req.body.speed;
  var stc = req.body.static;
  console.log("\n[Led Messenger request]");

  (async () => {
    var status = await ledMessengerSetStatus(msg, its, spd, stc);
    res.json({ result: status });
  })();
});

/*************** BLE DEVICES ***************/

myRouter.route("/getTemperature").get(function(req, res) {
  console.log("\n[BLE temperature request]");

  bleDeviceGetTemperature(result => {
    logStatus("Temperature: ", result);
    res.json({ result: result });
  });
});

myRouter.route("/getHumidity").get(function(req, res) {
  console.log("\n[BLE humidity request]");

  bleDeviceGetHumidity(result => {
    logStatus("Humidity: ", result);
    res.json({ result: result });
  });
});

myRouter.route("/getPressure").get(function(req, res) {
  console.log("\n[BLE pressure request]");

  bleDeviceGetPressure(result => {
    logStatus("Pressure: ", result);
    res.json({ result: result });
  });
});

myRouter.route("/getMagnetometer").get(function(req, res) {
  console.log("\n[BLE magnetometer request]");

  bleDeviceGetMagnetometer(result => {
    logStatus("Magnetometer: ", result);
    res.send(result);
  });
});

myRouter.route("/getGyroscope").get(function(req, res) {
  console.log("\n[BLE gyroscope request]");

  bleDeviceGetGyroscope(result => {
    logStatus("Gyroscope: ", result);
    res.send(result);
  });
});

myRouter.route("/getAccelerometer").get(function(req, res) {
  console.log("\n[BLE accelerometer request]");

  bleDeviceGetAccelerometer(result => {
    logStatus("Accelerometer: ", result);
    res.send(result);
  });
});

/***************************************************
 *
 * 					Tuya devices
 *
 * *************************************************/

/***** Constants *****/
const tuyaError = "Bad Color";
const tuyaSuccess = "OK";
const valueTuyaColour = "colour";
const valueTuyaWhite = "white";

function tuyaDeviceSetEventListener(device, callBackFailure) {
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

async function tuyaDeviceInit(device) {
  await device.find();
  console.log("Device found");
  try {
    await device.connect();
  } catch (error) {
    console.error(`Connection failed: ${error}`);
  }
}

function tuyaDeviceReset(device) {
  device.disconnect();
}

async function tuyaDeviceSetStatus(newStatus, device, dpsNums) {
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
    logStatus("Current status: ", currentStatus);
  } else {
    console.log(`${colorYellow}%s${colorReset}`, "Nothing change");
  }
  return currentStatus;
}

async function tuyaDeviceGetStatus(device, dpsNum) {
  var currentStatus;

  await device.get({ dps: dpsNum }).then(status => (currentStatus = status));
  logStatus("Current status: ", currentStatus);
  return currentStatus;
}

async function tuyaDeviceSetFlash(uTimer, uFlashTimer, device, dpsNum) {
  var currentStatus;
  var newStatus = false;
  var startSimulateTime = Date.now();
  const startTime = Date.now();

  while (Date.now() - startTime <= uTimer) {
    startSimulateTime = Date.now();
    newStatus = !newStatus;

    while (Date.now() - startSimulateTime <= uFlashTimer);
    currentStatus = await tuyaDeviceSetStatus(newStatus, device, dpsNum);
  }
  return currentStatus;
}

function tuyaDeviceGetColourFromHex(newColor, colorHexArray) {
  var whiteOrColour;

  if (newColor == "white") {
    whiteOrColour = valueTuyaWhite;
  } else {
    whiteOrColour = valueTuyaColour;
  }
  return [whiteOrColour, tuyaDeviceConvertColorToHex(newColor, colorHexArray)];
}

function tuyaDeviceConvertColorToHex(color, colorHexArray) {
  const colorHexMap = new Map(colorHexArray);
  return colorHexMap.get(color);
}

function tuyaDeviceConvertHexToColor(hex, hexColorArray) {
  const hexColorMap = new Map(hexColorArray);
  return hexColorMap.get(hex);
}

/***************************************************
 *
 * 					Tuya smart light
 *
 * *************************************************/

/***** Constants *****/
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

async function tuyaLightInit() {
  console.log("* Smart Light init:");
  await tuyaDeviceInit(deviceLight);
}

function tuyaLightReset() {
  tuyaDeviceReset(deviceLight);
}

async function tuyaLightSetStatus(newStatus) {
  logStatus("New status: ", newStatus);
  var currentStatus = await tuyaDeviceSetStatus(
    newStatus,
    deviceLight,
    dpsLight
  );
  return currentStatus;
}

async function tuyaLightGetStatus() {
  var currentStatus = await tuyaDeviceGetStatus(deviceLight, dpsLight);
  return currentStatus;
}

async function tuyaLightSetColor(newColor) {
  logStatus("New color: ", newColor);
  const [whiteOrColour, valueColorHex] = tuyaDeviceGetColourFromHex(
    newColor,
    lightColorToHexArray
  );

  if (valueColorHex == undefined) {
    console.log(`Error: ${colorRed}${tuyaError}${colorReset}`);
    return tuyaError;
  }
  console.log("* Define white or colour");
  await tuyaDeviceSetStatus(whiteOrColour, deviceLight, dpsLightColour);
  console.log("* Set new color");
  var currentStatus = await tuyaDeviceSetStatus(
    valueColorHex,
    deviceLight,
    dpsLightColourHex
  );

  return tuyaLightInterpretColor(currentStatus);
}

async function tuyaLightSetFlash(uTimer) {
  var currentStatus = await tuyaDeviceSetFlash(
    uTimer,
    uLightFlashTimer,
    deviceLight,
    dpsLight
  );
  return currentStatus;
}

function tuyaLightInterpretColor(hex) {
  return tuyaDeviceConvertHexToColor(hex, lightHexToColorArray);
}

/***************************************************
 *
 * 					Tuya smart socket
 *
 * *************************************************/

/***** Constants *****/
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

async function tuyaSocketInit() {
  console.log("* Smart Socket init");
  await tuyaDeviceInit(deviceSocket);
}

function tuyaSocketReset() {
  tuyaDeviceReset(deviceSocket);
}

async function tuyaSocketSetStatus(newStatus) {
  logStatus("New status: ", newStatus);
  var currentStatus = await tuyaDeviceSetStatus(
    newStatus,
    deviceSocket,
    dpsSocket
  );
  return currentStatus;
}

async function tuyaSocketGetStatus() {
  var currentStatus = await tuyaDeviceGetStatus(deviceSocket, dpsSocket[0]);
  return currentStatus;
}

async function tuyaSocketSetColor(newColor) {
  logStatus("New color: ", newColor);
  const [whiteOrColour, valueColorHex] = tuyaDeviceGetColourFromHex(
    newColor,
    socketColorToHexArray
  );

  if (valueColorHex == undefined) {
    console.log(`Error: ${colorRed}${tuyaError}${colorReset}`);
    return tuyaError;
  }
  console.log("* Define white or colour");
  await tuyaDeviceSetStatus(whiteOrColour, deviceSocket, dpsSocketColour);
  console.log("* Set new color");
  var currentStatus = await tuyaDeviceSetStatus(
    valueColorHex,
    deviceSocket,
    dpsSocketColourHex
  );

  return tuyaSocketInterpretColor(currentStatus);
}

async function tuyaSocketSetFlash(uTimer) {
  var currentStatus = await tuyaDeviceSetFlash(
    uTimer,
    uSocketFlashTimer,
    deviceSocket,
    dpsSocketLight
  );
  return currentStatus;
}

function tuyaSocketInterpretColor(hex) {
  return tuyaDeviceConvertHexToColor(hex, socketHexToColorArray);
}

/***************************************************
 *
 * 					Led Messenger
 *
 * *************************************************/

/***** Constants *****/
const ledMessengerIp = "192.168.2.3";
const ledMessengerUrl = "http://" + ledMessengerIp + "/";

async function ledMessengerSetStatus(msg, its, spd, stc) {
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

/***************************************************
 *
 * 					BLE Devices
 *
 * *************************************************/

function bleDeviceInvokation(rpcName, callback) {
  bleClient.invoke(rpcName, function(error, result, more) {
    if (error) {
      console.error(error);
    }
    if (callback) callback(result);
  });
}

function bleDeviceConnect() {
  return bleDeviceInvokation("connect_to_device");
}

function bleDeviceGetTemperature(callback) {
  return bleDeviceInvokation("get_temperature", callback);
}

function bleDeviceGetHumidity(callback) {
  return bleDeviceInvokation("get_humidity", callback);
}

function bleDeviceGetPressure(callback) {
  return bleDeviceInvokation("get_pressure", callback);
}

function bleDeviceGetMagnetometer(callback) {
  return bleDeviceInvokation("get_magnetometer", callback);
}

function bleDeviceGetGyroscope(callback) {
  return bleDeviceInvokation("get_gyroscope", callback);
}

function bleDeviceGetAccelerometer(callback) {
  return bleDeviceInvokation("get_accelerometer", callback);
}

/***************************************************
 *
 * 					Log function
 *
 * *************************************************/

function logStatus(logMsg, status) {
  if (status) {
    console.log(`${logMsg}${colorGreen}%s${colorReset}`, `${status}`);
  } else {
    console.log(`${logMsg}${colorRed}%s${colorReset}`, `${status}`);
  }
}

async function logSchema(device) {
  await device.get({ schema: true }).then(data => console.log(data));
}
