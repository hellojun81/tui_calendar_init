import React from 'react';
import { Button, Box } from '@mui/material';
import './CrudButtons.css';

interface CrudButtonsProps {
    onAdd: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const CrudButtons: React.FC<CrudButtonsProps> = ({ onAdd, onEdit, onDelete }) => {
    return (
        <Box sx={{ display: 'flex', gap: '16px' ,maxHeight:'30px'}} className='crud-buttons-container'>
            <Button variant="contained" className='crud-button add-button'  onClick={onAdd}>
                추가
            </Button>
            <Button variant="contained"  className='crud-button edit-button' onClick={onEdit}>
                수정
            </Button>
            <Button variant="contained"  className='crud-button delete-button' onClick={onDelete}>
                삭제
            </Button>
        </Box>
    );
};

export default CrudButtons;
