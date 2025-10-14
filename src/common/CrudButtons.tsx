import React from "react";
import { Button, Box } from "@mui/material";
import "./CrudButtons.css";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Backdrop from "@mui/material/Backdrop";
import SpeedDial from "@mui/material/SpeedDial";
import SpeedDialIcon from "@mui/material/SpeedDialIcon";
import SpeedDialAction from "@mui/material/SpeedDialAction";

interface CrudButtonsProps {
  onAdd?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  // 🚨 새롭게 추가된 라벨 props
  addLabel?: string;
  editLabel?: string;
  deleteLabel?: string;
}

const CrudButtons: React.FC<CrudButtonsProps> = ({
  onAdd,
  onEdit,
  onDelete,
  addLabel = "추가", // 기본값 설정
  editLabel = "수정", // 기본값 설정
  deleteLabel = "삭제", // 기본값 설정
}) => {
  const [open, setOpen] = React.useState(true);

  // 1. 모든 잠재적 액션을 정의합니다.
  const allActions = [
    { icon: <DeleteIcon />, name: deleteLabel, onClick: onDelete },
    { icon: <EditIcon />, name: editLabel, onClick: onEdit },
    { icon: <AddIcon />, name: addLabel, onClick: onAdd },
  ];

  // 🚨 2. onClick 핸들러가 존재하는 액션만 필터링하여 최종 actions 배열을 만듭니다.
  const actions = allActions.filter((action) => action.onClick);

  const handleOpen = () => setOpen(true);

  // 3. 필터링된 actions 배열을 SpeedDial에 사용
  return (
    <SpeedDial
      ariaLabel="SpeedDial tooltip example"
      sx={{ position: "fixed", bottom: 16, right: 16 }} // 화면 우측 하단에 고정
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
          // onClick은 필터링을 거쳤으므로 반드시 존재합니다.
          onClick={action.onClick!}
        />
      ))}
    </SpeedDial>
  );
};

export default CrudButtons;
