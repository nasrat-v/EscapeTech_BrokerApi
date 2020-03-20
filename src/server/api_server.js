/***** Imports *****/
var express = require("express");
var cors = require("cors");
var bodyParser = require("body-parser");
var bleClient = require("../client/ble_client.js");
var armClient = require("../client/arm_client.js");
var tuyaLightClient = require("../client/tuya_light_client.js");
var tuyaSocketClient = require("../client/tuya_socket_client.js");
var ledMessengerClient = require("../client/led_messenger_client.js");
var trigger = require("../trigger/trigger.js");
var log = require("../tools/log.js");

/***** Constants *****/
const statusInternalServerError = 500;
const statusWrongParameter = 422;
const statusBadRequest = 404;
const statusSuccess = 200;

/***************************************************
 *
 * 					Init API Server
 *
 * *************************************************/

/***** Constants *****/
var app = express();
var myRouter = express.Router();

async function initialiseServer(
  apiHostname,
  apiPort,
  dashboardHostname,
  dashboardPort
) {
  console.log("API Server initialisation...");

  if (dashboardHostname != "" && dashboardPort != -1) {
    app.use(
      cors({ origin: "http://" + dashboardHostname + ":" + dashboardPort })
    );
  } else {
    app.use(cors());
  }
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(bodyParser.json());
  app.use(myRouter);
  launchServer(apiHostname, apiPort);
}

function launchServer(apiHostname, apiPort) {
  apiHostname = apiHostname.split(" ").join("");
  app.listen(apiPort, apiHostname, function() {
    console.log(
      "\nServer launched\nListen on http://" + apiHostname + ":" + apiPort
    );
  });
}

/***************************************************
 *
 * 					Init Led Messenger
 *
 * *************************************************/

function initialiseLedMessenger(ipAdress) {
  console.log("LED Messenger initialisation...");
  ledMessengerClient.setIpAdress(ipAdress);
}

/***************************************************
 *
 * 					Init Tuya devices
 *
 * *************************************************/

async function initialiseTuyaDevices() {
  console.log("TUYA devices initialisation...");
  tuyaLightClient.reset();
  tuyaSocketClient.reset();
  await tuyaLightClient.init();
  await tuyaSocketClient.init();
}

/***************************************************
 *
 * 					Initialisation
 *
 * *************************************************/

/***** Constants *****/
const utimeAsyncTriggerRun = 5000;
const tuyaArg = "--tuya";
const ipBleArg = "--ipBle";
const portBleArg = "--portBle";
const ipArmArg = "--ipArm";
const portArmArg = "--portArm";
const ipApiArg = "--ipApi";
const portApiArg = "--portApi";
const ipDashboardArg = "--ipDashboard";
const portDashboardArg = "--portDashboard";
const ipLedMessengerArg = "--ipLedMessenger";
const helpArg = "--help";

function paramsFactory() {
  return {
    ipApi: "",
    portApi: -1,
    ipBle: "",
    portBle: -1,
    ipArm: "",
    portArm: -1,
    ipDashboard: "",
    portDashboard: -1,
    ipLedMessenger: "",
    tuya: false
  };
}

function parseParams() {
  var args = paramsFactory();

  process.argv.forEach(function(val, index, array) {
    switch (val) {
      case helpArg:
        args = -1;
        break;
      case tuyaArg:
        args.tuya = true;
        break;
      case ipBleArg:
        if (process.argv[index + 1] != undefined) {
          args.ipBle = process.argv[index + 1];
        }
        break;
      case portBleArg:
        if (process.argv[index + 1] != undefined) {
          args.portBle = process.argv[index + 1];
        }
        break;
      case ipArmArg:
        if (process.argv[index + 1] != undefined) {
          args.ipArm = process.argv[index + 1];
        }
        break;
      case portArmArg:
        if (process.argv[index + 1] != undefined) {
          args.portArm = process.argv[index + 1];
        }
        break;
      case ipApiArg:
        if (process.argv[index + 1] != undefined) {
          args.ipApi = process.argv[index + 1];
        }
        break;
      case portApiArg:
        if (process.argv[index + 1] != undefined) {
          args.portApi = process.argv[index + 1];
        }
        break;
      case ipDashboardArg:
        if (process.argv[index + 1] != undefined) {
          args.ipDashboard = process.argv[index + 1];
        }
        break;
      case portDashboardArg:
        if (process.argv[index + 1] != undefined) {
          args.portDashboard = process.argv[index + 1];
        }
      case ipLedMessengerArg:
        if (process.argv[index + 1] != undefined) {
          args.ipLedMessenger = process.argv[index + 1];
        }
        break;
    }
  });
  return args;
}

function checkOptions() {
  var args = parseParams();

  if (args == -1) {
    console.log("--tuya");
    console.log("--ipApi [ip_adress] --portApi [port]");
    console.log("--ipBle [ip_adress] --portBle [port]");
    console.log("--ipArm [ip_adress] --portArm [port]");
    console.log("--ipDashboard [ip_adress] --portDashboard [port]");
    console.log("--ipLedMessenger [ip_adress]");
    return -1;
  }
  if (args.ipApi == "" || args.portApi == -1) {
    console.log(
      "Usage required: node api_server.js --ipApi [ip_address] --portApi [port]"
    );
    args = -1;
  }
  return args;
}

