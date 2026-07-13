import React, { useEffect, useCallback, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Alert,
  CircularProgress,
  TablePagination,
  IconButton,
  Tooltip,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import dayjs from "dayjs";
import axios from "axios";
import { apiUrl } from "../utils/util";

/** 서버가 주는 응답 형태 */
interface ApiItem {
  created_at: string;
  content: string;
  receiver: string;
  status?: string; // 없을 수 있음
  id?: number; // 없을 수 있음
}
interface ApiResponse {
  scheduleId: string;
  data: ApiItem[];
  message: string;
}

/** 화면 모델 */
type HistoryItem = {
  id: number; // 고유키(없으면 생성)
  receiver: string;
  content: string;
  created_at: string; // 포맷팅
  status: "성공" | "실패" | "전송중";
};

type KakaoHistoryProps = {
  id: number; // 조회할 스케줄 ID
  fetchPath?: string; // 기본: /api/popbill/kakao/SendMessageHistory
  defaultPageSize?: number; // 페이지 크기
  dateFormat?: string; // 날짜 포맷
};

const KakaoHistory: React.FC<KakaoHistoryProps> = ({
  id,
  fetchPath = "/api/popbill/kakao/SendMessageHistory",
  defaultPageSize = 10,
  dateFormat = "YYYY-MM-DD HH:mm",
}) => {
  const [rows, setRows] = useState<HistoryItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0); // 0-based
  const [rowsPerPage, setRowsPerPage] = useState(defaultPageSize);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const normalizeStatus = (raw?: string): "성공" | "실패" | "전송중" => {
    if (!raw) return "전송중";
    const map: Record<string, "성공" | "실패" | "전송중"> = {
      success: "성공",
      sent_success: "성공",
      fail: "실패",
      failed: "실패",
      sending: "전송중",
      성공: "성공",
      실패: "실패",
      전송중: "전송중",
    };
    const k = raw.toLowerCase?.() ?? raw;
    return map[k] ?? "전송중";
  };

  /** 데이터 조회 (AbortController로 취소 안전) */
  const fetchHistory = useCallback(async () => {
    if (id === undefined || id === null) return;
    setLoading(true);
    setError(null);

    const ac = new AbortController();

    try {
      const url = `${apiUrl}${fetchPath}`;
      const res = await axios.get<ApiResponse>(url, {
        params: { scheduleId: id },
        withCredentials: true,
        signal: ac.signal,
      });

      const list = Array.isArray(res.data?.data) ? res.data.data : [];

      const mapped: HistoryItem[] = list.map((it, idx) => {
        // 고유 id가 없으면 created_at timestamp + idx로 생성
        const uniqueId = (it.id ?? (Number.isFinite(Date.parse(it.created_at)) ? Date.parse(it.created_at) : Date.now())) + idx;

        return {
          id: uniqueId,
          receiver: it.receiver,
          content: it.content,
          created_at: dayjs(it.created_at).isValid() ? dayjs(it.created_at).format(dateFormat) : it.created_at,
          status: normalizeStatus(it.status),
        };
      });

      setRows(mapped);
      setTotal(mapped.length);
      setPage(0); // 새 조회 시 페이지 초기화(선택)
    } catch (err: any) {
      if (axios.isCancel?.(err)) return;
      setError(err?.response?.data?.message || err?.message || "알 수 없는 오류");
      setRows([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }

    return () => ac.abort();
  }, [id, fetchPath, dateFormat]);

  useEffect(() => {
    const cleanup = fetchHistory();
    return () => {
      // fetchHistory에서 반환한 abort 실행
      // if (typeof cleanup === "function") cleanup();
    };
  }, [fetchHistory]);

  // 화면에 보여줄 슬라이스
  const start = page * rowsPerPage;
  const end = start + rowsPerPage;
  const visibleRows = rows.slice(start, end);

  const handleChangePage = (_: unknown, newPage: number) => setPage(newPage);
  const handleChangeRowsPerPage = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(e.target.value, 10));
    setPage(0);
  };

  return (
    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1 }}>
        <Typography variant="h6" fontWeight={700}>
          알림톡 발송 이력
        </Typography>
        <Tooltip title="새로고침">
          <span>
            <IconButton onClick={fetchHistory} disabled={loading}>
              <RefreshIcon />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          발송 이력을 불러오는 데 실패했습니다: {error}
        </Alert>
      )}

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: "bold" }}>발송일시</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>내용</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>수신번호</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>상태</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                    <CircularProgress size={22} />
                  </Box>
                </TableCell>
              </TableRow>
            ) : visibleRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} align="center">
                  발송 이력이 없습니다.
                </TableCell>
              </TableRow>
            ) : (
              visibleRows.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>{item.created_at}</TableCell>
                  <TableCell>{item.content}</TableCell>
                  <TableCell>{item.receiver}</TableCell>
                  <TableCell>
                    <Typography
                      variant="body2"
                      sx={{
                        color: item.status === "성공" ? "success.main" : item.status === "실패" ? "error.main" : "text.secondary",
                        fontWeight: "bold",
                      }}
                    >
                      {item.status}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={total}
        page={page}
        rowsPerPage={rowsPerPage}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage="페이지 크기"
      />
    </Paper>
  );
};

export default KakaoHistory;
