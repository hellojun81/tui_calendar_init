import React, {useCallback,useState, useRef, useEffect } from 'react';
import { TextField, Button, Box } from '@mui/material';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import dayjs from 'dayjs';
import ScheduleModal from "../schedules/ScheduleModal";


// 스타일 상수 정의
const inputStyle = {
    fontSize: '0.5rem',
    padding: '4px 8px',
    height: '36px',
};

const inputLabelStyle = {
    fontSize: '0.5rem',
};

function Cs() {
    const calendarRef = useRef<any>(null);
    const [schedules, setSchedules] = useState<ISchedule[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<"create" | "edit">("create");
    const [currentYear, setCurrentYear] = useState<number>(dayjs().year());
    const [currentMonth, setCurrentMonth] = useState<number>(dayjs().month() + 1);
    const [currentSchedule, setCurrentSchedule] = useState<ISchedule | null>(null);
    const [newStart, setNewStart] = useState<Date | null>(null);
    const [newEnd, setNewEnd] = useState<Date | null>(null);
    // const [rawData, setRawData] = useState<{ [key: string]: any }>({});
    const [isJexcelModalOpen, setIsJexcelModalOpen] = useState(false);
    const [newTitle, setNewTitle] = useState("");
    const [estPrice, setEstprice] = useState<number>(0);
    const [userInt, setUserInt] = useState("");
    const [gubun, setGubun] = useState("");
    const [customerName, setCustomerName] = useState("");
    const [rentPlace, setRentPlace] = useState("");
    const [etc, setEtc] = useState("");
    const [searchQuery, setSearchQuery] = useState(""); // 검색어 상태 추가
    const [id, setId] = useState(""); // ID값
    const currentDate = new Date();
    const str_Date = currentDate.toISOString().split('T')[0]; // 현재 날짜를 YYYY-MM-DD 형식으로 변환
    const end_Date = new Date();
    end_Date.setDate(currentDate.getDate() - 14);
    const endDateString = end_Date.toISOString().split('T')[0]; // 2주 전 날짜를 YYYY-MM-DD 형식으로 변환

    console.log({ strDate: str_Date, endDate: endDateString });

    const [formData, setFormData] = useState({
        startDate: str_Date,
        endDate: endDateString,
        customerName: '',
    });

    const [tableData, setTableData] = useState([]);
    const tableRef = useRef(null);

    useEffect(() => {
        if (tableRef.current && tableData.length) {
            jspreadsheet(tableRef.current, {
                data: tableData,
                columns: [
                    { type: 'text', title: '고객명', width: 150 },
                    { type: 'text', title: '전화번호', width: 150 },
                    { type: 'text', title: '이메일', width: 200 },
                    { type: 'text', title: '주소', width: 200 },
                    { type: 'text', title: '가입일', width: 100 },
                ],
            });
        }
    }, [tableData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    // const handleSearch = () => {
    //     // 여기에 검색 로직을 추가하세요. 예를 들어, formData를 사용하여 API를 호출하고 결과를 가져올 수 있습니다.
    //     // 가져온 결과를 tableData로 설정합니다.
    //     const dummyData = [
    //         ['김철수', '010-1234-5678', 'kim@example.com', '서울', '2023-01-15'],
    //         ['이영희', '010-9876-5432', 'lee@example.com', '부산', '2023-01-18'],
    //         // 더미 데이터 예시
    //     ];

    //     setTableData(dummyData);
    // };



    const handleSearch = async (year: number, month: number) => {
        const fetchSchedules = async () => {
            try {
                const newMonth = `${year}-${formatMonth(month)}`;
                console.log('newMonth', newMonth);

                // 서버로부터 데이터를 가져오는 비동기 호출
                const res = await axios.get(`http://localhost:3001/api/schedules/${newMonth}`);
                setSchedules(res.data);  // 가져온 데이터를 상태에 저장
                console.log('resData', res.data);
            } catch (err) {
                console.error('Error fetching schedules:', err);
            }
        };
        await fetchSchedules();  // 비동기 함수를 호출
    };
    const openModal = useCallback((mode: "create" | "edit", scheduleData: ISchedule | null = null) => {
        console.log(`openModal mode=${mode} scheduleData=${scheduleData}`)
        setModalMode(mode);
        setCurrentSchedule(scheduleData);
        setNewStart(scheduleData ? new Date(dayjs(scheduleData.start).format('YYYY-MM-DD')) : null);
        setNewEnd(scheduleData ? new Date(dayjs(scheduleData.end).format('YYYY-MM-DD')) : null);
        setNewTitle(scheduleData ? scheduleData.title || "" : "");
        setCustomerName(scheduleData ? scheduleData.customerName || "" : "");
        setRentPlace(scheduleData ? scheduleData.rentPlace || "" : "");
        setGubun(scheduleData ? scheduleData.gubun || "" : "");
        setUserInt(scheduleData ? scheduleData.userInt || "" : "");
        setEstprice(scheduleData ? scheduleData.estPrice || 0 : 0);
        setId(scheduleData ? scheduleData.id || "" : "");
        setEtc(scheduleData ? scheduleData.etc || "" : "");
        setIsModalOpen(true);
      }, []);


    const handleaddCs = () => {
        // 여기에 검색 로직을 추가하세요. 예를 들어, formData를 사용하여 API를 호출하고 결과를 가져올 수 있습니다.
        // 가져온 결과를 tableData로 설정합니다.
        const dummyData = [
            ['김철수', '010-1234-5678', 'kim@example.com', '서울', '2023-01-15'],
            ['이영희', '010-9876-5432', 'lee@example.com', '부산', '2023-01-18'],
            // 더미 데이터 예시
        ];

        setTableData(dummyData);
    };

    return (
        <Box
            sx={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
            }}
        >
            <Button
                variant="contained"
                color="primary"
                onClick={handleaddCs}
                sx={{ padding: '12px 16px' }}
            >
                CS추가
            </Button>
            <Box sx={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <TextField
                    label="끝 날짜"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
                <TextField
                    label="시작 날짜"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
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
            <div ref={tableRef} />

            <ScheduleModal
        isOpen={isModalOpen}
        modalMode={modalMode}
        id={Number(id)}
        newStart={newStart}
        newEnd={newEnd}
        newTitle={newTitle}
        gubun={gubun}
        userInt={userInt}
        estPrice={estPrice}
        customerName={customerName}
        etc={etc}
        rentPlace={rentPlace || ""}
        setNewStart={setNewStart}
        setNewEnd={setNewEnd}
        setCustomerName={setCustomerName}
        setRentPlace={setRentPlace}
        setNewTitle={setNewTitle}
        setGubun={setGubun}
        setUserInt={setUserInt}
        setEstprice={setEstprice}
        setEtc={setEtc}

        onDeleteSchedule={id => onDeleteSchedule(Number(id))}
        onSaveSchedule={onSaveSchedule}
        // onDeleteSchedule={() => setSchedules(prev => prev.filter(s => s.id !== currentSchedule?.id))}
        closeModal={closeModal}
        openJexcelModal={openJexcelModal}
      />

        </Box>



    );
}

export default Cs;
