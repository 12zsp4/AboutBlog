import React, { useState, useEffect } from 'react';
import { Table, Button, message } from 'antd';
import axios from 'axios';
import EditUserInfoForm from './EditUserInfoForm'; // 假设 EditUserInfoForm 组件的路径正确
const UserInfoTable = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [editingUser, setEditingUser] = useState(null); // 用于存储当前编辑的用户信息

  // 定义 fetchData 函数在 useEffect 之外
  const fetchData = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:4000/user/userInfo', {
        headers: {
          Authorization: token, // 将 token 放在请求头的 Authorization 中
        },
      });
      setUserInfo(response.data); // 设置用户信息为从后端获取的数据
    } catch (error) {
      console.error('获取用户信息失败:', error.message);
      message.error('获取用户信息失败，请稍后重试');
    }
  };

  // 使用 useEffect 获取后端数据
  useEffect(() => {
    fetchData(); // 调用 fetchData 函数
  }, []); // 在组件加载时仅执行一次

  // 如果 userInfo 为 null 或 undefined，显示加载中或其他状态
  if (!userInfo) {
    return <div>Loading...</div>;
  }

  // 表格列配置
  const columns = [
    {
      title: '账号',
      dataIndex: 'username',
      key: 'username',
    },
    {
      title: '性别',
      dataIndex: 'gender',
      key: 'gender',
    },
    {
      title: '生日',
      dataIndex: 'birthday',
      key: 'birthday',
    },
    {
      title: '电话',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Button type="link" onClick={() => handleEdit(record)}>
          修改
        </Button>
      ),
    },
  ];

  // 处理编辑按钮点击事件
  const handleEdit = (record) => {
    setEditingUser(record); // 将选定的用户信息设置为当前编辑用户
  };

  return (
    <>
      <Table dataSource={[userInfo]} columns={columns} />

      {/* 当 editingUser 不为 null 时，渲染 EditUserInfoForm 组件 */}
      {editingUser && (
        <EditUserInfoForm
          visible
          initialValues={editingUser} // 将选定的用户信息传递给 EditUserInfoForm 组件
          onCancel={() => setEditingUser(null)} // 取消编辑时清空 editingUser 状态
          fetchData={fetchData} // 传递重新加载数据的函数给 EditUserInfoForm 组件
        />
      )}
    </>
  );
};

export default UserInfoTable;
