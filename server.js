var URL = require('url');
var API_AI = require('apiai');
var app = API_AI(process.env.API_AI_KEY);

function randomize(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function sendResponse(response) {
	return function ({ result }) {
        var message;
        if (result.source === 'agent') {
            message = randomize(result.fulfillment.messages).payload;
        } else if (result.source === 'domains') {
            message = { messages: [{ text: result.fulfillment.speech }] };
        }
		
		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.end(
			JSON.stringify(message)
		);
	}
}

function sendError(response) {
	return function (error) {
		response.writeHead(200, { 'Content-Type': 'application/json' });
		response.end(
			JSON.stringify({ error: error })
		);
	}
}

exports.endpoint = function(request, response) {
	var query = URL.parse(request.url, true).query;
	var request = app.textRequest(query.queryString, {
		sessionId: Math.random().toString().slice(2),
		contexts: [{
			name: query.context || 'DEFAULT',
			parameters: query
		}]
	});

	request.on('response', sendResponse(response));
	request.on('error', sendError(response));
	request.end();
}