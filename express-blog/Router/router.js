const pool = require('../Config/db'); // 导入数据库连接池
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const key = "123456789zsp"


// 查询当前用户的信息
router.get('/userInfo', (req, res) => {
  // 从请求头中获取 Authorization 头部，包含 JWT token
  const token = req.headers.authorization;
  // 解析 JWT token 获取当前用户的信息
  jwt.verify(token, key, (err, decoded) => {
    if (err) {
      console.error('JWT Token 解析失败:', err);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = decoded.userId; // 从解码后的 token 中获取用户ID
    // 查询数据库中当前用户的信息，包括 username, gender, birthday, phone 字段
    pool.query('SELECT username, gender, birthday, phone FROM users WHERE user_id = ?', [userId], (err, results) => {
      if (err) {
        console.error('Error querying database:', err);
        return res.status(500).json({ message: 'Internal server error' });
      }
      // 返回查询结果给客户端
      res.status(200).json(results[0]); // 因为查询结果是数组，只返回第一个对象
    });
  });
});


// 更新用户信息
router.put('/update', (req, res) => {
  // 从请求体中获取需要更新的用户信息
  const { username, gender, birthday, phone } = req.body;
  // 获取当前用户的身份信息，例如通过 JWT token 解析
  const token = req.headers.authorization;

  jwt.verify(token, key, (err, decoded) => {
    if (err) {
      console.error('JWT Token 解析失败:', err);
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const userId = decoded.userId; // 从解码后的 token 中获取用户ID 
    // 更新数据库中当前用户的信息
    pool.query(
      'UPDATE users SET username = ?, gender = ?, birthday = ?, phone = ? WHERE user_id = ?',
      [username, gender, birthday, phone, userId],
      (err, results) => {
        if (err) {
          console.error('更新用户信息失败:', err);
          return res.status(500).json({ message: 'Internal server error' });
        }
        res.status(200).json({ message: '用户信息更新成功' });
      }
    );
  });
});



//发布博客
// 设置上传目录
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
// 设置 Multer 存储引擎
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const fileOriginalName = file.originalname;
    const fileExt = path.extname(fileOriginalName);
    const baseName = path.basename(fileOriginalName, fileExt);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const newFileName = baseName + '-' + uniqueSuffix + fileExt;
    cb(null, newFileName);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 1024 * 1024 * 5 } // 限制上传文件的大小为5MB
});
// 路由：上传书籍
router.post('/uploadBook', upload.array('file', 2), (req, res) => {
  console.log(" 检查body是否存在:",req.body);
  try {
    const files = req.files;
    const imgArrs = [];

    if (!files.length) {
      return res.status(400).json({ message: "未上传文件." });
    }

    files.forEach(file => {
      imgArrs.push('/public/uploads/' + file.filename);
    });

    const { title, author, price, publish_date, description } = req.body;
    const userId = req.query.userId; // 从请求参数中获取用户ID
    // 检查用户ID是否存在
    console.log(" 检查用户ID是否存在:"+userId);
    console.log(" 检查body是否存在:",title, author, price, publish_date, description);

    // 插入书籍详细信息到数据库
    const query = 'INSERT INTO books (title, author, price, publish_date, description, bookImage, user_id, bookFile) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
    const values = [title, author, price, publish_date, description, imgArrs[0], userId, imgArrs[1]];

    pool.query(query, values, (err, result) => {
      if (err) {
        console.error('插入文件路径到数据库失败:', err);
        return res.status(400).json({ message: '插入文件路径到数据库失败', error: err.message });
      }

      res.status(200).json({
        message: '文件上传成功，并且数据插入数据库成功',
        data: {
          files: imgArrs,
          bookId: result.insertId
        }
      });
    });

  } catch (error) {
    console.error('上传文件失败:', error.message);
    res.status(400).json({ message: '上传文件失败', error: error.message });
  }
});

// 展示所有书籍
router.get('/bookList', (req, res) => {
  pool.query(
    'SELECT id,title, author, price, publish_date, description, bookImage FROM books',
    (err, results) => {
      if (err) {
        console.error('数据库查询失败:', err);
        return res.status(500).json({
          status: 500,
          message: '数据库查询失败',
          error: err.message
        });
      }
      res.status(200).json({
        status: 200,
        message: '成功获取博客列表',
        data: results
      });
    }
  );
});

