var MongoClient = require('mongodb').MongoClient ,
    Server = require('mongodb').Server;

var mongoClient = new MongoClient(new Server('localhost', 27017));

let queryDb = async function (whereSt) {
    mongoClient.connect(function(err, db) {
        if (err) throw err;
        var dbo = db.db("users");
        var whereStr = {"title":'第一章 此间少年'};  // 查询条件
        let data = []
        dbo.collection("novel").find(whereStr).toArray(function(err, result) {
            if (err) throw err;
            data = result
            log(result)
            db.close();
            // return result
        });
        console.log(data)
        return data
    });
}

let dd = mongoClient.connect(function(err, db) {
    if (err) throw err;
    var dbo = db.db("test");
    dbo.collection("novel").count(function (a,count) {
        console.log(a,c,d)
    })
});

console.log(dd)