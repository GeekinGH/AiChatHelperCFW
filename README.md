# Cloudflare Worker 搭建各类 AI 的微信助手反向代理 
only for 微信助手<br>
欢迎来到微信助手 ChatGPT 反向代理项目！<br>

微信助手反代部署到 Cloudflare Workers，需要在2个地方部署，有点复杂
## CF worker的搭建步骤，我这里用文字说明，图文请参照最后提供的链接
1. 你需要有一个自己的域名，因为cf的dev域名是被🧱的。
2. 你需要有一个cloudflare账号，把你的域名添加到cf。
3. 在cf首页，点击“Workers和Pages”，右上角“创建应用程序”-->"创建Worker"。
4. 输入worker的名字（随意），点击部署。
5. 如果需要解决gemini“User location is not supported for the API use”区域限制的方法，先在netlify部署好gemini的反代，设置好worker.js中的 this.proxyUrl 地址！！！<br>
   5.1 前往 [palm-netlify-proxy](https://github.com/antergone/palm-netlify-proxy) 仓库，点击 "Deploy With Netlify" 按钮。<br>
   5.2 部署完成后，您将获得由Netlify分配的域名.例如:https://xxx.netlify.app<br>
   5.3 在您的 AiChatHelper 项目的worker.js 中搜索 this.proxyUrl ，值为您从部署 palm 代理获得的域名https://xxx.netlify.app<br>
6. 点击“编辑代码：，把本仓库中的worker.js中的代码复制粘贴到worker.js中。
7. 点击右上角的“保存并部署”。
8. 替换自己的域名。在worker管理界面，点击触发器，添加自定义域。
9. 输入自己的域名（一般自己设置一个子域名），点击”添加自定义域“。
10. 等待一会儿，尝试用此域名访问。有效后即可填写到微信助手的代理服务器栏中。
11. 详细的搭建图文说明，请访问以下链接：
12. CSDN 中 guo_zhen_qian 的：[使用Cloudflare创建openai的反向代理](https://blog.csdn.net/guo_zhen_qian/article/details/134957351)
13. GamerNoTitle:[Cloudflare Workers反代实战（下）](https://bili33.top/posts/Cloudflare-Workers-Section2/)
14. Simon's Blog：[simonmy.com](https://simonmy.com/posts/使用netlify反向代理google-palm-api.html)

## 使用方法
以下操作都是在“微信助手”ChatGPT中操作：
1. 将你的代理地址填写到“代理地址”栏。
2. “APIKey”中填写对应的API Key，在“模型”中按下表选择或填写。

| AI       | APIKey      | 模型            |
|-----------|-------------|-----------------|
| ChatGPT 3.5  | ChatGPT 3.5 API Key | 选择：gpt-3.5-turbo |
| ChatGPT plus  | ChatGPT 4 API Key | 选择：gpt-4 |
| Gemini-pro 1.0 | Gemini 1.0 API Key | 手动输入，填写：Gemini-pro |
| Gemini-pro 1.5 | Gemini 1.5 API Key | 手动输入，填写：gemini-1.5-pro-latest |
| 通义千问   | Qwen API Key | 手动输入，填写：qwen-turbo(弃用) 或 qwen-max |
| Moonshot Kimi | Kimi API Key  | 手动输入，填写：moonshot-v1-8k 或 moonshot-v1-32k |
| Claude3   | Claude3 API Key | 手动输入，填写：claude-3-opus-20240229 | 
| 360智脑   | 360 API Key | 手动输入，填写：360gpt-pro |
3. 360AI支持文生图功能，在聊天中，话术为：画xxxxxxxx，AI则会返回一个图片链接。比如：画一个蓝天白云的图片
