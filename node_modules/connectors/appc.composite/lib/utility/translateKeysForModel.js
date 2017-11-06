var _ = require('lodash');

exports.translateKeysForModel = function translateKeysForModel(MasterModel, SourceModel, arg) {
	if (!_.isObject(arg)) {
		return;
	}
	var mFields = MasterModel.fields,
		sFields = SourceModel.fields;
	for (var key in arg) {
		/* istanbul ignore else */
		if (arg.hasOwnProperty(key)) {
			if (_.isObject(arg[key]) && !arg[key].$like) {
				this.translateKeysForModel(MasterModel, SourceModel, arg[key]);
				continue;
			}
			// if the source field is aliased and exists in the souce model, store it by the original name and delete the aliased
			if (mFields[key] && mFields[key].name && (mFields[key].name !== key) && sFields[mFields[key].name]) {
				arg[mFields[key].name] = arg[key];
				delete arg[key];
			}
		}
	}
};
