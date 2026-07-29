import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import PrintIcon from "@mui/icons-material/Print";
import SaveIcon from "@mui/icons-material/Save";

const API_URL = process.env.NODE_ENV === "production" ? process.env.REACT_APP_API_URL_PRODUCTION : process.env.REACT_APP_API_URL_LOCAL;

interface EstimateParty {
  corpName: string;
  businessNumber: string;
  representative: string;
  address: string;
  businessType: string;
  businessClass: string;
  contact: string;
  email: string;
}

interface EstimateItem {
  id: string;
  name: string;
  spec: string;
  quantity: number;
  unitPrice: number;
  note: string;
}

interface RentalDetails {
  rentalDate: string;
  rentalTime: string;
  rentalSpace: string;
  personnel: string;
}

interface EstimateDocument {
  estimateNo: string;
  estimateTitle: string;
  issueDate: string;
  validity: string;
  supplier: EstimateParty;
  recipient: EstimateParty;
  rentalDetails: RentalDetails;
  items: EstimateItem[];
  taxable: boolean;
  bankInfo: string;
  note: string;
}

interface EstimateDocumentModalProps {
  open: boolean;
  onClose: () => void;
  onSaved?: () => void;
  documentKey: string;
  scheduleId: number;
  customerName: string;
  contactPerson?: string;
  contactTel?: string;
  estimatePrice?: number;
  shootingType?: string;
  rentPlace?: string;
  startDate?: Date;
  endDate?: Date;
  startTime?: string;
  endTime?: string;
  personnel?: string;
}

interface CustomerResponse {
  customerName?: string;
  contactPerson?: string;
  phone?: string;
  email?: string;
  businessNumber?: string;
  representative?: string;
  location?: string;
}

const emptyParty = (): EstimateParty => ({
  corpName: "",
  businessNumber: "",
  representative: "",
  address: "",
  businessType: "",
  businessClass: "",
  contact: "",
  email: "",
});

const formatDate = (date?: Date) => {
  if (!date || Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
};

const today = () => formatDate(new Date());
const money = (value: number) => Math.round(value || 0).toLocaleString("ko-KR");
const makeItemId = () => `${Date.now()}-${Math.random().toString(36).slice(2)}`;

const buildDefaultDocument = (props: EstimateDocumentModalProps): EstimateDocument => {
  const floorText = (props.rentPlace || "")
    .split(",")
    .filter(Boolean)
    .map((floor) => `${floor.trim()}층`)
    .join(", ");
  const rentalDate = [formatDate(props.startDate), formatDate(props.endDate)].filter(Boolean).join(" ~ ");
  const usageTime = [props.startTime, props.endTime].filter(Boolean).join(" ~ ");
  const dateCode = today().replaceAll("-", "");

  return {
    estimateNo: `TAUL-${dateCode}-${props.scheduleId || "DRAFT"}`,
    estimateTitle: "스튜디오 렌탈 견적",
    issueDate: today(),
    validity: "견적일로부터 30일",
    supplier: {
      corpName: "주식회사 타울",
      businessNumber: "149-88-02941",
      representative: "김완준 외 1명",
      address: "서울특별시 동대문구 장한로 53, 5층 504호(장안동, 제이빌딩)",
      businessType: "도소매업",
      businessClass: "가구, 인테리어소품 / 스튜디오 렌탈",
      contact: "010-3101-9551",
      email: "taulcontact@gmail.com",
    },
    recipient: {
      ...emptyParty(),
      corpName: props.customerName || "",
      representative: props.contactPerson || "",
      contact: props.contactTel || "",
    },
    rentalDetails: {
      rentalDate,
      rentalTime: usageTime,
      rentalSpace: floorText,
      personnel: props.personnel || "",
    },
    items: [
      {
        id: makeItemId(),
        name: `스튜디오 렌탈${props.shootingType ? ` (${props.shootingType})` : ""}`,
        spec: "",
        quantity: 1,
        unitPrice: Math.round((props.estimatePrice || 0) * 10_000),
        note: "",
      },
    ],
    taxable: true,
    bankInfo: "기업은행 027-162297-04-021 (주)타울",
    note: "상기와 같이 견적합니다.",
  };
};

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

const exportEstimatePdf = async (pageElement: HTMLElement, estimateNo: string) => {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import("html2canvas"), import("jspdf")]);
  await pageElement.ownerDocument.fonts?.ready;
  pageElement.ownerDocument.body.classList.add("pdf-exporting");

  try {
    const canvas = await html2canvas(pageElement, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    });
    const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4", compress: true });
    const pageWidth = 210;
    const pageHeight = 297;
    const imageHeight = (canvas.height * pageWidth) / canvas.width;
    const pageRoundingTolerance = 0.5;
    const renderedImageHeight = imageHeight <= pageHeight + pageRoundingTolerance ? pageHeight : imageHeight;
    const imageData = canvas.toDataURL("image/jpeg", 0.95);
    let heightLeft = renderedImageHeight;
    let position = 0;

    pdf.addImage(imageData, "JPEG", 0, position, pageWidth, renderedImageHeight, undefined, "FAST");
    heightLeft -= pageHeight;
    while (heightLeft > pageRoundingTolerance) {
      position = heightLeft - renderedImageHeight;
      pdf.addPage();
      pdf.addImage(imageData, "JPEG", 0, position, pageWidth, renderedImageHeight, undefined, "FAST");
      heightLeft -= pageHeight;
    }

    const fileName = `${estimateNo || "estimate"}`.replace(/[\\/:*?"<>|]/g, "_");
    pdf.save(`${fileName}.pdf`);
  } finally {
    pageElement.ownerDocument.body.classList.remove("pdf-exporting");
  }
};

