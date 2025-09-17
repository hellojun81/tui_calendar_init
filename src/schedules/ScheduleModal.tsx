import React, { useEffect, useState, useCallback } from "react";
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
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  CircularProgress,
} from "@mui/material";

import RentPlaceSelector from "./RentPlaceSelector";
import {
  ScheduleModalProps,
  openJexcelModalUtil,
} from "../utils/scheduleUtils";
import JexcelModal from "./JexcelModal";
import GetCsKind from "./get_csKind";
import GetADmedia from "./get_ADmedia";
import DepositJspreadModal from "../common/DepositJspreadModal";
import type { GetPlaceMoneyResult } from "../types/pricing";

const API_URL =
  process.env.NODE_ENV === "production"
    ? process.env.REACT_APP_API_URL_PRODUCTION
    : process.env.REACT_APP_API_URL_LOCAL;

/* ──────────────────────────────────────────────────────────────────────────────
  작은 셀렉트 컴포넌트
────────────────────────────────────────────────────────────────────────────── */
interface TimePickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: string[];
}
const TimePicker: React.FC<TimePickerProps> = ({
  label,
  value,
  onChange,
  options,
}) => (
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

/* ──────────────────────────────────────────────────────────────────────────────
  타입
────────────────────────────────────────────────────────────────────────────── */
interface DepositItem {
  date: string;
  amount: number;
  memo?: string;
  bank?: string;
  balance?: number;
}

/* ──────────────────────────────────────────────────────────────────────────────
  메인 모달
────────────────────────────────────────────────────────────────────────────── */
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
}) => {
  /* ── 모든 훅은 최상단에서 항상 같은 순서로 호출 ─────────────────────────── */
  const [selrentPlace, setSelRentPlace] = useState<string[]>();
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  const [isJexcelModalOpen, setIsJexcelModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // 입금내역 모달
  const [depositOpen, setDepositOpen] = useState(false);
  const [depositLoading, setDepositLoading] = useState(false);
  const [deposits, setDeposits] = useState<DepositItem[]>([]);
  const [depositErr, setDepositErr] = useState<string>("");

  // 문자발송 모달
  const [smsOpen, setSmsOpen] = useState(false);
  const [smsTo, setSmsTo] = useState<string>("");
  const [smsMsg, setSmsMsg] = useState<string>("");
  const [smsSending, setSmsSending] = useState(false);

  // 문자 템플릿 상태
  type SmsTemplate = { id: number; title: string; body: string };

  const [tpls, setTpls] = useState<SmsTemplate[]>([]);
  const [tplLoading, setTplLoading] = useState(false);
  const [tplErr, setTplErr] = useState<string | null>(null);
  const [selectedTplId, setSelectedTplId] = useState<number | "">("");
  const [phototype, setphototype] = useState<string>("1");
  const [floortype, setfloortype] = useState<string>("1");
  const [resultMsg, setresultMsg] = useState<string>("");
  const [useHour, setuseHour] = useState<number>(4);
  const [tmoney, setTmoney] = useState<number>(0);
  const [userCnt, setUserCnt] = useState<number>(5);
  const [selectedFloors, setSelectedFloors] = useState<string[]>([]);
  const floorOptions = [
    { value: "1", label: "1층" },
    { value: "2", label: "2층" },
    { value: "3", label: "3층" },
  ];

  /* ── 유틸 ──────────────────────────────────────────────────────────────── */
  const openSelector = () => setIsSelectorOpen(true);
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
    (
      selectedCustomer: string,
      contact: string,
      etcText: string,
      Tel: string
    ) => {
      setCustomerName(selectedCustomer);
      setContactPerson(contact);
      setContactTel(Tel);
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
    console.log("rentPlace", rentPlace);
    if (!smsOpen) return;
    const loadTemplates = async () => {
      setTplLoading(true);
      setTplErr(null);
      try {
        const resp = await fetch(`${API_URL}/api/sms`, {
          credentials: "include",
        });
        console.log(resp);
        if (!resp.ok) throw new Error("템플릿 로딩 실패");
        const data: SmsTemplate[] = await resp.json();
        setTpls(Array.isArray(data) ? data : []);

        if (data && data.length > 0) {
          setSelectedTplId(data[0].id);
          if (!smsMsg || smsMsg.trim() === "") {
            setSmsMsg(data[0].body);
          }
        } else {
          setSelectedTplId("");
        }
      } catch (e: any) {
        setTplErr(e?.message || "템플릿 불러오기 실패");
      } finally {
        setTplLoading(false);
      }
    };

    loadTemplates();
  }, [smsOpen]);

  // ESC로 닫기
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

  // 모달 열릴 때 대관장소 배열화 & 문자 기본 메시지 구성
  // useEffect(() => {
  //   if (!isOpen) return;
  //   const arr = (rentPlace || "").split(",").filter(Boolean);
  //   setSelRentPlace(arr);

  //   setSmsTo(contactPerson || "");
  //   setSmsMsg(
  //     `[${customerName || ""}] 예약 문의\n` +
  //       `일시: ${newStart ? formatToKoreanTimeString(newStart) : ""} ${
  //         startTime || ""
  //       } ~ ` +
  //       `${newEnd ? formatToKoreanTimeString(newEnd) : ""} ${endTime || ""}\n` +
  //       `장소: ${rentPlace || ""}\n` +
  //       `견적: ${estPrice ? estPrice.toLocaleString() : ""}원`
  //   );
  // }, [
  //   isOpen,
  //   rentPlace,
  //   contactPerson,
  //   contactTel,
  //   customerName,
  //   newStart,
  //   newEnd,
  //   startTime,
  //   endTime,
  //   estPrice,
  // ]);

  // 입금내역 로드 (모달 열릴 때만)
  useEffect(() => {
    if (smsOpen && contactTel) {
      setSmsTo(contactTel);
    }
  }, [smsOpen, contactTel]);
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
  useEffect(() => {
    const loadDeposits = async () => {
      if (!depositOpen || !customerName) return;
      setDepositLoading(true);
      setDepositErr("");
      try {
        const resp = await fetch(
          `/api/bank/deposits?customer=${encodeURIComponent(customerName)}`,
          {
            credentials: "include",
          }
        );
        if (!resp.ok) throw new Error("서버 오류");
        const data: DepositItem[] = await resp.json();
        setDeposits(Array.isArray(data) ? data : []);
      } catch (err: any) {
        setDepositErr(err.message || "불러오기 실패");
        setDeposits([]);
      } finally {
        setDepositLoading(false);
      }
    };
    loadDeposits();
  }, [depositOpen, customerName]);

  /* ── 액션 핸들러 ───────────────────────────────────────────────────────── */
  const GetplaceMoney = (
    phototype: string,
    floor: string
  ): GetPlaceMoneyResult => {
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
      getplaceMoney: floor,
      userCnt: userCnt,
      overuser: overUser,
      overfee: overfee,
    });
    return { place: place, placeOriginfee: placeOriginfee, overfee: overfee };
  };

  function getHourDiff(start?: string, end?: string): number {
    if (!start || !end) return 0; // 혹은 throw
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    return (eh * 60 + em - (sh * 60 + sm)) / 60;
  }

  const handleSelectorChange = (selected: string[]) => {
    setSelRentPlace(selected);
    setRentPlace(selected.join(","));
  };
  const handleCheckboxChange = (value: string) => {
    setSelectedFloors((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };
  // const handleCheckboxChange = (value: string) => {
  //   setSelectedFloors((prev) =>
  //     prev.includes(value)
  //       ? prev.filter((item) => item !== value)
  //       : [...prev, value]
  //   );
  // };
  const handleDownEstimate = async () => {
    const userTim = getHourDiff(startTime, endTime);
    const userInt2 = userInt?.split("인")[0];
    console.log({ gubun, userInt2, userTim, selrentPlace, selectedFloors });
    // GetplaceMoney()
  };

  const handleDownloadCs = async () => {};
  const handleDownloadVat = async () => {};
  const handleDownloadEstimate = () =>
    downloadEstimate({
      no: "2025-0012",
      date: "2025-09-05",
      customerName: "Aube Studio 고객",
      bankInfo: "기업은행 027-162297-04-021 (주)타울",
      items: [
        {
          name: "스튜디오 렌탈(홀 A)",
          spec: "09:00~18:00",
          qty: 1,
          unit: 800000,
        },
        { name: "장비 대여", spec: "Aputure 600D", qty: 1, unit: 200000 },
      ],
    });

  async function downloadEstimate(payload: any, tries = 2, timeoutMs = 15000) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), timeoutMs); // ⏱ 타임아웃

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
      const url = URL.createObjectURL(
        new Blob([buf], { type: "application/pdf" })
      );
      const a = document.createElement("a");
      a.href = url;
      a.download = `estimate_${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      clearTimeout(t);

      // 네트워크/타임아웃/Abort 일 때 재시도
      const transient =
        err?.name === "AbortError" ||
        err?.message?.includes("NetworkError") ||
        err?.message?.includes("Failed to fetch");

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

  const handleSendSms = async () => {
    if (!smsTo) {
      alert("받는 번호를 입력해 주세요.");
      return;
    }
    setSmsSending(true);
    try {
      const resp = await fetch(`/api/sms/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          to: smsTo,
          message: smsMsg,
          scheduleId: id,
          customer: customerName,
        }),
      });
      if (!resp.ok) throw new Error("전송 실패");
      alert("문자를 전송했습니다.");
      setSmsOpen(false);
    } catch (e: any) {
      alert(`전송 실패: ${e.message}`);
    } finally {
      setSmsSending(false);
    }
  };

  /* ── 가드: 모든 훅 정의 이후에 배치 ────────────────────────────────────── */
  if (!isOpen) return null;

  /* ── 렌더 ─────────────────────────────────────────────────────────────── */
  return (
    <Dialog
      open={isOpen}
      onClose={closeModal}
      maxWidth="md"
      fullWidth
      sx={{ fontSize: "12px", maxWidth: "700px", margin: "0 auto" }}
    >
      <DialogTitle>
        {modalMode === "edit" ? `수정 [ID:${id}]` : "추가"}
      </DialogTitle>

      <DialogContent>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <GetCsKind onValueChange={setCsKind} csKind={csKind} />
          <GetADmedia onValueChange={setADmedia} ADmedia={ADmedia} />

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
            <Select
              value={userInt}
              onChange={(e) => setUserInt(e.target.value)}
            >
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

          {/* <FormControl fullWidth>
            <InputLabel>인원</InputLabel>
            <Select
              value={userInt}
              onChange={(e) => setUserInt(e.target.value)}
            >
              <MenuItem value="10인이하">10인이하</MenuItem>
              <MenuItem value="11~15인">11~15인</MenuItem>
              <MenuItem value="16~20인">16~20인</MenuItem>
              <MenuItem value="21~25인">21~25인</MenuItem>
              <MenuItem value="26~30인">26~30인</MenuItem>
              <MenuItem value="31인이상">31인이상</MenuItem>
            </Select>
          </FormControl> */}

          <TextField
            label="고객명"
            fullWidth
            value={customerName}
            required
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
            <Button variant="outlined" onClick={openSmsModal}>
              문자 발송
            </Button>
            <Button size="small" variant="outlined" onClick={openDepositModal}>
              입금내역 확인
            </Button>
            <Button onClick={handleDownloadEstimate} variant="outlined">
              견적서 다운로드
            </Button>
            <Button onClick={handleDownloadCs} variant="outlined">
              CS조회
            </Button>
            <Button onClick={handleDownloadVat} variant="outlined">
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
            <TimePicker
              label="시작 시간"
              value={startTime || "00:00"}
              onChange={setStartTime}
              options={generateHourOptions()}
            />
          </Box>

          <Box sx={{ display: "flex", gap: 2 }}>
            <TextField
              label="종료일"
              type="date"
              value={newEnd ? formatToKoreanTimeString(newEnd) : ""}
              onChange={(e) => setNewEnd(new Date(e.target.value))}
              fullWidth
            />
            <TimePicker
              label="종료 시간"
              value={endTime || "00:00"}
              onChange={setEndTime}
              options={generateHourOptions()}
            />
          </Box>

          <Box>
            <label style={{ fontSize: "15pt" }}>렌탈장소</label>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap", // 줄바꿈 가능
                gap: "12px", // 체크박스 사이 간격
                fontSize: "15pt", // 전체 텍스트 크기
              }}
            >
              {floorOptions.map((floor) => (
                <label
                  key={floor.value}
                  style={{ display: "flex", alignItems: "center", gap: "6px" }}
                >
                  <input
                    type="checkbox"
                    value={floor.value}
                    checked={selectedFloors.includes(floor.value)}
                    onChange={() => handleCheckboxChange(floor.value)}
                    style={{ width: "18px", height: "18px" }}
                  />
                  {floor.label}
                </label>
              ))}
            </div>
            {/* <p style={{ fontSize: "15pt" }}>
              선택된 층:{" "}
              {selectedFloors.length > 0 ? selectedFloors.join(", ") : "없음"}
            </p> */}
          </Box>

          <TextField
            label="대관장소"
            fullWidth
            value={(selrentPlace || []).join(", ")}
            onClick={openSelector}
            InputProps={{ readOnly: true }}
          />
          {isSelectorOpen && (
            <RentPlaceSelector
              selectedPlaces={selrentPlace || []}
              onChange={handleSelectorChange}
              onClose={closeSelector}
            />
          )}

          <Box sx={{ display: "flex", gap: 1 }}>
            <TextField
              label="견적가"
              fullWidth
              value={formatNumber(estPrice || 0)}
              onChange={handlePriceChange}
              sx={{ flex: 7 }} // 70%
            />
            <Button
              onClick={handleDownEstimate}
              variant="outlined"
              sx={{ flex: 3 }} // 30%
            >
              견적
            </Button>
          </Box>
          <TextField
            label="비고"
            fullWidth
            value={etc}
            onChange={(e) => setEtc(e.target.value)}
            multiline
          />
        </Box>
      </DialogContent>

      <DialogActions>
        <Button onClick={onSaveSchedule} color="primary" variant="outlined">
          저장
        </Button>
        {modalMode === "edit" && (
          <Button
            onClick={() => onDeleteSchedule(Number(id))}
            variant="outlined"
          >
            삭제
          </Button>
        )}

        <Button onClick={closeModal} color="primary" variant="contained">
          취소
        </Button>
      </DialogActions>

      {/* 고객 검색 모달 */}
      <JexcelModal
        isOpen={isJexcelModalOpen}
        onClose={closeJexcelModal}
        onSelect={onSelectCustomer}
        searchQuery={searchQuery}
      />

      {/* 입금내역 모달 */}
      <Dialog
        open={depositOpen}
        onClose={() => setDepositOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          입금내역 {customerName ? `- ${customerName}` : ""}
        </DialogTitle>
        <DialogContent dividers>
          <DepositJspreadModal
            open={depositOpen}
            onClose={() => setDepositOpen(false)}
            customerName={customerName}
            baseUrl="http://localhost:8001"
            listPath="/api/bank" // GET 목록 엔드포인트
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDepositOpen(false)}>닫기</Button>
        </DialogActions>
      </Dialog>

      {/* 문자 발송 모달 */}

      <Dialog
        open={smsOpen}
        onClose={() => setSmsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>문자 발송</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* 템플릿 제목 선택 */}
            <FormControl fullWidth size="small">
              <InputLabel id="sms-tpl-label">템플릿 제목</InputLabel>
              <Select
                labelId="sms-tpl-label"
                label="템플릿 제목"
                value={selectedTplId}
                onChange={(e) => {
                  const id = e.target.value as number;
                  setSelectedTplId(id);
                  const found = tpls.find((t) => t.id === id);
                  if (found) setSmsMsg(found.body);
                }}
                disabled={tplLoading || !!tplErr}
                displayEmpty
              >
                {tplLoading && (
                  <MenuItem value="" disabled>
                    불러오는 중...
                  </MenuItem>
                )}
                {tplErr && (
                  <MenuItem value="" disabled>
                    {tplErr}
                  </MenuItem>
                )}
                {!tplLoading && !tplErr && tpls.length === 0 && (
                  <MenuItem value="" disabled>
                    (사용 가능한 템플릿 없음)
                  </MenuItem>
                )}
                {tpls.map((t) => (
                  <MenuItem key={t.id} value={t.id}>
                    {t.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="받는 번호"
              value={smsTo}
              onChange={(e) => setSmsTo(e.target.value)}
              placeholder="01012345678"
              fullWidth
            />

            <TextField
              label={`메시지${smsMsg ? ` (${smsMsg.length}자)` : ""}`}
              value={smsMsg}
              onChange={(e) => setSmsMsg(e.target.value)}
              fullWidth
              multiline
              minRows={6}
              placeholder="템플릿을 선택하면 자동으로 채워집니다."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSmsOpen(false)}>취소</Button>
          <Button
            onClick={handleSendSms}
            disabled={smsSending || !smsTo || !smsMsg}
            variant="contained"
          >
            {smsSending ? "전송중..." : "전송"}
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default ScheduleModal;
