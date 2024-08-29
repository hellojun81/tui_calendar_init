import React, { useCallback, useState, useEffect, useRef } from "react";
import Calendar from "./Calendar";
import ScheduleModal from "./ScheduleModal";
import JexcelModal from "./JexcelModal";
import axios from 'axios';
import { ISchedule } from "tui-calendar";

const Schedule = () => {
  const cal = useRef(null);
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateElement, setSelectedDateElement] = useState<HTMLElement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentSchedule, setCurrentSchedule] = useState<ISchedule | null>(null);
  const [newStart, setNewStart] = useState<Date | null>(null);
  const [newEnd, setNewEnd] = useState<Date | null>(null);
  const [rawData, setRawData] = useState<{ [key: string]: any }>({
    "장비 목록 (멀티)": {
      카메라: "카메라",
      마이크: "마이크",
      삼각대: "삼각대"
    },
    "단일 선택 장비": {
      드론: "드론",
      크레인: "크레인"
    }
  });
  const [isJexcelModalOpen, setIsJexcelModalOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };



  const apitest = async () => {
    try {
      const res = await axios.get(`http://localhost:3001/api/schedules`);
      console.log(res.data)
      const arr: ISchedule[] = Array.isArray(res.data) ? res.data : [res.data];
      const parsedSchedules = arr.map(arr => ({
        ...arr,
        raw: arr.raw ? JSON.parse(arr.raw) : {} // arr.raw가 존재할 경우에만 JSON.parse 실행
      }));

      setSchedules(parsedSchedules);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    }
  };

  useEffect(() => {
    apitest();
  }, []);

  const openModal = useCallback(
    (mode: "create" | "edit", scheduleData: ISchedule | null = null) => {
      setModalMode(mode);
      setCurrentSchedule(scheduleData);
      setNewStart(scheduleData ? new Date(scheduleData.start) : null);
      setNewEnd(scheduleData ? new Date(scheduleData.end) : null);
      setIsModalOpen(true);
    },
    []
  );

  const closeModal = useCallback(() => {
    if (selectedDateElement) {
      selectedDateElement.style.backgroundColor = ""; // Reset background color
    }
    setSelectedDateElement(null); // Then set selectedDateElement to null
    setIsModalOpen(false);
    setCurrentSchedule(null);
  }, [selectedDateElement]);


  const onSaveSchedule = useCallback(() => {
    console.log('onSaveSchedule')
    const updatedRawData = { ...rawData, 거래처명: '거래처명', 대관장소: '1층', 사용인원: '10명' };
    setRawData(updatedRawData);
    if (newStart && newEnd) {
      const schedule: ISchedule = {
        id: currentSchedule?.id || String(Math.random()),
        calendarId: currentSchedule?.calendarId || "1",
        title: currentSchedule?.title || "",
        body: currentSchedule?.body || "",
        start: newStart,
        end: newEnd,
        isVisible: true,
        category: currentSchedule?.category || "time",
        isAllDay: currentSchedule?.isAllDay || false,
        location: currentSchedule?.location || "",
        dueDateClass: currentSchedule?.dueDateClass || "",
        raw: updatedRawData
      };

      setSchedules((prev) => {
        if (modalMode === "edit" && currentSchedule) {
          return prev.map(s => s.id === schedule.id ? schedule : s);
        } else {
          return [...prev, schedule];
        }
      });
      closeModal();
    }
  }, [newStart, newEnd, currentSchedule, rawData, closeModal, modalMode]);

  const onClickSchedule = useCallback(
    (e: any) => {
      const schedule = e.schedule;
      console.log('schedule', schedule)
      const { calendarId, id } = e.schedule;
      openModal("edit", e.schedule);
    },
    [openModal]
  );

  const onBeforeCreateSchedule = useCallback((scheduleData: any) => {
    console.log('onBeforeCreateSchedule')
    const schedule = {
      id: String(Math.random()),
      title: "",
      body: "",
      start: scheduleData.start,
      end: scheduleData.end,
      category: "time",
      isAllDay: scheduleData.isAllDay,
      location: scheduleData.location,
      raw: {}
    };
    openModal("create", schedule)
  }, [openModal]);

  const onBeforeUpdateSchedule = useCallback((e: any) => {
    const { schedule, changes } = e;
    setSchedules((prev) =>
      prev.map((s) => (s.id === schedule.id ? { ...s, ...changes } : s))
    );
    setNewStart(changes.start ? new Date(changes.start) : new Date(schedule.start));
    setNewEnd(changes.end ? new Date(changes.end) : new Date(schedule.end));
  }, []);

  return (
    <>
    <div className="App">
      <h1>스케줄_관리</h1>
      <Calendar
        schedules={schedules}
        onClickSchedule={onClickSchedule}
        onBeforeCreateSchedule={onBeforeCreateSchedule}
        onBeforeUpdateSchedule={onBeforeUpdateSchedule}

      />
      <ScheduleModal
        isOpen={isModalOpen}
        modalMode={modalMode}
        newStart={newStart}
        newEnd={newEnd}
        newTitle={currentSchedule?.title || ""}
        newBody={currentSchedule?.body || ""}
        newLocation={currentSchedule?.location || ""}
        newIsAllDay={currentSchedule?.isAllDay || false}
        newDueDateClass={currentSchedule?.dueDateClass || ""}
        rawData={rawData}
        setNewStart={setNewStart}
        setNewEnd={setNewEnd}
        onSaveSchedule={onSaveSchedule}
        onDeleteSchedule={() => setSchedules((prev) => prev.filter(s => s.id !== currentSchedule?.id))}
        closeModal={closeModal}
        onRawDataChange={(key, value) => setRawData((prevRawData) => ({
          ...prevRawData,
          [key]: value
        }))}

      />
      <JexcelModal
        isOpen={isJexcelModalOpen}
        onClose={() => setIsJexcelModalOpen(false)}
        onSelect={(value: string) => setRawData((prev) => ({ ...prev, 거래처명: value }))}
      />
    </div>
    </>
  );
};

export default Schedule;
