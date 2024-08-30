import React, { useEffect } from "react";

interface ScheduleModalProps {
  isOpen: boolean;
  modalMode: "create" | "edit";
  newStart: Date | null;
  newEnd: Date | null;
  newTitle: string;
  coustomerName: string;
  rentPlace: string;
  setNewStart: (date: Date | null) => void;
  setNewEnd: (date: Date | null) => void;
  onSaveSchedule: () => void;
  onDeleteSchedule: () => void;
  closeModal: () => void;
  onRawDataChange: (key: string, value: string) => void;
  setNewTitle: (title: string) => void;
  setCoustomerName: (title: string) => void;
  setRentPlace: (title: string) => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  modalMode,
  newStart,
  newEnd,
  newTitle,
  coustomerName,
  rentPlace,
  setNewStart,
  setNewEnd,
  onSaveSchedule,
  onDeleteSchedule,
  closeModal,
  setNewTitle,
  setCoustomerName,
  setRentPlace,
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

  const inputFields = [
    { label: "제목", value: newTitle, onChange: (value: string) => setNewTitle(value) },
    { label: "고객명", value: coustomerName, onChange: (value: string) => setCoustomerName(value) },
    { label: "대관장소", value: rentPlace, onChange: (value: string) => setRentPlace(value) },
  ];

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
            value={coustomerName}
            onChange={(e) => setCoustomerName(e.target.value)}
          />
        </div>


        {/* {inputFields.map((field, index) => (
          <div className="date-time-item" key={index}>
            <label>{field.label}:</label>
            <input
              type="text"
              value={field.value}
              onChange={(e) => field.onChange(e.target.value)}
            />
          </div>
        ))} */}

        <div className="modal-buttons">
          <button className="save-button" onClick={onSaveSchedule}>
            저장
          </button>
          {modalMode === "edit" && (
            <button className="delete-button" onClick={onDeleteSchedule}>
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
