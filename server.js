
const colorReset = '\x1b[0m';
const colorRed = '\x1b[31m';
const colorGreen = '\x1b[32m';
const colorYellow = '\x1b[33m';
const colorBlue = '\x1b[34m';
const colorMagenta = '\x1b[45m';
const colorWhite = '\x1b[47m';
const dpsLight = [20];
const dpsSocket = [1, 27];

var express = require('express');
var tuyApi = require('tuyapi');

var deviceLight = new tuyApi({
	id: '40770742dc4f227126be',
	key: '144ea7591e111996'
});

var deviceSocket = new tuyApi({
	id: '23106066bcddc298d80e',
	key: '6df35ba291cb464b'
});

var hostname = '192.168.2.6';
var port = 3000;
 
var app = express();
var myRouter = express.Router();
 
/***************************************************
 * 
 * 					Routes GET
 * 
 * *************************************************/

myRouter.route('/')
.all(function(req,res){ 
      res.json({message : 'EscapeTech_BrokerApi. Check: https://github.com/nasrat-v/EscapeTech_BrokerApi'});
});

myRouter.route('/turnOnLight')
.get(function(req, res) {
	console.log('\n<< Turn Light request >>');
	(async() => {
		var status = await tuyaDeviceSetStatus(true, deviceLight, dpsLight);
		res.json({message : status, methode : req.method});
	})();
})

myRouter.route('/turnOffLight')
.get(function(req, res) {
	console.log('\n<< Turn light request >>');
	(async() => {
		var status = await tuyaDeviceSetStatus(false, deviceLight, dpsLight);
		res.json({message : status, methode : req.method});
	})();
})

myRouter.route('/getStatusLight')
.get(function(req, res) {
	console.log('\n<< Status light request >>');
	(async() => {
		var status = await tuyaDeviceGetStatus(deviceLight, dpsLight);
		res.json({message : status, methode : req.method});
	})();
})

myRouter.route('/turnOnSocket')
.get(function(req, res) {
	console.log('\n<< Turn socket request >>');
	(async() => {
		var status = await tuyaDeviceSetStatus(true, deviceSocket, dpsSocket);
		res.json({message : status, methode : req.method});
	})();
})

myRouter.route('/turnOffSocket')
.get(function(req, res) {
	console.log('\n<< Turn socket request >>');
	(async() => {
		var status = await tuyaDeviceSetStatus(false, deviceSocket, dpsSocket);
		res.json({message : status, methode : req.method});
	})();
})

myRouter.route('/getStatusSocket')
.get(function(req, res) {
	console.log('\n<< Status socket request >>');
	(async() => {
		var status = await tuyaDeviceGetStatus(deviceSocket, dpsSocket);
		res.json({message : status, methode : req.method});
	})();
})

app.use(myRouter);  
app.listen(port, hostname, function(){
	console.log('Server launched http://' + hostname + ':' + port); 
});

/***************************************************
 * 
 * 					Tuya devices
 * 
 * *************************************************/

async function tuyaDeviceInit(device) {
	await device.find();
	console.log('Device found');
	await device.connect();
	console.log('Connected to device');
}

function tuyaDeviceReset(device) {
	device.disconnect();
	console.log('Disconnected from device');
}

async function tuyaDeviceSetStatus(newStatus, device, dpsNums) {
	var currentStatus;

	logStatus(newStatus);
	await tuyaDeviceInit(device);

	await device.get({ dps: dpsNums[0] }).then(status => currentStatus = status);
	if (currentStatus != newStatus) {
		for (i = 0; i < dpsNums.length; i++) {
			await device.set({ dps: dpsNums[i], set: newStatus });
		}
		await device.get({ dps: dpsNums[0] }).then(status => currentStatus = status);
		console.log(`Current status: ${colorMagenta}%s${colorReset}`, `${currentStatus}`);
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
	console.log(`Current status: ${colorMagenta}%s${colorReset}`, `${currentStatus}`);

	tuyaDeviceReset(device);
	return (currentStatus);
}

/***************************************************
 * 
 * 					Log function
 * 
 * *************************************************/

 function logStatus(status) {
	if (status) {
		console.log(`New status: ${colorGreen}%s${colorReset}`, `${status}`);
	} else {
		console.log(`New status: ${colorRed}%s${colorReset}`, `${status}`);
	}
 }