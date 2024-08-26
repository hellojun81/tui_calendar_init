import React, { useState, useRef, useEffect } from 'react';
import { TextField, Box, Button } from '@mui/material';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import CrudButtons from './CrudButtons';
import CustomerDialog from './CustomerDialog';


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

    const handleAddCustomer = () => {
        setSelectedCustomer(undefined);
        setDialogOpen(true);
    };

    const handleEditCustomer = (customer: Customer) => {
        setSelectedCustomer(customer);
        setDialogOpen(true);
    };

    const handleDeleteCustomer = (id: number) => {
        setCustomers(customers.filter((customer) => customer.id !== id));
    };

    const handleSaveCustomer = (customer: Customer) => {
        if (customer.id) {
            // Update existing customer
            setCustomers(
                customers.map((c) => (c.id === customer.id ? customer : c))
            );
        } else {
            // Add new customer
            customer.id = new Date().getTime(); // Generate a unique ID
            setCustomers([...customers, customer]);
        }
    };




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

    useEffect(() => {
        if (tableRef.current && tableData.length) {
            jspreadsheet(tableRef.current, {
                data: tableData,
                columns: [
                    { type: 'text', title: '고객명', width: 150 },
                    { type: 'text', title: '전화번호', width: 150 },
                    { type: 'text', title: '이메일', width: 200 },
                    { type: 'text', title: '주소', width: 200 },
                    { type: 'text', title: '가입일', width: 100 },
                ],
            });
        }
    }, [tableData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSearch = () => {
        const dummyData = [
            ['김철수', '010-1234-5678', 'kim@example.com', '서울', '2023-01-15'],
            ['이영희', '010-9876-5432', 'lee@example.com', '부산', '2023-01-18'],
        ];

        setTableData(dummyData);
    };



    return (
        <Box
            sx={{
                maxWidth: '800px',
                margin: '0 auto',
                padding: '20px',
                border: '1px solid #ddd',
                borderRadius: '8px',
            }}
        >
            <h2>거래처 관리</h2>
            <Box sx={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <TextField
                    label="끝 날짜"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
                <TextField
                    label="시작 날짜"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                />
                <TextField
                    label="고객명"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    fullWidth
                />
                <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSearch}
                    sx={{ padding: '12px 16px' }}
                >
                    검색
                </Button>
            </Box>


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
