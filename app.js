var express = require('express');
var url = require('url');
var app = express();

var dburl = 'genredraw';
var collections = ['frames', 'pallets'];
var mongojs = require('mongojs');

var db = mongojs(dburl, collections);

var bodyParser = require('body-parser')
app.use( bodyParser.json({limit: '50mb'}) );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
    extended: true,
limit: '50mb'
}));

app.get('/insert/frame', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var result = query['status'];

    db.frames.insert(JSON.parse(result));
    res.send(result);
});

app.post('/insert/pallet', function (req, res) {

    var raw = req.body.pallet;
    var parsed = JSON.parse(raw);
    console.log(raw);
    console.log(parsed);
    var result = {
        pallet: parsed,
        filename: req.body.filename
    };

    db.pallets.insert(result);
    res.send(result);
});

app.get('/get/pallet', function (req, res) {
    res.send(db.pallets.find({filename: req.params.pallet}));
});
//.skip(parseInt(query['index'], 10)).limit(1)
app.get('/get/frame', function (req, res) {
    var url_parts = url.parse(req.url, true);
    var query = url_parts.query;
    var result = query['status'];
console.log(query['filename']);
	db.frames.find({filename: query['filename']}).sort({totalDraws:1}).skip(parseInt(query['index'], 10)).limit(1,
	function(err, result) {
	
		console.log(query['filename']);
		console.log(query['index']);
		console.log(result);
	
		res.send(result);
	});	
});

app.get('/', function (req, res) {
    res.sendfile('index.html');
});

app.get('*', function (req, res) {
    res.sendfile('.' + req.path);
});

var server = app.listen(3000, function () {
    var host = server.address().address;
    var port = server.address().port;

    console.log('Listening at http://%s:%s', host, port);

});