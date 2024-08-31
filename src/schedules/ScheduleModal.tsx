import React, { useEffect } from "react";

interface ScheduleModalProps {
  isOpen: boolean;
  modalMode: "create" | "edit";
  id:Number;
  newStart: Date | null;
  newEnd: Date | null;
  newTitle: string;
  customerName: string;
  rentPlace: string;
  setNewStart: (date: Date | null) => void;
  setNewEnd: (date: Date | null) => void;
  onSaveSchedule: () => void;
  onDeleteSchedule: (id:number) => void;
  closeModal: () => void;
  onRawDataChange: (key: string, value: string) => void;
  setNewTitle: (title: string) => void;
  setCustomerName: (text: string) => void;
  setRentPlace: (text: string) => void;
  openJexcelModal: (customerName: string) => void; // 수정된 부분
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  modalMode,
  id,
  newStart,
  newEnd,
  newTitle,
  customerName,
  rentPlace,
  setNewStart,
  setNewEnd,
  onSaveSchedule,
  onDeleteSchedule,
  closeModal,
  setNewTitle,
  setCustomerName,
  setRentPlace,
  openJexcelModal
}) => {
  const formatToKoreanTimeString = (date: Date): string => {
    if (!date) return "";
    let year = date.getFullYear();
    let month = ('0' + (date.getMonth() + 1)).slice(-2);
    let day = ('0' + date.getDate()).slice(-2);
    let hours = ('0' + date.getHours()).slice(-2);
    let minutes = ('0' + date.getMinutes()).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal]);



  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>{modalMode === "edit" ? "스케줄 수정" : "새 스케줄 추가"}</h2>
        <div className="date-time-container">
          <div className="date-time-item">
            <label>시작일:</label>
            <input
              type="datetime-local"
              value={newStart ? formatToKoreanTimeString(newStart) : ""}
              onChange={(e) => setNewStart(new Date(e.target.value))}
            />
          </div>
          <div className="date-time-item">
            <label>종료일:</label>
            <input
              type="datetime-local"
              value={newEnd ? formatToKoreanTimeString(newEnd) : ""}
              onChange={(e) => setNewEnd(new Date(e.target.value))}
            />
          </div>
        </div>

        <div className="date-time-item">
          <label>고객명:</label>
          <input
            type="text"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)} />
         <button onClick={() => openJexcelModal(customerName)}>검색</button>
        </div>

        <div className="date-time-item">
          <label>제목:</label>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => {
              setNewTitle(e.target.value)
              console.log('newTitle',newTitle)
       
            }}
          />
        </div>


        <div className="date-time-item">
          <label>대관장소:</label>
          <input
            type="text"
            value={rentPlace}
            onChange={(e) => setRentPlace(e.target.value)}
          />
        </div>

        <div className="modal-buttons">
          <button className="save-button" onClick={onSaveSchedule}>
            저장
          </button>
          {modalMode === "edit" && (
            <button className="delete-button" onClick={()=>onDeleteSchedule(id)}>
              삭제
            </button>
          )}
          <button className="cancel-button" onClick={closeModal}>
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModal;
