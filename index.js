const axios = require('axios');
const Crypto = require("crypto-js");
const fs = require('fs');
let hummus;
const memoryStreams = require('memory-streams');
const {JSEncrypt} = require('./jsencrypt');
const cheerio = require('cheerio');

let rsa = {
    "PublicKeyPemStr": "-----BEGIN RSA PRIVATE KEY-----\r\nMIIEowIBAAKCAQEAoUs9sSlRrpz5NigfUCJDQgr+35fBfO1/WOS1Mho1Bd+M5Pgn\r\nCa5Juo4oL2ba7EdsJU4RsBl8EiiETWEr8KbHC0udrJB8/dc5UO1IY9houQVB36G8\r\nrWdVLvpy9gHufwOH5Nhg7WcmfRGqk2jKVatHC3hsOraYDMB/jWPmaXnZdN1qmJxJ\r\nvohW/TmOGQ73Oh2HEc1zdvMymvZS9LGZVRLxZkyaYD5yoCoJhK5vt+kKqcRxCUqX\r\n8aLBsUHI+DZx/z/XO285iMRjDzvTg477nSJ3DPXvFDwcIiCXSszUMA6utALyFAQG\r\nAvmIGYuRL6TFABYq9OUXw7CTm1QqgoYZAGKHKQIBAwKCAQBrh352G4vJvft5cBTg\r\nFteBXKnqZSuonlTl7c4hZs4D6l3t+sSxHtvRtBrKRJHy2kgY3rZ1ZlK2xa2I63Kg\r\nby9c3RPIYFNT5NDgnjBCkEXQrivqa9MeRON0pvdOq/RUrQVDOutI727+C8cM8Ibj\r\nx4SyUEgnJGVd1apeQpmbppD4ko1xl15G7HjlLiFfrzo/6C4tzM9w2h2wslZhygZN\r\nx7Q5szEWFd3W69GpuMkQoIXpW7aC29ahd9g3A2W/lPPo0yiy3HaY7Wu0zpBMwocm\r\ncsWxoV8ABJzlRLlkgzTOy1O1Czf26GYDpmUB+eUPf1YKYsORtYIEYw7PdrUUxXFp\r\nPzKDAoGBAM1/ZgWC3Zo01KlgpTIMT2iW9XEzIrjTdyQPuGwUUfQMCdZykC3vgwOB\r\n2Kffg4ZJtQATEboPc5nBRFeakvK9KNEWx070pS/ljXy3znOWk0ErhsBRAPmCxdPs\r\nsiTzlzJCnpWj9fU6LTOknyCGWfYZ63dxdqGS6oCmSZee2vGSGNWTAoGBAMju0zbR\r\nSAdwn7Ko4u3N8dk2JMsaiU0+c61SSiPMFW8DtfpMjXfuRUuEQJo/dLuCBd8x7xvv\r\n+2OdeFi+RBFk2kkYXTiuuxGaeH5YnL1M4w1W/SBDNDdHc61HVeAGRn7h04h9sXfD\r\nUrzx9ZkSC83Wlo4o3jMqMXy92INEgv1QauXTAoGBAIj/mVkB6RF4jcZAbiFdikW5\r\n+PYiFyXiT21f0EgNi/gIBo73CslKV1er5cU/rQQxI1ViC9FfomaA2DpnDKHTcItk\r\nhN9Nw3VDs6h6iaJkYityWdWLVfusg+KdzBiiZMwsabkX+U4myM0YahWu5qQRR6T2\r\nTxZh8asZhmUUkfZhZeO3AoGBAIX0jM82MAT1v8xwl0kz9pDOwzIRsN4ponOMMW0y\r\nuPStI/wzCPqe2N0C1bwqTdJWrpTL9L1Kp5e+UDspgrZDPDC66NB0fLZm+v7lvdOI\r\nl145/hWCIs+E98jaOUAELv9BN7BTy6Us4dNL+RC2sok5ubQbPszGy6h+kFeDAf41\r\nnJk3AoGBAIr5Ob43WUDXjT6cKaSopGO5/0k+lJZWCO+v2b12iOuD59/n/RME/pF/\r\n5gDzidHBY7QbYAsZvZhcSI31e78TKW9YnZBIwuCozneYc2zVtHFWNfveR3egpXXz\r\nC17FXRssYiErhASMp1FWQCrFQ/r0GmGpyK5ZNzVLEi+Ii61iVaPk\r\n-----END RSA PRIVATE KEY-----\r\n",
    "PrivateKeyPemStr": "-----BEGIN PUBLIC KEY-----\r\nMIIBIDANBgkqhkiG9w0BAQEFAAOCAQ0AMIIBCAKCAQEAoUs9sSlRrpz5NigfUCJD\r\nQgr+35fBfO1/WOS1Mho1Bd+M5PgnCa5Juo4oL2ba7EdsJU4RsBl8EiiETWEr8KbH\r\nC0udrJB8/dc5UO1IY9houQVB36G8rWdVLvpy9gHufwOH5Nhg7WcmfRGqk2jKVatH\r\nC3hsOraYDMB/jWPmaXnZdN1qmJxJvohW/TmOGQ73Oh2HEc1zdvMymvZS9LGZVRLx\r\nZkyaYD5yoCoJhK5vt+kKqcRxCUqX8aLBsUHI+DZx/z/XO285iMRjDzvTg477nSJ3\r\nDPXvFDwcIiCXSszUMA6utALyFAQGAvmIGYuRL6TFABYq9OUXw7CTm1QqgoYZAGKH\r\nKQIBAw==\r\n-----END PUBLIC KEY-----\r\n"
};

