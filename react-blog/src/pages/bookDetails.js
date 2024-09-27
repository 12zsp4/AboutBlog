import React, { useState, useEffect } from 'react';
import { Modal, Rate, Form, Input, Button, message, List } from 'antd';
import axios from 'axios';

const { TextArea } = Input;

const BookDetail = ({ book, visible, onClose }) => {
  const [form] = Form.useForm(); // 使用 Form 组件的 form 实例
  const [loading, setLoading] = useState(false); // 控制提交按钮 loading 状态
  const [username, setUsername] = useState('');
  const [comments, setComments] = useState([]);
  const [replyContent, setReplyContent] = useState({});

  // 加载书籍评论
  const fetchComments = async () => {
    try {
      const response = await axios.get(`http://localhost:4000/user/comments/${book.id}`);
      console.log('书籍评论:', response.data);
      setComments(response.data.data); // 设置评论列表
    } catch (error) {
      console.error('获取书籍评论失败:', error);
    }
  };

  // 加载评论的回复，回复别人的评论
  const fetchReplies = async (commentId) => {
    try {
      const response = await axios.get(`http://localhost:4000/user/replies/${commentId}`);
      const updatedComments = comments.map(comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            showReplies: true,
            replies: response.data // 假设后端返回的数据结构为数组，包含回复内容等信息
          };
        }
        return comment;
      });
      setComments(updatedComments);
    } catch (error) {
      console.error('获取回复评论失败:', error);
      message.error('获取回复评论失败');
    }
  };

  useEffect(() => {
    // 在组件加载时从 localStorage 获取用户名
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }

    if (visible && book.id) {
      fetchComments();
    }
  }, [book.id, visible]);

  if (!book) {
    return null; // 如果书籍信息未加载完，返回空
  }

  // 提交评论的处理函数
  const onFinish = async (values) => {
    if (!username) {
      message.error('用户未登录，请先登录！');
      return;
    }

    // 构建评论对象
    const commentData = {
      username,
      rating: values.rating,
      comment: values.comment,
      bookId: book.id, // 将书籍的 ID 传递到评论数据中
    };

    try {
      setLoading(true); // 开始加载状态
      // 发送 POST 请求插入评论
      const response = await axios.post('http://localhost:4000/user/InsertComment', commentData);
        
      console.log('评论提交成功:', response.data);
      message.success('评论提交成功！');
      form.resetFields(); // 清空表单字段

      // 刷新评论列表
      fetchComments();
    } catch (error) {
      console.error('评论提交失败:', error);
      message.error('评论提交失败，请稍后再试！');
    } finally {
      setLoading(false); // 结束加载状态
    }
  };

  // 处理查看回复按钮点击事件
  const handleViewReplies = async (commentId) => {
    fetchReplies(commentId);
  };

  return (
    <Modal
      title="书籍详情"
      visible={visible}
      onCancel={onClose}
      footer={null} // 不显示默认的底部按钮
      width={800} // 设置弹框宽度
    >
      {book && (
        <div>
          <h1>{book.title}</h1>
          <p>作者: {book.author}</p>
          <p>出版日期: {book.publish_date}</p>
          <p>描述: {book.description}</p>
          <img src={`http://localhost:4000${book.bookImage}`} style={{ width: '300px', height: 'auto' }} alt={book.title} />
          <a href={`http://localhost:4000${book.bookFile}`} download>下载书籍</a>

          {/* 添加评论输入框 */}
          <Form
            form={form} // 绑定 form 实例
            name="commentForm"
            onFinish={onFinish}
            style={{ marginTop: '20px' }}
          >
            <Form.Item
              name="rating"
              label="评分"
              rules={[{ required: true, message: '请给书籍评个分吧!' }]}
            >
              <Rate allowHalf />
            </Form.Item>

            <Form.Item
              name="comment"
              label="评论"
              rules={[{ required: true, message: '请输入您的评论!' }]}
            >
              <TextArea rows={4} />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                提交评论
              </Button>
            </Form.Item>
          </Form>

          {/* 显示评论列表 */}
          <h2>评论:</h2>
          <List
            itemLayout="vertical"
            dataSource={comments}
            renderItem={item => (
              <List.Item
                actions={[
                  <Button
                    type="text"
                    onClick={() => handleViewReplies(item.id)}
                  >
                    查看回复
                  </Button>
                ]}
              >
                <p><strong>用户名:</strong> {item.username}</p>
                <p><strong>评分:</strong> <Rate disabled defaultValue={item.rating} /></p>
                <p><strong>评论时间:</strong> {item.create_time}</p>
                <p><strong>评论内容:</strong> {item.comment}</p>

                {/* 显示回复评论的区域 */}
                {item.showReplies && (
                  <div>
                    <h3>回复评论:</h3>
                    {item.replies.map(reply => (
                      <div key={reply.id}>
                        <p><strong>回复内容:</strong> {reply.reply_content}</p>
                      </div>
                    ))}
                  </div>
                )}

              </List.Item>
            )}
          />
        </div>
      )}
    </Modal>
  );
};

export default BookDetail;
