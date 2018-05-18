var MongoClient = require('mongodb').MongoClient ,
    Server = require('mongodb').Server;

const mongoClient = new MongoClient(new Server('localhost', 27017,{
    useNewUrlParser: true
}));

mongoClient.connect(function (err, client) {
    var dbs = client.db("DB_nodel");
    dbs.collection('DB_nodel_chapter').find({code:'19074'}).toArray(function (err, result) {
        console.log(result)
    })
})
