import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import CrudButtons from '../common/CrudButtons';
import CustomerDialog from './CustomerDialog';
import SearchFields from './SearchFields';
import dayjs from 'dayjs';
import { Customer } from './Customer';
import './provider.css';
import { apiRequest } from '../utils/api';  // Importing the apiRequest function


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
    const initialLoad = useRef(true); // 최초 로드를 감지하는 useRef

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


    const handleDeleteCustomer = async (customer: Customer) => {
        console.log('handleDeleteCustomer', customer)
        await apiRequest(`http://localhost:3001/api/customers/${selectedCustomer.id}`, 'DELETE');
        handleSearch()
    };


    const handleSaveCustomer = async (customer: Customer) => {
        // console.log('handleSaveCustomer', customer)
        if (customer.id !== '') {
            await apiRequest(`http://localhost:3001/api/customers/${customer.id}`, 'PUT', customer);
            setCustomers(customers.map((c) => (c.id === customer.id ? customer : c)));
        } else {
            console.log('New SaveCustomer', customer)
            customer.inboundDate = dayjs(customer.inboundDate).format('YYYY-MM-DD')
            await apiRequest('http://localhost:3001/api/customers', 'POST', customer);
            setCustomers([...customers, customer]);
        }
        setDialogOpen(false);
        handleSearch();
    };

    useEffect(() => {
        if (tableRef.current) {
            if (tableRef.current.jspreadsheet) {
                tableRef.current.jspreadsheet.destroy();
            }

            tableRef.current.jspreadsheet = jspreadsheet(tableRef.current, {
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
                            format: 'YYYY-MM-DD',
                        },
                    },
                    { type: 'text', title: '사업자번호', width: 30 },
                    { type: 'text', title: '대표자', width: 30 },
                    { type: 'text', title: '소재지', width: 30 },
                    { type: 'text', title: '메모', width: 30 },
                ],
                oneditionstart: (instance, cell, x, y) => {
                    DblClickEdit(y, y)
                },
                onselection: (instance, x1, y1, x2, y2) => {
                    // 클릭된 셀의 행(row) 인덱스 사용
                    const selectedRowIndex = y1;
                    console.log('selectedRowIndex',selectedRowIndex, x1);
                    console.log(instance);
                    console.log(x2, y2);
                },
            });
        }

        if (selectedCustomer === undefined) {
            console.log('Customer state has been reset:', selectedCustomer);
        }

    }, [tableData, selectedCustomer]);

    const handleSelection = useCallback((instance, x1, y1, x2, y2) => {
        // 최초 로드 시에는 무시
        if (initialLoad.current) {
            initialLoad.current = false;
            return;
        }

        const selectedRowIndex = y1;
        const selectedRowData = tableData[selectedRowIndex];
        const newCustomer = formatCustomerData(selectedRowData);

        // 기존 상태와 비교하여 다를 때만 업데이트
        if (JSON.stringify(selectedCustomer) !== JSON.stringify(newCustomer)) {
            setSelectedCustomer(newCustomer);
        }
    }, [tableData, selectedCustomer]);



    const DblClickEdit = (startRow: Number, endRow: Number) => {
        const selectedCustomers = [];
        for (let rowIndex = startRow; rowIndex <= endRow; rowIndex++) {
            if (tableData[rowIndex]) {
                const selectedRow = tableData[rowIndex];
                selectedCustomers.push(formatCustomerData(selectedRow));
            }
        }
        selectedCustomers[0].inboundDate = dayjs(selectedCustomers[0].inboundDate).format('YYYY-MM-DD')
        console.log('selectedCustomers', selectedCustomers)
        setSelectedCustomer(selectedCustomers[0]);
        setDialogOpen(true);
    }

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
                const formattedDate = dayjs(customer.inboundDate).format('YYYY-MM-DD');
                return [
                    customer.id.toString(),
                    customer.customerName,
                    customer.contactPerson,
                    customer.position,
                    customer.phone,
                    customer.email,
                    customer.leadSource,
                    formattedDate,
                    customer.businessNumber,
                    customer.representative,
                    customer.location,
                    customer.notes,
                ];
            });
            setTableData(formattedData);
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
                    // onEdit={() => selectedCustomer && handleEditCustomer(selectedCustomer)}
                    onDelete={() => selectedCustomer && handleDeleteCustomer(selectedCustomer)}
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


