exports.checkParse = function checkParse(val) {
	if (typeof val === 'string' && val[0] === '{') {
		try {
			return JSON.parse(val);
		}
		catch (err) {
			// Eat the parse error.
			this.logger.warn('Failed to parse JSON:', val, 'with error:', err, 'continuing on.');
		}
	}
	return val;
};
