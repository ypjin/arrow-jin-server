var u = require('../lib/util');

var ArrowDB = require('../../../index');

var arrowDBAppKey = u.getConfig().arrowdb_appkey;
if (arrowDBAppKey) {
	var arrowDBApp = new ArrowDB(arrowDBAppKey);
}

function index(req, res) {
	res.render('index', {
		hasArrowDBAppKey: (arrowDBAppKey ? true : false)
	});
}

function login(req, res) {
	arrowDBApp.usersLogin({
		req: req,
		res: res
	}, function(err, result) {
		res.send(result.response.statusCode, result.body);
	});
}

function showMe(req, res) {
	arrowDBApp.usersShowMe({
		req: req,
		res: res
	}, function(err, result) {
		res.send(result.response.statusCode, result.body);
	});
}
