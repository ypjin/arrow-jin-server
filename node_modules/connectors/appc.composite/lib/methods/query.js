exports.query = function query(Model, options, next) {
	this.execComposite({
		method: 'query',
		isWrite: false,
		isCollection: true,
		Model: Model,
		arg: options,
		next: next
	});
};
