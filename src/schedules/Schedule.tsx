import React, { useCallback, useState, useEffect, useRef } from "react";
// import Calendar from "./Calendar";
import ScheduleModal from "./ScheduleModal";
import JexcelModal from "./JexcelModal";
import axios from 'axios';
import dayjs from 'dayjs';
// import timezone from 'dayjs/plugin/timezone';
// import utc from 'dayjs/plugin/utc';
import { ISchedule } from "tui-calendar";
import {  saveSchedule, closeModalUtil, openModalUtil, openJexcelModalUtil, getSchedulesUtil } from '../utils/scheduleUtils';

import TUICalendar from "@toast-ui/react-calendar";

const Schedule = () => {
    //   const cal = useRef(null);

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
    const [rentPlace, setRentPlace] = useState<string>("1floor");
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
        console.log('setSchedules',schedules)
    }, [currentYear, currentMonth]);

    const closeModal = useCallback(() => {
        closeModalUtil(setIsModalOpen, setCurrentSchedule); // 유틸리티 함수 호출
    }, []);




    const onSaveSchedule = () => {
        if (!customerName.trim()) {
            alert("모든 필수 입력란을 작성해 주세요.");
            return;
        }
        console.log('MODE', modalMode)
        saveSchedule(csKind, newTitle, newStart, newEnd, startTime, endTime, customerName, rentPlace, modalMode, currentSchedule, gubun, userInt, estPrice, etc, setSchedules, closeModal);
    };

    const openModal = useCallback((mode: "create" | "edit", scheduleData: ISchedule | null = null) => {
        openModalUtil(mode, scheduleData, setModalMode, setCurrentSchedule, setNewStart, setNewEnd, setStartTime, setEndTime, setNewTitle, setCustomerName, setRentPlace,
            setGubun, setUserInt, setEstprice, setId, setEtc, setIsModalOpen, setCsKind);
    }, []);

    const fetchScheduleById = useCallback(async (id: string) => {
        console.log('id', id)
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
            await axios.put(`http://localhost:3001/api/schedules/${schedule?.id}`, newSchedule);
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
    return (
        <div className="App">
            <button onClick={onClickPrevButton}>이전 달</button>
            {currentYear}년 {currentMonth}월
            <button onClick={onClickNextButton}>다음 달</button>

            <TUICalendar
                ref={calendarRef}
                height="1000px"
                view="month"
                schedules={schedules}
                onClickSchedule={onClickSchedule}
                onBeforeCreateSchedule={onBeforeCreateSchedule}
                // onBeforeDeleteSchedule={onBeforeDeleteSchedule}
                onBeforeUpdateSchedule={onBeforeUpdateSchedule}
                timezones={[
                    {
                      timezoneOffset: 540, // 대한민국 표준시 (GMT+9)
                      displayLabel: 'GMT+09:00',
                      tooltip: 'Seoul',
                    },
                  ]}
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


    // const onBeforeUpdateSchedule = useCallback(async (e: any) => {
    //     const { schedule, changes } = e;
    //     calendarRef.current.calendarInst.updateSchedule(
    //         schedule.id,
    //         schedule.calendarId,
    //         changes
    //     );
   
    //     if (Object.keys(changes).length>1) {
    //         const startDate = dayjs(changes.start._date).format('YYYY-MM-DD')
    //         const endDate = dayjs(changes.end._date).format('YYYY-MM_DD')
    //         const newSchedule: ISchedule = {
    //             id: currentSchedule?.id || String(Math.random()),
    //             start: dayjs(startDate).format('YYYY-MM-DD') ? new Date(dayjs(startDate).format('YYYY-MM-DD')) : undefined,
    //             end: dayjs(endDate).format('YYYY-MM-DD') ? new Date(dayjs(endDate).format('YYYY-MM-DD')) : undefined,
    //           };  
    //     }else{
    //         const endDate = dayjs(changes.end._date).format('YYYY-MM_DD') 
    //         const newSchedule: ISchedule = {
    //             id: currentSchedule?.id || String(Math.random()),
    //             end: dayjs(endDate).format('YYYY-MM-DD') ? new Date(dayjs(endDate).format('YYYY-MM-DD')) : undefined,
    //           };
    //     }
    //     //날짜만 업데이트


    //       await axios.put(`http://localhost:3001/api/schedules/${currentSchedule?.id}`, newSchedule);

    //     setNewStart(changes.start ? new Date(changes.start) : new Date(schedule.start));
    //     setNewEnd(changes.end ? new Date(changes.end) : new Date(schedule.end));

    // }, []);
