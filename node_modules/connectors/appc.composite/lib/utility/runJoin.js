var async = require('async'),
	Arrow = require('arrow'),
	_ = require('lodash');

/**
 * Runs a join (reading and combining fields) on the supplied data.
 * @param Model
 * @param isCollection
 * @param instances
 * @param models
 * @param isInnerJoin
 * @param next
 */
exports.runJoin = function runJoin(Model, isCollection, instances, models, isInnerJoin, next) {
	var self = this,
		retVal = {};
	if (1 === Object.keys(instances).length) {
		// instance0 is an instance of the parent model.
		var key0 = Object.keys(instances)[0],
			instance0 = instances[key0];
		if (isCollection && instance0) {
			async.map(instance0,
				function mapItems(instance, cb) {
					self.runJoin(Model, false, {key0: instance}, models, isInnerJoin, cb);
				}, function (err, results) {
					if (err) {
						next(err);
					}
					else {
						next(null, _.isArray(results) ? _.compact(results) : results);
					}
				});
		}
		else {
			if (!instance0) {
				retVal = false;
			}
			else {
				retVal = {
					id: instance0.getPrimaryKey ? instance0.getPrimaryKey() : instance0.id
				};
				self.populateValuesFromResult(Model, models[0], retVal, instance0.toJSON());
			}
			async.each(models.slice(1), queryModel, returnInstance);
		}
	}
	else {
		_.forIn(Model.fields, function (field, key) {
			var collectionName = field.model;
			if (instances[collectionName]) {
				retVal[key] = instances[collectionName];
			}
		});
		next(null, retVal);
	}

	/**
	 * Queries one particular model for the data needed for the join.
	 * @param model
	 * @param next
	 */
	function queryModel(model, next) {
		if (!retVal) { return next(); }

		var SourceModel = Arrow.getModel(model.name),
			query = {},
			joinBy = model.left_join,
			hasJoin = false;
		_.forIn(joinBy, function (value, key) {
			query[key] = value === 'id' && instance0.getPrimaryKey ? instance0.getPrimaryKey() : instance0[value];
			var hasField = (key === 'id' || SourceModel.fields[key]);
			if (!hasField) {
				self.logger.warn('Skipping join on "' + key + '" because the model "' + model.name + '" has no matching field.');
			}
			else if (query[key] !== undefined) {
				hasJoin = true;
			}
		});
		if (!hasJoin) {
			if (isInnerJoin) {
				retVal = null;
			}
			return next();
		}
		var q = {
			where: query,
			limit: calculateLimit(model)
		};
		self.logger.trace('Querying ' + model.name + ' where ' + JSON.stringify(q));
		self.execModelMethod(Model, model, 'query', q, function queryCallback(err, result) {
			if (err) { return next(err); }
			self.logger.trace('Performing', isInnerJoin ? 'inner join' : 'left join');
			if ((!result || !result.length) && isInnerJoin) { 
				retVal = null;
			}
			else if (model.multiple) {
				// since the current field in the main model may have been aliased, 
				// we should get the name of the field being referred to in the joined model.
				var key = Model.fields[model.fieldName].name;

				if (result.length) {
					// initialise the array to be returned.
					// in the future if we actually want to return an empty array when nothing matched we can
					// move this outside the result.length check (RDPP-1265)
					retVal[model.fieldName] = [];
					
					// loop through each result and build the array to be returned
					for (var i = 0; i < result.length; i++) {
						var item = result[i].toJSON();
						// if the merge type is field at this point, it means we want an array containing
						// values of a specific key rather than the whole result.
						if (model.mergeType === 'field'){
							item = item[key];
						}
						retVal[model.fieldName].push(item);
					}
				}
			} else if (result) {
				// If the field only consists of a query for a single result then take
				// all the fields that we want from the model that was queried and add to the retVal
				self.populateValuesFromResult(Model, model, retVal, result);
			}
			return next();
		});
	}

	/**
	 * Returns the limit calculated based on particular rules.
	 * @param model contains information for limit calculation
	 * @return limit the number of items in the query result
	 */
	function calculateLimit(model) {
		var limit = 1;
		if (model.multiple) {
			// since multiple is set then we want to query for more than one instance of the model.
			limit = (model.limit && (0 < model.limit && model.limit < 1001)) ? model.limit : 10;
		}
		return limit;
	}

	/**
	 * Returns a composite instance based on the resultant queries.
	 */
	function returnInstance(err) {
		if (err) {
			return next(err);
		}
		if (!retVal) {
			return next(null, null);
		}
		var instance = Model.instance(retVal, true);
		instance.setPrimaryKey(retVal.id);
		next(null, instance);
	}
};
