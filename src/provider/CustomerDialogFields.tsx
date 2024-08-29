import React from 'react';
import { TextField, Box } from '@mui/material';
import './provider.css';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { MobileDatePicker } from '@mui/x-date-pickers';

// Customer 데이터 구조를 정의하는 인터페이스
interface Customer {
    id: number;
    customerName: string;
    contactPerson: string;
    position: string;
    phone: string;
    email: string;
    leadSource: string;
    inboundDate: Date | null; // Date | null로 변경하여 DatePicker의 초기 상태와 호환되도록 설정
    businessNumber: string;
    representative: string;
    location: string;
    notes: string;
}

// Props의 타입 정의
interface CustomerDialogFieldsProps {
    formData: Customer;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleDateChange: (name: string, date: Date | null) => void; // 추가: DatePicker의 날짜 변경 핸들러
}
const currentDate = new Date();
const str_Date = currentDate.toISOString().split('T')[0];

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
console.log('fields',fields)
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }} className="customer-dialog-field">
            {fields.map((field) => (
                <TextField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    value={formData[field.name]}
                    // value={formData[field.name as keyof Customer] as string}
                    onChange={handleChange}
                    type={field.type || 'text'}
                    // fullWidth
                    // multiline={field.multiline || false}
                    // rows={field.rows || 1}
                    // InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                />
            ))}

        </Box>
    );
};

export default CustomerDialogFields;
