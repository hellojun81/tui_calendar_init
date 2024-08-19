import React, { useState, useRef, useEffect } from 'react';
import { TextField, Button, Box } from '@mui/material';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';

// 스타일 상수 정의
const inputStyle = {
    fontSize: '0.875rem',
    padding: '4px 8px',
    height: '36px',
};

const inputLabelStyle = {
    fontSize: '0.5rem',
};

function Provider() {
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

    const [tableData, setTableData] = useState<string[][]>([]);
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });
  };

    const handleSearch = () => {
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
            <h2>거래처 관리</h2>
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
        </Box>
    );
}

export default Provider;
