const axios = require('axios');
const Crypto = require("crypto-js");
const fs = require('fs');
let hummus;
const memoryStreams = require('memory-streams');
const {JSEncrypt} = require('./jsencrypt');
const cheerio = require('cheerio');

const rsa = {
    "privateKey": "-----BEGIN RSA PRIVATE KEY-----\r\nMIIEowIBAAKCAQEAoUs9sSlRrpz5NigfUCJDQgr+35fBfO1/WOS1Mho1Bd+M5Pgn\r\nCa5Juo4oL2ba7EdsJU4RsBl8EiiETWEr8KbHC0udrJB8/dc5UO1IY9houQVB36G8\r\nrWdVLvpy9gHufwOH5Nhg7WcmfRGqk2jKVatHC3hsOraYDMB/jWPmaXnZdN1qmJxJ\r\nvohW/TmOGQ73Oh2HEc1zdvMymvZS9LGZVRLxZkyaYD5yoCoJhK5vt+kKqcRxCUqX\r\n8aLBsUHI+DZx/z/XO285iMRjDzvTg477nSJ3DPXvFDwcIiCXSszUMA6utALyFAQG\r\nAvmIGYuRL6TFABYq9OUXw7CTm1QqgoYZAGKHKQIBAwKCAQBrh352G4vJvft5cBTg\r\nFteBXKnqZSuonlTl7c4hZs4D6l3t+sSxHtvRtBrKRJHy2kgY3rZ1ZlK2xa2I63Kg\r\nby9c3RPIYFNT5NDgnjBCkEXQrivqa9MeRON0pvdOq/RUrQVDOutI727+C8cM8Ibj\r\nx4SyUEgnJGVd1apeQpmbppD4ko1xl15G7HjlLiFfrzo/6C4tzM9w2h2wslZhygZN\r\nx7Q5szEWFd3W69GpuMkQoIXpW7aC29ahd9g3A2W/lPPo0yiy3HaY7Wu0zpBMwocm\r\ncsWxoV8ABJzlRLlkgzTOy1O1Czf26GYDpmUB+eUPf1YKYsORtYIEYw7PdrUUxXFp\r\nPzKDAoGBAM1/ZgWC3Zo01KlgpTIMT2iW9XEzIrjTdyQPuGwUUfQMCdZykC3vgwOB\r\n2Kffg4ZJtQATEboPc5nBRFeakvK9KNEWx070pS/ljXy3znOWk0ErhsBRAPmCxdPs\r\nsiTzlzJCnpWj9fU6LTOknyCGWfYZ63dxdqGS6oCmSZee2vGSGNWTAoGBAMju0zbR\r\nSAdwn7Ko4u3N8dk2JMsaiU0+c61SSiPMFW8DtfpMjXfuRUuEQJo/dLuCBd8x7xvv\r\n+2OdeFi+RBFk2kkYXTiuuxGaeH5YnL1M4w1W/SBDNDdHc61HVeAGRn7h04h9sXfD\r\nUrzx9ZkSC83Wlo4o3jMqMXy92INEgv1QauXTAoGBAIj/mVkB6RF4jcZAbiFdikW5\r\n+PYiFyXiT21f0EgNi/gIBo73CslKV1er5cU/rQQxI1ViC9FfomaA2DpnDKHTcItk\r\nhN9Nw3VDs6h6iaJkYityWdWLVfusg+KdzBiiZMwsabkX+U4myM0YahWu5qQRR6T2\r\nTxZh8asZhmUUkfZhZeO3AoGBAIX0jM82MAT1v8xwl0kz9pDOwzIRsN4ponOMMW0y\r\nuPStI/wzCPqe2N0C1bwqTdJWrpTL9L1Kp5e+UDspgrZDPDC66NB0fLZm+v7lvdOI\r\nl145/hWCIs+E98jaOUAELv9BN7BTy6Us4dNL+RC2sok5ubQbPszGy6h+kFeDAf41\r\nnJk3AoGBAIr5Ob43WUDXjT6cKaSopGO5/0k+lJZWCO+v2b12iOuD59/n/RME/pF/\r\n5gDzidHBY7QbYAsZvZhcSI31e78TKW9YnZBIwuCozneYc2zVtHFWNfveR3egpXXz\r\nC17FXRssYiErhASMp1FWQCrFQ/r0GmGpyK5ZNzVLEi+Ii61iVaPk\r\n-----END RSA PRIVATE KEY-----\r\n",
    "publicKey": "-----BEGIN PUBLIC KEY-----\r\nMIIBIDANBgkqhkiG9w0BAQEFAAOCAQ0AMIIBCAKCAQEAoUs9sSlRrpz5NigfUCJD\r\nQgr+35fBfO1/WOS1Mho1Bd+M5PgnCa5Juo4oL2ba7EdsJU4RsBl8EiiETWEr8KbH\r\nC0udrJB8/dc5UO1IY9houQVB36G8rWdVLvpy9gHufwOH5Nhg7WcmfRGqk2jKVatH\r\nC3hsOraYDMB/jWPmaXnZdN1qmJxJvohW/TmOGQ73Oh2HEc1zdvMymvZS9LGZVRLx\r\nZkyaYD5yoCoJhK5vt+kKqcRxCUqX8aLBsUHI+DZx/z/XO285iMRjDzvTg477nSJ3\r\nDPXvFDwcIiCXSszUMA6utALyFAQGAvmIGYuRL6TFABYq9OUXw7CTm1QqgoYZAGKH\r\nKQIBAw==\r\n-----END PUBLIC KEY-----\r\n"
};

