import React, { useCallback, useState, useEffect, useRef } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import ScheduleModal from "./ScheduleModal";
import "./Calendar.css";
import axios from "axios";
import dayjs from "dayjs";
import CheckView from "./CheckVIew";
import Sales from "./Sales";
import { apiUrl, ISchedule, saveSchedule, closeModalUtil, openModalUtil, getSchedulesUtil, getKoreanHolidays } from "../utils/scheduleUtils";
import TUICalendar from "@toast-ui/react-calendar";
import "tui-calendar/dist/tui-calendar.css";

interface UnpaidRental {
  id: number;
  customerName: string;
  contactPerson: string;
  contactTel: string;
  start: string;
  end: string;
  startTime: string;
  endTime: string;
  estPrice: number;
  etc: string;
  moneyFinishNY: number;
  depositCount: number;
  depositedAmount: number;
  depositTypes: string;
}

const Schedule = () => {
  const calendarRef = useRef<any>(null);
  const [schedules, setSchedules] = useState<ISchedule[]>([]);
  const [holidays, setHolidays] = useState<ISchedule[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [currentYear, setCurrentYear] = useState<number>(dayjs().year());
  const [currentMonth, setCurrentMonth] = useState<number>(dayjs().month() + 1);
  const [currentSchedule, setCurrentSchedule] = useState<ISchedule | null>(null);
  const [newStart, setNewStart] = useState<Date | undefined>(undefined);
  const [newEnd, setNewEnd] = useState<Date | undefined>(undefined);
  const [startTime, setStartTime] = useState<string>("09:00");
  const [endTime, setEndTime] = useState<string>("18:00");
  const [newTitle, setNewTitle] = useState("");
  const [estPrice, setEstprice] = useState<number>(0);
  const [sort, setSort] = useState<string>("START");
  const [selectedCsKinds, setSelectedCsKinds] = useState<string[]>([]);
  const [userInt, setUserInt] = useState("");
  const [gubun, setGubun] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [rentPlace, setRentPlace] = useState<string>("1floor");
  const [customerEtc, setCustomerEtc] = useState<string>("");
  const [contactPerson, setContactPerson] = useState<string>("");
  const [contactTel, setContactTel] = useState<string>("");
  const [etc, setEtc] = useState("");
  const [csKind, setCsKind] = useState<number>(0);
  const [ADmedia, setADmedia] = useState<number>(7);
  const [id, setId] = useState<number>(0); // ID값
  const [moneyFinishNY, setmoneyFinishNY] = useState<number>(0); // ID값
  const [messageLogCount, setmessageLogCount] = useState<number>(0); // ID값
  const [vatSendCount, setvatSendCount] = useState<number>(0); // ID값
  const [isSmsModalOpen, setIsSmsModalOpen] = useState(false);
  const [unpaidOpen, setUnpaidOpen] = useState(false);
  const [unpaidRentals, setUnpaidRentals] = useState<UnpaidRental[]>([]);
  const [unpaidLoading, setUnpaidLoading] = useState(false);
  const [unpaidError, setUnpaidError] = useState("");
  const unpaidBalanceTotal = unpaidRentals.reduce(
    (total, item) => total + Math.max((Number(item.estPrice) || 0) * 10000 - (Number(item.depositedAmount) || 0), 0),
    0
  );
  const formatMonth = (month: number): string => {
    return month.toString().padStart(2, "0");
  };
  const start = new Date();

  const handleRefreshSchedules = useCallback(() => {
    getSchedulesUtil(currentYear, currentMonth, sort, setSchedules, formatMonth, selectedCsKinds);
  }, [currentYear, currentMonth, sort, selectedCsKinds]);

  useEffect(() => {
    // 초기 로딩 시와 상태 변경 시 스케줄 로드
    handleRefreshSchedules();
  }, [handleRefreshSchedules]);

  useEffect(() => {
    const years = [currentYear];
    if (currentMonth === 1) years.push(currentYear - 1);
    if (currentMonth === 12) years.push(currentYear + 1);

    getKoreanHolidays(years)
      .then(setHolidays)
      .catch((error) => {
        console.error("공휴일 정보를 가져오지 못했습니다.", error);
        setHolidays([]);
      });
  }, [currentYear, currentMonth]);

  // 🚨 2. closeModal 유틸리티에 새로고침 함수를 전달하도록 업데이트
  const closeModal = useCallback(() => {
    closeModalUtil(setIsModalOpen, setCurrentSchedule, handleRefreshSchedules); // 새로고침 핸들러 전달
  }, [handleRefreshSchedules]); // 의존성에 추가

  const onSaveSchedule = async () => {
    if (!customerName.trim()) {
      alert("모든 필수 입력란을 작성해 주세요.");
      return;
    }
    let isSendingAlimtalk = false;
    if (modalMode === "create") {
      const shouldSendAlimtalk = window.confirm("알림톡을 발송하시겠습니까?");
      if (shouldSendAlimtalk) {
        isSendingAlimtalk = true;
      }
    }
    const closeAfterSave = isSendingAlimtalk ? () => {} : closeModal;
    await saveSchedule(
      csKind,
      ADmedia,
      newTitle,
      newStart,
      newEnd,
      startTime,
      endTime,
      customerName,
      rentPlace,
      modalMode,
      currentSchedule,
      gubun,
      userInt,
      estPrice,
      etc,
      setSchedules,
      closeAfterSave
    );
    if (isSendingAlimtalk) {
      // 이전에 추가한 setIsSmsModalOpen 상태 업데이트
      handleRefreshSchedules()
      setIsSmsModalOpen(true);
    }
    // getSchedulesUtil(currentYear, currentMonth, sort, setSchedules, formatMonth);
  };

  const openModal = useCallback((mode: "create" | "edit", scheduleData: ISchedule | null = null) => {
    openModalUtil(
      mode,
      scheduleData,
      setModalMode,
      setCurrentSchedule,
      setNewStart,
      setNewEnd,
      setStartTime,
      setEndTime,
      setNewTitle,
      setCustomerName,
      setRentPlace,
      setGubun,
      setUserInt,
      setEstprice,
      setId,
      setEtc,
      setIsModalOpen,
      setCsKind,
      setADmedia,
      setCustomerEtc,
      setContactPerson,
      setContactTel,
      setmoneyFinishNY
    );
  }, []);

  const fetchScheduleById = useCallback(
    async (id: string) => {
      try {
        const res = await axios.get(`${apiUrl}/api/schedules/${id}`);
        const scheduleData = res.data;
        setmessageLogCount(scheduleData.messageLogCount);
        setvatSendCount(scheduleData.vatSendCount);
        setmoneyFinishNY(scheduleData.moneyFinishNY);
        openModal("edit", scheduleData);
      } catch (err) {
        console.error("Error fetching schedule by ID:", err);
      }
    },
    [openModal]
  );

  const fetchUnpaidRentals = useCallback(async () => {
    setUnpaidLoading(true);
    setUnpaidError("");
    try {
      const res = await axios.get<UnpaidRental[]>(`${apiUrl}/api/schedules/unpaid-rentals`, {
        params: {
          startDate: "2026-01-01",
        },
      });
      setUnpaidRentals(res.data);
    } catch (error) {
      console.error("미입금 대관 조회 실패:", error);
      setUnpaidError("미입금 대관 목록을 불러오지 못했습니다.");
      setUnpaidRentals([]);
    } finally {
      setUnpaidLoading(false);
    }
  }, []);

  const openUnpaidRentals = useCallback(() => {
    setUnpaidOpen(true);
    fetchUnpaidRentals();
  }, [fetchUnpaidRentals]);

  const openUnpaidSchedule = useCallback(
    (scheduleId: number) => {
      setUnpaidOpen(false);
      fetchScheduleById(String(scheduleId));
    },
    [fetchScheduleById]
  );

  const onClickSchedule = useCallback(
    (e: any) => {
      if (String(e.schedule.id).startsWith("holiday-")) return;
      fetchScheduleById(e.schedule.id);
    },
    [fetchScheduleById]
  );

  const onBeforeCreateSchedule = useCallback(
    (scheduleData: any) => {
      console.log("onBeforeCreateSchedule");
      if (calendarRef.current) {
        const calendarInstance = calendarRef.current.getInstance();
        calendarInstance.createSchedules([scheduleData]);
      }
      openModal("create", scheduleData);
    },
    [openModal]
  );

  const onBeforeUpdateSchedule = useCallback(
    async (e: any) => {
      const { schedule, changes } = e;
      if (String(schedule.id).startsWith("holiday-") || schedule.isReadOnly) return;
      // 스케줄 업데이트 처리
      // console.log('onBeforeUpdateSchedule',schedule)
      calendarRef.current.calendarInst.updateSchedule(schedule.id, schedule.calendarId, changes);

      // 날짜와 변경된 값이 있을 때 처리
      const startDate = new Date(changes.start) ? new Date(dayjs(changes.start).format("YYYY-MM-DD")) : undefined;
      const endDate = new Date(changes.end) ? new Date(dayjs(changes.end).format("YYYY-MM-DD")) : undefined;

      // 새로운 스케줄 객체 생성
      const newSchedule: ISchedule = {
        id: schedule?.id || String(Math.random()),
        start: startDate ? startDate : undefined,
        end: endDate ? endDate : undefined,
        customerName: schedule?.customerName ? customerName : undefined,
      };

      try {
        await axios.put(`${apiUrl}/api/schedules/${schedule?.id}`, newSchedule);
      } catch (error) {
        console.error("Error updating schedule:", error);
      }

      // 상태 업데이트
      setNewStart(changes.start ? new Date(changes.start) : new Date(schedule.start));
      setNewEnd(changes.end ? new Date(changes.end) : new Date(schedule.end));
    },
    [calendarRef, currentSchedule]
  );

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

  const onDeleteSchedule = async (id: Number) => {
    console.log("onDeleteSchedule", id);
    const res = await axios.delete(`${apiUrl}/api/schedules/${id}`);
    // getSchedulesUtil(currentYear, currentMonth, sort, setSchedules, formatMonth);
    closeModal(); // 모달 닫기
  };

  const onClickNextButton = () => {
    calendarRef.current.calendarInst.next();
    updateCurrentMonthYear();
  };
  const onClickPrevButton = () => {
    calendarRef.current.calendarInst.prev();
    updateCurrentMonthYear();
  };

  const reloadSchedule = async (selectedIds: string[]) => {
    setSelectedCsKinds(selectedIds);
  };
  const calendarOptions = {
    defaultView: "month", // 기본 뷰 설정 (month)
    month: {
      visibleScheduleCount: 8, // 하루에 보여줄 최대 스케줄 개수 설정
      moreLayerSize: {
        height: "auto", // "더보기" 레이어 높이 자동 조정
      },
    },
  };
  return (
    <div className="App">
      <Box
        sx={{
          margin: "0 auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: "5",
        }}
      >
        <Button onClick={onClickPrevButton} color="primary" variant="outlined">
          이전 달
        </Button>
        <Box sx={{ margin: "10px" }}>
          {currentYear}년 {currentMonth}월
        </Box>
        <Button onClick={onClickNextButton} color="primary" variant="outlined">
          다음 달
        </Button>
      </Box>
      <Sales currentYear={currentYear} currentMonth={currentMonth} />
      <Box sx={{ display: "flex", justifyContent: "flex-end", px: { xs: 1, sm: 2 }, mb: 0.75 }}>
        <Button
          size="small"
          variant="contained"
          color="warning"
          onClick={openUnpaidRentals}
          sx={{ fontWeight: 800, boxShadow: 1 }}
        >
          미입금 내역 찾기
        </Button>
      </Box>
      <CheckView
        reloadSchedule={reloadSchedule} // 이제 이 함수는 selectedCsKinds를 인자로 받습니다.
        currentYear={currentYear}
        currentMonth={currentMonth}
      />
      <FormControl fullWidth>
        {/* <InputLabel>기준</InputLabel> */}
        <Select value={sort} onChange={(e) => setSort(e.target.value)}>
          <MenuItem value="CREATECNT">생성일(건수)</MenuItem>
          <MenuItem value="CREATE">생성일</MenuItem>
          <MenuItem value="START">시작일</MenuItem>
          <MenuItem value="END">종료일</MenuItem>
          <MenuItem value="ADSPEND">광고집행</MenuItem>
        </Select>
      </FormControl>
      <TUICalendar
        ref={calendarRef}
        height="1000px"
        view="month"
        schedules={[...holidays, ...schedules]}
        month={calendarOptions.month}
        onClickSchedule={onClickSchedule}
        onBeforeCreateSchedule={onBeforeCreateSchedule}
        // onBeforeDeleteSchedule={onBeforeDeleteSchedule}
        onBeforeUpdateSchedule={onBeforeUpdateSchedule}
      />
      <ScheduleModal
        isOpen={isModalOpen}
        modalMode={modalMode}
        id={Number(id)}
        csKind={Number(csKind)}
        ADmedia={Number(ADmedia)}
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
        customerEtc={customerEtc}
        contactPerson={contactPerson}
        contactTel={contactTel}
        rentPlace={rentPlace || ""}
        moneyFinishNY={moneyFinishNY}
        messageLogCount={messageLogCount}
        vatSendCount={vatSendCount}
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
        setADmedia={setADmedia}
        setCustomerEtc={setCustomerEtc}
        setContactPerson={setContactPerson}
        setContactTel={setContactTel}
        onDeleteSchedule={(id) => onDeleteSchedule(Number(id))}
        onSaveSchedule={onSaveSchedule}
        closeModal={closeModal}
        setmoneyFinishNY={setmoneyFinishNY}
        isSmsModalOpen={isSmsModalOpen}
        setIsSmsModalOpen={setIsSmsModalOpen}
      />

      <Dialog
        open={unpaidOpen}
        onClose={() => setUnpaidOpen(false)}
        fullWidth
        maxWidth="lg"
        PaperProps={{ sx: { m: { xs: 1, sm: 2 }, width: { xs: "calc(100% - 16px)", sm: "calc(100% - 32px)" } } }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          미입금 내역 찾기
        </DialogTitle>
        <DialogContent dividers sx={{ px: { xs: 1.25, sm: 3 } }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: { xs: "flex-start", sm: "center" },
              flexDirection: { xs: "column", sm: "row" },
              gap: 1,
              mb: 1.5,
            }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
              2026-01-01 이후 전체 대관 주문 중 입금완료 처리가 되지 않은 건
            </Typography>
          </Box>

          {!unpaidLoading && !unpaidError && (
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "repeat(2, minmax(0, 1fr))", md: "repeat(4, minmax(0, 1fr))" },
                gap: 1,
                mb: 1.5,
              }}
            >
              <Paper variant="outlined" sx={{ px: { xs: 1, sm: 1.5 }, py: 1, bgcolor: "#f8fafc" }}>
                <Typography sx={{ fontSize: "0.7rem", color: "text.secondary", fontWeight: 700 }}>미완료 주문</Typography>
                <Typography sx={{ fontSize: { xs: "0.95rem", sm: "1.15rem" }, fontWeight: 900, color: "#334155", whiteSpace: "nowrap" }}>
                  {unpaidRentals.length}건 · {new Set(unpaidRentals.map((item) => item.customerName)).size}곳
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ px: { xs: 1, sm: 1.5 }, py: 1, bgcolor: "#eff6ff", borderColor: "#bfdbfe" }}>
                <Typography sx={{ fontSize: "0.7rem", color: "#1e40af", fontWeight: 700 }}>미입금 예상 합계</Typography>
                <Typography sx={{ fontSize: { xs: "0.9rem", sm: "1.15rem" }, fontWeight: 900, color: "#1565c0", whiteSpace: "nowrap" }}>
                  {unpaidBalanceTotal.toLocaleString("ko-KR")}원
                </Typography>
                <Typography sx={{ fontSize: "0.65rem", color: "text.secondary" }}>견적가 - 확인 입금액</Typography>
              </Paper>
              <Paper variant="outlined" sx={{ px: { xs: 1, sm: 1.5 }, py: 1, bgcolor: "#fff8e1", borderColor: "#ffe082" }}>
                <Typography sx={{ fontSize: "0.7rem", color: "#8d6e00", fontWeight: 700 }}>일부 입금</Typography>
                <Typography sx={{ fontSize: { xs: "0.95rem", sm: "1.15rem" }, fontWeight: 900, color: "#e65100" }}>
                  {unpaidRentals.filter((item) => Number(item.depositCount) > 0).length}건
                </Typography>
              </Paper>
              <Paper variant="outlined" sx={{ px: { xs: 1, sm: 1.5 }, py: 1, bgcolor: "#fff5f5", borderColor: "#ffcdd2" }}>
                <Typography sx={{ fontSize: "0.7rem", color: "#9f1239", fontWeight: 700 }}>입금 없음</Typography>
                <Typography sx={{ fontSize: { xs: "0.95rem", sm: "1.15rem" }, fontWeight: 900, color: "#c62828" }}>
                  {unpaidRentals.filter((item) => Number(item.depositCount) === 0).length}건
                </Typography>
              </Paper>
            </Box>
          )}

          {unpaidLoading ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">조회 중...</Typography>
            </Paper>
          ) : unpaidError ? (
            <Paper variant="outlined" sx={{ p: 3, textAlign: "center", borderColor: "error.light" }}>
              <Typography color="error">{unpaidError}</Typography>
            </Paper>
          ) : unpaidRentals.length === 0 ? (
            <Paper variant="outlined" sx={{ p: 4, textAlign: "center" }}>
              <Typography color="text.secondary">미입금 대관이 없습니다.</Typography>
            </Paper>
          ) : (
            <TableContainer component={Paper} variant="outlined" sx={{ maxHeight: "60vh", overflowX: "auto" }}>
              <Table
                stickyHeader
                size="small"
                aria-label="미입금 대관 목록"
                sx={{
                  minWidth: { xs: 590, md: 960 },
                  "& .MuiTableCell-root": { px: { xs: 1, sm: 1.5 } },
                }}
              >
                <TableHead>
                  <TableRow>
                    <TableCell>대관일</TableCell>
                    <TableCell>업체명</TableCell>
                    <TableCell>입금 현황</TableCell>
                    <TableCell align="right">확인 입금액</TableCell>
                    <TableCell align="right">견적가</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>담당자</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>연락처</TableCell>
                    <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>비고</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {unpaidRentals.map((item) => (
                    <TableRow
                      hover
                      key={item.id}
                      onClick={() => openUnpaidSchedule(item.id)}
                      sx={{ cursor: "pointer" }}
                    >
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {dayjs(item.start).format("YYYY-MM-DD")}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>{item.customerName}</TableCell>
                      <TableCell sx={{ whiteSpace: "nowrap" }}>
                        {Number(item.depositCount) > 0 ? (
                          <Chip
                            size="small"
                            color="warning"
                            variant="outlined"
                            label={`${item.depositTypes || "일부"} 입금`}
                            sx={{ fontWeight: 800, bgcolor: "#fff8e1" }}
                          />
                        ) : (
                          <Chip
                            size="small"
                            color="error"
                            label="입금 없음"
                            sx={{ fontWeight: 800 }}
                          />
                        )}
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap", fontWeight: 700 }}>
                        {Number(item.depositedAmount || 0).toLocaleString("ko-KR")}원
                      </TableCell>
                      <TableCell align="right" sx={{ whiteSpace: "nowrap" }}>
                        {Number(item.estPrice || 0).toLocaleString("ko-KR")}만원
                      </TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{item.contactPerson || "-"}</TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" }, whiteSpace: "nowrap" }}>{item.contactTel || "-"}</TableCell>
                      <TableCell sx={{ display: { xs: "none", md: "table-cell" } }}>{item.etc || "-"}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={fetchUnpaidRentals} disabled={unpaidLoading}>새로고침</Button>
          <Button onClick={() => setUnpaidOpen(false)} variant="contained">닫기</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default Schedule;
