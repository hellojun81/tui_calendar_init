import React, { useEffect, useRef, useState } from "react";
import { Box, Button, TextField, MenuItem, Select, InputLabel, FormControl } from "@mui/material";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import dayjs from "dayjs";
import axios from "axios";

// 표 한 행 타입(컬럼 8개)
type TableRow = [string, string, string, string, string, string, string, string];

type AdItem = {
  date: string;
  platform: string;
  campaignName: string;
  spend?: number;
  clicks?: number;
  ctr?: number;
  roas?: number;
  cpc?: number;
};

export default function AdPerformanceViewer() {
  const excelRef = useRef<HTMLDivElement | null>(null);

  // jspreadsheet 인스턴스 (타입 불일치 회피: any)
  const [spreadsheet, setSpreadsheet] = useState<any>(null);

  const [startDate, setStartDate] = useState(dayjs().subtract(30, "day").format("YYYY-MM-DD"));
  const [endDate, setEndDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [platform, setPlatform] = useState("");
  const [campaign, setCampaign] = useState("");
  const [data, setData] = useState<TableRow[]>([]);

  const fetchData = async () => {
    try {
      const res = await axios.get("/api/ad-spend", {
        params: { startDate, endDate, platform, campaign },
      });

      const tableData: TableRow[] = (res.data as AdItem[]).map((item) => [
        item.date ?? "",
        item.platform ?? "",
        item.campaignName ?? "",
        item.spend != null ? item.spend.toLocaleString() : "-",
        item.clicks != null ? item.clicks.toLocaleString() : "-",
        item.ctr != null ? item.ctr.toFixed(2) + "%" : "-",
        item.roas != null ? item.roas.toFixed(2) : "-",
        item.cpc != null ? Math.round(item.cpc).toLocaleString() : "-",
      ]);

      if (spreadsheet && tableData.length) {
        // setData 대신 직접 시트에 주입
        spreadsheet.setData ? spreadsheet.setData(tableData) : jspreadsheet.setData(spreadsheet, tableData);
      } else {
        setData(tableData);
      }
    } catch (error) {
      console.error("데이터 조회 실패:", error);
    }
  };

  const exportExcel = () => {
    if (spreadsheet) {
      // 인스턴스 메서드 대신 정적 메서드 사용
      jspreadsheet.download(spreadsheet);
    }
  };

  useEffect(() => {
    if (!excelRef.current) return;

    // 기존 내용 제거
    if (excelRef.current.children.length > 0) {
      excelRef.current.innerHTML = "";
    }

    const options: any = {
      data: (data.length ? data : [["", "", "", "", "", "", "", ""]]) as TableRow[],
      columns: [
        { type: "text", title: "날짜", width: 100 },
        { type: "text", title: "플랫폼", width: 100 },
        { type: "text", title: "캠페인명", width: 150 },
        { type: "text", title: "총광고비", width: 100 },
        { type: "text", title: "총클릭수", width: 100 },
        { type: "text", title: "CTR", width: 80 },
        { type: "text", title: "ROAS", width: 80 },
        { type: "text", title: "CPC", width: 100 },
      ],
      editable: false,
      pagination: 10,
      search: true,
    };

    const raw = (jspreadsheet as any)(excelRef.current, options);
    // 라이브러리에 따라 배열로 반환될 수 있음 → 첫 시트만 사용
    const instance = Array.isArray(raw) ? raw[0] : raw;

    setSpreadsheet(instance);

    return () => {
      try {
        instance?.destroy?.();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // 최초 1회

  return (
    <Box sx={{ padding: 2 }}>
      <Box display="flex" gap={2} alignItems="center" flexWrap="wrap" mb={2}>
        <TextField label="시작일" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <TextField label="종료일" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} InputLabelProps={{ shrink: true }} />
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>플랫폼</InputLabel>
          <Select value={platform} label="플랫폼" onChange={(e) => setPlatform(e.target.value)}>
            <MenuItem value="">전체</MenuItem>
            <MenuItem value="Meta">Meta</MenuItem>
            <MenuItem value="Google">Google</MenuItem>
            <MenuItem value="Naver">Naver</MenuItem>
            <MenuItem value="Kakao">Kakao</MenuItem>
            <MenuItem value="Instagram">Instagram</MenuItem>
          </Select>
        </FormControl>
        <TextField label="캠페인명" value={campaign} onChange={(e) => setCampaign(e.target.value)} />
        <Button variant="contained" onClick={fetchData}>
          조회
        </Button>
        <Button variant="outlined" onClick={exportExcel}>
          엑셀 저장
        </Button>
      </Box>
      <div ref={excelRef} />
    </Box>
  );
}
