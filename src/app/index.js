import * as express from 'express'

var app = express();

app.get('/', function (req, res) {
    res.send('Hello world');
})

var server = app.listen(8081, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Express server listening on port 8081");
})
