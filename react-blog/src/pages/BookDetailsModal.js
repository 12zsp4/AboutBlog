import React, { useEffect, useState, useCallback } from 'react';
import { Modal, List, Rate, Button, message } from 'antd';
import { DeleteOutlined, MessageOutlined } from '@ant-design/icons';
import axios from 'axios';

const BookDetailsModal = ({ bookId, visible, onClose }) => {
  const [book, setBook] = useState(null);
  const [comments, setComments] = useState([]);
  const [replyContent, setReplyContent] = useState({});
  const [replyLoading, setReplyLoading] = useState({});
  const [currentUser, setCurrentUser] = useState('');
  const [replies, setReplies] = useState({}); // 新增状态用于存储回复评论

  useEffect(() => {
    // 从 localStorage 获取当前用户的用户名
    const username = localStorage.getItem('username');
    if (username) {
      setCurrentUser(username);
    }
  }, []);
       //获取评论，对应书籍
  const fetchComments = useCallback(async () => {
    try {
      const response = await axios.get(`http://localhost:4000/user/comments/${bookId}`);
      setComments(response.data.data);
    } catch (error) {
      console.error('获取书籍评论失败:', error);
    }
  }, [bookId]);


  //获取书籍详情
  useEffect(() => {
    const fetchBookDetails = async () => {
      try {
        const response = await axios.get(`http://localhost:4000/user/Search/${bookId}`);
        setBook(response.data.data);
      } catch (error) {
        console.error('获取书籍详情失败:', error);
      }
    };

    if (visible && bookId) {
      fetchBookDetails();
      fetchComments();
    }
  }, [bookId, visible, fetchComments]);
 
   //删除评论
  const handleDeleteComment = async (commentId) => {
    try {
      const response = await axios.delete(`http://localhost:4000/user/DeleteComment/${commentId}`);
      if (response.status === 200) {
        message.success('评论删除成功');
        fetchComments();
      } else {
        message.error('评论删除失败');
      }
    } catch (error) {
      console.error('删除评论失败:', error);
      message.error('评论删除失败');
    }
  };
     
  //回复评论的评论
  const fetchReplies = useCallback(async (commentId) => {
    try {
      const response = await axios.get(`http://localhost:4000/user/replies/${commentId}`);
      setReplies({ ...replies, [commentId]: response.data }); // 将回复存储在状态中
    } catch (error) {
      console.error(`获取评论 ${commentId} 的回复失败:`, error);
      message.error('获取评论回复失败');
    }
  }, [replies]);



        //回复评论
  const handleReplyComment = async (originalCommentId) => {
    try {
      setReplyLoading({ ...replyLoading, [originalCommentId]: true });
 
      const response = await axios.post(`http://localhost:4000/user/ReplyComment/${originalCommentId}`, {
        replyContent: `${replyContent[originalCommentId]} `,
        username: currentUser, // 将当前用户的用户名传递到后端
      });

      if (response.status === 201) {
        message.success('回复评论成功');
        setReplyContent({ ...replyContent, [originalCommentId]: '' });
        fetchComments();
      } else {
        message.error('回复评论失败');
      }
    } catch (error) {
      console.error('回复评论失败:', error);
      message.error('回复评论失败');
    } finally {
      setReplyLoading({ ...replyLoading, [originalCommentId]: false });
    }
  };

  if (!book) {
    return null;
  }

  return (
    <Modal
      title="书籍详情"
      visible={visible}
      onCancel={onClose}
      footer={null}
      width={800}
    >
      <div>
        <h1>{book.title}</h1>
        <p>作者: {book.author}</p>
        <p>出版日期: {book.publish_date}</p>
        <p>描述: {book.description}</p>
        <img
          src={`http://localhost:4000${book.bookImage}`}
          style={{ width: '300px', height: 'auto' }}
          alt={book.title}
        />
        <a href={`http://localhost:4000${book.bookFile}`} download>
          下载书籍
        </a>
        
        <h2>评论:</h2>
        <List
          itemLayout="vertical"
          dataSource={comments}
          renderItem={item => (
            <List.Item
              key={item.id}
              actions={[
                <Button
                  type="text"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={() => handleDeleteComment(item.id)}
                />,
                <Button
                  type="text"
                  icon={<MessageOutlined />}
                  onClick={() => {
                    setReplyContent({
                      ...replyContent,
                      [item.id]: replyContent[item.id] ? '' : `${currentUser} 回复 ${item.username}: `,
                    });
                     fetchReplies(item.id); // 获取评论的回复
                  }}
                  loading={replyLoading[item.id]}
                >
                  查看回复
                </Button>
              ]}
            >
              <p><strong>用户名:</strong> {item.username}</p>
              <p><strong>评分:</strong> <Rate disabled defaultValue={item.rating} /></p>
              <p><strong>评论时间:</strong> {item.create_time}</p>
              <p><strong>评论内容:</strong> {item.comment}</p>

              {replyContent[item.id] && (
                <div style={{ marginBottom: '10px', marginTop: '10px' }}>
                  <textarea
                    rows={4}
                    style={{ width: '100%', marginBottom: '10px' }}
                    value={replyContent[item.id]}
                    onChange={(e) => setReplyContent({ ...replyContent, [item.id]: e.target.value })}
                  />
                  <Button
                    type="primary"
                    onClick={() => handleReplyComment(item.id)}
                  >
                    提交回复
                  </Button>
                </div>
              )}

              {replies[item.id] && (
                <div>
                  <h3>回复评论:</h3>
                  <List
                    itemLayout="vertical"
                    dataSource={replies[item.id]}
                    renderItem={reply => (
                      <List.Item key={reply.id}>
                        <p><strong>回复内容:</strong> {reply.reply_content}</p>
                      </List.Item>
                    )}
                  />
                </div>
              )}

            </List.Item>
          )}
        />
      </div>
    </Modal>
  );
};

export default BookDetailsModal;
