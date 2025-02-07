# Cloudflare Worker 搭建各类 AI 的微信助手反向代理 
only for 微信助手<br>
欢迎来到微信助手 ChatGPT 反向代理项目！<br>

# 有三个相同功能的不同部署环境的项目：
1、部署到Netlify的。目前Netlify注册有难度，已经有Netlify账户的可以尝试它.请移步到[AiChatHelper](https://github.com/GeekinGH/AiChatHelper)；<br>
2、部署到自己的服务器或者任何可以搭建NodeJs环境的服务器的，请移步到[AiChatHelperNodejs](https://github.com/GeekinGH/AiChatHelperNodejs)；<br>
3、部署到CloudFlare的，就是本仓库.目前有新的办法可以解决Gemini区域限制和域名问题，目前来看是最省钱最简单的实现方法<br>
<br>

微信助手反代部署到 Cloudflare Workers，需要在2个地方部署，有点复杂
## CF worker的搭建步骤，我这里用文字说明，图文请参照最后提供的链接
1. 你需要有一个自己的域名，因为cf的dev域名是被🧱的,推荐使用免费域名[dynv6](https://dynv6.com)。
2. 你需要有一个cloudflare账号。
3. 在cf首页，点击“Workers和Pages”，右上角“创建应用程序”-->"创建Worker"。
4. 输入worker的名字（随意），点击部署。
5. 点击“编辑代码：，把本仓库中的worker.js中的代码复制粘贴到worker中。
6. 点击右上角的“保存并部署”。部署后在“设置”-->"触发器“-->"路由“中的路由就是完整的项目域名，用于7.1。
7. 如果需要解决gemini“User location is not supported for the API use”区域限制的方法，先在Pages部署好_worker.js<br>
   7.1 首先下载_worker.js到本地，修改中的 url.hostname 地址为刚刚部署好的worker的域名，类似：xxx.xxxx.workers.dev<br>
   7.2 在cf首页，点击“Workers和Pages”，右上角“创建应用程序”-->"Pages"-->"上传资产"。<br>
   7.3 为项目创建名称：任意起一个你喜欢的项目名称，点击“创建项目”。<br>
   7.4 上传您的项目资产：拖放或从计算机中选择7.1中的_worker.js，上传完毕后点击“部署站点”。<br>
   7.5 回到这个page项目，点击“自定义域名”，按照这个视频的4:15开始的步骤设置域名[dynv6和cloudns免费域名如何在cloudflare pages...](https://www.youtube.com/watch?v=s-BIB4eyQRM)<br> 
8. 等待一会儿，自定义域名的证书显示有效后，即可把这个免费的dynv6填写到微信助手的代理服务器栏中。
9. 详细的worker搭建图文说明，请访问以下链接：<br>
CSDN 中 guo_zhen_qian 的：[使用Cloudflare创建openai的反向代理](https://blog.csdn.net/guo_zhen_qian/article/details/134957351)<br>
GamerNoTitle:[Cloudflare Workers反代实战（下）](https://bili33.top/posts/Cloudflare-Workers-Section2/)<br>
Simon's Blog：[simonmy.com](https://simonmy.com/posts/使用netlify反向代理google-palm-api.html)<br>

## 使用方法
以下操作都是在“微信助手”ChatGPT中操作：
1. 将你的代理地址填写到“代理地址”栏。
2. “APIKey”中填写对应的API Key，在“模型”中按下表选择或填写。

| AI       | APIKey      | 模型            |
|-----------|-------------|-----------------|
| ChatGPT 3.5  | ChatGPT 3.5 API Key | 选择：gpt-3.5-turbo |
| ChatGPT plus  | ChatGPT 4 API Key | 选择：gpt-4 |
| GPT-4o  | GPT-4o API Key | 手动输入，填写：GPT-4o |
| Gemini-pro 1.0 | Gemini 1.0 API Key | 手动输入，填写：Gemini-pro |
| Gemini-pro 1.5 | Gemini 1.5 API Key | 手动输入，填写：gemini-1.5-pro-latest |
| Gemini | Gemini 1.5 API Key | 手动输入，填写：gemini-1.5-flash |
| Gemini | Gemini 2.0 API Key | 手动输入，填写：gemini-2.0-flash-exp |
| 通义千问   | Qwen API Key | 手动输入，填写：qwen-turbo(弃用) 或 qwen-max |
| Moonshot Kimi | Kimi API Key  | 手动输入，填写：moonshot-v1-8k 或 moonshot-v1-32k |
| Claude3   | Claude3 API Key | 手动输入，填写：claude-3-opus-20240229 | 
| 360智脑   | 360 API Key | 手动输入，填写：360gpt-pro |
| DeepSeek   | DeepSeek-V3 | 手动输入，填写：deepseek-chat |
| DeepSeek   | DeepSeek-R1 | 手动输入，填写：deepseek-reasoner |
3. 360AI支持文生图功能，在聊天中，话术为：画xxxxxxxx，AI则会返回一个图片链接。比如：画一个蓝天白云的图片
4. DeepSeek-R1 因为WeChat的字数限制，删除了推理过程，直接输出结果。DeepSeek 可以不用反代，直接输入 API 地址 https://api.deepseek.com
