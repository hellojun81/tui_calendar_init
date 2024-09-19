import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Box } from '@mui/material';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';
import CrudButtons from '../common/CrudButtons';
import CustomerDialog from './CustomerDialog';
import SearchFields from './SearchFields';
import dayjs from 'dayjs';
import { Customer, JSpreadsheetInstance } from './Customer';
import '../common/Jexcel.css';
import axios, { Axios } from 'axios';
import { getCurrentDate } from '../utils/scheduleUtils';
// import AddIcon from '@mui/icons-material/Add';
// import EditIcon from '@mui/icons-material/Edit';
// import DeleteIcon from '@mui/icons-material/Delete';
// import Backdrop from '@mui/material/Backdrop';
// import SpeedDial from '@mui/material/SpeedDial';
// import SpeedDialIcon from '@mui/material/SpeedDialIcon';
// import SpeedDialAction from '@mui/material/SpeedDialAction';

const apiUrl =
    process.env.NODE_ENV === 'production'
        ? process.env.REACT_APP_API_URL_PRODUCTION
        : process.env.REACT_APP_API_URL_LOCAL;
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
    const [open, setOpen] = React.useState(true);
    const handleOpen = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const tableRef = useRef<HTMLDivElement>(null);
    const jexcelInstance = useRef<any>(null);
    const parentName = 'provider';



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
        const data = jexcelInstance.current.getData();
        // 데이터가 배열인지 확인하고 처리
        const lastRowWithData = data.reduce((maxRow: number, row: any[], index: number) => {
            // row가 배열인지 확인하고, 각 셀에 데이터가 있는지 확인
            const hasData = Array.isArray(row) && row.some(cell => cell !== null && cell !== '');
            return hasData ? index : maxRow;
        }, -1);
        if (lastRowWithData < 0) {
            return;
        }
        const selectedCustomers = [];
        for (let rowIndex = activeRow; rowIndex <= activeRow; rowIndex++) {
            if (tableData[rowIndex]) {
                const selectedRow = tableData[rowIndex];
                selectedCustomers.push(formatCustomerData(selectedRow));
            }
        }
        selectedCustomers[0].inboundDate = new Date(dayjs(selectedCustomers[0].inboundDate).format('YYYY-MM-DD'));
        console.log('selectedCustomers', selectedCustomers);
        setSelectedCustomer(selectedCustomers[0]);
        setDialogOpen(true);
    };

    const handleDeleteCustomer = async () => {
        const data = jexcelInstance.current.getData();
        // 데이터가 배열인지 확인하는 로직 추가
        if (!Array.isArray(data) || data.length === 0) {
            console.error("데이터가 올바르지 않습니다.");
            return;
        }
        const lastRowWithData = data.reduce((maxRow: number, row: any[], index: number) => {
            // 각 행에서 모든 셀이 비어있지 않으면 그 행이 마지막 행이 될 수 있음
            const hasData = Array.isArray(row) && row.some(cell => cell !== null && cell !== '');
            return hasData ? index : maxRow;
        }, -1);

        if (lastRowWithData < 0) {
            return;
        }
        const id = tableData[activeRow][0];
        const customerName = tableData[activeRow][1];
        // 스케줄 존재 여부 확인
        const checkSchedule = await axios.get(`${apiUrl}/api/schedules/customers?id=${id}`);
        let confirmDelete;
        if (checkSchedule.data.length > 0) {
            confirmDelete = window.confirm(`${customerName} 님에 민원 내역이 존재합니다. 정말 삭제하시겠습니까?`);
        } else {
            confirmDelete = window.confirm(`${customerName} 님을 정말 삭제하시겠습니까?`);
        }
        if (confirmDelete) {
            const id = tableData[activeRow as number][0];
            if (id !== undefined) {
                await axios.delete(`${apiUrl}/api/customers/${id}`);
                handleSearch(); // 데이터 갱신
            }
        }
    };


    const handleSaveCustomer = async (customer: Customer) => {
        let result
        if (customer.id !== 0) {///수정 저장
            result = await axios.put(`${apiUrl}/api/customers/${customer.id}`, customer);
            console.log('EDITcustomers', customers)
            setCustomers(customers.map((c) => (c.id === customer.id ? customer : c)));
        } else {///신규저장
            if (customer.customerName === "") {
                alert("고객명이 비어있습니다.")
                return;
            }
            customer.inboundDate = new Date(dayjs(customer.inboundDate).format('YYYY-MM-DD'))
            result = await axios.post(`${apiUrl}/api/customers`, customer);
            // console.log('New SaveCustomer', res)
            setCustomers([...customers, customer]);
        }
        setDialogOpen(false);
        handleSearch();
        console.log(result.data.message)
        alert(result.data.message)
    };

    useEffect(() => {
        if (tableRef.current) {
            if (!jexcelInstance.current) {
                // console.log("JSpreadsheet 초기화 시작");
                jexcelInstance.current = jspreadsheet(tableRef.current, {
                    data: tableData.length ? tableData : [[]],
                    columns: [
                        { type: 'numeric', title: 'ID', width: 0 },
                        { type: 'text', title: '고객명', width: 120 },
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
                    console.log({ x1: x1, y1: y1, x2: x2, y2: y2 })
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

            const res = await axios.get(`${apiUrl}/api/customers/coustomerName?${queryParams.toString()}`);
            if (res.data.length == 0) {
                setTableData([[' ']])
                return
            }
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

    // const actions = [
    //     { icon: <DeleteIcon />, name: '삭제' , onClick: handleDeleteCustomer},
    //     { icon: <EditIcon />, name: '수정', onClick: handleEditCustomer },
    //     { icon: <AddIcon />, name: '추가'  ,onClick: handleAddCustomer },    

    // ];
    const handleCloseModal = () => {
        // if (jexcelInstance.current) {
        //     jexcelInstance.current.closeEditor();
        // }
        setDialogOpen(false);
    };


    return (
  <>
            <Box sx={{ maxWidth: '1200px', margin: '0 auto', padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
                <SearchFields prarentComponent={parentName} formData={formData} handleChange={handleChange} handleSearch={handleSearch} />
                <Box sx={{ padding: 2 }}>
                    <CrudButtons
                        onAdd={handleAddCustomer}
                        onEdit={() => handleEditCustomer()}
                        onDelete={() => handleDeleteCustomer()}
                    />
                    <div ref={tableRef} />
                    <CustomerDialog
                        open={dialogOpen}
                        onClose={handleCloseModal}
                        onSave={handleSaveCustomer}
                        customer={selectedCustomer}
                    />
                </Box>
            </Box>
            {/* <SpeedDial
        ariaLabel="SpeedDial tooltip example"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}  // 화면 우측 하단에 고정
        icon={<SpeedDialIcon />}
        // onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            // onClick={handleClose}
            onClick={action.onClick} // 
          />
        ))}
      </SpeedDial> */}
      </>
            );
};

            export default Provider;