const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const pool = require('../Config/db'); // 导入数据库连接池
const SALT_ROUNDS = 10; // 设置密码哈希的轮数

router.post('/register', async (req, res) => {
  const { username, password, gender, birthday, phone } = req.body;

  // 检查请求体是否包含所有必要字段
  if (!username || !password || !gender || !birthday || !phone) {
    return res.status(400).json({ success: false, message: '请求体缺少必要的数据' });
  }

  // 验证密码强度
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: '密码长度至少为6位' });
  }

  try {
    // 检查用户名是否已经存在
    const existingUser = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
    if (existingUser.length > 0) {
      return res.status(400).json({ success: false, message: '用户名已存在，请选择另一个用户名' });
    }

    // 对密码进行加密
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // 在数据库中插入用户信息
    await pool.query('INSERT INTO users (username, password, gender, birthday, phone) VALUES (?, ?, ?, ?, ?)', [username, hashedPassword, gender, birthday, phone]);

    // 注册成功后返回一个成功的响应
    return res.status(200).json({ success: true, message: '注册成功' });
  } catch (err) {
    console.error('Error inserting user into database:', err);
    return res.status(500).json({ success: false, message: '注册失败' });
  }
});

module.exports = router;
