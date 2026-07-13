import React, { useMemo, useState, useCallback } from "react";
import axios from "axios";
import {
  DialogContent,
  DialogActions,
  TextField,
  Grid,
  MenuItem,
  Button,
  IconButton,
  Typography,
  Snackbar,
  Alert,
  Box,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
  Stack,
  Container,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalculateIcon from "@mui/icons-material/Calculate";
import { SxProps, Theme } from "@mui/material/styles";
import { apiUrl as baseApiUrl } from "../utils/scheduleUtils";
import { WidthFull } from "@mui/icons-material";
import { apiUrl } from "utils/util";

/* ======= Props / Types ======= */
export type InvoiceIssueModalProps = {
  // open: boolean; // 주석 처리된 프롭스는 원본을 유지합니다.
  // onClose: () => void;
  /** 제출할 API 엔드포인트 (기본: /api/taxinvoice/issue) */
  // submitUrl?: string;
  // onIssued?: (response: any) => void;
  /** 모달 오픈 시 공급받는자 상호 기본값 */
  defaultInvoiceeCorpName?: string;
  scheduleId?: number;
};

type InvoiceItem = {
  month?: string;
  day?: string;
  itemName: string;
  spec?: string;
  /** 입력 중 IME 보호를 위해 문자열 유지 */
  qty: string;
  unitCost: string;
  // 🚨 [수정 1] supplyCost를 입력받기 위해 string으로 변경
  supplyCost: string;
  amount: number; // 합계 (qty * unitCost 또는 supplyCost 기반 역산)
  tax: number; // 세액
  remark?: string;
};

/* ======= UI Utils / Styles ======= */
const fmt = (n: number) => (Number.isFinite(n) ? n.toLocaleString("ko-KR") : "0");

// ... (COLW 및 squareChipSx는 동일) ...

const COLW = {
  month: 50,
  day: 50,
  qty: 50,
  unitCost: 160,
  amount: 160,
  supply: 160,
  tax: 140,
};

export const squareChipSx: SxProps<Theme> = {
  borderRadius: 0,
  height: 32,
  minWidth: 100,
  display: "inline-flex",
  justifyContent: "flex-end",
  "& .MuiChip-label": {
    width: "100%",
    textAlign: "right",
    px: 1.25,
    fontVariantNumeric: "tabular-nums",
    boxSizing: "border-box",
  },
};

/* ======= 계산 유틸 ======= */
const toNumber = (v: string | number | "") => {
  if (v === "" || v === undefined || v === null) return 0;
  const n = Number(String(v).replace(/,/g, "")); // 쉼표 제거 추가
  return Number.isFinite(n) ? n : 0;
};

// 🚨 [수정 2] calcRow 함수: supplyCost를 기준으로 합계(amount)와 세액(tax)을 역산하는 로직 추가
const calcRow = (
  qty: string | number | "",
  unitCost: string | number | "",
  supplyCostStr: string | number | "", // 새롭게 추가된 공급가액
  taxType: string
) => {
  const isTaxFree = taxType === "면세" || taxType === "영세";
  const supplyCost = toNumber(supplyCostStr);

  let amount: number;
  let supply: number;
  let tax: number;

  if (supplyCost > 0) {
    // case 1: 공급가액 (supplyCost)이 입력된 경우, 이를 기준으로 합계와 세액 역산
    supply = supplyCost;
    if (isTaxFree) {
      tax = 0;
      amount = supply; // 면세/영세는 공급가액 = 합계
    } else {
      // 과세인 경우, 세액은 공급가액의 10%
      tax = Math.round(supply * 0.1);
      amount = supply + tax;
    }
  } else {
    // case 2: 수량(qty)과 단가(unitCost)를 기준으로 계산 (기존 로직)
    const q = toNumber(qty);
    const u = toNumber(unitCost);
    amount = Math.round(q * u);

    supply = isTaxFree ? amount : Math.round(amount / 1.1);
    tax = isTaxFree ? 0 : amount - supply;
  }

  return { amount, supply, tax };
};

/* ======= PartyCard (공급자/공급받는자) ======= */
// ... (PartyCard 컴포넌트는 동일하게 유지) ...
type PartyCardProps = {
  title: string;
  corpNum: string;
  setCorpNum: (v: string) => void;
  corpName: string;
  setCorpName: (v: string) => void;
  ceoName: string;
  setCeoName: (v: string) => void;
  addr: string;
  setAddr: (v: string) => void;
  bizType: string;
  setBizType: (v: string) => void;
  bizClass: string;
  setBizClass: (v: string) => void;
  emailLocal: string;
  setEmailLocal: (v: string) => void;
  emailDomain: string;
  setEmailDomain: (v: string) => void;
  emailDomainOptions: readonly string[];
  onCheckBizInfo: (corpNum: string) => void;
  accent?: string;
};

const PartyCard: React.FC<PartyCardProps> = React.memo(
  ({
    title,
    corpNum,
    setCorpNum,
    corpName,
    setCorpName,
    ceoName,
    setCeoName,
    addr,
    setAddr,
    bizType,
    setBizType,
    bizClass,
    setBizClass,
    emailLocal,
    setEmailLocal,
    emailDomain,
    setEmailDomain,
    emailDomainOptions,
    onCheckBizInfo,
    accent = "#90caf9",
  }) => (
    <Paper variant="outlined" sx={{ p: 2, borderColor: accent }}>
      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: accent, mb: 1 }}>
        {title}
      </Typography>
      <Grid container spacing={1}>
        <Grid item xs={12} md={12}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField label="등록번호" size="small" fullWidth value={corpNum} onChange={(e) => setCorpNum(e.target.value)} />
            <Button variant="outlined" sx={{ whiteSpace: "nowrap" }} onClick={() => onCheckBizInfo(corpNum)}>
              조회
            </Button>
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField label="상호" size="small" fullWidth value={corpName} onChange={(e) => setCorpName(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField label="성명" size="small" fullWidth value={ceoName} onChange={(e) => setCeoName(e.target.value)} />
          </Stack>
        </Grid>

        <Grid item xs={12}>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
            <TextField label="사업장" size="small" fullWidth value={addr} onChange={(e) => setAddr(e.target.value)} />
          </Stack>
        </Grid>

        <Grid item xs={12} md={6}>
          <TextField label="업태" size="small" fullWidth value={bizType} onChange={(e) => setBizType(e.target.value)} />
        </Grid>
        <Grid item xs={12} md={6}>
          <TextField label="종목" size="small" fullWidth value={bizClass} onChange={(e) => setBizClass(e.target.value)} />
        </Grid>

        <Grid item xs={12}>
          <Grid container spacing={1} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField label="이메일" size="small" fullWidth value={emailLocal} onChange={(e) => setEmailLocal(e.target.value)} />
            </Grid>
            <Grid item xs={12} sm="auto">
              <Typography sx={{ textAlign: "center" }}>@</Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                select
                size="small"
                fullWidth
                value={emailDomain}
                onChange={(e) => setEmailDomain(e.target.value)}
                sx={{
                  height: 35,
                  "& .MuiInputBase-root": { height: "100%" },
                }}
              >
                {emailDomainOptions.map((d) => (
                  <MenuItem key={d} value={d}>
                    {d}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Paper>
  )
);
// ... (PartyCard 컴포넌트는 동일하게 유지) ...

/* ======= 메인 컴포넌트 ======= */
const InvoiceIssueModal: React.FC<InvoiceIssueModalProps> = ({ defaultInvoiceeCorpName, scheduleId }) => {
  const [taxType, setTaxType] = useState<"과세" | "영세" | "면세">("과세");
  const [issueType, setIssueType] = useState<"정발행" | "역발행" | "위수탁">("정발행");
  const [purposeType, setPurposeType] = useState<"영수" | "청구">("청구");

  const [writeDate, setWriteDate] = useState<string>(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  });

  /* 공급자 */
  const [invoicerCorpNum, setInvoicerCorpNum] = useState("149-88-02941");
  const [invoicerCorpName, setInvoicerCorpName] = useState("주식회사 타울");
  const [invoicerCEOName, setInvoicerCEOName] = useState("김완준 외 1명");
  const [invoicerAddr, setInvoicerAddr] = useState("서울특별시 동대문구 장한로 53, 5층 504호(장안동, 제이빌딩)");
  const [invoicerBizType, setInvoicerBizType] = useState("도소매업");
  const [invoicerBizClass, setInvoicerBizClass] = useState("가구, 인테리어소품");
  const [invoicerEmailLocal, setInvoicerEmailLocal] = useState("taulcontact");
  const [invoicerEmailDomain, setInvoicerEmailDomain] = useState("gmail.com");

  /* 공급받는자 */
  const [invoiceeCorpNum, setInvoiceeCorpNum] = useState("");
  const [invoiceeCorpName, setInvoiceeCorpName] = useState("");
  const [invoiceeCEOName, setInvoiceeCEOName] = useState("");
  const [invoiceeAddr, setInvoiceeAddr] = useState("");
  const [invoiceeBizType, setInvoiceeBizType] = useState("");
  const [invoiceeBizClass, setInvoiceeBizClass] = useState("");
  const [invoiceeEmailLocal, setInvoiceeEmailLocal] = useState("");
  const [invoiceeEmailDomain, setInvoiceeEmailDomain] = useState("");

  const emailDomainOptions = ["gmail.com", "naver.com", "daum.net", "직접입력"] as const;

  /* 오픈 시 기본값 주입 */
  // ... (useMemo는 동일) ...
  React.useEffect(() => {
    // open 프롭스가 주석 처리되었으므로 주석 처리
    // if (!open) return;
    if (defaultInvoiceeCorpName) {
      setInvoiceeCorpName(defaultInvoiceeCorpName);
    }
  }, [defaultInvoiceeCorpName]); // open 의존성 제거

  /* 항목들 (초기 2행) — qty/unitCost는 string으로 */
  const [items, setItems] = useState<InvoiceItem[]>(
    Array.from({ length: 2 }).map(() => ({
      month: "",
      day: "",
      itemName: "",
      spec: "",
      qty: "",
      unitCost: "",
      supplyCost: "", // 🚨 [수정 1] 초기값도 string으로 설정
      amount: 0,
      tax: 0,
      remark: "",
    }))
  );

  /* 한글 IME 조합 보호 */
  const [isComposing, setIsComposing] = useState(false);
  const handleCompositionStart = () => setIsComposing(true);
  const handleCompositionEnd = (idx: number) => () => {
    setIsComposing(false);
    // 조합 종료 시 1회 계산
    setItems((prev) => {
      const next = [...prev];
      const r = next[idx];
      // 🚨 [수정 3] calcRow 함수 호출 시 supplyCost 인자 추가
      const { amount, supply, tax } = calcRow(r.qty, r.unitCost, r.supplyCost, taxType);
      r.amount = amount;
      // 🚨 [수정 3] 계산된 supply 값을 다시 string supplyCost에 저장 (단가/수량으로 계산되었을 경우)
      r.supplyCost = supply.toLocaleString("ko-KR");
      r.tax = taxType === "과세" ? tax : 0;
      return next;
    });
  };

  /* 개별 셀 onChange — 문자열 그대로 저장, 조합 중 계산 X */
  const handleItemChange = (idx: number, key: keyof InvoiceItem) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setItems((prev) => {
      const next = [...prev];
      const row = { ...next[idx], [key]: v } as InvoiceItem;
      next[idx] = row;

      const isPriceKey = key === "qty" || key === "unitCost" || key === "supplyCost";

      if (!isComposing && isPriceKey) {
        // 🚨 [수정 4] 가격 관련 필드가 변경될 때마다 계산
        // SupplyCost가 변경되면 qty/unitCost를 초기화 (상충 방지)
        if (key === "supplyCost") {
          row.qty = "";
          row.unitCost = "";
        } else if (key === "qty" || key === "unitCost") {
          // qty/unitCost가 변경되면 supplyCost를 초기화
          row.supplyCost = "";
        }

        const { amount, supply, tax } = calcRow(row.qty, row.unitCost, row.supplyCost, taxType);
        row.amount = amount;
        // 계산된 supply 값을 다시 string supplyCost에 저장 (단가/수량으로 계산되었을 경우)
        row.supplyCost = supply.toLocaleString("ko-KR");
        row.tax = taxType === "과세" ? tax : 0;
      }
      return next;
    });
  };

  const calcRowManually = (idx: number) => {
    setItems((prev) => {
      const next = [...prev];
      const r = next[idx];
      // 🚨 [수정 5] 수동 계산 시 supplyCost 인자 추가
      const { amount, supply, tax } = calcRow(r.qty, r.unitCost, r.supplyCost, taxType);
      r.amount = amount;
      r.supplyCost = supply.toLocaleString("ko-KR");
      r.tax = taxType === "과세" ? tax : 0;
      return next;
    });
  };

  const addItem = () =>
    setItems((p) => [
      ...p,
      {
        month: "",
        day: "",
        itemName: "",
        spec: "",
        qty: "",
        unitCost: "",
        supplyCost: "", // 🚨 [수정 1] 초기값 설정
        amount: 0,
        tax: 0,
        remark: "",
      },
    ]);
  const removeItem = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx));

  /* 합계 */
  const totals = useMemo(() => {
    const isTaxFree = taxType === "면세" || taxType === "영세";
    const sum = items.reduce(
      (acc, r) => {
        // 🚨 [수정 6] 합계 계산 시 supplyCost 인자 추가
        const { amount, supply, tax } = calcRow(r.qty, r.unitCost, r.supplyCost, taxType);
        acc.amount += amount;
        acc.supply += supply;
        acc.tax += isTaxFree ? 0 : tax;
        return acc;
      },
      { amount: 0, supply: 0, tax: 0 }
    );
    return {
      supplyCostTotal: sum.supply,
      taxTotal: sum.tax,
      totalAmount: isTaxFree ? sum.amount : sum.supply + sum.tax,
    };
  }, [items, taxType]);

  /* 토스트 */
  const [loading, setLoading] = useState(false);
  // ... (toast 상태 및 onlyDigits, joinAddr 함수는 동일) ...
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const onlyDigits = (s: string = "") => s.replace(/[^0-9]/g, "");
  const joinAddr = (addr?: string, detail?: string) => [addr, detail].filter(Boolean).join(" ");

  /* 사업자 정보 조회 (컴포넌트 내부 useCallback) */
  const checkBizInfo = useCallback(async (corpNum: string) => {
    // ... (checkBizInfo 함수는 동일) ...
    try {
      // const corpNum = onlyDigits(corpNum);
      const { data: res } = await axios.get(`${baseApiUrl}/api/popbill/biz/checkBizInfo?checkCorpNum=${corpNum}`);

      // 실제 데이터가 res.data 아래 들어오는 형태(스크린샷 기준)
      const biz = (res && (res.data ?? res)) as any;
      if (!biz) throw new Error("조회 결과가 비어 있습니다.");

      // 매핑 (스크린샷 키 이름 기준)
      setInvoiceeCorpNum(biz.corpNum ?? corpNum);
      setInvoiceeCorpName(biz.corpName ?? "");
      setInvoiceeCEOName(biz.ceoname ?? "");
      setInvoiceeAddr(joinAddr(biz.addr, biz.addrDetail));
      setInvoiceeBizType(biz.bizType ?? "");
      setInvoiceeBizClass(biz.bizClass ?? "");

      // 안내 토스트
      const msg = biz.resultMessage ?? (biz.closeDownState === 1 ? "휴·폐업 사업자" : "사업자 정보 조회 성공");
      setToast({ open: true, message: msg, severity: "success" });
    } catch (error) {
      console.error("사업자 정보 조회 실패:", error);
      setToast({ open: true, message: "사업자 정보 조회 실패", severity: "error" });
    }
  }, []);

  /* Payload 생성 */
  const buildPayload = () => {
    const emailJoin = (local: string, domain: string) => (domain && domain !== "직접입력" ? `${local}@${domain}` : local);
    const purchaseYear = (writeDate || "").slice(0, 4); // 작성일자에서 연도만 추출
    const detailList = items
      .map((it, i) => {
        // 품목의 월/일이 있다면 사용하고, 없다면 작성일자의 월/일을 대체로 사용
        const itemMonth = (it.month || (writeDate || "").slice(5, 7)).padStart(2, "0");
        const itemDay = (it.day || (writeDate || "").slice(8, 10)).padStart(2, "0");

        const purchaseDT = `${purchaseYear}${itemMonth}${itemDay}`; // YYYYMMDD 포맷 구성

        return {
          serialNum: i + 1,
          purchaseDT: purchaseDT, // 🚨 품목별 거래 일자 적용
          itemName: it.itemName,
          spec: it.spec || "",
          qty: toNumber(it.qty),
          unitCost: toNumber(it.unitCost),
          supplyCost: toNumber(it.supplyCost),
          tax: taxType === "과세" ? it.tax : 0,
          remark: it.remark || "",
        };
      })
      .filter((d) => d.itemName || d.qty || d.unitCost || d.supplyCost);
    const taxinvoice = {
      writeDate: (writeDate || "").replaceAll("-", ""),
      chargeDirection: "정과금",
      issueType,
      purposeType,
      taxType,

      invoicerCorpNum: invoicerCorpNum.replace(/[^0-9]/g, ""),
      invoicerCorpName,
      invoicerCEOName,
      invoicerAddr,
      invoicerBizType,
      invoicerBizClass,
      invoicerContactName: "",
      invoicerEmail: emailJoin(invoicerEmailLocal, invoicerEmailDomain),
      invoicerTEL: "",

      invoiceeType: "사업자",
      invoiceeCorpNum: invoiceeCorpNum.replace(/[^0-9]/g, ""),
      invoiceeCorpName,
      invoiceeCEOName,
      invoiceeAddr,
      invoiceeBizType,
      invoiceeBizClass,
      invoiceeContactName1: "",
      invoiceeEmail1: emailJoin(invoiceeEmailLocal, invoiceeEmailDomain),
      invoiceeTEL1: "",

      supplyCostTotal: totals.supplyCostTotal,
      taxTotal: totals.taxTotal,
      totalAmount: totals.totalAmount,

      serialNum: "1",
      remark: "",

      detailList,
      scheduleId,
    } as const;

    return { taxinvoice };
  };

  /* 제출 */
  const handleSubmit = async () => {
    const payload = buildPayload();
    const invoice = payload.taxinvoice;
    const validationMessage = (() => {
      if (onlyDigits(invoice.invoicerCorpNum).length !== 10) return "공급자 등록번호 10자리를 확인해주세요.";
      if (onlyDigits(invoice.invoiceeCorpNum).length !== 10) return "공급받는자 등록번호 10자리를 입력해주세요.";
      if (!invoice.invoiceeCorpName.trim()) return "공급받는자 상호를 입력해주세요.";
      if (!/^\d{8}$/.test(invoice.writeDate)) return "작성일자를 확인해주세요.";
      if (invoice.detailList.length === 0) return "품목을 1개 이상 입력해주세요.";
      if (invoice.detailList.some((item) => !item.itemName.trim())) return "모든 품목의 품목명을 입력해주세요.";
      if (invoice.detailList.some((item) => item.supplyCost <= 0)) return "모든 품목의 공급가액을 0원보다 크게 입력해주세요.";
      if (invoice.supplyCostTotal <= 0 || invoice.totalAmount <= 0) return "합계금액을 확인해주세요.";
      return "";
    })();

    if (validationMessage) {
      setToast({ open: true, message: validationMessage, severity: "error" });
      return;
    }

    try {
      setLoading(true);

      console.log("handleSubmit payload", payload);
      const submitUrl = `${apiUrl}/api/popbill/tax/registTaxIssue`;

      const res = await fetch(submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        // 서버의 JSON 응답 본문을 상세 오류 정보로 가져옵니다.
        const errBody = await res.json().catch(() => ({}));
        const serverErrorDetail = errBody?.error || errBody?.message;

        // 상세 오류 원인이 있다면 throw new Error(상세 원인)으로 넘깁니다.
        if (serverErrorDetail) {
          // 에러 코드까지 포함하여 throw 합니다.
          throw new Error(`[Code: ${errBody?.popbillErrorCode || res.status}] ${serverErrorDetail}`);
        } else {
          throw new Error(`HTTP ${res.status} 오류. 서버에서 상세 원인을 받지 못했습니다.`);
        }
      }

      const data = await res.json().catch(() => ({}));
      setToast({ open: true, message: "세금계산서 발행 요청이 완료되었습니다.", severity: "success" });
    } catch (err: any) {
      const errorMessage = err?.message || "발행 요청 중 알 수 없는 오류가 발생했습니다.";
      setToast({ open: true, message: `발행 실패: ${errorMessage}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  /* 리셋 */
  const handleReset = () => {
    // ... (handleReset 함수는 동일) ...
    setTaxType("과세");
    setIssueType("정발행");
    setPurposeType("청구");
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    setWriteDate(`${d.getFullYear()}-${mm}-${dd}`);

    setInvoiceeCorpNum("");
    setInvoiceeCorpName(defaultInvoiceeCorpName ?? "");
    setInvoiceeCEOName("");
    setInvoiceeAddr("");
    setInvoiceeBizType("");
    setInvoiceeBizClass("");
    setInvoiceeEmailLocal("");
    setInvoiceeEmailDomain("");

    setItems(
      Array.from({ length: 2 }).map(() => ({
        month: "",
        day: "",
        itemName: "",
        spec: "",
        qty: "",
        unitCost: "",
        supplyCost: "", // 🚨 [수정 1] 초기값 설정
        amount: 0,
        tax: 0,
        remark: "",
      }))
    );
  };

  // ... (리턴 UI 부분) ...

  return (
    <div>
      <Container
        maxWidth="lg"
        sx={{
          maxHeight: "80vh",
          overflow: "auto",
          width: "100%",
        }}
      >
        <Box sx={{ maxHeight: "80vh", overflow: "auto", maxWidth: "1000px!important" }}>
          <DialogContent
            dividers
            sx={{
              maxHeight: "60vh",
              overflow: "auto",
              width: "100%",
              fontSize: "0.75rem",
              "& .MuiInputBase-input": { fontSize: "0.75rem", py: 0.5 },
              "& .MuiInputLabel-root": { fontSize: "0.75rem" },
              "& .MuiButton-root": { fontSize: "0.75rem", py: 0.5, px: 1.2 },
              "& .MuiTableCell-root": { fontSize: "0.75rem", py: 0.5, px: 0.5 },
              "& .MuiChip-label": { fontSize: "0.7rem" },
            }}
          >
            {/* 상단 섹션: 공급자/공급받는자 + 작성일/비고/합계 */}
            {/* ... (상단 UI는 동일) ... */}
            <Stack spacing={1}>
              <Grid container spacing={2} sx={{ width: "100% !important" }}>
                <Grid item xs={12} md={6} sx={{ pl: "0px !important" }}>
                  {/* ... PartyCard 공급자 ... */}
                  <PartyCard
                    title="공급자"
                    corpNum={invoicerCorpNum}
                    setCorpNum={setInvoicerCorpNum}
                    corpName={invoicerCorpName}
                    setCorpName={setInvoicerCorpName}
                    ceoName={invoicerCEOName}
                    setCeoName={setInvoicerCEOName}
                    addr={invoicerAddr}
                    setAddr={setInvoicerAddr}
                    bizType={invoicerBizType}
                    setBizType={setInvoicerBizType}
                    bizClass={invoicerBizClass}
                    setBizClass={setInvoicerBizClass}
                    emailLocal={invoicerEmailLocal}
                    setEmailLocal={setInvoicerEmailLocal}
                    emailDomain={invoicerEmailDomain}
                    setEmailDomain={setInvoicerEmailDomain}
                    emailDomainOptions={emailDomainOptions}
                    onCheckBizInfo={checkBizInfo}
                    accent="#ff8a80"
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  {/* ... PartyCard 공급받는자 ... */}
                  <PartyCard
                    title="공급받는자"
                    corpNum={invoiceeCorpNum}
                    setCorpNum={setInvoiceeCorpNum}
                    corpName={invoiceeCorpName}
                    setCorpName={setInvoiceeCorpName}
                    ceoName={invoiceeCEOName}
                    setCeoName={setInvoiceeCEOName}
                    addr={invoiceeAddr}
                    setAddr={setInvoiceeAddr}
                    bizType={invoiceeBizType}
                    setBizType={setInvoiceeBizType}
                    bizClass={invoiceeBizClass}
                    setBizClass={setInvoiceeBizClass}
                    emailLocal={invoiceeEmailLocal}
                    setEmailLocal={setInvoiceeEmailLocal}
                    emailDomain={invoiceeEmailDomain}
                    setEmailDomain={setInvoiceeEmailDomain}
                    emailDomainOptions={emailDomainOptions}
                    onCheckBizInfo={checkBizInfo}
                    accent="#7d93d4ff"
                  />
                </Grid>

                {/* 작성일/비고/합계 */}
                <Grid item xs={12} sx={{ pl: "0px !important" }}>
                  <Paper variant="outlined" sx={{ mt: 1, maxWidth: "100%", mx: "auto", p: 1 }}>
                    <Grid container columnSpacing={2} alignItems="stretch">
                      <Grid item xs={12} md={3}>
                        <TextField
                          type="date"
                          label="작성일자"
                          InputLabelProps={{ shrink: true }}
                          size="small"
                          fullWidth
                          value={writeDate}
                          onChange={(e) => setWriteDate(e.target.value)}
                        />
                      </Grid>
                      <Grid item xs={12} md={5}>
                        <TextField label="비고" size="small" fullWidth value={"" /* 필요 시 별도 상태로 관리 */} onChange={() => {}} />
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Box
                          sx={{
                            height: "100%",
                            p: 1.5,
                            bgcolor: "grey.50",
                            borderRadius: 1,
                            display: "flex",
                            alignItems: "center",
                            fontSize: 13,
                            "& .MuiTypography-root": { fontSize: "inherit" },
                          }}
                        >
                          <Grid container>
                            <Grid item xs={5}>
                              <Typography>합계금액</Typography>
                            </Grid>
                            <Grid item xs={7} textAlign="right">
                              <Typography variant="body2">{fmt(totals.totalAmount)}</Typography>
                            </Grid>
                            <Grid item xs={5}>
                              <Typography variant="body2">공급가액</Typography>
                            </Grid>
                            <Grid item xs={7} textAlign="right">
                              <Typography variant="body2">{fmt(totals.supplyCostTotal)}</Typography>
                            </Grid>
                            <Grid item xs={5}>
                              <Typography variant="body2">세액</Typography>
                            </Grid>
                            <Grid item xs={7} textAlign="right">
                              <Typography variant="body2">{fmt(totals.taxTotal)}</Typography>
                            </Grid>
                          </Grid>
                        </Box>
                      </Grid>
                      <Grid item xs={12}>
                        <Typography variant="caption" color="text.secondary">
                          * 작성일자는 공급 연월일을 의미
                        </Typography>
                      </Grid>
                    </Grid>
                  </Paper>
                </Grid>
              </Grid>
            </Stack>

            {/* 안내 */}
            <Typography variant="caption" sx={{ mt: 1, display: "block", ml: 2 }}>
              ※ 아래 "품목"의 "월"은 상단 작성일자의 "월"을 참조하세요. 합계의 "계산" 버튼으로 재계산할 수 있습니다. (최대 16개)
            </Typography>

            {/* 품목 테이블 */}
            <Paper variant="outlined" sx={{ mt: 1, width: "100%", mx: "auto" }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ width: COLW.month }}>월</TableCell>
                    <TableCell sx={{ width: COLW.day }}>일</TableCell>
                    <TableCell sx={{ width: COLW.unitCost }}>품목</TableCell>
                    <TableCell sx={{ width: COLW.day }}>규격</TableCell>
                    <TableCell align="right" sx={{ width: COLW.qty }}>
                      수량
                    </TableCell>
                    <TableCell align="right" sx={{ width: COLW.unitCost }}>
                      단가
                    </TableCell>
                    <TableCell align="right" sx={{ width: COLW.amount }}>
                      합계
                    </TableCell>
                    <TableCell align="right" sx={{ width: COLW.supply }}>
                      공급가액
                    </TableCell>
                    <TableCell align="right" sx={{ width: COLW.tax }}>
                      세액
                    </TableCell>
                    <TableCell sx={{ width: 120 }}>비고</TableCell>
                    <TableCell sx={{ width: 72 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <TextField
                          size="small"
                          value={row.month ?? ""}
                          onChange={handleItemChange(idx, "month")}
                          inputProps={{ inputMode: "numeric", maxLength: 2 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          value={row.day ?? ""}
                          onChange={handleItemChange(idx, "day")}
                          inputProps={{ inputMode: "numeric", maxLength: 2 }}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={row.itemName}
                          onChange={handleItemChange(idx, "itemName")}
                          onCompositionStart={handleCompositionStart}
                          onCompositionEnd={handleCompositionEnd(idx)}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={row.spec ?? ""}
                          onChange={handleItemChange(idx, "spec")}
                          onCompositionStart={handleCompositionStart}
                          onCompositionEnd={handleCompositionEnd(idx)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="text"
                          inputMode="decimal"
                          value={row.qty}
                          onChange={handleItemChange(idx, "qty")}
                          onCompositionStart={handleCompositionStart}
                          onCompositionEnd={handleCompositionEnd(idx)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="text"
                          inputMode="decimal"
                          value={row.unitCost}
                          onChange={handleItemChange(idx, "unitCost")}
                          onCompositionStart={handleCompositionStart}
                          onCompositionEnd={handleCompositionEnd(idx)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end" alignItems="center">
                          <Chip label={fmt(row.amount)} sx={squareChipSx} />
                          <IconButton size="small" onClick={() => calcRowManually(idx)}>
                            <CalculateIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                      {/* 🚨 [수정 8] 공급가액을 입력 가능한 TextField로 변경 */}
                      <TableCell align="right">
                        <TextField
                          size="small"
                          type="text"
                          inputMode="decimal"
                          value={row.supplyCost}
                          onChange={handleItemChange(idx, "supplyCost")}
                          onCompositionStart={handleCompositionStart}
                          onCompositionEnd={handleCompositionEnd(idx)}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Chip label={fmt(taxType === "과세" ? row.tax : 0)} sx={squareChipSx} />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={row.remark ?? ""}
                          onChange={handleItemChange(idx, "remark")}
                          onCompositionStart={handleCompositionStart}
                          onCompositionEnd={handleCompositionEnd(idx)}
                        />
                      </TableCell>
                      <TableCell align="left">
                        <IconButton onClick={() => removeItem(idx)}>
                          <DeleteOutlineIcon />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              <Box sx={{ p: 1.5, display: "flex", gap: 1, justifyContent: "space-between" }}>
                <Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <Typography variant="body2">이 금액을</Typography>
                    <ToggleButtonGroup size="small" value={purposeType} exclusive onChange={(_, v) => v && setPurposeType(v)}>
                      <ToggleButton value="청구">청구</ToggleButton>
                      <ToggleButton value="영수">영수</ToggleButton>
                    </ToggleButtonGroup>
                    <Typography variant="body2">함</Typography>
                  </Stack>
                </Box>
              </Box>
            </Paper>
          </DialogContent>

          <DialogActions>
            {/* ... (DialogActions는 동일) ... */}
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 1, pr: 2.5, width: "100%" }}>
              <Button variant="outlined" onClick={handleReset}>
                초기화
              </Button>
              <Box flex={1} />
              <Button variant="contained" onClick={handleSubmit} disabled={loading} sx={{ width: 150 }}>
                {loading ? "발급 중..." : "발급하기"}
              </Button>
            </Stack>
          </DialogActions>
        </Box>

        <Snackbar
          open={toast.open}
          autoHideDuration={4000}
          onClose={() => setToast((t) => ({ ...t, open: false }))}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert severity={toast.severity} variant="filled" sx={{ width: "100%" }}>
            {toast.message}
          </Alert>
        </Snackbar>
      </Container>
    </div>
  );
};

export default InvoiceIssueModal;
