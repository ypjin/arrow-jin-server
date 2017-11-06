#!groovy
@Library('pipeline-library') _

timestamps {
	node('git && (osx || linux)') {
		stage('Checkout') {
			checkout scm
		}

		stage('Configuration') {
			sh "echo \"module.exports = { connectors: { 'appc.salesforce': { url: 'https://test.salesforce.com/', username: 'dtoth@appcelerator.com.appcdev', password: 'mmpResearch4', token: '4qEFyGMb5r0VYZPZBj99Rjukv', modelAutogen: false, schemaRefresh: 3.6e+6 * 24, generateModels: [ 'Account', 'Contract' ] }, 'appc.mssql': { user: 'appcconn_SQLLogin_1', password: 'y9who9r2rz', server: 'connectortest.mssql.somee.com', port: 1433, database: 'connectortest', options: { encrypt: true } }, 'appc.mysql': { host: 'db4free.net', database: 'arrowtest', user: 'arrowtest', password: 'mmpResearch6', port: 3306, generateModelsFromSchema: true, modelAutogen: true }, 'appc.arrowdb': { requireSessionLogin: false, key: 'sX5SETgQP9470gddvEIBrgmiQS9p7TPd', username: 'jenkins', password: 'jenkins1234', generateModelsFromSchema: true, modelAutogen: true }, 'appc.mongo': { url: 'mongodb://appcconn:Connectors2016@ds035856.mlab.com:35856/appcconn', generateModelsFromSchema: true, modelAutogen: false } } };\" > conf/local.js"
		}

		buildConnector {
			// don't override anything yet
		}
	}
}
