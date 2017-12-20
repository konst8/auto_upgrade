
// Require contrib modules.

var request = require("request");
var cheerio = require("cheerio");

// Import Jira credentials.

var settings = require('./settings.js');

const user = settings.credentials.jiraUserName;
const pass = settings.credentials.jiraPassword;

exports.requestTicket = function(urlToTicket, responseToBrowser) {
  // Jira log in and parse. 
  var credsCode = new Buffer(user + ':' + pass).toString('base64');
  var headers = {
      'Authorization': 'Basic ' + credsCode,
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
        var $provedTasks = $('.issue-link', $tasks).filter(proveTasks);
        $provedTasks.each(function(){
          responseToBrowser.write('<h3>' + '<input type="checkbox"></input>' + $.html($(this)) + '</h3>');
        })
      }
      responseToBrowser.end();
    }
  }
  request(options, jiraCallback);
}

// Filter subtasks and output only those, which we want to handle.

function proveTasks(ind, link) {
  var linkText = link.children[0].data;
  var taskProved = false;
  // Map tasks by keywords in the title.
  var tasksMap = [
    {
      title: 'Update composer.json',
      matches: [
        'Update composer.json'
      ]
    },
    {
      title: 'Prepare jenkins configs',
      matches: [
        'Prepare jenkins configs'
      ]
    },
    {
      title: 'Cefo',
      matches: [
        'Capture'
      ]
    }
  ];
  tasksMap.forEach(function(item){
    item.matches.forEach(function(match){
      if (linkText.includes(match)) {
        return (taskProved = true);        
      }
    });
  });
  return taskProved;
}