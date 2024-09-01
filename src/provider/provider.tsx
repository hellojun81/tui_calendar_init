import React, { useState, useRef, useEffect } from 'react';
import { TextField, Box, Button } from '@mui/material';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import CrudButtons from '../common/CrudButtons';
import CustomerDialog from './CustomerDialog';
import SearchFields from './SearchFields';
import dayjs from 'dayjs';
import { Customer } from './Customer'
import './provider.css';

const Provider: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
    const [dialogOpen, setDialogOpen] = useState(false);

    const currentDate = new Date();
    const str_Date = currentDate.toISOString().split('T')[0];
    const end_Date = new Date();
    end_Date.setDate(currentDate.getDate() - 14);
    const endDateString = end_Date.toISOString().split('T')[0];

    const [formData, setFormData] = useState({
        startDate: str_Date,
        endDate: endDateString,
        customerName: '',
    });

    const [tableData, setTableData] = useState<string[][]>([]);
    const tableRef = useRef<HTMLDivElement>(null);

    // API 호출을 처리하는 함수
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

    // 고객 데이터 형식으로 변환하는 함수
    const formatCustomerData = (row: string[]): Customer => ({
        id: Number(row[0]),
        customerName: row[1],
        contactPerson: row[2],
        position: row[3],
        phone: row[4],
        email: row[5],
        leadSource: row[6],
        inboundDate: row[7],
        businessNumber: row[8],
        representative: row[9],
        location: row[10],
        notes: row[11],
    });

    const handleAddCustomer = () => {
        setSelectedCustomer([]);
        setDialogOpen(true);
    };

    const handleEditCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setDialogOpen(true);
    };

    const handleDeleteCustomer = async (id: number) => {
        console.log('handleDeleteCustomer', id)
        // await apiRequest(`http://localhost:3001/api/customers/${id}`, 'DELETE');
        // setCustomers(customers.filter((customer) => customer.id !== id));
        // handleSearch() 
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
        handleSearch();
    };

    useEffect(() => {
        if (tableRef.current) {
            // 기존 시트가 있다면 파괴
            if (tableRef.current.jspreadsheet) {
                tableRef.current.jspreadsheet.destroy();
            }

            // Jspreadsheet 초기화
            jspreadsheet(tableRef.current, {
                data: tableData.length ? tableData : [[]],
                columns: [
                    { type: 'number', title: 'ID', width: 20 },
                    { type: 'text', title: '고객명', width: 80 },
                    { type: 'text', title: '담당자', width: 80 },
                    { type: 'text', title: '직책', width: 50 },
                    { type: 'text', title: '연락처', width: 50 },
                    { type: 'text', title: 'Email', width: 50 },
                    { type: 'text', title: '유입경로', width: 50 },
                    {
                        type: 'calendar', title: '등록일', width: 80, options: {
                            format: 'YYYY-MM-DD'
                        }
                    },
                    { type: 'text', title: '사업자번호', width: 30 },
                    { type: 'text', title: '대표자', width: 30 },
                    { type: 'text', title: '소재지', width: 30 },
                    { type: 'text', title: '메모', width: 30 },
                ],


                onselection: (instance, x1, y1, x2, y2, origin) => {
                    const startRow = Math.min(y1, y2);
                    const endRow = Math.max(y1, y2);

                    const selectedCustomers = [];
                    for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
                        if (tableData[rowIndex]) {
                            const selectedRow = tableData[rowIndex];
                            const customerData = formatCustomerData(selectedRow);
                            selectedCustomers.push(customerData);
                            console.log('Selected Row Data:', customerData); // 선택된 행의 데이터 출력
                        }
                    }

                    if (selectedCustomers.length > 0) {
                        setSelectedCustomer(selectedCustomers[0]);
                    }
                },
            });
        }
    }, [tableData]);



    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSearch = async () => {
        try {
            const queryParams = new URLSearchParams({
                startDate: formData.startDate,
                endDate: formData.endDate,
            });
            if (formData.customerName) {
                queryParams.append('customerName', formData.customerName);
            }

            const data = await apiRequest(`http://localhost:3001/api/customers?${queryParams}`);
            const formattedData = data.map((customer: Customer) => {
                const formattedDate = dayjs(customer.inboundDate).format('YYYY-MM-DD'); // 'YYYY-MM-DD' format
                return [
                    customer.id.toString(),
                    customer.customerName,
                    customer.contactPerson,
                    customer.position,
                    customer.phone,
                    customer.email,
                    customer.leadSource,
                    formattedDate, // Use the formatted date
                    customer.businessNumber,
                    customer.representative,
                    customer.location,
                    customer.notes,
                ];
            });
            setTableData(formattedData);
            // if (jspreadsheet.current && formattedData.length > 0) {
            //     jspreadsheet.current.selectCell(0, 0, 0, 0); // 첫 번째 셀(0,0)을 선택
            // }
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    return (
        <Box sx={{ maxWidth: '800px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>

            <SearchFields formData={formData} handleChange={handleChange} handleSearch={handleSearch} />
            <Box sx={{ padding: 2 }}>
                <CrudButtons
                    onAdd={handleAddCustomer}
                    onEdit={() => selectedCustomer && handleEditCustomer(selectedCustomer)}
                    onDelete={() => selectedCustomer && handleDeleteCustomer(selectedCustomer.id)}
                />
                <div ref={tableRef} className='jexcel' />
                <CustomerDialog
                    open={dialogOpen}
                    onClose={() => setDialogOpen(false)}
                    onSave={handleSaveCustomer}
                    customer={selectedCustomer}
                />
            </Box>
        </Box>
    );
};

export default Provider;
