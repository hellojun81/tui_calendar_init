// import React, { useEffect, useRef, useState } from "react";
// import {
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
//   Button,
//   Box,
//   Stack,
//   TextField,
//   FormControlLabel,
//   Checkbox,
//   CircularProgress,
//   Typography,
// } from "@mui/material";
// import jspreadsheet from "jspreadsheet-ce";
// import "jspreadsheet-ce/dist/jspreadsheet.css";

// // ★ 경로 정리: common/에서 utils/로 한 단계 올라감
// import type { BankRow } from "../utils/bankApi";
// import { fetchBankTransactions } from "../utils/bankApi";

// const API_URL =
//   process.env.NODE_ENV === "production"
//     ? process.env.REACT_APP_API_URL_PRODUCTION
//     : process.env.REACT_APP_API_URL_LOCAL;

// // 구분 드롭다운 옵션
// const PAY_TYPES = ["계약금", "잔금", "추가금"] as const;
// type PayType = (typeof PAY_TYPES)[number];

// interface Props {
//   open: boolean;
//   onClose: () => void;
//   customerName?: string;
//   baseUrl?: string; // ex) 'http://localhost:8001'
//   listPath?: string; // ex) '/api/bank'
// }

// export default function DepositJspreadModal({
//   open,
//   onClose,
//   customerName,
//   baseUrl = API_URL,
//   listPath = "/api/bank",
// }: Props) {
//   const gridRef = useRef<HTMLDivElement | null>(null);
//   const jRef = useRef<jspreadsheet.JSpreadsheet | null>(null);

//   const [loading, setLoading] = useState(false);
//   const [saving, setSaving] = useState(false); // ⬅ 저장 상태
//   const [error, setError] = useState<string | null>(null);
//   const [rows, setRows] = useState<BankRow[]>([]);

//   // 필터
//   const [start, setStart] = useState(""); // YYYY-MM-DD
//   const [end, setEnd] = useState("");
//   const [keyword, setKeyword] = useState("");
//   const [onlyDeposit, setOnlyDeposit] = useState(true);

//   useEffect(() => {
//     const today = new Date();
//     const twoWeeksAgo = new Date();
//     twoWeeksAgo.setDate(today.getDate() - 14);
//     const format = (d: Date) => d.toISOString().slice(0, 10);
//     setStart(format(twoWeeksAgo));
//     setEnd(format(today));
//     setKeyword(customerName ?? "");
//   }, [customerName]);

//   // 데이터 조회
//   const load = async () => {
//     setLoading(true);
//     setError(null);
//     setKeyword(customerName ?? "");
//     const searchKeyword = customerName ?? keyword; // prop이 있으면 prop 사용, 없으면 현재 keyword 상태 사용

//     console.log({
//       useEffect: customerName,
//       keyword: keyword,
//       searchKeyword: searchKeyword,
//     });
//     try {
//       const data = await fetchBankTransactions({
//         start,
//         end,
//         keyword: searchKeyword,
//         onlyDeposit,
//         baseUrl,
//         path: listPath,
//       });
//       // console.log({ useEffect: customerName, keyword: keyword });
//       setRows(data);
//     } catch (e: any) {
//       console.error(e);
//       setError(e.message || "load failed");
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (open) load();
//   }, [open]);

//   // jSpreadsheet 초기화/갱신
//   useEffect(() => {
//     if (!open || !gridRef.current) return;

//     const toYmdHm = (v: string | Date) => {
//       const d = typeof v === "string" ? new Date(v) : v;
//       const pad = (n: number) => String(n).padStart(2, "0");
//       const yyyy = d.getFullYear();
//       const MM = pad(d.getMonth() + 1);
//       const dd = pad(d.getDate());
//       return `${yyyy}-${MM}-${dd}`;
//     };

//     // 서버에서 태그 필드명이 무엇이든 최대한 흡수
//     const getPayType = (r: any): string =>
//       r.pay_type ?? r.payment_type ?? r.tag ?? "";

