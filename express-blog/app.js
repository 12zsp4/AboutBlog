const express = require('express');
const cors = require('cors'); // 导入 cors 模块
const registerRouter = require('./Router/registerRouter'); // 导入注册路由
const loginRouter = require('./Router/loginRouter'); // 导入登录路由
const router = require('./Router/router');
const path = require('path');

const app = express();

// 使用 cors 中间件
app.use(cors());
app.use(express.json());

// 将注册路由绑定到 /register 路由上
app.use('/user', registerRouter);
app.use('/user', loginRouter);


//设置静态文件目录
app.use('/public/uploads',express.static(path.join(__dirname,'public/uploads')));

//全部的路由
app.use('/user', router);


// 启动服务器
app.listen(4000, () => {
  console.log('Server is running on port 4000');
});
