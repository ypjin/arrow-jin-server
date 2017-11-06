var colors = require('colors');
if (!process.env.ARROWDB_APPKEY) {
	console.error('Please create an ArrowDB app and set environment vars for ARROWDB_APPKEY'.red);
	process.exit(1);
}

var ArrowDB = require('../lib/arrowdb');

console.log('Creating ArrowDB app instance...'.cyan);
var arrowDBApp = new ArrowDB(process.env.ARROWDB_APPKEY);
console.log('Created: '.cyan + '%j', arrowDBApp);

var arrowDBObjectList = arrowDBApp.getDBObjects();
console.log('Get all supported objects: arrowDBApp.getDBObjects()'.cyan);
console.log(arrowDBObjectList);

console.log('User logging in...'.cyan);
arrowDBApp.usersLogin({
	login: 'paul',
	password: 'cocoafish'
}, function(err, result) {
	if (err) {
		console.error(err);
		return;
	}
	console.log('User login request finished: '.cyan + '%j', result.body);
	console.log('Counting users via generic way arrowDBApp.get() instead of arrowDBApp.usersCount()...'.cyan);
	arrowDBApp.get('/v1/users/count.json', function(err, result) {
		if (err) {
			console.error(err);
			return;
		}
		console.log('User count finished: '.cyan + '%j', result.body);
		console.log('Showing current user through stored user session...'.cyan);
		arrowDBApp.usersShowMe(function(err, result) {
			if (err) {
				console.error(err);
				return;
			}
			console.log('User showMe request finished: '.cyan + '%j', result.body);
		});
	});
});
