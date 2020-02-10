const Crypto = require("crypto-js");
const fs = require('fs');
let hummus;
const memoryStreams = require('memory-streams');
try {
    hummus = require('hummus');
} catch (e) {

}

function btoa(s) {
    return Buffer.from(s).toString('base64')
}

/**
 * @return {string}
 */
exports.Uint8ToBase64 = function (t) {
    let c = "";
    for (let o = 32768, a = 0, s = t.length, l; a < s;) {
        l = t.subarray(a, Math.min(a + o, s));
        c += String.fromCharCode.apply(null, l);
        a += o;
    }
    return btoa(c);
};

function getStartBit(_0x4af386) {
    return _0x4af386 % 8
}

function Rvxkf(_0x1fd47a, _0xd3d6d2) {
    return _0x1fd47a >> _0xd3d6d2
}

function QjWxc(_0x20bba7, _0x52f7a8) {
    return _0x20bba7 & _0x52f7a8
}

function getRand() {
    let num;
    do {
        /** @type {number} */
        num = parseInt(128 * Math["random"]() + 128, 10);
    } while (num <= 0);
    return num;
}

function getLength(s) {
    return s % 7;
}

function getValueByBit(x, pos, i) {
    /** @type {number} */
    var result = 0;
    return result = pos + 1 - i, Rvxkf(QjWxc(255 >> 7 - pos, x), result = Math.max(result, 0));
}

function mix(_0x4af386, _0x396687, _0x207536, _0x14f718) {
    for (var _0xc15c42 = 0, _0x41cbb2 = 0; _0x41cbb2 <= 0;) {
        _0xc15c42 = getRand(),
            _0xc15c42 >>= 4,
            _0x41cbb2 = getLength(_0xc15c42)
    }
    var _0x1a2002 = getStartBit(_0xc15c42);
    _0xc15c42 <<= 4;
    var _0x1bd425 = 0;
    if (_0x1a2002 < 4) {
        var _0x45fe05 = getValueByBit(_0x4af386[_0x396687], _0x207536 - 1, _0x1a2002 + 1);
        _0x207536 = _0x207536 - _0x1a2002 - 1,
            _0xc15c42 += _0x45fe05,
            _0x14f718.push(_0xc15c42),
        _0x207536 <= 0 && (_0x1bd425 = 1,
            _0x396687 += 1)
    } else {
        _0xc15c42 += getRand() % 16,
            _0x14f718.push(_0xc15c42)
    }
    for (var _0x1400cd = 0, _0xf6064a = _0x1bd425; _0xf6064a < _0x41cbb2;) {
        _0xf6064a += 1;
        var _0x3c7836 = 0;
        _0x1a2002 = 0;
        do {
            _0x3c7836 = getRand(),
                _0x3c7836 >>= 4,
                _0x1a2002 = getStartBit(_0x3c7836),
                _0x3c7836 <<= 4
        } while (_0x1a2002 >= 4 && _0x396687 < _0x4af386["length"] && _0x1400cd > _0x41cbb2);
        if (_0x207536 > 0 && _0x396687 < _0x4af386["length"]) {
            if (_0x1a2002 < 4) {
                _0x3c7836 += _0x45fe05 = getValueByBit(_0x4af386[_0x396687], _0x207536 - 1, _0x1a2002 + 1),
                (_0x207536 -= _0x1a2002 + 1) <= 0 && (_0x396687 += 1),
                    _0x14f718.push(_0x3c7836)
            } else {
                _0x3c7836 += getRand() % 16,
                    _0x14f718.push(_0x3c7836),
                    _0x1400cd += 1
            }
        } else {
            if (_0x396687 < _0x4af386.length) {
                if ("ECcTK" !== "lHFwT") {
                    if (_0x1a2002 < 4) {
                        _0x3c7836 += _0x45fe05 = getValueByBit(_0x4af386[_0x396687], 3, _0x1a2002 + 1),
                            _0x207536 = 4 - _0x1a2002 - 1,
                            _0x14f718.push(_0x3c7836),
                        _0x207536 <= 0 && (_0x396687 += 1)
                    } else {
                        _0x3c7836 += getRand() % 16,
                            _0x14f718.push(_0x3c7836),
                            _0xf6064a -= 1
                    }
                } else {
                    var _0xc25af7 = Math["pow"](10, _0x207536),
                        _0x5e9bd6 = (_0x4af386 % (10 * _0xc25af7)) / _0xc25af7;
                    _0x396687[_0x207536] = parseInt(_0x5e9bd6)
                }
            } else {
                _0x3c7836 += getRand() % 16,
                    _0x1400cd += 1
            }
        }
    }
    var _0x3d5451 = [];
    return _0x3d5451[0] = _0x207536,
        _0x3d5451[1] = _0x396687,
        _0x3d5451
}

