import React, { useEffect, useState } from "react";
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import axios from 'axios';

interface JexcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (selectedCustomer: string) => void;
  searchQuery: string;
}

const JexcelModal: React.FC<JexcelModalProps> = ({ isOpen, onClose, onSelect, searchQuery }) => {
  const [data, setData] = useState<string[][]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>("");

  useEffect(() => {
    console.log('searchQuery',searchQuery)
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
                x=0
                console.log(x,y)
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

  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>고객명 검색</h2>
      <div id="spreadsheet"></div>
      <button onClick={handleApply}>적용</button>
      <button onClick={onClose}>닫기</button>
    </div>
  );
};

export default JexcelModal;
