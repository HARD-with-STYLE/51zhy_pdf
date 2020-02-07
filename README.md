电子工业出版社“悦读”PDF下载
====================
[悦读](https://yd.51zhy.cn/)  
测试时间：2020/02/07 18点24分 Release v1.0.6 
如果该repo对大家有帮助，给个star鼓励鼓励吧~  

### 免责声明
**请自觉遵守法律法规，本脚本仅供学习参考，所有下载的PDF请在24小时内删除，请勿传播，一切法律责任由用户自己承担，与本人无关**   

### 部署过程
windows用户可跳过部署过程，直接下载[编译好的exe](https://github.com/shylocks/51zhy_pdf/releases)。由于无法打包hummus库，使用`index.exe [id]`下载完成后，再调用`merge_pdf [id]`合成   
**项目依赖node环境**  
* 克隆项目 `git clone https://github.com/shylocks/51zhy_pdf.git`
* 进入项目目录 `cd 51zhy_pdf`
* 安装依赖
```
npm install
# 淘宝源
npm install --registry=https://registry.npm.taobao.org
```
* 合并PDF需要调用hummus库，在node v10.18.1(Centos) 与 node v12.9.1(Windows)下安装成功，在node v13.2.0(Mac)下安装失败，在无法安装hummus的情况下，推荐使用python合并PDF。  
* 请合理利用服务器资源，不要删除代码中的延时

### 运行方式
`node index.js [id] -t=[timeout] -m -p=[page]` / `index.exe [id] -t=[timeout] -m -p=[page]` 
* id参数为打开书籍详情，浏览器地址栏`id=`后的数字
* timeout参数默认为10(s)，一直下载失败可尝试调大
* m参数默认为false，只下载所有解密后的PDF至`./[id]`，设为true则生成完整的PDF文件
* p参数默认为空列表，可指定下载的页数，例如 `node index.js 123456 -p=1,2,3`
    
遇到大于1000页的PDF可能出现问题，可以分页下载后使用`python merge_pdf.py [id]`合成
