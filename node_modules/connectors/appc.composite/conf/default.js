module.exports = {
	logs: './logs',
	quiet: false,
	logLevel: 'error',
	apikey: 'bYVrelF3EQ8qGaJj/SoSlTyP6IhtA+1Y',
	admin: {
		enabled: true,
		prefix: '/arrow'
	},

	connectors: {
		'appc.mysql': {
			host: 'localhost',
			database: 'connector',
			user: 'root',
			password: '',
			port: 3306
		},
		'appc.arrowdb': {
			key: '',
			username: '',
			password: '',
			modelAutogen: false
		},
		'appc.mongo': {
			url: 'mongodb://localhost/arrow'
		},
		'appc.salesforce': {
			url: '',
			username: '',
			password: '',
			token: '',
			modelAutogen: false
		},
		'appc.mssql': {
			user: '',
			password: '',
			server: '',
			port: 1433,
			database: '',

			options: {
				encrypt: true
			}
		}
	}
};
