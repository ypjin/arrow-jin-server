/**
 * Performs the REST API calls the ArrowDB Objects.
 *
 * @module rest
 *
 * @copyright
 * Copyright (c) 2012-2014 by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

const
	ArrowDBError = require('./arrowdbError'),
	fs = require('fs'),
	http = require('http'),
	messages = require('./messages'),
	request = require('request'),
	_ = require('lodash'),
	debug = require('debug')('arrowdb'),

	fileUploadParams = ['file', 'photo'], // http/https parameters that file upload uses
	excludedParameters = ['key', 'pretty_json', 'req', 'res']; // filtered out http/https parameters, that don't need to be in restOptions

/*
 * Public APIs
 */
module.exports.createArrowDBRequestFunction = createArrowDBRequestFunction;
module.exports.createArrowDBRESTRequestFunction = createArrowDBRESTRequestFunction;

/**
 * Internal function for making RESTful calls to ArrowDB API. It will put parameters
 * including ArrowDB key and `pretty_json` into query string or request body
 * properly, as well as dealing with the session cookie.
 *
 * For required format of ArrowDB API, it will also transform input JSON into correct format.
 *
 * @private
 *
 * @param {string} apiEntryPoint - The URL to use for API calls.
 * @param {object} appOptions - An object containing various options.
 * @param {string} [appOptions.apiEntryPoint] - The URL to use for all requests.
 * @param {boolean} [appOptions.prettyJson] - When truthy, sets the `pretty_json` REST option.
 * @param {string} httpMethod - The HTTP method to use for the request. Valid values include "GET", "POST", "PUT", and "DELETE".
 * @param {string} cookieString - The cookie to set for the session.
 * @param {object} restOptions - An object containing all needed parameters per request such as `username` and `password` for the user login request.
 * @param {function} callback - A function to call after the request completes.
 */
