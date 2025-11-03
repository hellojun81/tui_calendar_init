import React, { useState, useEffect } from "react";
import axios from "axios";
import { Row } from "antd";

const apiUrl = process.env.NODE_ENV === "production" ? process.env.REACT_APP_API_URL_PRODUCTION : process.env.REACT_APP_API_URL_LOCAL;
// 데이터 구조를 정의
interface CheckboxItem {
  id: string;
  title: string;
  calView: string;
}

interface CheckViewProps {
  reloadSchedule: (selectedIds: string[]) => void;
  currentMonth: number;
  currentYear: number;
}

const CheckView: React.FC<CheckViewProps> = ({ reloadSchedule, currentMonth, currentYear }) => {
  const currentMonthFormatted = String(currentMonth).padStart(2, "0");

  const [checkboxes, setCheckboxes] = useState<CheckboxItem[]>([]); // CheckboxItem[] 타입으로 지정
  const [selectedCheckboxes, setSelectedCheckboxes] = useState<string[]>([]);
  const [isInitialRender, setIsInitialRender] = useState(true);

  useEffect(() => {
    if (!isInitialRender) {
      UpdateCsKind(selectedCheckboxes);
    }
  }, [selectedCheckboxes, isInitialRender]);

  const UpdateCsKind = async (ids: string[]) => {
    const currentMonthFormatted = String(currentMonth).padStart(2, "0");
    try {
      const res = await axios.put(`${apiUrl}/api/schedules/getCsKind?update_ID=${ids.join(",")}&SearchMonth=${currentYear}-${currentMonthFormatted}`);
      reloadSchedule(ids);
      console.log("checkView", res);
    } catch (err) {
      console.error("Error updating CsKind:", err);
    }
  };
  useEffect(() => {
    const GetCsKind = async () => {
      try {
        const res = await axios.get(`${apiUrl}/api/schedules/getCsKind?SearchMonth=${currentYear}-${currentMonthFormatted}`);
        const data: CheckboxItem[] = res.data;
        setCheckboxes(data);
        // calView 값이 1인 항목들을 자동으로 선택
        const filteredIds = data.filter((item) => item.calView === "1").map((item) => item.id);
        setSelectedCheckboxes(filteredIds);
        // reloadSchedule(filteredIds);
        setIsInitialRender(false); // API 호출 후 최초 렌더링 완료로 설정
      } catch (err) {
        console.error("Error fetching schedules:", err);
      }
    };
    GetCsKind();
  }, [currentMonth, currentYear]);

  const handleCheckboxChange = (id: string) => {
    setSelectedCheckboxes((prev) => {
      if (prev.includes(id)) {
        return prev.filter((item) => item !== id);
      } else {
        return [...prev, id];
      }
    });
  };

  // 체크박스 렌더링
  return (
    <div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap", // Flexbox가 줄 바꿈되도록 설정
          verticalAlign: "center",
          fontSize: "0.9em",
          marginTop: "10px",
          gap: "5px",
        }}
      >
        {checkboxes.map((checkbox) => (
          <div key={checkbox.id}>
            <label>
              <input type="checkbox" checked={selectedCheckboxes.includes(checkbox.id)} onChange={() => handleCheckboxChange(checkbox.id)} />
              {checkbox.title}
            </label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CheckView;
