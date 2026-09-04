import "./jss-setup"; // ✅ 반드시 가장 먼저
import React, { useCallback, useState, useRef, useEffect } from "react";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import "jsuites/dist/jsuites.css";
import "./common/Jexcel.css";

import dayjs from "dayjs";
import axios from "axios";
import { Box, Button } from "@mui/material";
import CrudButtons from "./common/CrudButtons";
import SearchFields from "./provider/SearchFields"; // 검색 컴포넌트 재사용

interface ITransaction {
  tid: string;
  trserial: number;
  accountID: string;
  trdate: string; // YYYYMMDD
  trdt: string; // YYYYMMDDHHmmss
  balance: string;
  accIn: string;
  accOut: string;
  combined_remark: string;
  remark2: string;
  remark3: string;
  remark4: string;
  pay_type?: string; // DB 커스텀 필드
  memo?: string; // DB 커스텀 필드
}

interface BankProps {
  embedded?: boolean;
  defaultCustomerName?: string;
  autoSearch?: boolean;
}

// 유틸리티 함수 및 API URL 설정 (기존 코드를 따름)
const getCurrentDate = () => {
  const today = dayjs();
  return {
    startDate: today.subtract(1, "year").format("YYYY-MM-DD"),
    endDate: today.format("YYYY-MM-DD"),
  };
};

const apiUrl = process.env.NODE_ENV === "production" ? process.env.REACT_APP_API_URL_PRODUCTION : process.env.REACT_APP_API_URL_LOCAL;
interface BankAccountOption {
  label: string;
  value: string;
  accountIDs: string[];
}

interface TransactionSummary {
  count: number;
  totalIn: number;
  totalOut: number;
}

interface BankCollectionResult {
  updatedCount?: number;
  accounts?: Array<{
    ok: boolean;
    accountName: string;
    accountNumber: string;
    message?: string;
  }>;
  message?: string;
}

