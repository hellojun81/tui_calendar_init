import React, { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import dayjs, { Dayjs } from "dayjs";
import { formatRentPlaceForKakao, apiUrl } from "../../../tui_calendar_init/src/utils/util";
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  Stack,
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  TextField,
  Button,
  Alert,
  SelectChangeEvent,
} from "@mui/material";
// 🚨 서버에서 받아오는 템플릿 항목의 타입 정의
// 🚨 MUI X TimePicker 및 Provider import 추가
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { EditableMessage } from "./EditableMessage";
// ... (나머지 코드 유지) ...
interface TemplateDetail {
  templateCode: string;
  templateName: string; // UI에서 사용할 제목
  template: string; // 메시지 내용
  plusFriendID: string;
  btns: any[];
  secureYN: boolean;
  state: string;
  stateDT: string;
  emphasizeTitle?: string;
  emphasizeSubtitle?: string;
}

interface KakaoMessageSenderProps {
  sendApiUrl: string;
  defaultID?: number;
  defaultReceiver?: string;
  defaultCustomerName?: string;
  defaultReservationStartDate?: string;
  defaultReservationStartTime?: string;
  defaultReservationEndDate?: string;
  defaultReservationEndTime?: string;
  defaultUsagePersonnel?: string;
  defaultAmount?: string;
  defaultEtc1?: string;
  defaultRentPlace?: string;
}

// 템플릿 로딩 API URL (ScheduleModal의 API_URL과 동일한 기준으로 가정)
const TEMPLATE_API_URL = process.env.REACT_APP_API_URL_LOCAL + "/api/popbill/kakao/Templatelist";

