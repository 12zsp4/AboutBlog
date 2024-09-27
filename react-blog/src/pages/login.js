import React from 'react';
import { Form, Input, Button, Checkbox, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // 导入具名导出 jwtDecode

const LoginForm = () => {
  const onFinish = async (values) => {
    try {
      const response = await axios.post('http://localhost:4000/user/login', values);

      if (response.status === 200) {
        const { message: msg, token } = response.data;
        message.success(msg);
        
        // 解码 token 获取用户信息
        const decodedToken = jwtDecode(token);
        const { username } = decodedToken;

        // 将 token 和 username 存储到 localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('username', username);
        console.log("==================",username)

        // 示例：登录成功后跳转到用户主页或其他页面
        //window.location.href = '/api/userInfo'; // 替换为实际的跳转路径

      } else {
        message.error('登录失败，请稍后重试');
      }
    } catch (error) {
      console.error('登录失败:', error.message);
      message.error('登录失败，请稍后重试');
    }
  };

  return (
    <Form
      name="normal_login"
      className="login-form"
      initialValues={{ remember: true }}
      onFinish={onFinish}
    >
      <Form.Item
        name="username"
        rules={[{ required: true, message: '请输入用户名!' }]}
      >
        <Input
          prefix={<UserOutlined className="site-form-item-icon" />}
          placeholder="用户名"
        />
      </Form.Item>
      <Form.Item
        name="password"
        rules={[{ required: true, message: '请输入密码!' }]}
      >
        <Input
          prefix={<LockOutlined className="site-form-item-icon" />}
          type="password"
          placeholder="密码"
        />
      </Form.Item>
      <Form.Item>
        <Form.Item name="remember" valuePropName="checked" noStyle>
          <Checkbox>记住我</Checkbox>
        </Form.Item>

        <a className="login-form-forgot" href="/">
          忘记密码
        </a>
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit" className="login-form-button">
          登录
        </Button>
        <a href="/api/register">立即注册</a>
      </Form.Item>
    </Form>
  );
};

export default LoginForm;
