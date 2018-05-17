const puppeteer = require('puppeteer');
const fs = require('fs'); // 引入fs模块
const getNovel = require('./getNovel');
const mongodb = require('./mongoClient');
var http = require("https");


// var EventEmitter = require('events').EventEmitter;
// var ee = new EventEmitter();
// ee.setMaxListeners(500);

/**
 * 获取小说列表
 * @returns {Promise<*>}
 */
let getList = async (pageListUrl) => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(pageListUrl);
    let doms = 'body > div:nth-child(5) > div.list > div.listBox'
    const lists = await page.evaluate((sel) => {
        const pagesA = Array.from($(sel).find('li>div.s + a'));
        const pagesImg = Array.from($(sel).find('li>div.s + a>img'));
        const tag = $(sel).find('div.listTab > h1');
        const novelMsg = Array.from($(sel).find('li>div.s'));
        const msg = pagesImg.map((a, i) => {
            return {
                href: pagesA[i].href.trim(),
                name: pagesA[i].text,
                novelMsg: {
                    author: novelMsg[i].innerText.split('\n大小：')[0].split('作者：')[1],
                    updateTime: novelMsg[i].innerText.split('更新：')[1],
                },
                tag:tag[0].innerText,
                imgSrc: a.src,
                code: pagesA[i].href.trim().split('/Shtml')[1].split('.html')[0]
            };
        });
        return msg;
    }, doms);
    browser.close();
    return lists;
};

let url = 'https://www.qisuu.la/soft/sort09/index_4.html'
let pageListMsg = getList(url).then(async list => {
    return list
})

// pageListMsg.then(function (list) {
//     saveData(list)
// })

const saveData = async (data) => {
    mongodb.mongoClient.connect(function (err, client) {
        if (err) throw err;
        var dbo = client.db("novel_MSG_List");
        dbo.collection("novelMSG").insertMany(data, function (err, res) {
            if (err) throw err;
            console.log("小说列表插入数据库成功！");
            client.close()
        });
    });
}

let scrape = async () => {
    return getList().then(async list => {
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
        // await saveData(list)
        return list
    })

}

// 获取对应小说列表 url 列表
let getNovelPage = async () => {
    return pageListMsg.then(async (value) => {
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

let novelUrlList = getNovelPage().then(function (list) {
    return list
})

let i = 0;
getNovel.fn.myEmitter.setMaxListeners(0)
mongodb.mongoClient.connect(function (err, client) {
    if (err) throw err;
    pageListMsg.then(function (list) {
        var dbo = client.db("novel_MSG_List");
        dbo.collection("novelMSG").insertMany(list, function (err, res) {
            if (err) throw err;
            console.log("小说列表插入数据库成功！");
            client.close()
        });
    })

    getNovel.fn.myEmitter.on('event', () => {
        getNovel.fn.myEmitter.removeListener('event', function (item) {
            console.log('事件移除')
            console.log(item)
        });
        novelUrlList.then(function (list) {
            i++
            if(i>list.length-1){
                console.log('采集结束')
                return false
            }
            console.log(`新增采集=========》${i}`)
            console.log(`采集地址=========》${list[i].href}`)
            start(i,list, client)
        })
    });
    novelUrlList.then(function (list) {
        // 同事采集几条数据
        let num = 8
        for(let index = 0;index<num;index++){
            start(i,list, client)
            i++
        }
    })
});

let go = async (item, client) => {
    let href = await item.href
    let hrefSplit = href.split('/')
    let id = hrefSplit[hrefSplit.length - 2]
    getNovel.fn.novelBookSave(href, id, client)
}

async function start(starNum, lists, client) {
    let index = starNum < lists.length-1 ? starNum : lists.length-1
    await go(lists[index], client)
}
