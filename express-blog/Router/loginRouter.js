const bcrypt = require('bcrypt');
const express = require('express');
const pool = require('../Config/db'); // 导入数据库连接池
const router = express.Router();
const jwt = require('jsonwebtoken');

const key ='123456789zsp'
// 定义登录路由
router.post('/login', (req, res) => {
  // 从请求体中获取用户名和密码
  const { username, password } = req.body;

  // 查询数据库中是否存在匹配的用户名
  pool.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
    console.log(results)
    // 检查是否找到用户
    if (results.length === 0) {
      return res.status(401).json({ message: 'Username or password is incorrect' });
    }

    // 获取用户信息
    const user = results[0];

    // 解密数据库中的密码
    bcrypt.compare(password, user.password, (err, isValid) => {
      if (err) {
        console.error('Error comparing passwords:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }

      // 验证密码是否匹配
      if (!isValid) {
        return res.status(401).json({ message: 'Username or password is incorrect' });
      }

        // 登录成功，生成 JWT 令牌
        const token = jwt.sign({ username: user.username, userId: user.user_id }, key, { expiresIn: '1h' });

        // 返回 JWT 令牌到客户端
        return res.status(200).json({ message: '登录成功', token: token });
    });
  });
});

module.exports = router;
