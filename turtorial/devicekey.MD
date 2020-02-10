* 经过观察，在新的`authorize`接口中，rsaKey中间一段的长度明显超出范围，猜测对rsaKey做了混淆，搜索找到devicekey：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200210220928487-849694736.png)
* 其中_0x154271的定义在这里，先调用encrpyt函数生成一个字符串，在将字符串的长度+100后base64编码，附在字符串前。    
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200210221905939-2091415836.png)
* 直接搜索`encrpyt`函数，找到位置：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200210222128276-556003377.png)
* 将其定义的对象单独复制到一个文件中，发现只有是未知量：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200210222206655-1877631632.png)
* 通过Chrome Overwrite的功能，将`_0x5edfd9()`暴露到console.log中，发现整个循环体实际上遍历一个数组，将其URL编码后再base64编码。
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200210222233434-771831709.png)
* 将其美化后调试输出正确，详见[代码](https://github.com/shylocks/51zhy_pdf/blob/master/vendor.js)中的generateKey函数：
![](https://img2018.cnblogs.com/blog/394393/202002/394393-20200210222543270-48609667.png)

