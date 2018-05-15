const puppeteer = require('puppeteer');
var MongoClient = require('mongodb').MongoClient,
    Server = require('mongodb').Server;
const fs = require('fs'); // 引入fs模块
const mongoClient = new MongoClient(new Server('localhost', 27017));

const getNovelList = async () => {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    let url = 'https://movie.douban.com/tag/#/'
    await page.goto(url);
    await page.waitForSelector('div.list-wp');
    let doms = 'div.list-wp'
    // let doms = 'div.list-wp'
    const lists = await page.evaluate((sel) => {
        const titles = Array.from($(sel).find('div.title'));
        const rates = Array.from($(sel).find('div.rate'));
        // const move = titles.map((title, i) => {
        //     return {
        //         title: title.text,
        //         rate: rates[i].text
        //     };
        // });
        return Array.from($(sel))[0].innerHTML;
        // return rates[0].innerHTML;
    }, doms);
    console.log(lists)
    // await browser.close();
    // return lists;
};

getNovelList()
