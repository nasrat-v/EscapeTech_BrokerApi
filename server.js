
const colorReset = '\x1b[0m';
const colorRed = '\x1b[31m';
const colorGreen = '\x1b[32m';
const colorYellow = '\x1b[33m';
const colorBlue = '\x1b[34m';

var express = require('express');
var bodyParser = require('body-parser');
var superagent = require('superagent')
var tuyApi = require('tuyapi');

const deviceLight = new tuyApi({
	id: '40770742dc4f227126be',
	key: '144ea7591e111996'
});

const deviceSocket = new tuyApi({
	id: '23106066bcddc298d80e',
	key: '6df35ba291cb464b'
});

var hostname = '192.168.2.6';
var port = 3000
 
var app = express();
var myRouter = express.Router();
 
/***************************************************
 * 
 * 					Routes GET
 * 
 * *************************************************/

 setEventListener();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(myRouter);
app.listen(port, hostname, function() {
	console.log('Server launched\nListen on http://' + hostname + ':' + port); 
});

myRouter.route('/')
.all(function(req,res){ 
      res.end('EscapeTech_BrokerApi. Check: https://github.com/nasrat-v/EscapeTech_BrokerApi');
});

/*************** LIGHT ***************/ 

myRouter.route('/turnOnLight')
.get(function(req, res) {
	console.log('\n[Light status request]');
	(async() => {
		var status = await tuyaSmartLightSetStatus(true);
		res.json({ 'result': status });
	})();
})

myRouter.route('/turnOffLight')
.get(function(req, res) {
	console.log('\n[Light status request]');
	(async() => {
		var status = await tuyaSmartLightSetStatus(false);
		res.json({ 'result': status });
	})();
})

myRouter.route('/getStatusLight')
.get(function(req, res) {
	console.log('\n[Light status request]');
	(async() => {
		var status = await tuyaSmartLightGetStatus();
		res.json({ 'result': status });
	})();
})

myRouter.route('/setColorLight')
.post(function(req, res) {
	var color = req.body.color;

	console.log('\n[Socket color request]');
	(async() => {
		//var status = await tuyaDeviceSetStatus(color, deviceSocket, dpsSocketColor);
		res.json({ 'result': status });
	})();
})

/*************** SOCKET ***************/ 

myRouter.route('/turnOnSocket')
.get(function(req, res) {
	console.log('\n[Socket status request]');
	(async() => {
		var status = await tuyaSmartSocketSetStatus(true);
		res.json({ 'result': status });
	})();
})

myRouter.route('/turnOffSocket')
.get(function(req, res) {
	console.log('\n[Socket status request]');
	(async() => {
		var status = await tuyaSmartSocketSetStatus(false);
		res.json({ 'result': status });
	})();
})

myRouter.route('/getStatusSocket')
.get(function(req, res) {
	console.log('\n[Socket status request]');
	(async() => {
		var status = await tuyaSmartSocketGetStatus();
		res.json({ 'result': status });
	})();
})

myRouter.route('/setColorSocket')
.post(function(req, res) {
	var color = req.body.color;

	console.log('\n[Socket color request]');
	(async() => {
		var status = await tuyaSmartSocketSetColor(color);
		res.json({ 'result': status });
	})();
})

/*************** LED MESSENGER ***************/ 

myRouter.route('/ledMessenger')
.post(function(req, res) {
	var msg = req.body.message;
	
	console.log('\n[Led Messenger request]');
	(async() => {
		var status = await ledMessengerSendMessage(msg);
		res.json({ 'result': status });
	})();
})

/***************************************************
 * 
 * 					Tuya devices
 * 
 * *************************************************/

function setEventListener() {
	tuyaDeviceSetEventListener(deviceLight);
	tuyaDeviceSetEventListener(deviceSocket);
}

function tuyaDeviceSetEventListener(device) {
	device.on('error', error => {
		console.error(`Error from device: '${ device.id }'`, error)
		tuyaDeviceReset(device);
	});
	device.on('connected', () => console.log('Connected to device'));
	device.on('disconnected', () => console.log('Disconnected from device'));
}

async function tuyaDeviceInit(device) {
	await device.find();
	console.log('Device found');
	try {
		await device.connect();
	} catch(error) {
		console.error(`Connection failed: ${error}`);
		tuyaDeviceReset();
	}
}

