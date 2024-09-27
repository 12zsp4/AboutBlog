import React from 'react';
import { Form, Input, Button, DatePicker, Radio, message } from 'antd';
import { UserOutlined, LockOutlined, PhoneOutlined } from '@ant-design/icons';
import axios from 'axios';


const RegisterForm = () => {
  const onFinish = async (values) => {
     // 只取生日的日期部分，不包含时间
  values.birthday = values.birthday.format('YYYY-MM-DD');
    try {
      const response = await axios.post('http://localhost:4000/user/register', values);
      console.log("================",values);
      if (response.data.success) {
        message.success(response.data.message);
        // 注册成功后重定向到登录页面
        window.location.replace('/api/login'); // 跳转到用户主页
       // window.location.href = '/api/login';
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      console.error('注册失败:', error.message);
      message.error('注册失败，请稍后重试！');
    }
  };

  const validateEmail = (rule, value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value || emailRegex.test(value)) {
      return Promise.resolve();
    }
    return Promise.reject('请输入有效的邮箱地址！');
  };

  return (
    <Form
      name="register"
      onFinish={onFinish}
      scrollToFirstError
      labelCol={{ span: 6 }}
      wrapperCol={{ span: 12 }}
    >
      <Form.Item
        name="username"  // 修改为 'username' 来匹配后端
        label="账号"
        rules={[
          { required: true, message: '请输入账号！' },
          { validator: validateEmail },
        ]}
      >
        <Input prefix={<UserOutlined />} placeholder="请输入邮箱账号" />
      </Form.Item>

      <Form.Item
        name="password"
        label="密码"
        rules={[{ required: true, message: '请输入密码！' }]}
      >
        <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
      </Form.Item>

      <Form.Item
        name="gender"
        label="性别"
        rules={[{ required: true, message: '请选择性别！' }]}
      >
        <Radio.Group>
          <Radio value="male">男</Radio>
          <Radio value="female">女</Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item
        name="birthday"
        label="生日"
        rules={[{ required: true, message: '请选择生日！' }]}
      >
        <DatePicker style={{ width: '100%' }} picker="date" />
      </Form.Item>

      <Form.Item
        name="phone"
        label="电话"
        rules={[{ required: true, message: '请输入电话号码！' }]}
      >
        <Input prefix={<PhoneOutlined />} placeholder="请输入电话号码" />
      </Form.Item>

      <Form.Item wrapperCol={{ offset: 6, span: 12 }}>
        <Button type="primary" htmlType="submit">
          注册
        </Button>
      </Form.Item>
    </Form>
  );
};

export default RegisterForm;
