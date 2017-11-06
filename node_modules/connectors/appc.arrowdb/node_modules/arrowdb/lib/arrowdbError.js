/**
 * ArrowDB specific error class.
 *
 * @module arrowDBError
 *
 * @copyright
 * Copyright (c) 2012-2014 by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

const
	util = require('util'),
	_ = require('lodash'),

	ARROWDB_ERROR_NAME = 'ArrowDB Node SDK Error';

/*
 * Public APIs
 */
module.exports = ArrowDBError;

/**
 * Creates an ArrowDB error object.
 *
 * @class
 * @classdesc ArrowDB error class.
 * @constructor
 * @extends Error
 *
 * @param {object} errorEntry - The error message object from the `messages` module.
 * @param {object} parameters - Params that are injected into placeholders in the error message.
 */
function ArrowDBError(errorEntry, parameters) {
	errorEntry || (errorEntry = {});
	parameters || (parameters || {});

	this.errorCode = errorEntry.errorCode || 0;
	this.docUrl = errorEntry.docUrl || null;
	this.message = _.clone(errorEntry.message || ARROWDB_ERROR_NAME);
	for (var parameter in parameters) {
		this.message = this.message.replace('%' + parameter + '%', parameters[parameter]);
		this[parameter] || (this[parameter] = parameters[parameter]);
	}

	Error.captureStackTrace(this);
}

util.inherits(ArrowDBError, Error);

ArrowDBError.prototype.name = ARROWDB_ERROR_NAME;
