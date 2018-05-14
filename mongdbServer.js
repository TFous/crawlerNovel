var MongoClient = require('mongodb').MongoClient ,
    Server = require('mongodb').Server;

const mongoClient = new MongoClient(new Server('localhost', 27017));
