# ArrowDB Node SDK [![Build Status](https://travis-ci.org/appcelerator/arrowdb-node-sdk.svg)](https://travis-ci.org/appcelerator/arrowdb-node-sdk)

The SDK of ArrowDB for NodeJS

## Getting started

```bash
git clone git+https://github.com/appcelerator/arrowdb-node-sdk.git
cd arrowdb-node-sdk
npm install
```

## Basic Example

You can get an overview of ArrowDB Node SDK example from examples/basic.js

```bash
cd arrowdb-node-sdk/examples
export ARROWDB_APPKEY=YOUR_ARROWDB_TEST_APPKEY
node basic.js
```

## ArrowDB Node SDK Example on Node.ACS
There is another example for ArrowDB Node SDK to show how to run on Node.ACS as a service.

Make sure you have installed Node.ACS command line tool first:

```bash
sudo npm -g install acs
```

Then you can try:

```bash
cd arrowdb-node-sdk/examples/over_nodeacs
# Update config.json to fill in your ArrowDB app key
vi config.json
acs run
```

Open another session and try:

```bash
curl -b cookie.txt -c cookie.txt -X POST -F "login=YOUR_USERNAME" -F "password=YOUR_PASSWORD" http://localhost:8080/login
curl -b cookie.txt -c cookie.txt -X GET http://localhost:8080/showMe
```

# ArrowDB Node SDK Basic Usage

## Use ArrowDB Node SDK directly

```javascript
var ArrowDB = require('arrowdb');
var arrowDBApp = new ArrowDB('Your_ARROWDB_APPKEY');

arrowDBApp.usersLogin({
    login: ARROWDB_USERNAME,
    password: ARROWDB_PASSWORD
}, function(err, result) {
    if (err) {
        console.error(err);
        return;
    }
    console.log('Logged in user: %j', result.body);
    arrowDBApp.usersShowMe(function(err, result) {
        if (err) {
            console.error(err);
            return;
        }
        console.log('Show user: %j', result.body);
    });
});
```

## Use ArrowDB Node SDK inner express or http/https NodeJS module

```javascript
// HTTP call 1 with cookie:
var arrowDBApp = new ArrowDB('Your_ARROWDB_APPKEY');

arrowDBApp.usersLogin({
    login: req.body.login,
    password: req.body.password,
    req: req,
    res: res
}, function(err, result) {
    if (err) {
        console.error(err);
        return;
    }
    res.end(result.body);
});

// HTTP call 2 with cookie, after HTTP call 1:
var ArrowDB = require('arrowdb');
var arrowDBApp = new ArrowDB('Your_ARROWDB_APPKEY');

arrowDBApp.usersShowMe(ARROWDB_APPKEY, {
    req: req,
    res: res
}, function(err, result) {
    if (err) {
        console.error(err);
        return;
    }
    res.end(result.body);
});
```

## Custom ACS Endpoint

```javascript
var ArrowDB = require('arrowdb');
var arrowDBApp = new ArrowDB(arrowDBKey, {
	    apiEntryPoint: "api.customacs.com",
		prettyJson: true
	});
```

## General RestAPI call

```javascript
var arrowDBApp = new ArrowDB('Your_ARROWDB_APPKEY');

arrowDBApp.post(ARROWDB_APPKEY, '/v1/users/login.json', {
    login: ARROWDB_USERNAME,
    password: ARROWDB_PASSWORD
}, function(err, result) {
    if (err) {
        console.error(err);
        return;
    }

    console.log('ArrowDB returned body: %j', result.body);
    console.log('Cookie string returned: %s', result.cookieString);

    arrowDBApp.get(ARROWDB_APPKEY, '/v1/users/show/me.json', function(err, result) {
        if (err) {
            console.error(err);
            return;
        }
        console.log('ArrowDB returned user: %j', result.body);
    });
});
```

## Session Management

By default, arrowdb-node-sdk will manage sessions for you automatically when you
log in and out. You can create a new `ArrowDB` instance for each authenticated
session. You can also reuse an existing instance by calling `usersLogin()` again,
however this simply overwrites the existing session cookie and will not log out
the previous session.

However, if you'd prefer to manually manage the session cookie, then you can set
the `autoSessionManagement` option to `false` when the `ArrowDB` instance is
created.

```javascript
var arrowDBApp = new ArrowDB('Your_ARROWDB_APPKEY', {
    autoSessionManagement: false
});
```

This means once you log in, you must track the session cookie yourself:

```javascript
arrowDBApp.usersLogin({
    login: ARROWDB_USERNAME,
    password: ARROWDB_PASSWORD
}, function(err, result) {
    if (err) {
        console.error(err);
        return;
    }
    
    console.log('Logged in user');
    console.log('Cookie string returned: %s', result.cookieString);
    
    // IMPORTANT! You must set the sessionCookieString or else all privileged calls will fail
    arrowDBApp.sessionCookieString = result.cookieString;
});
```

## Running Unit Tests

To run the unit tests, simply run:

    export ARROWDB_APPKEY=ONE_OF_YOUR_ARROWDB_TEST_APPKEY
    npm test

## License

This project is open source and provided under the Apache Public License
(version 2). Please make sure you see the `LICENSE` file included in this
distribution for more details on the license.  Also, please take notice of the
privacy notice at the end of the file.

#### (C) Copyright 2015, [Appcelerator](http://www.appcelerator.com/) Inc. All Rights Reserved.