const BankTransactions: React.FC<BankProps> = ({ embedded = false, defaultCustomerName = "", autoSearch = false }) => {
  // -------------------------
  // 1. 상태 및 Refs 정의
  // -------------------------
  const tableRef = useRef<HTMLDivElement>(null);
  const jexcelInstance = useRef<any>(null);

  const [activeRow, SetactiveRow] = useState<number>(0);
  const [tableData, setTableData] = useState<string[][]>([]);
  const [transactionSummary, setTransactionSummary] = useState<TransactionSummary | null>(null);

  const [description, setDescription] = useState("");
  const [accountOptions, setAccountOptions] = useState<BankAccountOption[]>([]);
  const getAccountLabel = useCallback(
    (accountID: string) => {
      return accountOptions.find((option) => option.accountIDs.includes(accountID))?.label || accountID;
    },
    [accountOptions]
  );
  const { startDate, endDate } = getCurrentDate();
  const [formData, setFormData] = useState({
    startDate: startDate, // YYYYMMDD
    endDate: endDate, // YYYYMMDD
    description: "", // 계좌번호 검색 필터 (고객명 대신 사용)
    filterOption: "거래일",
    tradeType: 1, // 기본값: 입금(I), 0: 전체, 2: 출금(O)
    accountID: "",
    // customerName: "",
  });
  const [updateFormData, setUpdateFormData] = React.useState<{
    tid: string | null;
    trserial: string | null;
    pay_type: string;
    memo: string;
  }>({
    tid: null,
    trserial: null,
    pay_type: "",
    memo: "",
  });

  useEffect(() => {
    if (defaultCustomerName) {
      setDescription(defaultCustomerName);
      setFormData((prev) => ({ ...prev, description: defaultCustomerName }));
    }
  }, [defaultCustomerName]);

  const loadAccountOptions = useCallback(async () => {
    try {
      const { data } = await axios.get<BankAccountOption[]>(`${apiUrl}/api/popbill/bank/account-options`);
      setAccountOptions(data);
    } catch (error) {
      console.error("계좌 목록 조회 중 오류 발생:", error);
    }
  }, []);

  useEffect(() => {
    loadAccountOptions();
  }, [loadAccountOptions]);

  // 자동검색: 초기 세팅 끝난 뒤 단 1회
  const autoSearchedRef = useRef(false);
  useEffect(() => {
    const ready = !!formData.description && (defaultCustomerName ? formData.description === defaultCustomerName : true);

    if (autoSearch && ready && !autoSearchedRef.current) {
      autoSearchedRef.current = true;
      handleSearch();
    }
  }, [autoSearch, defaultCustomerName, formData.description]);

  const handleSingleUpdate = useCallback(
    async (tid: string, trserial: string, pay_type: string, memo: string) => {
      try {
        const res = await axios.put(`${apiUrl}/api/popbill/bank/${tid}/${trserial}`, {
          pay_type,
          memo,
        });
        // console.log(`Auto-Save Success: TID=${tid}, TRSerial=${trserial}, Result=${res.data.message}`);
        // 자동 저장 성공 시 사용자에게 별도의 alert를 표시하지 않고 콘솔에만 기록합니다.
      } catch (error) {
        console.error("Auto-Save failed:", error);
        // 자동 저장 실패 시에도 alert를 표시하지 않고 콘솔에 기록합니다.
      }
    },
    [apiUrl]
  );

  useEffect(() => {
    if (tableRef.current) {
      if (!jexcelInstance.current) {
        jexcelInstance.current = jspreadsheet(tableRef.current, {
          data: tableData.length ? tableData : [[" "]],
          columns: [
            { type: "numeric", title: "순번", width: 40 },
            { type: "text", title: "계좌", width: 80, readOnly: true },
            { type: "date", title: "거래일시", width: 120 },
            { type: "numeric", title: "입금액", width: 100 },
            { type: "numeric", title: "출금액", width: 100 },
            {
              type: "dropdown",
              title: "분류",
              width: 120,
              source: ["계약금", "중도금", "잔금", "추가금액", "보증금", "기타"],

              // jSuites dropdown 옵션 전달
              options: { closeButton: false } as any,
            },
            { type: "numeric", title: "잔액", width: 120 },
            { type: "text", title: "적요", width: 120 },
            { type: "text", title: "메모", width: 180 }, // memo
            { type: "hidden", title: "TID", width: 1 },
            { type: "hidden", title: "TRSerial", width: 1 },
          ],
        });
        const memoColumnIndex = 8;
        console.log(jexcelInstance.current);
      } else {
        // 데이터는 tableData가 변경될 때마다 업데이트합니다.
        jexcelInstance.current.setData(tableData);
        jexcelInstance.current.options.onchange = (instance: any, cell: any, x1: number, y1: number, x2: number, y2: number) => {
          const columnIndex = x1;
          const rowIndex = y1;

          // '분류' (index 5) 또는 '메모' (index 8)의 변경만 처리
          if (Number(columnIndex) === 5 || Number(columnIndex) === 8) {
            if (tableData[y1]) {
              const rowData = tableData[y1];
              const tid = rowData[9]; // TID (index 9)
              const trserial = rowData[10]; // TRSerial (index 10)
              const memo = rowData[8];
              const pay_type = rowData[5];
              console.log(`pay_type:${pay_type},memo:${memo}`);
              handleSingleUpdate(tid, trserial, pay_type, memo);
            }
          }
        };

      }
    } else {
      console.error("tableRef.current가 null입니다.");
    }
  }, [tableData]);
  const handleFetchTransactions = async () => {
    console.log("handleFetchTransactions");

    // 🚨 2. 비동기 오류 처리를 위해 try...catch 블록 추가
    try {
      const apiStartDate = dayjs(formData.startDate).format("YYYYMMDD");
      const apiEndDate = dayjs(formData.endDate).format("YYYYMMDD");

      // 1. URLSearchParams는 값 자체를 문자열로 변환하므로 현재 코드는 유지
      const queryParams = new URLSearchParams({
        startDate: apiStartDate,
        endDate: apiEndDate,
        tradeType: formData.tradeType.toString(),
        ...(formData.description && {
          description: formData.description,
        }),
        ...(formData.accountID && {
          accountID: formData.accountID,
        }),
      });

      // API 엔드포인트 수정: 은행 거래 내역 조회
      const res = await axios.get(`${apiUrl}/api/popbill/bank/get_DB_BankTransactions?${queryParams.toString()}`);
      const transactions: ITransaction[] = res.data.list || res.data;

      const summary = transactions.reduce<TransactionSummary>(
        (totals, transaction) => ({
          count: totals.count + 1,
          totalIn: totals.totalIn + (Number(String(transaction.accIn || 0).replace(/,/g, "")) || 0),
          totalOut: totals.totalOut + (Number(String(transaction.accOut || 0).replace(/,/g, "")) || 0),
        }),
        { count: 0, totalIn: 0, totalOut: 0 }
      );
      setTransactionSummary(summary);

      if (transactions.length === 0) {
        setTableData([["조회된 거래 내역이 없습니다."]]);
        return;
      }
      console.log(transactions);
      // JSpreadsheet 형식 (2차원 배열)으로 데이터 변환
      setTableData(
        transactions.map((t: ITransaction, index: number) => [
          (index + 1).toString(), // 순번
          t.accountID ? getAccountLabel(t.accountID) : "-", // 계좌 식별자
          dayjs(t.trdt).format("YYYY-MM-DD"), // 거래일시 포맷
          formatCurrencyWithoutDecimals(t.accIn), // 입금액
          formatCurrencyWithoutDecimals(t.accOut), // 출금액
          t.pay_type || "", // 분류 (커스텀)
          formatCurrencyWithoutDecimals(t.balance), // 잔액
          t.combined_remark, // 적요 (remark1 사용)
          t.memo || "", // 고객명 (커스텀)
          t.tid, // TID (숨김)
          t.trserial.toString(), // TRSerial (숨김)
        ])
      );
    } catch (error) {
      // 🚨 오류 발생 시 사용자에게 피드백 제공 및 테이블 초기화
      console.error("거래 내역 조회 중 오류 발생:", error);
      setTransactionSummary(null);
      setTableData([[`조회 오류: 알수없는 오류발생`]]);
    }
  };

  // -------------------------
  // 3. 실시간 내역 조회 (handleCollectLatest)
  // -------------------------
  const handleCollectLatest = async () => {
    try {
      // API 엔드포인트 수정: 은행 거래 내역 조회
      console.log("handleCollectLatest", apiUrl);
      const res = await axios.get(`${apiUrl}/api/popbill/bank/latestTransactions`);
      console.log("handleCollectLatest", res);
      const resultData = res.data as BankCollectionResult;

      if (resultData?.accounts) {
        const resultLines = resultData.accounts.map((account) =>
          account.ok
            ? `${account.accountName}(${account.accountNumber}): 수집 완료`
            : `${account.accountName}(${account.accountNumber}): ${account.message || "수집 실패"}`
        );
        alert(`최신 정보 수집 결과 (${resultData.updatedCount || 0}건 업데이트)\n${resultLines.join("\n")}`);
        await loadAccountOptions();
        handleSearch();
      } else {
        alert("최신 정보 수집 요청은 성공했으나, 결과 정보가 없습니다.");
      }
    } catch (error) {
      console.error("최신 정보 수집 중 오류 발생:", error);
      const resultData = axios.isAxiosError<BankCollectionResult>(error) ? error.response?.data : undefined;

      if (resultData?.accounts?.length) {
        const resultLines = resultData.accounts.map(
          (account) => `${account.accountName}(${account.accountNumber}): ${account.message || "수집 실패"}`
        );
        const needsSubscriptionRenewal = resultData.accounts.some((account) => account.message?.includes("정액제"));
        alert(
          `최신 정보 수집 실패\n${resultLines.join("\n")}${
            needsSubscriptionRenewal ? "\n\n팝빌 계좌 정액제를 갱신한 후 다시 시도해 주세요." : ""
          }`
        );
        return;
      }

      alert(resultData?.message || "최신 정보 수집 중 오류가 발생하였습니다.");
    }
  };

  const handleSearch = useCallback(() => {
    handleFetchTransactions();
  }, [formData, accountOptions]); // 검색조건이나 계좌 목록이 변경되면 최신 값 사용

  // -------------------------
  // 4. 이벤트 핸들러
  // -------------------------
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleTradeTypeChange = (value: number | string) => {
    const num = typeof value === "string" ? parseInt(value, 10) : value;
    setFormData((prev) => ({
      ...prev,
      tradeType: Number.isNaN(num) ? 0 : num,
    }));
  };
  
  const handleUpdateMemoAndType = async () => {
    const { tid, trserial, pay_type, memo } = updateFormData;
    console.log({
      trserial: trserial,
      tid: tid,
      pay_type: pay_type,
      memo: memo,
    });
    if (!tid || !trserial) {
      alert("거래를 선택하거나 유효한 TID/TRSerial 키가 없습니다.");
      return;
    }

    try {
      const res = await axios.put(`${apiUrl}/api/popbill/${tid}/${trserial}`, {
        pay_type,
        memo,
      });

      alert(`업데이트 성공: ${res.data.message}`);

      // 업데이트 후 테이블 데이터 새로고침
      handleSearch();
    } catch (error) {
      console.error("거래 업데이트 오류:", error);
      alert("거래 분류/메모 업데이트에 실패했습니다.");
    }
  };

  // -------------------------
  // 5. 렌더링
  // -------------------------
  /**
   * 금액 문자열을 천 단위 콤마로 포맷하고 소수점 이하는 제거합니다.
   * @param {string | number} amount - '2805000.00' 또는 2805000 형태의 금액
   * @returns {string} - '2,805,000' 형태의 포맷된 문자열 (소수점 없음)
   */
  const formatCurrencyWithoutDecimals = (amount: string | number): string => {
    // 1. 입력값을 숫자로 변환합니다.
    const numericAmount = parseFloat(amount as string);

    // 숫자가 유효하지 않은 경우 '0'을 반환
    if (isNaN(numericAmount)) {
      return "0";
    }

    // 2. Math.floor()를 사용하여 소수점 이하를 버리고 정수만 남깁니다.
    const integerAmount = Math.floor(numericAmount);

    // 3. toLocaleString()을 사용하여 천 단위 콤마를 적용합니다.
    // 기본 설정은 소수점을 포함하지 않고 정수로 포맷합니다.
    return integerAmount.toLocaleString("en-US");

    // 또는 한국 로케일('ko-KR')을 사용할 수도 있습니다.
    // return integerAmount.toLocaleString('ko-KR');
  };

  return (
    <Box sx={{ width: "100%", minWidth: 0, boxSizing: "border-box" }}>
      <Box
        sx={{
          width: "auto",
          maxWidth: "1400px", // 테이블 크기에 맞게 조정
          minWidth: 0,
          margin: "0 auto",
          padding: embedded ? { xs: "10px", sm: "16px" } : "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          overflow: "hidden",
          boxSizing: "border-box",
        }}
      >
        {/* 검색 필드 */}
        <Box sx={{ marginBottom: "20px" }}>
          <SearchFields
            prarentComponent="bank" // prop 변경
            formData={formData}
            handleChange={handleChange}
            handleSearch={handleSearch}
            onTradeTypeChange={handleTradeTypeChange}
            accountOptions={accountOptions}
            onAccountChange={(accountID) => setFormData((prev) => ({ ...prev, accountID }))}
          />
        </Box>

        {/* 은행 거래 내역에서는 CRUD 버튼이 '조회' 외에는 필요 없을 수 있습니다. 
            필요하다면 '거래 분류'나 '메모 수정' 등으로 변경해야 합니다. */}
        <CrudButtons
          onAdd={handleCollectLatest}
          // onEdit={handleBulkUpdate}
          // onDelete={() => alert("거래 내역 삭제")}
          // 🚨 라벨 변경
          addLabel="수집"
          // editLabel="저장"
          // deleteLabel="거래 취소"
        />
        <Box
          sx={{
            display: "flex",
            // ⬇️ flex-start로 설정하여 좌측 정렬
            justifyContent: "flex-start",
            width: "100%",
            marginBottom: "10px",
          }}
        ></Box>
        <Box
          className="bank-table-scroll"
          sx={{
            width: "100%",
            maxWidth: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            pb: 0.5,
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div ref={tableRef} />
        </Box>

        {transactionSummary && (
          <Box
            aria-label="검색 결과 합계"
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr 1fr", md: "repeat(4, 1fr)" },
              border: "1px solid #d7dce3",
              borderTop: 0,
              backgroundColor: "#f7f9fc",
              color: "#1f2937",
            }}
          >
            {[
              { label: "검색 건수", value: `${transactionSummary.count.toLocaleString("ko-KR")}건` },
              { label: "입금 합계", value: `${formatCurrencyWithoutDecimals(transactionSummary.totalIn)}원`, color: "#1565c0" },
              { label: "출금 합계", value: `${formatCurrencyWithoutDecimals(transactionSummary.totalOut)}원`, color: "#d32f2f" },
              {
                label: "순증감액",
                value: `${formatCurrencyWithoutDecimals(transactionSummary.totalIn - transactionSummary.totalOut)}원`,
                color: transactionSummary.totalIn - transactionSummary.totalOut >= 0 ? "#1565c0" : "#d32f2f",
              },
            ].map((item) => (
              <Box
                key={item.label}
                sx={{
                  px: 2,
                  py: 1.5,
                  textAlign: "right",
                  borderRight: { md: "1px solid #d7dce3" },
                  borderBottom: { xs: "1px solid #d7dce3", md: 0 },
                }}
              >
                <Box component="span" sx={{ display: "block", mb: 0.25, color: "#667085", fontSize: 12 }}>
                  {item.label}
                </Box>
                <Box component="strong" sx={{ color: item.color || "#1f2937", fontSize: 16, fontWeight: 800 }}>
                  {item.value}
                </Box>
              </Box>
            ))}
          </Box>
        )}

        {/* 거래 분류 및 메모 수정용 모달이 필요하다면 여기에 추가 */}
        {/* <TransactionModal ... /> */}
      </Box>
    </Box>
  );
};

export default BankTransactions;
