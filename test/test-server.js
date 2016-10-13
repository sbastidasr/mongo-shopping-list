global.DATABASE_URL = 'mongodb://localhost/shopping-list-test'; //set the glodal.DATABASE_URL variable to make app user testing db and not dev or production db

var chai = require('chai');
var chaiHttp = require('chai-http');

var server = require('../server.js');
var Item = require('../models/item');

var should = chai.should();
var app = server.app;

chai.use(chaiHttp);

// TESTS for shopping list
describe('Shopping List', function() {
    before(function(done) { //seed db by adding sample data to use in tests
        server.runServer(function() {
            Item.create({name: 'Broad beans'},
                        {name: 'Tomatoes'},
                        {name: 'Peppers'}, function() {
                done();
            });
        });
    });
    it('should list items on GET', function(done) { //function called to tell mocha that the test has completed. Always include in it blocks.
        chai.request(app) // tells chai to make request to the app
        .get('/items') // call get to make a get request to the /items endpoint
        .end(function(err, res) { // end method runs the function which you pass in when the request is complete
            should.equal(err, null);
            res.should.have.status(200); // should style assetion says that the response should have a 200 status code
            res.should.be.json;
            res.body.should.be.a('array');
            res.body.should.have.length(3);
            res.body[0].should.be.a('object');
            res.body[0].should.have.property('_id');
            res.body[0].should.have.property('name');
            res.body[0].name.should.be.a('string');
            res.body[0]._id.should.be.a('string');
            // res.body[0].name.should.equal('Broad beans');
            // res.body[1].name.should.equal('Tomatoes');
            // res.body[2].name.should.equal('Peppers');
            done();
        });
    });
    
    it('should add an item on POST', function(done) {
        chai.request(app)
        .post('/items')
        .send({'name': 'Kale'})
        .end(function(err, res) {
            should.equal(err, null);
            res.should.have.status(201);
            res.should.be.json;
            res.body.should.be.a('object');
            res.body.should.have.property('name');
            res.body.should.have.property('_id');
            res.body.name.should.be.a('string');
            res.body._id.should.be.a('string');
            res.body.name.should.equal('Kale');
            done();
        });
    });
    
    it('should edit a new item on PUT', function(done) { 
        chai.request(app) 
        .put('/items/57fef14d2f45532cb6445a01') 
        .send({'name': 'carrot'}) 
        .end(function(err, res) { 
            should.equal(err, null); 
            res.should.have.status(201); 
            res.should.be.json; 
            res.body.should.be.a('object'); 
            res.body.should.have.property('name'); 
            res.body.should.have.property('_id'); 
            res.body.name.should.be.a('string');
            res.body._id.should.be.a('string'); 
            res.body.name.should.equal('carrot'); 
            done(); 
        });       
    }); 
    
     it('should delete an item on delete', function(done) {
        chai.request(app)
            .delete('/items/57fef191c6e2422cc86f265d')
            .end(function(err, res) {
                  should.equal(err, null);
                  res.should.have.status(201);
                  res.should.be.json;
                  res.body.should.be.a('object');
                  res.body.should.have.property('_id');
                  res.body._id.should.be.a('string');
                  res.body._id.should.equal('57fef191c6e2422cc86f265d');
                  done();
            });
      });
     
    after(function(done) { // run after test is done, removes all items from db
        Item.remove(function() {
            done();
        });
    });
});

// FAIL test
describe('Shopping List', function() {
    before(function(done) { //seed db by adding sample data to use in tests
        server.runServer(function() {
            Item.create({name: 'Broad beans'},
                        {name: 'Tomatoes'},
                        {name: 'Peppers'}, function() {
                done();
            });
        });
    });
    
    it('should fail when post without body data', function(done){
        chai.request(app)
        .post('/items')
        .end(function(err, res){
            should.equal(err.message, "Internal Server Error");
            res.should.have.status(500);
            done();
        });
    });
    
    it('should fail when post with something other than a valid JSON', function(done) {
        chai.request(app)
        .post('/items')
        .end(function(err,res){
            should.equal(err.message, "Internal Server Error");
            res.should.have.status(500);
            done();
        });
    });
    
    it('should fail put without body data', function(done) {
        chai.request(app)
            .put('/items/2')
            .end(function(err, res){
                should.equal(err.message, "Internal Server Error");
                res.should.have.status(500);
                done();
            });
    });
    
    it('should fail when put with something other than a valid JSON', function(done) {
        chai.request(app)
            .put('/items/"57fef191c6e2422cc86f265d"')
            .end(function(err, res){
                should.equal(err.message, "Internal Server Error");
                res.should.have.status(500);
                done();
            });
    });
    
    it('should fail when put with a different id in the endpoint than the body', function(done) {
        chai.request(app)
            .put('/items/"57fef191c6e2422cc86f265d"')
            .send({"name": "Kale", "_id": "57fef191c6e2422cc86f265a"})
            .end(function(err, res){
                should.equal(err.message, "Internal Server Error");
                res.should.have.status(500);
                done();
            });
    });
    
    it('should fail to delete an id that does not exist', function(done) {
        chai.request(app)
            .delete('/items/367268')
            .end(function(err, res){
                should.equal(err.message, "Internal Server Error");
                res.should.have.status(500);
                done();
            });
    });
    
    it('should fail to delete without an ID in the endpoint', function(done) {
        chai.request(app)
            .delete('/items')
            .end(function(err, res){
                should.equal(err.message, "Not Found");
                res.should.have.status(404);
                done();
            });
    });
    

    after(function(done) { // run after test is done, removes all items from db
        Item.remove(function() {
            done();
        });
    });
});

