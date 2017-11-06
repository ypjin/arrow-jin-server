var _ = require('lodash');

exports.containsKey = function containsKey(obj, key, ignore) {
	for (var sKey in obj) {
		/* istanbul ignore else */
		if (obj.hasOwnProperty(sKey)) {
			if (ignore && ignore.indexOf(sKey) >= 0) {
				continue;
			}
			if (sKey === key || (_.isObject(obj[sKey]) && this.containsKey(obj[sKey], key, ignore))) {
				return true;
			}
		}
	}
	return false;
};