const argv = require('minimist')(process.argv.slice(2));
let id = argv['_'][0], {m, t, p} = argv;
if (!id) id = 19489633;
let merge = !!+m, timeout = t ? t : 10, page = p ? String(p).indexOf(',') > -1 ? p.split(',') : [p] : [];
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
let deviceKey = '3uKpxtFAoOeqQQ0S';
let deviceToken = 'ebook9D572D5B4B8F3BEC28589B10B07F8EC2';

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
    decrypt.setPrivateKey(rsa['privateKey']);
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

const detail_param = {
    'AccessToken': 'null',
    'DeviceToken': deviceToken,
    'ApiName': '/Content/Detail',
    'BridgePlatformName': 'phei_yd_web',
    'random': Math.random(),
    'AppId': 3,
    'id': id,
};

let detail = null, data = null;
let start = new Date().getTime();

function getDeviceToken(id) {
    axios.get(`https://yd.51zhy.cn/ebook/web/newBook/queryNewBookById?id=${id}`).then(res => {
        let html = res.data;
        const $ = cheerio.load(html);
        deviceToken = $("#deviceToken").val();
        main()
    });
}

async function getBookmark(id) {
    const list_data = {
        'AccessToken': 'null',
        'DeviceToken': deviceToken,
        'ApiName': '/tableofcontent/list',
        'BridgePlatformName': 'phei_yd_web',
        'random': Math.random(),
        'AppId': 3,
        'objectId': id,
    };
    const url_encoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
    let url = 'https://bridge.51zhy.cn/transfer/tableofcontent/list';
    axios.get(url + "?" + url_encoded(list_data)).then(res => {
        if (!merge && !fs.existsSync(String(id))) {
            fs.mkdirSync(String(id));
        }
        fs.writeFileSync(`${id}/bookmark.json`, JSON.stringify(res.data));
        return Promise.resolve();
    }).catch((error) => {
        console.log(error);
        return Promise.reject();
    })
}

function main() {
    axios.get('https://bridge.51zhy.cn/transfer/Content/Detail', {params: detail_param}).then(res => {
        detail = res.data;
    }).then(async () => {
        console.log(`开始下载：${detail['Data']['Title']}`);
        let authorizeToken = detail['Data']['ExtendData']['AuthorizeToken'];
        let pages = detail['Data']['NumberOfPages'];
        await getBookmark(id);
        const authorize_data = `IsOnline=true&AccessToken=null&DeviceToken=${deviceToken}&ApiName=content%2Fauthorize&BridgePlatformName=phei_yd_web&random=${Math.random()}&AppId=3&id=${id}&type=rsa&devicekey=-----BEGIN+PUBLIC+KEY-----%0D%0AMIIBIDANBgkqhkiG9w0BAQEFAAOCAQ0AMIIBCAKCAQEAoUs9sSlRrpz5NigfUCJD%0D%0AQgrMjQwMjE1MTI4MTQ3MTkzMTYxMTYyMTYwMTYyMTkyMTk4MTQ0MTYxMjIyMjM4MTQ0MjQzMjQzMTI4MTk5MjQ1MTYyMTc2MTYwMjQ5MjA2MTYxMTY0MTQ0MTI4MTY1MjAyMTQ0MjEwMjMwMTQ1%2B35fBfO1%2FWOS1Mho1Bd%2BM5PgnCa5Juo4oL2ba7EdsJU4RsBl8EiiETWEr8KbH%0D%0AC0udrJB8%2Fdc5UO1IY9houQVB36G8rWdVLvpy9gHufwOH5Nhg7WcmfRGqk2jKVatH%0D%0AC3hsOraYDMB%2FjWPmaXnZdN1qmJxJvohW%2FTmOGQ73Oh2HEc1zdvMymvZS9LGZVRLx%0D%0AZkyaYD5yoCoJhK5vt%2BkKqcRxCUqX8aLBsUHI%2BDZx%2Fz%2FXO285iMRjDzvTg477nSJ3%0D%0ADPXvFDwcIiCXSszUMA6utALyFAQGAvmIGYuRL6TFABYq9OUXw7CTm1QqgoYZAGKH%0D%0AKQIBAw%3D%3D%0D%0A-----END+PUBLIC+KEY-----%0D%0A&authorizeToken=${escape(authorizeToken)}`;
        axios.post('https://bridge.51zhy.cn/transfer//content/authorize', authorize_data, {
            headers: {'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8"}
        }).then(async function (response) {
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
                        let path = `${id}/${id}-${detail['Data']['Title']}-${index}.pdf`;
                        if (!merge && fs.existsSync(path)) {
                            console.log(`第${index}页PDF已下载，跳过该页`);
                            continue;
                        }
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
                                    new_page.push(page_url);
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
                                new_page.push(page_url);
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
}

getDeviceToken(id);
