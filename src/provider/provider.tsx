import React, { useState, useRef, useEffect } from 'react';
import { TextField, Box, Button } from '@mui/material';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import CrudButtons from '../common/CrudButtons';
import CustomerDialog from './CustomerDialog';
import SearchFields from './SearchFields';

interface Customer {
    id: number;
    customerName: string;
    contactPerson: string;
    position: string;
    phone: string;
    email: string;
    leadSource: string;
    inboundDate: string;
    businessNumber: string;
    representative: string;
    location: string;
    notes: string;
}

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
        phone: row[2],
        email: row[3],
        location: row[4],
        inboundDate: row[5],
        contactPerson: '',
        position: '',
        leadSource: '',
        businessNumber: '',
        representative: '',
        notes: '',
    });

    const handleAddCustomer = () => {
        setSelectedCustomer(undefined);
        setDialogOpen(true);
    };

    const handleEditCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setDialogOpen(true);
    };

    const handleDeleteCustomer = async (id: number) => {
        await apiRequest(`http://localhost:3001/api/customers/${id}`, 'DELETE');
        setCustomers(customers.filter((customer) => customer.id !== id));
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

    useEffect(() => {
        if (tableRef.current) {
            if (tableRef.current.jspreadsheet) {
                tableRef.current.jspreadsheet.destroy();
            }

            jspreadsheet(tableRef.current, {
                data: tableData.length ? tableData : [[]],
                columns: [
                    { type: 'number', title: 'ID', width: 20 },
                    { type: 'text', title: '고객명', width: 150 },
                    { type: 'text', title: '전화번호', width: 150 },
                    { type: 'text', title: '이메일', width: 200 },
                    { type: 'text', title: '주소', width: 100 },
                    { type: 'calendar', title: '가입일', width: 100 },
                ],
                onselection: (instance, x1, y1, x2, y2, origin) => {
                    if (tableData[y1]) {
                        const selectedRow = tableData[y1];
                        const newCustomer = formatCustomerData(selectedRow);
                        setSelectedCustomer(newCustomer);
                    } else {
                        console.warn('Selected row is undefined');
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
            const formattedData = data.map((customer: Customer) => [
                customer.id.toString(),
                customer.customerName,
                customer.phone,
                customer.email,
                customer.location,
                customer.inboundDate,
            ]);

            setTableData(formattedData);
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error);
        }
    };

    return (
        <Box sx={{ maxWidth: '800px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <h2>거래처 관리</h2>
            <SearchFields formData={formData} handleChange={handleChange} handleSearch={handleSearch} />
            <Box sx={{ padding: 2 }}>
                <CrudButtons
                    onAdd={handleAddCustomer}
                    onEdit={() => selectedCustomer && handleEditCustomer(selectedCustomer)}
                    onDelete={() => selectedCustomer && handleDeleteCustomer(selectedCustomer.id)}
                />
                <div ref={tableRef} />
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
