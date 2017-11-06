exports['delete'] = function (Model, instance, next) {
	this.execComposite({
		method: 'delete',
		isWrite: true,
		isCollection: false,
		Model: Model,
		arg: instance,
		next: next
	});
};