// 查询书籍，根据书名模糊查询
router.get('/SearchBook', (req, res) => {
  // 从 req.query 中获取 title 参数
  const title = req.query.title;
  console.log("------------",title)
  if (!title) {
    return res.status(400).json({ error: 'Missing title parameter' });
  }
  // 构建 SQL 查询语句，使用占位符以防 SQL 注入
  const sql = 'SELECT * FROM books WHERE title LIKE ?'; // 使用 LIKE 进行模糊查询
  // 执行查询，注意在占位符的值前后加上 `%` 符号，表示模糊匹配
  pool.query(sql, [`%${title}%`], (err, results) => {
    if (err) {
      console.error('Error executing query:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }
    // 返回查询结果给客户端
    res.json(results);
  });
});


// 删除书籍
router.delete('/DeleteBook/:id', (req, res) => {
  const id = req.params.id;
  console.log("------------",id)
  // 构建SQL删除语句，使用占位符以防SQL注入
  const sql = 'DELETE FROM books WHERE id = ?';

  // 执行删除操作
  pool.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Error deleting book:', err);
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
    console.log(`Deleted book with ID ${id}`);
    res.json({ message: `删除书籍 ${id}成功` });
  });
});

//根据ID查询书籍
// 根据书籍 ID 查询数据的路由
router.get('/SearchBook/:id', (req, res) => {
  const bookId = req.params.id;
  // 构造 SQL 查询语句
  const sql = `
    SELECT * FROM books
    WHERE id = ?
  `;
  // 执行查询操作
  pool.query(sql, [bookId], (err, results) => {
    if (err) {
      console.error('数据库查询失败:', err);
      return res.status(500).json({
        status: 500,
        message: '数据库查询失败',
        error: err.message
      });
    }
    // 检查是否找到对应的书籍
    if (results.length === 0) {
      return res.status(404).json({
        status: 404,
        message: '未找到指定的书籍'
      });
    }
    // 返回查询到的书籍信息
    res.status(200).json({
      status: 200,
      message: '成功获取书籍信息',
      data: results[0] // 假设只返回第一条数据，因为书籍 ID 应该是唯一的
    });
  });
});


// 更新书籍
router.put('/UpdateBook/:id', (req, res) => {
  const bookId = req.params.id;
  const { title, author, price, publish_date, description} = req.body;
  // 构造 SQL 更新语句和参数
  const sql = `
    UPDATE books 
    SET title = ?, author = ?, price = ?, publish_date = ?, description = ?
    WHERE id = ?
  `;
  const values = [title, author, price, publish_date, description, bookId];
  // 执行更新操作
  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error('数据库更新失败:', err);
      return res.status(500).json({
        status: 500,
        message: '数据库更新失败',
        error: err.message
      });
    }
    // 检查是否有更新的行数，如果没有找到对应的书籍，则返回错误
    if (result.affectedRows === 0) {
      return res.status(404).json({
        status: 404,
        message: '未找到要更新的书籍'
      });
    }
    // 返回成功的 JSON 响应
    res.status(200).json({
      status: 200,
      message: '书籍信息更新成功'
    });
  });
});


// 路由：获取个人书籍列表
router.get('/personalList/:userId', (req, res) => {
  const userId = req.params.userId; // 从请求参数中获取用户ID
  pool.query('SELECT * FROM books WHERE user_id = ?', userId, (err, results) => {
    if (err) {
      console.error('获取个人书籍列表失败:', err);
      return res.status(500).json({ message: '获取个人书籍列表失败', error: err.message });
    }

    res.status(200).json({ data: results });
  });
});





// 获取特定 ID 的书籍信息,建来给组件用的BookDetailsModal
router.get('/Search/:id', (req, res) => {
  const bookId = req.params.id;
  // 使用查询参数的方式获取特定 ID 的书籍信息
  pool.query(
    'SELECT id, title, author, price, publish_date, description, bookImage, bookFile FROM books WHERE id = ?',
    [bookId],
    (err, results) => {
      if (err) {
        console.error('数据库查询失败:', err);
        return res.status(500).json({
          status: 500,
          message: '数据库查询失败',
          error: err.message
        });
      }
      if (results.length === 0) {
        return res.status(404).json({
          status: 404,
          message: `ID 为 ${bookId} 的书籍不存在`
        });
      }
      const book = results[0]; // 假设查询结果只有一条记录
      res.status(200).json({
        status: 200,
        message: '成功获取书籍信息',
        data: book
      });
    }
  );
});


