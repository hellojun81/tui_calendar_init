import React, { useMemo, useState } from "react";
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
  Divider,
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

export type InvoiceIssueModalProps = {
  open: boolean;
  onClose: () => void;
  apiUrl?: string;
  onIssued?: (response: any) => void;
};

type InvoiceItem = {
  month?: string;
  day?: string;
  itemName: string;
  spec?: string;
  qty: number | "";
  unitCost: number | "";
  amount: number; // 합계 (qty*unitCost)
  supplyCost: number; // 공급가액
  tax: number; // 세액
  remark?: string;
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

const LabelBar: React.FC<{ text: string; color: string }> = ({
  text,
  color,
}) => (
  <Box
    sx={{
      writingMode: "vertical-rl",
      transform: "rotate(180deg)",
      bgcolor: color,
      color: "white",
      px: 1,
      alignSelf: "stretch",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderTopLeftRadius: 8,
      borderBottomLeftRadius: 8,
      fontWeight: 700,
      letterSpacing: 2,
    }}
  >
    {text}
  </Box>
);

const SectionPaper: React.FC<{ children: React.ReactNode; tint: string }> = ({
  children,
  tint,
}) => (
  <Paper variant="outlined" sx={{ p: 2, borderColor: tint }}>
    {children}
  </Paper>
);

const InvoiceIssueModal: React.FC<InvoiceIssueModalProps> = ({
  open,
  onClose,
  apiUrl = "/api/taxinvoice/issue",
  onIssued,
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
    return `${d.getFullYear()}-${mm}-${dd}`; // UI용 yyyy-mm-dd
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

  const [remark, setRemark] = useState("");

  const [items, setItems] = useState<InvoiceItem[]>(
    Array.from({ length: 4 }).map(() => ({
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
      remark: remark,

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

  const HeaderSection = () => (
    <Grid container spacing={2}>
      {/* 공급자 */}
      <Grid item xs={12} md={6}>
        <Box display="flex">
          <LabelBar text="공급자" color="#ff8a80" />
          <Box flex={1}>
            <SectionPaper tint="#ff8a80">
              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="등록번호"
                    size="small"
                    fullWidth
                    value={invoicerCorpNum}
                    onChange={(e) => setInvoicerCorpNum(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="상호"
                    size="small"
                    fullWidth
                    value={invoicerCorpName}
                    onChange={(e) => setInvoicerCorpName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="성명"
                    size="small"
                    fullWidth
                    value={invoicerCEOName}
                    onChange={(e) => setInvoicerCEOName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <TextField
                      label="사업장"
                      size="small"
                      fullWidth
                      value={invoicerAddr}
                      onChange={(e) => setInvoicerAddr(e.target.value)}
                    />
                    <Button variant="outlined" sx={{ whiteSpace: "nowrap" }}>
                      주소변경
                    </Button>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <ToggleButtonGroup
                    size="small"
                    value={invoicerBizType}
                    exclusive
                    onChange={(_, v) => v && setInvoicerBizType(v)}
                  >
                    <ToggleButton value="도소매업">도소매업</ToggleButton>
                    <ToggleButton value="업태변경">업태변경</ToggleButton>
                  </ToggleButtonGroup>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="종목"
                    size="small"
                    fullWidth
                    value={invoicerBizClass}
                    onChange={(e) => setInvoicerBizClass(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      label="이메일"
                      size="small"
                      value={invoicerEmailLocal}
                      onChange={(e) => setInvoicerEmailLocal(e.target.value)}
                      sx={{ width: 220 }}
                    />
                    <Typography>@</Typography>
                    <TextField
                      select
                      size="small"
                      value={invoicerEmailDomain}
                      onChange={(e) => setInvoicerEmailDomain(e.target.value)}
                      sx={{ width: 220 }}
                    >
                      {emailDomainOptions.map((d) => (
                        <MenuItem key={d} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Button variant="outlined">조회</Button>
                  </Stack>
                </Grid>
              </Grid>
            </SectionPaper>
          </Box>
        </Box>
      </Grid>

      {/* 공급받는자 */}
      <Grid item xs={12} md={6}>
        <Box display="flex">
          <LabelBar text="공급받는자" color="#80cbc4" />
          <Box flex={1}>
            <SectionPaper tint="#80cbc4">
              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="등록번호"
                    size="small"
                    fullWidth
                    value={invoiceeCorpNum}
                    onChange={(e) => setInvoiceeCorpNum(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="상호"
                    size="small"
                    fullWidth
                    value={invoiceeCorpName}
                    onChange={(e) => setInvoiceeCorpName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="성명"
                    size="small"
                    fullWidth
                    value={invoiceeCEOName}
                    onChange={(e) => setInvoiceeCEOName(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                    <TextField
                      label="사업장"
                      size="small"
                      fullWidth
                      value={invoiceeAddr}
                      onChange={(e) => setInvoiceeAddr(e.target.value)}
                    />
                    <Button variant="outlined">주소변경</Button>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="업태"
                    size="small"
                    fullWidth
                    value={invoiceeBizType}
                    onChange={(e) => setInvoiceeBizType(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="종목"
                    size="small"
                    fullWidth
                    value={invoiceeBizClass}
                    onChange={(e) => setInvoiceeBizClass(e.target.value)}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <TextField
                      label="이메일"
                      size="small"
                      value={invoiceeEmailLocal}
                      onChange={(e) => setInvoiceeEmailLocal(e.target.value)}
                      sx={{ width: 220 }}
                    />
                    <Typography>@</Typography>
                    <TextField
                      select
                      size="small"
                      value={invoiceeEmailDomain}
                      onChange={(e) => setInvoiceeEmailDomain(e.target.value)}
                      sx={{ width: 220 }}
                    >
                      {emailDomainOptions.map((d) => (
                        <MenuItem key={d} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                    </TextField>
                    <Button variant="outlined">조회</Button>
                  </Stack>
                </Grid>
              </Grid>
            </SectionPaper>
          </Box>
        </Box>
      </Grid>

      {/* 작성일/비고/합계 */}
      <Grid item xs={12}>
        <Paper variant="outlined" sx={{ p: 2 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                type="date"
                label="작성일자"
                InputLabelProps={{ shrink: true }}
                size="small"
                fullWidth
                value={writeDate}
                onChange={(e) => setWriteDate(e.target.value)}
              />
              <Typography variant="caption" color="text.secondary">
                * 작성일자는 공급 연월일을 의미
              </Typography>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack direction="row" spacing={1} alignItems="center">
                <TextField
                  label="비고"
                  size="small"
                  fullWidth
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
                <Button variant="outlined">조회</Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={3}>
              <Box sx={{ p: 1.5, bgcolor: "grey.50", borderRadius: 1 }}>
                <Grid container>
                  <Grid item xs={5}>
                    <Typography variant="body2">합계금액</Typography>
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
          </Grid>
        </Paper>
      </Grid>
    </Grid>
  );

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>세금계산서 발행</DialogTitle>
      <Box
        sx={{
          maxHeight: "80vh",
          overflow: "auto",
          width: "100%",
        }}
      >
        <DialogContent
          dividers
          sx={{
            maxHeight: "80vh",
            overflow: "auto",
            width: "100%",
            fontSize: "0.75rem", // 전체 글씨 크기 축소
            "& .MuiInputBase-input": {
              fontSize: "0.75rem",
              py: 0.5,
            },
            "& .MuiInputLabel-root": {
              fontSize: "0.75rem",
            },
            "& .MuiButton-root": {
              fontSize: "0.75rem",
              py: 0.5,
              px: 1.2,
            },
            "& .MuiTableCell-root": {
              fontSize: "0.75rem",
              py: 0.5,
              px: 0.5,
            },
            "& .MuiChip-label": {
              fontSize: "0.7rem",
            },
          }}
        >
          <HeaderSection />

          <Typography variant="caption" sx={{ mt: 1, display: "block" }}>
            ※ 아래 "품목"의 "월"은 상단 작성일자의 "월"이 자동 반영됩니다.
            합계의 "계산" 버튼은 공급가액과 세액으로 계산할 수 있습니다. (최대
            16개)
          </Typography>

          {/* 품목 테이블 */}
          <Paper variant="outlined" sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: 60 }}>월</TableCell>
                  <TableCell sx={{ width: 60 }}>일</TableCell>
                  <TableCell>품목</TableCell>
                  <TableCell>규격</TableCell>
                  <TableCell align="right">수량</TableCell>
                  <TableCell align="right">단가</TableCell>
                  <TableCell align="right">합계</TableCell>
                  <TableCell align="right">공급가액</TableCell>
                  <TableCell align="right">세액</TableCell>
                  <TableCell>비고</TableCell>
                  <TableCell sx={{ width: 72 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <TextField
                        size="small"
                        value={row.month}
                        onChange={(e) =>
                          handleItemChange(idx, "month", e.target.value)
                        }
                        inputProps={{ inputMode: "numeric", maxLength: 2 }}
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        value={row.day}
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
                        <Button variant="outlined">조회</Button>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={row.spec}
                        onChange={(e) =>
                          handleItemChange(idx, "spec", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
                        value={row.qty}
                        onChange={(e) =>
                          handleItemChange(idx, "qty", Number(e.target.value))
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
                      <TextField
                        size="small"
                        type="number"
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
                          variant="outlined"
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
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <Chip
                        label={(taxType === "과세"
                          ? row.tax
                          : 0
                        ).toLocaleString()}
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <TextField
                        size="small"
                        fullWidth
                        value={row.remark}
                        onChange={(e) =>
                          handleItemChange(idx, "remark", e.target.value)
                        }
                      />
                    </TableCell>
                    <TableCell align="right">
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
              <Box>
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
              </Box>
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
          <Paper variant="outlined" sx={{ p: 2, mt: 2 }}>
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
          </Paper>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={1}
            sx={{ mt: 2 }}
          >
            <Button variant="outlined">초기화</Button>
            <Box flex={1} />
            <Button variant="outlined">발급미리보기</Button>
            <Button variant="outlined">발급보류</Button>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? "발급 중..." : "발급하기"}
            </Button>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>닫기</Button>
        </DialogActions>
      </Box>
      <Snackbar
        open={false}
        autoHideDuration={4000}
        onClose={() => {}}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity="success" variant="filled" sx={{ width: "100%" }}>
          완료
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default InvoiceIssueModal;
