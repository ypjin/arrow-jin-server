exports.save = function (Model, instance, next) {
	this.execComposite({
		method: 'save',
		isWrite: true,
		isCollection: false,
		Model: Model,
		arg: instance,
		next: next
	});
};
