import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import CustomerDialogFields from './CustomerDialogFields';
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
    const initialFormData: Customer = {
        id: 0,
        customerName: '',
        contactPerson: '',
        position: '',
        phone: '',
        email: '',
        leadSource: '',
        inboundDate: new Date(),
        businessNumber: '',
        representative: '',
        location: '',
        notes: '',
    };

    const [formData, setFormData] = useState<Customer>(initialFormData);

    useEffect(() => {
        console.log(customer)
        if (customer && open) {
            setFormData(customer);
        }
    }, [customer, open]);

    useEffect(() => {
        if (!open) {
            setFormData(initialFormData); // 폼 초기화
        }
    }, [open]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: name === 'inboundDate' ? dayjs(value).format('YYYY-MM-DD') : value,
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
        // <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
        <Dialog
  open={open}
  onClose={onClose}
  sx={{ '& .MuiDialog-paper': { width: '100%', maxWidth: '500px' } }} // 원하는 크기로 설정
>
            <DialogTitle>{customer?.customerName ? '고객 수정' : '고객 추가'}</DialogTitle>
            <DialogContent>
                <CustomerDialogFields formData={formData} handleChange={handleChange} handleDateChange={handleDateChange} />
            </DialogContent>
            <DialogActions>
            <Button onClick={handleSave} color="primary" variant="outlined" >
                    저장
                </Button>
                <Button onClick={onClose} color="primary" variant="contained" >
                    취소
                </Button>
           
            </DialogActions>
        </Dialog>
    );
};

export default CustomerDialog;
