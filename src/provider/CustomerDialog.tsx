import React, { useState, useEffect } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from '@mui/material';
import CustomerDialogFields from './CustomerDialogFields';

interface Customer {
    id?: number;
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
        customerName: '',
        contactPerson: '',
        position: '',
        phone: '',
        email: '',
        leadSource: '',
        inboundDate: new Date,
        businessNumber: '',
        representative: '',
        location: '',
        notes: '',
    });

    useEffect(() => {
        if (customer && open) {
            if (formData.inboundDate === undefined) {
                const today = new Date();
                const formattedDate = today.toISOString().split('T')[0]; // 오늘 날짜를 'YYYY-MM-DD' 형식으로 포맷
                setFormData((prevData) => ({
                    ...prevData,
                    inboundDate: today,
                }));
            } else {
                setFormData(customer);
            }
            console.log('Customer inside useEffect:', customer);
        }
    }, [customer, open]);

    useEffect(() => {
        console.log('Updated inboundDate', formData.inboundDate);
    }, [formData]);

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
                <CustomerDialogFields formData={formData} handleChange={handleChange} />
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
