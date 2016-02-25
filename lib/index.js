var reqPromise = require('request-promise');
var util = require('./util.js');
var tmp = require('tmp');
var url = require('url');
tmp.setGracefulCleanup();

var FURY_REGISTRY   = 'https://bower.fury.io';
var FURY_SRC_PREFIX = 'fury://';

/**
 * Factory function for resolver
 * It is called only one time by Bower, to instantiate resolver.
 * You can instantiate here any caches or create helper functions.
 */
module.exports = function resolver (bower) {
  // Retrieve FuryResolver configuration
  var fury = bower.config.furyResolver || {};
  var auth = process.env["FURY_TOKEN"] || fury.authToken;
  var registryUrl = fury.registry || FURY_REGISTRY;

  // Request fury:// as https://bower.fury.io/...
  var furySourceRequest = function(source, version) {
    var fUrl = url.parse(registryUrl);
    var src = url.parse(source);

    // To https://bower.fury.io/<acct>/packages/<pkg>/
    fUrl.pathname = src.hostname + "/packages" + src.pathname;

    // (Optional) Add version number to path
    if(version) fUrl.pathname += "/" + version;

    // (Optional) Add Gemfury authentication
    if(auth) fUrl.auth = auth + ":";

    // Let's go!
    return reqPromise({ url: url.format(fUrl), json: true })
  };

  // Resolver factory returns an instance of resolver
  return {

    // Match method tells whether resolver supports given source
    // It can return either boolean or promise of boolean
    match: function (source) {
      return source.indexOf(FURY_SRC_PREFIX) === 0
    },

    // Automatically locate exiting account packages
    // Can resolve or normalize sources, like:
    // "jquery" => "git://github.com/jquery/jquery.git"
    locate: function (source) {
      return source;
    },

    // List available versions of given source
    releases: function (source) {
      return furySourceRequest(source).then(function(info) {
        return info['_versions'].map(function(v) {
          return { target: v, version: v};
        });
      });
    },

    // It downloads package and extracts it to temporary directory
    // You can use npm's "tmp" package to tmp directories
    // See the "Resolver API" section for details on this method
    fetch: function (endpoint, cached) {
      // If cached version of package exists, re-use it
      if (cached && cached.version) {
        return;
      }

      // Fetch version info, download, and unzip
      var req = furySourceRequest(endpoint.source, endpoint.target);
      return req.then(function(version) {
        // Choose a temporary path and download package
        var zipPath = tmp.tmpNameSync({ dir: tmp.dirSync().name });
        return util.downloadFile(version.download.url, zipPath);
      }).then(function(zipFile) {
        var pkgDir = tmp.dirSync();
        return util.unzipFile(zipFile, pkgDir.name);
      }).then(function(pkgDir) {
        return {
          tempPath: pkgDir,
          removeIgnores: true
        };
      });
    }
  }
}
