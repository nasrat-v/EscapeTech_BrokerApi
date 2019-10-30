
const colorReset = '\x1b[0m';
const colorRed = '\x1b[31m';
const colorGreen = '\x1b[32m';
const colorYellow = '\x1b[33m';
const colorBlue = '\x1b[34m';
const dpsLight = [20];
const dpsSocket = [1, 27];
const ledMessengerUrl = 'https://www.smartledmessenger.com/push.ashx';
const ledMessengerKey = 'VhPIMegM2NBPyGO4+t5V1w==';

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

myRouter.route('/turnOnLight')
.get(function(req, res) {
	console.log('\n[Light request]');
	(async() => {
		var status = await tuyaDeviceSetStatus(true, deviceLight, dpsLight);
		res.json({ 'result': status });
	})();
})

myRouter.route('/turnOffLight')
.get(function(req, res) {
	console.log('\n[Light request]');
	(async() => {
		var status = await tuyaDeviceSetStatus(false, deviceLight, dpsLight);
		res.json({ 'result': status });
	})();
})

myRouter.route('/getStatusLight')
.get(function(req, res) {
	console.log('\n[Light request]');
	(async() => {
		var status = await tuyaDeviceGetStatus(deviceLight, dpsLight);
		res.json({ 'result': status });
	})();
})

myRouter.route('/turnOnSocket')
.get(function(req, res) {
	console.log('\n[Socket request]');
	(async() => {
		var status = await tuyaDeviceSetStatus(true, deviceSocket, dpsSocket);
		res.json({ 'result': status });
	})();
})

myRouter.route('/turnOffSocket')
.get(function(req, res) {
	console.log('\n[Socket request]');
	(async() => {
		var status = await tuyaDeviceSetStatus(false, deviceSocket, dpsSocket);
		res.json({ 'result': status });
	})();
})

myRouter.route('/getStatusSocket')
.get(function(req, res) {
	console.log('\n[Socket request]');
	(async() => {
		var status = await tuyaDeviceGetStatus(deviceSocket, dpsSocket);
		res.json({ 'result': status });
	})();
})

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

	logStatus('New status: ', newStatus);
	await tuyaDeviceInit(device);

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

	tuyaDeviceReset(device);
	return (currentStatus);
}

async function tuyaDeviceGetStatus(device, dpsNums) {
	var currentStatus;

	await tuyaDeviceInit(device);

	await device.get({ dps: dpsNums[0] }).then(status => currentStatus = status);
	logStatus('Current status: ', currentStatus);

	tuyaDeviceReset(device);
	return (currentStatus);
}

/***************************************************
 * 
 * 					Led Messenger
 * 
 * *************************************************/

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