const argv = require('minimist')(process.argv.slice(2));
let id = argv['_'][0], {m, t, p, k} = argv;
if (!id) id = 19489633;
let merge = !!+m, timeout = t ? t : 10, page = p ? String(p).indexOf(',') > -1 ? p.split(',') : [p] : [],
    accessToken = k ? k : null;
if (page.length) merge = false;
axios.defaults.timeout = timeout * 1000;

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

try {
    hummus = require('hummus');
} catch (e) {
    merge = false
}

let deviceToken = 'null';
console.logCopy = console.log.bind(console);
console.log = function (data) {
    let currentDate = '[' + new Date().toLocaleString() + '] ';
    this.logCopy(currentDate, data);
};
/**
 * Concatenate PDFs in Buffers
 * @param {Array} bufferList
 * @param {String} name
 * @returns {Promise}
 */
const combineMultiplePDFBuffers = async (bufferList, name) => {
    const outStream = new memoryStreams.WritableStream();
    try {
        const firstPDFStream = new hummus.PDFRStreamForBuffer(bufferList[0]);
        let pdfWriter = hummus.createWriterToModify(firstPDFStream, new hummus.PDFStreamForResponse(outStream));
        for (let i = 1; i < bufferList.length; ++i) {
            let tmpPDFStream = new hummus.PDFRStreamForBuffer(bufferList[i]);
            await pdfWriter.appendPDFPagesFromPDF(tmpPDFStream);
        }
        pdfWriter.end();
        let newBuffer = outStream.toBuffer();
        outStream.end();

        fs.writeFileSync(name, newBuffer);
        return Promise.resolve()
    } catch (e) {
        outStream.end();
        return Promise.reject('Error during PDF combination: ' + e.message)
    }
};

function makeKey(e) {
    const decrypt = new JSEncrypt();
    decrypt.setPrivateKey(rsa['PrivateKeyPemStr']);
    return decrypt.decrypt(e);
}

function btoa(s) {
    return Buffer.from(s, 'binary').toString('base64')
}

/**
 * @return {string}
 */
function Uint8ToBase64(t) {
    let c = "";
    for (let o = 32768, a = 0, s = t.length, l; a < s;) {
        l = t.subarray(a, Math.min(a + o, s));
        c += String.fromCharCode.apply(null, l);
        a += o;
    }
    return btoa(c);
}

