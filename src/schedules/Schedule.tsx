import React, { useCallback, useState, useEffect, useRef } from "react";
import Calendar from "./Calendar";
import ScheduleModal from "./ScheduleModal";
import JexcelModal from "./JexcelModal";
import axios from 'axios';
import dayjs from 'dayjs';
// id: 일정의 고유 ID
// calendarId: 캘린더의 ID
// title: 일정 제목
// category: 일정 카테고리 (예: "time", "allday")
// start: 시작 시간 (Date 객체 또는 ISO 문자열)
// end: 종료 시간 (Date 객체 또는 ISO 문자열)



interface ISchedule {
  id?: string;
  calendarId?: string;
  title?: string;
  body?: string;
  start?: Date;
  end?: Date;
  goingDuration?: number;
  comingDuration?: number;
  category?: string;
  attendees?: string[];
  recurrenceRule?: string;
  isPending?: boolean;
  isFocused?: boolean;
  isVisible?: boolean;
  isReadOnly?: boolean;
  isPrivate?: boolean;
  color?: string;
  bgColor?: string;
  dragBgColor?: string;
  borderColor?: string;
  customStyle?: string;
  rentPlace?: string;
  state?: string;
  customerName?: string;
}

const Schedule = () => {
  // const currentYear = dayjs().year();
  // const currentMonth = dayjs().month() + 1; // 월은 0부터 시작하므로 +1
  const calendarRef = useRef<any>(null);
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentYear, setCurrentYear] = useState<number>(dayjs().year());
  const [currentMonth, setCurrentMonth] = useState<number>(dayjs().month() + 1);
  const [currentSchedule, setCurrentSchedule] = useState<ISchedule | null>(null);
  const [newStart, setNewStart] = useState<Date | null>(null);
  const [newEnd, setNewEnd] = useState<Date | null>(null);
  const [rawData, setRawData] = useState<{ [key: string]: any }>({});
  const [isJexcelModalOpen, setIsJexcelModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [rentPlace, setRentPlace] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태 추가
  const [id, setId] = useState(""); // ID값

  const formatMonth = (month: number): string => {
    return month.toString().padStart(2, '0');
  };

  useEffect(() => {
    getSchedules(currentYear, currentMonth)

  }, []);

  async function getSchedules(year: number, month: number) {
    const fetchSchedules = async () => {
      try {
        const newMonth = `${year}-${formatMonth(month)}`
        console.log('newMonth',newMonth)
        // const res = await axios.get(`http://localhost:3001/api/schedules`);
        const res = await axios.get(`http://localhost:3001/api/schedules/${newMonth}`);
        setSchedules(res.data);
        console.log('resData', res.data)
      } catch (err) {
        console.error('Error fetching schedules:', err);
      }
    };
    fetchSchedules();
  }

  const openModal = useCallback((mode: "create" | "edit", scheduleData: ISchedule | null = null) => {
    setModalMode(mode);
    setCurrentSchedule(scheduleData);
    setNewStart(scheduleData ? new Date(scheduleData.start) : null);
    setNewEnd(scheduleData ? new Date(scheduleData.end) : null);
    setNewTitle(scheduleData ? scheduleData.title || "" : "");
    setCustomerName(scheduleData ? scheduleData.customerName || "" : "");
    setRentPlace(scheduleData ? scheduleData.rentPlace || "" : "");
    setId(scheduleData ? scheduleData.id || "" : "");
    setIsModalOpen(true);
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

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentSchedule(null);
  }, []);

  const onClickSchedule = useCallback((e: any) => {
    fetchScheduleById(e.schedule.id);
  }, [fetchScheduleById]);


  const onBeforeCreateSchedule = useCallback((scheduleData: any) => {
    const schedule: ISchedule = {
      id: String(Math.random()),
      title: "",
      body: "",
      start: scheduleData.start,
      end: scheduleData.end,
      category: "",
      customerName: ""
    };

    if (calendarRef.current) {
      const calendarInstance = calendarRef.current.getInstance();
      calendarInstance.createSchedules([schedule]);
    }
    openModal("create", schedule);
  }, [openModal]);

  const onBeforeUpdateSchedule = useCallback((event) => {
    const { schedule, changes } = event;
    setSchedules(prev =>
      prev.map(s => (s.id === schedule.id ? { ...s, ...changes } : s))
    );
    setNewStart(changes.start ? new Date(changes.start) : new Date(schedule.start));
    setNewEnd(changes.end ? new Date(changes.end) : new Date(schedule.end));
  }, []);

  const openJexcelModal = useCallback((customerName: string) => {
    console.log('openJexcelModal', customerName)
    setSearchQuery(customerName);
    setIsJexcelModalOpen(true);
  }, []);

  const closeJexcelModal = useCallback(() => {
    setIsJexcelModalOpen(false);
  }, []);

  const onSelectCustomer = useCallback((selectedCustomer: string) => {
    console.log('selectedCustomer', selectedCustomer)
    setCustomerName(selectedCustomer); // 선택된 고객명 설정
    closeJexcelModal(); // 모달 닫기
  }, [closeJexcelModal]);

  const onDeleteSchedule = useCallback(async (id: string) => {
    console.log('onDeleteSchedule', id)
    const res = await axios.delete(`http://localhost:3001/api/schedules/${id}`);
    getSchedules(currentYear, currentMonth)

    // setSchedules(prev => prev.filter(s => s.id !== currentSchedule?.id))
    // setCustomerName(selectedCustomer); // 선택된 고객명 설정
    closeJexcelModal(); // 모달 닫기
  }, [closeJexcelModal]);

  const onSaveSchedule = useCallback(async () => {
    const newSchedule: ISchedule = {
      id: currentSchedule?.id || String(Math.random()),
      calendarId: "1",
      title: newTitle,
      start: newStart ? dayjs(newStart).format('YYYY-MM-DD HH:mm:ss') : null,
      end: newEnd ? dayjs(newEnd).format('YYYY-MM-DD HH:mm:ss') : null,
      category: 'allday',
      bgColor: 'red',
      customerName,
      rentPlace,

      // 필요한 다른 필드도 추가 가능
    };
    console.log('onSaveSchedule', newSchedule)
    try {
      if (modalMode === "create") {
        // 새로운 스케줄 추가
        await axios.post('http://localhost:3001/api/schedules', newSchedule);
      } else {
        // 기존 스케줄 업데이트
        await axios.put(`http://localhost:3001/api/schedules/${currentSchedule?.id}`, newSchedule);
      }

      setSchedules(prev => (
        modalMode === "edit" && currentSchedule
          ? prev.map(s => (s.id === currentSchedule.id ? newSchedule : s))
          : [...prev, newSchedule]
      ));
      getSchedules(currentYear, currentMonth)
      closeModal();
    } catch (err) {
      console.error('Error saving schedule:', err);
    }
  }, [newTitle, newStart, newEnd, customerName, rentPlace, modalMode, currentSchedule, closeModal]);
  const onMonthChange = useCallback((year: number, month: number) => {
    setCurrentYear(year);
    setCurrentMonth(month);
    getSchedules(year, month)
  }, []);





  return (
    <div className="App">
      <Calendar
        ref={calendarRef}
        schedules={schedules}
        onClickSchedule={onClickSchedule}
        onBeforeCreateSchedule={onBeforeCreateSchedule}
        onBeforeUpdateSchedule={onBeforeUpdateSchedule}
        onMonthChange={onMonthChange} // onMonthChange 함수 전달
      />
      <ScheduleModal
        isOpen={isModalOpen}
        modalMode={modalMode}
        id={id}
        newStart={newStart}
        newEnd={newEnd}
        newTitle={newTitle}
        customerName={customerName}
        rentPlace={rentPlace || ""}
        setNewStart={setNewStart}
        setNewEnd={setNewEnd}
        setCustomerName={setCustomerName}
        setRentPlace={setRentPlace}
        setNewTitle={setNewTitle}
        onDeleteSchedule={onDeleteSchedule}
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
