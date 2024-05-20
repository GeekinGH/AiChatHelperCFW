//需要对特定微信鉴权的，请在[]中填写对应微信ID
//类似：const WXID_ARRAY = ['wxid_abcdefg','lambous','yourxxx','abdcedf']
//[]内不添加微信ID则表示不进行鉴权
const WXID_ARRAY = [];

//360 API Key
const APIKEY360 = "";

// 定义各种AI类
class Gemini {
  constructor(requestModel, requestAuthorization, requestMessages) {
      //如果需要，先部署Netlify反向代理
      //填写反代域名，类似：https://xxx.netlify.app，需要填"https://"
      this.proxyUrl = '';
      this.model = requestModel;
      this.authorization = requestAuthorization ? requestAuthorization.replace('Bearer ', '') : '';
      if (this.model === "gemini") {
          this.model = 'gemini-pro';
      }
      if (this.proxyUrl !== '') {
          this.url = `${this.proxyUrl}/v1beta/models/${this.model}:generateContent?key=${this.authorization}`;
        } else {
          this.url = `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.authorization}`;
        }
        
      this.formatHeaders();
      try {
          this.formatBody(requestMessages);
      } catch (error) {
          console.error('Error formatting body:', error);
      }
  }

  formatHeaders() {
      // 检查是否已经存在 headers，如果存在则不重新初始化
      if (!this.headers) {
          this.headers = {'Content-Type': 'application/json'};
      }
  }

  formatBody(requestMessages) {
      try {
          // 确保this.body是对象类型，否则进行初始化
          if (typeof this.body !== 'object' || this.body === null) {
              this.body = {};
          }

          let formattedMessages = [];
          requestMessages.forEach((item, index) => {
              if (index === 0) {
                  formattedMessages.push({
                      'role': 'user',
                      'parts': [{
                          'text': item.content,
                      }],
                  }, {
                      'role': 'model',
                      'parts': [{
                          'text': '好的',
                      }],
                  });
              } else if (index === 1 && item.role === 'assistant') {
                  // 忽略掉第二条消息
              } else {
                  formattedMessages.push({
                      'role': (item.role === 'assistant') ? 'model' : 'user',
                      'parts': [{
                          'text': item.content,
                      }],
                  });
              }
          });

          this.messages = formattedMessages;

          // 将格式化后的 messages 转换为自己格式的 body
          this.body = {
              'contents': this.messages,
              "safetySettings": [{
                      "category": "HARM_CATEGORY_HARASSMENT",
                      "threshold": "BLOCK_NONE"
                  }, {
                      "category": "HARM_CATEGORY_HATE_SPEECH",
                      "threshold": "BLOCK_NONE"
                  }, {
                      "category": "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                      "threshold": "BLOCK_NONE"
                  }, {
                      "category": "HARM_CATEGORY_DANGEROUS_CONTENT",
                      "threshold": "BLOCK_NONE"
                  }
              ],
          };
      } catch (error) {
          console.error('Error formatting messages:', error);
          throw error;
      }
  }

  handleResponse(responseData) {
      // 判断是否存在 responseData.candidates
      if (responseData.candidates && responseData.candidates.length > 0) {
          // 检查是否存在 responseData.candidates[0].content.parts[0].text
          if (responseData.candidates[0].content && responseData.candidates[0].content.parts &&
              responseData.candidates[0].content.parts.length > 0) {
              // 返回 Gemini API 的响应文本
              return responseData.candidates[0].content.parts[0].text;
          } else {
              // 返回错误信息，指示无法获取有效的响应文本
              return `${this.model} API 返回未知错误: 无法获取有效的响应文本`;
          }
      } else if (responseData.error) {
          // 处理错误逻辑
          const errorMessage = responseData.error.message || '未知错误';
          return `${this.model} API 错误: ${errorMessage}`;
      } else {
          // 返回错误信息，指示无法获取有效的响应
          return `${this.model} API 返回未知错误: 无法获取有效的响应`;
      }
  }
}

class ChatGPT {
  constructor(requestModel, requestAuthorization, requestMessages) {
      this.model = requestModel;
      this.authorization = requestAuthorization;
      this.url = 'https://api.openai.com/v1/chat/completions';
      this.formatHeaders();
      try {
          this.formatBody(requestMessages);
      } catch (error) {
          console.error('Error formatting body:', error);
          throw error;
      }
  }

  formatHeaders() {
      // 检查是否已经存在 headers，如果存在则不重新初始化
      if (!this.headers) {
          this.headers = {
              'Content-Type': 'application/json',
              'Authorization': this.authorization,
          };
      }
  }

