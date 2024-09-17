import React, { useCallback, useState, useEffect, useRef } from "react";
import { Box,Button } from '@mui/material';
import ScheduleModal from "./ScheduleModal";
import "./Calendar.css";
import axios from 'axios';
import dayjs from 'dayjs';
import CheckView from "./CheckVIew";
import { ISchedule, saveSchedule, closeModalUtil, openModalUtil, openJexcelModalUtil, getSchedulesUtil } from '../utils/scheduleUtils';
import TUICalendar from "@toast-ui/react-calendar";
import "tui-calendar/dist/tui-calendar.css";

// const apiUrl = process.env.REACT_APP_API_URL;
const apiUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PRODUCTION
    : process.env.REACT_APP_API_URL_LOCAL;




const Schedule = () => {
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
    const [newTitle, setNewTitle] = useState("");
    const [estPrice, setEstprice] = useState<number>(0);
    const [userInt, setUserInt] = useState("");
    const [gubun, setGubun] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [rentPlace, setRentPlace] = useState<string>("1floor");
    const [etc, setEtc] = useState("");
    const [csKind, setCsKind] = useState<number>(0);
    const [id, setId] = useState<number>(0); // ID값
    const formatMonth = (month: number): string => {
        return month.toString().padStart(2, '0');
    };
    const start = new Date();

    useEffect(() => {
        getSchedulesUtil(currentYear, currentMonth, setSchedules, formatMonth);

    }, [currentYear, currentMonth]);

    const closeModal = useCallback(() => {
        closeModalUtil(setIsModalOpen, setCurrentSchedule); // 유틸리티 함수 호출
    }, []);

    const onSaveSchedule = async () => {
        if (!customerName.trim()) {
            alert("모든 필수 입력란을 작성해 주세요.");
            return;
        }
        console.log('MODE', modalMode)
        await saveSchedule(csKind, newTitle, newStart, newEnd, startTime, endTime, customerName, rentPlace, modalMode, currentSchedule, gubun, userInt, estPrice, etc, setSchedules, closeModal);
        console.log('currentMonth', currentMonth)
        getSchedulesUtil(currentYear, currentMonth, setSchedules, formatMonth);
        // getSchedulesUtil(currentYear, currentMonth, setSchedules, formatMonth);
    };

    const openModal = useCallback((mode: "create" | "edit", scheduleData: ISchedule | null = null) => {
        openModalUtil(mode, scheduleData, setModalMode, setCurrentSchedule, setNewStart, setNewEnd, setStartTime, setEndTime, setNewTitle, setCustomerName, setRentPlace,
            setGubun, setUserInt, setEstprice, setId, setEtc, setIsModalOpen, setCsKind);
    }, []);

    const fetchScheduleById = useCallback(async (id: string) => {
        console.log('id', id)
        try {
            const res = await axios.get(`${apiUrl}/api/schedules/${id}`);
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
        console.log('onBeforeCreateSchedule')
        if (calendarRef.current) {
            const calendarInstance = calendarRef.current.getInstance();
            calendarInstance.createSchedules([scheduleData]);
        }
        openModal("create", scheduleData);
    }, [openModal]);


    const onBeforeUpdateSchedule = useCallback(async (e: any) => {
        const { schedule, changes } = e;
        // 스케줄 업데이트 처리
        calendarRef.current.calendarInst.updateSchedule(
            schedule.id,
            schedule.calendarId,
            changes
        );

        // 날짜와 변경된 값이 있을 때 처리
        const startDate = changes.start ? dayjs(changes.start).format('YYYY-MM-DD') : undefined;
        const endDate = changes.end ? dayjs(changes.end).format('YYYY-MM-DD') : undefined;

        // 새로운 스케줄 객체 생성
        const newSchedule: ISchedule = {
            id: schedule?.id || String(Math.random()),
            start: startDate ? startDate : undefined,
            end: endDate ? endDate : undefined,
        };

        // 서버에 업데이트 요청
        try {
            await axios.put(`${apiUrl}/api/schedules/${schedule?.id}`, newSchedule);
        } catch (error) {
            console.error('Error updating schedule:', error);
        }

        // 상태 업데이트
        setNewStart(changes.start ? new Date(changes.start) : new Date(schedule.start));
        setNewEnd(changes.end ? new Date(changes.end) : new Date(schedule.end));

    }, [calendarRef, currentSchedule]);


    const updateCurrentMonthYear = useCallback(() => {
        if (calendarRef.current) {
            const calendarInstance = calendarRef.current.getInstance();
            const date = calendarInstance.getDate();
            const month = date.getMonth() + 1;
            const year = date.getFullYear();
            setCurrentMonth(month);
            setCurrentYear(year);
        }
    }, [calendarRef]); // calendarRef 의존성 추가


    const onDeleteSchedule = async (id: Number) => {
        console.log('onDeleteSchedule', id)
        const res = await axios.delete(`${apiUrl}/api/schedules/${id}`);
        getSchedulesUtil(currentYear, currentMonth, setSchedules, formatMonth);
        closeModal(); // 모달 닫기
    };

    const onMonthChange = useCallback((year: number, month: number) => {
        setCurrentYear(year);
        setCurrentMonth(month);
        getSchedulesUtil(year, month, setSchedules, formatMonth)
        console.log(schedules)
    }, []);
    const onClickNextButton = () => {
        calendarRef.current.calendarInst.next();
        updateCurrentMonthYear();
    };
    const onClickPrevButton = () => {
        calendarRef.current.calendarInst.prev();
        updateCurrentMonthYear();
    };
    const reloadSchedule = async () => {
        // console.log({ 'reloadSchedule': "", currentYear: currentYear, currentMonth: currentMonth, setSchedules: setSchedules, formatMonth: formatMonth })
        getSchedulesUtil(currentYear, currentMonth, setSchedules, formatMonth);
    }
    const calendarOptions = {
        defaultView: 'month',  // 기본 뷰 설정 (month)
        month: {
          visibleScheduleCount: 15,  // 하루에 보여줄 최대 스케줄 개수 설정
          moreLayerSize: {
            height: 'auto', // "더보기" 레이어 높이 자동 조정
          },
        },
      };
    return (
        <div className="App">
             <Box sx={{ margin: '0 auto', display: 'flex', justifyContent: 'center', alignItems: 'center',gap:'5' }}>
             <Button onClick={onClickPrevButton} color="primary" variant="outlined">이전 달</Button>
            <Box sx={{margin:'10px'}}>{currentYear}년 {currentMonth}월</Box>
            <Button onClick={onClickNextButton} color="primary" variant="outlined">다음 달</Button>
            </Box>
            <CheckView reloadSchedule={reloadSchedule} currentYear={currentYear} currentMonth={currentMonth} />

            <TUICalendar
                ref={calendarRef}
                height="1000px"
                view="month"
                schedules={schedules}
                month={calendarOptions.month}
                onClickSchedule={onClickSchedule}
                onBeforeCreateSchedule={onBeforeCreateSchedule}
                // onBeforeDeleteSchedule={onBeforeDeleteSchedule}
                onBeforeUpdateSchedule={onBeforeUpdateSchedule}
            />
            <ScheduleModal
                isOpen={isModalOpen}
                modalMode={modalMode}
                id={Number(id)}
                csKind={Number(csKind)}
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
            // openJexcelModal={openJexcelModal}
            />

        </div>
    );
};

export default Schedule;

