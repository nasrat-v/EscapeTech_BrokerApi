
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

var hostname = '192.168.2.7';
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
	  logSchema(deviceLight);
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

	console.log('\n[Light color request]');
	(async() => {
		var status = await tuyaSmartLightSetColor(color);
		res.json({ 'result': status });
	})();
})

myRouter.route('/flashLight')
.post(function(req, res) {
	var uTimer = req.body.utimer;

	console.log('\n[Light color request]');
	(async() => {
		var status = await tuyaSmartLightSetFlash(uTimer);
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

myRouter.route('/flashSocket')
.post(function(req, res) {
	var uTimer = req.body.utimer;

	console.log('\n[Socket color request]');
	(async() => {
		var status = await tuyaSmartSocketSetFlash(uTimer);
		res.json({ 'result': status });
	})();
})

/*************** LED MESSENGER ***************/ 

myRouter.route('/ledMessenger')
.post(function(req, res) {
	var msg = req.body.message;
	var its = req.body.intensity;
	var spd = req.body.speed;
	var	stc = req.body.static;
	
	console.log('\n[Led Messenger request]');
	(async() => {
		var status = await ledMessengerSetStatus(msg, its, spd, stc);
		res.json({ 'result': status });
	})();
})

/***************************************************
 * 
 * 					Tuya devices
 * 
 * *************************************************/

const tuyaError = 'Bad color';
const tuyaSuccess = 'OK';
const valueTuyaColour = 'colour';
const valueTuyaWhite = 'white';

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

async function tuyaDeviceSetFlash(uTimer, uFlashTimer, device, dpsNum) {
	var currentStatus;
	var newStatus = false;
	var startSimulateTime = Date.now();
	const startTime = Date.now();

	while ((Date.now() - startTime) <= uTimer) {
		startSimulateTime = Date.now();
		newStatus = !newStatus;

		while ((Date.now() - startSimulateTime) <= uFlashTimer);
		currentStatus = await tuyaDeviceSetStatus(newStatus, device, dpsNum);
	}
	return (currentStatus);
}

function tuyaDeviceConvertColorToHex(newColor, colorHexArray) {
	var whiteOrColour;
	const colorHexMap = new Map(colorHexArray);

	if (newColor == 'white') {
		whiteOrColour = valueTuyaWhite;
	} else {
		whiteOrColour = valueTuyaColour;
	}
	return ([whiteOrColour, colorHexMap.get(newColor)]);
}

function tuyaDeviceConvertStatusToResult(status, colorHexArray) {
	if (colorHexArray.find(([key, val]) => val == status) != undefined) {
		return (tuyaSuccess);
	}
	return (tuyaError);
}

/***************************************************
 * 
 * 					Tuya smart light
 * 
 * *************************************************/

const uLightFlashTimer = 1100;
const dpsLight = [20];
const dpsLightColour = [21];
const dpsLightColourHex = [24];
const lightColorHexArray = [
	[ 'red', '000003e803e8' ], [ 'green', '007603e803e8' ],
	[ 'blue', '00d903e803e8' ], [ 'yellow', '003503e803e8' ], 
	[ 'magenta', '013903e803e8' ], [ 'cyan', '00a503e803e8' ],
	[ 'white', '000003e803e8' ]
];

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

async function tuyaSmartLightSetColor(newColor) {
	logStatus('* New color: ', newColor);
	const [whiteOrColour, valueColorHex] = tuyaDeviceConvertColorToHex(newColor, lightColorHexArray);

	if (valueColorHex == undefined) {
		console.log(`Error: ${colorRed}${tuyaError}${colorReset}`);
		return (tuyaError);
	}
	await tuyaDeviceInit(deviceLight);

	console.log('* Define colour');
	await tuyaDeviceSetStatus(whiteOrColour, deviceLight, dpsLightColour);
	console.log('* Set new color');
	var currentStatus = await tuyaDeviceSetStatus(valueColorHex, deviceLight, dpsLightColourHex);
	console.log('* Turn ON device');
	await tuyaDeviceSetStatus(true, deviceLight, dpsLight);

	tuyaDeviceReset(deviceLight);
	return (tuyaDeviceConvertStatusToResult(currentStatus, lightColorHexArray));
}

async function tuyaSmartLightSetFlash(uTimer) {
	await tuyaDeviceInit(deviceLight);

	var currentStatus = await tuyaDeviceSetFlash(uTimer, uLightFlashTimer, deviceLight, dpsLight);

	tuyaDeviceReset(deviceLight);
	return (currentStatus);
}


/***************************************************
 * 
 * 					Tuya smart socket
 * 
 * *************************************************/

const uSocketFlashTimer = 500;
const dpsSocketLight = [27];
const dpsSocket = [1, dpsSocketLight];
const dpsSocketColour = [28];
const dpsSocketColourHex = [31];
const socketColorHexArray = [
	[ 'red', 'ff040000016464' ], [ 'green', '47ff000067ffff' ],
	[ 'blue', '0033ff00e3ffff' ], [ 'yellow', 'ffc400002effff' ], 
	[ 'magenta', 'ff00e90131ffff' ], [ 'cyan', '00ffdb00abffff' ],
	[ 'white', 'ff00000000ffff' ]
];

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
	logStatus('* New color: ', newColor);
	const [whiteOrColour, valueColorHex] = tuyaDeviceConvertColorToHex(newColor, socketColorHexArray);

	if (valueColorHex == undefined) {
		console.log(`Error: ${colorRed}${tuyaError}${colorReset}`);
		return (tuyaError);
	}
	await tuyaDeviceInit(deviceSocket);

	console.log('* Define colour');
	await tuyaDeviceSetStatus(whiteOrColour, deviceSocket, dpsSocketColour);
	console.log('* Set new color');
	var currentStatus = await tuyaDeviceSetStatus(valueColorHex, deviceSocket, dpsSocketColourHex);
	console.log('* Turn ON device');
	await tuyaDeviceSetStatus(true, deviceSocket, dpsSocket);

	tuyaDeviceReset(deviceSocket);
	return (tuyaDeviceConvertStatusToResult(currentStatus, socketColorHexArray));
}

async function tuyaSmartSocketSetFlash(uTimer) {
	await tuyaDeviceInit(deviceSocket);

	var currentStatus = await tuyaDeviceSetFlash(uTimer, uSocketFlashTimer, deviceSocket, dpsSocketLight);

	tuyaDeviceReset(deviceSocket);
	return (currentStatus);
}

/***************************************************
 * 
 * 					Led Messenger
 * 
 * *************************************************/

const ledMessengerIp = '192.168.2.3'
const ledMessengerUrl = 'http://' + ledMessengerIp + '/';

async function ledMessengerSetStatus(msg, its, spd, stc) {
	var result;

	console.log(`Set message: ${colorBlue}'%s'${colorReset}`, `${msg}`);
	console.log(`Set intensity: ${its}`);
	console.log(`Set speed: ${spd}`);
	console.log(`Set static: ${stc}`);

	await superagent.get(ledMessengerUrl).query({ message: msg, intensity: its, speed: spd, static: stc })
	.then(res => result = res.text);

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

async function logSchema(device) {
	await tuyaDeviceInit(device);

	await device.get({schema: true}).then(data => console.log(data));

	tuyaDeviceReset(device);
}