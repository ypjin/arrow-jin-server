var arrowDBObject = {
	ACLs: {
		objectName: 'acls',
		methods: {
			checkUser: {
				httpMethod: 'GET',
				restMethod: 'check'
			},
			count: {
				httpMethod: 'GET'
			},
			create: {
				httpMethod: 'POST'
			},
			addUser: {
				httpMethod: 'POST',
				restMethod: 'add'
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
			removeUser: {
				httpMethod: 'DELETE',
				restMethod: 'remove'
			},
			show: {
				httpMethod: 'GET'
			},
			update: {
				httpMethod: 'PUT'
			}
		}
	}
};

module.exports = arrowDBObject;
