import React, { useCallback, useEffect, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import EstimateDocumentModal from "../components/EstimateDocumentModal";

const API_URL = process.env.NODE_ENV === "production" ? process.env.REACT_APP_API_URL_PRODUCTION : process.env.REACT_APP_API_URL_LOCAL;

interface EstimateSummary {
  documentKey: string;
  estimateNo: string;
  estimateTitle: string;
  recipientName: string;
  issueDate: string;
  rentalDate: string;
  totalAmount: number | string;
  createdAt: string;
  updatedAt: string;
}

const formatMoney = (value: number | string) => `${(Number(value) || 0).toLocaleString("ko-KR")}원`;

const formatDateTime = (value: string) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getScheduleId = (documentKey: string) => {
  const match = documentKey.match(/^schedule-(\d+)$/);
  return match ? Number(match[1]) : 0;
};

const EstimateManagement: React.FC = () => {
  const [search, setSearch] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [estimates, setEstimates] = useState<EstimateSummary[]>([]);
  const [selected, setSelected] = useState<EstimateSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const fetchEstimates = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get<EstimateSummary[]>(`${API_URL}/api/estimates`, {
        params: {
          ...(search.trim() && { search: search.trim() }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        },
      });
      setEstimates(response.data);
    } catch (fetchError: any) {
      console.error(fetchError);
      setError(fetchError?.response?.data?.error || "견적서 목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [search, startDate, endDate]);

  useEffect(() => {
    fetchEstimates();
  }, []);

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault();
    fetchEstimates();
  };

  const handleReset = () => {
    setSearch("");
    setStartDate("");
    setEndDate("");
    setTimeout(() => {
      setLoading(true);
      axios
        .get<EstimateSummary[]>(`${API_URL}/api/estimates`)
        .then((response) => setEstimates(response.data))
        .catch((resetError: any) => setError(resetError?.response?.data?.error || "견적서 목록을 불러오지 못했습니다."))
        .finally(() => setLoading(false));
    }, 0);
  };

  const handleDelete = async (estimate: EstimateSummary) => {
    const name = estimate.recipientName || estimate.estimateNo || "선택한 견적서";
    if (!window.confirm(`${name} 견적서를 삭제하시겠습니까?\n삭제 후에는 복구할 수 없습니다.`)) return;

    setError("");
    setMessage("");
    try {
      await axios.delete(`${API_URL}/api/estimates/${encodeURIComponent(estimate.documentKey)}`);
      setMessage("견적서가 삭제되었습니다.");
      setEstimates((prev) => prev.filter((item) => item.documentKey !== estimate.documentKey));
      if (selected?.documentKey === estimate.documentKey) setSelected(null);
    } catch (deleteError: any) {
      console.error(deleteError);
      setError(deleteError?.response?.data?.error || "견적서를 삭제하지 못했습니다.");
    }
  };

  const handleSaved = () => {
    setMessage("견적서가 저장되었습니다.");
    fetchEstimates();
  };

  return (
    <Box sx={{ maxWidth: 1320, mx: "auto", px: { xs: 1.5, sm: 3 }, py: 2.5 }}>
      <Paper variant="outlined" sx={{ p: { xs: 1.5, sm: 2.5 }, borderRadius: 2, mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 2 }}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 900 }}>저장 견적서 검색</Typography>
            <Typography variant="body2" color="text.secondary">고객명, 견적번호 또는 견적명으로 검색할 수 있습니다.</Typography>
          </Box>
          <Chip label={`총 ${estimates.length}건`} color="primary" variant="outlined" />
        </Box>

        <Box
          component="form"
          onSubmit={handleSearch}
          sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "minmax(240px, 2fr) 1fr 1fr auto" }, gap: 1.2, alignItems: "center" }}
        >
          <TextField
            size="small"
            label="고객명 / 견적번호 / 견적명"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <TextField
            size="small"
            label="수정 시작일"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={startDate}
            onChange={(event) => setStartDate(event.target.value)}
          />
          <TextField
            size="small"
            label="수정 종료일"
            type="date"
            InputLabelProps={{ shrink: true }}
            value={endDate}
            onChange={(event) => setEndDate(event.target.value)}
          />
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button type="submit" variant="contained" startIcon={<SearchIcon />}>검색</Button>
            <Tooltip title="검색 조건 초기화">
              <IconButton onClick={handleReset} aria-label="검색 조건 초기화" sx={{ border: "1px solid", borderColor: "divider", borderRadius: 1 }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
      </Paper>

      {message && <Alert severity="success" onClose={() => setMessage("")} sx={{ mb: 2 }}>{message}</Alert>}
      {error && <Alert severity="error" onClose={() => setError("")} sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} variant="outlined" sx={{ borderRadius: 2 }}>
        <Table sx={{ minWidth: 850, "& .MuiTableCell-root": { px: 1.25 } }}>
          <TableHead>
            <TableRow sx={{ bgcolor: "#263238" }}>
              {['견적번호', '고객명', '견적명', '렌탈 날짜', '합계금액', '최종 수정', '관리'].map((label) => (
                <TableCell key={label} sx={{ color: "white", fontWeight: 900, whiteSpace: "nowrap", ...(label === '관리' ? { width: 54, minWidth: 54 } : {}) }}>{label}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} align="center" sx={{ py: 8 }}><CircularProgress size={34} /></TableCell></TableRow>
            ) : estimates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 8, color: "text.secondary" }}>
                  저장된 견적서가 없습니다. 일정의 견적서 작성 화면에서 저장하면 이곳에 표시됩니다.
                </TableCell>
              </TableRow>
            ) : (
              estimates.map((estimate) => (
                <TableRow key={estimate.documentKey} hover>
                  <TableCell sx={{ fontWeight: 800 }}>{estimate.estimateNo || '-'}</TableCell>
                  <TableCell>{estimate.recipientName || '-'}</TableCell>
                  <TableCell>{estimate.estimateTitle || '-'}</TableCell>
                  <TableCell>{estimate.rentalDate || estimate.issueDate || '-'}</TableCell>
                  <TableCell sx={{ fontWeight: 900, color: "primary.main", whiteSpace: "nowrap" }}>{formatMoney(estimate.totalAmount)}</TableCell>
                  <TableCell sx={{ whiteSpace: "nowrap" }}>{formatDateTime(estimate.updatedAt)}</TableCell>
                  <TableCell sx={{ width: 54, minWidth: 54 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 0.25 }}>
                      <Tooltip title="수정 및 출력">
                        <IconButton color="primary" aria-label={`${estimate.estimateNo} 수정 및 출력`} onClick={() => setSelected(estimate)}>
                          <EditOutlinedIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="삭제">
                        <IconButton color="error" aria-label={`${estimate.estimateNo} 삭제`} onClick={() => handleDelete(estimate)}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {selected && (
        <EstimateDocumentModal
          open
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
          documentKey={selected.documentKey}
          scheduleId={getScheduleId(selected.documentKey)}
          customerName={selected.recipientName}
        />
      )}
    </Box>
  );
};

export default EstimateManagement;