function tuyaDeviceReset(device) {
	device.disconnect();
}

async function tuyaDeviceSetStatus(newStatus, device, dpsNums) {
	var currentStatus;

	await device.get({ dps: dpsNums[0] }).then(status => currentStatus = status);
	if (currentStatus != newStatus) {
		for (i = 0; i < dpsNums.length; i++) {
			await device.set({ dps: dpsNums[i], set: newStatus });
		}
		await device.get({ dps: dpsNums[0] }).then(status => currentStatus = status);
		logStatus('Current status: ', currentStatus);
	} else {
		console.log(`${colorYellow}%s${colorReset}`, 'Nothing change');
	}
	return (currentStatus);
}

async function tuyaDeviceGetStatus(device, dpsNum) {
	var currentStatus;

	await device.get({ dps: dpsNum }).then(status => currentStatus = status);
	logStatus('Current status: ', currentStatus);

	return (currentStatus);
}

/***************************************************
 * 
 * 					Tuya smart light
 * 
 * *************************************************/

const dpsLight = [20];
const dpsLightColor = [];

async function tuyaSmartLightSetStatus(newStatus) {
	logStatus('New status: ', newStatus);
	await tuyaDeviceInit(deviceLight);

	var currentStatus = await tuyaDeviceSetStatus(newStatus, deviceLight, dpsLight);

	tuyaDeviceReset(deviceLight);
	return (currentStatus);
 }

 async function tuyaSmartLightGetStatus() {
	await tuyaDeviceInit(deviceLight);

	var currentStatus = await tuyaDeviceGetStatus(deviceLight, dpsLight);

	tuyaDeviceReset(deviceLight);
	return (currentStatus);
}

async function tuyaSmartLightSetColor() {

}

/***************************************************
 * 
 * 					Tuya smart socket
 * 
 * *************************************************/

const dpsSocket = [1, 27];
const dpsSocketColour = [28];
const dpsSocketColourHex = [31];
const valueSocketColour = 'colour';
const valueSocketWhite = 'white';
const valueSocketWhiteHex = 'ff00000000ffff';
const valueSocketRedHex = 'ff040000016464';

async function tuyaSmartSocketSetStatus(newStatus) {
	logStatus('New status: ', newStatus);
	await tuyaDeviceInit(deviceSocket);

	var currentStatus = await tuyaDeviceSetStatus(newStatus, deviceSocket, dpsSocket);

	tuyaDeviceReset(deviceSocket);
	return (currentStatus);
 }

 async function tuyaSmartSocketGetStatus() {
	await tuyaDeviceInit(deviceSocket);

	var currentStatus = await tuyaDeviceGetStatus(deviceSocket, dpsSocket);

	tuyaDeviceReset(deviceSocket);
	return (currentStatus);
}

async function tuyaSmartSocketSetColor(newColor) {
	var newColorHex;
	var valueColor;

	logStatus('* New color: ', newColor);
	await tuyaDeviceInit(deviceSocket);

	switch (newColor) {
		case 'red':
			newColorHex = valueSocketRedHex;
			valueColor = valueSocketColour;
			break;
		case 'white':
			newColorHex = valueSocketWhiteHex;
			valueColor = valueSocketWhite;
			break;
	}

	console.log('* Turn ON device');
	await tuyaDeviceSetStatus(true, deviceSocket, dpsSocket); // turn ON
	console.log('* Define colour');
	await tuyaDeviceSetStatus(valueColor, deviceSocket, dpsSocketColour); // define if we use colour or white
	console.log('* Set new color');
	var currentStatus = await tuyaDeviceSetStatus(newColorHex, deviceSocket, dpsSocketColourHex); // set new color

	tuyaDeviceReset(deviceSocket);
	return (currentStatus);
}

/***************************************************
 * 
 * 					Led Messenger
 * 
 * *************************************************/

const ledMessengerUrl = 'https://www.smartledmessenger.com/push.ashx';
const ledMessengerKey = 'VhPIMegM2NBPyGO4+t5V1w==';

async function ledMessengerSendMessage(msg) {
	var result;

	console.log(`Send message: ${colorBlue}'%s'${colorReset}`, `${msg}`);

	await superagent.get(ledMessengerUrl).query({ key: ledMessengerKey, message: msg })
	.then(res => result = res.text);

	console.log(`Result: ${result}`);
	return (result);
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