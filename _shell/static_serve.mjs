import path from 'path';
import Koa from 'koa';
import staticServe from 'koa-static';
import { createProxyMiddleware } from 'http-proxy-middleware';
import koaConnect from 'koa2-connect';
import fs from 'fs';

import { Proxy } from '../viteOpt.mjs';

const __dirname = path.resolve();

const app = new Koa();

// 静态资源目录
const staticPath = './dist';
// 端口
const port = 9999;

// 代理配置
const proxyTable = Proxy;

// 处理404, 兼容 BrowserRouter
app.use(async (ctx, next) => {
  try {
    await next();
    const status = ctx.status || 404;
    if (status === 404) {
      return404content();
    }
  } catch (err) {
    ctx.status = err.status || 500;
    if (ctx.status === 404) {
      return404content();
    }
  }
  function return404content() {
    ctx.body = fs.readFileSync(path.join(__dirname, `${staticPath}/index.html`), 'utf-8');
  }
});
app.use(staticServe(path.join(__dirname, staticPath)));

// 代理服务启动
const proxy = (context, opt) => {
  let options = opt;
  if (typeof options === 'string') {
    options = {
      target: options,
    };
  }
  return async function (ctx, next) {
    await koaConnect(createProxyMiddleware(context, options))(ctx, next);
  };
};

// 遍历代理接口
Object.keys(proxyTable).map((context) => {
  const options = proxyTable[context];
  app.use(proxy(context, options));
  return true;
});

app.listen(port, '0.0.0.0', () => {
  console.info(`http://localhost:${port}`);
});
