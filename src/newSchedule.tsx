import React, { useCallback, useRef, useState } from "react";
import TUICalendar from "@toast-ui/react-calendar";
import { ISchedule, ICalendarInfo } from "tui-calendar";

import "tui-calendar/dist/tui-calendar.css";
import "tui-date-picker/dist/tui-date-picker.css";
import "tui-time-picker/dist/tui-time-picker.css";

import "./styles.css";

const start = new Date();
const end = new Date(new Date().setMinutes(start.getMinutes() + 30));
const schedules: ISchedule[] = [
  {
    calendarId: "1",
    category: "allday",
    isVisible: true,
    title: "Launch - Sentinel-6",
    id: "1",
    body: "Test",
    start,
    end,
  },
  {
    calendarId: "2",
    category: "allday",
    isVisible: true,
    title: "Static Fire - NROL-64",
    id: "2",
    body: "Description",
    start: new Date(new Date().setHours(start.getHours() + 1)),
    end: new Date(new Date().setHours(start.getHours() + 2)),
  },
  // 나머지 스케줄들...
];

const calendars: ICalendarInfo[] = [
  {
    id: "1",
    name: "Sentinel-6",
    color: "#FFFFFF",
    bgColor: "#FF9800",
    dragBgColor: "#FF9800",
    borderColor: "#FF9800",
  },
  {
    id: "2",
    name: "NROL-64",
    color: "#ffffff",
    bgColor: "#034E77",
    dragBgColor: "#034E77",
    borderColor: "#034E77",
  },
  // 나머지 캘린더들...
];

function App() {
  const cal = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState(null);

  const openModal = (schedule, range = null) => {
    setSelectedSchedule(schedule);
    setSelectedDateRange(range);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedSchedule(null);  // 선택된 스케줄 초기화
    setSelectedDateRange(null);  // 선택된 날짜 초기화
  };

  const onClickSchedule = useCallback((e) => {
    openModal(e.schedule);
  }, []);

  const onBeforeCreateSchedule = useCallback((scheduleData) => {
    // 날짜가 선택된 경우 해당 날짜 정보로 모달 열기
    openModal({
      ...scheduleData,
      title: "",  // 새 스케줄의 기본 타이틀 초기화
    },{
      start: scheduleData.start,
      end: scheduleData.end
    });
    cal.current.calendarInst.createSchedules([scheduleData]);
  }, []);

  const onBeforeUpdateSchedule = useCallback((e) => {
    openModal(e.schedule);
  }, []);

  const handleModalSave = () => {
    // 이곳에서 선택된 날짜나 스케줄 데이터를 저장하는 로직을 추가
    closeModal(); // 저장 후 모달 닫기
  };

  return (
    <div className="App">
      <h1>PlanIt</h1>

      <TUICalendar
        ref={cal}
        height="1000px"
        view="month"
        useCreationPopup={false}  // 기본 팝업 비활성화
        useDetailPopup={false}    // 기본 팝업 비활성화
        calendars={calendars}
        schedules={schedules}
        onClickSchedule={onClickSchedule}
        onBeforeCreateSchedule={onBeforeCreateSchedule}
        onBeforeUpdateSchedule={onBeforeUpdateSchedule}
      />

      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>스케줄 정보</h2>
            {selectedSchedule && (
              <>
                <p>제목: {selectedSchedule.title}</p>
                <p>시작 시간: {selectedSchedule.start.toString()}</p>
                <p>종료 시간: {selectedSchedule.end.toString()}</p>
              </>
            )}
            {selectedDateRange && (
              <>
                <p>선택된 시작 날짜: {selectedDateRange.start.toString()}</p>
                <p>선택된 종료 날짜: {selectedDateRange.end.toString()}</p>
              </>
            )}
            <button onClick={handleModalSave}>저장</button>
            <button onClick={closeModal}>닫기</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
