 
var express = require('express');
var hostname = 'localhost';
var port = 3000;
 
var app = express();
var myRouter = express.Router();
 
myRouter.route('/')
// GET
.all(function(req,res){ 
      res.json({message : "Welcome on EscapeTech_BrokerApi", methode : req.method});
});

myRouter.route('/turnOffLight')
// GET
.get(function(req, res) {
	  res.json({message : "Turn Off light", methode : req.method});
	  changeStatusLight(false);
})

myRouter.route('/turnOnLight')
// GET
.get(function(req, res) {
	  res.json({message : "Turn On light", methode : req.method});
	  changeStatusLight(true);
})
 
app.use(myRouter);  
app.listen(port, hostname, function(){
	console.log("Server launched http://" + hostname + ":" + port); 
});

function changeStatusLight(status) {
	const TuyAPI = require('tuyapi');

	const device = new TuyAPI({
		id: '40770742dc4f227126be',
		key: '1aaf91783df2d4e7'});
		
		(async () => {                                                                             
			await device.find();
			await device.connect();
		  
			let status = await device.get();
			await device.set({dps: 20, set: status});

			status = await device.get();
			console.log("Status changed for light");

			device.disconnect();
		})(); 
}