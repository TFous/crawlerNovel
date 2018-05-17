const puppeteer = require('puppeteer');
const fs = require('fs'); // 引入fs模块
const EventEmitter = require('events');
const myEmitter = new EventEmitter();
const mongodb = require('./mongoClient');

const getNovelList = async (url, id, client) => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(url);
    let doms = '#info+div>div.pc_list > ul'
    let lists = await page.evaluate((sel) => {
        const pages = Array.from($(sel).find('li a'));
        const urls = pages.map((a, i) => {
            return {
                href: a.href.trim(),
                name: a.text
            };
        });
        return urls;
    }, doms);
    browser.close();
    // mongodb.mongoClient.connect(function (err, client) {
    //     if (err) throw err;
        var dbo = client.db("test");
        dbo.collection(id).count(async function (a, count) {
            await getNovelData(lists, id, count)
            client.close()
        })
    // });
};
const getNovelData = async (lists, id, count) => {
    console.log('======获取小说章节列表成功========')
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    let i = count || 0
    let length = lists.length
    if (i === length) {
        myEmitter.emit('event');
        return
    }
    for (; i < length; i++) {
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
        let data = Object.assign(result, {index: i})
        await fs.appendFile('./downLoad/' + id + '.json', JSON.stringify(data), function (err) {
            if (err) {
                console.log("文件写入失败")
            } else {
                console.log(id + "===========>" + i + "========文件追加成功");
                if (i === length) {
                    console.log('结束================')
                    let cmdstr = `mongoimport --db test --collection ${id} --file ./downLoad/${id}.json`
                    var exec = require('child_process').exec;
                    exec(cmdstr,
                        function (error, stdout, stderr) {
                            console.log(stdout)
                            console.log(stderr)
                            myEmitter.emit('event');
                            if (error !== null) {
                                //console.log('exec error: ' + error);
                            }
                        });
                }
            }
        })
        // await page.close();
    }
    await browser.close();
    console.log(`======${id}====>结束====`)
    return true
    // await saveData(data)
}

// const saveData = async (data, id,i) => {
//     mongoClient.connect(function (err, db) {
//         if (err) throw err;
//         var dbo = db.db("novel");
//         dbo.collection("novel" + id).insertOne(data, function (err, res) {
//             if (err) throw err;
//             console.log("文档插入成功==========" + i);
//             db.close();
//         });
//     });
// }

const novelBookSave = async (url, id,client) => {
    let lists = await getNovelList(url, id,client)
    return lists
    // let novelData = await getNovelData(lists, id)
    // await saveData(novelData,id)
    // await Promise.all(save,name)
}
exports.fn = {
    novelBookSave,
    myEmitter
};
