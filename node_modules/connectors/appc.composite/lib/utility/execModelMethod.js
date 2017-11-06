var Arrow = require('arrow');

/**
 * Executes a model's method based on the provided args.
 * @param MasterModel
 * @param model
 * @param method
 * @param arg
 * @param next
 */
exports.execModelMethod = function execModelMethod(MasterModel, model, method, arg, next) {
	var SourceModel = Arrow.getModel(model.name);
	if (arg) {
		this.translateKeysForModel(MasterModel, SourceModel, arg);
		SourceModel[method](arg, next);
	}
	else {
		SourceModel[method](next);
	}
};
