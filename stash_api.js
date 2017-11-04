
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

var headers = {
  'Authorization': 'Basic ' + credsCode,
  'Content-Type': 'application/json'
};

var options = {
  url: basePath + '/rest/api/1.0/users/' + user + '/repos?limit=1',
  headers: headers
};

function callback(error, response, body) {
  if (!error && response.statusCode == 200) {
    var server = http.createServer(function(request, response) {
      var jsonOutput = JSON.parse(body);
      var links = [];
      links.push(basePath + jsonOutput.values[0].link.url);
      links.push(jsonOutput.values[0].cloneUrl);
      response.writeHead(200, {"Content-Type": "text/html"});      
      links.forEach(function(link){
        response.write('<div>' + '<a href="' + link + '">' + link + '</a></div>');
      });
      response.end();
    });
    server.listen(8000, "127.0.0.1");
    console.log("Server is listening");
  }
}

request(options, callback);