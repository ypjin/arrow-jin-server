/**
 * Error messages used to pass into ArrowDBError objects.
 *
 * @module messages
 *
 * @copyright
 * Copyright (c) 2012-2014 by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

module.exports = {
	ERR_MISS_REQUIRED_PARAMETER: {
		errorCode: 1001,
		message: 'Required parameter %parameter% is missing.',
		docUrl: 'TBD'
	},
	ERR_WRONG_TYPE: {
		errorCode: 1002,
		message: 'Wrong type of %typeName%.',
		docUrl: 'TBD'
	},
	ERR_WRONG_PARAMETER_TYPE: {
		errorCode: 1003,
		message: 'Parameter type of  %typeName% is wrong. Required: %requiredType%, actual: %actualType%.',
		docUrl: 'TBD'
	},
	ERR_REQUEST_UNSUCCESSFUL: {
		errorCode: 1004,
		message: 'Request returned with HTTP status code %statusCode% %reason%',
		docUrl: 'TBD'
	},
	ERR_REQUEST_FAILED_NO_RESPONSE: {
		errorCode: 1005,
		message: 'Request failed: no response',
		docUrl: 'TBD'
	},
	ERR_REQUEST_FAILED_ERROR: {
		errorCode: 1006,
		message: '%message%',
		docUrl: 'TBD'
	}
};
