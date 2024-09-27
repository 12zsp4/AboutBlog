const mysql = require('mysql');

// 创建MySQL数据库连接池
const pool = mysql.createPool({
    host: 'localhost', // MySQL主机名
    user: 'root', // MySQL用户名
    password: '123456', // MySQL密码
    database: 'blog' // 使用的数据库名称
});

// 在连接池中获取连接
pool.getConnection((err, connection) => {
    if (err) {
        console.error('Error connecting to database:', err);
        throw err;
    }
    console.log('连接数据库成功！');
    // 在这里可以执行数据库操作
    // 例如：connection.query('SELECT * FROM table', (error, results, fields) => { /* ... */ });
    // 释放连接
    //connection.release();
});

module.exports = pool;
