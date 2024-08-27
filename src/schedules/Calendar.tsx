import React, { useRef, useEffect, useState, useCallback } from "react";
import TUICalendar from "@toast-ui/react-calendar";
import { ISchedule } from "tui-calendar";

interface CalendarProps {
  schedules: ISchedule[];
  onClickSchedule: (e: any) => void;
  onBeforeCreateSchedule: (scheduleData: any) => void;
  onBeforeUpdateSchedule: (e: any) => void;
}

const Calendar: React.FC<CalendarProps> = ({
  schedules,
  onClickSchedule,
  onBeforeCreateSchedule,
  onBeforeUpdateSchedule,
}) => {
  const cal = useRef<any>(null);
  const [currentMonth, setCurrentMonth] = useState<number>(0);
  const [currentYear, setCurrentYear] = useState<number>(0);

  const updateCurrentMonthYear = useCallback(() => {
    if (cal.current) {
      const calendarInstance = cal.current.getInstance();
      const date = calendarInstance.getDate();
      setCurrentMonth(date.getMonth() + 1); // Months are 0-indexed
      setCurrentYear(date.getFullYear());
    }
  }, []);

  const onClickNextButton = () => {
    cal.current.calendarInst.next();
    updateCurrentMonthYear();
  };

  const onClickPrevButton = () => {
    cal.current.calendarInst.prev();
    updateCurrentMonthYear();
  };

  useEffect(() => {
    updateCurrentMonthYear(); // Initialize with the current month and year on mount
  }, [updateCurrentMonthYear]);

  return (
    <div>
      <h2>
       {currentYear}년 {currentMonth}월
      </h2>
      <button onClick={onClickPrevButton}>이전 달로 이동</button>
      <button onClick={onClickNextButton}>다음 달로 이동</button>

      <TUICalendar
        ref={cal}
        height="1000px"
        view="month"
        useCreationPopup={false}
        useDetailPopup={false}
        schedules={schedules}
        onClickSchedule={onClickSchedule}
        onBeforeCreateSchedule={onBeforeCreateSchedule}
        onBeforeUpdateSchedule={onBeforeUpdateSchedule}
      />
    </div>
  );
};

export default Calendar;
