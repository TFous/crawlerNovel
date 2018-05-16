const puppeteer = require('puppeteer');
var MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server;
const fs = require('fs'); // 引入fs模块
const mongoClient = new MongoClient(new Server('localhost', 27017));
const EventEmitter = require('events');
class MyEmitter extends EventEmitter {}
const myEmitter = new MyEmitter();

const getNovelList = async (url, id) => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(url);
    let doms = '#info+div>div.pc_list > ul'
    let lists = await page.evaluate((sel) => {
        const pages = Array.from($(sel).find('li a'));
        const urls = pages.map((a, i) => {
            // if(i<100){
            return {
                href: a.href.trim(),
                name: a.text
            };
            // }
        });
        return urls;
    }, doms);
    browser.close();
    let mongodburl = 'mongodb://localhost:27017'
    await MongoClient.connect(mongodburl,function(err, db) {
        if (err) throw err;
        var dbo = db.db("test");
        dbo.collection(id).count(function (a,count) {
            getNovelData(lists,id,count)
        })
    });

    return true
    // browser.close();
    // await getNovelData(lists)
    // return data;
};

const getNovelData = async (lists, id,count) => {
    console.log('======获取小说章节列表成功========')
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    let i = count || 0
    let length = lists.length
    for (;i<length;i++){
        await page.goto(lists[i].href);
        await page.waitForSelector('#content1');
        let result = await page.evaluate(() => {
            let title = document.querySelector('#info > div.txt_cont > h1').innerText;
            let text = document.querySelector('#content1').innerText;
            return {
                title,
                text
            }
        });
        // saveData(result,id)
        let data = Object.assign(result,{index:i})
        await fs.appendFile('./downLoad/'+ id +'.json',JSON.stringify(data),function(err){
            if(err){
                console.log("文件写入失败")
            }else{
                console.log(id + "===========>"+i+"========文件追加成功");
                if(i===length){
                    console.log('结束================')
                    let cmdstr = `mongoimport --db test --collection ${id} --file ./downLoad/${id}.json`
                    var exec = require('child_process').exec;
                    exec(cmdstr,
                        function (error, stdout, stderr) {
                            console.log(stdout)
                            console.log(stderr)
                            if (error !== null) {
                                //console.log('exec error: ' + error);
                            }
                        });
                    }
            }
        })
        // await page.close();
    }
    // await Promise.all(lists.forEach(async function (item, i) {
    //     page.setDefaultNavigationTimeout(3000000)
    //     await page.goto(item.href);
    //     await page.waitForSelector('#content1');
    //     let result = await page.evaluate(() => {
    //         let title = document.querySelector('#info > div.txt_cont > h1').innerText;
    //         let text = document.querySelector('#content1').innerText;
    //         return {
    //             title,
    //             // text
    //         }
    //     });
    //     await fs.appendFile('./cc.json',JSON.stringify(result),function(err){
    //         if(err){
    //             console.log("文件写入失败")
    //         }else{
    //             console.log("文件追加成功");
    //
    //         }
    //     })
    //     await page.close();
    //     // await saveData(result,id,i)
    // }))
    await browser.close();
    console.log(`======${id}====>结束====`)
    myEmitter.emit('event');
    return true
    // await saveData(data)
}

const saveData = async (data, id,i) => {
    mongoClient.connect(function (err, db) {
        if (err) throw err;
        var dbo = db.db("novel");
        dbo.collection("novel" + id).insertOne(data, function (err, res) {
            if (err) throw err;
            console.log("文档插入成功==========" + i);
            db.close();
        });
    });
}

const novelBookSave = async (url, id) => {
    let lists = await getNovelList(url, id)
    return lists
    // let novelData = await getNovelData(lists, id)
    // await saveData(novelData,id)
    // await Promise.all(save,name)
}
exports.fn = {
    novelBookSave,
    myEmitter
};
// export default getNovelList
// getNovelList(url)