const EstimateDocumentModal: React.FC<EstimateDocumentModalProps> = (props) => {
  const { open, onClose, onSaved, documentKey, customerName } = props;
  const theme = useTheme();
  const isCompact = useMediaQuery(theme.breakpoints.down("md"));
  const defaults = useMemo(
    () => buildDefaultDocument(props),
    [
      props.scheduleId,
      props.customerName,
      props.contactPerson,
      props.contactTel,
      props.estimatePrice,
      props.shootingType,
      props.rentPlace,
      props.startDate,
      props.endDate,
      props.startTime,
      props.endTime,
      props.personnel,
    ]
  );
  const [estimate, setEstimate] = useState<EstimateDocument>(defaults);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfSaving, setPdfSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      setMessage("");
      setError("");
      try {
        const [savedResponse, customerResponse] = await Promise.all([
          axios.get<{ document: EstimateDocument | null }>(`${API_URL}/api/estimates/${encodeURIComponent(documentKey)}`),
          customerName
            ? axios.get<CustomerResponse[]>(`${API_URL}/api/customers/customerName?customerName=${encodeURIComponent(customerName)}`)
            : Promise.resolve({ data: [] as CustomerResponse[] }),
        ]);
        if (!active) return;

        if (savedResponse.data.document) {
          const saved = savedResponse.data.document;
          setEstimate({
            ...defaults,
            ...saved,
            supplier: { ...defaults.supplier, ...(saved.supplier || {}) },
            recipient: { ...defaults.recipient, ...(saved.recipient || {}) },
            rentalDetails: { ...defaults.rentalDetails, ...(saved.rentalDetails || {}) },
            items: saved.items?.length ? saved.items : defaults.items,
          });
          setMessage("저장된 견적서를 불러왔습니다.");
          return;
        }

        const customer = customerResponse.data.find((item) => item.customerName === customerName) || customerResponse.data[0];
        setEstimate({
          ...defaults,
          recipient: customer
            ? {
                ...defaults.recipient,
                corpName: customer.customerName || defaults.recipient.corpName,
                businessNumber: customer.businessNumber || "",
                representative: customer.representative || customer.contactPerson || defaults.recipient.representative,
                address: customer.location || "",
                contact: customer.phone || defaults.recipient.contact,
                email: customer.email || "",
              }
            : defaults.recipient,
        });
      } catch (loadError) {
        if (!active) return;
        console.error(loadError);
        setEstimate(defaults);
        setError("저장된 견적서를 불러오지 못했습니다. 새 견적서로 작성할 수 있습니다.");
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [open, documentKey, customerName, defaults]);

  const supplyTotal = estimate.items.reduce((sum, item) => sum + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0), 0);
  const taxTotal = estimate.taxable ? Math.round(supplyTotal * 0.1) : 0;
  const grandTotal = supplyTotal + taxTotal;

  const updateParty = (type: "supplier" | "recipient", field: keyof EstimateParty, value: string) => {
    setEstimate((prev) => ({ ...prev, [type]: { ...prev[type], [field]: value } }));
  };

  const updateItem = (id: string, field: keyof EstimateItem, value: string | number) => {
    setEstimate((prev) => ({
      ...prev,
      items: prev.items.map((item) => (item.id === id ? { ...item, [field]: value } : item)),
    }));
  };

  const addItem = () => {
    setEstimate((prev) => ({
      ...prev,
      items: [...prev.items, { id: makeItemId(), name: "", spec: "", quantity: 1, unitPrice: 0, note: "" }],
    }));
  };

  const deleteItem = (id: string) => {
    setEstimate((prev) => ({ ...prev, items: prev.items.filter((item) => item.id !== id) }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage("");
    setError("");
    try {
      await axios.put(`${API_URL}/api/estimates/${encodeURIComponent(documentKey)}`, { document: estimate });
      setMessage("견적서가 서버에 저장되었습니다.");
      onSaved?.();
    } catch (saveError: any) {
      console.error(saveError);
      setError(saveError?.response?.data?.error || "견적서를 저장하지 못했습니다.");
    } finally {
      setSaving(false);
    }
  };

  const buildPrintHtml = () => {
    const itemRows = estimate.items
      .map(
        (item, index) => `<tr>
          <td class="center">${index + 1}</td>
          <td>${escapeHtml(item.name)}</td>
          <td>${escapeHtml(item.spec)}</td>
          <td class="right">${money(item.quantity)}</td>
          <td class="right">${money(item.unitPrice)}</td>
          <td class="right">${money(item.quantity * item.unitPrice)}</td>
          <td>${escapeHtml(item.note)}</td>
        </tr>`
      )
      .join("");

    return `<!doctype html><html lang="ko"><head><meta charset="utf-8" /><title>${escapeHtml(
      estimate.estimateNo
    )}</title><style>
      @page { size: A4; margin: 12mm; }
      * { box-sizing: border-box; }
      body { margin: 0; color: #111; background: #e9ecef; font-family: Arial, "Noto Sans KR", sans-serif; font-size: 10.5px; }
      .preview-toolbar { position: sticky; top: 0; z-index: 100; display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 12px 20px; color: #fff; background: #263238; box-shadow: 0 2px 10px rgba(0,0,0,.28); }
      .preview-title { font-size: 14px; font-weight: 900; }
      .preview-guide { margin-top: 3px; color: #cfd8dc; font-size: 11px; }
      .preview-actions { display: flex; gap: 8px; flex-shrink: 0; }
      .preview-button { min-width: 92px; padding: 9px 14px; border: 1px solid #90a4ae; border-radius: 6px; color: #fff; background: transparent; font-size: 12px; font-weight: 800; cursor: pointer; }
      .preview-button:hover { background: rgba(255,255,255,.1); }
      .preview-button.primary { border-color: #1976d2; background: #1976d2; }
      .preview-button.primary:hover { background: #1565c0; }
      .preview-button.close { color: #263238; border-color: #fff; background: #fff; }
      .preview-button:disabled { opacity: .6; cursor: wait; }
      .page { width: calc(100% - 48px); max-width: 210mm; min-height: 297mm; margin: 24px auto; padding: 16mm 14mm 14mm; background: #fff; box-shadow: 0 5px 24px rgba(0,0,0,.18); }
      .pdf-exporting .page { width: 210mm; max-width: 210mm; margin: 0; box-shadow: none; }
      .top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6mm; }
      .estimate-word { margin: 0; font-size: 34px; font-weight: 900; letter-spacing: -1px; line-height: 1; }
      .brand { color: #1565c0; text-align: right; font-size: 17px; font-weight: 900; line-height: 1.1; }
      .brand small { display: block; margin-top: 1.5mm; color: #607d8b; font-size: 8px; letter-spacing: 1.5px; }
      .estimate-no { margin-bottom: 9mm; color: #666; font-size: 9px; }
      .summary { width: 100%; margin-bottom: 5mm; border-collapse: collapse; }
      .summary th, .summary td { padding: 1.1mm 0; border: 0; text-align: left; vertical-align: top; }
      .summary th { width: 23mm; font-weight: 800; }
      .summary td { font-weight: 500; }
      .intro { margin: 5mm 0 4mm; }
      .rental-title { margin: 0; padding-bottom: 2mm; border-bottom: 2px solid #111; font-size: 10px; font-weight: 900; letter-spacing: .5px; }
      .rental-info { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); margin-bottom: 9mm; border-bottom: 1px solid #999; }
      .rental-cell { min-height: 18mm; padding: 3mm 2.5mm; border-right: 1px solid #ddd; }
      .rental-cell:last-child { border-right: 0; }
      .rental-label { display: block; margin-bottom: 1.5mm; color: #777; font-size: 8px; font-weight: 700; }
      .rental-value { font-size: 10px; font-weight: 800; line-height: 1.35; overflow-wrap: anywhere; }
      table { width: 100%; border-collapse: collapse; table-layout: fixed; }
      .items { margin-top: 1mm; }
      .items th { padding: 2mm 1.5mm; border: 0; border-bottom: 1.5px solid #111; text-align: center; white-space: nowrap; font-weight: 800; }
      .items td { padding: 2.5mm 1.5mm; border: 0; border-bottom: 1px solid #e1e4e7; line-height: 1.4; vertical-align: top; overflow-wrap: anywhere; }
      .items tbody tr { height: 12mm; }
      .items th:nth-child(1) { width: 6%; } .items th:nth-child(2) { width: 20%; } .items th:nth-child(3) { width: 28%; }
      .items th:nth-child(4) { width: 8%; } .items th:nth-child(5) { width: 13%; } .items th:nth-child(6) { width: 14%; } .items th:nth-child(7) { width: 11%; }
      .center { text-align: center; } .right { text-align: right; }
      .totals { width: 54%; margin: 14mm 0 0 auto; border-top: 2px solid #111; }
      .totals th, .totals td { padding: 2.2mm 1mm; border: 0; text-align: left; }
      .totals td { text-align: right; font-weight: 800; }
      .grand th, .grand td { background: #eceff1; border-top: 1px solid #aaa; font-weight: 900; font-size: 12px; }
      .notes { margin-top: 10mm; }
      .notes h3 { margin: 0 0 2mm; font-size: 10px; }
      .notes-box { min-height: 25mm; padding: 3mm; border: 1px solid #aaa; line-height: 1.6; white-space: pre-wrap; }
      .supplier { margin-top: 7mm; padding-top: 4mm; border-top: 1px solid #ddd; }
      .supplier-label { margin-bottom: 2mm; color: #777; font-size: 8px; }
      .supplier-name { margin-bottom: 2mm; font-size: 15px; font-weight: 900; }
      .supplier-details { color: #555; font-size: 8.5px; line-height: 1.65; }
      .bank { margin-top: 2mm; color: #222; font-weight: 800; }
      @media print {
        html, body { width: 100%; height: auto; }
        body { background: #fff; }
        .preview-toolbar { display: none !important; }
        .page { width: auto; max-width: none; min-height: auto; margin: 0; padding: 0; box-shadow: none; break-after: avoid-page; page-break-after: avoid; }
      }
    </style></head><body>
      <div class="preview-toolbar">
        <div><div class="preview-title">견적서 미리보기</div><div class="preview-guide" id="pdf-guide">인쇄하거나 PDF 파일로 바로 저장할 수 있습니다.</div></div>
        <div class="preview-actions">
          <button class="preview-button" type="button" onclick="window.print()">인쇄하기</button>
          <button class="preview-button primary" id="pdf-save-button" type="button">PDF 저장</button>
          <button class="preview-button close" type="button" onclick="window.close()">닫기</button>
        </div>
      </div>
      <main class="page">
      <header class="top"><h1 class="estimate-word">ESTIMATE</h1><div class="brand">aubestudio<small>SPACE · CREATIVE · RENTAL</small></div></header>
      <div class="estimate-no">No. ${escapeHtml(estimate.estimateNo)}</div>
      <table class="summary"><tbody>
        <tr><th>수신자</th><td>${escapeHtml(estimate.recipient.corpName)}${estimate.recipient.representative ? ` · ${escapeHtml(estimate.recipient.representative)}` : ""}</td></tr>
        <tr><th>견적명</th><td>${escapeHtml(estimate.estimateTitle)}</td></tr>
        <tr><th>견적일</th><td>${escapeHtml(estimate.issueDate)}</td></tr>
        <tr><th>유효기간</th><td>${escapeHtml(estimate.validity)}</td></tr>
      </tbody></table>
      <div class="intro">아래와 같이 견적합니다.</div>
      <h2 class="rental-title">RENTAL INFORMATION</h2>
      <section class="rental-info">
        <div class="rental-cell"><span class="rental-label">렌탈 날짜</span><div class="rental-value">${escapeHtml(estimate.rentalDetails.rentalDate)}</div></div>
        <div class="rental-cell"><span class="rental-label">렌탈 시간</span><div class="rental-value">${escapeHtml(estimate.rentalDetails.rentalTime)}</div></div>
        <div class="rental-cell"><span class="rental-label">렌탈 공간</span><div class="rental-value">${escapeHtml(estimate.rentalDetails.rentalSpace)}</div></div>
        <div class="rental-cell"><span class="rental-label">사용 인원</span><div class="rental-value">${escapeHtml(estimate.rentalDetails.personnel)}</div></div>
      </section>
      <table class="items"><thead><tr><th>No.</th><th>품목</th><th>추가 내용</th><th>수량</th><th>단가</th><th>공급가액</th><th>비고</th></tr></thead><tbody>${itemRows}</tbody></table>
      <table class="totals"><tr><th>공급가액</th><td>${money(supplyTotal)} 원</td></tr><tr><th>부가세</th><td>${money(
      taxTotal
    )} 원</td></tr><tr class="grand"><th>합계금액</th><td>${money(grandTotal)} 원</td></tr></table>
      <section class="notes"><h3>특이사항</h3><div class="notes-box">${escapeHtml(estimate.note)}</div></section>
      <footer class="supplier">
        <div class="supplier-label">공급자</div>
        <div class="supplier-name">${escapeHtml(estimate.supplier.corpName)}</div>
        <div class="supplier-details">등록번호 ${escapeHtml(estimate.supplier.businessNumber)}　 대표자 ${escapeHtml(estimate.supplier.representative)}　 업태 ${escapeHtml(estimate.supplier.businessType)}　 종목 ${escapeHtml(estimate.supplier.businessClass)}<br />${escapeHtml(estimate.supplier.address)}<br />T. ${escapeHtml(estimate.supplier.contact)}　 E. ${escapeHtml(estimate.supplier.email)}</div>
        <div class="bank">입금계좌: ${escapeHtml(estimate.bankInfo)}</div>
      </footer>
    </main></body></html>`;
  };

  const handlePrint = () => {
    const printWindow = window.open("", "_blank", "width=1100,height=850");
    if (!printWindow) {
      setError("인쇄 창이 차단되었습니다. 브라우저의 팝업 허용 후 다시 시도해 주세요.");
      return;
    }

    printWindow.document.write(buildPrintHtml());
    printWindow.document.close();

    const pdfButton = printWindow.document.getElementById("pdf-save-button") as HTMLButtonElement | null;
    const pdfGuide = printWindow.document.getElementById("pdf-guide");
    const pageElement = printWindow.document.querySelector(".page") as HTMLElement | null;

    pdfButton?.addEventListener("click", async () => {
      if (!pageElement) return;
      const originalLabel = pdfButton.textContent || "PDF 저장";
      pdfButton.disabled = true;
      pdfButton.textContent = "PDF 생성 중...";
      if (pdfGuide) pdfGuide.textContent = "견적서 PDF 파일을 생성하고 있습니다.";

      try {
        await exportEstimatePdf(pageElement, estimate.estimateNo);
        if (pdfGuide) pdfGuide.textContent = "PDF 파일 저장이 완료되었습니다.";
      } catch (pdfError) {
        console.error("PDF 파일 생성 실패:", pdfError);
        if (pdfGuide) pdfGuide.textContent = "PDF 생성에 실패했습니다. 다시 시도해 주세요.";
        printWindow.alert("PDF 파일 생성에 실패했습니다. 다시 시도해 주세요.");
      } finally {
        pdfButton.disabled = false;
        pdfButton.textContent = originalLabel;
      }
    });
  };

  const handlePdfDownload = async () => {
    setPdfSaving(true);
    setError("");
    setMessage("");
    const renderFrame = document.createElement("iframe");
    renderFrame.setAttribute("aria-hidden", "true");
    Object.assign(renderFrame.style, {
      position: "fixed",
      left: "-10000px",
      top: "0",
      width: "210mm",
      height: "297mm",
      border: "0",
      pointerEvents: "none",
    });
    document.body.appendChild(renderFrame);

    try {
      const frameDocument = renderFrame.contentDocument;
      if (!frameDocument) throw new Error("PDF 렌더링 문서를 만들 수 없습니다.");
      frameDocument.open();
      frameDocument.write(buildPrintHtml());
      frameDocument.close();
      await frameDocument.fonts?.ready;
      await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));

      const pageElement = frameDocument.querySelector(".page") as HTMLElement | null;
      if (!pageElement) throw new Error("견적서 출력 영역을 찾을 수 없습니다.");
      await exportEstimatePdf(pageElement, estimate.estimateNo);
      setMessage("PDF 파일 저장이 완료되었습니다.");
    } catch (pdfError) {
      console.error("PDF 파일 생성 실패:", pdfError);
      setError("PDF 파일 생성에 실패했습니다. 잠시 후 다시 시도해 주세요.");
    } finally {
      renderFrame.remove();
      setPdfSaving(false);
    }
  };

  const partyFields: Array<{ key: keyof EstimateParty; label: string }> = [
    { key: "corpName", label: "상호/회사명" },
    { key: "businessNumber", label: "사업자등록번호" },
    { key: "representative", label: "대표자/담당자" },
    { key: "address", label: "주소" },
    { key: "businessType", label: "업태" },
    { key: "businessClass", label: "종목" },
    { key: "contact", label: "연락처" },
    { key: "email", label: "이메일" },
  ];

  const partyEditor = (type: "supplier" | "recipient", title: string) => (
    <Paper variant="outlined" sx={{ flex: 1, minWidth: 0, overflow: "hidden", borderRadius: 2 }}>
      <Box sx={{ px: 2, py: 1.1, bgcolor: type === "supplier" ? "#455a64" : "#1565c0", color: "white" }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
          {title}
        </Typography>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.2, p: 2 }}>
        {partyFields.map((field) => (
          <TextField
            key={field.key}
            size="small"
            label={field.label}
            value={estimate[type][field.key]}
            onChange={(event) => updateParty(type, field.key, event.target.value)}
            sx={field.key === "address" ? { gridColumn: { sm: "1 / -1" } } : undefined}
            InputProps={{ sx: { bgcolor: "white" } }}
          />
        ))}
      </Box>
    </Paper>
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      fullScreen={isCompact}
      PaperProps={{ sx: { bgcolor: "#f5f7fa", maxHeight: isCompact ? "100%" : "calc(100% - 32px)" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          position: "sticky",
          top: 0,
          zIndex: 3,
          bgcolor: "white",
          borderBottom: "1px solid",
          borderColor: "divider",
          py: 1.5,
        }}
      >
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 900 }}>견적서 작성 및 출력</Typography>
          <Typography variant="caption" color="text.secondary">회사·고객 정보와 금액을 확인한 뒤 저장, 인쇄 또는 PDF로 내려받으세요.</Typography>
        </Box>
        <Box sx={{ textAlign: "right", ml: 2 }}>
          <Typography variant="caption" color="text.secondary">최종 견적금액</Typography>
          <Typography sx={{ color: "primary.main", fontSize: { xs: "1.15rem", sm: "1.45rem" }, fontWeight: 900, whiteSpace: "nowrap" }}>
            {money(grandTotal)}원
          </Typography>
        </Box>
      </DialogTitle>
      <DialogContent sx={{ p: { xs: 1.5, sm: 2.5 } }}>
        {loading ? (
          <Box sx={{ minHeight: 300, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.2, maxWidth: 1320, mx: "auto" }}>
            {message && <Alert severity="success" onClose={() => setMessage("")}>{message}</Alert>}
            {error && <Alert severity="error" onClose={() => setError("")}>{error}</Alert>}
            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "minmax(0, 1fr) minmax(0, 1fr) auto" },
                gap: 1.5,
                alignItems: "center",
                borderRadius: 2,
                borderLeft: "5px solid",
                borderLeftColor: "primary.main",
              }}
            >
              <TextField
                size="small"
                label="견적번호"
                value={estimate.estimateNo}
                onChange={(event) => setEstimate((prev) => ({ ...prev, estimateNo: event.target.value }))}
              />
              <TextField
                size="small"
                label="견적일자"
                type="date"
                InputLabelProps={{ shrink: true }}
                value={estimate.issueDate}
                onChange={(event) => setEstimate((prev) => ({ ...prev, issueDate: event.target.value }))}
              />
              <Box sx={{ textAlign: { xs: "left", sm: "right" }, minWidth: 180 }}>
                <Typography variant="caption" color="text.secondary">합계금액 (부가세 포함)</Typography>
                <Typography variant="h5" sx={{ color: "primary.main", fontWeight: 900 }}>{money(grandTotal)}원</Typography>
              </Box>
              <TextField
                size="small"
                label="견적명"
                value={estimate.estimateTitle}
                onChange={(event) => setEstimate((prev) => ({ ...prev, estimateTitle: event.target.value }))}
                sx={{ gridColumn: { sm: "1 / 3" } }}
              />
              <TextField
                size="small"
                label="유효기간"
                value={estimate.validity}
                onChange={(event) => setEstimate((prev) => ({ ...prev, validity: event.target.value }))}
              />
            </Paper>

            <Paper variant="outlined" sx={{ overflow: "hidden", borderRadius: 2, borderColor: "#90caf9" }}>
              <Box sx={{ px: 2, py: 1.1, bgcolor: "#e3f2fd", borderBottom: "1px solid", borderColor: "#90caf9" }}>
                <Typography variant="subtitle1" sx={{ color: "#0d47a1", fontWeight: 900 }}>렌탈 정보</Typography>
                <Typography variant="caption" color="text.secondary">스케줄에서 자동 입력되며 견적서에서 자유롭게 수정할 수 있습니다.</Typography>
              </Box>
              <Box sx={{ p: 2, display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", lg: "repeat(4, minmax(0, 1fr))" }, gap: 1.2 }}>
                <TextField
                  size="small"
                  label="렌탈 날짜"
                  value={estimate.rentalDetails.rentalDate}
                  onChange={(event) => setEstimate((prev) => ({ ...prev, rentalDetails: { ...prev.rentalDetails, rentalDate: event.target.value } }))}
                />
                <TextField
                  size="small"
                  label="렌탈 시간"
                  value={estimate.rentalDetails.rentalTime}
                  onChange={(event) => setEstimate((prev) => ({ ...prev, rentalDetails: { ...prev.rentalDetails, rentalTime: event.target.value } }))}
                />
                <TextField
                  size="small"
                  label="렌탈 공간"
                  value={estimate.rentalDetails.rentalSpace}
                  onChange={(event) => setEstimate((prev) => ({ ...prev, rentalDetails: { ...prev.rentalDetails, rentalSpace: event.target.value } }))}
                />
                <TextField
                  size="small"
                  label="사용 인원"
                  value={estimate.rentalDetails.personnel}
                  onChange={(event) => setEstimate((prev) => ({ ...prev, rentalDetails: { ...prev.rentalDetails, personnel: event.target.value } }))}
                />
              </Box>
            </Paper>

            <Box>
              {partyEditor("recipient", "공급받는 자")}
            </Box>

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Typography variant="h6" sx={{ fontWeight: 900 }}>견적 품목</Typography>
              <Button startIcon={<AddIcon />} variant="outlined" onClick={addItem}>품목 추가</Button>
            </Box>

            <TableContainer component={Paper} variant="outlined" sx={{ display: { xs: "none", lg: "block" }, borderRadius: 2 }}>
              <Table size="small" sx={{ minWidth: 980 }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: "grey.100" }}>
                    <TableCell sx={{ width: 45 }}>No.</TableCell>
                    <TableCell sx={{ width: 180 }}>품목</TableCell>
                    <TableCell>추가 내용</TableCell>
                    <TableCell sx={{ width: 90 }}>수량</TableCell>
                    <TableCell sx={{ width: 145 }}>단가</TableCell>
                    <TableCell sx={{ width: 145 }} align="right">공급가액</TableCell>
                    <TableCell sx={{ width: 120 }}>비고</TableCell>
                    <TableCell sx={{ width: 45 }} />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {estimate.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell><TextField size="small" fullWidth value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)} /></TableCell>
                      <TableCell><TextField size="small" fullWidth value={item.spec} onChange={(e) => updateItem(item.id, "spec", e.target.value)} /></TableCell>
                      <TableCell><TextField size="small" type="number" inputProps={{ min: 0, step: 1 }} value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))} /></TableCell>
                      <TableCell><TextField size="small" inputProps={{ inputMode: "numeric" }} value={money(item.unitPrice)} onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value.replace(/,/g, "")) || 0)} /></TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>{money(item.quantity * item.unitPrice)}원</TableCell>
                      <TableCell><TextField size="small" fullWidth value={item.note} onChange={(e) => updateItem(item.id, "note", e.target.value)} /></TableCell>
                      <TableCell>
                        <IconButton aria-label={`${index + 1}번 품목 삭제`} size="small" color="error" onClick={() => deleteItem(item.id)} disabled={estimate.items.length === 1}>
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ display: { xs: "flex", lg: "none" }, flexDirection: "column", gap: 1.5 }}>
              {estimate.items.map((item, index) => (
                <Paper key={item.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2, borderLeft: "4px solid", borderLeftColor: "primary.main" }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.25 }}>
                    <Typography sx={{ color: "primary.main", fontWeight: 900 }}>품목 {index + 1}</Typography>
                    <IconButton aria-label={`${index + 1}번 품목 삭제`} size="small" color="error" onClick={() => deleteItem(item.id)} disabled={estimate.items.length === 1}>
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </Box>
                  <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 1.2 }}>
                    <TextField size="small" label="품목명" fullWidth value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)} />
                    <TextField size="small" label="비고" fullWidth value={item.note} onChange={(e) => updateItem(item.id, "note", e.target.value)} />
                    <TextField size="small" label="추가 내용" fullWidth multiline minRows={2} value={item.spec} onChange={(e) => updateItem(item.id, "spec", e.target.value)} sx={{ gridColumn: { sm: "1 / -1" } }} />
                    <TextField size="small" label="수량" type="number" inputProps={{ min: 0, step: 1 }} value={item.quantity} onChange={(e) => updateItem(item.id, "quantity", Number(e.target.value))} />
                    <TextField size="small" label="단가 (원)" inputProps={{ inputMode: "numeric" }} value={money(item.unitPrice)} onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value.replace(/,/g, "")) || 0)} />
                  </Box>
                  <Box sx={{ mt: 1.5, pt: 1.25, borderTop: "1px dashed", borderColor: "divider", display: "flex", justifyContent: "space-between" }}>
                    <Typography color="text.secondary" sx={{ fontWeight: 700 }}>공급가액</Typography>
                    <Typography sx={{ fontWeight: 900 }}>{money(item.quantity * item.unitPrice)}원</Typography>
                  </Box>
                </Paper>
              ))}
            </Box>

            <Paper
              variant="outlined"
              sx={{
                p: 2,
                display: "flex",
                justifyContent: "flex-end",
                bgcolor: "#fffdf5",
                borderRadius: 2,
                borderColor: "#f0c36d",
              }}
            >
              <Box sx={{ width: { xs: "100%", sm: 390 } }}>
                <FormControlLabel
                  control={<Checkbox checked={estimate.taxable} onChange={(event) => setEstimate((prev) => ({ ...prev, taxable: event.target.checked }))} />}
                  label="부가세 10% 적용"
                />
                <Box sx={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 0.7 }}>
                  <Typography color="text.secondary">공급가액</Typography><Typography sx={{ fontWeight: 800 }}>{money(supplyTotal)}원</Typography>
                  <Typography color="text.secondary">부가세</Typography><Typography sx={{ fontWeight: 800 }}>{money(taxTotal)}원</Typography>
                  <Typography sx={{ pt: 1, mt: 0.5, borderTop: "2px solid", borderColor: "#e0a52b", fontWeight: 900 }}>최종 합계</Typography>
                  <Typography sx={{ pt: 1, mt: 0.5, borderTop: "2px solid", borderColor: "#e0a52b", color: "primary.main", fontSize: "1.35rem", fontWeight: 900 }}>{money(grandTotal)}원</Typography>
                </Box>
              </Box>
            </Paper>

            <Paper variant="outlined" sx={{ p: 2, display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 1.5, borderRadius: 2 }}>
              <TextField label="입금계좌" size="small" value={estimate.bankInfo} onChange={(event) => setEstimate((prev) => ({ ...prev, bankInfo: event.target.value }))} />
              <TextField label="견적서 안내문" size="small" multiline minRows={2} value={estimate.note} onChange={(event) => setEstimate((prev) => ({ ...prev, note: event.target.value }))} />
            </Paper>
          </Box>
        )}
      </DialogContent>
      <DialogActions sx={{ px: { xs: 1.5, sm: 3 }, py: 1.5, position: "sticky", bottom: 0, zIndex: 3, bgcolor: "white", borderTop: "1px solid", borderColor: "divider", gap: 0.5 }}>
        <Button onClick={onClose} color="inherit">닫기</Button>
        <Button startIcon={<SaveIcon />} variant="outlined" onClick={handleSave} disabled={loading || saving}>
          {saving ? "저장 중..." : "견적서 저장"}
        </Button>
        <Button startIcon={<PrintIcon />} variant="outlined" onClick={handlePrint} disabled={loading || pdfSaving}>
          인쇄 미리보기
        </Button>
        <Button variant="contained" onClick={handlePdfDownload} disabled={loading || pdfSaving}>
          {pdfSaving ? "PDF 생성 중..." : "PDF 바로 저장"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EstimateDocumentModal;
