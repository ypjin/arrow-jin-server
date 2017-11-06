var arrowDBObject = {
	PushSchedules: {
		restObject: 'push_schedules',
		methods: {
			create: {
				httpMethod: 'POST'
			},
			delete: {
				httpMethod: 'DELETE'
			},
			remove: {
				httpMethod: 'DELETE',
				restMethod: 'delete'
			},
			query: {
				httpMethod: 'GET'
			},
			update: {
				httpMethod: 'PUT'
			}
		}
	}
};

module.exports = arrowDBObject;
