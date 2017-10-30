
// Require modules.

var http = require("http");
var request = require("request");
var cheerio = require("cheerio");

// Import credentials.

var creds = require('./credentials.js');

const user = creds.credentials.jiraUserName;
const pass = creds.credentials.jiraPassword;
const basePath = creds.credentials.stashBasePath;

var credsCode = new Buffer(user + ':' + pass).toString('base64')
console.log(credsCode);

var headers = {
    'Authorization': 'Basic ' + credsCode,
    'Content-Type': 'application/json'
};

var options = {
    url: basePath + '/rest/api/1.0/users/' + user + '/repos?limit=10',
    headers: headers
};

function callback(error, response, body) {
  console.log('hey');
    if (!error && response.statusCode == 200) {
      var server = http.createServer(function(request, response) {
        response.writeHead(200, {"Content-Type": "text/html"});
        response.write(body);
        response.end();
      });
      server.listen(8000, "127.0.0.1");
      console.log("Server is listening");
    }
}

request(options, callback);