function wordArrayToU8(t) {
    let o = t.words, a = t.sigBytes, s = new Uint8Array(a), c = 0, l;
    for (; c < a; c++) {
        l = o[c >>> 2] >>> 24 - c % 4 * 8 & 255;
        s[c] = l;
    }
    return s
}


let detail = null, data = null;
let start = new Date().getTime();
const url_encoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');

function getDeviceToken(id) {
    axios.get(`https://yd.51zhy.cn/ebook/web/newBook/queryNewBookById?id=${id}`).then(res => {
        let html = res.data;
        const $ = cheerio.load(html);
        deviceToken = $("#deviceToken").val();
        main()
    });
}

function getBookmark(id) {
    return new Promise((resolve, reject) => {
        const list_data = {
            'AccessToken': 'null',
            'DeviceToken': deviceToken,
            'ApiName': '/tableofcontent/list',
            'BridgePlatformName': 'phei_yd_web',
            'random': Math.random(),
            'AppId': 3,
            'objectId': id,
        };
        let url = 'https://bridge.51zhy.cn/transfer/tableofcontent/list';
        axios.get(url + "?" + url_encoded(list_data)).then(res => {
            if (!merge && !fs.existsSync(String(id))) {
                fs.mkdirSync(String(id));
            }
            fs.writeFileSync(`${id}/bookmark.json`, JSON.stringify(res.data));
            return resolve();
        }).catch((error) => {
            console.log(error);
            return reject();
        })
    })
}

function createRsa() {
    return new Promise((resolve, reject) => {
        let data = {
            'AccessToken': accessToken,
            'DeviceToken': deviceToken,
            'ApiName': '/rsa/create',
            'BridgePlatformName': 'phei_yd_web',
            'random': Math.random(),
            'AppId': 3,
        };
        axios.post('https://bridge.51zhy.cnm/transfer/rsa/create', url_encoded(data), {
            headers: {
                'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                'Origin': 'https://yd.51zhy.cn',
                'Referer': 'https://yd.51zhy.cn/ebook/reader/index.html',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7',
            }
        }).then(res => {
            rsa = res.data.Data;
            return resolve()
        }).catch((e) => {
            console.log(e);
            return reject()
        })
    });
}

function getDetail() {
    return new Promise((resolve, reject) => {
        const detail_param = {
            'AccessToken': accessToken,
            'DeviceToken': deviceToken,
            'ApiName': '/Content/Detail',
            'BridgePlatformName': 'phei_yd_web',
            'random': Math.random(),
            'AppId': 3,
            'id': id,
        };
        axios.get('https://bridge.51zhy.cn/transfer/Content/Detail', {
            params: detail_param,
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                'Origin': 'https://yd.51zhy.cn',
                'Referer': 'https://yd.51zhy.cn/ebook/reader/index.html',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7',
            }
        }).then(res => {
            if (res['data']['Code'] !== 200) {
                console.log('接口失效，' + res['data']['Description']);
                return reject();
            }
            return resolve(res.data);
        }).catch(e => {
            console.log(e);
            return reject();
        })
    })
}

function authorize() {
    return new Promise((resolve, reject) => {
        const authorize_data = {
            'AccessToken': accessToken,
            'DeviceToken': deviceToken,
            'ApiName': '/Content/Detail',
            'BridgePlatformName': 'phei_yd_web',
            'random': Math.random(),
            'AppId': 3,
            'id': id,
        };
        axios.post('https://bridge.51zhy.cn/transfer//content/authorize', url_encoded(authorize_data), {
            params: detail_param,
            headers: {
                'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
                'Origin': 'https://yd.51zhy.cn',
                'Referer': 'https://yd.51zhy.cn/ebook/reader/index.html',
                'Accept': 'application/json, text/plain, */*',
                'Accept-Encoding': 'gzip, deflate, br',
                'Accept-Language': 'zh-CN,zh;q=0.9,en;q=0.8,ja;q=0.7',
            }
        }).then(res => {
            if (res['data']['Code'] === 34) {
                console.log('AccessToken失效');
            } else if (res['data']['Code'] !== 200) {
                console.log('接口失效，' + res['data']['Description']);
                return reject();
            }
            return resolve(res.data);
        }).catch(e => {
            console.log(e);
            return reject();
        })
    })
}

