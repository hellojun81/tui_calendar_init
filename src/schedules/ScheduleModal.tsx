import React, { useEffect } from "react";
import RawDataForm from "./RawDataForm";

interface ScheduleModalProps {
  isOpen: boolean;
  modalMode: "create" | "edit";
  newStart: Date | null;
  newEnd: Date | null;
  newTitle: string;
  newBody: string;
  newLocation: string;
  newIsAllDay: boolean;
  newDueDateClass: string;
  rawData: { [key: string]: any };
  setNewStart: (date: Date | null) => void;
  setNewEnd: (date: Date | null) => void;
  onSaveSchedule: () => void;
  onDeleteSchedule: () => void;
  closeModal: () => void;
  onRawDataChange: (key: string, value: string) => void;
}

const ScheduleModal: React.FC<ScheduleModalProps> = ({
  isOpen,
  modalMode,
  newStart,
  newEnd,
  newTitle,
  newBody,
  newLocation,
  newIsAllDay,
  newDueDateClass,
  rawData,
  setNewStart,
  setNewEnd,
  onSaveSchedule,
  onDeleteSchedule,
  closeModal,
  onRawDataChange,
}) => {
  const formatToKoreanTimeString = (date: Date): string => {
    if (!date) return "";
    date.setHours(date.getHours());
    let year = date.getFullYear();
    let month = ('0' + (date.getMonth() + 1)).slice(-2);
    let day = ('0' + date.getDate()).slice(-2);
    let hours = ('0' + date.getHours()).slice(-2);
    let minutes = ('0' + date.getMinutes()).slice(-2);
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  // ESC 키를 눌렀을 때 모달을 닫는 이벤트 핸들러 추가
  useEffect(() => {

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeModal();
      }
    };

    // 이벤트 리스너 등록
    document.addEventListener("keydown", handleKeyDown);

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [closeModal]);

  // useEffect(()=>{
  //       console.log({'newTitle':newTitle,'newBody':newBody})
  // })



  // 모달이 열리지 않았을 때 null을 반환
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
              value={newStart ? formatToKoreanTimeString(new Date(newStart)) : ""}
              onChange={(e) => setNewStart(new Date(e.target.value))}
            />
          </div>
          <div className="date-time-item">
            <label>종료일:</label>
            <input
              type="datetime-local"
              value={newEnd ? formatToKoreanTimeString(new Date(newEnd)) : ""}
              onChange={(e) => setNewEnd(new Date(e.target.value))}
            />
          </div>
        </div>

        <RawDataForm rawData={rawData} onRawDataChange={onRawDataChange} />

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
