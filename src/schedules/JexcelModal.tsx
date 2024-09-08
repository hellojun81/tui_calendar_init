import React, { useEffect, useState } from "react";
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import axios from 'axios';
import CustomerDialog from '../provider/CustomerDialog'; // Import the CustomerDialog component
import { Customer } from '../provider/Customer'
import dayjs from 'dayjs';
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
  const [isCustomerDialogOpen, setIsCustomerDialogOpen] = useState(false); // State to control the CustomerDialog visibility
  const [dialogOpen, setDialogOpen] = useState(false);


  useEffect(() => {
    // console.log('searchQuery', searchQuery)
    SearchCusTomerName(searchQuery)
  }, [isOpen, searchQuery]);

  const SearchCusTomerName = (customerName: string) => {
    // console.log('SearchCustomerName',customerName)
    if (isOpen) {
      axios.get(`http://localhost:3001/api/customers/customerName?customerName=${searchQuery}`)
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
                x = 1
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

  }

  const handleApply = () => {
    console.log('selectedCustomer', selectedCustomer);
    onSelect(selectedCustomer); // 선택된 고객명 부모 컴포넌트로 전달
    onClose(); // 모달 닫기
  };

  const openCustomerDialog = () => {
    console.log('openCustomerDialog', searchQuery);


    // If selectedCustomer is undefined, create a new customer with the searchQuery as the customerName
    const newCustomer: Customer = selectedCustomer ? { ...selectedCustomer } : { id: 0, customerName: searchQuery, phone: '', inboundDate: new Date() };

    // If selectedCustomer is already defined, update its customerName to match searchQuery
    newCustomer.customerName = searchQuery;
    console.log('newCustomer', newCustomer);
    // Update the state with the new or modified customer
    setSelectedCustomer(newCustomer);

    // Open the dialog
    setDialogOpen(true);
};

  const closeCustomerDialog = () => {
    setIsCustomerDialogOpen(false);
  };
  const handleSaveCustomer = async (customer: Customer) => {
    console.log('handleSaveCustomer', customer)
    const customerName=customer.customerName
    customer.inboundDate = dayjs(customer.inboundDate).format('YYYY-MM-DD')
    if (customer.id !== 0) {
      await axios.put(`http://localhost:3001/api/customers/${customer.id}`, customer);
      setCustomers(customers.map((c) => (c.id === customer.id ? customer : c)));
    } else {
      customer.id = new Date().getTime();
      await axios.post('http://localhost:3001/api/customers', customer);
      setCustomers([...customers, customer]);
    }
    setDialogOpen(false);
    SearchCusTomerName(customerName)
  };


  if (!isOpen) return null;

  return (
    <div className="modal">
      <h2>고객명 검색</h2>
      <button onClick={openCustomerDialog}>신규추가</button> {/* 신규차가 버튼 추가 */}

      <div id="spreadsheet"></div>
      <button onClick={handleApply}>적용</button>
      <button onClick={onClose}>닫기</button>


      <CustomerDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        onSave={handleSaveCustomer}
        customer={selectedCustomer}
      />
    </div>
  );
};

export default JexcelModal;
