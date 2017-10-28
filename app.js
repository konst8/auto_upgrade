// How to use
// 1) Install node globally in the system.
// 2) Run "node auto_upgrade.js" in console.
// 3) In browser address bar put http://127.0.0.1:8000
// 4) Use the input field to load Jira ticket details.

// Require contrib modules.

var http = require("http");
var fs = require("fs");

// Require custom modules.

var jira = require('./jira.js');

// Links to static files to be loaded in browser.

var styleLink = '<link type="text/css" rel="stylesheet" href="/styles/style.css">';
var scriptLink = '<script src="browserScripts.js"></script>';

// Create a server.

var server = http.createServer(function(request, response) {
  // Ipmlement primitive routing.
  // Load styles.
  if (request.url.split('?')[0].endsWith('.css')) {
    var style = fs.readFileSync('styles/style.css','utf8');
    response.writeHead(200, {"Content-Type": "text/css"});
    response.write(style);
    response.end();
  // Load browser scripts.
  } else if (request.url.split('?')[0].endsWith('.js')) {
    var script = fs.readFileSync('browserScripts.js','utf8');
    response.writeHead(200, {"Content-Type": "application/javascript"});
    response.write(script);
    response.end();
  } else if (request.method === 'GET') {
    // Build homepage.
    response.writeHead(200, {"Content-Type": "text/html"});
    response.write('<html document>');
    response.write('<head>');
    response.write(styleLink);
    response.write(scriptLink);
    response.write('</head>');
    response.write('<body>');    
    response.write('</body></html>');
    response.end();
  } else {
    // AJAX - Return requested Jira ticket.
    response.writeHead(200, {"Content-Type": "text/html"});
    let body = [];
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      jira.requestTicket(body, response);
    });
  }
});
server.listen(8000, "127.0.0.1");
console.log("Server is listening");

