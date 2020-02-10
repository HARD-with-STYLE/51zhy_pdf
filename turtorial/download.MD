**强烈建议**使用逃课下载方式前悦读完前两篇Tip，使用该方法需要了解一定的反混淆套路。  
无论接口怎么变，最终的pdf都是由前端解密完成，再调用pdf.js对其渲染，可以利用这一点，在渲染的代码前注入下载程序即可下载PDF。  
本方法需要用到[本地文件替换](https://ganlvtech.github.io/2018/10/15/chrome-local-override/)、抓包工具（如果会突破[前端反调试](https://segmentfault.com/a/1190000012359015)可以不用）与任意IDE。  

## 法1
* 在console-Network-XHR或抓包工具中找到数据最大/返回PDF地址的请求：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200210224551231-1251969000.png)
* 如果无法突破反调试，可使用更多工具-网页另存为，将网页全部保存下来，使用任意可以对js文件建立索引的IDE打开文件夹，如果已突破，直接在Initiator中找到请求的js，将其保存至本地。
* 将代码中UTF-8编码全部转换，在代码中搜索与请求相关的关键词，例如SplitFiles、DeviceKey、authorize等，找到对应代码：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200210225148165-565733167.png)
* 往下翻找到成功的返回函数，发现关键点
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200210225253461-1609124879.png)
* 找到调用authorKey的代码，下面有非常醒目的loadingPDF：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200210224337140-1385676713.png)
* 在调用loadingPdf前即0xc插入下载代码，其中key为复制为sent的变量名。
```js
function saveByteArray(reportName, byte) {
    var blob = new Blob([byte], {type: "application/pdf"});
    var link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    var fileName = reportName;
    link.download = fileName;
    link.click();
}
saveByteArray(`${Math.floor((new Date()).getTime() / 1000)}-${this['index']}.pdf`, key)
```
* 将修改过的文件覆盖

## 法2
如果能够得到私钥与链接一样可以达到目的下载的目的。
* 根据法1找到请求的部分，在case 0x4后加入`console.log(_0x20a045['sent'])`，打印出私钥，并将修改过的文件覆盖。
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200210231426951-181852541.png)
* 参考[hanxi/blog#44](https://github.com/hanxi/blog/issues/44) 或 [sqlsec/keledge_pdf](https://github.com/sqlsec/keledge_pdf)，即可下载。
