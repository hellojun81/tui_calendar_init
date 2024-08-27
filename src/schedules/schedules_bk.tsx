import React, { useCallback, useRef, useState, useEffect } from "react";
import { render } from "react-dom";
import TUICalendar from "@toast-ui/react-calendar";
import { ISchedule, ICalendarInfo } from "tui-calendar";
import JexcelModal from "./JexcelModal"; // 새로 만든 JexcelModal 컴포넌트를 불러옵니다.
import axios from 'axios';

import "tui-calendar/dist/tui-calendar.css";
import "tui-date-picker/dist/tui-date-picker.css";
import "tui-time-picker/dist/tui-time-picker.css";
import "./styles.css";



const Schedule = () => {
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const cal = useRef<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [isJexcelModalOpen, setIsJexcelModalOpen] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<ISchedule | null>(null);
  const [newTitle, setNewTitle] = useState("");
  const [newBody, setNewBody] = useState("");
  const [newStart, setNewStart] = useState<Date | null>(null);
  const [newEnd, setNewEnd] = useState<Date | null>(null);
  const [newLocation, setNewLocation] = useState("");
  const [newState, setNewState] = useState("");
  const [newIsAllDay, setNewIsAllDay] = useState(false);
  const [newDueDateClass, setNewDueDateClass] = useState("");
  const [newproviderName, setNewproviderName] = useState("");
  const [selectedDateElement, setSelectedDateElement] = useState<HTMLElement | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [response, setResponse] = useState<string | null>(null);
  const handleStateKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      setIsJexcelModalOpen(true);
    }
  }, []);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };


  const apitest = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/schedules`); // Node.js 서버의 GET 엔드포인트
  
      // res.data가 단일 객체라면 배열로 감싸서 처리
      const arr: ISchedule[] = Array.isArray(res.data) ? res.data : [res.data];
  
      setSchedules((prevSchedules) => [...prevSchedules, ...arr]);
  
    } catch (err) {
      setResponse('Error submitting data');
    }
  };
  

  useEffect(() => {
    apitest(); // 컴포넌트가 처음 마운트될 때만 호출
  }, []); // 빈 배열을 전달하면, 마운트 시 한 번만 실행됨

  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
    };
  }, [isModalOpen]);

  const openModal = useCallback(
    (mode: "create" | "edit", scheduleData: ISchedule | null = null) => {
      setModalMode(mode);
  
      let strDate: Date | null = null;
      let endDate: Date | null = null;
  
      if (scheduleData) {
        strDate = scheduleData.start ? new Date(scheduleData.start as string | number | Date) : null;
        endDate = scheduleData.end ? new Date(scheduleData.end as string | number | Date) : null;
      }
  
      if (mode === "edit" && scheduleData) {
        setCurrentSchedule(scheduleData);
        setNewTitle(scheduleData.title2 || "");
        setNewBody(scheduleData.body || "");
        setNewStart(strDate);
        setNewEnd(endDate);
        setNewLocation(scheduleData.location || "");
        setNewIsAllDay(scheduleData.isAllDay || false);
        setNewDueDateClass(scheduleData.dueDateClass || "");
        setNewproviderName(scheduleData.proname || "");
      } else {
        setNewTitle("");
        setNewBody("");
        setNewStart(null);
        setNewEnd(null);
        setNewLocation("");
        setNewState("");
        setNewIsAllDay(false);
        setNewDueDateClass("");
        setNewproviderName("");
      }
      setIsModalOpen(true);
    },
    []
  );
  

  const closeModal = useCallback(() => {
    // console.log({ selectedDateElement: selectedDateElement })
    if (selectedDateElement) {
      selectedDateElement.style.backgroundColor = ""; // Reset background color
    }
    setSelectedDateElement(null); // Then set selectedDateElement to null
    setIsModalOpen(false);
    setCurrentSchedule(null);
  }, [selectedDateElement]);

  const onBeforeCreateSchedule = useCallback((scheduleData) => {
    console.log('CreateSchedule')
    openModal("create", {
      id: String(Math.random()),
      title2: "",
      body: "",
      start: scheduleData.start,
      end: scheduleData.end,
      category: "time",
      isAllDay: scheduleData.isAllDay,
      dueDateClass: "",
      location: scheduleData.location,
      // state: scheduleData.state,
      proname:"",
    });
    setNewStart(new Date(scheduleData.start));
    setNewEnd(new Date(scheduleData.end));
    // console.log("onBeforeCreateSchedule");
    cal.current.calendarInst.createSchedules([scheduleData]);
  }, [openModal]);

  const onSaveSchedule = useCallback(async() => {
    // console.log('clickSave newDueDateClass=',newDueDateClass)
    if (cal.current && newStart && newEnd) {
      // console.log({ 'newIsAllDay': newIsAllDay });
      console.log('clickSave newDueDateClass=',newDueDateClass)
      const schedule: ISchedule = {
        id: currentSchedule?.id || String(Math.random()),
        calendarId: currentSchedule?.calendarId || "1",
        title2: newTitle,
        body: newBody,
        start: newStart,
        end: newEnd,
        isVisible: true,
        category: currentSchedule?.category || "time",
        isAllDay: newIsAllDay,
        location: newLocation,
        dueDateClass: newDueDateClass,
        proname:'거래처명',
        raw: { customField1: "value1", customField2: "value2",tt:'tt' } 
      };
      console.log('saveschedule',schedule.raw)

      if (modalMode === "edit" && currentSchedule) {
        cal.current.calendarInst.updateSchedule(
          schedule.id,
          schedule.calendarId,
          schedule
        );
      } else {
        cal.current.calendarInst.createSchedules([schedule]);
      }
      // const response = await axios.post('http://localhost:3001/api/schedules', schedule);
      closeModal();
    }
  }, [
    modalMode,
    currentSchedule,
    newTitle,
    newBody,
    newStart,
    newEnd,
    newLocation,
    newState,
    newIsAllDay,
    newDueDateClass, 
    newproviderName,
    closeModal
  ]);

  const onClickSchedule = useCallback(
    (e: any) => {
      const schedule = e.schedule;
      console.log('proname:', schedule); // 새로 추가한 속성에 접근
      const { calendarId, id } = e.schedule;
      const el = cal.current.calendarInst.getElement(id, calendarId);
      console.log('onclockSchedule',e.schedule);
      openModal("edit", e.schedule);
    },
    [openModal]
  );

  const onDeleteSchedule = useCallback(() => {
    if (cal.current && currentSchedule) {
      cal.current.calendarInst.deleteSchedule(
        currentSchedule.id,
        currentSchedule.calendarId
      );
      closeModal();
    }
  }, [currentSchedule, closeModal]);

  const onBeforeUpdateSchedule = useCallback((e: any) => {
    const { schedule, changes } = e;

    // 드래그 앤 드롭 또는 크기 조정 후 스케줄 업데이트 처리
    if (cal.current && changes) {
      cal.current.calendarInst.updateSchedule(
        schedule.id,
        schedule.calendarId,
        changes
      );
    }
  }, []);

  const onClickNextButton = () => {
    cal.current.calendarInst.next();
  };

  const onClickPrevButton = () => {
    cal.current.calendarInst.prev();
  };
  const handleSelectCompany = (value: string) => {
    setNewState(value);  // 선택된 거래처명 설정
    setIsJexcelModalOpen(false);  // 모달 닫기
  };


  function formatToKoreanTimeString(date: Date): string {
    let now = new Date(date);
    // console.log('chgDate', now)

    if (!date) return "";
    // 한국 시간은 UTC보다 9시간 앞서 있으므로 9시간을 더합니다.
    date.setHours(date.getHours());
    let year = date.getFullYear();
    let month = ('0' + (date.getMonth() + 1)).slice(-2); // 월은 0부터 시작하므로 +1 필요
    let day = ('0' + date.getDate()).slice(-2);
    let hours = ('0' + date.getHours()).slice(-2);
    let minutes = ('0' + date.getMinutes()).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  return (
    <div className="App">


      <h1>스케줄_관리</h1>

      {/* <button onClick={addSchedule}>새 스케줄 추가</button> */}
      <button onClick={onClickPrevButton}>이전 달로 이동</button>
      <button onClick={onClickNextButton}>다음 달로 이동</button>
      <TUICalendar
        ref={cal}
        height="1000px"
        view="month"
        useCreationPopup={false}
        useDetailPopup={false}
        // calendars={calendars}
        schedules={schedules}
        onClickSchedule={onClickSchedule}
        onBeforeCreateSchedule={onBeforeCreateSchedule}
        onBeforeUpdateSchedule={onBeforeUpdateSchedule}  // 드래그 앤 드롭 업데이트 처리
      // onClickDay={onClickDay} // 날짜 클릭 시 처리
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
                  value={newStart ? formatToKoreanTimeString(new Date(newStart)) : ""}
                  onChange={(e) => setNewStart(new Date(e.target.value))}
                />
              </div>
              <div className="date-time-item">
                <label>종료일:</label>
                <input
                  type="datetime-local"
                  value={newEnd ? formatToKoreanTimeString(new Date(newEnd)) : ""}
                  onChange={(e) => setNewEnd(new Date(e.target.value))}
                />
              </div>
            </div>
            <label>거래처명</label>
            <input
              type="text"
              value={newproviderName}
              onChange={(e) => setNewproviderName(e.target.value)}
            />

            <label>State:</label>
            <input
              type="text"
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
              onKeyPress={handleStateKeyPress}
            />

            <label>제목:</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
            <label>본문:</label>
            <textarea
              value={newBody}
              onChange={(e) => setNewBody(e.target.value)}
            />
            <label>대관구분:</label>
            <input
              type="text"
              value={newLocation}
              onChange={(e) => setNewLocation(e.target.value)}
            />

            <label>All Day:</label>
            <input
              type="checkbox"
              checked={newIsAllDay}
              onChange={(e) => setNewIsAllDay(e.target.checked)}
            />
            <label>Due Date Class:</label>
            <input
              type="text"
              value={newDueDateClass}
              onChange={(e) => setNewDueDateClass(e.target.value)}
            />
            <div className="modal-buttons">
              <button className="save-button" onClick={onSaveSchedule}>
                저장
              </button>
              {modalMode === "edit" && (
                <button className="delete-button" onClick={onDeleteSchedule}>
                  삭제
                </button>
              )}
              <button className="cancel-button" onClick={closeModal}>
                취소
              </button>
            </div>
          </div>
        </div>
      )}
      <JexcelModal
        isOpen={isJexcelModalOpen}
        onClose={() => setIsJexcelModalOpen(false)}
        onSelect={handleSelectCompany}  // jExcel에서 선택된 값을 처리할 함수
      />
    </div>
  );
}

const rootElement = document.getElementById("root");
export default Schedule;