  formatBody(requestMessages) {
      try {
          // 确保this.body是对象类型，否则进行初始化
          if (typeof this.body !== 'object' || this.body === null) {
              this.body = {};
          }

          // 将格式化后的 messages 转换为自己格式的 body
          this.body = {
              'model': this.model,
              'messages': requestMessages,
          };
      } catch (error) {
          console.error('Error formatting messages:', error);
          throw error;
      }
  }

  handleResponse(responseData) {
      // 判断是否有错误信息
      if (responseData.error) {
          // 处理错误逻辑
          const errorMessage = responseData.error.message || '未知错误';
          return `${this.model}: ${errorMessage}`;
      }

      // 检查响应结构是否符合预期
      if (responseData.choices && responseData.choices.length > 0 && responseData.choices[0].message && responseData.choices[0].message.content) {
          return responseData.choices[0].message.content;
      } else {
          // 响应结构不符合预期，返回错误信息
          return `${this.model}: 无法解析响应数据`;
      }
  }
}

class Claude3 {
  constructor(requestModel, requestAuthorization, requestMessages) {
      this.model = requestModel;
      this.authorization = requestAuthorization ? requestAuthorization.replace('Bearer ', '') : '';
      this.url = 'https://api.anthropic.com/v1/messages';
      this.formatHeaders();
      try {
          this.formatBody(requestMessages);
      } catch (error) {
          console.error('Error formatting body:', error);
      }
  }

  formatHeaders() {
      // 检查是否已经存在 headers，如果存在则不重新初始化
      if (!this.headers) {
          this.headers = {
              'x-api-key': this.authorization,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json'
          };
      }
  }

  formatBody(requestMessages) {
      try {
          // 确保this.body是对象类型，否则进行初始化
          if (typeof this.body !== 'object' || this.body === null) {
              this.body = {};
          }

          let formattedMessages = [];
          requestMessages.forEach((item, index) => {
              if (index === 0 && item.role === 'system') {
                  let itemContent = item.content.trim();
                  this.system = itemContent;
                  //Claude3的Message没有"system" role
              } else if (index === 1 && item.role === 'assistant') {
                  // Claude3的Message开头必须是user role
              } else {
                  formattedMessages.push({
                      'role': item.role,
                      'content': item.content,
                  });
              }
          });

          this.messages = formattedMessages;

          // 将格式化后的 messages 转换为自己格式的 body
          this.body = {
              'model': this.model,
              'max_tokens': 1024,
              'messages': this.messages,
          };
          // 检查 this.system 是否为空，如果不为空，则添加到 body 对象中
          if (this.system !== undefined && this.system !== null && this.system !== '') {
              this.body['system'] = this.system;
          }
      } catch (error) {
          console.error('Error formatting messages:', error);
          throw error;
      }
  }

  handleResponse(responseData) {
      // 判断是否有错误信息
      if (responseData.error) {
          // 处理错误逻辑
          const errorMessage = responseData.error.message || '未知错误';
          return `${this.model}: ${errorMessage}`;
      }

      // 检查响应结构是否符合预期
      if (responseData.content && responseData.content.length > 0 && responseData.content[0].text) {
          return responseData.content[0].text;
      } else {
          // 响应结构不符合预期，返回错误信息
          return `${this.model}: 无法解析响应数据`;
      }
  }
}

class GPT360 {
  constructor(requestModel, requestAuthorization, requestMessages) {
    this.model = requestModel;
    this.authorization = requestAuthorization;
    this.url = 'https://api.360.cn/v1/chat/completions';
    this.text2img = false;
    this.formatHeaders();
    try {
      // 获取最后一条消息
      const lastMessage = requestMessages[requestMessages.length - 1].content.trim();
      // 判断是否需要文生图模式
      if (lastMessage.startsWith('画')) {
        this.url = 'https://api.360.cn/v1/images/text2img';
        this.model = '360CV_S0_V5';
        this.text2img = true;
        this.formatBodyText2Img(lastMessage);
      } else {
        this.formatBody(requestMessages);
      }
    } catch (error) {
      console.error('Error formatting body:', error);
      throw error;
    }
  }

  formatHeaders() {
    // 检查是否已经存在 headers，如果存在则不重新初始化
    if (!this.headers) {
      this.headers = {
        'Content-Type': 'application/json',
        'Authorization': this.authorization,
      };
    }
  }

