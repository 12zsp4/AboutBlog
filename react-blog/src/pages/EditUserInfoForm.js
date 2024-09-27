import React, { useState } from 'react';
import { Modal, Form, Input, DatePicker, Button, message } from 'antd';
import axios from 'axios';
import moment from 'moment';

const EditUserInfoForm = ({ visible, onCancel, initialValues, fetchData }) => {
  const [form] = Form.useForm();

  // 处理表单提交
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('token');

      // 将生日字段转换为 ISO 格式的字符串
      values.birthday = moment(values.birthday).format('YYYY-MM-DD');

      // 发送更新请求到后端
      await axios.put('http://localhost:4000/user/update', values, {
        headers: {
          Authorization: token,
        },
      });

      message.success('用户信息更新成功');
      onCancel();
      fetchData(); // 重新加载用户信息
    } catch (error) {
      console.error('更新用户信息失败:', error.message);
      message.error('更新用户信息失败，请稍后重试');
    }
  };

  // 表单布局
  const formLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 16 },
  };

  return (
    <Modal
      title="编辑用户信息"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          取消
        </Button>,
        <Button key="submit" type="primary" onClick={handleOk}>
          确定
        </Button>,
      ]}
    >
      <Form
        form={form}
        {...formLayout}
        initialValues={{
          ...initialValues,
          birthday: moment(initialValues.birthday), // 将日期值初始化为 moment 对象
        }}
        onFinish={handleOk}
      >
        <Form.Item
          name="username"
          label="用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
        >
          <Input disabled />
        </Form.Item>
        <Form.Item
          name="gender"
          label="性别"
          rules={[{ required: true, message: '请输入性别' }]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          name="birthday"
          label="生日"
          rules={[{ required: true, message: '请选择生日' }]}
        >
          <DatePicker format="YYYY-MM-DD" />
        </Form.Item>
        <Form.Item
          name="phone"
          label="电话"
          rules={[{ required: true, message: '请输入电话号码' }]}
        >
          <Input />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditUserInfoForm;
