import React, { useCallback, useState, useRef, useEffect } from "react";
import jspreadsheet from "jspreadsheet-ce";
import "jspreadsheet-ce/dist/jspreadsheet.css";
import axios from "axios";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from "@mui/material";
import CustomerDialog from "../provider/CustomerDialog"; // Import the CustomerDialog component
import { Customer } from "../provider/Customer";
import dayjs from "dayjs";
import "../common/Jexcel.css";
const apiUrl = process.env.NODE_ENV === "production" ? process.env.REACT_APP_API_URL_PRODUCTION : process.env.REACT_APP_API_URL_LOCAL;

interface JexcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedCustomer: string, customerName2: string, etc: string, tel: string) => void;
  searchQuery: string;
}

const CustomerModal: React.FC<JexcelModalProps> = ({ isOpen, onClose, onSelect, searchQuery }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [tableData, setTableData] = useState<string[][]>([]);
  const tableRef = useRef<HTMLDivElement>(null);
  const jexcelInstance = useRef<any>(null);

  const [id, setId] = useState<number>(0); // ID값
  const [customerName, setCustomerName] = useState("");
  const [customerName2, setCustomerName2] = useState("");
  const [customeretc, setCustomerEtc] = useState("");
  const [customerTel, setCustomerTel] = useState("");
const getRowFromInstance = (instance: any, y: number, fallback: string[][]): string[] | undefined => {
  try {
    if (typeof instance.getRowData === "function") {
      return instance.getRowData(y);
    }
    if (typeof instance.getData === "function") {
      const all = instance.getData();
      return all && all[y];
    }
    if (instance.options && Array.isArray(instance.options.data)) {
      return instance.options.data[y];
    }
  } catch (e) {
    console.warn("getRowFromInstance error", e);
  }
  // 최후의 fallback: React state에 있는 tableData
  return fallback[y];
};
  // JSpreadsheet 초기화 또는 갱신
  const initializeSpreadsheet = () => {
  if (!tableRef.current) {
    console.error("tableRef.current가 null입니다.");
    return;
  }

  if (jexcelInstance.current) {
    try {
      jexcelInstance.current.destroy();
    } catch (e) {
      console.warn("jexcel destroy error", e);
    }
    jexcelInstance.current = null;
  }

  jexcelInstance.current = jspreadsheet(tableRef.current, {
    data: tableData.length ? tableData : [[]],
    columns: [
      { type: "numeric", title: "id", width: 1 },
      { type: "text", title: "거래처명", width: 80 },
      { type: "text", title: "담당자", width: 80 },
      { type: "text", title: "연락처", width: 80 },
      { type: "text", title: "비고", width: 100 },
    ],

    // 셀 선택 시 현재 row → state 세팅
    onselection: (instance: any, x1: number, y1: number, x2: number, y2: number) => {
      const row = getRowFromInstance(instance, y1, tableData);
      if (!row) return;

      setId(parseInt(row[0] || "0", 10));
      setCustomerName(row[1] || "");
      setCustomerName2(row[2] || "");
      setCustomerTel(row[3] || "");
      setCustomerEtc(row[4] || "");
    },

    // ★ 연락처 수정 시 DB 업데이트
    onchange: async (
      instance: any,
      cell: HTMLElement,
      x: number,
      y: number,
      value: string
    ) => {
      console.log("x value/type", x, typeof x);

    
      // 연락처 컬럼(3번)만 처리
      if (x != 3) return;

      const row = getRowFromInstance(instance, y, tableData);
      if (!row) return;

      const customerId = row[0];
      const newPhone = value;
        console.log("onchange fired2", { newPhone,customerId,x, y, value });
      if (!customerId) {
        console.warn("no customerId in row", row);
        return;
      }

      try {
        // DB 업데이트
 
        await axios.put(`${apiUrl}/api/customers/${customerId}`, {
          phone: newPhone,
        });
        console.log("고객 연락처 업데이트 완료", customerId, newPhone);

        // React state도 동기화 (선택 사항)
        setTableData((prev) => {
          const next = prev.map((r) => [...r]);
          if (next[y]) next[y][3] = newPhone;
          return next;
        });
      } catch (err) {
        console.error("연락처 업데이트 실패:", err);
        // 필요하면 원래값 복구
        // if (row[3] !== undefined) instance.setValueFromCoords(x, y, row[3]);
      }
    },
  });
};

  useEffect(() => {
    if (tableRef.current && tableData.length > 0) {
      initializeSpreadsheet(); // tableData가 준비된 후에만 초기화
    }
  }, [tableData]); // tableData가 업데이트될 때마다 초기화

  useEffect(() => {
    // console.log("customerName", customerName);
  }, [customerName]); // 의존성 배열에서 tableRef.current 제외, tableData가 있을 때만 초기화

  const SearchCusTomerName = (customerName: string) => {
    if (isOpen) {
      axios
        .get(`${apiUrl}/api/customers/customerName?customerName=${customerName}`)
        .then((res) => {
          const fetchedData = res.data.map((customer: { id: number; customerName: string; contactPerson: string; phone: string; notes: string }) => [
            customer.id.toString(),
            customer.customerName,
            customer.contactPerson,
            customer.phone,
            customer.notes,
          ]);
          console.log(fetchedData);
          setTableData(fetchedData);
        })
        .catch((err) => console.error("Error fetching customers:", err));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      SearchCusTomerName(searchName); // 엔터 키를 눌렀을 때 함수 실행
    }
  };

  const handleApply = () => {
    console.log({ customerName: customerName, customerName2: customerName2 });
    onSelect(customerName, customerName2, customeretc, customerTel); // 선택된 고객명 부모 컴포넌트로 전달
    onClose(); // 모달 닫기
  };

  const openCustomerDialog = () => {
    setDialogOpen(true);
  };

  const handleSaveCustomer = async (customer: Customer) => {
    if (!customer.inboundDate) {
      console.error("Inbound date is required.");
      return;
    }
    customer.inboundDate = new Date(dayjs(customer.inboundDate).format("YYYY-MM-DD"));
    if (customer.id !== 0) {
      await axios.put(`${apiUrl}/api/customers/${customer.id}`, customer);
    } else {
      customer.id = new Date().getTime();
      await axios.post(`${apiUrl}/api/customers`, customer);
    }
    setDialogOpen(false);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm" sx={{ minHeight: "500px", fontSize: "9px", maxWidth: "500px", margin: "0 auto" }}>
      <DialogTitle>고객명 검색</DialogTitle>
      <DialogContent sx={{ Height: "300px" }}>
        <Box
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            gap: "10px",
            marginBottom: "10px",
            maxWidth: "400px",
            margin: "0 auto",
          }}
        >
          <Button
            variant="outlined"
            onClick={openCustomerDialog}
            sx={{ maxWidth: "100px", padding: "0", height: "30px" }} // 높이 30px로 설정
          >
            신규 추가
          </Button>
          <TextField
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="검색"
            fullWidth
            sx={{ height: "30px", "& .MuiInputBase-root": { height: "30px" } }} // 높이 30px로 설정
          />
          <Button
            variant="outlined"
            onClick={() => SearchCusTomerName(searchName)}
            sx={{ maxWidth: "100px", padding: "0", height: "30px" }} // 높이 30px로 설정
          >
            검색
          </Button>
        </Box>
      </DialogContent>
      <div ref={tableRef} style={{ width: "100%", height: "150px", overflow: "auto" }}></div>

      <DialogActions>
        <Button onClick={handleApply} color="primary" variant="outlined">
          적용
        </Button>
        <Button onClick={onClose} color="primary" variant="contained">
          닫기
        </Button>
      </DialogActions>

      <CustomerDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onSave={handleSaveCustomer} customer={selectedCustomer} />
    </Dialog>
  );
};

export default CustomerModal;
