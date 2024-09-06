import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import CrudButtons from '../common/CrudButtons';
import CustomerDialog from './CustomerDialog';
import SearchFields from './SearchFields';
import dayjs from 'dayjs';
import { Customer, JSpreadsheetInstance } from './Customer';
import './provider.css';
import axios, { Axios } from 'axios';
import { getCurrentDate } from '../utils/scheduleUtils';

const Provider: React.FC = () => {
    const [customers, setCustomers] = useState<Customer[]>([]);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | undefined>(undefined);
    const [dialogOpen, setDialogOpen] = useState(false);
    const { startDate, endDate } = getCurrentDate();
    const [formData, setFormData] = useState({
        startDate: startDate,
        endDate: endDate,
        customerName: '',
    });
    const [activeRow, SetactiveRow] = useState<number>(0);
    const [tableData, setTableData] = useState<string[][]>([]);
    const tableRef = useRef<HTMLDivElement>(null);
    const jexcelInstance = useRef<any>(null);


    // 고객 데이터 형식으로 변환하는 함수
    const formatCustomerData = (row: string[]): Customer => ({
        id: Number(row[0]),
        customerName: row[1],
        contactPerson: row[2],
        position: row[3],
        phone: row[4],
        email: row[5],
        leadSource: row[6],
        inboundDate: new Date(dayjs(row[7]).format('YYYY-MM-DD')),
        businessNumber: row[8],
        representative: row[9],
        location: row[10],
        notes: row[11],
    });
    const handleAddCustomer = () => {
        setSelectedCustomer(undefined);
        setDialogOpen(true);
    };
    const handleEditCustomer = () => {
        const selectedCustomers = [];
        for (let rowIndex = activeRow; rowIndex <= activeRow; rowIndex++) {
            if (tableData[rowIndex]) {
                const selectedRow = tableData[rowIndex];
                selectedCustomers.push(formatCustomerData(selectedRow));
            }
        }
        selectedCustomers[0].inboundDate = dayjs(selectedCustomers[0].inboundDate).format('YYYY-MM-DD');
        console.log('selectedCustomers', selectedCustomers);
        setSelectedCustomer(selectedCustomers[0]);
        setDialogOpen(true);
    };
    const handleDeleteCustomer = async (activeRow: Number) => {
        // const id=tableData[activeRow][0]
        const id = tableData[activeRow as number][0];
        if (id !== undefined) {
            await axios.delete(`http://localhost:3001/api/customers/${id}`);
            handleSearch()
        }
    };

    const handleSaveCustomer = async (customer: Customer) => {
        // console.log('handleSaveCustomer', customer)
        if (customer.id !== 0) {
            await axios.put(`http://localhost:3001/api/customers/${customer.id}`, customer);
            setCustomers(customers.map((c) => (c.id === customer.id ? customer : c)));
        } else {
            console.log('New SaveCustomer', customer)
            customer.inboundDate = dayjs(customer.inboundDate).format('YYYY-MM-DD')
            await axios.post('http://localhost:3001/api/customers', customer);
            setCustomers([...customers, customer]);
        }
        setDialogOpen(false);
        handleSearch();
    };

    useEffect(() => {
        if (tableRef.current) {
            if (!jexcelInstance.current) {
                console.log("JSpreadsheet 초기화 시작");
                jexcelInstance.current = jspreadsheet(tableRef.current, {
                    data: tableData.length ? tableData : [[]],
                    columns: [
                        { type: 'numeric', title: 'ID', width: 20 },
                        { type: 'text', title: '고객명', width: 80 },
                        { type: 'text', title: '담당자', width: 80 },
                        { type: 'text', title: '직책', width: 50 },
                        { type: 'text', title: '연락처', width: 50 },
                        { type: 'text', title: 'Email', width: 50 },
                        { type: 'text', title: '유입경로', width: 50 },
                        {
                            type: 'calendar', title: '등록일', width: 80, options: {
                                format: 'YYYY-MM-DD',
                            },
                        },
                        { type: 'text', title: '사업자번호', width: 30 },
                        { type: 'text', title: '대표자', width: 30 },
                        { type: 'text', title: '소재지', width: 30 },
                        { type: 'text', title: '메모', width: 30 },
                    ],
                });
            } else {
                jexcelInstance.current.setData(tableData);
                jexcelInstance.current.options.onselection = (
                    instance: JSpreadsheetInstance,
                    x1: number,
                    y1: number,
                    x2: number,
                    y2: number
                ) => {
                    SetactiveRow(y1);
                };
            }
        } else {
            console.error("tableRef.current가 null입니다.");
        }
    }, [tableData, selectedCustomer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    const handleSearch = async () => {
        try {
            const queryParams = new URLSearchParams({
                startDate: formData.startDate,
                endDate: formData.endDate,
                ...(formData.customerName && { customerName: formData.customerName }),
            });

            // const res = await axios.get(`http://localhost:3001/api/customers`);
            const res = await axios.get(`http://localhost:3001/api/customers/coustomerName?${queryParams.toString()}`);
            setTableData(res.data.map((customer: Customer) => [
                customer.id.toString(),
                customer.customerName,
                customer.contactPerson,
                customer.position,
                customer.phone,
                customer.email,
                customer.leadSource,
                dayjs(customer.inboundDate).format('YYYY-MM-DD'),
                customer.businessNumber,
                customer.representative,
                customer.location,
                customer.notes,
            ]));
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
                    onEdit={() => activeRow && handleEditCustomer()}
                    onDelete={() => activeRow && handleDeleteCustomer(activeRow)}
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