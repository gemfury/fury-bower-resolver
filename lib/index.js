var Fury = require('./fury.js');
var util = require('./util.js');
var path = require('path');
var tmp = require('tmp');
tmp.setGracefulCleanup();
var fs = require('fs');

/**
 * Factory function for resolver
 * It is called only one time by Bower, to instantiate resolver.
 * You can instantiate here any caches or create helper functions.
 */
module.exports = function resolver (bower) {
  // Instantiate Gemfury client configuration
  var fury = new Fury(bower);

  // Returns an instance of FuryResolver
  return {
    // Checks if fury:// source or is auto-located
    match: function (source) {
      return fury.matchPromise(source);
    },

    // Rewrite package names to fury:// as needed
    locate: function (source) {
     return fury.matchPromise(source).then(function(isMatch) {
        if(isMatch && !fury.isFuryURI(source)) {
          return fury.buildURI(null, source);          
        } else {
          return source;
        }
      });
    },

    // List available versions for given source
    releases: function (source) {
      return fury.sourceRequest(source).then(function(info) {
        return info['_versions'].map(function(v) {
          return { target: v, version: v};
        });
      });
    },

    // Downloads and extracts package to temporary directory
    fetch: function (endpoint, cached) {
      // If cached version of package exists, re-use it
      if (cached && cached.version) {
        return;
      }

      // Fetch version info, download, and unzip
      var req = fury.sourceRequest(endpoint.source, endpoint.target);
      return req.then(function(version) {
        // Choose a temporary path and download package
        var zipPath = tmp.tmpNameSync({ dir: tmp.dirSync().name });
        return util.downloadFile(version.download.url, zipPath);
      }).then(function(zipFile) {
        var pkgDir = tmp.dirSync();
        return util.unzipFile(zipFile, pkgDir.name);
      }).then(function(pkgDir) {
        // Package content can all be in one subdir
        var listing = fs.readdirSync(pkgDir);
        if(listing.indexOf('bower.json') < 0) {
          pkgDir = path.join(pkgDir, listing[0]);
        }

        // Final answer!
        return {
          tempPath: pkgDir,
          removeIgnores: true
        };
      });
    }
  };
}
