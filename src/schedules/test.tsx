import React, { useCallback, useState, useEffect, useRef } from "react";
import Calendar from "./Calendar";
import ScheduleModal from "./ScheduleModal";
import JexcelModal from "./JexcelModal";
import axios from 'axios';
import dayjs from 'dayjs';
import { ISchedule,saveSchedule,closeModalUtil ,openModalUtil,openJexcelModalUtil,getSchedulesUtil} from '../utils/scheduleUtils';

import TUICalendar from "@toast-ui/react-calendar";
// import { ISchedule } from "tui-calendar";

const Schedule = () => {
  const cal = useRef(null);

  const calendarRef = useRef<any>(null);
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentYear, setCurrentYear] = useState<number>(dayjs().year());
  const [currentMonth, setCurrentMonth] = useState<number>(dayjs().month() + 1);
  const [currentSchedule, setCurrentSchedule] = useState<ISchedule | null>(null);
  const [newStart, setNewStart] = useState<Date | undefined>(undefined);
  const [newEnd, setNewEnd] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [isJexcelModalOpen, setIsJexcelModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [estPrice, setEstprice] = useState<number>(0);
  const [userInt, setUserInt] = useState("");
  const [gubun, setGubun] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [rentPlace, setRentPlace] = useState<string[]>([]);
  const [etc, setEtc] = useState("");
  const [csKind, setCsKind] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태 추가
  const [id, setId] = useState(""); // ID값
  const formatMonth = (month: number): string => {
    return month.toString().padStart(2, '0');
  };
const start = new Date();
const end = new Date(new Date().setMinutes(start.getMinutes() + 30));


  useEffect(() => {
    getSchedulesUtil(currentYear, currentMonth, setSchedules, formatMonth);
  }, [currentYear, currentMonth]);

  const closeModal = useCallback(() => {
    closeModalUtil(setIsModalOpen, setCurrentSchedule); // 유틸리티 함수 호출
  }, []);




  const onSaveSchedule = () => {
    if (!customerName.trim()) {
      alert("모든 필수 입력란을 작성해 주세요.");
      return;
    }
    saveSchedule(csKind,newTitle, newStart, newEnd,startTime,endTime, customerName, rentPlace, modalMode, currentSchedule, gubun, userInt, estPrice, etc, setSchedules, closeModal);
  };

  const openModal = useCallback((mode: "create" | "edit", scheduleData: ISchedule | null = null) => {
    openModalUtil( mode,scheduleData,setModalMode,setCurrentSchedule,setNewStart,setNewEnd,setStartTime,setEndTime,setNewTitle,setCustomerName,setRentPlace,
      setGubun,setUserInt,setEstprice,setId,setEtc,setIsModalOpen,setCsKind);
  }, []);

  const fetchScheduleById = useCallback(async (id: string) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/schedules/${id}`);
      const scheduleData = res.data;
      openModal("edit", scheduleData);
    } catch (err) {
      console.error('Error fetching schedule by ID:', err);
    }
  }, [openModal]);


  const onClickSchedule = useCallback((e: any) => {
    fetchScheduleById(e.schedule.id);
  }, [fetchScheduleById]);


  const onBeforeCreateSchedule = useCallback((scheduleData: any) => {

    if (calendarRef.current) {
      const calendarInstance = calendarRef.current.getInstance();
      calendarInstance.createSchedules([scheduleData]);
    }
    // console.log('onBeforeCreateSchedule',schedule)
    openModal("create", scheduleData);
  }, [openModal]);

  // const onBeforeUpdateSchedule = useCallback((event) => {
  //   const { schedule, changes } = event;
  //   setSchedules(prev =>
  //     prev.map(s => (s.id === schedule.id ? { ...s, ...changes } : s))
  //   );
  //   setNewStart(changes.start ? new Date(changes.start) : new Date(schedule.start));
  //   setNewEnd(changes.end ? new Date(changes.end) : new Date(schedule.end));
  // }, []);


  const onBeforeUpdateSchedule = useCallback((e) => {
    console.log(e);

    const { schedule, changes } = e;

    cal.current.calendarInst.updateSchedule(
        schedule.id,
        schedule.calendarId,
        changes
    );
}, []);




  const openJexcelModal = useCallback((customerName: string) => {
    openJexcelModalUtil(customerName, setSearchQuery, setIsJexcelModalOpen); // 유틸리티 함수 호출
  }, []);

  const closeJexcelModal = useCallback(() => {
    setIsJexcelModalOpen(false);
  }, []);

  const onSelectCustomer = useCallback((selectedCustomer: string) => {
    console.log('selectedCustomer', selectedCustomer)
    setCustomerName(selectedCustomer); // 선택된 고객명 설정
    closeJexcelModal(); // 모달 닫기
  }, [closeJexcelModal]);

  const onDeleteSchedule = useCallback(async (id: Number) => {
    console.log('onDeleteSchedule', id)
    const res = await axios.delete(`http://localhost:3001/api/schedules/${id}`);
    getSchedulesUtil(currentYear, currentMonth, setSchedules, formatMonth);
    closeJexcelModal(); // 모달 닫기
  }, [closeJexcelModal]);

  const onMonthChange = useCallback((year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
    getSchedulesUtil(year, month,setSchedules,formatMonth)
    console.log(schedules)
  }, []);

  return (
    <div className="App">
      {/* <Calendar
        ref={calendarRef}
        schedules={schedules}
        onClickSchedule={onClickSchedule}
        onBeforeCreateSchedule={onBeforeCreateSchedule}
        onBeforeUpdateSchedule={onBeforeUpdateSchedule}
        onMonthChange={onMonthChange} // onMonthChange 함수 전달
      /> */}
      
      <TUICalendar
        ref={cal}
        height="1000px"
        view="month"
        schedules={schedules}
        onClickSchedule={onClickSchedule}
        onBeforeCreateSchedule={onBeforeCreateSchedule}
        // onBeforeDeleteSchedule={onBeforeDeleteSchedule}
        onBeforeUpdateSchedule={onBeforeUpdateSchedule}
      />
      <ScheduleModal
        isOpen={isModalOpen}
        modalMode={modalMode}
        id={Number(id)}
        newStart={newStart}
        newEnd={newEnd}
        startTime={startTime}
        endTime={endTime}
        newTitle={newTitle}
        gubun={gubun}
        userInt={userInt}
        estPrice={estPrice}
        customerName={customerName}
        etc={etc}
        rentPlace={rentPlace || ""}
        
        setNewStart={setNewStart}
        setNewEnd={setNewEnd}
        setStartTime={setStartTime}
        setEndTime={setEndTime}
        setCustomerName={setCustomerName}
        setRentPlace={setRentPlace}
        setNewTitle={setNewTitle}
        setGubun={setGubun}
        setUserInt={setUserInt}
        setEstprice={setEstprice}
        setEtc={setEtc}
        setCsKind={setCsKind}
        onDeleteSchedule={id => onDeleteSchedule(Number(id))}
        onSaveSchedule={onSaveSchedule}
        // onDeleteSchedule={() => setSchedules(prev => prev.filter(s => s.id !== currentSchedule?.id))}
        closeModal={closeModal}
        openJexcelModal={openJexcelModal}
      />
      <JexcelModal
        isOpen={isJexcelModalOpen}
        onClose={closeJexcelModal}
        onSelect={onSelectCustomer}
        searchQuery={searchQuery}
      />
    </div>
  );
};

export default Schedule;

