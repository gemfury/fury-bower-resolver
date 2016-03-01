Bower Resolver for Gemfury
==========================

[![npm version](https://badge.fury.io/js/fury-bower-resolver.svg)](https://badge.fury.io/js/fury-bower-resolver)

This is an extension to [Bower package manger](http://bower.io/) to enable
installation of private and public packages from [Gemfury](https://gemfury.com).
This guide is a short summary of enabling and  using this extension with
Bower, if you want to learn more about using Bower with Gemfury, please take a
look at our [Bower private repository](https://gemfury.com/help/bower-registry)
documentation.

[Gemfury](https://gemfury.com) is your personal cloud for private and public
Bower, npm, and other packages. Once you upload your packages and enable
Gemfury as a source, you can securely deploy any package to any host. It's
simple, reliable, and hassle-free.

## Initial set-up and configuration

To get started, please install Bower (1.5.0+) and this resolver:

```bash
npm install -g fury-bower-resolver
```

You will also update your [`.bowerrc`](http://bower.io/docs/config/) file to
use this resolver. This can be done globally or per-project:

```json
{
  "resolvers": [
    "fury-bower-resolver"
  ]
}
```

**That's it!**  You can now install Bower packages from Gemfury.

## Installing packages from Gemfury

Once you've enabled this resolver, you can install packages individually:

```bash
bower install fury://username/pkg-name
```

Or include them as a dependency in your project's `bower.json`:

```json
{
  "dependencies": {
    "pkg-name": "fury://username/pkg-name#1.1.*"
  }
}
```

## Authenticating to install private packages

Without authentication, this resolver allow you to install public packages
from any Gemfury account.  To install private packages, you need to provide
your secret Gemfury token.  You can get this token from your Gemfury dashboard,
and pass it to the resolver using the `FURY_TOKEN` environment variable:

```bash
FURY_TOKEN=mY-sEcRet-token bower install
```

If it's not possible for you to modify the environment of your Bower
installation, or you would like to save your token during development, you
can specify it via `~/.bowerrc`:

```json
{
  "furyResolver": {
    "authToken": "mY-sEcRet-token"
  }
}
```

**We can only recommend this method for local development. Please do not
commit your secrets/passwords into your SCM or distributed packages.**

## Advanced: Enabling cascading auto-discovery

This resolver has two modes of operation: implicit and explicit.  As shown
above, explicit mode allows you to choose which packages will come from a
Gemfury account by specifying a `fury://` source.  Alternatively, implicit
mode, when enabled, will try to install all packages from your Gemfury account,
falling back on the default public registry for packages not found in Gemfury.
Explicit sources can be used with or without enabling implicit mode.

### Explicitly specifying Gemfury packages

Explicit mode lets you specify which packages come from your account by using a
Gemfury-specific URL as package source.  The URL format is as follows:

    fury://<account-username>/<package-name>

So your dependencies in `bower.json` will look as follows. In this case,
`moment` will be installed from `my-org` Gemfury account, while `jquery` will
come from the public registry:

```json
{
  "dependencies": {
    "moment": "fury://my-org/moment#2.0.*",
    "jquery": "^2.0.0"
  }
}
```

### Implicitly overriding packages with Gemfury

Implicit mode allows you to keep your existing `bower.json`, while this
resolver checks your Gemfury account for existence of each package by name,
falling back on the default public registry for those not found in your
account.

Implicit mode is disabled by default.  To enable it, please specify
which account to search in your `.bowerrc`:

```json
{
  "furyResolver": {
    "locateInAccount": "my-gemfury-username"
  }
}
```

### Example: Putting it all together

For example, let's say that my personal Gemfury username is `johnny`,  and I
work at an organization `fury-org`.  Our main package is `fury-unleashed`, and
we have our own patched version of `moment` - both in `fury-org` account.

I will set up `~/.bowerrc` on my laptop as follows:

```json
{
  "resolvers": [
    "fury-bower-resolver"
  ],
  "furyResolver": {
    "authToken": "my-personal-token",
    "locateInAccount": "fury-org"
  }
}
```

Now, I can have the following dependencies in my `bower.json`:

```json
{
  "dependencies": {
    "my-fury-hacks": "fury://johnny/my-fury-hacks",
    "fury-unleashed": null,
    "moment": "^2.11.0",
    "jquery": "^2.0.0"
  }
}
```

Here's what will happen with each of those packages, given the configuration:

```
my-fury-hacks:   installed from my personal account johnny
fury-unleashed:  implicitly found and installed from fury-org
moment:          implicitly found and installed from fury-org
jquery:          installed from public registry after not finding it in fury-org
```

## Contribution and Improvements

Please [email us](mailto:support@gemfury.com) if we've missed some key
functionality or you have problems installing your packages.  Better yet, fork
the code, make the changes, and submit a pull request to speed things along.

### Submitting updates

If you would like to contribute to this project, just do the following:

1. Fork the repo [on Github](https://github.com/gemfury/fury-bower-resolver).
2. Add your features and make commits to your forked repo.
3. Make a pull request to this repo.
4. Review will be done and changes may be requested.
5. Once changes are done or no changes are required, PR will be merged.
6. The next release will include your changes.

Please take a look at the issues page if you want to get started.

### Feature requests

If you think it would be nice to have a particular feature that is presently
not implemented, we would love to hear your suggestions and consider working
on it in the future.  Just open an issue in Github.

## Questions

Please email support@gemfury.com or file a Github Issue if you have any other
questions or problems.
