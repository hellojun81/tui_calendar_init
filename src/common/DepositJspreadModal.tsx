import React, { useEffect, useRef, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Stack, TextField, FormControlLabel, Checkbox,
  CircularProgress, Typography,
} from "@mui/material";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";

// ★ 경로 정리: common/에서 utils/로 한 단계 올라감
import type { BankRow } from "../utils/bankApi";
import { fetchBankTransactions } from "../utils/bankApi";
  const API_URL =
    process.env.NODE_ENV === "production"
      ? process.env.REACT_APP_API_URL_PRODUCTION
      : process.env.REACT_APP_API_URL_LOCAL;



interface Props {
  open: boolean;
  onClose: () => void;
  customerName?: string;
  baseUrl?: string;  // ex) 'http://localhost:8001'
  listPath?: string; // ex) '/api/bank'
}

export default function DepositJspreadModal({
  open,
  onClose,
  customerName,
  baseUrl = API_URL,
  listPath = "/api/bank", // ← 쿼리 파라미터 없이 path만!
}: Props) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const jRef = useRef<jspreadsheet.JSpreadsheet | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rows, setRows] = useState<BankRow[]>([]);

  // 필터
  const [start, setStart] = useState(""); // YYYY-MM-DD
  const [end, setEnd] = useState("");
  const [keyword, setKeyword] = useState("");
  const [onlyDeposit, setOnlyDeposit] = useState(true);

  // 데이터 조회
  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchBankTransactions({
        start, end, keyword, onlyDeposit,
        baseUrl, path: listPath,
      });
      setRows(data);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "load failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) load();
  }, [open]);

  // jSpreadsheet 초기화/갱신
  useEffect(() => {
    if (!open || !gridRef.current) return;

    const data = rows.map((d) => [
      d.tx_datetime,            // 0
      d.deposit_amount ?? 0,    // 1
      d.memo ?? "",             // 2
      d.bank_name ?? "",        // 3
      d.balance ?? 0,           // 4
      d.summary ?? "",          // 5 (참고)
      d.account_no ?? "",       // 6 (참고)
    ]);

    if (jRef.current) {
      jRef.current.setData(data as any);
      // 필요 시 강제 리프레시
      // (jRef.current as any).refresh?.();
      return;
    }

    jRef.current = jspreadsheet(gridRef.current, {
      data,
      columns: [
        { type: "calendar", title: "일시", width: 170, readOnly: true, options: { format: "YYYY-MM-DD HH:MM" } },
        { type: "numeric",  title: "입금액", width: 110, readOnly: true, mask: "#,##0" },
        { type: "text",     title: "메모", width: 260, readOnly: true },
        { type: "text",     title: "은행", width: 110, readOnly: true },
        { type: "numeric",  title: "잔액", width: 110, readOnly: true, mask: "#,##0" },
        { type: "text",     title: "적요(참고)", width: 200, readOnly: true },
        { type: "text",     title: "계좌(참고)", width: 160, readOnly: true },
      ],
      freezeColumns: 1,
      allowInsertRow: false,
      allowInsertColumn: false,
      allowDeleteRow: false,
      allowDeleteColumn: false,
      tableOverflow: true,
      tableHeight: "420px",
      csvFileName: "deposit-list",
    }) as unknown as jspreadsheet.JSpreadsheet;

    return () => {
      // 모달 닫힐 때만 파괴되도록: open이 false로 바뀔 때 clean-up 실행
      if (jRef.current && !open) {
        try { (jRef.current as any).destroy?.(); } catch {}
        jRef.current = null;
      }
    };
  }, [open, rows]); // rows 바뀌면 setData 또는 재초기화

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>입금내역 {customerName ? `- ${customerName}` : ""}</DialogTitle>

      <DialogContent dividers>
        {/* 필터 영역 */}
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 1, alignItems: "center" }}>
          <TextField label="시작일" type="date" size="small" InputLabelProps={{ shrink: true }}
                     value={start} onChange={(e) => setStart(e.target.value)} />
          <TextField label="종료일" type="date" size="small" InputLabelProps={{ shrink: true }}
                     value={end} onChange={(e) => setEnd(e.target.value)} />
          <TextField label="검색어" size="small" placeholder="메모/적요/은행/계좌"
                     value={keyword} onChange={(e) => setKeyword(e.target.value)} fullWidth />
          <FormControlLabel control={<Checkbox checked={onlyDeposit} onChange={(e) => setOnlyDeposit(e.target.checked)} />} label="입금만" />
          <Button variant="outlined" onClick={load} disabled={loading}>조회</Button>
        </Stack>

        {/* ✅ 그리드 컨테이너는 항상 DOM에 남겨둠 */}
        <Box sx={{ position: "relative" }}>
          {loading && (
            <Box sx={{
              position: "absolute", inset: 0, display: "flex",
              alignItems: "center", justifyContent: "center",
              bgcolor: "rgba(255,255,255,0.6)", zIndex: 1
            }}>
              <CircularProgress />
            </Box>
          )}
          {error && <Typography color="error" sx={{ mb: 1 }}>{error}</Typography>}
          <Box ref={gridRef} />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>닫기</Button>
      </DialogActions>
    </Dialog>
  );
}