function arrowDBRequest(apiEntryPoint, appOptions, httpMethod, cookieString, restOptions, callback) {
	var reqBody = _.omit(restOptions, excludedParameters),
		theJar = request.jar(),
		cookie = null;

	// cookie may come from either relayed outside request, or cookieString
	if (restOptions.req) {
		if (restOptions.req.headers && restOptions.req.headers.cookie) {
			cookie = request.cookie(restOptions.req.headers.cookie);
			cookie && theJar.setCookie(cookie, apiEntryPoint);
		}
		// Merge req.query and req.body into parameter JSON
		if (restOptions.req.query) {
			reqBody = _.defaults(_.clone(restOptions.req.query), reqBody);
		}
		if (restOptions.req.body) {
			reqBody = _.defaults(_.clone(restOptions.req.body), reqBody);
		}
	}

	// cookieString can from either each requests or ArrowDB instance
	if (restOptions.cookieString || cookieString) {
		cookie = request.cookie(restOptions.cookieString || cookieString);
		cookie && theJar.setCookie(cookie, apiEntryPoint);
	}

	// pretty_json can be set as application level from appOptions
	if (appOptions.prettyJson && !restOptions.hasOwnProperty('pretty_json')) {
		if (typeof appOptions.prettyJson !== 'boolean') {
			return callback(new ArrowDBError(messages.ERR_WRONG_TYPE, {
				typeName: 'prettyJson'
			}));
		}
		reqBody.pretty_json = appOptions.prettyJson;
	}

	// response_json_depth can be set as application level from appOptions
	if (appOptions.responseJsonDepth && !restOptions.hasOwnProperty('response_json_depth')) {
		if (typeof appOptions.responseJsonDepth !== 'number') {
			return callback(new ArrowDBError(messages.ERR_WRONG_TYPE, {
				typeName: 'responseJsonDepth'
			}));
		}
		reqBody.response_json_depth = appOptions.responseJsonDepth;
	}

	var requestParam = null,
		preparedReqBody = {},
		hasFile = false;

	Object.keys(reqBody).forEach(function (item) {
		var value = reqBody[item];
		if (value === undefined || value === null) {
			// if the value is undefined, just return now so that it's not added to the request
			return;
		} else if (fileUploadParams.indexOf(item) !== -1) {
			hasFile = true;
			if (typeof value === 'string') {
				value = fs.createReadStream(value);
			}
		} else if (value !== null && typeof value === 'object') {
			value = JSON.stringify(value);
		} else {
			value = value.toString();
		}
		preparedReqBody[item] = value;
	});

	requestParam = {
		url: apiEntryPoint,
		method: httpMethod,
		jar: theJar
	};

	if (httpMethod === 'GET') {
		requestParam.qs = preparedReqBody;
	} else {
		// if there is any file upload needed, we need to use formData instead of form
		if (hasFile) {
			requestParam.formData = preparedReqBody;
		} else {
			requestParam.form = preparedReqBody;
		}
	}

	debug('request %j',requestParam);

	request(requestParam, function (error, response, body) {
		debug('response - error=%o, body=%o',error,body);
		if (error) {
			return callback(new ArrowDBError(messages.ERR_REQUEST_FAILED_ERROR, { message: error.toString() }));
		}

		if (!response) {
			return callback(new ArrowDBError(messages.ERR_REQUEST_FAILED_NO_RESPONSE));
		}

		var parsedBody = body;

		// if the body is a string, try to json parse it
		if (body && typeof body === 'string') {
			try {
				parsedBody = JSON.parse(body);
			} catch (e) {}
		}

		var errmsg = parsedBody !== null && typeof parsedBody === 'object' && parsedBody.meta && parsedBody.meta.message,
			result = {
				statusCode: response.statusCode,
				reason: errmsg || http.STATUS_CODES[response.statusCode] || '',
				response: response,
				body: parsedBody
			};

		// if there was no explicit error, yet the request is a 4xx or 5xx then error
		if (response.statusCode >= 400) {
			return callback(new ArrowDBError(messages.ERR_REQUEST_UNSUCCESSFUL, result));
		}

		if (restOptions.res) {
			// if this is a relayed response, we will set response header to include cookie back from ArrowDB API
			var cookies = theJar.getCookies(apiEntryPoint);
			restOptions.res.setHeader('Set-Cookie', cookies.join('; '));
		} else {
			result.cookieString = theJar.getCookieString(apiEntryPoint);
		}

		callback(null, result);
	});
}

/**
 * Creates a function for invoking a ArrowDB API. The returned function is
 * expected to be set in the `ArrowDB` object prototype.
 *
 * For example, after creating new instance like:
 *
 *   var ArrowDB = require('arrowdb');
 *   var arrowDBApp = new ArrowDB('ARROWDB_APP_KEY');
 *
 * users will have methods like `arrowDBApp.usersLogin()` and `arrowDBApp.likesQuery()`.
 *
 * When calling `arrowDBApp.usersLogin()`, internally sdk transforms it to:
 *
 *   createArrowDBRequestFunction({
 *       arrowDBObjectKey: 'Users',
 *       arrowDBObjectName: 'users',
 *       arrowDBObjectMethodKey: 'Login',
 *       arrowDBObjectMethodName: 'login',
 *       httpMethod:'POST'
 *   }).
 *
 * Then, `createArrowDBRequestFunction()` will return a `function(restOptions, callback)`.
 * From user side we will get `arrowDBApp.usersLogin(restOptions, callback)`.
 *
 * @param {object} options - An object containing various options.
 * @param {string} options.arrowDBObjectKey - ArrowDB Object key listed under arrowDBObjects/xxx.js, like ACLs, Users, PushNotifications.
 * @param {string} options.arrowDBObjectName - ArrowDB Object name that is used for entry point composition, like ACLs, users, push_notifications.
 * @param {string} options.arrowDBObjectMethodKey - The method key of ArrowDB Object listed inner arrowDBObjects/xxx.js, like count, remove, showMe, requestResetPassword.
 * @param {string} options.arrowDBObjectMethodName - The method name of ArrowDB Object that is used for entry point composition, like count, delete, show/me, request_reset_password.
 * @param {function} [options.arrowDBObjectMethodPreAction] - An ArrowDB Object method specific internal function to call before making the request.
 * @param {function} [options.arrowDBObjectMethodPostAction] - An ArrowDB Object method specific internal function to call after a request completes.
 * @param {string} options.httpMethod - The HTTP method to use for the request. Valid values include "GET", "POST", "PUT", and "DELETE".
 *
 * @returns {function(object, function(error, result))} A function that invokes the REST request.
 */
