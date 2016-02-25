var reqPromise = require('request-promise');
var Promise = require("bluebird");
var url = require('url');

// Defaults & constants
var FURY_REGISTRY   = 'https://bower.fury.io';
var FURY_SRC_PREFIX = 'fury://';

// Gemfury registry client
function Fury(bower) {
  // Retrieve FuryResolver configuration
  var fury = this.config = bower.config.furyResolver || {};
  this.auth = process.env["FURY_TOKEN"] || fury.authToken;
  this.registryUrl = fury.registry || FURY_REGISTRY;

  // Auto-locate packages in a specified account
  this.locateInAccount = fury.locateInAccount;
  this.accountPackageNames = null;
}

// Request fury:// as https://bower.fury.io/...
Fury.prototype.sourceRequest = function(source, version) {
  var fUrl = url.parse(this.registryUrl);
  var src = url.parse(source);

  // Start with https://bower.fury.io/<acct>/packages
  fUrl.pathname = src.hostname + "/packages";

  // (Optional) Add package/version, if specified
  if(src.pathname) {
    fUrl.pathname += src.pathname;
    if(version) fUrl.pathname += "/" + version;
  }

  // (Optional) Add Gemfury authentication
  if(this.auth) fUrl.auth = this.auth + ":";

  // Let's go!
  return reqPromise({ url: url.format(fUrl), json: true })
};


// Return whether the current account has named package
Fury.prototype.matchPromise = function(source) {
  var isFury = this.isFuryURI(source);

  // Use URI matching if auto-locate is disabled
  if(isFury || !this.locateInAccount) {
    return Promise.resolve(isFury);
  }

  // Match package in cached or fetched name list
  if(this.accountPackageNames) {
    var isMatch = this.accountPackageNames.indexOf(source) >= 0;
    return Promise.resolve(isMatch);
  } else {
    return this.sourceRequest(this.buildURI()).then(function(packages) {
      return packages.map(function(p) { return p['name']; });
    }).then(function(names) {
      this.accountPackageNames = names;
      return names.indexOf(source) >= 0;
    }.bind(this));
  }
};

// Check if the source is a fury:// URI
Fury.prototype.isFuryURI = function(source) {
  return source.indexOf(FURY_SRC_PREFIX) === 0;
}

// Build fury:// URI from array of arguments
Fury.prototype.buildURI = function() {
  var parts = Array.prototype.slice.call(arguments);
  parts[0] = parts[0] || this.locateInAccount;
  return FURY_SRC_PREFIX + parts.join('/');
}

// Unleash the Fury!!!
module.exports = Fury;
