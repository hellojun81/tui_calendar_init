import React, { useCallback, useState, useEffect, useRef } from "react";
import Calendar from "./Calendar";
import ScheduleModal from "./ScheduleModal";
import JexcelModal from "./JexcelModal";
import axios from 'axios';
// import { ISchedule } from "tui-calendar";

interface ISchedule {
  id?: string;
  calendarId?: string;
  title?: string;
  body?: string;
  start?: Date;
  end?: Date;
  goingDuration?: number;
  comingDuration?: number;
  isAllDay?: boolean;
  category?: string;
  dueDateClass?: string;
  location?: string;
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
  coustomerName?: string;
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
  const [CoustomerName, setCoustomerName] = useState<string>('');

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const res = await axios.get(`http://localhost:3001/api/schedules`);
        setSchedules(res.data);
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
    setIsModalOpen(true);
  }, []);

  const fetchScheduleById = useCallback(async (id: string) => {
    try {
      const res = await axios.get(`http://localhost:3001/api/schedules/${id}`);
      const scheduleData = res.data;
      const parsedSchedule = {
        ...scheduleData,
        raw: scheduleData.raw ? JSON.parse(scheduleData.raw) : {}
      };
      openModal("edit", parsedSchedule);
    } catch (err) {
      console.error('Error fetching schedule by ID:', err);
    }
  }, [openModal]);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setCurrentSchedule(null);
  }, []);

  const onSaveSchedule = useCallback(() => {
    if (newStart && newEnd) {
      const schedule: ISchedule = {
        id: currentSchedule?.id || String(Math.random()),
        calendarId: currentSchedule?.calendarId || "1",
        title: currentSchedule?.title || "",
        body: currentSchedule?.body || "",
        start: newStart,
        end: newEnd,
        category: currentSchedule?.category || "time",
        dueDateClass: currentSchedule?.dueDateClass || "",
        bgColor: 'a33434'
      };

      setSchedules(prev => (
        modalMode === "edit" && currentSchedule
          ? prev.map(s => s.id === schedule.id ? schedule : s)
          : [...prev, schedule]
      ));
      closeModal();
    }
  }, [newStart, newEnd, currentSchedule, rawData, closeModal, modalMode]);

  const onClickSchedule = useCallback((e: any) => {
    fetchScheduleById(e.schedule.id);
  }, [fetchScheduleById]);

  const onBeforeCreateSchedule = useCallback((scheduleData: any) => {
    const schedule = {
      id: String(Math.random()),
      title: "",
      body: "",
      start: scheduleData.start,
      end: scheduleData.end,
      category: "time",
      coustomerName: ""
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
        newTitle={currentSchedule?.title || ""}
        newBody={currentSchedule?.body || ""}
        coustomerName={currentSchedule?.coustomerName || ""}
        rentPlace={currentSchedule?.rentPlace || ""}
        setNewStart={setNewStart}
        setNewEnd={setNewEnd}
        setcoustomerName={setCoustomerName}
        onSaveSchedule={onSaveSchedule}
        onDeleteSchedule={() => setSchedules(prev => prev.filter(s => s.id !== currentSchedule?.id))}
        closeModal={closeModal}
      />
      <JexcelModal
        isOpen={isJexcelModalOpen}
        onClose={() => setIsJexcelModalOpen(false)}
        onSelect={(value: string) => setRawData(prev => ({ ...prev, 거래처명: value }))}
      />
    </div>
  );
};

export default Schedule;
