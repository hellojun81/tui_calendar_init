import React, { useRef, useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";
const TUICalendar = require('@toast-ui/react-calendar').default;
import { ISchedule } from "tui-calendar";
import "./Calendar.css"; // CSS 파일을 import

interface CalendarProps {
  schedules: ISchedule[];
  onClickSchedule: (e: any) => void;
  onBeforeCreateSchedule: (scheduleData: any) => void;
  onBeforeUpdateSchedule: (e: any) => void;
  onMonthChange: (year: number, month: number) => void; // 부모에게 전달할 연도와 월을 위한 함수
}

const Calendar = forwardRef((props: CalendarProps, ref) => {
  const { schedules, onClickSchedule, onBeforeCreateSchedule, onBeforeUpdateSchedule, onMonthChange } = props;
  const cal = useRef<any>(null);
  const [currentMonth, setCurrentMonth] = useState<number>(0);
  const [currentYear, setCurrentYear] = useState<number>(0);

  const updateCurrentMonthYear = useCallback(() => {
    if (cal.current) {
      const calendarInstance = cal.current.getInstance();
      const date = calendarInstance.getDate();
      const month = date.getMonth() + 1;
      const year = date.getFullYear();
      setCurrentMonth(month); 
      setCurrentYear(year);
      onMonthChange(year, month); // 부모 컴포넌트에 전달
    }
  }, [onMonthChange]);

  const onClickNextButton = () => {
    cal.current.calendarInst.next();
    updateCurrentMonthYear();
  };
  const onClickTest = () => {
 console.log(schedules)
  };

  const onClickPrevButton = () => {
    cal.current.calendarInst.prev();
    updateCurrentMonthYear();
  };

  useEffect(() => {
    updateCurrentMonthYear(); // Initialize with the current month and year on mount
  }, [updateCurrentMonthYear]);

  // 부모 컴포넌트에서 ref를 통해 cal 참조에 접근할 수 있도록 설정
  useImperativeHandle(ref, () => ({
    getInstance: () => cal.current?.getInstance(),
  }));

  return (
    <div>
      <button onClick={onClickPrevButton}>이전 달</button>
      {currentYear}년 {currentMonth}월
      <button onClick={onClickNextButton}>다음 달</button>
      <button onClick={onClickTest}>test</button>

      <TUICalendar
        ref={cal}
        height="500px"
        view="month"
        useCreationPopup={false}
        useDetailPopup={false}
        schedules={schedules}
        month={{
          visibleScheduleCount: 3,  // 표시할 최대 스케줄 개수 설정
          scheduleHeight: 10
        }}
        onClickSchedule={onClickSchedule}
        onBeforeCreateSchedule={onBeforeCreateSchedule}
        onBeforeUpdateSchedule={onBeforeUpdateSchedule}
      />
    </div>
  );
});

export default Calendar;
