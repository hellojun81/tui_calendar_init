import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import { Menu, Drawer, Button } from 'antd';
import { MenuOutlined } from '@ant-design/icons';
import Provier from './provider';
import Schedules from './schedules';
import Cs from './cs';
import Estimate from './estimate';
import Setup from './setup_field';
// import Setup_bussiness_info from './setup_bussiness_info';





function App() {
  const [visible, setVisible] = useState(false);
  const showDrawer = () => {
    setVisible(true);
  };

  const onClose = () => {
    setVisible(false);
  };

  return (
    <Router>
      <div>
        <Button type="primary" icon={<MenuOutlined />} onClick={showDrawer} />
        <Drawer
          title="메뉴"
          placement="left"
          onClose={onClose}
          visible={visible}
        >
          <Menu mode="vertical">
            <Menu.Item key="1">
              <Link to="/schedules" onClick={onClose}>스케쥴관리</Link>
            </Menu.Item>
            <Menu.Item key="2">
              <Link to="/provider" onClick={onClose}>거래처관리</Link>
            </Menu.Item>
            <Menu.Item key="3">
              <Link to="/cs" onClick={onClose}>CS관리</Link>
            </Menu.Item>
            <Menu.Item key="4">
              <Link to="/estimate" onClick={onClose}>견적서관리</Link>
            </Menu.Item>
            <Menu.Item key="5">
              <Link to="/setup_field" onClick={onClose}>환경설정</Link>
            </Menu.Item> 
            {/*<Menu.Item key="6">
              <Link to="/setup_bussiness_info" onClick={onClose}>환경설정일반</Link>
            </Menu.Item>  */}
          </Menu>
        </Drawer>

        <Routes>
          <Route path="/provider" element={<Provier />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/cs" element={<Cs />} />
         <Route path="/estimate" element={<Estimate />} />
         <Route path="/setup_field" element={<Setup />} />
          {/* <Route path="/setup_bussiness_info" element={<Setup_bussiness_info />} />  */} */}
        </Routes>
      </div>
    </Router>
  );
}

export default App;
