import React, { useState, useEffect } from 'react';
import { Card, Col, Row, Input, Button, Modal, Pagination } from 'antd';
import { DeleteOutlined, PlusOutlined, EditOutlined, EyeOutlined } from '@ant-design/icons';
import EditBookInfoForm from './EditBookInfoForm';
import UploadFile from './uploadBook';
import BookDetailsModal from './BookDetailsModal'; // 引入书籍详情模态框组件
import axios from 'axios';

const { Meta } = Card;

const PersonalList = () => {
  const [books, setBooks] = useState([]);
  const [searchTitle, setSearchTitle] = useState('');
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [deleteBookId, setDeleteBookId] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [uploadVisible, setUploadVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(6);
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [userId, setUserId] = useState(null); // 用户ID状态
  const [viewModalVisible, setViewModalVisible] = useState(false); // 控制书籍详情模态框显示状态

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      setUserId(decodedToken.userId); // 从token中获取用户ID
    }

    fetchBooks();
  }, [userId]); // 当 userId 变化时重新获取书籍列表

  // 获取个人列表书籍
  const fetchBooks = () => {
    axios.get(`http://localhost:4000/user/personalList/${userId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        setBooks(response.data.data);
      })
      .catch(error => {
        console.error('获取书籍列表失败:', error);
      });
  };

  // 查询书籍
  const handleSearch = () => {
    axios.get(`http://localhost:4000/user/SearchBook`, {
      params: { title: searchTitle }
    })
      .then(response => {
        setBooks(response.data);
      })
      .catch(error => {
        console.error('查询失败:', error);
      });
  };
  // 当输入框的值为空时，立即获取所有书籍列表
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchTitle(value);
    
    if (value === '') {
      fetchBooks();
    }
  };

  const handleDelete = (id) => {
    setDeleteBookId(id);
    setDeleteModalVisible(true);
  };

    //删除书籍
  const confirmDelete = () => {
    axios.delete(`http://localhost:4000/user/DeleteBook/${deleteBookId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        setDeleteModalVisible(false);
        fetchBooks();
      })
      .catch(error => {
        console.error('删除失败:', error);
        setDeleteModalVisible(false);
      });
  };

  const cancelDelete = () => {
    setDeleteModalVisible(false);
  };

  const handleEdit = (book) => {
    setSelectedBook(book);
    setEditModalVisible(true);
  };
  
  //更新书籍
  const handleSaveEdit = (updatedBook) => {
    axios.put(`http://localhost:4000/user/UpdateBook/${updatedBook.id}`, updatedBook, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    })
      .then(response => {
        setEditModalVisible(false);
        fetchBooks();
      })
      .catch(error => {
        console.error('保存编辑后的书籍信息失败:', error);
      });
  };

  const handleEditModalCancel = () => {
    setEditModalVisible(false);
  };

  const handleAdd = () => {
    setAddModalVisible(true);
  };

  const handleAddModalCancel = () => {
    setAddModalVisible(false);
  };

  const handleAddModalOk = () => {
    fetchBooks(); // 添加书籍后刷新列表
    setAddModalVisible(false); // 关闭弹窗
  };

  const handleView = (book) => {
    setSelectedBook(book); // 设置选中的书籍对象
    setViewModalVisible(true); // 显示书籍详情模态框
  };
      
  //日期格式
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };

  const indexOfLastBook = currentPage * pageSize;
  const indexOfFirstBook = indexOfLastBook - pageSize;
  const currentBooks = books.slice(indexOfFirstBook, indexOfLastBook);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  return (
    <div style={{ background: '#ECECEC', padding: '30px' }}>
      <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center' }}>
        <Input
          placeholder="输入书名进行查询"
          value={searchTitle}
          onChange={handleSearchInputChange}
          style={{ marginRight: '10px', width: '300px' }}
        />
        <Button type="primary" onClick={handleSearch}>
          查询
        </Button>
      </div>
      <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd} style={{ marginBottom: '20px', float: 'right' }}>
        添加书籍
      </Button>

      <Modal
        title="添加书籍"
        visible={addModalVisible}
        onCancel={handleAddModalCancel}
        onOk={handleAddModalOk}
        destroyOnClose
      >
        <UploadFile />
      </Modal>

      <Row gutter={16}>
        {currentBooks.map(book => (
          <Col span={8} key={book.id}>
            <Card style={{ height: '350px', marginBottom: '20px', position: 'relative' }}>
              <div style={{ display: 'flex' }}>
                <div style={{ flex: '7' }}>
                  <img src={`http://localhost:4000${book.bookImage}`} style={{ width: '100%', height: 'auto' }} />
                </div>
                <div style={{ flex: '3', paddingLeft: '10px', display: 'flex', flexDirection: 'column' }}>
                  <h3>{book.title}</h3>
                  <p>作者: {book.author}</p>
                  <p style={{ marginTop: 'auto' }}>出版日期: {formatDate(book.publish_date)}</p>
                  <div style={{ marginTop: 'auto', display: 'flex', justifyContent: 'space-between' }}>
                    <Button
                      type="danger"
                      icon={<DeleteOutlined />}
                      onClick={() => handleDelete(book.id)}
                    >
                      删除
                    </Button>
                    <Button
                      type="primary"
                      icon={<EditOutlined />}
                      onClick={() => handleEdit(book)}
                    >
                      修改
                    </Button>
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', justifyContent: 'center' }}>
                    <Button
                      type="primary"
                      icon={<EyeOutlined />}
                      onClick={() => handleView(book)} // 点击查看按钮触发显示书籍详情模态框
                      block
                    >
                      查看
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 编辑书籍信息的表单 */}
      <EditBookInfoForm
        visible={editModalVisible}
        onCancel={handleEditModalCancel}
        onSave={handleSaveEdit}
        initialValues={selectedBook}
      />

      {/* 确认删除书籍的模态框 */}
      <Modal
        title="确认删除"
        visible={deleteModalVisible}
        onOk={confirmDelete}
        onCancel={cancelDelete}
      >
        <p>确定要删除这本书吗？</p>
      </Modal>

      {/* 分页器 */}
      <Pagination
        current={currentPage}
        pageSize={pageSize}
        total={books.length}
        onChange={handlePageChange}
        style={{ marginTop: '20px', textAlign: 'center' }}
      />

      {/* 书籍详情模态框 */}
      <BookDetailsModal
        visible={viewModalVisible}
        onClose={() => setViewModalVisible(false)}
        bookId={selectedBook ? selectedBook.id : null} // 传入选中书籍的ID
      />
    </div>
  );
};

export default PersonalList;
