import React from 'react';
import { TextField, Box } from '@mui/material';
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
    handleDateChange: (name: string, date: Date | null) => void;
}

const CustomerDialogFields: React.FC<CustomerDialogFieldsProps> = ({ formData, handleChange,handleDateChange }) => {
    const fields = [
        { label: '고객명', name: 'customerName' },
        { label: '유입경로', name: 'leadSource' },
        { label: '담당자', name: 'contactPerson' },
        { label: '직책', name: 'position' },
        { label: '연락처', name: 'phone' },
        { label: '이메일', name: 'email' },
        { label: '등록일', name: 'inboundDate', type: 'date' },
        { label: '사업자 등록번호', name: 'businessNumber' },
        { label: '대표자', name: 'representative' },
        { label: '소재지', name: 'location' },
        { label: '메모', name: 'notes', multiline: true, rows: 3 },  // 멀티라인 필드 설정
    ];

    const getValue = (name: string) => {
        if (name === 'inboundDate') {
            return dayjs(formData.inboundDate).format('YYYY-MM-DD') || dayjs().format('YYYY-MM-DD');
        }
        return formData[name as keyof Customer];
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }} className="customer-dialog-field">
        {fields.map((field) => {
               return (
                <TextField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    value={getValue(field.name) as string}
                    onChange={handleChange}
                    type={field.type || 'text'}
                    multiline={field.multiline || false}  // 멀티라인 적용 여부
                    rows={field.rows || 1}  // 줄 수
                    fullWidth
                />
            );
        })}
    </Box>
    );
};

export default CustomerDialogFields;