function createArrowDBRequestFunction(options) {
	if (!options || !options.arrowDBObjectKey || !options.arrowDBObjectName || !options.arrowDBObjectMethodKey || !options.arrowDBObjectMethodName || !options.httpMethod) {
		throw new ArrowDBError(messages.ERR_MISS_REQUIRED_PARAMETER, {
			parameter: 'in createArrowDBRequestFunction'
		});
	}

	return function (restOptions, callback) {
		// parameter offset
		if (typeof restOptions === 'function') {
			callback = restOptions;
			restOptions = null;
		}
		if (typeof callback !== 'function') {
			callback = function () {};
		}

		restOptions || (restOptions = {});

		function prepareArrowDBRequest() {
			// check required app key
			if (!this.appKey) {
				return callback(new ArrowDBError(messages.ERR_MISS_REQUIRED_PARAMETER, {
					parameter: 'appKey'
				}));
			}
			if (typeof this.appKey !== 'string') {
				return callback(new ArrowDBError(messages.ERR_WRONG_TYPE, {
					typeName: 'app key'
				}));
			}

			// check required app options
			if (!this.appOptions) {
				return callback(new ArrowDBError(messages.ERR_MISS_REQUIRED_PARAMETER, {
					parameter: 'appOptions'
				}));
			}
			if (typeof this.appOptions !== 'object') {
				return callback(new ArrowDBError(messages.ERR_WRONG_TYPE, {
					typeName: 'app options'
				}));
			}

			// determine the arrowdb method
			var arrowDBMethod = options.arrowDBObjectMethodName;

			if (arrowDBMethod !== null && typeof arrowDBMethod === 'object') {
				var dynamicMethod = arrowDBMethod.entry;
				if (Array.isArray(arrowDBMethod.variables)) {
					for (var i = 0, l = arrowDBMethod.variables.length; i < l; i++) {
						var variable = arrowDBMethod.variables[i];
						if (!restOptions[variable]) {
							return callback(new ArrowDBError(messages.ERR_MISS_REQUIRED_PARAMETER, {
								parameter: variable
							}));
						}
						dynamicMethod = dynamicMethod.replace(variable, restOptions[variable]);
					}
				}
				arrowDBMethod = dynamicMethod;
			}

			// recheck if arrowDBMethod is an object and if so, remove unnecessary parameters
			if (arrowDBMethod !== null && typeof arrowDBMethod === 'object' && Array.isArray(options.arrowDBObjectMethodName.variables)) {
				options.arrowDBObjectMethodName.variables.forEach(function (variable) {
					delete restOptions[variable];
				});
			}

			var apiEntryPoint = this.appOptions.apiEntryPoint + '/v1/' + options.arrowDBObjectName + '/' + arrowDBMethod + '.json?key=' + this.appKey;

			// console.log('apiEntryPoint: %s', apiEntryPoint);
			// console.log('arrowDBObjectName: %s', options.arrowDBObjectName);
			// console.log('arrowDBMethod: %s', arrowDBMethod);
			// console.log('httpMethod: %s', options.httpMethod);
			// console.log('appKey: %s', this.appKey);
			// console.log('appOptions: %j', this.appOptions);
			// console.log('restOptions: %j', restOptions);
			// console.log('sessionCookieString: %s', this.sessionCookieString);

			// allow the value to just be a cookie value (as the session) and not a full cookie string
			if (this.sessionCookieString && this.sessionCookieString.indexOf('=') < 0) {
				this.sessionCookieString = '_session_id='+encodeURIComponent(this.sessionCookieString);
			}

			arrowDBRequest(apiEntryPoint, this.appOptions, options.httpMethod, this.sessionCookieString, restOptions, function (error, result) {
				if (typeof options.arrowDBObjectMethodPostAction === 'function') {
					// if the post action has 3 args (err, response, callback), then it's async
					if (options.arrowDBObjectMethodPostAction.length > 2) {
						options.arrowDBObjectMethodPostAction.call(this, error, result, function (err, res) {
							callback(err !== undefined ? err : error, res !== undefined ? res : result);
						});
						return;
					}
					options.arrowDBObjectMethodPostAction.call(this, error, result);
				}
				callback(error, result);
			}.bind(this));
		}

		if (typeof options.arrowDBObjectMethodPreAction === 'function') {
			// if the post action has 2 args (restOptions, callback), then it's async
			if (options.arrowDBObjectMethodPreAction.length > 1) {
				options.arrowDBObjectMethodPreAction.call(this, restOptions, function (err) {
					if (err) {
						return callback(err);
					}
					prepareArrowDBRequest.call(this);
				}.bind(this));
				return;
			}
			options.arrowDBObjectMethodPreAction.call(this, options, restOptions);
		}

		prepareArrowDBRequest.call(this);
	};
}

