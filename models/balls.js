var Arrow = require('arrow');
var Model = Arrow.createModel('balls', {
    "connector": "appc.mongo",
    "fields": {
        "name": {
            "type": "string",
            "description": "name of the ball game",
            "required": true
        },
        "desc": {
            "type": "string",
            "description": "description of the ball game"
        },
        "people": {
            "type": "number",
            "description": "number of the people required to play the ball game",
            "required": true
        }
    },
    "actions": [
        "create",
        "read",
        "update",
        "delete",
        "deleteAll"
    ],
    "singular": "ball"
});
module.exports = Model;