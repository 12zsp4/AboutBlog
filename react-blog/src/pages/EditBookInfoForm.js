import React from 'react';
import { Modal, Form, Input, Button } from 'antd';
import moment from 'moment';
const EditBookInfoForm = ({ visible, onCancel, onSave, initialValues }) => {
  const [form] = Form.useForm();

  const handleSave = () => {
    form
      .validateFields()
      .then(values => {
        const editedBook = {
          ...initialValues,
          ...values,
          publish_date: values.publish_date ? moment(values.publish_date).format('YYYY-MM-DD') : null
        };
        onSave(editedBook);
        form.resetFields();
      })
      .catch(error => {
        console.error('表单验证失败:', error);
      });
  };
  
  return (
    <Modal
      title="编辑书籍信息"
      visible={visible}
      onCancel={onCancel}
      footer={[
        <Button key="cancel" onClick={onCancel}>取消</Button>,
        <Button key="save" type="primary" onClick={handleSave}>保存</Button>
      ]}
    >
      <Form form={form} initialValues={initialValues}>
        <Form.Item label="书名" name="title" rules={[{ required: true, message: '请输入书名' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="作者" name="author" rules={[{ required: true, message: '请输入作者' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="价格" name="price" rules={[{ required: true, message: '请输入价格' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="出版日期" name="publish_date" rules={[{ required: true, message: '请输入出版日期' }]}>
          <Input />
        </Form.Item>
        <Form.Item label="描述" name="description">
          <Input.TextArea />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default EditBookInfoForm;
