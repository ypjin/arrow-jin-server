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
	login: 'test@cocoa.com',
	password: 'food'
}, function(err, result) {
	if (err) {
		console.error(err);
		return;
	}
	console.log('User login request finished: '.cyan + '%j', result.body);
	console.log('Counting users via generic way arrowDBApp.get() instead of arrowDBApp.usersCount()...'.cyan);
	var user1_id = '544f958ddda0951c57000007';
	createChat(user1_id, function(err, result) {
		if (err) {
			console.error(err);
			return;
		}
		console.log('Chat create request finished: '.cyan + '%j', result.body);
		//            var chat_id = result.body['response']['chats'][0].id

		arrowDBApp.chatsGetChatGroups({
			participate_ids: '544f958ddda0951c57000227'
		}, function(err, result) {
			if (err) {
				console.error(err);
				return;
			}
			console.log('Get chat groups request finished: '.cyan + '%j', result.body);
		});


		//        arrowDBApp.chatsQuery({participate_ids: user1_id},function(err, result){
		//            if (err) {
		//                console.error(err);
		//                return;
		//            }
		//            console.log('Chat query request finished: '.cyan + '%j', result.body);
		//        });


		//            arrowDBApp.chatsQueryChatGroups({order: "updated_at"},function(err, result){
		//                if (err) {
		//                    console.error(err);
		//                    return;
		//                }
		//                console.log('Chat query groups request finished: '.cyan + '%j', result.body);
		//            });


		//            deleteChat(chat_id, function(err, result){
		//                if (err) {
		//                    console.error(err);
		//                    return;
		//                }
		//                console.log('Chat deleted request finished: '.cyan + '%j', result.body);
		//            });
	});

});

function createChat(to_ids, callback) {
	arrowDBApp.chatsCreate({
		to_ids: to_ids,
		message: "test"
	}, callback);
}

function deleteChat(chat_id, callback) {
	arrowDBApp.chatsDelete({
		chat_id: chat_id
	}, callback);
}

function getChatGroups(query, callback) {
	arrowDBApp.chatsGetChatGroups(query, callback);
}
//544f958ddda0951c57000007  test1
