exports.findAll = function findAll(Model, next) {
	this.execComposite({method: 'findAll', isWrite: false, isCollection: true, Model: Model, arg: next});
};
