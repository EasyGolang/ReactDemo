import path from 'path';
import Koa from 'koa';
import staticServe from 'koa-static';
import { createProxyMiddleware } from 'http-proxy-middleware';
import koaConnect from 'koa2-connect';
import fs from 'fs';

import { Proxy, Port } from '../viteOpt.mjs';

const AppPath = path.resolve();
const staticPath = path.join(AppPath, 'dist');

const App = new Koa();

// 处理404, 兼容 BrowserRouter
App.use(async (ctx, next) => {
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
    ctx.body = fs.readFileSync(path.join(staticPath, '/index.html'), 'utf-8');
  }
});
App.use(staticServe(staticPath));

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
Object.keys(Proxy).map((context) => {
  const options = Proxy[context];
  App.use(proxy(context, options));
  return true;
});

App.listen(Port, '0.0.0.0', () => {
  console.info(`http://localhost:${Port}`);
});
