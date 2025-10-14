import React, { useMemo, useState, useEffect } from "react";

import {
  Dialog,
  DialogTitle,
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
} from "@mui/material";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import CalculateIcon from "@mui/icons-material/Calculate";
import { SxProps, Theme } from "@mui/material/styles";

export type InvoiceIssueModalProps = {
  open: boolean;
  onClose: () => void;
  apiUrl?: string;
  onIssued?: (response: any) => void;
  defaultInvoiceeCorpName?: string;
};

type InvoiceItem = {
  month?: string;
  day?: string;
  itemName: string;
  spec?: string;
  qty: number | "";
  unitCost: number | "";
  amount: number; // 합계 (qty * unitCost)
  supplyCost: number; // 공급가액
  tax: number; // 세액
  remark?: string;
};
// 파일 상단 유틸 근처에 추가
const fmt = (n: number) =>
  Number.isFinite(n) ? n.toLocaleString("ko-KR") : "0";

// 숫자 컬럼 폭 설정 (필요시 조절)
const COLW = {
  month: 50,
  day: 50,
  qty: 50,
  unitCost: 160, // ✅ 단가 넓힘
  amount: 160,
  supply: 160,
  tax: 140,
};
export const squareChipSx: SxProps<Theme> = {
  borderRadius: 0,
  height: 32,
  minWidth: 100,
  display: "inline-flex",
  justifyContent: "flex-end", // (옵션) 아이콘이 있어도 오른쪽 정렬 유지
  "& .MuiChip-label": {
    width: "100%", // 라벨이 칩 전체 폭 차지
    textAlign: "right", // ✅ 우측 정렬
    px: 1.25,
    fontVariantNumeric: "tabular-nums",
    boxSizing: "border-box",
  },
};

const toNumber = (v: number | string | "") => {
  if (v === "" || v === undefined || v === null) return 0;
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

const calcRow = (qty: number | "", unitCost: number | "", taxType: string) => {
  const q = toNumber(qty);
  const u = toNumber(unitCost);
  const amount = Math.round(q * u);
  const isTaxFree = taxType === "면세" || taxType === "영세";
  const supply = isTaxFree ? amount : Math.round(amount / 1.1);
  const tax = isTaxFree ? 0 : amount - supply;
  return { amount, supply, tax };
};

/* ---------- 공통 카드 (공급자/공급받는자) ---------- */

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
  accent?: string;
};

const PartyCard: React.FC<PartyCardProps> = ({
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
  accent = "#90caf9",
}) => (
  <Paper variant="outlined" sx={{ p: 2, borderColor: accent }}>
    <Typography
      variant="subtitle2"
      sx={{ fontWeight: 700, color: accent, mb: 1 }}
    >
      {title}
    </Typography>
    <Grid container spacing={1}>
      <Grid item xs={12} md={12}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            label="등록번호"
            size="small"
            fullWidth
            value={corpNum}
            onChange={(e) => setCorpNum(e.target.value)}
          />
          <Button variant="outlined" sx={{ whiteSpace: "nowrap" }}>
            조회
          </Button>
        </Stack>
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label="상호"
          size="small"
          fullWidth
          value={corpName}
          onChange={(e) => setCorpName(e.target.value)}
        />
      </Grid>

      <Grid item xs={12} md={6}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            label="성명"
            size="small"
            fullWidth
            value={ceoName}
            onChange={(e) => setCeoName(e.target.value)}
          />
        </Stack>
      </Grid>
      <Grid item xs={12}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
          <TextField
            label="사업장"
            size="small"
            fullWidth
            value={addr}
            onChange={(e) => setAddr(e.target.value)}
          />
          {/* <Button variant="outlined" sx={{ whiteSpace: "nowrap" }}>
            주소변경
          </Button> */}
        </Stack>
      </Grid>

      <Grid item xs={12} md={6}>
        <TextField
          label="업태"
          size="small"
          fullWidth
          value={bizType}
          onChange={(e) => setBizType(e.target.value)}
        />
      </Grid>
      <Grid item xs={12} md={6}>
        <TextField
          label="종목"
          size="small"
          fullWidth
          value={bizClass}
          onChange={(e) => setBizClass(e.target.value)}
        />
      </Grid>

      <Grid item xs={12}>
        <Grid container spacing={1} alignItems="center">
          <Grid item xs={12} sm={6}>
            <TextField
              label="이메일"
              size="small"
              fullWidth
              value={emailLocal}
              onChange={(e) => setEmailLocal(e.target.value)}
            />
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
                "& .MuiInputBase-root": {
                  height: "100%",
                },
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
);

