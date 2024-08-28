import React from 'react';
import { TextField, Box } from '@mui/material';

// Customer 데이터 구조를 정의하는 인터페이스
interface Customer {
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

// Props의 타입 정의
interface CustomerDialogFieldsProps {
    formData: Customer;
    handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const CustomerDialogFields: React.FC<CustomerDialogFieldsProps> = ({ formData, handleChange }) => {
    const fields = [
        { label: '고객명', name: 'customerName' },
        { label: '담당자', name: 'contactPerson' },
        { label: '직책', name: 'position' },
        { label: '연락처', name: 'phone' },
        { label: '이메일', name: 'email' },
        { label: '유입경로', name: 'leadSource' },
        { label: '2024.08.28', name: 'inboundDate', type: 'date' },
        { label: '사업자 등록번호', name: 'businessNumber' },
        { label: '대표자', name: 'representative' },
        { label: '소재지', name: 'location' },
        { label: '메모', name: 'notes', multiline: true, rows: 3 },
    ];

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {fields.map((field) => (
                <TextField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    // value={field.label} // 타입 안전성을 위해 keyof 사용
                    value={formData[field.name as keyof Customer]} // 타입 안전성을 위해 keyof 사용
                    onChange={handleChange}
                    type={field.type || 'text'}
                    fullWidth 
                    multiline={field.multiline || false}
                    rows={field.rows || 1}
                    InputLabelProps={field.type === 'date' ? { shrink: true } : undefined}
                    sx={{
                        backgroundColor: '#f9f9f9',
                        borderRadius: 1,
                        width: '100%',
                        '& .MuiInputBase-root': {
                            fontSize: '0.875rem',
                            padding: '8px',
                        },
                        '& .MuiInputLabel-root': {
                            fontSize: '0.875rem',
                        },
                        '& .MuiOutlinedInput-root': {
                            height: '36px',
                        },
                    }}
                />
            ))}
        </Box>
    );
};

export default CustomerDialogFields;
