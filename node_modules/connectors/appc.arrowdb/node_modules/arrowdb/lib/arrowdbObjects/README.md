## Overview

This directory contains the API descriptors for all ArrowDB Objects.

These files are loaded from `lib/apis.js`. Only `.js` files are loaded.

## ArrowDB Object Declarations

Each file exports a JavaScript object where the keys are ArrowDB Object names and
the value is the ArrowDB Object descriptor. The exported object may contain more
than one ArrowDB Objects descriptor.

```javascript
var arrowDBObject = {
	ACLs: {
		// snip
	}
};

module.exports = arrowDBObject;
```

```javascript
var arrowDBObject = {
	Files: {
		// snip
	}
};

module.exports = arrowDBObject;
```

## ArrowDB Object Descriptors

Each ArrowDB Object descriptor can have the following parameters:

* {string} `objectName` (optional)

  The name of the arrowdb object. Defaults to the name of the ArrowDB Object key.

* {string} `restObject` (optional)

  An global override of the name of the REST object to invoke. This value is the
  second part of the URL path (i.e. `/v1/<restObject>/someMethod`).

* {object} `methods` (optional)

  An object containing a mapping of method names to method parameters. Defaults to an empty object.

```javascript
{
	objectName: 'name of arrowdb object',
	methods: {
		methodName: {
			// method settings
		}
	}
}
```

## Method Descriptors

Each method can have the following parameters:

* {string} `httpMethod` (required)

  A string containing the HTTP method. Value must be either "GET", "POST", "PUT", or "DELETE".

* {string|object} `restMethod` (optional)

  If value is a `string`, the method name that is used for entry point
  composition such as "count", "delete", "show/me", "request_reset_password".
  
  If value is an `object`, then must define the following object:
  
  * {string} `entry` (required)
  
     A URL path where "variables" are replaced with actual values from the
     restOptions argument.

  * {array<string>} `variables` (required)
  
     An array of strings of required restOptions. The values are then injected
     into the `entry` string via a replace.

* {string} `restObject` (optional)

  The name of the REST object to invoke. This value is the second part of the
  URL path (i.e. `/v1/<restObject>/someMethod`). This value can be overridden
  by the global `restObject` value.

* {function} `preAction(restOptions, callback?)` (optional)

  A function that is called before the REST request is dispatched. This function
  can accept an optional callback just in case you need async support. The
  function is evaluated within the same context as the ArrowDB instance.

* {function} `postAction(error, result, callback?)` (optional)

  A function that is called after the REST request is completed. This function
  can accept an optional callback just in case you need async support. The
  function is evaluated within the same context as the ArrowDB instance.

```javascript
var arrowDBObject = {
	SomeObject: {
		objectName: 'Some Object',
		restObject: '',
		methods: {
			method1: {
				httpMethod: 'POST'
			},
			method2: {
				httpMethod: 'GET',
				restMethod: 'foo'
			},
			method3: {
				httpMethod: 'GET',
				restMethod: 'foo',
				restObject: 'bar'
			},
			method4: {
				httpMethod: 'GET',
				restMethod: {
					entry: 'classname/foo',
					variables: ['classname']
				}
			},
			method5: {
				httpMethod: 'POST',
				preAction: function (restOptions) {
					console.log('The app key:', this.appKey);
					console.log('REST options are:', restOptions);
				}
				postAction: function (err, result) {
					if (err) {
						console.log('Request failed:', err);
					} else {
						console.log('Request successful:', result);
					}
				}
			},
			method6: {
				httpMethod: 'POST',
				preAction: function (restOptions, callback) {
					setTimeout(function () {
						console.log('The app key:', this.appKey);
						console.log('REST options are:', restOptions);
						callback();
					}, 1000);
				}
				postAction: function (err, result, callback) {
					setTimeout(function () {
						if (err) {
							console.log('Request failed:', err);
						} else {
							console.log('Request successful:', result);
						}
						callback();
					}, 1000);
				}
			}
		}
	}
};

module.exports = arrowDBObject;
```
