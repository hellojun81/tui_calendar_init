import React, { useCallback, useState, useEffect, useRef } from "react";
import Calendar from "./Calendar";
import ScheduleModal from "./ScheduleModal";
import JexcelModal from "./JexcelModal";
import axios from 'axios';

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
  const calendarRef = useRef<any>(null);
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentSchedule, setCurrentSchedule] = useState<ISchedule | null>(null);
  const [newStart, setNewStart] = useState<Date | null>(null);
  const [newEnd, setNewEnd] = useState<Date | null>(null);
  const [rawData, setRawData] = useState<{ [key: string]: any }>({});
  const [isJexcelModalOpen, setIsJexcelModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [rentPlace, setRentPlace] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태 추가

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/schedules`);
        setSchedules(res.data);
        console.log('resData', res.data)
      } catch (err) {
        console.error('Error fetching schedules:', err);
      }
    };

    fetchSchedules();
  }, []);

  const openModal = useCallback((mode: "create" | "edit", scheduleData: ISchedule | null = null) => {
    setModalMode(mode);
    setCurrentSchedule(scheduleData);
    setNewStart(scheduleData ? new Date(scheduleData.start) : null);
    setNewEnd(scheduleData ? new Date(scheduleData.end) : null);
    setNewTitle(scheduleData ? scheduleData.title || "" : "");
    setCustomerName(scheduleData ? scheduleData.customerName || "" : "");
    setRentPlace(scheduleData ? scheduleData.rentPlace || "" : "");
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

  const openJexcelModal = useCallback(() => {
    console.log('openJexcelModal' ,customerName)
    setSearchQuery(customerName); 
    setIsJexcelModalOpen(true);
  }, []);

  const closeJexcelModal = useCallback(() => {
    setIsJexcelModalOpen(false);
  }, []);

  const onSelectCustomer = useCallback((selectedCustomer: string) => {
    setCustomerName(selectedCustomer); // 선택된 고객명 설정
    closeJexcelModal(); // 모달 닫기
  }, [closeJexcelModal]);

  return (
    <div className="App">
      <h1>스케줄_관리</h1>
      <Calendar
        ref={calendarRef}
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
        newTitle={newTitle}
        customerName={customerName}
        rentPlace={rentPlace || ""}
        setNewStart={setNewStart}
        setNewEnd={setNewEnd}
        setCustomerName={setCustomerName}
        setRentPlace={setRentPlace}
        setNewTitle={setNewTitle}
        onDeleteSchedule={() => setSchedules(prev => prev.filter(s => s.id !== currentSchedule?.id))}
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
