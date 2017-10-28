
// Require contrib modules.

var request = require("request");
var cheerio = require("cheerio");

// Import Jira credentials.

var creds = require('./credentials.js');

const user = creds.jiraUserName;
const pass = creds.jiraPassword;

exports.requestTicket = function(urlToTicket, responseToBrowser) {
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