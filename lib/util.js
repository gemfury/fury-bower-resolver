var unzip = require('decompress-zip');
var Promise = require("bluebird");
var request = require('request');
var tmp = require('tmp');
var fs = require('fs');

module.exports = {
  downloadFile: function(url, savePath) {
    return new Promise(function (resolve, reject) {
      var zipReq = request(url)
      .on('error', reject)
      .on('response', function (response) {
        var status = response.statusCode;
        if (status < 200 || status >= 300) {
          reject(new Error("Download responded with " + status + " status code"));
        }
      });

      // Write ZIP file to disk
      zipReq.pipe(fs.createWriteStream(savePath))
      .on('error', reject).on('close', function() {
        resolve(savePath);
      });
    });
  },

  unzipFile: function(zipFile, destDir) {
    return new Promise(function (resolve, reject) {
      var pkgDir = tmp.dirSync();
      new unzip(zipFile)
      .on('error', reject)
      .on('extract', function() {
        resolve(destDir);
      }).extract({
        path: destDir,
        follow: false,
        filter: function(e) {
          return e.type !== 'SymbolicLink';
        }
      });
    });
  }
};