/**
 * Creates a function for invoking a REST call method. The returned function is
 * expected to be set in the `ArrowDB` object prototype.
 *
 * For example, after creating new instance like:
 *
 *   var ArrowDB = require('arrowdb');
 *   var arrowDBApp = new ArrowDB('ARROWDB_APP_KEY');
 *
 * users will have methods like `arrowDBApp.get()` and `arrowDBApp.post()`.
 *
 * When calling `arrowDBApp.get('/v1/users/login.json')`, internally the SDK
 * transforms it to:
 *
 *   createArrowDBRESTRequestFunction({methodPath: '/v1/users/login.json', httpMethod: 'GET'})
 *
 * Then, `createArrowDBRESTRequestFunction()` will return a `function(restOptions, callback)`.
 * From user side we will get arrowDBApp.get(methodPath, restOptions, callback).
 *
 * @param {string} httpMethod - The HTTP method to use for the request. Valid
 * values include "GET", "POST", "PUT", and "DELETE".
 *
 * @returns {function(string, object, function(error result))} A function that
 * invokes the REST request.
 */
function createArrowDBRESTRequestFunction(httpMethod) {
	if (!httpMethod) {
		throw new ArrowDBError(messages.ERR_MISS_REQUIRED_PARAMETER, {
			parameter: 'httpMethod'
		});
	}

	return function (methodPath, restOptions, callback) {
		// parameter offset
		if (typeof restOptions === 'function') {
			callback = restOptions;
			restOptions = null;
		}
		if (typeof callback !== 'function') {
			callback = function () {};
		}

		restOptions || (restOptions = {});

		// check required method path
		if (!methodPath) {
			return callback(new ArrowDBError(messages.ERR_MISS_REQUIRED_PARAMETER, {
				parameter: 'methodPath'
			}));
		}
		if (typeof methodPath !== 'string') {
			return callback(new ArrowDBError(messages.ERR_WRONG_TYPE, {
				typeName: 'method path'
			}));
		}

		// check required app key
		if (!this.appKey) {
			return callback(new ArrowDBError(messages.ERR_MISS_REQUIRED_PARAMETER, {
				parameter: 'appKey'
			}));
		}
		if (typeof this.appKey !== 'string') {
			return callback(new ArrowDBError(messages.ERR_WRONG_TYPE, {
				typeName: 'app key'
			}));
		}

		// check required app options
		if (!this.appOptions) {
			return callback(new ArrowDBError(messages.ERR_MISS_REQUIRED_PARAMETER, {
				parameter: 'appOptions'
			}));
		}
		if (typeof this.appOptions !== 'object') {
			return callback(new ArrowDBError(messages.ERR_WRONG_TYPE, {
				typeName: 'app options'
			}));
		}

		var apiEntryPoint = this.appOptions.apiEntryPoint + methodPath + '?key=' + this.appKey;

		arrowDBRequest(apiEntryPoint, this.appOptions, httpMethod, this.sessionCookieString, restOptions, callback);
	};
}
