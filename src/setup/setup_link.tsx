import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link,useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import FieldSettings from './setup_field';
import GeneralSettings from './setup_bussiness_info';

const { Sider, Content } = Layout;

function Setup_link() {
  const location = useLocation();

  return (
    <Layout style={{ minHeight: '100vh' }}>
    
      <Sider width={200} style={{ backgroundColor: '#ffffff' }}>
      <h2>환경 설정</h2>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]} // 현재 경로를 선택된 키로 설정
        >
          <Menu.Item key="/setup_bussiness_info">
            <Link to="/setup_bussiness_info">일반 설정</Link>
          </Menu.Item>
          <Menu.Item key="/setup_field">
            <Link to="/setup_field">필드 설정</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Content style={{ padding: '0 24px', minHeight: 280 }}>
          <Routes>
            <Route path="/setup_bussiness_info" element={<GeneralSettings />} />
            <Route path="/setup_field" element={<FieldSettings />} />
          </Routes>
        </Content>
      </Layout>
    </Layout>
  );
}

export default Setup_link;
