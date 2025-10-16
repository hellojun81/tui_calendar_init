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
import { formatMoney, formatDate, extractPersonnelNumber, formatEstPriceToAmount } from "../../../tui_calendar_init/src/utils/util";
import InvoiceIssueModal from "../components/InvoiceIssueModal";
import KakaoSender from "../components/kakaoSender";
// import { formatEstPriceToAmount, extractPersonnelNumber } from "../utils/scheduleModalUtils";

const API_URL = process.env.NODE_ENV === "production" ? process.env.REACT_APP_API_URL_PRODUCTION : process.env.REACT_APP_API_URL_LOCAL;

interface TimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}
const TimePicker: React.FC<TimePickerProps> = ({ label, value, onChange, options }) => (
  <FormControl fullWidth>
    <InputLabel>{label}</InputLabel>
    <Select value={value} onChange={(e) => onChange(e.target.value)}>
      {options.map((option) => (
        <MenuItem key={option} value={option}>
          {option}
        </MenuItem>
      ))}
    </Select>
  </FormControl>
);

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
}) => {
  const [selrentPlace, setSelRentPlace] = useState<string[]>();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const [isJexcelModalOpen, setIsJexcelModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [depositOpen, setDepositOpen] = useState(false);
  const [smsOpen, setSmsOpen] = useState(false);
  // const [smsTo, setSmsTo] = useState<string>("");
  // const [smsMsg, setSmsMsg] = useState<string>("");
  // const [smsSending, setSmsSending] = useState(false);
  // CS 모달 상태
  const [csOpen, setCsOpen] = useState(false);
  const [vatOpen, setVatOpen] = useState(false);

  const [selectedFloors, setSelectedFloors] = useState<string[]>([]);
  const floorOptions = [
    { value: "1", label: "1층" },
    { value: "2", label: "2층" },
    { value: "3", label: "3층" },
  ];

  /* ── 유틸 ──────────────────────────────────────────────────────────────── */
  // const openSelector = () => setIsSelectorOpen(true);
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
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
        closeSelector();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [closeModal]);

  // 입금내역 로드 (모달 열릴 때만)
  // useEffect(() => {
  //   if (smsOpen && contactTel) {
  //     setSmsTo(contactTel);
  //   }
  // }, [smsOpen, contactTel]);
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

  function getHourDiff(start?: string, end?: string): number {
    if (!start || !end) return 0; // 혹은 throw
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return (eh * 60 + em - (sh * 60 + sm)) / 60;
  }

  const handleCheckboxChange = (value: string) => {
    setSelectedFloors((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const handleDownEstimate = async () => {
    const userTim = getHourDiff(startTime, endTime);
    const userInt2 = userInt?.split("인")[0];
    console.log({ gubun, userInt2, userTim, selectedFloors });
    let totalMoney = 0;
    let totalMsg = "";
    let floortotalMoney = 0;

    for (let i = 0; i < selectedFloors.length; i++) {
      const phototype = gubun ?? "";
      let info = GetplaceMoney(phototype, selectedFloors[i], Number(userInt2), Number(userTim));
      console.log({ 계산하기: phototype, info: info });

      let floortotalMoney = 0;

      switch (phototype) {
        case "3":
          // 행사일 경우 이미 총액이므로 곱하기 필요 없음
          floortotalMoney = info.placeOriginfee * 10;
          break;
        case "2":
          // 행사일 경우 이미 총액이므로 곱하기 필요 없음
          floortotalMoney = (info.placeOriginfee * userTim + info.overfee) * 1.1;
          break;

        default:
          // 사진/영상 등은 시간당 요금 + 초과요금
          floortotalMoney = info.placeOriginfee * userTim + info.overfee;
          break;
      }
      totalMoney += floortotalMoney;
    }
    setEstprice(totalMoney);
  };

  // const handleDownloadCs = async () => {};
  // const handleDownloadVat = async () => {};
  const handleDownloadEstimate = () => {
    console.log(formatDate(newStart));
    const userTime = getHourDiff(startTime, endTime);
    const formattedFloors = selectedFloors.map((floor) => `${floor}층`);
    const today = new Date();
    downloadEstimate({
      no: "2025-0012",
      date: `${today}`,
      customerName: customerName,
      bankInfo: "기업은행 027-162297-04-021 (주)타울",
      items: [
        {
          name: `스튜디오 렌탈_ ${gubun}`,
          spec: `${formattedFloors}`,
          qty: 1,
          unit: estPrice,
        },
        {
          name: `촬영일`,
          spec: `${formatDate(newStart)}~${formatDate(newEnd)}`,
          qty: 1,
          unit: 0,
        },

        {
          name: `사용시간 `,
          spec: `${startTime}~${endTime}`,
          qty: `${userTime}시간`,
          // unit: estPrice,
        },
        {
          name: `스튜디오 사용인원 `,
          spec: `${userInt}`,
          qty: 0,
          // unit: estPrice,
        },
      ],
    });
  };

  async function downloadEstimate(payload: any, tries = 2, timeoutMs = 15000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs); // ⏱ 타임아웃
    console.log(payload);
    try {
      const r = await fetch(`${API_URL}/api/estimates/pdf`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });

      clearTimeout(t);

      // 1) HTTP 에러면 본문 읽고 사용자에게 보여주고 중단
      if (!r.ok) {
        const msg = await r.text().catch(() => "");
        throw new Error(`서버 오류(${r.status}) ${msg}`);
      }

      // 2) PDF 유효성 간이검사(파일 헤더가 %PDF?)
      const buf = await r.arrayBuffer();
      const head = String.fromCharCode(...new Uint8Array(buf).slice(0, 4));
      if (head !== "%PDF") {
        throw new Error(`PDF 헤더 아님: ${head}`);
      }

      // 3) 다운로드
      const url = URL.createObjectURL(new Blob([buf], { type: "application/pdf" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = `estimate_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      clearTimeout(t);

      // 네트워크/타임아웃/Abort 일 때 재시도
      const transient = err?.name === "AbortError" || err?.message?.includes("NetworkError") || err?.message?.includes("Failed to fetch");

      if (transient && tries > 0) {
        // 짧게 쉬고 재시도
        await new Promise((r) => setTimeout(r, 800));
        return downloadEstimate(payload, tries - 1, timeoutMs);
      }

      // 최종 에러 표기
      alert(`PDF 다운로드 실패: ${err?.message || err}`);
      throw err;
    }
  }

  const openDepositModal = () => {
    if (!customerName) {
      alert("고객명을 먼저 선택해 주세요.");
      return;
    }
    setDepositOpen(true);
  };

  const openSmsModal = () => setSmsOpen(true);

  const updateMoneyFinish = async () => {
    const currentStatus = Number(moneyFinishNY);
    const isFinish = currentStatus === 1 ? 0 : 1;

    // 🚨 1. 오류 처리를 위해 try...catch 블록 사용
    try {
      const res = await axios.put(`${API_URL}/api/popbill/bank/updateMoneyfinish`, {
        id: id,
        isFinish: isFinish,
      });
      console.log(res);
      // 🚨 2. 서버 응답(res.data)에서 message 속성을 추출하여 alert
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
              문자 발송
            </Button>
            <Button size="small" variant="outlined" onClick={openDepositModal} fullWidth>
              {Number(moneyFinishNY) === 1 ? "입금내역 확인[완료건]" : "입금내역 확인"}
            </Button>

            <Button onClick={() => setVatOpen(true)} variant="outlined" fullWidth>
              세금계산서
            </Button>
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="시작일"
              type="date"
              value={newStart ? formatToKoreanTimeString(newStart) : ""}
              onChange={(e) => setNewStart(new Date(e.target.value))}
              fullWidth
            />
            <TimePicker label="시작 시간" value={startTime || "00:00"} onChange={setStartTime} options={generateHourOptions()} />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="종료일"
              type="date"
              value={newEnd ? formatToKoreanTimeString(newEnd) : ""}
              onChange={(e) => setNewEnd(new Date(e.target.value))}
              fullWidth
            />
            <TimePicker label="종료 시간" value={endTime || "00:00"} onChange={setEndTime} options={generateHourOptions()} />
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
            <Button
              onClick={handleDownEstimate}
              variant="contained"
              sx={{ flex: 2 }} // 30%
            >
              견적
            </Button>
            <Button onClick={handleDownloadEstimate} variant="outlined" sx={{ flex: 3 }}>
              견적서 다운로드
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
      <JexcelModal isOpen={isJexcelModalOpen} onClose={closeJexcelModal} onSelect={onSelectCustomer} searchQuery={searchQuery} />

      {/* 입금내역 모달 */}
      <Dialog open={depositOpen} onClose={() => setDepositOpen(false)} maxWidth="md">
        <DialogTitle>
          입금내역 [{formatDate(newStart) ? `${formatDate(newStart)}` : ""}]{customerName ? ` ${customerName} ` : ""}
        </DialogTitle>
        <DialogContent dividers>
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
        <InvoiceIssueModal defaultInvoiceeCorpName={customerName} />
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
        onClose={() => setSmsOpen(false)}
        maxWidth={false}
        // 2. PaperProps를 사용하여 내부 Paper 컴포넌트의 최대 너비를 직접 설정
        PaperProps={{
          sx: {
            // ⭐️ 핵심: md(900px)보다 작은 값으로 직접 설정합니다.
            maxWidth: 650, // 예: 850px (md의 900px보다 약간 작게)
            width: "100%", // 너비는 100%로 유지
          },
        }}
      >
        <DialogTitle>알림톡</DialogTitle>
        <KakaoSender
          sendApiUrl="/api/popbill/kakao/MessageSend"
          // 🚨 스케줄 모달 데이터를 KakaoSender의 초기값으로 전달
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
          <Button onClick={() => setSmsOpen(false)} color="primary" variant="contained">
            닫기
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ScheduleModal;