function getUTCtime() {
    return Math.floor((new Date()).getTime() / 1000)
}

function encrypt() {
    for (var _0x4af386 = getUTCtime(), _0x396687 = [], _0x207536 = 0; _0x207536 < 10; _0x207536++) {
        var _0x14f718 = Math["pow"](10, _0x207536),
            _0x11ee1b = _0x4af386 % (10 * _0x14f718) / _0x14f718;
        _0x396687[_0x207536] = parseInt(_0x11ee1b)
    }
    for (var _0x98e693 = [], _0x423caf = mix(_0x396687, 0, 4, _0x98e693); _0x423caf[0] > 0 ||
    _0x423caf[1] !== _0x396687["length"];) {
        _0x423caf = _0x423caf[0] <= 0 ? mix(_0x396687, _0x423caf[1], 4, _0x98e693) :
            mix(_0x396687, _0x423caf[1], _0x423caf[0], _0x98e693)
    }
    var _0x47fbbe = "";
    for (let i = 0; i < _0x98e693.length; ++i) {
        _0x11ee1b = _0x98e693[i];
        var _0x1ca695 = encodeURI("" + _0x11ee1b);
        _0x47fbbe += btoa(_0x1ca695)
    }
    return _0x47fbbe
}

exports.generateKey = function (rsa) {
    let s = encrypt();
    let key = btoa((s.length + 100).toString()) + s;
    return rsa["PublicKeyPemStr"].slice(0, 97) + key + rsa["PublicKeyPemStr"].slice(97);
};

exports.sleep = function (ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
};

exports.wordArrayToU8 = function (t) {
    let o = t.words, a = t.sigBytes, s = new Uint8Array(a), c = 0, l;
    for (; c < a; c++) {
        l = o[c >>> 2] >>> 24 - c % 4 * 8 & 255;
        s[c] = l;
    }
    return s
};

exports.deleteKey = function (data) {
    for (let word in data) {
        if (data.hasOwnProperty(word)) {
            const val = data[word];
            if (!(0 === val || val || "boolean" == typeof val)) {
                delete data[word];
            }
        }
    }
    return data;
};

exports.newGuid = function () {
    let uuid = "", i = 1;
    for (; i <= 32; i++) {
        uuid = uuid + Math.floor(16 * Math.random()).toString(16);
        if (!(8 !== i && 12 !== i && 16 !== i && i !== 20)) {
            uuid = uuid + "-";
        }
    }
    return uuid;
};

exports.uuid = function () {
    let s = [];
    for (let i = 0; i < 36; i++)
        s[i] = '0123456789abcdef'.substr(Math.floor(16 * Math.random()), 1);
    s[14] = '4';
    s[19] = '0123456789abcdef'.substr(3 & s[19] | 8, 1);
    s[8] = s[13] = s[18] = s[23] = '-';
    return s.join('');
};
/**
 * @param {string} val
 * @return {string}
 */
function encryption(val) {
    return Crypto.SHA1(val.toString()).toString(Crypto.enc.Hex);
}


exports.setToken = function (data) {
    let c = Object.assign({}, data);
    let s = Object.keys(c).map(function (k) {
        return k.toLowerCase() + "/" + k + "=" + c[k];
    }).sort().map((vo) => {
        return vo.substring(vo.indexOf("/") + 1);
    }).join("") + "OI2W_YeeUw%OHutl";
    return encryption(s);
};

exports.url_encoded = obj => Object.keys(obj).map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k])).join('&');
exports.combineMultiplePDFBuffers = async (bufferList, name) => {
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
