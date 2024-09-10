import React, { useEffect, useState } from "react";
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import axios from 'axios';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, TextField } from '@mui/material';
import CustomerDialog from '../provider/CustomerDialog'; // Import the CustomerDialog component
import { Customer } from '../provider/Customer';
import dayjs from 'dayjs';

const apiUrl = process.env.REACT_APP_API_URL;

interface JexcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedCustomer: string) => void;
  searchQuery: string;
}

const JexcelModal: React.FC<JexcelModalProps> = ({ isOpen, onClose, onSelect, searchQuery }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [data, setData] = useState<string[][]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchName, setSearchName] = useState('');

  useEffect(() => {
    // 최초 로딩 시 기본값 설정
    const spreadsheetElement = document.getElementById('spreadsheet');
    if (spreadsheetElement) {
      const initialData = [
        ['', '', ''],
      ]; // 기본 데이터

      jspreadsheet(spreadsheetElement, {
        data: initialData,
        columns: [
          { type: 'numeric', title: 'id', width: 30 },
          { type: 'text', title: '고객명', width: 100 },
          { type: 'text', title: '연락처', width: 100 }
        ],
        onselection: (instance, cell, y, x) => {
          x = 1;
          const selectedCustomerName = instance.jexcel.getValueFromCoords(x, y); // 선택된 셀의 데이터를 가져옵니다.
          setSelectedCustomer(selectedCustomerName);
        }
      });
    }
  }, []); // 첫 렌더링 시에만 실행

  const SearchCusTomerName = (customerName: string) => {
    if (isOpen) {
      axios.get(`${apiUrl}/api/customers/customerName?customerName=${customerName}`)
        .then(res => {
          const fetchedData = res.data.map((customer: { id: number, customerName: string; phone: string; }) =>
            [customer.id, customer.customerName, customer.phone]);
          setData(fetchedData);

          const spreadsheetElement = document.getElementById('spreadsheet');
          if (spreadsheetElement) {
            spreadsheetElement.innerHTML = '';
            jspreadsheet(spreadsheetElement, {
              data: fetchedData,
              columns: [
                { type: 'numeric', title: 'id', width: 30 },
                { type: 'text', title: '고객명', width: 100 },
                { type: 'text', title: '연락처', width: 100 }
              ],
              onselection: (instance, cell, y, x) => {
                x = 1;
                const selectedCustomerName = instance.jexcel.getValueFromCoords(x, y); // 선택된 셀의 데이터를 가져옵니다.
                setSelectedCustomer(selectedCustomerName);
              }
            });
          }
        })
        .catch(err => console.error('Error fetching customers:', err));
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      SearchCusTomerName(searchName);  // 엔터 키를 눌렀을 때 함수 실행
    }
  };

  const handleApply = () => {
    onSelect(selectedCustomer); // 선택된 고객명 부모 컴포넌트로 전달
    onClose(); // 모달 닫기
  };

  const openCustomerDialog = () => {
    const newCustomer: Customer = selectedCustomer ? { ...selectedCustomer } : {};
    newCustomer.customerName = searchQuery;
    setSelectedCustomer(newCustomer);
    setDialogOpen(true);
  };

  const handleSaveCustomer = async (customer: Customer) => {
    customer.inboundDate = dayjs(customer.inboundDate).format('YYYY-MM-DD');
    if (customer.id !== 0) {
      await axios.put(`${apiUrl}/api/customers/${customer.id}`, customer);
      setCustomers(customers.map((c) => (c.id === customer.id ? customer : c)));
    } else {
      customer.id = new Date().getTime();
      await axios.post(`${apiUrl}/api/customers`, customer);
      setCustomers([...customers, customer]);
    }
    setDialogOpen(false);
  };

  return (
    <Dialog open={isOpen} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>고객명 검색</DialogTitle>
      <DialogContent>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '10px' }}>
          <Button variant="outlined" onClick={openCustomerDialog}>신규 추가</Button>
          <TextField
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="검색"
            fullWidth
          />
        </div>
        <div id="spreadsheet" style={{ width: '100%', height: '150px', overflow: 'auto' }}></div>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleApply} color="primary">적용</Button>
        <Button onClick={onClose} color="secondary">닫기</Button>
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
