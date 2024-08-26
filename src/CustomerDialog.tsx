import React, { useState, useEffect } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
} from '@mui/material';

interface Customer {
    id?: number;
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

interface CustomerDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (customer: Customer) => void;
    customer?: Customer; // 수정 시에 사용
}

const CustomerDialog: React.FC<CustomerDialogProps> = ({ open, onClose, onSave, customer }) => {
    const [formData, setFormData] = useState<Customer>({
        customerName: '',
        contactPerson: '',
        position: '',
        phone: '',
        email: '',
        leadSource: '',
        inboundDate: '',
        businessNumber: '',
        representative: '',
        location: '',
        notes: '',
    });

    useEffect(() => {
        if (customer) {
            setFormData(customer);
        }
    }, [customer]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{customer ? '고객 수정' : '고객 추가'}</DialogTitle>
            <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <TextField
                        label="고객명"
                        name="customerName"
                        value={formData.customerName}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="담당자"
                        name="contactPerson"
                        value={formData.contactPerson}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="직책"
                        name="position"
                        value={formData.position}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="연락처"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="이메일"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="유입경로"
                        name="leadSource"
                        value={formData.leadSource}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="인바운드 등록일"
                        name="inboundDate"
                        type="date"
                        value={formData.inboundDate}
                        onChange={handleChange}
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                    />
                    <TextField
                        label="사업자 등록번호"
                        name="businessNumber"
                        value={formData.businessNumber}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="대표자"
                        name="representative"
                        value={formData.representative}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="소재지"
                        name="location"
                        value={formData.location}
                        onChange={handleChange}
                        fullWidth
                    />
                    <TextField
                        label="메모"
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        fullWidth
                        multiline
                        rows={4}
                    />
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} color="secondary">
                    취소
                </Button>
                <Button onClick={handleSave} color="primary">
                    저장
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default CustomerDialog;