const KakaoMessageSender: React.FC<KakaoMessageSenderProps> = ({
  sendApiUrl,
  defaultID,
  defaultReceiver,
  defaultCustomerName,
  defaultReservationStartDate,
  defaultReservationStartTime,
  defaultReservationEndDate,
  defaultReservationEndTime,
  defaultUsagePersonnel,
  defaultAmount,
  defaultEtc1,
  defaultRentPlace,
}) => {
  // 🚨 템플릿 관련 상태 추가 및 초기화
  const [tpls, setTpls] = useState<TemplateDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- 1. 상태 관리 (props를 초기값으로 사용하도록 수정) ---
  const [selectedTitle, setSelectedTitle] = useState(""); // 로드 후 첫 번째 템플릿 이름으로 설정
  const [templateCode, setTemplateCode] = useState(""); // 로드 후 첫 번째 템플릿 코드로 설정

  // 🚨 대관 장소 변환 로직
  const initialRentPlace = formatRentPlaceForKakao(defaultRentPlace);

  const [receiverNumber, setReceiverNumber] = useState(defaultReceiver || "");
  const [messageContent, setMessageContent] = useState(""); // 로드 후 템플릿 내용으로 설정

  const [customerName, setCustomerName] = useState(defaultCustomerName || "홍길동");
  const [reservationStartDate, setReservationStartDate] = useState(defaultReservationStartDate || dayjs().format("YYYY-MM-DD"));
  const [reservationStartTime, setReservationStartTime] = useState(defaultReservationStartTime || "14:00");
  const [reservationEndDate, setReservationEndDate] = useState(defaultReservationEndDate || dayjs().format("YYYY-MM-DD"));
  const [reservationEndTime, setReservationEndTime] = useState(defaultReservationEndTime || "14:00");
  const [usagePersonnel, setUsagePersonnel] = useState(defaultUsagePersonnel || "2");
  const [amount, setAmount] = useState(defaultAmount || "100000");

  const [etc1, setEtc1] = useState(defaultEtc1 || "");
  const [rentPlace, setrentPlace] = useState(initialRentPlace); // 대관 장소 (etc2 대체)
  const [etc3, setEtc3] = useState("");

  const [isSending, setIsSending] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

  /* ──────────────────────────────────────────────────────────────────────────────
     템플릿 로드 Effect
  ────────────────────────────────────────────────────────────────────────────── */
  useEffect(() => {
    const loadTemplates = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await axios.get(TEMPLATE_API_URL, {
          withCredentials: true,
        });

        const data: TemplateDetail[] = response.data.data;
        if (Array.isArray(data) && data.length > 0) {
          setTpls(data);

          const firstTpl = data[0];
          setSelectedTitle(firstTpl.templateName);
          setTemplateCode(firstTpl.templateCode);
          setMessageContent(firstTpl.template);
          setMessageContent(replaceTemplate(firstTpl.template));
        } else {
          setTpls([]);
          setError("로드된 카카오 템플릿이 없습니다.");
        }
      } catch (err: any) {
        console.error("템플릿 로드 실패:", err);
        setError("템플릿 목록 로드에 실패했습니다.");
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, [TEMPLATE_API_URL]);
  const replaceTemplate = (content: string): string => {
    // 날짜 치환 문자열
    const replaceDate = `${defaultReservationStartDate}[${defaultReservationStartTime}]~${defaultReservationEndDate}[${defaultReservationEndTime}]`;

    // 대관정보 (값이 비어 있지 않을 때만 구성)
    let replaceUserInfo = "";
    if (defaultRentPlace && defaultUsagePersonnel) {
      replaceUserInfo = `대관장소[${defaultRentPlace}]층 인원[${defaultUsagePersonnel}명]`;
    } else if (defaultRentPlace) {
      replaceUserInfo = `대관장소[${defaultRentPlace}]층`;
    } else if (defaultUsagePersonnel) {
      replaceUserInfo = `인원[${defaultUsagePersonnel}명]`;
    }

    let result = content;

    // 날짜 치환
    if (defaultReservationStartDate && defaultReservationEndDate) {
      result = result.replaceAll("#{날짜}", replaceDate);
    }

    // 사용정보 치환
    if (replaceUserInfo) {
      result = result.replaceAll("#{사용정보}", replaceUserInfo);
    }

    return result;
  };

  const highlightVariables = (text: string): string => {
    // {변수명} 패턴을 찾아 색상 입힘
    return text.replace(/\{([^}]+)\}/g, `<span style="color:#1976d2;font-weight:600;">{$1}</span>`);
  };

  // 템플릿 제목 변경 핸들러
  const handleTemplateChange = (event: SelectChangeEvent<string>) => {
    // 🚨 event.target.value에서 직접 새 값을 가져옵니다.
    const newTitle = event.target.value;
    setSelectedTitle(newTitle);

    const selectedOption = tpls.find((opt) => opt.templateName === newTitle);
    if (selectedOption) {
      setTemplateCode(selectedOption.templateCode);
      // 🚨 선택된 템플릿의 내용을 메시지 내용으로 설정
      setMessageContent(replaceTemplate(selectedOption.template));
    }
  };

  // 전송 버튼 핸들러
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsSending(true);
    setResponseMessage("");
    if (messageContent.includes("{")) {
      // 방법 1) 상단 알림 띄우기 (현재 Alert를 활용)
      setResponseMessage("메세지 본문에 변수를 확인해주세요");
      setIsSending(false);
      return;

      // 방법 2) 즉시 경고창 (원하면 위 대신 이 줄 사용)
      // window.alert("메세지창으로 본문에 변수를 확인해주세요");
      // setIsSending(false);
      // return;
    }
    // --- 2. 백엔드로 전송할 페이로드 구성 ---
    try {
      // 🚨 템플릿 변수 치환에 사용할 데이터 객체 (서버에서 변수 치환에 사용)
      const templateData = {
        ID: defaultID,
        고객명: customerName,
        전화번호: receiverNumber.replace(/-/g, ""),
        시작일: reservationStartDate,
        시작시간: reservationStartTime,
        종료일: reservationEndDate,
        종료시간: reservationEndTime,
        사용인원: usagePersonnel,
        금액: amount,
        비고: etc1,
        // 🚨 대관 장소를 '장소' 필드로 전송
        장소: rentPlace,
        기타3: etc3,
        // 계약금/잔금 관련 템플릿 변수를 지원하려면 여기에 추가해야 합니다.
      };

      const payload = {
        templateCode: templateCode,
        receiver: receiverNumber.replace(/-/g, ""), // 하이픈 제거
        content: messageContent, // 현재는 UI의 메시지를 그대로 전송
        ...templateData, // 서버 매핑 편의를 위해 모든 데이터를 함께 전송
      };

      const response = await axios.post(apiUrl + sendApiUrl, payload);
      setResponseMessage(`전송 성공: ${response.data.message || "메시지 전송 완료"}`);
    } catch (error) {
      setResponseMessage(`전송 실패: ${axios.isAxiosError(error) ? error.response?.data?.message || error.message : "알 수 없는 오류"}`);
    } finally {
      setIsSending(false);
    }
  };

  /* ──────────────────────────────────────────────────────────────────────────────
     렌더링
  ────────────────────────────────────────────────────────────────────────────── */

  if (loading) {
    return <p style={{ textAlign: "center", padding: "20px" }}>템플릿 로드 중...</p>;
  }

  if (error) {
    return <p style={{ color: "red", textAlign: "center", padding: "20px" }}>오류: {error}</p>;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Container maxWidth="md">
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 2 }}>
          <Box component="form" onSubmit={handleSubmit}>
            {/* 템플릿 & 코드 */}
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} md={6}>
                <FormControl fullWidth disabled={loading} size="small">
                  <InputLabel id="templateTitle-label">템플릿 제목</InputLabel>
                  <Select labelId="templateTitle-label" id="templateTitle" label="템플릿 제목" value={selectedTitle} onChange={handleTemplateChange}>
                    {tpls.map((option) => (
                      <MenuItem key={option.templateCode} value={option.templateName}>
                        {option.templateName}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <TextField
                  id="templateCode"
                  label="템플릿 코드"
                  sx={{
                    // TextField 전체에 적용하려던 기존의 fontSize는 제거
                    // fontSize: "0.2rem",

                    // 내부 input/textarea 요소의 폰트 크기를 타겟팅
                    "& .MuiInputBase-input": {
                      fontSize: "1rem", // 👈 원하는 폰트 크기로 변경 (예: 1rem, 16px, 0.9rem 등)
                      lineHeight: 1.5, // 가독성을 위해 줄 간격도 함께 조정 권장
                      color: "#a9a9a9ff",
                    },
                  }}
                  value={templateCode}
                  InputProps={{ readOnly: true }}
                  fullWidth
                  size="small"
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 2 }} />

            {/* 전송 데이터 */}
            <Typography variant="h6" sx={{ mb: 0, fontSize: "1rem" }}>
              전송 데이터
            </Typography>

            <Paper variant="outlined" sx={{ p: 1, mb: 1 }}>
              <Grid container spacing={2}>
                {/* 1행: 고객명 / 전화번호 / 금액 */}
                <Grid item xs={12} md={4}>
                  <InputGroup label="고객명" id="customerName" value={customerName} onChange={setCustomerName} type="text" required />
                </Grid>
                <Grid item xs={12} md={4}>
                  <InputGroup label="전화번호" id="receiverNumber" value={receiverNumber} onChange={setReceiverNumber} type="tel" required />
                </Grid>
                <Grid item xs={12} md={3}>
                  <InputGroup label="금액" id="amount" value={amount} onChange={setAmount} type="number" required />
                </Grid>

                {/* 2행: 예약기간(박스 그룹) */}
                <Grid item xs={12}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6} md={3.2}>
                      <InputGroup
                        label="시작일"
                        id="reservationStartDate"
                        value={reservationStartDate}
                        onChange={setReservationStartDate}
                        type="date"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.8}>
                      <InputGroup
                        label="시작시간"
                        id="reservationStartTime"
                        value={reservationStartTime}
                        onChange={setReservationStartTime}
                        type="time"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={3.2}>
                      <InputGroup
                        label="종료일"
                        id="reservationEndDate"
                        value={reservationEndDate}
                        onChange={setReservationEndDate}
                        type="date"
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6} md={2.8}>
                      <InputGroup
                        label="종료시간"
                        id="reservationEndTime"
                        value={reservationEndTime}
                        onChange={setReservationEndTime}
                        type="time"
                        required
                      />
                    </Grid>
                  </Grid>
                </Grid>

                {/* 3행: 사용인원 / 대관장소 / 기타1 */}
                <Grid item xs={12} md={3}>
                  <InputGroup label="사용인원" id="usagePersonnel" value={usagePersonnel} onChange={setUsagePersonnel} type="number" required />
                </Grid>
                <Grid item xs={12} md={3}>
                  <InputGroup label="대관장소" id="rentPlace" value={rentPlace} onChange={setrentPlace} type="text" required />
                </Grid>
                <Grid item xs={12} md={6}>
                  <InputGroup label="비고" id="etc1" value={etc1} onChange={setEtc1} type="text" />
                </Grid>
              </Grid>
            </Paper>

            <Divider sx={{ my: 2 }} />

            {/* 메시지 내용 */}
            <Stack spacing={1} sx={{ mb: 2, fontSize: "0.2rem" }}>
              <Typography variant="subtitle1" fontWeight={700}>
                메시지 내용 ({messageContent.length}자)
              </Typography>

              <EditableMessage
                value={messageContent}
                onChange={setMessageContent}
                placeholder="메시지 내용을 입력하세요. {고객명} 같은 변수를 쓰면 파란색으로 표시됩니다."
              />
            </Stack>

            {/* 버튼 영역 */}
            <Stack direction="row" justifyContent="flex-start" spacing={1}>
              <Button
                type="submit"
                variant="contained"
                disabled={isSending || loading || tpls.length === 0}
                sx={{
                  width: 150, // 예: 너비를 120px로 고정합니다.
                  // minWidth: 100, // 또는 최소 너비를 지정하여 반응성을 유지할 수 있습니다.
                }}
              >
                {isSending ? "전송 중..." : "전송"}
              </Button>
            </Stack>
          </Box>

          {/* 응답 메시지 */}
          {!!responseMessage && (
            <Alert sx={{ mt: 2 }} severity={responseMessage.includes("성공") ? "success" : "error"}>
              {responseMessage}
            </Alert>
          )}
        </Paper>
      </Container>
    </LocalizationProvider>
  );
};

