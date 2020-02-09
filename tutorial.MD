### 构造可知DeviceToken、nouce与token
* 清空所有cookies后打开任意一本书的详情页，打开控制台中的Network。如下图所示，浏览器发出的第一个XHR请求为`/bind`，其中DeviceToken,nonce,Token均为POST中提交的数据。
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209222517935-671851443.png)
* 找到访问网页的请求，如下图所示，返回头中没有出现set-cookie字段，可以判断DeviceToken,nonce,Token均为js生成的。
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209222759875-1350643292.png)
* 找到发送`/bind/`请求的Initiator，发现只与`vendor.*.js`与`app.*.js`有关，且出现了`webpackJsonp`、`computed`、`updateRoute`等字段，猜测该网站是使用vue-cli构建的。
* 下载并解码`vendor.*.js`与`app.*.js`，在`app.*.js`中搜索`/bind`，找到相关代码。
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209223347125-1720734934.png)
该段函数流程大致为发送`/bind`请求至后端，如果返回的结果中`Success`字段为true，则将数据中的`DeviceToken`,`DeviceKey`放到cookie中。而发送的`DeviceToken`由`newGuid()`函数生成。
    - 找到该段函数的函数名为`registerApp`，搜索调用。
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209223841181-1012813007.png)
    - 找到调用`registerApp`的代码，根据上文`watch`与`methods`可以判断出这是一个vue的组件，监控到路由变化则调用`registerApp`
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209223951696-303824834.png)
    - 不难得出得出所有暴露到this中的函数名均存在变量`66_0x3458`中。
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209224203295-791165498.png)
    - 将`newGuid`转为utf-8编码，为`\x6E\x65\x77\x47\x75\x69\x64`，找到其在变量`66_0x3458`的位置
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209224312356-1900664407.png)
    - 将163转为16进制为a3，在`app.*.js`中搜索0xa3，找到定义。
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209224500087-1931381505.png)
    - `_0x6bc57['JiAvF']`与`_0x6bc57['jybZN']`为调用的其他函数，分别搜索得出对应函数：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209224647394-1953969311.png)
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209224701193-1819318525.png)
    - 用对应代码替换上述函数，丢进jsnice转换：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209224737898-82906695.png)
    - 重命名变量，最后得出`newGuid`的代码如下，生成一个32的uuid：
```js
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
```
* 返回`/bind`的代码，请求中的data实际只有三个字段，与看到XHR请求中字段数量不一致，判断是做了一个拦截器，而一般的vue-cli项目中使用的http请求库为axios，所以直接搜索interceptors找到拦截器代码。
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209225211974-1232089463.png)
* 所有的字段均在拦截器中定义吗，其中nonce字段为调用的uuid函数，直接搜索`['prototype']['uuid']`，找到函数定义：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209225358943-634263820.png)
    - 函数中仅有`a66_0x39d4('0xb9')`是未知的，调用函数，找到对应数值为'0123456789abcdef'：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209225449940-18013136.png)
    - 拖进jsnice，再稍加修饰，发现nouce是生成一个36位的uuid:
```
function uuid() {
    let s = [];
    for (let i = 0; i < 36; i++)
        s[i] = '0123456789abcdef'.substr(Math.floor(16 * Math.random()), 1);
    s[14] = '4';
    s[19] = '0123456789abcdef'.substr(3 & s[19] | 8, 1);
    s[8] = s[13] = s[18] = s[23] = '-';
    return s.join('');
}
```
* 最后剩下Token字段，在拦截器代码中找到定义：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209225852622-382256214.png)
    - 其中a66_0x39d4('0x87')为default，a66_0x39d4('0x53')为prototype，可以判断两者处理方式完全一致，都是将data拷贝一份，调用deleteKey函数后，再调用setToken函数，将Token赋值进data，再发送。    
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209225823783-1574069416.png)
        - 搜索`['prototype']['deleteKey']`找到deleteKey函数：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209230118415-459176892.png)
        - 稍加修饰,deleteKey函数就是删除无用字段：
```
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
```

-  搜索`setToken`找到setToken函数，初步判断setToken主要是将Object类型的data根据一定格式转为字符串后加入混淆字符`OI2W_YeeUw%OHutl`后再加密：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209230424217-372048383.png)
    - 搜索`MbnVH`找到MbnVH函数，用来判断变量类型
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209230649857-415147078.png)
    - 搜索_0x1e733e找到定义，发现其上方的与_0x591b6a有关。    
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209230749904-1122989337.png)
    - 在`app.*.js`中搜索fZjL无果，转到`vendor.*.js`中搜索，找到定义：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209230933413-1405415823.png)
    - 继续在`vendor.*.js`中搜索jFbC，找到定义：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209231003475-281772442.png)
    - 将未知量替换后，setToken代码如下：
```
function setToken(data) {
    let c = Object.assign({}, data);
    let s = Object.keys(c).map(function (k) {
        return k.toLowerCase() + "/" + k + "=" + c[k];
    }).sort().map((vo) => {
        return vo.substring(vo.indexOf("/") + 1);
    }).join("") + "OI2W_YeeUw%OHutl";
    return encryption(s,1);
}
```
- Token的值最终与encryption函数有关，将encryption转为utf-8编码\x65\x6E\x63\x72\x79\x70\x74\x69\x6F\x6E，找到位置：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209231227682-1522025134.png)
    - 将174转为16进制为0xae，在`app.*.js`中找到定义：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209231355848-862668824.png)
    - 传入的参数值为*,1时，只调用case 0x1中的代码，看到`['toString'](CryptoJS[a66_0x39d4('0xb0')]['Hex'])`，初步判断是将字符串进行SHA1或MD5加密后，再进行Hex编码。
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209231613061-1398278840.png)
    - 搜索_0x33c78e找到定义，发现其与_0x7558ee有关，简单搜索发现_0x7558ee的值为_0xbc0af2('Ff/Y')：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209231635677-1850853520.png)
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209231813749-485549522.png)
    - 在`vendor.*.js`中搜索Ff/Y找到代码：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209231850437-2015014773.png)
    - 根据_doReset中定义的数组与crypto-js中SHA1与MD5代码比对，发现Ff/Y对应的是SHA1：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209232056660-237578483.png)
    - 经过修饰，encryption函数的代码如下，将字符串SHA1加密后再Hex编码：
```
function encryption(val) {
    return Crypto.SHA1(val.toString()).toString(Crypto.enc.Hex);
}
```

* 至此已经知道了三个关键字段的构造方法，伪装一个`/bind`请求测试，返回结果成功：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200209232348962-1384123583.png)
