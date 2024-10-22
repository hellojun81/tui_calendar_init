import React, { useCallback, useState, useRef, useEffect } from 'react';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import dayjs from 'dayjs';
import ScheduleModal from "../schedules/ScheduleModal";
import { ISchedule, saveSchedule, closeModalUtil, openModalUtil, openJexcelModalUtil, getCurrentDate } from '../utils/scheduleUtils';
import { JSpreadsheetInstance } from '../provider/Customer';
import axios from 'axios';
import { Box } from '@mui/material';
import CrudButtons from '../common/CrudButtons';
import JexcelModal from "../schedules/JexcelModal";
import SearchFields from '../provider/SearchFields';
import '../common/Jexcel.css';

const apiUrl =
    process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_URL_PRODUCTION
        : process.env.REACT_APP_API_URL_LOCAL;

const Cs: React.FC = () => {

    const calendarRef = useRef<any>(null);
    const [schedules, setSchedules] = useState<ISchedule[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [currentSchedule, setCurrentSchedule] = useState<ISchedule | null>(null);
    const [newStart, setNewStart] = useState<Date | undefined>(undefined);
    const [newEnd, setNewEnd] = useState<Date | undefined>(undefined);
    const [startTime, setStartTime] = useState<string>('00:00');
    const [endTime, setEndTime] = useState<string>('00:00');
    const [isJexcelModalOpen, setIsJexcelModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [estPrice, setEstprice] = useState<number>(0);
    const [userInt, setUserInt] = useState("");
    const [gubun, setGubun] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [rentPlace, setRentPlace] = useState<string>("1floor");
    const [contactPerson, setContactPerson] = useState<string>("1floor");
    const [customerEtc, setCustomerEtc] = useState<string>("1floor");
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
        filterOption: '등록일',
        csKind:0
    });

    const openModal = useCallback((mode: "create" | "edit", scheduleData: ISchedule | null = null) => {
        openModalUtil(mode, scheduleData, setModalMode, setCurrentSchedule, setNewStart, setNewEnd, setStartTime, setEndTime, setNewTitle, setCustomerName, setRentPlace,
            setGubun, setUserInt, setEstprice, setId, setEtc, setIsModalOpen, setCsKind,setCustomerEtc,setContactPerson);
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
                        { type: 'calendar', title: '등록일', width: 70, options: { format: 'YYYY-MM-DD', }, },
                        { type: 'calendar', title: '시작일', width: 70, options: { format: 'YYYY-MM-DD', }, },
                        { type: 'calendar', title: '종료일', width: 70, options: { format: 'YYYY-MM-DD', }, },
                        { type: 'text', title: '비고', width: 180 },
                        { type: 'hidden', title: '담당자', width: 1},
                        { type: 'hidden', title: '고객비고', width: 1},
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
                    if (tableData[y1]) {
                        SetactiveRow(y1);
                        setId(parseInt(tableData[y1][0])) /////ID값세팅
                        setCustomerName(tableData[y1][2])
                        console.log({ id: tableData[y1][0], customerName: tableData[y1][2] })
                    }
                };
            }

        } else {
            console.error("tableRef.current가 null입니다.");
        }
    }, [tableData]);



    const handleSearch = async () => {
        const fetchSchedules = async () => {
            try {
                // console.log('CS_csKind',formData.csKind)
                const queryParams = new URLSearchParams({
                    startDate: formData.startDate,
                    endDate: formData.endDate,
                    csKind:formData.csKind.toString(),
                    ...(formData.customerName && { customerName: formData.customerName }),
                });
                // 서버로부터 데이터를 가져오는 비동기 호출
                const res = await axios.get(`${apiUrl}/api/schedules/cs?${queryParams.toString()}`);
                console.log(res.data)
                if (res.data.length == 0) {
                    setTableData([[' ']]);
                    return
                }
                setTableData(res.data.map((schedule: ISchedule) => [
                    schedule.id,
                    schedule.cskindTitle,
                    schedule.customerName,
                    schedule.gubun,
                    schedule.rentPlace,
                    schedule.userInt,
                    schedule.estPrice,
                    dayjs(schedule.created_at).format('YYYY-MM-DD'),
                    dayjs(schedule.start).format('YYYY-MM-DD'),
                    dayjs(schedule.end).format('YYYY-MM-DD'),
                    schedule.etc,
                    schedule.customerEtc,
                    schedule.contactPerson
                ]));
            } catch (err) {
                console.error('Error fetching schedules:', err);
            }
        };
        await fetchSchedules();  // 비동기 함수를 호출
    };



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // console.log('handleChange',e.target)
        setFormData({ ...formData, [name]: value });
    };

    const onSaveSchedule = async() => {
        if (!customerName.trim()) {
            alert("모든 필수 입력란을 작성해 주세요.");
            return;
        }
        saveSchedule(csKind, newTitle, newStart, newEnd, startTime, endTime, customerName, rentPlace, modalMode, currentSchedule, gubun, userInt, estPrice, etc, setSchedules, closeModal);
        await handleSearch()
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
            // console.log('handleEditCustomer id=', id)
            const res = await axios.get(`${apiUrl}/api/schedules/${id}`);
            const scheduleData = res.data;
            console.log('res.data', res.data)
            openModal("edit", scheduleData);
            handleSearch()
        } catch (err) {
            console.error('Error fetching schedule by ID:', err);
        }
    }, [openModal]);

    const handleaddCs = useCallback((scheduleData: any) => {
        console.log('handleaddCs')
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


    const handleDeleteCustomer = useCallback(async (id: Number, customerName: string) => {
        const confirmDelete = window.confirm(`${customerName} 민원을 정말 삭제하시겠습니까?`);
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

    const handleDeleteSchedule = async (id: Number) => {
        const confirmDelete = window.confirm(`스케쥴을 정말 삭제하시겠습니까?`);
        if (confirmDelete) {
            try {
                const res = await axios.delete(`${apiUrl}/api/schedules/${id}`);
                closeModal(); // 모달 닫기
                handleSearch();
            } catch (error) {
                console.error("삭제 중 오류 발생:", error);
            }
        } 
    };
    const handleCsKindChange = (value: number) => {
        console.log('handleCsKindChange',value)
        setFormData({
            ...formData,
            csKind: value
        });
    };

    return (
        <div>
            <Box
                sx={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '20px',
                    border: '1px solid #ddd',
                    borderRadius: '8px',
                }}
            >
                <Box sx={{ display: 'flex', gap: '2x', marginBottom: '20px' }}>

                    <SearchFields prarentComponent='cs' 
                    formData={formData} 
                    handleChange={handleChange} 
                    handleSearch={handleSearch} 
                    onCsKindChange={handleCsKindChange}  // csKind 값을 부모에서 처리
                    />
                </Box>

                <CrudButtons
                    onAdd={()=>handleaddCs(schedules)}
                    onEdit={() => handleEditCustomer(id)}  // 익명 함수로 감싸서 인수 전달
                    onDelete={() => handleDeleteCustomer(id, customerName)}  // 마찬가지로 익명 함수로 감싸서 처리
                />

                <div ref={tableRef} />

                <ScheduleModal
                    isOpen={isModalOpen}
                    modalMode={modalMode}
                    id={Number(id)}
                    csKind={csKind}
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
                    customerEtc={customerEtc}
                    contactPerson={contactPerson}
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
                    setCustomerEtc={setCustomerEtc}
                    setContactPerson={setContactPerson}
                    onDeleteSchedule={(id) => handleDeleteSchedule(id)} // onDeleteSchedule 추가
                    onSaveSchedule={onSaveSchedule}
                    // onDeleteSchedule={() => setSchedules(prev => prev.filter(s => s.id !== currentSchedule?.id))}
                    closeModal={closeModal}
                    // openJexcelModal={openJexcelModal}
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
