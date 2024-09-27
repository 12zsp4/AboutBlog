import React, { useState } from 'react';
import {
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  UserOutlined,
  VideoCameraOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import { Button, Layout, Menu } from 'antd';
import { Link } from 'react-router-dom';
import RegisterForm from './register';
import LoginForm from './login';
import UserInfoTable from './userInfo';
import UploadFile from './uploadBook';
import BookList from './bookList';
import PersonalList from './personalList';

const { Header, Sider, Content } = Layout;

const AppMenu = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [currentContent, setCurrentContent] = useState('register'); // 初始显示注册组件

  const handleMenuClick = (key) => {
    setCurrentContent(key);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div className="demo-logo-vertical" />
        <Menu
          theme="dark"
          mode="inline"
          defaultSelectedKeys={['register']}
          onClick={({ key }) => handleMenuClick(key)}
        >
          <Menu.SubMenu key="sub1" icon={<UserOutlined />} title="用户管理">
            <Menu.Item key="register">
              <Link to="/api/register">注册</Link>
            </Menu.Item>
            <Menu.Item key="login">
              <Link to="/api/login">登录</Link>
            </Menu.Item>
            <Menu.Item key="userInfo">
              <Link to="/api/userInfo">个人信息</Link>
            </Menu.Item>
            <Menu.Item key="personalList">
              <Link to="/api/personalList">我的博客列表</Link>
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.SubMenu key="library" icon={<VideoCameraOutlined />} title="图书馆">
          <Menu.Item key="uploadBook">
              <Link to="/api/uploadBook">发布博客</Link>
            </Menu.Item>
            <Menu.Item key="bookList">
              <Link to="/api/bookList">博客列表</Link>
            </Menu.Item>
            <Menu.Item key="viewComments">
              <Link to="/api/viewComments">查看评论</Link>
            </Menu.Item>
          </Menu.SubMenu>
          <Menu.Item key="events" icon={<UploadOutlined />}>
            Events
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout className="site-layout">
        <Header
          className="site-layout-background"
          style={{
            padding: '0 24px',
            background: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div
            style={{
              color: 'black',
              fontWeight: 'bold',
              fontSize: '18px',
              padding: '8px',
            }}
          >
            欢迎来到图书分享博客系统
          </div>
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            style={{
              fontSize: '16px',
              width: 64,
              height: 64,
              color: 'white',
            }}
          />
        </Header>
        <Content
          className="site-layout-background"
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
          }}
        >
          {currentContent === 'register' && <RegisterForm />}
          {currentContent === 'login' && <LoginForm />}
          {currentContent === 'userInfo' && <UserInfoTable />}
          {currentContent === 'uploadBook' && <UploadFile />}
          {currentContent === 'bookList' && <BookList />}
          {currentContent === 'personalList' && <PersonalList />}
          {currentContent === 'events' && <div>Events 页面</div>}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AppMenu;
