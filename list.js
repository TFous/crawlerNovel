const puppeteer = require('puppeteer');
const fs = require('fs'); // 引入fs模块
const getNovel = require('./getNovel'); // 引入fs模块
var MongoClient = require('mongodb').MongoClient ,
    Server = require('mongodb').Server;
var http = require("https");
const mongoClient = new MongoClient(new Server('localhost', 27017));

// var EventEmitter = require('events').EventEmitter;
// var ee = new EventEmitter();
// ee.setMaxListeners(500);
let getList = async () => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto('https://www.qisuu.la/soft/sort01/');
    let doms = 'body > div:nth-child(5) > div.list > div > ul'
    const lists = await page.evaluate((sel) => {
        const pagesA = Array.from($(sel).find('li>div.s + a'));
        const pagesImg = Array.from($(sel).find('li>div.s + a>img'));
        const urls = pagesImg.map((a,i)=> {
                return {
                    href:  pagesA[i].href.trim(),
                    name: pagesA[i].text,
                    imgSrc: a.src,
                    code:pagesA[i].href.trim().split('/Shtml')[1].split('.html')[0]
                };
        });
        return urls;
    }, doms);
    return lists;
};
let scrape = async () => {
    return getList().then(list =>{
        // list.map(item=>{
        //     http.get(item.img,function (res) {
        //         var imgData = "";
        //
        //         res.setEncoding("binary"); //一定要设置response的编码为binary否则会下载下来的图片打不开
        //
        //         res.on("data", function(chunk){
        //             imgData+=chunk;
        //         });
        //         res.on("end", function(){
        //             fs.writeFile(item.name+'.jpg', imgData, "binary", function(err){
        //                 if(err){
        //                     console.log("down fail");
        //                 }
        //                 console.log("down success");
        //             });
        //         });
        //     })
        // })
        return list
    })

}

scrape().then((value) => {
    // let all = ''
    console.log(value)
    value.map(async item=>{
        await getNovel.getNovelList(item.href)
    })
    // mongoClient.connect(function(err, db) {
    //     if (err) throw err;
    //     var dbo = db.db("test");
    //         dbo.collection("列表").insertMany(value, function(err, res) {
    //             if (err) throw err;
    //             console.log("文档插入成功");
    //             db.close();
    //         });
    // });
});