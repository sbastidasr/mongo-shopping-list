var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var config = require('./config');

var app = express();

app.use(bodyParser.json());
app.use(express.static('public'));

var runServer = function(callback) {
    mongoose.connect(config.DATABASE_URL, function(err) { //connection to the database
        if (err && callback) {
            return callback(err);
        }

        app.listen(config.PORT, function() { // Running of the HTTP server
            console.log('Listening on localhost:' + config.PORT);
            if (callback) {
                callback();
            }
        });
    });
};

if (require.main === module) { // trick for making the file an executable script and a module
    runServer(function(err) {
        if (err) {
            console.error(err);
        }
    });
};

var Item = require('./models/item');

app.get('/items', function(req, res) {
    Item.find(function(err, items) { //fetches a list of all the items from the DB using find. Returns json
        if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.status(200).json(items);
    });
});

app.post('/items', function(req, res) {
        Item.create({name: req.body.name}, 
        function(err, items) {
            if (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.status(201).json(items);
    });
});

app.put('/items/:id', function(req, res){
        var queryID = {_id: req.params.id}
        var updateItem = {name: req.body.name, _id: req.params.id}
        Item.findOneAndUpdate(queryID, updateItem,
        function(err, items){
            if(err) {
                return res.status(500).json({
                message: 'Internal Server Error'});
            }
            
            res.status(201).json(updateItem)
        });
});

app.delete('/items/:id', function(req, res){
        var chosenItemID = {_id: req.params.id}
        Item.findOneAndRemove({_id: req.params.id},
        function(err, item){
            if(err){
                return res.status(500).json({
                message: 'Internal Server Error'
            });
        }
        res.status(201).json(chosenItemID)
    });
});

app.use('*', function(req, res) {
    res.status(404).json({
        message: 'Not Found'
    });
});

exports.app = app;
exports.runServer = runServer;