import React from "react";

interface JexcelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (value: string) => void;
}

const JexcelModal: React.FC<JexcelModalProps> = ({
  isOpen,
  onClose,
  onSelect,
}) => {
  if (!isOpen) return null;

  const handleSelect = (value: string) => {
    onSelect(value);
  };

  return (
    <div className="jexcel-modal">
      <div className="modal-content">
        <h2>Select Company</h2>
        {/* Jexcel component or any list of companies */}
        <button onClick={() => handleSelect("Company Name")}>
          Select this Company
        </button>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default JexcelModal;
