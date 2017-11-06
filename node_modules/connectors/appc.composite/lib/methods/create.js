exports.create = function create(Model, values, next) {
	this.execComposite({
		method: 'create',
		isWrite: true,
		isCollection: false,
		Model: Model,
		arg: values,
		next: next
	});
};