//     const data = rows.map((d) => [
//       toYmdHm(d.tx_datetime), // 0: 일시(문자열)
//       getPayType(d), // 1: 구분(계약금/잔금/추가금/빈 값)
//       d.summary ?? "", // 2: 적요(참고)
//       d.deposit_amount ?? 0, // 3: 입금액
//       d.memo ?? "", // 4: 메모
//       d.bank_name ?? "", // 5: 은행
//       d.balance ?? 0, // 6: 잔액
//       d.account_no ?? "", // 7: 계좌(참고)
//     ]);

//     if (jRef.current) {
//       jRef.current.setData(data as any);
//       return;
//     }

//     jRef.current = jspreadsheet(gridRef.current, {
//       data,
//       columns: [
//         {
//           type: "calendar",
//           title: "일시",
//           width: 150,
//           readOnly: true,
//           options: { format: "YYYY-MM-DD" },
//         },
//         {
//           // ✅ 새로 추가된 "구분" 드롭다운
//           type: "dropdown",
//           title: "구분",
//           width: 90,
//           source: PAY_TYPES as unknown as string[],
//           autocomplete: true,
//           readOnly: false,
//         },
//         { type: "text", title: "적요(참고)", width: 200, readOnly: true },
//         {
//           type: "numeric",
//           title: "입금액",
//           width: 110,
//           readOnly: true,
//           mask: "#,##0",
//         },
//         { type: "text", title: "메모", width: 260, readOnly: true },
//         { type: "text", title: "은행", width: 90, readOnly: true },
//         {
//           type: "numeric",
//           title: "잔액",
//           width: 110,
//           readOnly: true,
//           mask: "#,##0",
//         },
//         { type: "text", title: "계좌(참고)", width: 160, readOnly: true },
//       ],
//       freezeColumns: 1,
//       allowInsertRow: false,
//       allowInsertColumn: false,
//       allowDeleteRow: false,
//       allowDeleteColumn: false,
//       tableOverflow: true,
//       tableHeight: "420px",
//       csvFileName: "deposit-list",
//       // 보기 좋게 색상 강조
//       updateTable: (
//         instance: any,
//         cell: HTMLTableCellElement,
//         col: number,
//         row: number,
//         value: any, // 원시 값 (string, number 등)
//         displayedValue: string, // 셀에 표시된 값
//         cellName: string
//       ) => {
//         if (col === 1) {
//           cell.style.fontWeight = "600";
//           // ⬇️ 표시된 값인 displayedValue를 사용
//           if (displayedValue === "계약금") cell.style.background = "#e3f2fd";
//           else if (displayedValue === "잔금") cell.style.background = "#e8f5e9";
//           else if (displayedValue === "추가금")
//             cell.style.background = "#fff3e0";
//           else cell.style.background = "";
//         }
//       },
//     }) as unknown as jspreadsheet.JSpreadsheet;

//     return () => {
//       if (jRef.current && !open) {
//         try {
//           (jRef.current as any).destroy?.();
//         } catch {}
//         jRef.current = null;
//       }
//     };
//   }, [open, rows]);

//   // ✅ 구분 저장: 테이블 값을 읽어 서버로 전송
//   const savePayTypes = async () => {
//     if (!jRef.current) return;
//     try {
//       setSaving(true);
//       // 테이블 현재값 읽기
//       const table: (string | number)[][] = (jRef.current as any).getData();
//       // 서버에 보낼 payload 구성
//       const items = table.map((row, idx) => {
//         const pay_type = (row[1] as string) || null; // 구분 컬럼
//         const r = rows[idx];
//         return {
//           // ⬇️ 서버에서 식별 가능한 키로 구성 (필요 시 ID 사용)
//           tx_datetime: r.tx_datetime, // 원본값 사용 (문자열/Date 허용)
//           account_no: r.account_no ?? "",
//           deposit_amount: r.deposit_amount ?? 0,
//           pay_type, // "계약금" | "잔금" | "추가금" | null
//           // 필요시 고객명 등 추가
//           customer_name: r.customer_name ?? null,
//         };
//       });

