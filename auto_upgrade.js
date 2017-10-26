// How to use
// 1) Install node globally in the system.
// 2) Run "node auto_upgrade.js" in console.
// 3) In browser address bar put http://127.0.0.1:8000
// 4) Use the input field to load Jira ticket details.

// Set Jira credentials.

const user = '';
const pass = '';

// Require modules.

var http = require("http");
var request = require("request");
var cheerio = require("cheerio");
var fs = require("fs");

// Browser scripts.

function browserScript() {

  // K_ - set of helpper methods.
  // Generally to create DOM elements in jQuery style.

  const K_ = {
      exists(property) {
         return typeof property !== undefined ? true : false;
      },

      createElement(element, properties) {        
          var newEl = document.createElement(element);
          if (typeof properties === 'object') {
              Object.keys(properties).forEach(function(key) {
                  var value = properties[key];
                  switch(key) {
                      case 'text':
                          var newContent = document.createTextNode(value);
                          newEl.appendChild(newContent);
                      default: 
                          newEl.setAttribute(key, value);
                 }
             });
         }
         return newEl;
     },
  };

  var newInput = K_.createElement('input', {
      placeholder: 'Put link to Jira ticket and press Enter',
      size: '60'
  });

  var newButton = K_.createElement('button', {
    text: 'submit'
  });

  var newForm = K_.createElement('form');
  console.log(newForm);

  var newContainer = K_.createElement('div', {
    class: 'container'
  });

  newForm.addEventListener('submit', function(e){
    e.preventDefault();
    var elInput = document.querySelectorAll('input')[0];
    var elContainer = document.querySelectorAll('.container')[0];

    if (elInput.value.length) {
      // Send submitted data to server.
      var request = new XMLHttpRequest();
      request.open("POST","http://127.0.0.1:8000", true);
      request.onreadystatechange = function(){
        if (request.readyState == 4 && request.status == 200) {
          var response = request.responseText;
          elContainer.innerHTML = response;
        }
      }
      request.send(elInput.value);
    }
    return false;
  });

  newForm.appendChild(newInput);
  document.body.appendChild(newForm);
  document.body.appendChild(newContainer);
}

var style = '<style type="text/css">';
style += fs.readFileSync('styles/style.css','utf8');
style += '</style>';

var script = '<script type="text/javascript">';
script += browserScript + ' browserScript();';
script += '</script>';

function requestToJira(urlToTicket, responseToBrowser) {
  // Jira log in and parse.
  var creds = new Buffer(user + ':' + pass).toString('base64');
  var headers = {
      'Authorization': 'Basic ' + creds,
      'Content-Type': 'application/json'
  };

  var options = {
      url: urlToTicket,
      headers: headers
  };

  function jiraCallback(error, response, body) {
    if (!error && response.statusCode == 200) {
      var $ = cheerio.load(body);
      var $title = $('#summary-val');
      var $description = $('#description-val');
      var $tasks = $('#issuetable');
      responseToBrowser.write('<h2>' + $title.html() + '</h2>');
      responseToBrowser.write($description.html());
      if ($tasks.length) {
        responseToBrowser.write($tasks.html());
      }
      responseToBrowser.end();
    }
  }
  request(options, jiraCallback);
}

// Create a server.

var server = http.createServer(function(request, response) {
  response.writeHead(200, {"Content-Type": "text/html"});
  if (request.method === 'GET') {
    // Return homepage.
    response.write('<html document>');
    response.write('<head>');
    response.write(style);
    response.write('</head>');
    response.write('<body>');
    response.write(script);
    response.write('</body></html>');
    response.end();
  } else {
    // Return requested Jira ticket.
    let body = [];
    request.on('data', (chunk) => {
      body.push(chunk);
    }).on('end', () => {
      body = Buffer.concat(body).toString();
      requestToJira(body, response);
    });
  }
});
server.listen(8000, "127.0.0.1");
console.log("Server is listening");

