var http = require('http');
var express = require('express');
var favicon = require('serve-favicon');

var PORT = process.env.PORT || 8080;

// Verify that the API Key and API Secret are defined
if (!(process.env.APP_ID)) {
    throw new Error('You must define an APP_ID');
    process.exit();
}
// Get the AppID
var APP_ID = process.env.APP_ID;

var app = express();
app.disable('x-powered-by');
app.set('port', PORT);
app.use(favicon(__dirname + '/public/images/favicon.ico'));
app.use(express.static(__dirname + '/public'));

app.get('/app_id', function(req, res){
    if (!APP_ID){
        res.send(500, {
            error: "No APP_ID"
        });
    }
    res.send(APP_ID)
})

http.createServer(app).listen(app.get('port'), function() {
 	console.log('Agora Web Quickstart starts at ', app.get('port'));
});