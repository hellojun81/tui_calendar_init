import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, TextField, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import dayjs from 'dayjs';
import axios from 'axios';

export default function AdPerformanceViewer() {
  const excelRef = useRef(null);
  const [spreadsheet, setSpreadsheet] = useState(null);
  const [startDate, setStartDate] = useState(dayjs().subtract(30, 'day').format('YYYY-MM-DD'));
  const [endDate, setEndDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [platform, setPlatform] = useState('');
  const [campaign, setCampaign] = useState('');
  const [data, setData] = useState([]);

  const fetchData = async () => {
    try {
      const res = await axios.get('/api/ad-spend', {
        params: {
          startDate,
          endDate,
          platform,
          campaign
        }
      });

      const tableData = res.data.map((item) => [
        item.date,
        item.platform,
        item.campaignName,
        item.spend?.toLocaleString() ?? '-',
        item.clicks?.toLocaleString() ?? '-',
        item.ctr ? item.ctr.toFixed(2) + '%' : '-',
        item.roas ? item.roas.toFixed(2) : '-',
        item.cpc ? item.cpc.toFixed(0).toLocaleString() : '-'
      ]);

      if (spreadsheet && tableData.length) {
        spreadsheet.setData(tableData);
      } else {
        setData(tableData);
      }
    } catch (error) {
      console.error('데이터 조회 실패:', error);
    }
  };

  const exportExcel = () => {
    if (spreadsheet) {
      spreadsheet.download();
    }
  };

  useEffect(() => {
    if (excelRef.current) {
      if (excelRef.current.children.length > 0) {
        excelRef.current.innerHTML = ''; // 기존 내용 제거
      }

      const instance = jspreadsheet(excelRef.current, {
        data: [['', '', '', '', '', '', '', '']], // 빈 표라도 렌더링
        columns: [
          { type: 'text', title: '날짜', width: 100 },
          { type: 'text', title: '플랫폼', width: 100 },
          { type: 'text', title: '캠페인명', width: 150 },
          { type: 'text', title: '총광고비', width: 100 },
          { type: 'text', title: '총클릭수', width: 100 },
          { type: 'text', title: 'CTR', width: 80 },
          { type: 'text', title: 'ROAS', width: 80 },
          { type: 'text', title: 'CPC', width: 100 }
        ],
        editable: false,
        pagination: 10,
        search: true,
      });

      setSpreadsheet(instance);
    }
  }, []);

  return (
    <>
    <Box sx={{ padding: 2 }}>
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mb={2}>
        <TextField
          label="시작일"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="종료일"
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>플랫폼</InputLabel>
          <Select
            value={platform}
            label="플랫폼"
            onChange={(e) => setPlatform(e.target.value)}
          >
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="Meta">Meta</MenuItem>
            <MenuItem value="Google">Google</MenuItem>
            <MenuItem value="Naver">Naver</MenuItem>
            <MenuItem value="Kakao">Kakao</MenuItem>
            <MenuItem value="Instagram">Instagram</MenuItem>
          </Select>
        </FormControl>
        <TextField
          label="캠페인명"
          value={campaign}
          onChange={(e) => setCampaign(e.target.value)}
        />
        <Button variant="contained" onClick={fetchData}>
          조회
        </Button>
        <Button variant="outlined" onClick={exportExcel}>
          엑셀 저장
        </Button>
      </Box>
      <div ref={excelRef}></div>
    </Box>
    </>
  );
}