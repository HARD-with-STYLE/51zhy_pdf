const moment = require('moment');
const axios = require('axios');
const Crypto = require("crypto-js");
const fs = require('fs');
let hummus;
const memoryStreams = require('memory-streams');
const {JSEncrypt} = require('./jsencrypt');
const argv = require('minimist')(process.argv.slice(2));
let id = argv['_'][0], {m, t, p} = argv;
if (!id) id = '656842398147547136';
let merge = !!+m, timeout = t ? t : 10, page = p ? String(p).indexOf(',') > -1 ? p.split(',') : [p] : [];
if (page.length) merge = false;
axios.defaults.timeout = timeout * 1000;
let detail = undefined;

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
let rsa = {};

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

/**
 * @param {string} val
 * @return {string}
 */
function encryption(val) {
    return Crypto.SHA1(val.toString()).toString(Crypto.enc.Hex);
}

/**
 * @param {Object} data
 * @return {Object}
 */
function deleteKey(data) {
    for (let word in data) {
        if (data.hasOwnProperty(word)) {
            const val = data[word];
            if (!(0 === val || val || "boolean" == typeof val)) {
                delete data[word];
            }
        }
    }
    return data;
}

/**
 * @param {Object} data
 * @return {String}
 */
function setToken(data) {
    let c = Object.assign({}, data);
    let s = Object.keys(c).map(function (k) {
        return k.toLowerCase() + "/" + k + "=" + c[k];
    }).sort().map((vo) => {
        return vo.substring(vo.indexOf("/") + 1);
    }).join("") + "OI2W_YeeUw%OHutl";
    return encryption(s);
}

function newGuid() {
    let uuid = "", i = 1;
    for (; i <= 32; i++) {
        uuid = uuid + Math.floor(16 * Math.random()).toString(16);
        if (!(8 !== i && 12 !== i && 16 !== i && i !== 20)) {
            uuid = uuid + "-";
        }
    }
    return uuid;
}

function uuid() {
    let s = [];
    for (let i = 0; i < 36; i++)
        s[i] = '0123456789abcdef'.substr(Math.floor(16 * Math.random()), 1);
    s[14] = '4';
    s[19] = '0123456789abcdef'.substr(3 & s[19] | 8, 1);
    s[8] = s[13] = s[18] = s[23] = '-';
    return s.join('');
}

const url_encoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
let deviceToken = '', deviceKey = '';

function bind() {
    let data = {
        'DeviceToken': newGuid(),
        'ApiName': '/v1/api/device/bind',
        'BridgePlatformName': 'kezhi_web',
        'random': Math.random(),
        'nonce': uuid(),
        'AppId': 7,
        'timestamp': moment(new Date()).utc().format('YYYY-MM-DD hh:mm:ss'),
        'apiversion': '1.0',
        'appversion': '1.6.2',
        'Title': '可知网上书城'
    };
    data['Token'] = setToken(data);
    axios.post('https://gateway.keledge.com/transfer/v1/api/device/bind', url_encoded(data), {
        headers: {
            'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
            'Origin': 'https://www.keledge.com',
            'Referer': 'https://www.keledge.com',
        }
    }).then(res => {
        deviceToken = res.data['Data']['DeviceToken'];
        deviceKey = res.data['Data']['DeviceKey'];
    }).catch((e) => {
        console.log(e)
    }).then(() => {
        getDetail(id);
    })
}

function getDetail(id) {
    let data = {
        'DeviceToken': deviceToken,
        'ApiName': '/Content/Detail',
        'BridgePlatformName': 'kezhi_web',
        'random': Math.random(),
        'nonce': uuid(),
        'AppId': 7,
        'timestamp': moment(new Date()).utc().format('YYYY-MM-DD hh:mm:ss'),
        'apiversion': '1.0',
        'appversion': '1.6.2',
        'id': id
    };
    data['Token'] = setToken(data);
    axios.get('https://gateway.keledge.com/transfer/Content/Detail?' + url_encoded(data), {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
            'Origin': 'https://www.keledge.com',
            'Referer': 'https://www.keledge.com/wrap/details/book?id=' + id,
        }
    }).then(res => {
        detail = res.data;
        authorize(res.data['Data']['ExternalId'])
    }).catch((e) => {
        console.log(e)
    })
}

function authorize(id) {
    let data = {
        'DeviceToken': deviceToken,
        'ApiName': 'https://api.keledge.com/aqr/authorize',
        'BridgePlatformName': 'kezhi_web',
        'random': Math.random(),
        'nonce': uuid(),
        'AppId': 7,
        'timestamp': moment(new Date()).utc().format('YYYY-MM-DD hh:mm:ss'),
        'apiversion': '1.0',
        'appversion': '1.6.2',
        'authorzieParameters': JSON.stringify({
            "contentexternalid": id,
            "organizationExternalId": "",
            "isOnline": true,
            "device": {
                "keyencrypttype": "rsa",
                "devicekey": rsa['PublicKeyPemStr'],
                "DeviceType": 4,
                "Title": "电脑试读"
            },
            "FromSalePlatformTitle": "可知",
            "userinfo": {"nickname": "未登录", "ExternalId": "未登录"}
        })
    };
    data['Token'] = setToken(data);
    let str = url_encoded(data);
    axios.post('https://api.keledge.com/aqr/authorize', str, {
        headers: {
            'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
            'Origin': 'https://www.keledge.com',
            'Referer': 'https://www.keledge.com',
        }
    }).then(async response => {
        data = response.data['Data'];
        console.log(`开始下载：${detail['Data']['Title']}`);
        let authorizeToken = detail['Data']['ExtendData']['AuthorizeToken'];
        if (response['data']['Code'] !== 200) {
            console.log('接口失效，' + response['data']['Description']);
        } else {
            if (page.includes('skip')) return Promise.resolve();
            let pages = data['SplitFileUrls'].length;
            let authorKey = makeKey(response['data']['Data']['Key']);
            console.log(response['data']['Data']['Key']);
            console.log(authorKey);
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
    }).catch((e) => {
        console.log(e)
    })
}
function createRsa(){
    let data = {
        'DeviceToken': newGuid(),
        'ApiName': '/rsa/create',
        'BridgePlatformName': 'kezhi_web',
        'random': Math.random(),
        'nonce': uuid(),
        'AppId': 7,
        'timestamp': moment(new Date()).utc().format('YYYY-MM-DD hh:mm:ss'),
        'apiversion': '1.0',
        'appversion': '1.6.2',
        'Title': '可知网上书城'
    };
    data['Token'] = setToken(data);
    axios.post('https://gateway.keledge.com/transfer/rsa/create', url_encoded(data), {
        headers: {
            'Content-Type': "application/x-www-form-urlencoded; charset=UTF-8",
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/79.0.3945.130 Safari/537.36',
            'Origin': 'https://www.keledge.com',
            'Referer': 'https://www.keledge.com',
        }
    }).then(res => {
        rsa = res.data.Data;
        bind();
    }).catch((e) => {
        console.log(e)
    })
}
createRsa();
