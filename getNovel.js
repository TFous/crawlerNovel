const puppeteer = require('puppeteer');
var MongoClient = require('mongodb').MongoClient ,
    Server = require('mongodb').Server;

const mongoClient = new MongoClient(new Server('localhost', 27017));

const getNovelList = async (url) => {
    const browser = await puppeteer.launch({headless: true});
    const page = await browser.newPage();
    await page.goto(url);
    let doms = '#info+div>div.pc_list > ul'
    const lists = await page.evaluate((sel) => {
        const pages = Array.from($(sel).find('li a'));
        const urls = pages.map((a,i)=> {
            // if(i<100){
                return {
                    href:  a.href.trim(),
                    name: a.text
                };
            // }
        });
        return urls;
    }, doms);
    await getNovelData(lists)
    // return lists;
};
const getNovelData = async (lists) => {
    console.log('======获取小说章节列表成功========')
    const browser = await puppeteer.launch({headless: true});
    const data = await Promise.all(lists.map(async function (item) {
            if(item!==null){
                const page = await browser.newPage();
                page.setDefaultNavigationTimeout(100000)
                await page.goto(item.href);
                await page.waitForSelector('#content1');
                const result = await page.evaluate(() => {
                    let title = document.querySelector('#info > div.txt_cont > h1').innerText;
                    let text = document.querySelector('#content1').innerText;
                    return {
                        title,
                        text
                    }
                });
                page.close();
                return result
            } else {
                return {}
            }
        }))
    await saveData(data)
}

const saveData = async (data) =>{
    console.log('======获取小说所有章节内容成功========')
    mongoClient.connect(function(err, db) {
        if (err) throw err;
        var dbo = db.db("novel");
        dbo.collection("test").insertMany(data, function(err, res) {
            if (err) throw err;
            console.log("文档插入成功");
            db.close();
        });
    });
}
exports.getNovelList = getNovelList;
// export default getNovelList
// getNovelList(url)