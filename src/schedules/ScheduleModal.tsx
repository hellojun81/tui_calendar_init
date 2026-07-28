import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Paper,
  FormGroup,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import Cs from "../cs/cs";
import Bank from "../Bank";
import axios from "axios";
import { ScheduleModalProps, openJexcelModalUtil } from "../utils/scheduleUtils";
import JexcelModal from "./JexcelModal";
import GetCsKind from "./get_csKind";
import GetADmedia from "./get_ADmedia";
import type { GetPlaceMoneyResult } from "../types/pricing";
import { formatDate, extractPersonnelNumber, formatEstPriceToAmount } from "../utils/util";
import InvoiceIssueModal from "../components/InvoiceIssueModal";
import EstimateDocumentModal from "../components/EstimateDocumentModal";
import KakaoSender from "../components/kakaoManager";
import Customers from "./customers"
// import { formatEstPriceToAmount, extractPersonnelNumber } from "../utils/scheduleModalUtils";

const API_URL = process.env.NODE_ENV === "production" ? process.env.REACT_APP_API_URL_PRODUCTION : process.env.REACT_APP_API_URL_LOCAL;

interface TimePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}
const TimePicker: React.FC<TimePickerProps> = ({ value, onChange }) => {
  // value는 "HH:mm" 형식이라고 가정
  const [hour, minute] = value.split(':');
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minutes = ['00', '10', '20', '30', '40', '50'];

  return (
    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
      {/* 시간 선택 */}
      <FormControl size="small" sx={{ minWidth: '70px' }}>
        <Select
          value={hour}
          onChange={(e) => onChange(`${e.target.value}:${minute}`)}
          MenuProps={{ PaperProps: { style: { maxHeight: 250 } } }}
        >
          {hours.map((h) => (
            <MenuItem key={h} value={h}>{h}시</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Typography sx={{ fontWeight: 'bold' }}>:</Typography>

      {/* 분 선택 */}
      <FormControl size="small" sx={{ minWidth: '70px' }}>
        <Select
          value={minute}
          onChange={(e) => onChange(`${hour}:${e.target.value}`)}
        >
          {minutes.map((m) => (
            <MenuItem key={m} value={m}>{m}분</MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );
};

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  modalMode,
  id,
  newStart,
  newEnd,
  customerName,
  gubun,
  userInt,
  estPrice,
  etc,
  rentPlace,
  csKind,
  ADmedia,
  startTime,
  endTime,
  customerEtc,
  contactPerson,
  contactTel,
  moneyFinishNY,
  messageLogCount,
  vatSendCount,
  setNewStart,
  setNewEnd,
  onSaveSchedule,
  onDeleteSchedule,
  closeModal,
  setCustomerName,
  setRentPlace,
  setGubun,
  setUserInt,
  setEstprice,
  setEtc,
  setCsKind,
  setADmedia,
  setStartTime,
  setEndTime,
  setCustomerEtc,
  setContactPerson,
  setContactTel,
  setmoneyFinishNY,
  isSmsModalOpen,
  setIsSmsModalOpen,
}) => {
  const smsOpen = isSmsModalOpen ?? false;
  const setSmsOpen = setIsSmsModalOpen;
  const [selrentPlace, setSelRentPlace] = useState<string[]>();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const [isJexcelModalOpen, setIsJexcelModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  // const [smsOpen, setSmsOpen] = useState(false);
  const [csOpen, setCsOpen] = useState(false);
  const [vatOpen, setVatOpen] = useState(false);
  const [estimateOpen, setEstimateOpen] = useState(false);

  const [selectedFloors, setSelectedFloors] = useState<string[]>([]);
  const floorOptions = [
    { value: "1", label: "1층" },
    { value: "2", label: "2층" },
    { value: "3", label: "3층" },
  ];

  /* ── 유틸 ──────────────────────────────────────────────────────────────── */
  // const openSelector = () => setIsSelectorOpen(true);
  // console.log('rentplace',rentPlace)
  const closeSelector = () => setIsSelectorOpen(false);
  const formatToKoreanTimeString = (date: Date): string => {
    if (!date) return "";
    const year = date.getFullYear();
    const month = ("0" + (date.getMonth() + 1)).slice(-2);
    const day = ("0" + date.getDate()).slice(-2);
    return `${year}-${month}-${day}`;
  };

  const openJexcelModal = useCallback((name: string) => {
    openJexcelModalUtil(name, setSearchQuery, setIsJexcelModalOpen);
  }, []);
  const closeJexcelModal = useCallback(() => setIsJexcelModalOpen(false), []);

  const formatNumber = (num: number | string) => {
    if (!num && num !== 0) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, "");
    const numericValue = Number(value);
    if (!isNaN(numericValue)) setEstprice(numericValue);
  };

  const onSelectCustomer = useCallback(
    (selectedCustomer: string, contact: string, etcText: string, Tel: string) => {
      setCustomerName(selectedCustomer);
      setContactPerson(contact);
      setContactTel?.(Tel);
      setCustomerEtc(etcText);
    },
    [setContactPerson, setCustomerEtc, setCustomerName, setContactTel]
  );

  const generateHourOptions = () => {
    const hours: string[] = [];
    for (let i = 0; i < 24; i++) hours.push(`${i < 10 ? "0" : ""}${i}:00`);
    return hours;
  };
  const hourOptions = generateHourOptions();

  /* ── Effects (조건은 콜백 내부에서 가드) ───────────────────────────────── */
useEffect(() => {
  if (isOpen) {
    console.log("[ScheduleModal OPEN 직전] rentPlace =", rentPlace);
  }
}, [isOpen]);

useEffect(() => {
  if (!isOpen) return;

  if (!rentPlace) {
    setSelectedFloors([]);       // 비어있으면 체크 해제(초기화)
    return;
  }

  const parsed = rentPlace
    .split(",")
    .map((s) => s.match(/\d+/)?.[0])
    .filter((v): v is string => Boolean(v));

  setSelectedFloors(parsed);
}, [isOpen, rentPlace]);


  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
        closeSelector();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeModal]);

  useEffect(() => {
    if (!rentPlace) return;
    const parsed = rentPlace
      .split(",")
      .map((s) => s.match(/\d+/)?.[0]) // "1층" -> "1"
      .filter((v): v is string => Boolean(v));
    setSelectedFloors(parsed);

  }, [rentPlace]);

  useEffect(() => {
    setRentPlace(selectedFloors.join(",")); // "1층,2층"
  }, [selectedFloors, setRentPlace]);

  const handleOpenVatModal = () => {
    if (Number(vatSendCount) > 0) {
      alert(`해당 스케쥴에 이미 ${vatSendCount}건의 세금계산서 발행 이력이 있습니다.`);
    }
    setVatOpen(true);
  };
  useEffect(() => {
    // depositOpen 상태가 true일 때만 실행
    if (depositOpen) {
      // 복사할 내용 생성: "입금내역 [YYYY-MM-DD] 고객명 " 형식
      const contentToCopy = `${newStart ? formatDate(newStart) : ""} ${customerName ? customerName : ""}`;

      // 클립보드 복사 로직 (iframe 환경 호환성을 위해 document.execCommand('copy') 사용)
      const tempTextArea = document.createElement("textarea");
      // 복사를 위해 DOM에 임시로 추가
      tempTextArea.value = contentToCopy.trim();
      document.body.appendChild(tempTextArea);
      tempTextArea.select();

      try {
        // document.execCommand('copy')는 구형이지만, iframe 환경에서 navigator.clipboard보다 안정적입니다.
        document.execCommand("copy");
        console.log(`자동 클립보드 복사 성공: ${contentToCopy}`);
        // 사용자에게 피드백을 주려면 Snackbar 등을 사용할 수 있습니다.
      } catch (err) {
        console.error("클립보드 복사 실패:", err);
      }
      // 사용 후 DOM에서 제거
      document.body.removeChild(tempTextArea);
    }
  }, [depositOpen, newStart, customerName]); // depositOpen, newStart, customerName 변경 시 재실행

  /* ── 견적 계산기───────────────────────────────────────────────────────── */
  const GetplaceMoney = (phototype: string, floor: string, userCnt: number, useHour: number): GetPlaceMoneyResult => {
    let placeOriginfee = 0;
    let place = 0;
    let basicUser = 0;
    let overUser = 0;
    let overfee = 0;

    switch (
      floor ///묶음 할인가 적용
    ) {
      case "1": //1층+별채+마당
        placeOriginfee = 200000;
        place = 1;
        basicUser = 10;
        overUser = userCnt - basicUser;
        break;
      case "2": //1층+2층
        placeOriginfee = 100000;
        place = 2;
        basicUser = 5;
        overUser = userCnt - basicUser;

        break;
      case "3": //1층+3층
        placeOriginfee = 100000;
        place = 3;
        basicUser = 5;
        overUser = userCnt - basicUser;
        break;
    }
    overfee = overUser * 5000 * useHour;
    if (overfee < 0) {
      overfee = 0;
    }

    console.log({
      placeOriginfee: placeOriginfee,
      getplaceMoney: floor,
      userCnt: userCnt,
      overuser: overUser,
      overfee: overfee,
      useHour: useHour,
    });
    return { place: place, placeOriginfee: placeOriginfee, overfee: overfee };
  };

  const handleCheckboxChange = (value: string) => {
    setSelectedFloors((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const openDepositModal = () => {
    if (!customerName) {
      alert("고객명을 먼저 선택해 주세요.");
      return;
    }
    setDepositOpen(true);
  };

  const openSmsModal = () => {
    // 🚨 setIsSmsModalOpen 프롭스를 사용해야 합니다.
    if (setIsSmsModalOpen) {
      setIsSmsModalOpen(true);
    }
  };

  const updateMoneyFinish = async () => {
    const currentStatus = Number(moneyFinishNY);
    const isFinish = currentStatus === 1 ? 0 : 1;
    try {
      const res = await axios.put(`${API_URL}/api/popbill/bank/updateMoneyfinish`, {
        id: id,
        isFinish: isFinish,
      });
      const successMessage = res.data.message || "입금 상태 처리가 완료되었습니다.";
      alert(successMessage);

      if (typeof setmoneyFinishNY === "function") {
        setmoneyFinishNY(isFinish);
      }
    } catch (error) {
      alert(`오류 발생`);
    }
  };

  /* ── 가드: 모든 훅 정의 이후에 배치 ────────────────────────────────────── */
  if (!isOpen) return null;
  const formattedAmount = formatEstPriceToAmount(estPrice);
  const formattedPersonnel = extractPersonnelNumber(userInt);
  const estimateDocumentKey =
    modalMode === "edit" && id
      ? `schedule-${id}`
      : `draft-${formatToKoreanTimeString(newStart || new Date())}-${customerName || "new"}`;
  /* ── 렌더 ─────────────────────────────────────────────────────────────── */
  return (
    <Dialog open={isOpen} onClose={closeModal} maxWidth="md" fullWidth sx={{ fontSize: "12px", maxWidth: "700px", margin: "0 auto" }}>
      <DialogTitle>{modalMode === "edit" ? `수정 [ID:${id}]` : "추가"}</DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <GetCsKind onValueChange={setCsKind} csKind={csKind} />
          <GetADmedia onValueChange={setADmedia ?? (() => {})} ADmedia={ADmedia} />
          <FormControl fullWidth>
            <InputLabel>촬영구분</InputLabel>
            <Select value={gubun} onChange={(e) => setGubun(e.target.value)}>
              <MenuItem value="사진">사진</MenuItem>
              <MenuItem value="영상">영상</MenuItem>
              <MenuItem value="행사">행사</MenuItem>
              <MenuItem value="전시">전시</MenuItem>
              <MenuItem value="비영리">비영리</MenuItem>
              <MenuItem value="기타">기타</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>인원</InputLabel>
            <Select value={userInt} onChange={(e) => setUserInt(e.target.value)}>
              {/* 10인이하 */}
              <MenuItem value="10인이하">10인이하</MenuItem>

              {/* 11~100인 */}
              {Array.from({ length: 90 }, (_, i) => {
                const num = i + 11; // 11부터 시작
                return (
                  <MenuItem key={num} value={`${num}인`}>
                    {num}인
                  </MenuItem>
                );
              })}

              {/* 100인이상 */}
              <MenuItem value="100인이상">100인이상</MenuItem>
            </Select>
          </FormControl>
          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="고객명"
              fullWidth
              value={customerName}
              required
              sx={{ flex: 8 }}
              onChange={(e) => setCustomerName(e.target.value)}
              InputProps={{
                readOnly: true,
                endAdornment: (
                  <Box sx={{ display: "flex", gap: 1 }}>
                    <Button
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        openJexcelModal(customerName);
                      }}
                    >
                      검색
                    </Button>
                  </Box>
                ),
              }}
            />
            <Button onClick={() => setCsOpen(true)} variant="contained" sx={{ flex: 2 }}>
              CS 내역조회
            </Button>
          </Box>
          <Box>
            <Box sx={{ display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>{`담당자명: ${contactPerson || ""}`}</Box>
              <Box sx={{ flex: 1 }}>{`전화번호: ${contactTel || ""}`}</Box>
            </Box>
            <Box>{`비고: ${customerEtc || ""}`}</Box>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1,
              flexDirection: { xs: "column", sm: "row" }, // 모바일(xs)에서는 세로, sm 이상에서는 가로
            }}
          >
            <Button variant="outlined" onClick={openSmsModal} fullWidth>
              알림톡[{messageLogCount}]
            </Button>
            <Button size="small" variant="outlined" onClick={openDepositModal} fullWidth>
              {Number(moneyFinishNY) === 1 ? "입금내역 확인[완료건]" : "입금내역 확인"}
            </Button>

            <Button onClick={handleOpenVatModal} variant="outlined" fullWidth>
              세금계산서[{vatSendCount}]
            </Button>
          </Box>


{/* 시작일 및 시작 시간 */}
<Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 1 }}>
  <Box sx={{ flex: 1.5 }}> {/* 날짜 입력창 비율 조절 */}
    <TextField
      label="시작일"
      type="date"
      value={newStart ? formatToKoreanTimeString(newStart) : ""}
      onChange={(e) => setNewStart(new Date(e.target.value))}
      fullWidth
      InputLabelProps={{ shrink: true }}
    />
  </Box>
  <Box sx={{ flex: 1 }}> {/* 시간 선택창이 찌그러지지 않게 여유 공간 할당 */}
    <TimePicker
      value={startTime || "00:00"}
      onChange={setStartTime}
      options={generateHourOptions()}
    />
  </Box>
</Box>

{/* 종료일 및 종료 시간 */}
<Box sx={{ display: "flex", gap: 2, alignItems: "center", mt: 1 }}>
  <Box sx={{ flex: 1.5 }}>
    <TextField
      label="종료일"
      type="date"
      value={newEnd ? formatToKoreanTimeString(newEnd) : ""}
      onChange={(e) => setNewEnd(new Date(e.target.value))}
      fullWidth
      InputLabelProps={{ shrink: true }}
    />
  </Box>
  <Box sx={{ flex: 1 }}>
    <TimePicker
      value={endTime || "00:00"}
      onChange={setEndTime}
      options={generateHourOptions()}
    />
  </Box>
</Box>
          <Box sx={{ position: "relative", mt: 1 }}>
            {/* 라벨 (TextField의 떠있는 라벨처럼) */}
            <Typography
              variant="caption"
              sx={{
                position: "absolute",
                top: -8, // 라벨을 테두리 위로 살짝
                left: 10, // 좌측 간격
                px: 0.5, // 라벨 배경 여백
                bgcolor: "background.paper",
                lineHeight: 1,
                fontSize: 13,
                color: "#696969ff",
              }}
            >
              렌탈장소
            </Typography>

            {/* 아웃라인 박스 (TextField의 Outlined 스타일처럼) */}
            <Paper
              variant="outlined"
              sx={{
                borderRadius: 1.5,
                p: 1.5,
                pt: 2, // 라벨과 안겹치게 윗쪽 여백 살짝 추가
                borderColor: "#c2c2c2ff",
              }}
            >
              <FormGroup
                row
                sx={{
                  display: "flex",
                  flexWrap: "wrap",
                  gap: 1.75, // 버튼 사이 간격 (≈14px)
                  "& .MuiFormControlLabel-root": { m: 0 }, // 기본 마진 제거
                }}
              >
                {floorOptions.map((floor) => (
                  <FormControlLabel
                    key={floor.value}
                    control={
                      <Checkbox size="small" checked={selectedFloors.includes(floor.value)} onChange={() => handleCheckboxChange(floor.value)} />
                    }
                    label={<Typography sx={{ fontSize: 16 /* 비고와 비슷한 크기 */ }}>{floor.label}</Typography>}
                  />
                ))}
              </FormGroup>
            </Paper>
          </Box>
          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label="견적가"
              fullWidth
              value={formatNumber(estPrice || 0)}
              onChange={handlePriceChange}
              sx={{ flex: 5 }} // 70%
            />
            <Button onClick={() => setEstimateOpen(true)} variant="outlined" sx={{ flex: 3, whiteSpace: "nowrap" }}>
              견적서 작성/출력
            </Button>
          </Box>
          <TextField label="비고" fullWidth value={etc} onChange={(e) => setEtc(e.target.value)} multiline />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onSaveSchedule} color="primary" variant="outlined">
          저장
        </Button>
        {modalMode === "edit" && (
          <Button onClick={() => onDeleteSchedule(Number(id))} variant="outlined">
            삭제
          </Button>
        )}

        <Button onClick={closeModal} color="primary" variant="contained">
          취소
        </Button>
      </DialogActions>

      {/* 고객 검색 모달 */}
      <Customers isOpen={isJexcelModalOpen} onClose={closeJexcelModal} onSelect={onSelectCustomer} searchQuery={searchQuery} />

      <EstimateDocumentModal
        open={estimateOpen}
        onClose={() => setEstimateOpen(false)}
        documentKey={estimateDocumentKey}
        scheduleId={id}
        customerName={customerName}
        contactPerson={contactPerson}
        contactTel={contactTel}
        estimatePrice={estPrice}
        shootingType={gubun}
        rentPlace={rentPlace}
        startDate={newStart}
        endDate={newEnd}
        startTime={startTime}
        endTime={endTime}
        personnel={userInt}
      />

      {/* 입금내역 모달 */}
      <Dialog
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        maxWidth="xl"
        fullWidth
        PaperProps={{
          sx: {
            width: "calc(100% - 24px)",
            maxWidth: 1500,
            maxHeight: "calc(100% - 24px)",
            m: 1.5,
            boxSizing: "border-box",
          },
        }}
      >
        <DialogTitle sx={{ pr: 3, fontSize: { xs: "1.1rem", sm: "1.35rem" }, fontWeight: 800 }}>
          입금내역 [ {formatDate(newStart) ? `${formatDate(newStart)}` : ""}]{customerName ? ` ${customerName} ` : ""}
          계약금:{estPrice ? ` ${estPrice} ` : ""}
        </DialogTitle>
        <DialogContent dividers sx={{ p: { xs: 1, sm: 2 }, overflowX: "hidden" }}>
          <Bank embedded defaultCustomerName={customerName} autoSearch />
        </DialogContent>
        <DialogActions>
          <Box
            sx={{
              width: "100%",
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <Button onClick={updateMoneyFinish} color="primary">
              {Number(moneyFinishNY) === 1 ? "입금완료 취소" : "입금완료 처리"}
            </Button>
            <Button onClick={() => setDepositOpen(false)} color="inherit">
              닫기
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* cs내역조회 모달 */}
      <Dialog open={csOpen} onClose={() => setCsOpen(false)} maxWidth="md">
        <DialogTitle>CS 내역 조회</DialogTitle>
        <DialogContent dividers>
          {/* <Cs />
           */}
          <Cs embedded defaultCustomerName={customerName} autoSearch />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCsOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 세금계산서 모달 */}
      <Dialog open={vatOpen} onClose={() => setVatOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>세금계산서 발행</DialogTitle>
        <InvoiceIssueModal defaultInvoiceeCorpName={customerName} scheduleId={id} />
        <DialogActions>
          {/* 🚨 KakaoSender 내부 폼과 중복되므로 전송 버튼 제거를 권장합니다. */}
          <Button onClick={() => setVatOpen(false)} color="primary" variant="contained">
            닫기
          </Button>
        </DialogActions>
      </Dialog>

      {/* 문자 발송 모달 */}
      <Dialog
        open={smsOpen}
        onClose={() => {
          // setSmsModalOpen이 존재할 때만 함수 호출
          if (setIsSmsModalOpen) {
            setIsSmsModalOpen(false);
          }
        }}
        maxWidth={false}
        // 2. PaperProps를 사용하여 내부 Paper 컴포넌트의 최대 너비를 직접 설정
        PaperProps={{
          sx: {
            // ⭐️ 핵심: md(900px)보다 작은 값으로 직접 설정합니다.
            maxWidth: 650, // 예: 850px (md의 900px보다 약간 작게)
            width: "100%", // 너비는 100%로 유지입
          },
        }}
      >
        <DialogTitle>알림톡</DialogTitle>
        <KakaoSender
          sendApiUrl="/api/popbill/kakao/MessageSend"
          // 🚨 스케줄 모달 데이터를 KakaoSender의 초기값으로 전달
          defaultID={id || 0}
          defaultReceiver={contactTel || ""}
          defaultCustomerName={customerName || ""}
          defaultReservationStartDate={newStart ? formatToKoreanTimeString(newStart) : ""}
          defaultReservationStartTime={startTime || ""}
          defaultReservationEndDate={newEnd ? formatToKoreanTimeString(newEnd) : ""}
          defaultReservationEndTime={endTime || ""}
          defaultRentPlace={rentPlace || ""}
          defaultUsagePersonnel={formattedPersonnel} // "10인이하"에서 숫자만 추출
          defaultAmount={formattedAmount} // 금액 (숫자)
          defaultEtc1={etc || ""} // 비고
          // etc2, etc3 등 추가 정보는 ScheduleModal에 해당 데이터가 없어 전달하지 않습니다.
        />
        <DialogActions>
          {/* 🚨 KakaoSender 내부 폼과 중복되므로 전송 버튼 제거를 권장합니다. */}
          <Button
            onClick={() => {
              if (setIsSmsModalOpen) {
                setIsSmsModalOpen(false);
              }
            }}
            color="primary"
            variant="contained"
          >
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ScheduleModal;