  formatBody(requestMessages) {
    try {
      // 确保this.body是对象类型，否则进行初始化
      if (typeof this.body !== 'object' || this.body === null) {
        this.body = {};
      }

      // 将格式化后的 messages 转换为自己格式的 body
      this.body = {
        'model': this.model,
        'messages': requestMessages,
        'stream': false,
        "tools":[
            {
                "type":"web_search",
                "web_search":{
                    "search_mode":"auto",
                    "search_query":requestMessages[requestMessages.length - 1].content.trim()
                }
            }
        ]
      };
    } catch (error) {
      console.error('Error formatting messages:', error);
      throw error;
    }
  }

  formatBodyText2Img(lastMessage) {
    try {
      // 确保this.body是对象类型，否则进行初始化
      if (typeof this.body !== 'object' || this.body === null) {
        this.body = {};
      }

      // 将提取的 lastMessage 转换为文生图格式的 body
      this.body = {
        "model": "360CV_S0_V5",
        "style": "realistic",
        "prompt": lastMessage.substring(1),
        "negative_prompt": "",
        "guidance_scale": 15,
        "height": 1920,
        "width": 1080,
        "num_inference_steps": 50,
        "samples": 1,
        "enhance_prompt": true
      };
    } catch (error) {
      console.error('Error formatting messages:', error);
      throw error;
    }
  }

  handleResponse(responseData) {
    // 判断是否有错误信息
    if (responseData.error) {
      // 处理错误逻辑
      const errorMessage = responseData.error.message || '未知错误';
      return `${this.model}: ${errorMessage}`;
    }

    if (!this.text2img) {
      // 文本聊天模式
      if (responseData.choices && responseData.choices.length > 0 && responseData.choices[0].message && responseData.choices[0].message.content) {
        return responseData.choices[0].message.content;
      } else {
        return `${this.model}: 无法解析响应数据`;
      }
    } else {
      // 文生图模式
      if (responseData.status === 'success' && responseData.output) {
        if (responseData.output.length > 0){
          return responseData.output[0];
        } else {
          return '鉴于关键词过滤原因，无法根据您的关键词生图';
        }
      } else {
        return `${this.model}: 无法解析响应数据`;
      }
    }
  }
}

class Kimi {
  constructor(requestModel, requestAuthorization, requestMessages) {
      this.model = requestModel;
      this.authorization = requestAuthorization;
      this.url = 'https://api.moonshot.cn/v1/chat/completions';
      this.formatHeaders();
      try {
          this.formatBody(requestMessages);
      } catch (error) {
          console.error('Error formatting body:', error);
          throw error;
      }
  }

  formatHeaders() {
      // 检查是否已经存在 headers，如果存在则不重新初始化
      if (!this.headers) {
          this.headers = {
              'Content-Type': 'application/json',
              'Authorization': this.authorization,
          };
      }
  }

  formatBody(requestMessages) {
      try {
          // 确保this.body是对象类型，否则进行初始化
          if (typeof this.body !== 'object' || this.body === null) {
              this.body = {};
          }

          // 将格式化后的 messages 转换为自己格式的 body
          this.body = {
              'model': this.model,
              'messages': requestMessages,
              'temperature': 0.3,
          };
      } catch (error) {
          console.error('Error formatting messages:', error);
          throw error;
      }
  }

  handleResponse(responseData) {
      // 判断是否有错误信息
      if (responseData.error) {
          // 处理错误逻辑
          const errorMessage = responseData.error.message || '未知错误';
          return `${this.model}: ${errorMessage}`;
      }

      // 检查响应结构是否符合预期
      if (responseData.choices && responseData.choices.length > 0 && responseData.choices[0].message && responseData.choices[0].message.content) {
          return responseData.choices[0].message.content;
      } else {
          // 响应结构不符合预期，返回错误信息
          return `${this.model}: 无法解析响应数据`;
      }
  }
}

class Qwen {
  constructor(requestModel, requestAuthorization, requestMessages) {
      this.model = requestModel;
      this.authorization = requestAuthorization;
      this.url = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation';
      this.formatHeaders();
      this.formatBody(requestMessages);
  }

  formatHeaders() {
      // 检查是否已经存在 headers，如果存在则不重新初始化
      if (!this.headers) {
          this.headers = {
              'Content-Type': 'application/json',
              'Authorization': this.authorization,
          };
      }
  }

