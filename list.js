const puppeteer = require('puppeteer');
const fs = require('fs'); // 引入fs模块
const getNovel = require('./getNovel'); // 引入fs模块
var MongoClient = require('mongodb').MongoClient,
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
        const urls = pagesImg.map((a, i) => {
            return {
                href: pagesA[i].href.trim(),
                name: pagesA[i].text,
                imgSrc: a.src,
                code: pagesA[i].href.trim().split('/Shtml')[1].split('.html')[0]
            };
        });
        return urls;
    }, doms);
    browser.close();
    return lists;
};
let scrape = async () => {
    return getList().then(list => {
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
let getNovelPage = async () => {
    return scrape().then(async (value) => {
        const browser = await puppeteer.launch({headless: true});

        const data = await Promise.all(value.map(async item => {
            const page = await browser.newPage();
            page.setDefaultNavigationTimeout(100000)
            await page.goto(item.href);
            const result = await page.evaluate(() => {
                let dom = 'body > div:nth-child(5) > div.show > div:nth-child(4) > div.showDown > ul > li:nth-child(1) > a'
                let href = document.querySelector(dom).href.trim();
                return {
                    href
                }
            });
            await page.close();
            return result
        }))
        browser.close();
        return data
    });
}

getNovelPage().then(async lists => {
    await Promise.all(lists.map(async function (item ,i ) {
        if(i===1){
            let href = await item.href
            let hrefSplit = href.split('/')
            let id = hrefSplit[hrefSplit.length-2]

            console.log(id)
            await getNovel.novelBookSave(href,id)
        }
    }))
    // Promise.race(promises).then(function (item) {
    //     console.log(item)
    // })
})