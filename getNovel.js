const puppeteer = require('puppeteer');
var MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server;
const fs = require('fs'); // 引入fs模块
const mongoClient = new MongoClient(new Server('localhost', 27017));

const getNovelList = async (url) => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(url);
    let doms = '#info+div>div.pc_list > ul'
    const lists = await page.evaluate((sel) => {
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
    // await getNovelData(lists)
    return lists;
};
const getNovelData = async (lists, id) => {
    console.log('======获取小说章节列表成功========')
    console.log(lists.length)
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    let i = 0
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
        await fs.appendFile('./downLoad/'+ id +'.json',JSON.stringify(result),function(err){
            if(err){
                console.log("文件写入失败")
            }else{
                console.log(id + "===================文件追加成功");

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
    let lists = await getNovelList(url)
    let novelData = await getNovelData(lists, id)
    // await saveData(novelData,id)
    // await Promise.all(save,name)
}

exports.novelBookSave = novelBookSave;
// export default getNovelList
// getNovelList(url)