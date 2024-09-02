import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import CustomerDialogFields from './CustomerDialogFields';
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
interface CustomerDialogProps {
    open: boolean;
    onClose: () => void;
    onSave: (customer: Customer) => void;
    customer?: Customer;
}

const CustomerDialog: React.FC<CustomerDialogProps> = ({ open, onClose, onSave, customer }) => {
    const [formData, setFormData] = useState<Customer>({
        id: customer?.id || 0, // 기본값으로 id 설정
        customerName: '',
        contactPerson: '',
        position: '',
        phone: '',
        email: '',
        leadSource: '',
        inboundDate: customer?.inboundDate || new Date(), // Date 객체로 설정
        businessNumber: '',
        representative: '',
        location: '',
        notes: '',
    });
    useEffect(() => {
        if (customer && open) {
            setFormData(customer);
        }
    }, [customer, open]);
    


    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'inboundDate' ? dayjs(value).format('YYYY-MM-DD') : value, // inboundDate를 Date 타입으로 처리
        });
    };
    const handleDateChange = (name: string, date: Date | null) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: date,
        }));
    };

    const handleSave = () => {
        onSave(formData);
        onClose();
    };

    return (
        <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
            <DialogTitle>{customer ? '고객 수정' : '고객 추가'}</DialogTitle>
            <DialogContent>
                <CustomerDialogFields formData={formData} handleChange={handleChange} handleDateChange={handleDateChange} />
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

