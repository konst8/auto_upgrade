
// Require modules.

const http = require("http");
const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");
const exec = require('child_process').exec;

// Import settings.

const settings = require('./settings.js');

// Set Stash credentials.

const user = settings.credentials.jiraUserName;
const pass = settings.credentials.jiraPassword;
const credsCode = new Buffer(user + ':' + pass).toString('base64');

// Set local paths.

const repoName = settings.repoName;
const projectKey = settings.projectKey;
const pathToLocalPlatform = settings.localPaths.newPlatform;
const pathToLocalSite = pathToLocalPlatform + /sites/ + repoName;

// Set Stash rest API paths.

const stashBasePath = settings.credentials.stashBasePath;
const stashApiEndpoint = stashBasePath + '/rest/api/1.0/';
const stashBranchEndpoint = stashBasePath + '/rest/branch-utils/1.0/';
const stashSyncEndpoint = stashBasePath + '/rest/sync/1.0/';

// Set default branch.

const defaultBranchName = settings.defaultBranchName;

// Set default request header.

const defaultRequestHeaders = {
  'Authorization': 'Basic ' + credsCode,
  'Content-Type': 'application/json'
};

// Checks if local site repo exists.

function localRepoExists() {
  return fs.existsSync(pathToLocalSite);
}

// Executes git command for any folder in the file system without leaving the current folder.
// Don't use 'git' keyword to pass a command.

function _gitExec(path, gitCommand, callback) {
  var gitAbsolutePrefix = gitCommand.startsWith('clone') ? 
    'git ':
    'git --git-dir=' + path + '/.git ' + '--work-tree=' + path + ' ';
  exec(gitAbsolutePrefix + gitCommand, (error, stdout, stderr) => {
    if (error) {
      throw error;
    }
    if (typeof callback === "function") {
      callback(error, stdout, stderr);
    }
  });
}

// Switch local branch and upate repo.

function updateLocalRepo() {
  console.log ('Updating local repo...');
  _gitExec(pathToLocalSite, 'checkout ' + defaultBranchName + ' -f', () =>
    _gitExec(pathToLocalSite, 'clean -df', () =>
      _gitExec(pathToLocalSite, 'pull origin ' + defaultBranchName, () => {
        console.log('Local repo is updated.');
        console.log(pathToLocalSite);
      })
    )
  );
}

// Get clone link for forked repo.
// If fork doesn't exist - create it first.

function getForkCloneUrl(callback) {
  const requestOptions = {
    url: stashApiEndpoint + 'users/' + user + '/repos/' + repoName,
    headers: defaultRequestHeaders
  };
  console.log('Checking fork...');
  function requestCallback(error, response, body) {
    if (error) {
      throw error;
    }
    if (response.statusMessage === 'OK') {
      console.log('Fork exists.');
      const forkJson = JSON.parse(body);
      const cloneUrl = forkJson.links.clone.reduce((previousItem, currentItem) => (
        currentItem.name === 'ssh' ? currentItem.href : previousItem.href
      ));
      console.log(`Clone url: ${cloneUrl}`);
      if (typeof callback === "function") {
        callback(cloneUrl);
      }      
    } else if (response.statusMessage === 'Not Found') {
      console.log('Fork does not exist.');
      createFork(() => 
        getForkCloneUrl(cloneUrl => 
          cloneFork(cloneUrl, () => 
            updateLocalRepo()
          )
        )
      );
    }
  }    
  request(requestOptions, requestCallback);
}

function createFork(callback) {
  const requestOptions = {
    url: stashApiEndpoint + 'projects/' + projectKey + '/repos/' + repoName,
    headers: defaultRequestHeaders,
    method: "POST",
    json: true,
    body: {}
  };
  console.log('Creating fork...');
  function requestCallback(error, response, body) {
    if (error) {
      throw error;
    }
    console.log('Fork is created.');
    // Enable syncing with the source repo.
    // We don't care if it happens a bit later, 
    // so won't wait for callback.
    enableForkSync();
    if (typeof callback === "function") {
      callback();
    }
  }
  request(requestOptions, requestCallback);
}

function cloneFork(cloneUrl, callback = null) {
  console.log('Cloning fork...');
  _gitExec(pathToLocalSite, `clone ${cloneUrl} ${pathToLocalSite}`, () => {
    console.log('Fork is cloned.');
    if (typeof callback === "function") {
      callback();
    }
  });
}

function enableForkSync(callback = null) {
  const requestOptions = {
    url: stashSyncEndpoint + 'projects/~' + user + '/repos/' + repoName,
    headers: defaultRequestHeaders,
    method: "POST",
    json: true,
    body: {
      "enabled": true
    }
  };
  console.log('Syncing fork with source repo...');
  function requestCallback(error, response, body) {
    if (error) {
      throw error;
    }
    console.log('Fork is synced.');
    if (typeof callback === "function") {
      callback();
    }
  }
  request(requestOptions, requestCallback);
}

function deleteFork() {
  const requestOptions = {
    url: stashApiEndpoint + 'projects/~' + user + '/repos/' + repoName,
    headers: defaultRequestHeaders,
    method: "DELETE"
  };
  console.log(pathToLocalSite);
  console.log('Deleting fork...');
  function requestCallback(error, response, body) {
    if (error) {
      throw error;
    }
    console.log('Fork is deleted.');
  }
  request(requestOptions, requestCallback);
}

// Final function which 
// updates local repo if it exists
// else clones it from fork if fork exists and then updates
// else creates fork from source repo, then clones, then updates.

function prepareLocalRepo() {
  localRepoExists() ?
    updateLocalRepo() :
    getForkCloneUrl(cloneUrl =>
      cloneFork(cloneUrl, () => 
        updateLocalRepo()
      )
    );
}

prepareLocalRepo();