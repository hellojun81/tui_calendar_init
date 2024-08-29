import React from 'react';
import { TextField, Box, Button } from '@mui/material';

// Fields configuration
const fields = [
    { label: '시작일', name: 'endDate', type: 'date' },
    { label: '종료일', name: 'startDate', type: 'date' },
    { label: '고객명', name: 'customerName', type: 'text' }
];

const SearchFields: React.FC<{ formData: any; handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void; handleSearch: () => void }> = ({ formData, handleChange, handleSearch }) => {
    return (
        <Box sx={{ display: 'flex', gap: '20px', marginBottom: '20px' }} className='search-fields-container'>
            {fields.map((field) => (
                <TextField
                    key={field.name}
                    label={field.label}
                    name={field.name}
                    type={field.type}
                    value={formData[field.name]}
                    onChange={handleChange}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    className='customer-dialog-field'
                />
            ))}
            <Button
                variant="contained"
                color="primary"
                onClick={handleSearch}
                sx={{ padding: '12px 16px' }}
            >
                검색
            </Button>
        </Box>
    );
};

export default SearchFields;
