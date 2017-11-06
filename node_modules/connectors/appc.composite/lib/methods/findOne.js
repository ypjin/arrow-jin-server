exports.findOne = function findOne(Model, value, next) {
	value = this.checkParse(value, false);
	this.execComposite({
		method: 'findByID',
		isWrite: false,
		isCollection: false,
		Model: Model,
		arg: value,
		next: next
	});
};
