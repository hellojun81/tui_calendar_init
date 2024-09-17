import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu as AntdMenu, Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import { useAuth } from './utils/AuthContext'; // AuthContext에서 로그인 상태 관리 훅
import './styles.css';
// import { Button, Box, Typography } from '@mui/material';


const Menu: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const location = useLocation(); // 현재 경로를 가져오기 위해 useLocation 사용
  const { isAuthenticated, logout } = useAuth(); // 로그인 여부와 로그아웃 함수 사용
  const navigate = useNavigate();

  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };
  const handleLogout = () => {
    logout(); // 로그아웃 처리
    navigate('/login'); // 로그아웃 후 로그인 페이지로 리다이렉트
  };

  // 경로에 따라 제목 설정
  const getTitle = () => {
    switch (location.pathname) {
      case '/schedules/Schedule':
        return '스케쥴 관리';
      case '/provider/provider':
        return '고객 관리';
      case '/cs/cs':
        return 'CS 관리';
      case '/estimate':
        return '견적서 관리';
      // case '/setup/setup_field':
      //   return '환경 설정';
      // case '/setup/setup_bussiness_info':
      //   return '사업 정보 설정';
      // case '/schedules/test':
      //   return '테스트';
      default:
        return 'AUBE STUDIO CRM';
    }
  };

  return (
    <div>
      <div className="header-container">
        <Button type="primary" icon={<MenuOutlined />} onClick={showDrawer} />
        <h1 className="header-title">{getTitle()}</h1>
      </div>
      <Drawer
        title="메뉴"
        placement="left"
        onClose={onClose}
        visible={visible}
      >
        <AntdMenu mode="vertical">
          <AntdMenu.Item key="1">
            <Link to="/schedules/Schedule" onClick={onClose}>스케쥴관리</Link>
          </AntdMenu.Item>
          <AntdMenu.Item key="2">
            <Link to="/provider/provider" onClick={onClose}>고객관리</Link>
          </AntdMenu.Item>
          <AntdMenu.Item key="3">
            <Link to="/cs/cs" onClick={onClose}>CS관리</Link>
          </AntdMenu.Item>
          <AntdMenu.Item key="4">
            <Link to="/estimate" onClick={onClose}>견적서관리</Link>
          </AntdMenu.Item>
          {isAuthenticated && (
            <Button onClick={handleLogout}>
              Logout
            </Button>
          )}
        </AntdMenu>
      </Drawer>
    </div>
  );
};

export default Menu;
