import React, { useCallback, useState, useRef, useEffect } from 'react';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField, Box } from '@mui/material';
import CustomerDialog from '../provider/CustomerDialog'; // Import the CustomerDialog component
import { Customer } from '../provider/Customer';
import dayjs from 'dayjs';

const apiUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PRODUCTION
    : process.env.REACT_APP_API_URL_LOCAL;

interface JexcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedCustomer: string,customerName2:string,etc:string) => void;
  searchQuery: string;
}

const JexcelModal: React.FC<JexcelModalProps> = ({ isOpen, onClose, onSelect, searchQuery }) => {
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');
  const [tableData, setTableData] = useState<string[][]>([]);
  const tableRef = useRef<HTMLDivElement>(null);
  const jexcelInstance = useRef<any>(null);

  const [id, setId] = useState<number>(0); // ID값
  const [customerName, setCustomerName] = useState("");
  const [customerName2, setCustomerName2] = useState("");
  const [etc, setEtc] = useState("");

  // JSpreadsheet 초기화 또는 갱신
  const initializeSpreadsheet = () => {
    if (tableRef.current) {
      if (jexcelInstance.current) {
        // 기존 인스턴스가 있는 경우 삭제(destroy) 후 재생성
        jexcelInstance.current.destroy();
        jexcelInstance.current = null;
      }

      // JSpreadsheet 초기화
      jexcelInstance.current = jspreadsheet(tableRef.current, {
        data: tableData.length ? tableData : [[]],
        columns: [
          { type: 'numeric', title: 'id', width: 1},  
          { type: 'text', title: '거래처명', width: 80 },
          { type: 'text', title: '담당자', width: 80 },
          { type: 'text', title: '연락처', width: 80 },
          { type: 'text', title: '비고', width: 100 },
        ],
        onselection: (instance, x1, y1, x2, y2) => {
          setId(parseInt(tableData[y1][0] || '0', 10));  // ID값 설정
          setCustomerName(`${tableData[y1][1]}`); // 고객명 설정
          setCustomerName2(tableData[y1][2] );
          setEtc(tableData[y1][4] );
          // setCustomerName(`${tableData[y1][1]}(${tableData[y1][2]})`); // 고객명 설정
        },
      });
    } else {
      console.error("tableRef.current가 null입니다.");
    }
  };

  

  useEffect(() => {
    console.log('jexcelModal customerName=',customerName)
    initializeSpreadsheet();
  }, [tableData]);

  const SearchCusTomerName = (customerName: string) => {
    if (isOpen) {
      axios.get(`${apiUrl}/api/customers/customerName?customerName=${customerName}`)
        .then(res => {
          const fetchedData = res.data.map((customer: { id: number, customerName: string, contactPerson: string, phone: string, notes: string }) =>
            [customer.id.toString(), customer.customerName,customer.contactPerson , customer.phone, customer.notes]);
          console.log(fetchedData);
          setTableData(fetchedData);
        })
        .catch(err => console.error('Error fetching customers:', err));
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      SearchCusTomerName(searchName);  // 엔터 키를 눌렀을 때 함수 실행
    }
  };

  const handleApply = () => {
    onSelect(customerName,customerName2,etc); // 선택된 고객명 부모 컴포넌트로 전달
    onClose(); // 모달 닫기
  };

  const openCustomerDialog = () => {
    setDialogOpen(true);
  };

  const handleSaveCustomer = async (customer: Customer) => {
    customer.inboundDate = dayjs(customer.inboundDate).format('YYYY-MM-DD');
    if (customer.id !== 0) {
      await axios.put(`${apiUrl}/api/customers/${customer.id}`, customer);
    } else {
      customer.id = new Date().getTime();
      await axios.post(`${apiUrl}/api/customers`, customer);
    }
    setDialogOpen(false);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm" sx={{ minHeight: '500px', fontSize: '9px', maxWidth: '500px', margin: '0 auto' }}>
      <DialogTitle>고객명 검색</DialogTitle>
      <DialogContent sx={{ Height: '300px' }}>
        <Box style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginBottom: '10px', maxWidth: '400px', margin: '0 auto' }}>
          <Button
            variant="outlined"
            onClick={openCustomerDialog}
            sx={{ maxWidth: '100px',  padding: '0', height: '30px' }} // 높이 30px로 설정
          >
            신규 추가
          </Button>
          <TextField
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="검색"
            fullWidth
            sx={{ height: '30px', '& .MuiInputBase-root': { height: '30px' } }} // 높이 30px로 설정
          />
          <Button
            variant="outlined"
            onClick={() => SearchCusTomerName(searchName)}
            sx={{ maxWidth: '100px', padding: '0', height: '30px' }} // 높이 30px로 설정
          >
            검색
          </Button>
        </Box>
      </DialogContent>
      <div ref={tableRef} style={{ width: '100%', height: '150px', overflow: 'auto' }}></div>


      <DialogActions>
        <Button onClick={handleApply} color="primary" variant="outlined">적용</Button>
        <Button onClick={onClose} color="primary" variant="contained">닫기</Button>
      </DialogActions>

      <CustomerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}

      />
    </Dialog>
  );
};

export default JexcelModal;