function main() {
    getDetail().then(async (detail) => {
        console.log(`开始下载：${detail['Data']['Title']}`);
        let pages = detail['Data']['NumberOfPages'];
        getBookmark(id);
        createRsa().then(() => {
            authorize().then(() => {
                authorize().then(async (response) => {
                    data = response['data']['Data'];
                    if (response['data']['Code'] !== 200) {
                        console.log('接口失效，' + response['data']['Description']);
                    } else {
                        if (page.includes('skip')) return Promise.resolve();
                        let authorKey = makeKey(data['Key']);
                        let buffer_list = [];
                        if (!merge && !fs.existsSync(String(id))) {
                            fs.mkdirSync(String(id));
                        }
                        let page_list = [];
                        if (page.length) {
                            for (let i in page) {
                                page_list.push({
                                    index: page[i] - 1,
                                    url: data['SplitFileUrls'][page[i] - 1]
                                });
                            }
                            pages = page_list.length;
                        } else {
                            page_list = data['SplitFileUrls'].map((vo, index) => {
                                return {
                                    index: index,
                                    url: vo
                                }
                            })
                        }
                        while (page_list.length) {
                            let new_page = [];
                            for (let i = 0; i < page_list.length; ++i) {
                                let page_url = page_list[i].url;
                                let index = page_list[i].index + 1;
                                let path = `${id}/${id}-${detail['Data']['Title'].replace(/[\/\\:]/g, "_")}-${index}.pdf`;
                                if (!merge && fs.existsSync(path)) {
                                    console.log(`第${index}页PDF已下载，跳过该页`);
                                    continue;
                                }
                                console.log(page_url);
                                await axios.get(page_url,
                                    {
                                        responseType: 'arraybuffer'
                                    })
                                    .then((response) => {
                                        let arrayBuffer = response.data;
                                        let a = new Uint8Array(arrayBuffer);
                                        let s = Uint8ToBase64(a);
                                        let c = Crypto.AES.decrypt(s, Crypto.enc.Utf8.parse(authorKey), {
                                            mode: Crypto.mode.ECB,
                                            padding: Crypto.pad.Pkcs7
                                        });
                                        let buffer = wordArrayToU8(c);
                                        if (buffer.length < 2000) {
                                            console.log(`第${index}页PDF文件大小不正常：${buffer.length}`);
                                            new_page.push(page_list[i]);
                                            return;
                                        }
                                        buffer_list.push({
                                            index: i,
                                            buffer: buffer,
                                        });
                                        console.log(`已下载第${index}页PDF，共下载${buffer_list.length}/${pages}页`);
                                        if (!merge) fs.writeFileSync(`${path}`, buffer);
                                    })
                                    .catch((error) => {
                                        console.log(error);
                                        new_page.push(page_list[i]);
                                        console.log(`第${index}页PDF下载失败`);
                                    });
                                await sleep(10000);
                            }
                            page_list = new_page;
                        }
                        if (merge && buffer_list.length === pages) {
                            console.log(`下载完成，开始合成PDF`);
                            buffer_list.sort((a, b) => {
                                    return a.index - b.index
                                }
                            );
                            let result = buffer_list.map(({buffer}) => buffer);
                            await combineMultiplePDFBuffers(result, `${id}-${detail['Data']['Title']}.pdf`);
                            let end = new Date().getTime();
                            console.log(`下载&合成完成，共计用时:${end - start}ms`);
                        }
                    }
                })
            });
        });
    });
}

main();
