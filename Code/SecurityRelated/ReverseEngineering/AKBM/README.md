## AKBM 逆向研究

[AK](https://www.akamai.com)是全球最大的CDN厂商之一。

[AKBM](https://www.akamai.com/products/bot-manager) 是全世界最顶级的反爬虫系统之一。

个大金融、电商(nike, bestbuy, yeezysupply)平台都对其进行深度整合来避免关键数据被非法获取。

在此，出于学习的目的，我们通过逆向工程来分析它的实现方式。 

😁😁😁😁

---

[deobfAKBM.20220605.js](#) 针对于20220605版本的AKBM脚本进行反混淆

[fpDataParser.js](fpDataParser.js) 解密指纹数据，并把每个字段含义列举出来

[antiAKBM.js](#) 使用nodeJS来构建完整环境绕过AKBM反爬检测

[antiAKBM.go](#) 使用go生成fpData绕过AKBM反爬检测