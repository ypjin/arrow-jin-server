/**
 * Looks for a field with a type of Object and a matching model name.
 * @param Model
 * @param model
 * @returns {*}
 */
exports.fetchModelObjectFieldKey = function fetchModelObjectFieldKey(Model, model) {
	for (var key in Model.fields) {
		/* istanbul ignore else */
		if (Model.fields.hasOwnProperty(key)) {
			var field = Model.fields[key],
				isObject = field.type === Object || field.type === 'object',
				isArray = field.type === Array || field.type === 'array';
			if (field.model === model.name && (!field.name && (isObject || isArray))) {
				return key;
			}
		}
	}
	return null;
};
