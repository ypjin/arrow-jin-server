/**
 * Adds values from "model" to the object to return if they exist in the Model definition
 * @param Model - the main model
 * @param model - the join model that has just been queried
 * @param retVal - the value to be returned from the composite query
 * @param result - the result of the query to "model"
 */
exports.populateValuesFromResult = function populateValuesFromResult(Model, model, retVal, result) {
	for (var key in Model.fields) {
		/* istanbul ignore else */
		if (!Model.fields.hasOwnProperty(key)) {
			continue;
		}
		var field = Model.fields[key],
			isObject = field.type === Object || field.type === 'object',
			isArray = field.type === Array || field.type === 'array';
		// check of the field should come from the queried model
		if (field.model === model.name) {
			// if the field has no name property and is object or array this means we want to perform
			// a join as object or array, setting the result of the query on the returned value
			// rather than just a single field from the result
			if (!field.name && (isObject || isArray)) {
				retVal[key] = result;
			} else {
				// key is the key from the main model. this may be different on the queried model if
				// it was aliased. field.name refers to the original name of the field on the joined
				// model. If it exists in the field definition we will use that. Otherwise just use the
				// name of the main model field.
				retVal[key] = result[field.name || key];
			}
		}
	}
};