/* ---------- 메인 컴포넌트 ---------- */

const InvoiceIssueModal: React.FC<InvoiceIssueModalProps> = ({
  open,
  onClose,
  apiUrl = "/api/taxinvoice/issue",
  onIssued,
  defaultInvoiceeCorpName,
}) => {
  const [taxType, setTaxType] = useState<"과세" | "영세" | "면세">("과세");
  const [issueType, setIssueType] = useState<"정발행" | "역발행" | "위수탁">(
    "정발행"
  );
  const [purposeType, setPurposeType] = useState<"영수" | "청구">("청구");

  const [writeDate, setWriteDate] = useState<string>(() => {
    const d = new Date();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${mm}-${dd}`;
  });

  // 공급자
  const [invoicerCorpNum, setInvoicerCorpNum] = useState("149-88-02941");
  const [invoicerCorpName, setInvoicerCorpName] = useState("주식회사 타울");
  const [invoicerCEOName, setInvoicerCEOName] = useState("김완준 외 1명");
  const [invoicerAddr, setInvoicerAddr] = useState(
    "서울특별시 동대문구 장한로 53, 5층 504호(장안동, 제이빌딩)"
  );
  const [invoicerBizType, setInvoicerBizType] = useState("도소매업");
  const [invoicerBizClass, setInvoicerBizClass] =
    useState("가구, 인테리어소품");
  const [invoicerEmailLocal, setInvoicerEmailLocal] = useState("taulcontact");
  const [invoicerEmailDomain, setInvoicerEmailDomain] = useState("gmail.com");

  // 공급받는자
  const [invoiceeCorpNum, setInvoiceeCorpNum] = useState("");
  const [invoiceeCorpName, setInvoiceeCorpName] = useState("");
  const [invoiceeCEOName, setInvoiceeCEOName] = useState("");
  const [invoiceeAddr, setInvoiceeAddr] = useState("");
  const [invoiceeBizType, setInvoiceeBizType] = useState("");
  const [invoiceeBizClass, setInvoiceeBizClass] = useState("");
  const [invoiceeEmailLocal, setInvoiceeEmailLocal] = useState("");
  const [invoiceeEmailDomain, setInvoiceeEmailDomain] = useState("");

  const emailDomainOptions = [
    "gmail.com",
    "naver.com",
    "daum.net",
    "직접입력",
  ] as const;

  useEffect(() => {
    if (!open) return;
    if (defaultInvoiceeCorpName) {
      setInvoiceeCorpName(defaultInvoiceeCorpName);
    }
  }, [open, defaultInvoiceeCorpName]);

  const [remark, setRemark] = useState("");
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

  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info";
  }>({ open: false, message: "", severity: "success" });

  const handleItemChange = (
    idx: number,
    key: keyof InvoiceItem,
    value: any
  ) => {
    setItems((prev) => {
      const next = [...prev];
      const row = { ...next[idx], [key]: value } as InvoiceItem;
      const { amount, supply, tax } = calcRow(row.qty, row.unitCost, taxType);
      row.amount = amount;
      row.supplyCost = supply;
      row.tax = taxType === "과세" ? tax : 0;
      next[idx] = row;
      return next;
    });
  };

  const addItem = () => {
    setItems((p) => [
      ...p,
      {
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
      },
    ]);
  };
  const removeItem = (idx: number) =>
    setItems((p) => p.filter((_, i) => i !== idx));

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

  const buildPayload = () => {
    const emailJoin = (local: string, domain: string) =>
      domain && domain !== "직접입력" ? `${local}@${domain}` : local;

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
      remark,

      detailList,
    } as const;

    return { taxinvoice };
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const payload = buildPayload();
      const res = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json().catch(() => ({}));
      setToast({
        open: true,
        message: "세금계산서 발행 요청이 완료되었습니다.",
        severity: "success",
      });
      onIssued?.(data);
      onClose();
    } catch (err: any) {
      setToast({
        open: true,
        message: `발행 실패: ${err?.message || err}`,
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  /* 상단 옵션 바 + 공급자/공급받는자 + 작성일/비고/합계 */
  const HeaderSection = () => (
    <Stack spacing={1}>
      {/* 옵션 바: 과세구분 / 발행유형 */}
      {/* <Paper variant="outlined" sx={{ p: 1.5 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">과세구분</Typography>
            <ToggleButtonGroup
              size="small"
              value={taxType}
              exclusive
              onChange={(_, v) => v && setTaxType(v)}
            >
              <ToggleButton value="과세">과세</ToggleButton>
              <ToggleButton value="영세">영세</ToggleButton>
              <ToggleButton value="면세">면세</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">발행유형</Typography>
            <ToggleButtonGroup
              size="small"
              value={issueType}
              exclusive
              onChange={(_, v) => v && setIssueType(v)}
            >
              <ToggleButton value="정발행">정발행</ToggleButton>
              <ToggleButton value="역발행">역발행</ToggleButton>
              <ToggleButton value="위수탁">위수탁</ToggleButton>
            </ToggleButtonGroup>
          </Stack>
        </Stack>
      </Paper> */}

      <Grid
        container
        spacing={2}
        sx={{
          width: "100% !important",
        }}
      >
        <Grid item xs={6} md={6} sx={{ pl: "0px !important" }}>
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
            accent="#ff8a80"
          />
        </Grid>

        <Grid item xs={6} md={6}>
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
            accent="#7d93d4ff"
          />
        </Grid>

        {/* 작성일/비고/합계 */}
        <Grid item xs={12} sx={{ pl: "0px !important" }}>
          <Paper
            variant="outlined"
            sx={{ mt: 1, maxWidth: "100%", mx: "auto", p: 1 }}
          >
            {/* 한 행: 세 칸이 같은 높이를 유지 */}
            <Grid
              container
              columnSpacing={2}
              // rowSpacing={1}
              alignItems="stretch" // ✅ 세 칸 높이 동일
            >
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
                <TextField
                  label="비고"
                  size="small"
                  fullWidth
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                {/* ✅ 높이를 행에 맞춰 채우고, 내용은 수직 가운데 정렬 */}
                <Box
                  sx={{
                    height: "100%",
                    p: 1.5,
                    bgcolor: "grey.50",
                    borderRadius: 1,
                    display: "flex",
                    alignItems: "center",
                    fontSize: 13,
                    "& .MuiTypography-root": {
                      fontSize: "inherit", // 상위 fontSize 상속
                    },
                  }}
                >
                  <Grid container>
                    <Grid item xs={5}>
                      <Typography>합계금액</Typography>
                    </Grid>
                    <Grid item xs={7} textAlign="right">
                      <Typography variant="body2">
                        {totals.totalAmount.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography variant="body2">공급가액</Typography>
                    </Grid>
                    <Grid item xs={7} textAlign="right">
                      <Typography variant="body2">
                        {totals.supplyCostTotal.toLocaleString()}
                      </Typography>
                    </Grid>
                    <Grid item xs={5}>
                      <Typography variant="body2">세액</Typography>
                    </Grid>
                    <Grid item xs={7} textAlign="right">
                      <Typography variant="body2">
                        {totals.taxTotal.toLocaleString()}
                      </Typography>
                    </Grid>
                  </Grid>
                </Box>
              </Grid>

              {/* ✅ 캡션을 행 아래 공통 영역으로 분리 → 높이 불균형 제거 */}
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
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogTitle>세금계산서 발행</DialogTitle>
      <Box sx={{ maxHeight: "80vh", overflow: "auto" }}>
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
          <HeaderSection />

          <Typography variant="caption" sx={{ mt: 1, display: "block", ml: 2 }}>
            ※ 아래 "품목"의 "월"은 상단 작성일자의 "월"이 자동 반영됩니다.
            합계의 "계산" 버튼은 공급가액과 세액으로 계산할 수 있습니다. (최대
            16개)
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
                  <TableCell
                    align="right"
                    sx={{ width: COLW.unitCost, textAlign: "center" }}
                  >
                    단가
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ width: COLW.amount, textAlign: "center" }}
                  >
                    합계
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ width: COLW.supply, textAlign: "center" }}
                  >
                    공급가액
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ width: COLW.tax, textAlign: "center" }}
                  >
                    세액
                  </TableCell>
                  <TableCell sx={{ width: 72 }}>비고</TableCell>
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
                        onChange={(e) =>
                          handleItemChange(idx, "month", e.target.value)
                        }
                        inputProps={{ inputMode: "numeric", maxLength: 2 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={row.day ?? ""}
                        onChange={(e) =>
                          handleItemChange(idx, "day", e.target.value)
                        }
                        inputProps={{ inputMode: "numeric", maxLength: 2 }}
                      />
                    </TableCell>
                    <TableCell>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          size="small"
                          fullWidth
                          value={row.itemName}
                          onChange={(e) =>
                            handleItemChange(idx, "itemName", e.target.value)
                          }
                        />
                        {/* <Button variant="outlined">조회</Button> */}
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={row.spec ?? ""}
                        onChange={(e) =>
                          handleItemChange(idx, "spec", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="text"
                        value={row.qty}
                        onChange={(e) =>
                          handleItemChange(idx, "qty", Number(e.target.value))
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="text"
                        value={row.unitCost}
                        onChange={(e) =>
                          handleItemChange(
                            idx,
                            "unitCost",
                            Number(e.target.value)
                          )
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="flex-end"
                        alignItems="center"
                      >
                        <Chip
                          label={row.amount.toLocaleString()}
                          sx={squareChipSx}
                          // variant="outlined"
                        />
                        <IconButton
                          size="small"
                          onClick={() => calcRowManually(idx)}
                        >
                          <CalculateIcon fontSize="small" />
                        </IconButton>
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={row.supplyCost.toLocaleString()}
                        sx={squareChipSx}
                        // variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={(taxType === "과세"
                          ? row.tax
                          : 0
                        ).toLocaleString()}
                        sx={squareChipSx}
                        // variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={row.remark ?? ""}
                        onChange={(e) =>
                          handleItemChange(idx, "remark", e.target.value)
                        }
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

            <Box
              sx={{
                p: 1.5,
                display: "flex",
                gap: 1,
                justifyContent: "space-between",
              }}
            >
              {/* <!--<Box>
                <Button startIcon={<AddCircleOutlineIcon />} onClick={addItem}>
                  품목추가
                </Button>
                <Button sx={{ ml: 1 }} variant="outlined">
                  품목삭제
                </Button>
                <Button sx={{ ml: 1 }} variant="outlined">
                  거래처품목 관리
                </Button>
                <Button sx={{ ml: 1 }} variant="outlined">
                  거래처품목 조회
                </Button>
              </Box>--> */}
              <Box>
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">이 금액을</Typography>
                  <ToggleButtonGroup
                    size="small"
                    value={purposeType}
                    exclusive
                    onChange={(_, v) => v && setPurposeType(v)}
                  >
                    <ToggleButton value="청구">청구</ToggleButton>
                    <ToggleButton value="영수">영수</ToggleButton>
                  </ToggleButtonGroup>
                  <Typography variant="body2">함</Typography>
                </Stack>
              </Box>
            </Box>
          </Paper>

          {/* 하단 결제수단 메모 */}
          {/* <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={3}>
                <TextField label="현금" size="small" fullWidth />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="수표" size="small" fullWidth />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="어음" size="small" fullWidth />
              </Grid>
              <Grid item xs={12} md={3}>
                <TextField label="외상미수금" size="small" fullWidth />
              </Grid>
            </Grid>
          </Paper> */}
        </DialogContent>

        <DialogActions>
          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={2}
            sx={{ mt: 1, pr: 2.5 }} // ✅ 오른쪽 패딩 20px
          >
            <Button variant="outlined">초기화</Button>
            <Box flex={1} />
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ width: 150 }}
            >
              {loading ? "발급 중..." : "발급하기"}
            </Button>
          </Stack>
          <Button onClick={onClose}>닫기</Button>
        </DialogActions>
      </Box>

      <Snackbar
        open={toast.open}
        autoHideDuration={4000}
        onClose={() => setToast((t) => ({ ...t, open: false }))}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={toast.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {toast.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default InvoiceIssueModal;
