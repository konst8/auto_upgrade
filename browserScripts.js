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
      placeholder: 'Put link to Jira ticket and push Enter!',
      size: '60'
  });

  var newButton = K_.createElement('button', {
    text: 'submit'
  });

  var newForm = K_.createElement('form');

  var newContainer = K_.createElement('div', {
    class: 'container'
  });

  newForm.addEventListener('submit', function(e){
    e.preventDefault();
    var elInput = document.querySelectorAll('input')[0];
    var elContainer = document.querySelectorAll('.container')[0];

    if (elInput.value.length) {
      // Send submitted data to the server.
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

// Init browser scripts on the page once DOM is completely loaded.
document.addEventListener('DOMContentLoaded', browserScript);