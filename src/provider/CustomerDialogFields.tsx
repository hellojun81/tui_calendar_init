import React, { useState, useEffect } from 'react';
import { TextField, Box } from '@mui/material';
import './provider.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
// import { Customer } from './Customer';
import dayjs from 'dayjs';

interface Customer {
    id: number;
    customerName: string;
    contactPerson: string;
    position: string;
    phone: string;
    email: string;
    leadSource: string;
    inboundDate: Date;
    businessNumber: string;
    representative: string;
    location: string;
    notes: string;
}



interface CustomerDialogFieldsProps {
    formData: Customer;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDateChange: (name: string, date: Date | null) => void; // 추가: DatePicker의 날짜 변경 핸들러
}

const CustomerDialogFields: React.FC<CustomerDialogFieldsProps> = ({ formData, handleChange, handleDateChange }) => {
    const fields = [
        { label: 'ID', name: 'id' },
        { label: '고객명', name: 'customerName' },
        { label: '담당자', name: 'contactPerson' },
        { label: '직책', name: 'position' },
        { label: '연락처', name: 'phone' },
        { label: '이메일', name: 'email' },
        { label: '유입경로', name: 'leadSource' },
        { label: '등록일', name: 'inboundDate', type: 'date' },
        { label: '사업자 등록번호', name: 'businessNumber' },
        { label: '대표자', name: 'representative' },
        { label: '소재지', name: 'location' },
        { label: '메모', name: 'notes', multiline: true, rows: 3 },
    ];

    const getValue = (name: string) => {
        if (name === 'inboundDate') {
            const newDate = new Date()
            const newFormatDate = dayjs(newDate).format('YYYY-MM-DD')
            return formData.inboundDate || newFormatDate  // inboundDate가 없으면 오늘 날짜를 반환
        }
        // console.log(formData['inboundDate' as keyof Customer])
        return formData[name as keyof Customer];
    };

    

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }} className="customer-dialog-field">
            {fields.map((field) => {
                // console.log(field)
                return field.name === 'inboundDate' ? (
                    <TextField
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        value={getValue(field.name)}
                        onChange={handleChange}
                        type={field.type || 'date'}

                    />
                    // <LocalizationProvider key={field.name} dateAdapter={AdapterDateFns}>
                    //     <DatePicker
                    //         label={field.label}
                    //         value={getValue(field.name)}
                    //         onChange={(date) => {
                    //             if (date) {
                    //                 const formattedDate = format(date, 'yyyy-MM-dd'); // 원하는 포맷으로 변환 (예: 'yyyy-MM-dd')
                    //                 console.log(`DatePicker changed: ${field.name}`, formattedDate); // 변환된 날짜 출력
                    //                 handleDateChange(field.name, formattedDate);
                    //             } else {
                    //                 handleDateChange(field.name, null); // date가 null일 경우 처리
                    //             }
                    //         }}
                    //         renderInput={(params) => <TextField {...params} fullWidth />}
                    //     />
                    // </LocalizationProvider>
                ) : (
                    <TextField
                        key={field.name}
                        label={field.label}
                        name={field.name}
                        value={getValue(field.name) as string}
                        onChange={(e) => {
                            handleChange(e);
                        }}
                        type={field.type || 'text'}
                        multiline={field.multiline || false}
                        rows={field.rows || 1}
                        fullWidth
                    />
                );
            })}
        </Box>

    );
};

export default CustomerDialogFields;
