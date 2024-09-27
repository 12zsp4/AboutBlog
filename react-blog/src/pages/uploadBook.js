import React from 'react';
import axios from 'axios';
import { Form, Input, DatePicker, Button, Upload, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

const UploadFile = () => {
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const formData = new FormData();
    formData.append('file', values.bookImage[0].originFileObj); // 注意这里使用 'file' 作为字段名
    formData.append('file', values.bookFile[0].originFileObj); // 注意这里使用 'file' 作为字段名
    formData.append('title', values.title);
    formData.append('author', values.author);
    formData.append('price', values.price);
    formData.append('publish_date', values.publish_date.format('YYYY-MM-DD'));
    formData.append('description', values.description);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        throw new Error('用户未认证');
      }

      const decodedToken = JSON.parse(atob(token.split('.')[1]));
      const userId = decodedToken.userId;
      console.log("==============================",userId);

      const response = await axios.post('http://localhost:4000/user/uploadBook', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: token
        },
        params: {
          userId: userId
        }
      });

      if (response.status === 200) {
        message.success('文件上传成功');
        form.resetFields();
      } else {
        message.error('文件上传失败');
      }
    } catch (error) {
      console.error('上传异常:', error.message);
      message.error('文件上传异常');
    }
  };

  const normFile = (e) => {
    if (Array.isArray(e)) {
      return e;
    }
    return e && e.fileList;
  };

  return (
    <Form form={form} onFinish={onFinish}>
      <Form.Item
        name="bookImage"
        label="书籍封面"
        valuePropName="fileList"
        getValueFromEvent={normFile}
        rules={[{ required: true, message: '请上传书籍封面' }]}
      >
        <Upload name="file" listType="picture">
          <Button icon={<UploadOutlined />}>上传</Button>
        </Upload>
      </Form.Item>
      <Form.Item
        name="bookFile"
        label="书籍文件"
        valuePropName="fileList"
        getValueFromEvent={normFile}
        rules={[{ required: true, message: '请上传书籍文件' }]}
      >
        <Upload name="file" listType="text">
          <Button icon={<UploadOutlined />}>上传</Button>
        </Upload>
      </Form.Item>
      <Form.Item
        name="title"
        label="书名"
        rules={[{ required: true, message: '请输入书名' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="author"
        label="作者"
        rules={[{ required: true, message: '请输入作者' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="price"
        label="价格"
        rules={[{ required: true, message: '请输入价格' }]}
      >
        <Input />
      </Form.Item>
      <Form.Item
        name="publish_date"
        label="出版日期"
        rules={[{ required: true, message: '请选择出版日期' }]}
      >
        <DatePicker format="YYYY-MM-DD" />
      </Form.Item>
      <Form.Item
        name="description"
        label="描述"
        rules={[{ required: true, message: '请输入描述' }]}
      >
        <Input.TextArea />
      </Form.Item>
      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};

export default UploadFile;