// 路由定义：插入评论
router.post('/InsertComment', (req, res) => {
  // 从请求体中获取评论相关信息
  const { username, bookId, rating, comment } = req.body;
  
  // 创建当前时间戳
  const create_time = new Date().toISOString().slice(0, 19).replace('T', ' ');

  // 准备 SQL 查询语句和参数
  const sql = 'INSERT INTO reviews (username, book_id, rating, create_time, comment) VALUES (?, ?, ?, ?, ?)';
  const values = [username, bookId, rating, create_time, comment];

  // 执行 SQL 查询
  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error('插入评论失败:', err);
      return res.status(500).json({
        status: 500,
        message: '插入评论失败',
        error: err.message
      });
    }
    
    // 返回成功响应
    res.status(200).json({
      status: 200,
      message: '插入评论成功',
      data: {
        comment_id: result.insertId, // 返回插入的评论ID
        username,
        book_id: bookId,
        rating,
        create_time,
        comment
      }
    });
  });
});


// GET 请求：获取特定书籍的评论列表
router.get('/comments/:bookId', async (req, res) => {
  const { bookId } = req.params;

  try {
    // 准备 SQL 查询语句和参数
    const sql = 'SELECT * FROM reviews WHERE book_id = ?';
    const values = [bookId];

    // 执行 SQL 查询
    pool.query(sql, values, (err, result) => {
      if (err) {
        console.error('获取评论失败:', err);
        return res.status(500).json({
          status: 500,
          message: '获取评论失败',
          error: err.message
        });
      }

      // 返回成功响应，包含评论列表数据
      res.status(200).json({
        status: 200,
        message: '获取评论成功',
        data: result // 假设查询结果直接返回
      });
    });

  } catch (error) {
    console.error('获取评论失败:', error);
    res.status(500).json({
      status: 500,
      message: '获取评论失败',
      error: error.message
    });
  }
});



// 路由定义：删除评论
router.delete('/DeleteComment/:id', (req, res) => {
  const commentId = req.params.id; // 获取评论ID
console.log("======================",commentId)
  // 准备 SQL 查询语句和参数
  const sql = 'DELETE FROM reviews WHERE id = ?';
  const values = [commentId];

  // 执行 SQL 查询
  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error('删除评论失败:', err);
      return res.status(500).json({
        status: 500,
        message: '删除评论失败',
        error: err.message
      });
    }
    // 检查是否有行受影响（即是否成功删除）
    if (result.affectedRows > 0) {
      // 返回成功响应
      res.status(200).json({
        status: 200,
        message: '删除评论成功',
        deleted_comment_id: commentId
      });
    } else {
      // 如果没有找到匹配的评论ID，返回404
      res.status(404).json({
        status: 404,
        message: '未找到要删除的评论',
        deleted_comment_id: commentId
      });
    }
  });
});



// 创建回复评论的路由
router.post('/ReplyComment/:id', (req, res) => {
  const originalCommentId = req.params.id; // 获取原始评论的 ID
  const { replyContent } = req.body; // 前端传递的回复内容

  // 准备 SQL 查询语句和参数
  const sql = 'INSERT INTO replies (original_comment_id, reply_content) VALUES (?, ?)';
  const values = [originalCommentId, replyContent];

  // 执行 SQL 查询
  pool.query(sql, values, (err, result) => {
    if (err) {
      console.error('回复评论失败:', err);
      return res.status(500).json({
        status: 500,
        message: '回复评论失败',
        error: err.message
      });
    }
    // 检查是否成功插入
    if (result.affectedRows > 0) {
      // 返回成功响应
      res.status(201).json({
        status: 201,
        message: '回复评论成功',
        reply_id: result.insertId  // 可以返回新回复的 ID 或其他信息
      });
    } else {
      res.status(500).json({
        status: 500,
        message: '回复评论失败',
        error: '未能成功插入回复'
      });
    }
  });
});


//查看回复的评论
router.get('/replies/:id', (req, res) => {
  const replayId = req.params.id;  // 获取评论ID
  // 查询数据库
  pool.query(
    'SELECT id, original_comment_id, reply_content FROM replies WHERE original_comment_id = ?',
    [replayId],
    (error, results, fields) => {
      if (error) {
        console.error('Error fetching replies from database:', error);
        return res.status(500).json({ error: 'Failed to fetch replies from database' });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'No replies found for this comment' });
      }
      
      // 返回查询结果
      res.json(results);
    }
  );
});






module.exports = router;

//   //文件下载路由
//   router.get('/download/:fileName', function(req, res) {
//     const fileName = req.params.fileName;
//     const filePath = path.join(uploadDir, fileName);

//     //检查文件是否存在
//     fs.access(filePath,fs.constants.F_OK,(err) => {
//     if (err) {
//         return res.status(404).send('文件不存在');
//     }
//     //下载文件
//     res.download(filePath);
// });
// });

