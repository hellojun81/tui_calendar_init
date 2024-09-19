import React from 'react';
import { Button, Box } from '@mui/material';
import './CrudButtons.css';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Backdrop from '@mui/material/Backdrop';
import SpeedDial from '@mui/material/SpeedDial';
import SpeedDialIcon from '@mui/material/SpeedDialIcon';
import SpeedDialAction from '@mui/material/SpeedDialAction';
interface CrudButtonsProps {
    onAdd: () => void;
    onEdit: () => void;
    onDelete: () => void;
}

const CrudButtons: React.FC<CrudButtonsProps> = ({ onAdd, onEdit, onDelete }) => {
    const [open, setOpen] = React.useState(true);
    const actions = [
        { icon: <DeleteIcon />, name: '삭제' , onClick:onDelete },
        { icon: <EditIcon />, name: '수정' , onClick:onEdit},
        { icon: <AddIcon />, name: '추가'  , onClick:onAdd },    

    ];
    const handleOpen = () => setOpen(true);
    return (
        <SpeedDial
        ariaLabel="SpeedDial tooltip example"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}  // 화면 우측 하단에 고정
        icon={<SpeedDialIcon />}
        // onClose={handleClose}
        onOpen={handleOpen}
        open={open}
      >
        {actions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            tooltipOpen
            // onClick={handleClose}
            onClick={action.onClick} // 
          />
        ))}
      </SpeedDial> 
        // <Box sx={{ display: 'flex', gap: '16px' ,maxHeight:'30px'}} className='crud-buttons-container'>
        //     <Button variant="contained" className='crud-button add-button'  onClick={onAdd}>
        //         추가
        //     </Button>
        //     <Button variant="contained"  className='crud-button edit-button' onClick={onEdit}>
        //         수정
        //     </Button>
        //     <Button variant="contained"  className='crud-button delete-button' onClick={onDelete}>
        //         삭제
        //     </Button>
        // </Box>
    );
};

export default CrudButtons;
