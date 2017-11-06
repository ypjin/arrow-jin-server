var arrowDBObject = {
	Emails: {
		methods: {
			count: {
				httpMethod: 'GET',
				restObject: 'email_templates'
			},
			send: {
				httpMethod: 'POST',
				restObject: 'custom_mailer',
				restMethod: 'email_from_template'
			}
		}
	}
};

module.exports = arrowDBObject;
