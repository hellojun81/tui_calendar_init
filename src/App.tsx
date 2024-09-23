import React, { useEffect } from 'react';
import { HashRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import Menu from './Menu';
import Provider from './provider/provider';
import Schedules from './schedules/Schedule';
import Cs from './cs/cs';
import Estimate from './estimate';
import Setup from './setup/setup_field';
import SetupBusinessInfo from './setup/setup_bussiness_info';
import LoginPage from './login';
import PrivateRoute from './utils/PrivateRoute';
import { AuthProvider } from './utils/AuthContext';

// 페이지 타이틀을 변경하는 컴포넌트
const usePageTitle = (title: string) => {
  useEffect(() => {
    document.title = title;
  }, [title]);
};

// 각 경로에 맞게 페이지 타이틀 설정
const PageWithTitle = ({ title, children }: { title: string; children: React.ReactNode }) => {
  usePageTitle(title);
  return <>{children}</>;
};

const App: React.FC = () => {
  return (
    <html lang="ko">
      <AuthProvider>
        <Router>
          <Menu />
          <Routes>
            <Route
              path="/login"
              element={
                <PageWithTitle title="로그인">
                  <LoginPage />
                </PageWithTitle>
              }
            />
            <Route
              path="/provider/provider"
              element={
                <PrivateRoute>
                  <PageWithTitle title="[AUBE]고객 관리">
                    <Provider />
                  </PageWithTitle>
                </PrivateRoute>
              }
            />
            <Route
              path="/schedules/Schedule"
              element={
                <PrivateRoute>
                  <PageWithTitle title="[AUBE]일정 관리">
                    <Schedules />
                  </PageWithTitle>
                </PrivateRoute>
              }
            />
            <Route
              path="/cs/cs"
              element={
                <PrivateRoute>
                  <PageWithTitle title="[AUBE]스케쥴(민원)관리">
                    <Cs />
                  </PageWithTitle>
                </PrivateRoute>
              }
            />
            <Route
              path="/estimate"
              element={
                <PrivateRoute>
                  <PageWithTitle title="[AUBE]견적 관리">
                    <Estimate />
                  </PageWithTitle>
                </PrivateRoute>
              }
            />
            <Route
              path="/setup/setup_field"
              element={
                <PrivateRoute>
                  <PageWithTitle title="[AUBE]설정">
                    <Setup />
                  </PageWithTitle>
                </PrivateRoute>
              }
            />
            <Route
              path="/setup/setup_bussiness_info"
              element={
                <PrivateRoute>
                  <PageWithTitle title="[AUBE]사업자 정보">
                    <SetupBusinessInfo />
                  </PageWithTitle>
                </PrivateRoute>
              }
            />
          </Routes>
        </Router>
      </AuthProvider>
    </html>
  );
};

export default App;
