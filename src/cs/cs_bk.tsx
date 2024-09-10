import React, { useCallback, useState, useRef, useEffect } from 'react';
import jspreadsheet from 'jspreadsheet-ce';
// import 'jspreadsheet-ce/dist/jspreadsheet.css';
import dayjs from 'dayjs';
import ScheduleModal from "../schedules/ScheduleModal";
import {ISchedule, saveSchedule, closeModalUtil, openModalUtil,openJexcelModalUtil, getCurrentDate, getSchedulesUtil
} from '../utils/scheduleUtils';
import { JSpreadsheetInstance} from '../provider/Customer';
import axios from 'axios';
import { Box, Button, TextField, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import CrudButtons from '../common/CrudButtons';
import JexcelModal from "../schedules/JexcelModal";
import './cs.css'
const apiUrl = process.env.REACT_APP_API_URL;


const Cs: React.FC = () => {
   
    const calendarRef = useRef<any>(null);
    const [schedules, setSchedules] = useState<ISchedule[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
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
    const [id, setId] = useState<number>(0); // ID값

    const [activeRow, SetactiveRow] = useState<number>(0);
    const [tableData, setTableData] = useState<string[][]>([]);
    const tableRef = useRef<HTMLDivElement>(null);
    const jexcelInstance = useRef<any>(null);
    const { startDate, endDate } = getCurrentDate();
    const [formData, setFormData] = useState({
        startDate: startDate,
        endDate: endDate,
        customerName: '',
        filterOption: '등록일'
    });

    const openModal = useCallback((mode: "create" | "edit", scheduleData: ISchedule | null = null) => {
        openModalUtil(mode, scheduleData, setModalMode, setCurrentSchedule, setNewStart, setNewEnd, setStartTime, setEndTime, setNewTitle, setCustomerName, setRentPlace,
            setGubun, setUserInt, setEstprice, setId, setEtc, setIsModalOpen, setCsKind);
    }, []);

    useEffect(() => {
        if (tableRef.current) {
            if (!jexcelInstance.current) {
                console.log("JSpreadsheet 초기화 시작");
                jexcelInstance.current = jspreadsheet(tableRef.current, {
                    data: tableData.length ? tableData : [[]],
                    columns: [
                        { type: 'numeric', title: 'ID', width: 20 },
                        { type: 'text', title: 'CS유형', width: 40 },
                        { type: 'text', title: '고객명', width: 80 },
                        { type: 'text', title: '촬영구분', width: 40 },
                        { type: 'text', title: '대관장소', width: 80 },
                        { type: 'text', title: '인원', width: 50 },
                        { type: 'text', title: '견적가', width: 50 },
                        { type: 'calendar', title: '등록일', width: 70, options: {format: 'YYYY-MM-DD',},},
                        { type: 'calendar', title: '시작일', width: 70, options: {format: 'YYYY-MM-DD',},},
                        { type: 'calendar', title: '종료일', width: 70, options: {format: 'YYYY-MM-DD',},},
                        { type: 'text', title: '비고', width: 30 },
                        // { type: 'text', title: '대표자', width: 30 },
                        // { type: 'text', title: '소재지', width: 30 },
                        // { type: 'text', title: '메모', width: 30 },
                    ],
                });
            } else {
                jexcelInstance.current.setData(tableData);
                jexcelInstance.current.options.onselection = (
                    instance: JSpreadsheetInstance,
                    x1: number,
                    y1: number,
                    x2: number,
                    y2: number
                ) => {

                    SetactiveRow(y1);
                    setId(parseInt(tableData[y1][0])) /////ID값세팅
                    setCustomerName(tableData[y1][2])
                    console.log({id:tableData[y1][0],customerName:tableData[y1][2]})
                };
            }
            // const handleContextMenu = (e: MouseEvent) => {
            //     e.preventDefault(); // 우클릭 시 기본 메뉴 방지
            // };
            // tableRef.current.addEventListener('contextmenu', handleContextMenu);

            // // 컴포넌트 언마운트 시 이벤트 리스너 제거
            // return () => {
            //     tableRef.current?.removeEventListener('contextmenu', handleContextMenu);
            // };

        } else {
            console.error("tableRef.current가 null입니다.");
        }

    }, [tableData]);

    const handleSearch = async () => {
        const fetchSchedules = async () => {
            try {
                const queryParams = new URLSearchParams({
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    ...(formData.customerName && { customerName: formData.customerName }),
                });
                // 서버로부터 데이터를 가져오는 비동기 호출
                const res = await axios.get(`${apiUrl}/api/schedules/cs?${queryParams.toString()}`);
                setTableData(res.data.map((schedule: ISchedule) => [
                    schedule.id,
                    schedule.csKind,
                    schedule.customerName,
                    schedule.gubun,
                    schedule.rentPlace,
                    schedule.userInt,
                    schedule.estPrice,
                    dayjs(schedule.created_at).format('YYYY-MM-DD'),
                    dayjs(schedule.start).format('YYYY-MM-DD'),
                    dayjs(schedule.end).format('YYYY-MM-DD'),
                    schedule.etc
                ]));
            } catch (err) {
                console.error('Error fetching schedules:', err);
            }
        };
        await fetchSchedules();  // 비동기 함수를 호출
    };



    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const onSaveSchedule = () => {
        if (!customerName.trim()) {
            alert("모든 필수 입력란을 작성해 주세요.");
            return;
        }
        console.log('MODE', modalMode)
        saveSchedule(csKind, newTitle, newStart, newEnd, startTime, endTime, customerName, rentPlace, modalMode, currentSchedule, gubun, userInt, estPrice, etc, setSchedules, closeModal);
        handleSearch()
    
    };

    const closeJexcelModal = useCallback(() => {
        setIsJexcelModalOpen(false);
    }, []);

    const onSelectCustomer = useCallback((selectedCustomer: string) => {
        console.log('selectedCustomer', selectedCustomer)
        setCustomerName(selectedCustomer); // 선택된 고객명 설정
        closeJexcelModal(); // 모달 닫기
    }, [closeJexcelModal]);

    const closeModal = useCallback(() => {
        closeModalUtil(setIsModalOpen, setCurrentSchedule); // 유틸리티 함수 호출
    }, []);

    const openJexcelModal = useCallback((customerName: string) => {
        openJexcelModalUtil(customerName, setSearchQuery, setIsJexcelModalOpen); // 유틸리티 함수 호출
    }, []);

    const handleEditCustomer = useCallback(async (id: number) => {
        try {
            console.log('handleEditCustomer id=', id)
            const res = await axios.get(`${apiUrl}/api/schedules/${id}`);
            const scheduleData = res.data;
            openModal("edit", scheduleData);
        } catch (err) {
            console.error('Error fetching schedule by ID:', err);
        }
    }, [openModal]);

    const handleaddCs = useCallback((scheduleData: any) => {
        const schedule: ISchedule = {
            title: "",
            body: "",
            start: scheduleData.start,
            end: scheduleData.end,
            category: "",
            customerName: "",
            gubun: "",
            userInt: "",
            estPrice: 0,
            rentPlace: ""
        };

        if (calendarRef.current) {
            const calendarInstance = calendarRef.current.getInstance();
            calendarInstance.createSchedules([schedule]);
        }
        openModal("create", schedule);
    }, [openModal]);


    const handleDeleteCustomer = useCallback(async (id: Number ,customerName:string ) => {
        const confirmDelete = window.confirm(`${customerName} 정말 삭제하시겠습니까?`); 
        if (confirmDelete) {
            try {
                const res = await axios.delete(`${apiUrl}/api/schedules/${id}`);
                handleSearch();
                closeJexcelModal(); // 모달 닫기
            } catch (error) {
                console.error("삭제 중 오류 발생:", error);
            }
        } else {
            console.log("삭제 취소됨");
        }
    }, [closeJexcelModal]);



    return (
        <div>
            <Box
                sx={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                }}
            >
                <Box sx={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                    <FormControl fullWidth>
                        <InputLabel id="filter-label">검색 옵션</InputLabel>
                        <Select
                            labelId="filter-label"
                            name="filterOption"
                            value={formData.filterOption}
                            onChange={handleChange}
                            label="검색 옵션"
                        >
                            <MenuItem value="등록일" selected>등록일</MenuItem>
                            <MenuItem value="대관시작일">대관시작일</MenuItem>
                            <MenuItem value="대관종료일">대관종료일</MenuItem>
                            <MenuItem value="수정일">수정일</MenuItem>
                        </Select>
                    </FormControl>
                    <TextField
                        label="시작일"
                        name="endDate"
                        type="date"
                        value={formData.startDate}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                    <TextField
                        label="종료일"
                        name="startDate"
                        type="date"
                        value={formData.endDate}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                    <TextField
                        label="고객명"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        fullWidth
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSearch}
                        sx={{ padding: '12px 16px' }}
                    >
                        검색
                    </Button>
                </Box>
                <CrudButtons
                    onAdd={handleaddCs}
                    onEdit={() =>  handleEditCustomer(id)}
                    onDelete={() =>  handleDeleteCustomer(id,customerName)}
                />
                <div ref={tableRef} />

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
                // onDeleteSchedule={id => onDeleteSchedule(Number(id))}
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
            </Box>
        </div>
    );
}
export default Cs;
