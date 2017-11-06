/**
 * General utility functions.
 *
 * @module util
 *
 * @copyright
 * Copyright (c) 2012-2014 by Appcelerator, Inc. All Rights Reserved.
 *
 * @license
 * Licensed under the terms of the Apache Public License
 * Please see the LICENSE included with this distribution for details.
 */

/*
 * Public APIs
 */
module.exports.capitalizeString = capitalizeString;
module.exports.lowercaseFirstChar = lowercaseFirstChar;

/**
 * Capitalizes a string. For example, "customObjects" will become "CustomObjects".
 *
 * @param {string} str - The string to capitalize.
 *
 * @return {string} The capitalized string.
 */
function capitalizeString(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Lowercases the first character fo a string. For example, "CustomObjects" will
 * become "customObjects".
 *
 * @param {string} str - The string to capitalize.
 *
 * @return {string} The lower-cased first character string.
 */
function lowercaseFirstChar(str) {
	return str.charAt(0).toLowerCase() + str.slice(1);
}
