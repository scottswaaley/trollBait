var AYLIENTextAPI = require('aylien_textapi');
var SerialPort = require('serialport');
var port = new SerialPort('/dev/ttyAMA0',{baudRate:9600});

var storageString = "";

var textapi = new AYLIENTextAPI({
    application_id: "1d2c46a5",
    application_key: "3d6202029a39b0ac724cfd2030422cb3"
  });

port.on('data', function(data){ 
	console.log(data);
}); 
port.on('open', function(data){ 
	console.log("open");
	var myText = "server start";
	writeToBadge(myText);
}); 

function writeToBadge (text) {
	var paginatedText = addNewLines(text);
	port.write(paginatedText, function(err) {
		if (err) {
			return console.log('Error on write: ', err.message);
		}
		console.log('message written to badge:' + paginatedText);
		storageString += "\n" + text;
	});
}

function getSentiment(inputText) {
    textapi.sentiment({ 'text': inputText}, function(error, response) {
		if (error === null) {
			console.log("Sentiment processed: " + JSON.stringify(response));
			var tempResponse = '$' + response.polarity + '$';
			writeToBadge (tempResponse);
      }
    });
}

function addNewLines(str) {
  var result = '';
  while (str.length > 0 && result.length < 180) {
    result += str.substring(0, 19) + '\n';
    str = str.substring(19);
  }
  console.log(result);
  return result;
}

// load needed modules
const express = require('express');
const app = express();

// configure multer
var multer  = require('multer')
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
  }
})

var upload = multer({ storage: storage })

app.get('/', function (req, res) {
  res.sendFile('/home/pi/Desktop/myServer/views/index.html');
  var queryText = req.query.text;
  if(queryText != null && queryText != undefined) {
	  queryText = decodeURI(queryText);
	  writeToBadge(queryText);
	  getSentiment(queryText);
  }
})

app.listen(3000, function () {
  
  console.log('Example app listening on port 3000!')
})

app.post('/', upload.single('imageupload'),function(req, res) {
  writeToBadge(req.body.caption);
  getSentiment(req.body.caption);
  res.send("Submitted: " + req.body.caption);
});

    