  formatBody(requestMessages) {
      try {
          // 确保this.body是对象类型，否则进行初始化
          if (typeof this.body !== 'object' || this.body === null) {
              this.body = {};
          }

          let formattedMessages = [];
          requestMessages.forEach((item, index) => {
              if (index === 0 && item.role === 'system') {
                  let itemContent = item.content.trim();
                  if (itemContent === "") {
                      itemContent = '你是通义千问';
                  }
                  formattedMessages.push({
                      'role': 'system',
                      'content': itemContent,
                  });
              } else if (index === 1 && item.role === 'assistant') {
                  // 忽略掉第二条消息
              } else {
                  formattedMessages.push({
                      'role': item.role,
                      'content': item.content,
                  });
              }
          });

          this.messages = formattedMessages;

          // 将格式化后的 messages 转换为自己格式的 body
          this.body = {
              'model': this.model,
              'input': {
                  'messages': this.messages,
              },
              'parameters': {},
          };
      } catch (error) {
          console.error('Error formatting messages:', error);
          throw error;
      }
  }

  handleResponse(responseData) {
      // 判断是否有错误信息
      if (responseData.code) {
          // 处理错误逻辑
          const errorCode = responseData.code;
          const errorMessage = responseData.message || '未知错误';
          return `${this.model}: ${errorCode} - ${errorMessage}`;
      }
      if (responseData.errorType) {
          // 处理错误逻辑
          const errorType = responseData.errorType;
          const errorMessage2 = responseData.errorMessage || '未知错误';
          return `${this.model}: ${errorType} - ${errorMessage2}`;
      }

      // 检查是否存在 responseData.output.text
      if (responseData.output && responseData.output.text) {
          // 返回 Qwen API 的响应
          return responseData.output.text;
      } else {
          // 返回错误信息，指示无法获取有效的响应文本
          return `${this.model}: 无法获取有效的响应文本`;
      }
  }
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

// 全局范围定义 supportedModels（支持的模型），格式：'模型名称':对应的AI类
const supportedModels = {
    'gpt-3.5-turbo': ChatGPT,
    'gpt-4': ChatGPT,
    'GPT-4o': ChatGPT,
    'gemini-pro': Gemini,
    'gemini': Gemini,
    'gemini-1.5-pro-latest': Gemini,
    'qwen-turbo': Qwen,
    'qwen-max': Qwen,
    'moonshot-v1-8k': Kimi,
    'moonshot-v1-32k': Kimi,
    'claude-3-opus-20240229': Claude3,
    '360gpt-pro': GPT360
};

//把回应给WeChat Assistant信息格式化为微信助手可以识别的Json
function respondJsonMessage(message) {
    const jsonMessage = {
        choices: [{
                message: {
                    role: 'assistant',
                    content: message,
                },
            }
        ],
    };

    return new Response(JSON.stringify(jsonMessage), {
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
        },
    });
}

async function handleRequest(request) {
    try {
        //Only for WeChat Assistant
        const wxid = request.headers.get('wxid');
        if (!wxid) {
            throw new Error('您的请求不兼容于本服务');
        }
        //WeChat ID authorization
        if (WXID_ARRAY.length > 0 && !WXID_ARRAY.includes(wxid)) {
            return respondJsonMessage('当您看到这个信息，说明您需要联系本服务提供者进行使用授权');
        }
        
        let requestAuthorization = request.headers.get('authorization');
        if (!requestAuthorization) {
            throw new Error('请提供API鉴权码');
        }
        
        const requestBody = await request.json();
        let requestModel = requestBody.model.toLowerCase().trim();
        const requestMessages = requestBody.messages;
        const lastMessage = requestMessages[requestMessages.length - 1].content.trim();

        // 判断是否需要文生图模式
        if (APIKEY360.length > 0 && lastMessage.startsWith("画")) {
          requestModel = "360gpt-pro";
          requestAuthorization = APIKEY360;
        }
      
        let response;
        const ModelClass = supportedModels[requestModel];
        if (ModelClass) {
            const modelInstance = new ModelClass(requestModel, requestAuthorization, requestMessages);
            const fetchResponse = await fetch(modelInstance.url, {
                method: 'POST',
                headers: modelInstance.headers,
                body: JSON.stringify(modelInstance.body)
            });
            const responseData = await fetchResponse.json();
            response = await modelInstance.handleResponse(responseData);
            return respondJsonMessage(response);
        } else {
            return respondJsonMessage('不支持的 chat_model 类型');
        }
    } catch (error) {
        console.error('Error:', error.toString()); // 记录错误信息
        return respondJsonMessage(`出错了: ${error.toString()}`);
    }
}
