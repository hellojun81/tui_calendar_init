import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Route, Routes } from 'react-router-dom';
import Menu from './Menu'; // Menu 컴포넌트를 임포트
import Provider from './provider/provider';
import Schedules from './schedules/Schedule';
import Cs from './cs/cs';
import Estimate from './estimate';
import Setup from './setup/setup_field';
import SetupBusinessInfo from './setup/setup_bussiness_info';
import LoginPage from './login';
import PrivateRoute from './utils/PrivateRoute'; // 보호된 경로 컴포넌트
import { AuthProvider } from './utils/AuthContext'; // 로그인 상태를 관리하는 AuthProvider


// import Test from './schedules/test'; 

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);


  return (
    <html lang="ko">
    <AuthProvider>
    <Router>
      <Menu />
      <Routes>
      <Route path="/login" element={<LoginPage />} />

        <Route path="/provider/provider" element={<PrivateRoute><Provider /></PrivateRoute>} />
        <Route path="/schedules/Schedule" element={<PrivateRoute><Schedules /></PrivateRoute>} />
        <Route path="/cs/cs" element={<PrivateRoute><Cs /></PrivateRoute>} />
        <Route path="/estimate" element={<PrivateRoute><Estimate /></PrivateRoute>} />
        <Route path="/setup/setup_field" element={<PrivateRoute><Setup /></PrivateRoute>} />
        <Route path="/setup/setup_bussiness_info" element={<PrivateRoute><SetupBusinessInfo /></PrivateRoute>} />
      </Routes>
    </Router>
    </AuthProvider>
    </html>
  );
};

export default App;
