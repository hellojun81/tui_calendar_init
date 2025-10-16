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
  // open: boolean;
  // onClose: () => void;
  /** 제출할 API 엔드포인트 (기본: /api/taxinvoice/issue) */
  // submitUrl?: string;
  // onIssued?: (response: any) => void;
  /** 모달 오픈 시 공급받는자 상호 기본값 */
  defaultInvoiceeCorpName?: string;
};

type InvoiceItem = {
  month?: string;
  day?: string;
  itemName: string;
  spec?: string;
  /** 입력 중 IME 보호를 위해 문자열 유지 */
  qty: string;
  unitCost: string;
  amount: number; // 합계 (qty * unitCost)
  supplyCost: number; // 공급가액
  tax: number; // 세액
  remark?: string;
};

/* ======= UI Utils / Styles ======= */
const fmt = (n: number) => (Number.isFinite(n) ? n.toLocaleString("ko-KR") : "0");

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
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const calcRow = (qty: string | number | "", unitCost: string | number | "", taxType: string) => {
  const q = toNumber(qty);
  const u = toNumber(unitCost);
  const amount = Math.round(q * u);
  const isTaxFree = taxType === "면세" || taxType === "영세";
  const supply = isTaxFree ? amount : Math.round(amount / 1.1);
  const tax = isTaxFree ? 0 : amount - supply;
  return { amount, supply, tax };
};

/* ======= PartyCard (공급자/공급받는자) ======= */
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

/* ======= 메인 컴포넌트 ======= */
const InvoiceIssueModal: React.FC<InvoiceIssueModalProps> = ({ defaultInvoiceeCorpName }) => {
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
  React.useEffect(() => {
    if (!open) return;
    // if (defaultInvoiceeCorpName) {
    //   setInvoiceeCorpName(defaultInvoiceeCorpName);
    // }
  }, [open, defaultInvoiceeCorpName]);

  /* 항목들 (초기 2행) — qty/unitCost는 string으로 */
  const [items, setItems] = useState<InvoiceItem[]>(
    Array.from({ length: 2 }).map(() => ({
      month: "",
      day: "",
      itemName: "",
      spec: "",
      qty: "",
      unitCost: "",
      amount: 0,
      supplyCost: 0,
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
      const { amount, supply, tax } = calcRow(r.qty, r.unitCost, taxType);
      r.amount = amount;
      r.supplyCost = supply;
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
      if (!isComposing && (key === "qty" || key === "unitCost" || key === "itemName" || key === "spec")) {
        const { amount, supply, tax } = calcRow(row.qty, row.unitCost, taxType);
        row.amount = amount;
        row.supplyCost = supply;
        row.tax = taxType === "과세" ? tax : 0;
      }
      return next;
    });
  };

  const calcRowManually = (idx: number) => {
    setItems((prev) => {
      const next = [...prev];
      const r = next[idx];
      const { amount, supply, tax } = calcRow(r.qty, r.unitCost, taxType);
      r.amount = amount;
      r.supplyCost = supply;
      r.tax = taxType === "과세" ? tax : 0;
      return next;
    });
  };

  const addItem = () =>
    setItems((p) => [...p, { month: "", day: "", itemName: "", spec: "", qty: "", unitCost: "", amount: 0, supplyCost: 0, tax: 0, remark: "" }]);
  const removeItem = (idx: number) => setItems((p) => p.filter((_, i) => i !== idx));

  /* 합계 */
  const totals = useMemo(() => {
    const isTaxFree = taxType === "면세" || taxType === "영세";
    const sum = items.reduce(
      (acc, r) => {
        const { amount, supply, tax } = calcRow(r.qty, r.unitCost, taxType);
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
  const [toast, setToast] = useState<{ open: boolean; message: string; severity: "success" | "error" | "info" }>({
    open: false,
    message: "",
    severity: "success",
  });
  const onlyDigits = (s: string = "") => s.replace(/[^0-9]/g, "");
  const joinAddr = (addr?: string, detail?: string) => [addr, detail].filter(Boolean).join(" ");
  /* 사업자 정보 조회 (컴포넌트 내부 useCallback) */
  const checkBizInfo = useCallback(async (corpNum: string) => {
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

    const detailList = items
      .map((it, i) => ({
        serialNum: i + 1,
        purchaseDT: (writeDate || "").replaceAll("-", ""),
        itemName: it.itemName,
        spec: it.spec || "",
        qty: toNumber(it.qty),
        unitCost: toNumber(it.unitCost),
        supplyCost: it.supplyCost,
        tax: taxType === "과세" ? it.tax : 0,
        remark: it.remark || "",
      }))
      .filter((d) => d.itemName || d.qty || d.unitCost);

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
    } as const;

    return { taxinvoice };
  };

  /* 제출 */
  const handleSubmit = async () => {
    try {
      setLoading(true);

      // 1) 프론트에서 만드는 payload
      //    { taxinvoice: { ...프론트 상태들..., detailList: [...] } }
      const payload = buildPayload();
      const submitUrl = `${apiUrl}/api/popbill/tax/registTaxIssue`;
      // 2) 서버로 전송
      console.log("payload", payload);
      const res = await fetch(submitUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err?.message || `HTTP ${res.status}`);
      }

      const data = await res.json().catch(() => ({}));
      setToast({ open: true, message: "세금계산서 발행 요청이 완료되었습니다.", severity: "success" });

      // 필요 시 상위 콜백
      // onIssued?.(data);
      // onClose?.();
    } catch (err: any) {
      setToast({ open: true, message: `발행 실패: ${err?.message || err}`, severity: "error" });
    } finally {
      setLoading(false);
    }
  };

  /* 리셋 */
  const handleReset = () => {
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
        amount: 0,
        supplyCost: 0,
        tax: 0,
        remark: "",
      }))
    );
  };

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
            <Stack spacing={1}>
              <Grid container spacing={2} sx={{ width: "100% !important" }}>
                <Grid item xs={12} md={6} sx={{ pl: "0px !important" }}>
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
                      <TableCell align="right">
                        <Chip label={fmt(row.supplyCost)} sx={squareChipSx} />
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
            <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ mt: 1, pr: 2.5, width: "100%" }}>
              <Button variant="outlined" onClick={handleReset}>
                초기화
              </Button>
              <Box flex={1} />
              {/* 과세/영세/면세 & 발행유형(옵션) */}
              <ToggleButtonGroup size="small" exclusive value={taxType} onChange={(_, v) => v && setTaxType(v)}>
                <ToggleButton value="과세">과세</ToggleButton>
                <ToggleButton value="영세">영세</ToggleButton>
                <ToggleButton value="면세">면세</ToggleButton>
              </ToggleButtonGroup>
              <ToggleButtonGroup size="small" exclusive value={issueType} onChange={(_, v) => v && setIssueType(v)}>
                <ToggleButton value="정발행">정발행</ToggleButton>
                <ToggleButton value="역발행">역발행</ToggleButton>
                <ToggleButton value="위수탁">위수탁</ToggleButton>
              </ToggleButtonGroup>
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
