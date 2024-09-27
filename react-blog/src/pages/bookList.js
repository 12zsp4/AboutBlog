// BookList.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, Col, Row, Button, Input, Modal } from 'antd';
import { useParams } from 'react-router-dom';
import BookDetail from './bookDetails'; // 假设 BookDetail 组件位于相同目录下

const { Meta } = Card;

const BookList = () => {
  const { id } = useParams(); // 从路由参数中获取 id，这里假设 id 没有被使用到其他地方
  const [books, setBooks] = useState([]); // 存放书籍列表数据的状态
  const [searchTitle, setSearchTitle] = useState(''); // 搜索关键词
  const [selectedBook, setSelectedBook] = useState(null); // 当前选中的书籍
  const [isModalVisible, setIsModalVisible] = useState(false); // 控制 Modal 显示与隐藏的状态

  useEffect(() => {
    fetchData(); // 组件加载时获取数据
  }, [searchTitle]); // 当 searchTitle 变化时重新获取数据

  // 发起获取书籍列表的请求
  const fetchData = async () => {
    try {
      const response = await axios.get('http://localhost:4000/user/bookList', {
        params: {
          title: searchTitle // 添加搜索关键词参数
        }
      });
      setBooks(response.data.data); // 更新书籍列表数据
    } catch (error) {
      console.error('获取书籍列表失败:', error);
    }
  };

  // 处理搜索按钮点击事件
  const handleSearch = () => {
    axios.get(`http://localhost:4000/user/SearchBook`, {
      params: { title: searchTitle }
    })
      .then(response => {
        setBooks(response.data); // 更新书籍列表数据为搜索结果
      })
      .catch(error => {
        console.error('查询失败:', error);
      });
  };

  // 处理搜索输入框内容变化事件
  const handleSearchInputChange = (e) => {
    setSearchTitle(e.target.value); // 更新搜索关键词
  };

  // 处理点击卡片事件，显示 Modal
  const handleCardClick = (book) => {
    setSelectedBook(book); // 设置当前选中的书籍
    setIsModalVisible(true); // 显示 Modal
  };

  // 关闭 Modal
  const handleModalClose = () => {
    setIsModalVisible(false); // 隐藏 Modal
  };

  return (
    <div style={{ background: '#ECECEC', padding: '30px' }}>
      {/* 搜索框 */}
      <Input
        placeholder="输入书名搜索"
        value={searchTitle}
        onChange={handleSearchInputChange}
        style={{ marginBottom: '10px', width: '300px' }}
      />
      <Button type="primary" onClick={handleSearch} style={{ marginLeft: '10px' }}>
        搜索
      </Button>

      {/* 书籍列表 */}
      <Row gutter={16}>
        {books.map(book => (
          <Col span={8} key={book.id} onClick={() => handleCardClick(book)}>
            <Card
              style={{ height: '100%', display: 'flex', flexDirection: 'column' }}
              bodyStyle={{ flexGrow: 1 }}
            >
              <div style={{ flex: '1', display: 'flex' }}>
                <div style={{ flex: '7', padding: '10px' }}>
                  <img src={`http://localhost:4000${book.bookImage}`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={book.title} />
                </div>
                <div style={{ flex: '3', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '10px' }}>
                  <div>
                    <h3>{book.title}</h3>
                    <p>作者: {book.author}</p>
                    <p>出版日期: {book.publish_date}</p>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 显示书籍详情的 Modal */}
      {selectedBook && (
        <BookDetail
          book={selectedBook}
          visible={isModalVisible}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default BookList;