//       // /api/bank/tags 로 전송 (listPath 뒤에 /tags 붙이기)
//       const savePath = `${baseUrl}${(listPath || "/api/bank").replace(
//         /\/$/,
//         ""
//       )}/tags`;

//       const res = await fetch(savePath, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ items }),
//       });
//       if (!res.ok) throw new Error("구분 저장 실패");
//       // 저장 후 재조회(선택)
//       // await load();
//       alert("구분 저장 완료");
//     } catch (e: any) {
//       console.error(e);
//       alert(e.message || "구분 저장 실패");
//     } finally {
//       setSaving(false);
//     }
//   };

//   return (
//     <Dialog open={open} onClose={onClose} maxWidth="md">
//       <DialogTitle>
//         입금내역 {customerName ? `- ${customerName}` : ""}
//       </DialogTitle>

//       <DialogContent dividers>
//         {/* 필터 영역 */}
//         <Stack
//           direction={{ xs: "column", sm: "row" }}
//           spacing={2}
//           sx={{ mb: 2, alignItems: "center", flexWrap: "wrap" }}
//         >
//           <TextField
//             label="시작일"
//             type="date"
//             size="small"
//             InputLabelProps={{ shrink: true }}
//             value={start}
//             onChange={(e) => setStart(e.target.value)}
//             sx={{ minWidth: 160 }}
//             InputProps={{
//               sx: {
//                 font: "initial",
//                 fontFamily: "'Roboto','Noto Sans KR',sans-serif",
//                 fontSize: 14,
//               },
//             }}
//           />
//           <TextField
//             label="종료일"
//             type="date"
//             size="small"
//             InputLabelProps={{ shrink: true }}
//             value={end}
//             onChange={(e) => setEnd(e.target.value)}
//             sx={{ minWidth: 160 }}
//             InputProps={{
//               sx: {
//                 font: "initial",
//                 fontFamily: "'Roboto','Noto Sans KR',sans-serif",
//                 fontSize: 14,
//               },
//             }}
//           />
//           <TextField
//             label="검색어"
//             size="small"
//             placeholder="메모/적요/은행/계좌"
//             value={keyword}
//             onChange={(e) => setKeyword(e.target.value)}
//             InputProps={{
//               sx: {
//                 font: "initial",
//                 fontFamily: "'Roboto','Noto Sans KR',sans-serif",
//                 fontSize: 14,
//               },
//             }}
//             sx={{ flex: 1, minWidth: 240 }}
//           />
//           <FormControlLabel
//             control={
//               <Checkbox
//                 checked={onlyDeposit}
//                 onChange={(e) => setOnlyDeposit(e.target.checked)}
//               />
//             }
//             label="입금만"
//             sx={{ whiteSpace: "nowrap" }}
//           />
//           <Button variant="outlined" onClick={load} disabled={loading}>
//             조회
//           </Button>
//         </Stack>

//         {/* ✅ 그리드 컨테이너는 항상 DOM에 남겨둠 */}
//         <Box sx={{ position: "relative" }}>
//           {loading && (
//             <Box
//               sx={{
//                 position: "absolute",
//                 inset: 0,
//                 display: "flex",
//                 alignItems: "center",
//                 justifyContent: "center",
//                 bgcolor: "rgba(255,255,255,0.6)",
//                 zIndex: 1,
//               }}
//             >
//               <CircularProgress />
//             </Box>
//           )}
//           {error && (
//             <Typography color="error" sx={{ mb: 1 }}>
//               {error}
//             </Typography>
//           )}

//           <Box
//             ref={gridRef}
//             sx={{
//               // 이 모달 안의 jexcel에서는 2번째 컬럼을 강제로 보이게
//               "& .jexcel thead td:nth-of-type(2), & .jexcel tbody td:nth-of-type(2)":
//                 { display: "table-cell !important" },
//             }}
//           />
//         </Box>
//       </DialogContent>

//       <DialogActions>
//         <Button onClick={onClose}>닫기</Button>
//         <Button
//           onClick={savePayTypes}
//           variant="contained"
//           disabled={saving || loading}
//         >
//           구분 저장
//         </Button>
//       </DialogActions>
//     </Dialog>
//   );
// }
