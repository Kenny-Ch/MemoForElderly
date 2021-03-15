# 数据库结构

## **user**
| 字段名 | 含义 |
| -----  | ---- |
| openid |用户唯一标识|
|identity|身份标识：0无身份1老年人2亲属| 
|nickname|昵称|
|avatarUrl|头像url|



## **memo**
| 字段名 | 含义 |
| -----  | ---- |
|content|备忘内容|
|recordUrl|录音链接|
|finish|是否完成：0未完成1完成|
|belong|备忘归属于哪个老人（存openid）|
|creator|创建备忘的人（存openid）|





# 云函数介绍

## **keyworsExtraction**
### 作用：关键词提取
| 传入字段名 | 含义 |
| -----  | ---- |
|text|文本|
|limitKeys|所需多少关键词（选填）|
### 返回：关键词数组

## **sentenceRecognition**
### 作用：语音识别
| 传入字段名 | 含义 |
| -----  | ---- |
|data|base64编码语音|
|dataLen|未转base64前的信息长度|
### 返回：识别的文字

## **textToVoice**
### 作用：语音合成
| 传入字段名 | 含义 |
| -----  | ---- |
|text|需要合成的文本|
### 返回：

## **login**
### 作用：获取openid
| 传入字段名 | 含义 |
| -----  | ---- |
|||
### 返回openid

## **getMemo**
### 作用：获取老人或亲属所有的备忘
| 传入字段名 | 含义 |
| -----  | ---- |
|type|获取备忘类型：0获取老人自己的，1获取亲属所绑定的所有老人的|
|openid|老人的openid|
### 返回备忘数组