import React, { useEffect, useState } from "react";
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import axios from 'axios';
import CustomerDialog from '../provider/CustomerDialog'; // Import the CustomerDialog component
import {Customer} from '../provider/Customer'
interface JexcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedCustomer: string) => void;
  searchQuery: string;
}

const JexcelModal: React.FC<JexcelModalProps> = ({ isOpen, onClose, onSelect, searchQuery }) => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [data, setData] = useState<string[][]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false); // State to control the CustomerDialog visibility
  const [dialogOpen, setDialogOpen] = useState(false);
  const apiRequest = async (url: string, method: string = 'GET', body?: any) => {
    const options: RequestInit = {
        method,
        headers: { 'Content-Type': 'application/json' },
    };
    if (body) {
        options.body = JSON.stringify(body);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    return response.json();
};
  useEffect(() => {
    console.log('searchQuery', searchQuery)
    if (isOpen) {
      axios.get(`http://localhost:3001/api/customers/customerName?customerName=${searchQuery}`)
        .then(res => {
          const fetchedData = res.data.map((customer: { customerName: string; phone: string; }) => [customer.customerName, customer.phone]);
          setData(fetchedData);

          const spreadsheetElement = document.getElementById('spreadsheet');
          if (spreadsheetElement) {
            spreadsheetElement.innerHTML = '';
            jspreadsheet(spreadsheetElement, {
              data: fetchedData,
              columns: [
                { type: 'text', title: '고객명', width: 100 },
                { type: 'text', title: '연락처', width: 100 }
              ],
              onselection: (instance, cell, y, x) => {
                x = 0
                console.log(x, y)
                const selectedCustomerName = instance.jexcel.getValueFromCoords(x, y); // 선택된 셀의 데이터를 가져옵니다.
                console.log(selectedCustomerName)
                setSelectedCustomer(selectedCustomerName);
              }
            });
          }
        })
        .catch(err => console.error('Error fetching customers:', err));
    }
  }, [isOpen, searchQuery]);

  const handleApply = () => {
    console.log('selectedCustomer', selectedCustomer);
    onSelect(selectedCustomer); // 선택된 고객명 부모 컴포넌트로 전달
    onClose(); // 모달 닫기
  };

  const openCustomerDialog = () => {
    setSelectedCustomer([]);
    setDialogOpen(true);
  };

  const closeCustomerDialog = () => {
    setIsCustomerDialogOpen(false);
  };
  const handleSaveCustomer = async (customer: Customer) => {
    if (customer.id !== undefined) {
      await apiRequest(`http://localhost:3001/api/customers/${customer.id}`, 'PUT', customer);
      setCustomers(customers.map((c) => (c.id === customer.id ? customer : c)));
    } else {
      customer.id = new Date().getTime();
      await apiRequest('http://localhost:3001/api/customers', 'POST', customer);
      setCustomers([...customers, customer]);
    }
    setDialogOpen(false);
  };


  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>고객명 검색</h2>
      <button onClick={openCustomerDialog}>신규추가</button> {/* 신규차가 버튼 추가 */}

      <div id="spreadsheet"></div>
      <button onClick={handleApply}>적용</button>
      <button onClick={onClose}>닫기</button>

      {isCustomerDialogOpen && (
        <CustomerDialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          onSave={handleSaveCustomer}
          customer={selectedCustomer}
        />)}
    </div>
  );
};

export default JexcelModal;
