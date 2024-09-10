import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Menu from './Menu'; // Menu 컴포넌트를 임포트
import Provider from './provider/provider';
import Schedules from './schedules/Schedule';
import Cs from './cs/cs';
import Estimate from './estimate';
import Setup from './setup/setup_field';
import SetupBusinessInfo from './setup/setup_bussiness_info';
import NewSchedule from './newSchedule';
// import Test from './schedules/test'; 

const App: React.FC = () => {
  return (
    <Router>
      <Menu />
      <Routes>
        <Route path="/provider/provider" element={<Provider />} />
        <Route path="/schedules/Schedule" element={<Schedules />} />
        <Route path="/cs/cs" element={<Cs />} />
        <Route path="/estimate" element={<Estimate />} />
        <Route path="/setup/setup_field" element={<Setup />} />
        <Route path="/setup/setup_bussiness_info" element={<SetupBusinessInfo />} />
        <Route path="/newSchedule" element={<NewSchedule />} />
        {/* <Route path="/schedules/test" element={<Test />} />  추가된 경로 */}
      </Routes>
    </Router>
  );
};

export default App;
