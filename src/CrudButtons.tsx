import React from 'react';
import { Button, Box } from '@mui/material';

interface CrudButtonsProps {
    onAdd: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const CrudButtons: React.FC<CrudButtonsProps> = ({ onAdd, onEdit, onDelete }) => {
    return (
        <Box sx={{ display: 'flex', gap: '10px' }}>
            <Button variant="contained" color="primary" onClick={onAdd}>
                추가
            </Button>
            <Button variant="contained" color="secondary" onClick={onEdit}>
                수정
            </Button>
            <Button variant="contained" color="error" onClick={onDelete}>
                삭제
            </Button>
        </Box>
    );
};

export default CrudButtons;
