// Set credentials.

const user = '';
const pass = '';
const basePath = '';

// Require modules.

var http = require("http");
var request = require("request");
var cheerio = require("cheerio");

var creds = new Buffer(user + ':' + pass).toString('base64')
var headers = {
    'Authorization': 'Basic ' + creds,
    'Content-Type': 'application/json'
};

var options = {
    url: basePath + '/rest/api/1.0/users/' + user + '/repos?limit=10',
    headers: headers
};

function callback(error, response, body) {
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


