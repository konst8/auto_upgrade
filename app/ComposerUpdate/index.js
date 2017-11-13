var fs = require('fs');

class ComposerUpdate {
  constructor(repository, version) {
    this._repository = repository;
    this._version = version;
    this.message = this.checkVersion();
  }

  changeVersion(jsonContent) {
    fs.writeFileSync(module.parent.paths[0] + '/../composer.json', JSON.stringify(jsonContent), function(err) {
      if (err) {
        return "composer.json haven't been updated due code error " + err.code;
      } else {
        return "composer.json successfully updated";
      }
    });
  }

  checkVersion() {
    fs.readFile(module.parent.paths[0] + '/../composer.json', function (err, data) {
      if (!err) {
        let jsonContent = JSON.parse(data);
        let currentVersion = jsonContent.require['jjconsumer/jjbos-platform'];
        if (currentVersion.indexOf(this._version, 1) >= 0) {
          return 'Platform version has already been updated';
        } else {
          jsonContent.require['jjconsumer/jjbos-platform'] = "~" + this._version + ".0";
          this.changeVersion(jsonContent);
        }
      }
    }.bind(this));
  }
}

module.exports = ComposerUpdate;

/*
 Call:
 let ComposerUpdate = require('./app/ComposerUpdate');
 let composer = new ComposerUpdate([repository], [version]);
*/