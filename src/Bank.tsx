import React, { useCallback, useState, useRef, useEffect } from "react";
import jspreadsheet from "jspreadsheet-ce";
// import "jspreadsheet-ce/dist/jspreadsheet.css";
import dayjs from "dayjs";
import axios from "axios";
import { Box, Button } from "@mui/material";
import CrudButtons from "./common/CrudButtons";
import SearchFields from "./provider/SearchFields"; // 검색 컴포넌트 재사용
import "jsuites/dist/jsuites.css";
import "./common/Jexcel.css";

interface ITransaction {
  tid: string;
  trserial: number;
  // accountID: string;
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
    startDate: today.subtract(90, "day").format("YYYY-MM-DD"),
    endDate: today.format("YYYY-MM-DD"),
  };
};

const apiUrl = process.env.NODE_ENV === "production" ? process.env.REACT_APP_API_URL_PRODUCTION : process.env.REACT_APP_API_URL_LOCAL;

const BankTransactions: React.FC<BankProps> = ({ embedded = false, defaultCustomerName = "", autoSearch = false }) => {
  // -------------------------
  // 1. 상태 및 Refs 정의
  // -------------------------
  const tableRef = useRef<HTMLDivElement>(null);
  const jexcelInstance = useRef<any>(null);

  const [activeRow, SetactiveRow] = useState<number>(0);
  const [tableData, setTableData] = useState<string[][]>([]);

  const [description, setDescription] = useState("");
  const { startDate, endDate } = getCurrentDate();
  const [formData, setFormData] = useState({
    startDate: startDate, // YYYYMMDD
    endDate: endDate, // YYYYMMDD
    description: "", // 계좌번호 검색 필터 (고객명 대신 사용)
    filterOption: "거래일",
    tradeType: 0, // 0: 전체, 1: 입금(I), 2: 출금(O)
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

  // 자동검색: 초기 세팅 끝난 뒤 단 1회
  const autoSearchedRef = useRef(false);
  useEffect(() => {
    const ready = !!formData.description && (defaultCustomerName ? formData.description === defaultCustomerName : true);

    if (autoSearch && ready && !autoSearchedRef.current) {
      autoSearchedRef.current = true;
      handleSearch();
    }
  }, [autoSearch, defaultCustomerName, formData.description]);
  // -------------------------
  // 2. JSpreadsheet 초기화 및 설정 (useEffect)

  // -------------------------
  useEffect(() => {
    if (tableRef.current) {
      if (!jexcelInstance.current) {
        // console.log("JSpreadsheet 초기화 시작");
        jexcelInstance.current = jspreadsheet(tableRef.current, {
          data: tableData.length ? tableData : [[]],
          // 컬럼 정의 (은행 거래 내역 형식에 맞게 변경)
          columns: [
            { type: "numeric", title: "순번", width: 40 },
            { type: "text", title: "거래일시", width: 120 },
            { type: "numeric", title: "입금액", width: 100 },
            { type: "numeric", title: "출금액", width: 100 },
            { type: "numeric", title: "잔액", width: 120 },
            { type: "text", title: "적요", width: 120 },
            {
              type: "dropdown",
              title: "분류",
              width: 80,
              source: ["계약금", "잔금", "추가금액", "보증금", "기타"],

              // jSuites dropdown 옵션 전달
              options: { closeButton: false } as any, // <- Done 버튼 숨김
            },
            { type: "text", title: "메모", width: 180 }, // memo
            { type: "hidden", title: "TID", width: 1 },
            { type: "hidden", title: "TRSerial", width: 1 },
          ],
        });
        const memoColumnIndex = 7;

        // jspreadsheet API를 사용하여 너비를 설정합니다.
        // width 값은 픽셀 또는 문자 단위로 실험해 보세요.
        jexcelInstance.current.setWidth(memoColumnIndex, 200);
      } else {
        // 데이터는 tableData가 변경될 때마다 업데이트합니다.
        jexcelInstance.current.setData(tableData);

        // 🚨 선택 로직을 키(TID, TRSerial) 저장 로직으로 업데이트
        jexcelInstance.current.options.onselection = (instance: any, x1: number, y1: number, x2: number, y2: number) => {
          if (tableData[y1]) {
            const selectedRow = tableData[y1];

            SetactiveRow(y1);

            // 🚨 선택된 행의 tid, trserial, 현재 분류/메모 값을 상태에 저장
            setUpdateFormData({
              // 이 함수가 상위 컴포넌트에 정의되어 있어야 함
              tid: selectedRow[8] || null, // 인덱스 9: TID
              trserial: selectedRow[9] || null, // 인덱스 10: TRSerial
              pay_type: selectedRow[6] || "", // 인덱스 7: 분류
              memo: selectedRow[7] || "", // 인덱스 8: 메모
            });
            console.log("선택된 거래:", tableData[y1]);
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
      });

      // API 엔드포인트 수정: 은행 거래 내역 조회
      const res = await axios.get(`${apiUrl}/api/popbill/bank/get_DB_BankTransactions?${queryParams.toString()}`);
      const transactions: ITransaction[] = res.data.list || res.data;

      if (transactions.length === 0) {
        setTableData([["조회된 거래 내역이 없습니다."]]);
        return;
      }

      // JSpreadsheet 형식 (2차원 배열)으로 데이터 변환
      setTableData(
        transactions.map((t: ITransaction, index: number) => [
          (index + 1).toString(), // 순번
          dayjs(t.trdt, "YYYYMMDDHHmmss").format("MM-DD HH:mm:ss"), // 거래일시 포맷
          formatCurrencyWithoutDecimals(t.accIn), // 입금액
          formatCurrencyWithoutDecimals(t.accOut), // 출금액
          formatCurrencyWithoutDecimals(t.balance), // 잔액
          t.combined_remark, // 적요 (remark1 사용)
          // t.accountID, // 계좌 ID
          t.pay_type || "", // 분류 (커스텀)
          t.memo || "", // 고객명 (커스텀)
          t.tid, // TID (숨김)
          t.trserial.toString(), // TRSerial (숨김)
        ])
      );
    } catch (error) {
      // 🚨 오류 발생 시 사용자에게 피드백 제공 및 테이블 초기화
      console.error("거래 내역 조회 중 오류 발생:", error);
      setTableData([[`조회 오류: 알수없는 오류발생`]]);
    }
  };
  // const handleFetchTransactions = async () => {
  //   console.log("handleFetchTransactions");
  //   const apiStartDate = dayjs(formData.startDate).format("YYYYMMDD");
  //   const apiEndDate = dayjs(formData.endDate).format("YYYYMMDD");
  //   const queryParams = new URLSearchParams({
  //     startDate: apiStartDate,
  //     endDate: apiEndDate,
  //     tradeType: formData.tradeType.toString(),
  //     ...(formData.description && {
  //       description: formData.description,
  //     }),
  //   });

  //   // API 엔드포인트 수정: 은행 거래 내역 조회
  //   const res = await axios.get(`${apiUrl}/api/popbill/bank/get_DB_BankTransactions?${queryParams.toString()}`);
  //   const transactions: ITransaction[] = res.data.list || res.data; // 서버 응답 구조에 따라 조정

  //   if (transactions.length === 0) {
  //     setTableData([["조회된 거래 내역이 없습니다."]]);
  //     return;
  //   }

  //   // JSpreadsheet 형식 (2차원 배열)으로 데이터 변환
  //   setTableData(
  //     transactions.map((t: ITransaction, index: number) => [
  //       (index + 1).toString(), // 순번
  //       dayjs(t.trdt, "YYYYMMDDHHmmss").format("MM-DD HH:mm:ss"), // 거래일시 포맷
  //       formatCurrencyWithoutDecimals(t.accIn), // 입금액
  //       formatCurrencyWithoutDecimals(t.accOut), // 출금액
  //       formatCurrencyWithoutDecimals(t.balance), // 잔액
  //       t.combined_remark, // 적요 (remark1 사용)
  //       // t.accountID, // 계좌 ID
  //       t.pay_type || "", // 분류 (커스텀)
  //       t.memo || "", // 고객명 (커스텀)
  //       t.tid, // TID (숨김)
  //       t.trserial.toString(), // TRSerial (숨김)
  //     ])
  //   );
  // };
  // -------------------------
  // 3. 실시간 내역 조회 (handleCollectLatest)
  // -------------------------
  const handleCollectLatest = async () => {
    try {
      // API 엔드포인트 수정: 은행 거래 내역 조회
      const res = await axios.get(`${apiUrl}/api/popbill/bank/latestTransactions`);
      const resultData = res.data;
      const infoMessage = resultData.info;

      if (infoMessage) {
        alert(`최신 정보 수집 결과:\n${infoMessage}`);
      } else {
        alert("최신 정보 수집 요청은 성공했으나, 결과 정보가 없습니다.");
      }
    } catch (err) {
      alert("최신 정보 수집 중 오류가 발생하였습니다.");
    }
  };

  const handleSearch = useCallback(() => {
    handleFetchTransactions();
  }, [formData]); // formData가 변경될 때마다 새로운 함수 인스턴스를 생성하지 않도록 useCallback 사용

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
  // -------------------------
  // 메모,적요 수정(테이블 전체저장)
  // -------------------------
  const handleBulkUpdate = async () => {
    if (!jexcelInstance.current) {
      alert("테이블이 초기화되지 않았습니다.");
      return;
    }

    const allTableData = jexcelInstance.current.getData();
    const bulkUpdateData = allTableData.map((row: any[]) => ({
      tid: row[8], // 인덱스 9 (TID)
      trserial: row[9], // 인덱스 10 (TRSerial)
      pay_type: row[6], // 인덱스 7 (분류)
      memo: row[7], // 인덱스 8 (메모)
    }));

    if (bulkUpdateData.length === 0) {
      alert("업데이트할 데이터가 없습니다.");
      return;
    }

    try {
      // 3. 백엔드의 새로운 배치 업데이트 엔드포인트로 전송
      const res = await axios.post(`${apiUrl}/api/popbill/bank/bulkUpdate`, {
        updates: bulkUpdateData,
      });

      alert(`업데이트 성공: ${res.data.updatedCount}건 처리됨`);

      // 업데이트 후 테이블 데이터 새로고침
      handleSearch();
    } catch (error) {
      console.error("일괄 업데이트 오류:", error);
      alert("데이터 일괄 업데이트에 실패했습니다.");
    }
  };

  // -------------------------
  // 4. 메모,적요 수정(선택된 단일건만)
  // -------------------------
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
    <div>
      <Box
        sx={{
          maxWidth: "1400px", // 테이블 크기에 맞게 조정
          margin: "0 auto",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
        }}
      >
        {/* 검색 필드 */}
        <Box sx={{ display: "flex", gap: "2x", marginBottom: "20px" }}>
          <SearchFields
            prarentComponent="bank" // prop 변경
            formData={formData}
            handleChange={handleChange}
            handleSearch={handleSearch}
            // 기존 onCsKindChange를 onTradeTypeChange로 변경
            onCsKindChange={(v) => handleTradeTypeChange(typeof v === "string" ? parseInt(v, 10) : v)}
          />
        </Box>

        {/* 은행 거래 내역에서는 CRUD 버튼이 '조회' 외에는 필요 없을 수 있습니다. 
            필요하다면 '거래 분류'나 '메모 수정' 등으로 변경해야 합니다. */}
        <CrudButtons
          onAdd={handleCollectLatest}
          onEdit={handleBulkUpdate}
          // onDelete={() => alert("거래 내역 삭제")}
          // 🚨 라벨 변경
          addLabel="수집"
          editLabel="저장"
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
        <div ref={tableRef} />

        {/* 거래 분류 및 메모 수정용 모달이 필요하다면 여기에 추가 */}
        {/* <TransactionModal ... /> */}
      </Box>
    </div>
  );
};

export default BankTransactions;
