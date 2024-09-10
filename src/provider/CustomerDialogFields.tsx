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
}

const CustomerDialogFields: React.FC<CustomerDialogFieldsProps> = ({ formData, handleChange }) => {
    const fields = [
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
            console.log(`Field: ${field.label}, Rows: ${field.rows}`);

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
                    InputLabelProps={{
                        style: { fontSize: '0.5rem' },  // 라벨 크기 조정
                    }}
                    sx={{
                        '& .MuiInputBase-root': {
                            height: field.multiline ? 'auto' : '15px',  // 멀티라인 필드는 자동 높이
                            fontSize: '0.6rem',
                        },  
                        '& .MuiInputLabel-root': { fontSize: '0.9rem' },  // 라벨의 폰트 크기
                        '& .MuiInputBase-inputMultiline': {
                            height: field.rows ? `${field.rows * 10 + 10}px` : '10px',  // 멀티라인 필드의 줄 맞춤
                            paddingTop: '10px',
                        },
                        marginBottom: '1px',  // TextField들 사이의 간격을 추가로 조정 (필요한 경우)
                    }}
                    variant="standard" 
                />
            );
        })}
    </Box>
    );
};

export default CustomerDialogFields;