function initialise() {
  var args = checkOptions();

  if (args != -1) {
    if (args.ipBle != "" && args.portBle != -1) {
      bleClient.initialise(args.ipBle, args.portBle);
    }
    if (args.ipArm != "" && args.portArm != -1) {
      armClient.initialise(args.ipArm, args.portArm);
    }
    if (args.tuya) {
      initialiseTuyaDevices();
    }
    initialiseServer(
      args.ipApi,
      args.portApi,
      args.ipDashboard,
      args.portDashboard
    );
    if (args.ipLedMessenger != "") {
      initialiseLedMessenger(args.ipLedMessenger);
    }
    // trigger manager
    setInterval(trigger.asyncRun, utimeAsyncTriggerRun);
  }
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
});

/*************** ARM ***************/

myRouter.route("/turnOnLed").get(function(req, res, next) {
  console.log("[TurnOnLed request]");

  armClient.turnOnLed();
  res.status(statusSuccess).send({
    response: "Led turned on"
  });
});

myRouter.route("/turnOffLed").get(function(req, res) {
  console.log("[TurnOffLed request]");

  armClient.turnOffLed();
  res.status(statusSuccess).send({
    response: "Led turned off"
  });
});

/*************** TRIGGERS ***************/

myRouter.route("/addTrigger").post(function(req, res) {
  var triggeredFct = req.body.triggeredFunction;
  var triggeringFct = req.body.triggeringFunction;
  var cmp = req.body.comparator;
  var val = req.body.value;
  var arg = req.body.argument;

  console.log("[Add trigger request]");
  trigger.add(triggeredFct, triggeringFct, cmp, val, arg);
  res.status(statusSuccess).send({
    response: "Trigger added"
  });
});

myRouter.route("/deleteTrigger").post(function(req, res) {
  var id = req.body.id;

  console.log("[Delete trigger request]");
  trigger.delete(id);
  res.status(statusSuccess).send({
    response: "Trigger deleted"
  });
});

myRouter.route("/getTriggers").get(function(req, res) {
  var list = trigger.getList();

  console.log("[Get triggers request]");
  res.status(statusSuccess).send({
    response: list
  });
});

/*************** LIGHT ***************/

myRouter.route("/turnOnLight").get(function(req, res) {
  console.log("\n[Light status request]");

  (async () => {
    tuyaLightClient.setEventListener(() => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaLightClient.setStatus(true);
    res.status(statusSuccess).send({
      response: "success",
      lightIsOn: status
    });
  })();
});

myRouter.route("/turnOffLight").get(function(req, res) {
  console.log("\n[Light status request]");

  (async () => {
    tuyaLightClient.setEventListener(() => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaLightClient.setStatus(false);
    res.status(statusSuccess).send({
      response: "success",
      lightIsOn: status
    });
  })();
});

myRouter.route("/getStatusLight").get(function(req, res) {
  console.log("\n[Light status request]");

  (async () => {
    tuyaLightClient.setEventListener(() => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaLightClient.getStatus();
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
    tuyaLightClient.setEventListener(() => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaLightClient.setColor(color);
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
    tuyaLightClient.setEventListener(() => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaLightClient.setFlash(uTimer);
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
    tuyaSocketClient.setEventListener(() => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaSocketClient.setStatus(true);
    res.status(statusSuccess).send({
      response: "success",
      socketIsOn: status
    });
  })();
});

myRouter.route("/turnOffSocket").get(function(req, res) {
  console.log("\n[Socket status request]");

  (async () => {
    tuyaSocketClient.setEventListener(() => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaSocketClient.setStatus(false);
    res.status(statusSuccess).send({
      response: "success",
      socketIsOn: status
    });
  })();
});

myRouter.route("/getStatusSocket").get(function(req, res) {
  console.log("\n[Socket status request]");

  (async () => {
    tuyaSocketClient.setEventListener(() => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaSocketClient.getStatus();
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
    tuyaSocketClient.setEventListener(() => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaSocketClient.setColor(color);
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
    tuyaSocketClient.setEventListener(() => {
      // callBackFailure
      res.status(statusInternalServerError).send({
        response: "internal server error"
      });
      console.log("EXIT FAILURE");
      process.exit(1);
    }); // success
    var status = await tuyaSocketClient.setFlash(uTimer);
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
    var status = await ledMessengerClient.setStatus(msg, its, spd, stc);
    res.json({ result: status });
  })();
});

/*************** BLE DEVICES ***************/

myRouter.route("/getTemperature").get(function(req, res) {
  console.log("\n[BLE temperature request]");

  bleClient.getTemperature(result => {
    log.logStatus("Temperature: ", result);
    res.json({ result: result });
  });
});

myRouter.route("/getHumidity").get(function(req, res) {
  console.log("\n[BLE humidity request]");

  bleClient.getHumidity(result => {
    log.logStatus("Humidity: ", result);
    res.json({ result: result });
  });
});

myRouter.route("/getPressure").get(function(req, res) {
  console.log("\n[BLE pressure request]");

  bleClient.getPressure(result => {
    log.logStatus("Pressure: ", result);
    res.json({ result: result });
  });
});

myRouter.route("/getMagnetometer").get(function(req, res) {
  console.log("\n[BLE magnetometer request]");

  bleClient.getMagnetometer(result => {
    log.logStatus("Magnetometer: ", result);
    res.send(result);
  });
});

myRouter.route("/getGyroscope").get(function(req, res) {
  console.log("\n[BLE gyroscope request]");

  bleClient.getGyroscope(result => {
    log.logStatus("Gyroscope: ", result);
    res.send(result);
  });
});

myRouter.route("/getAccelerometer").get(function(req, res) {
  console.log("\n[BLE accelerometer request]");

  bleClient.getAccelerometer(result => {
    log.logStatus("Accelerometer: ", result);
    res.send(result);
  });
});