export default KakaoMessageSender;

// --- 공통 입력 그룹 컴포넌트 (가독성 향상) ---
interface InputGroupProps {
  label: string;
  id: string;
  value: string;
  onChange: (value: string) => void;
  type?: "text" | "number" | "tel" | "date" | "time";
  required?: boolean;
}
const InputGroup: React.FC<InputGroupProps> = ({ label, id, value, onChange, type = "text", required = false }) => {
  const labelTypography = (
    <Typography variant="caption" component="label" htmlFor={id} fontWeight={600} display="block" mb={0.5} sx={{ fontSize: "0.65rem" }}>
      {label}
    </Typography>
  );

  // 🚨 type이 'time'일 경우 TimePicker 사용
  if (type === "time") {
    // value를 dayjs 객체로 변환 (TimePicker는 Dayjs 객체를 다룹니다)
    const dayjsValue = dayjs(`2000-01-01T${value}`);

    const handleTimeChange = (newValue: Dayjs | null) => {
      if (newValue && newValue.isValid()) {
        // 24시간 형식 (HH:mm)으로 포맷하여 부모 컴포넌트에 전달
        onChange(newValue.format("HH:mm"));
      } else {
        onChange(""); // 값이 유효하지 않으면 빈 문자열 전달
      }
    };

    return (
      <Box>
        {labelTypography}
        <TimePicker
          label={""}
          value={dayjsValue.isValid() ? dayjsValue : null}
          onChange={handleTimeChange}
          // 🚨 slotProps를 사용하여 아이콘이 있는 버튼을 숨깁니다.
          slotProps={{
            textField: { fullWidth: true, size: "small" },
            openPickerButton: { sx: { display: "none" } }, // 🚨 시계 아이콘이 있는 버튼 숨기기
          }}
          ampm={false}
          format="HH:mm"
          sx={{
            "& .MuiInputBase-input": { fontSize: "0.8rem", padding: "8.5px 14px" },
            // 🚨 아이콘 버튼을 숨긴 후 우측 여백이 사라지지 않도록 패딩 조정이 필요할 수 있습니다.
            // 하지만 openPickerButton: { display: 'none' }이 가장 직접적인 방법입니다.
            width: "100%",
          }}
        />
      </Box>
    );
  }

  // type이 'time'이 아닐 경우 기존 TextField 사용
  return (
    <Box>
      {labelTypography}
      <TextField
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        fullWidth
        size="small"
        InputProps={{
          sx: { fontSize: "0.8rem" },
        }}
      />
    </Box>
  );
};
