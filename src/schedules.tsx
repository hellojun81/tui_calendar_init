import React, { useCallback, useRef, useState, useEffect } from "react";
import TUICalendar from "@toast-ui/react-calendar";
import axios from 'axios';

import "tui-calendar/dist/tui-calendar.css";
import "tui-date-picker/dist/tui-date-picker.css";
import "tui-time-picker/dist/tui-time-picker.css";
import "./styles.css";

const calendars = [
  {
    id: "1",
    name: "확정",
    color: "#FFFFFF",
    bgColor: "#FF9800",
    dragBgColor: "#FF9800",
    borderColor: "#FF9800"
  },
  {
    id: "2",
    name: "문의",
    color: "#ffffff",
    bgColor: "#034E77",
    dragBgColor: "#034E77",
    borderColor: "#034E77"
  },
  {
    id: "3",
    name: "가부킹",
    color: "#ffffff",
    bgColor: "#388E3C",
    borderColor: "#388E3C"
  }
];

const Schedule = () => {
  const cal = useRef(null);
  const [schedules, setSchedules] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [currentSchedule, setCurrentSchedule] = useState(null);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newStart, setNewStart] = useState(null);
  const [newEnd, setNewEnd] = useState(null);
  const [newLocation, setNewLocation] = useState("");
  const [newState, setNewState] = useState("");
  const [newIsAllDay, setNewIsAllDay] = useState(false);
  const [newDueDateClass, setNewDueDateClass] = useState("");

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const response = await axios.get('http://localhost:3001/api/schedules');
        console.log('response.data',response.data)
        setSchedules(response.data);
      } catch (err) {
        console.error('Error fetching schedules:', err);
      }
    };
    fetchSchedules();
  }, []);

  const openModal = useCallback((mode, scheduleData = null) => {
    setModalMode(mode);
    console.log('modealMode',modalMode)
    if (mode === "edit" && scheduleData) {
      setCurrentSchedule(scheduleData);
      setNewTitle(scheduleData.title || "");
      setNewBody(scheduleData.body || "");
      setNewStart(scheduleData.start ? new Date(scheduleData.start) : null);
      setNewEnd(scheduleData.end ? new Date(scheduleData.end) : null);
      setNewLocation(scheduleData.location || "");
      setNewState(scheduleData.state || "");
      setNewIsAllDay(scheduleData.isAllDay || false);
      setNewDueDateClass(scheduleData.dueDateClass || "");
    } else {
      setCurrentSchedule(null);
      setNewTitle("");
      setNewBody("");
      setNewStart(null);
      setNewEnd(null);
      setNewLocation("");
      setNewState("");
      setNewIsAllDay(false);
      setNewDueDateClass("");
    }
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentSchedule(null);
  }, []);

  const onSaveSchedule = useCallback(async () => {
    if (!newStart || !newEnd) return;

    const schedule = {
      id: currentSchedule?.id || String(Math.random()),
      calendarId: currentSchedule?.calendarId || "1",
      title: newTitle,
      body: newBody,
      start: newStart,
      end: newEnd,
      isVisible: true,
      category: currentSchedule?.category || "time",
      isAllDay: newIsAllDay,
      location: newLocation,
      state: newState,
      dueDateClass: newDueDateClass,
    };

    try {
      if (modalMode === "edit" && currentSchedule) {
        console.log('modealMode',modalMode)
        await axios.put(`http://localhost:3001/api/schedules/${currentSchedule.id}`, schedule);
        setSchedules(schedules.map(s => (s.id === currentSchedule.id ? schedule : s)));
      } else {
        console.log('modealMode',modalMode)
        const response = await axios.post('http://localhost:3001/api/schedules', schedule);
        console.log(response.data)
        setSchedules([...schedules, response.data]);
      }
    } catch (err) {
      console.error('Error saving schedule:', err);
    }

    closeModal();
  }, [modalMode, currentSchedule, newTitle, newBody, newStart, newEnd, newLocation, newState, newIsAllDay, newDueDateClass, schedules, closeModal]);

  const onClickSchedule = useCallback(e => {
    openModal("edit", e.schedule);
  }, [openModal]);

  const onDeleteSchedule = useCallback(async () => {
    if (currentSchedule) {
      try {
        await axios.delete(`http://localhost:3001/api/schedules/${currentSchedule.id}`);
        setSchedules(schedules.filter(s => s.id !== currentSchedule.id));
      } catch (err) {
        console.error('Error deleting schedule:', err);
      }
      closeModal();
    }
  }, [currentSchedule, schedules, closeModal]);

  const onBeforeUpdateSchedule = useCallback(async e => {
    const { schedule, changes } = e;
    if (changes) {
      try {
        await axios.put(`http://localhost:3001/api/schedules/${schedule.id}`, changes);
        setSchedules(schedules.map(s => (s.id === schedule.id ? { ...s, ...changes } : s)));
      } catch (err) {
        console.error('Error updating schedule:', err);
      }
    }
  }, [schedules]);

  const onClickNextButton = () => {
    cal.current.calendarInst.next();
  };

  const onClickPrevButton = () => {
    cal.current.calendarInst.prev();
  };

  return (
    <div className="App">
      <h1>스케줄 관리</h1>
      <button onClick={onClickPrevButton}>이전 달로 이동</button>
      <button onClick={onClickNextButton}>다음 달로 이동</button>
      <TUICalendar
        ref={cal}
        height="1000px"
        view="month"
        useCreationPopup={false}
        useDetailPopup={false}
        calendars={calendars}
        schedules={schedules}
        onClickSchedule={onClickSchedule}
        onBeforeCreateSchedule={e => openModal("create", e.schedule)}
        onBeforeUpdateSchedule={onBeforeUpdateSchedule}
      />
      {isModalOpen && (
        <div className="modal">
          <div className="modal-content">
            <h2>{modalMode === "edit" ? "스케줄 수정" : "새 스케줄 추가"}</h2>
            <div className="date-time-container">
              <div className="date-time-item">
                <label>시작일:</label>
                <input
                  type="datetime-local"
                  value={newStart ? newStart.toISOString().substring(0, 16) : ""}
                  onChange={e => setNewStart(new Date(e.target.value))}
                />
              </div>
              <div className="date-time-item">
                <label>종료일:</label>
                <input
                  type="datetime-local"
                  value={newEnd ? newEnd.toISOString().substring(0, 16) : ""}
                  onChange={e => setNewEnd(new Date(e.target.value))}
                />
              </div>
            </div>
            <label>거래처명:</label>
            <input
              type="text"
              value={newState}
              onChange={e => setNewState(e.target.value)}
            />
            <label>제목:</label>
            <input
              type="text"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
            />
            <label>본문:</label>
            <textarea
              value={newBody}
              onChange={e => setNewBody(e.target.value)}
            />
            <label>대관구분:</label>
            <input
              type="text"
              value={newLocation}
              onChange={e => setNewLocation(e.target.value)}
            />
            <label>All Day:</label>
            <input
              type="checkbox"
              checked={newIsAllDay}
              onChange={e => setNewIsAllDay(e.target.checked)}
            />
            <label>Due Date Class:</label>
            <input
              type="text"
              value={newDueDateClass}
              onChange={e => setNewDueDateClass(e.target.value)}
            />
            <div className="modal-buttons">
              <button onClick={onSaveSchedule}>저장</button>
              {modalMode === "edit" && <button onClick={onDeleteSchedule}>삭제</button>}
              <button onClick={closeModal}>취소</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Schedule;
