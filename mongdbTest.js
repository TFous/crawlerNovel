var MongoClient = require('mongodb').MongoClient ,
    Server = require('mongodb').Server;

var mongoClient = new MongoClient(new Server('localhost', 27017));
mongoClient.connect(function(err, db) {
    if (err) throw err;
    var dbo = db.db("test");
    var myobj = { name: "菜鸟教程123", url: "www.runoob" };
    dbo.collection("test").insertOne(myobj, function(err, res) {
        if (err) throw err;
        console.log("文档插入成功");
        db.close();
    });
});