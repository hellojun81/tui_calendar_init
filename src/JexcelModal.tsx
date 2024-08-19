import React, { useEffect, useRef } from "react";

import jexcel from "jspreadsheet-ce";
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';


interface JexcelModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (value: string) => void;  // 부모 컴포넌트로 값을 전달하는 함수
  }
  
  const JexcelModal: React.FC<JexcelModalProps> = ({ isOpen, onClose, onSelect }) => {
    const jexcelRef = useRef<any>(null);
  
    useEffect(() => {
      if (isOpen) {
        const data = [
          ["Company A"],
          ["Company B"],
          ["Company C"],
        ];
  
        jexcelRef.current = jexcel(document.getElementById("jexcel")!, {
          data,
          columns: [
            { type: "text", title: "거래처명", width: 300 }
          ],
          minDimensions: [1, 3],
        });
      }
    }, [isOpen]);
  
    const handleApply = () => {
    //   const selectedCell = jexcelRef.current.getActiveCell();
    //   const selectedValue = jexcelRef.current.getValue(selectedCell);
      onSelect('jexcel value');  // 부모 컴포넌트로 값 전달
      onClose();  // 모달 닫기
    };
  
    if (!isOpen) {
      return null;
    }
  
    return (
      <div className="modal">
        <div className="modal-content">
          <h2>거래처명 선택</h2>
          <div id="jexcel" style={{ overflow: "auto" }}></div>
          <button onClick={handleApply}>적용</button>
          <button onClick={onClose}>닫기</button>
        </div>
      </div>
    );
  };
  
  export default JexcelModal;