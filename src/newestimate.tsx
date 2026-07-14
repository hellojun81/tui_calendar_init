import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Select, Button, message } from "antd";
import { priceTable, PriceTable } from "./utils/priceTable";

const { Option } = Select;

type FloorKey = keyof PriceTable;

// 사진/영상 시간(시간 단위)
const hourTimes: number[] = [4, 5, 6, 7, 8, 9, 10, 11, 12];

// priceTable(구간 키)와 100% 일치
const peopleOptions = [
  10,
  ...Array.from({ length: 10 }, (_, i) => i + 11), // 11~20
  "21~25",
  "26~30",
  "31~40",
  "41~50",
  "51~60",
  "61~70",
  "71~80",
  "81~90",
  "91~",
] as const;
type PeopleOption = typeof peopleOptions[number];

// 촬영 구분
type ShootType =
  | "photo"
  | "video"
  | "eventCommercial"
  | "eventNonCommercial"
  | "student";

const shootTypeOptions = [
  { value: "photo", label: "사진" },
  { value: "video", label: "영상" },
  { value: "eventCommercial", label: "행사(상업)" },
  { value: "eventNonCommercial", label: "행사(비상업)" },
  { value: "student", label: "학생(졸업전시)" },
] as const;

// 행사 기간 옵션
type EventDurationKey = "1일" | "1주일" | "2주일" | "3주일" | "한달";
const allEventDurations: EventDurationKey[] = ["1일", "1주일", "2주일", "3주일", "한달"];

const floorLabelMap: Record<FloorKey, string> = {
  floor1: "1층",
  floor2: "2층",
  floor3: "3층",
  floor1_2_3: "1+2층",
  all: "전체",
};

const floors: FloorKey[] = ["floor1", "floor2", "floor3", "floor1_2_3", "all"];

/* ================= 행사 요금표 =================
   1일 12시간 기준, 단위: 만원
*/

// 상업행사
const eventCommercialTable: Partial<Record<FloorKey, Partial<Record<EventDurationKey, number>>>> = {
  all: { "1일": 700, "1주일": 4000, "2주일": 6000, "3주일": 7000, "한달": 8000 },
  floor1_2_3: { "1일": 650, "1주일": 3700, "2주일": 5550, "3주일": 6475, "한달": 7400 },
  floor1: { "1일": 600, "1주일": 3400, "2주일": 5100, "3주일": 5950, "한달": 6800 },
};

// 비상업행사(문화전시)
const eventNonCommercialTable: Partial<Record<FloorKey, Partial<Record<EventDurationKey, number>>>> = {
  all: { "1일": 500, "1주일": 3000, "2주일": 5000, "3주일": 6000, "한달": 7000 },
};

// 학생 졸업전시
const studentTable: Partial<Record<FloorKey, Partial<Record<EventDurationKey, number>>>> = {
  all: { "1일": 300 },
};

const getDurationOptions = (shootType: ShootType): EventDurationKey[] => {
  if (shootType === "student") return ["1일"];
  return allEventDurations;
};

const PriceCalculator: React.FC = () => {
  const [floor, setFloor] = useState<FloorKey>("floor1");
  const [time, setTime] = useState<number>(4);
  const [eventDuration, setEventDuration] = useState<EventDurationKey>("1일");
  const [people, setPeople] = useState<PeopleOption>(10);
  const [shootType, setShootType] = useState<ShootType>("photo");
  const [price, setPrice] = useState<number>(0);

  const isEventType =
    shootType === "eventCommercial" ||
    shootType === "eventNonCommercial" ||
    shootType === "student";

  const durationOptions = useMemo(() => getDurationOptions(shootType), [shootType]);

  const isOver50 =
    typeof people !== "number" &&
    (people === "51~60" ||
      people === "61~70" ||
      people === "71~80" ||
      people === "81~90" ||
      people === "91~");

  const calculatePrice = useCallback(() => {
    let finalPrice = 0;



    if (!isEventType) {
      // ===== 사진 / 영상 =====
      let base = 0;

      if (typeof people === "number") {
        base = priceTable[floor][String(people)]?.[time] ?? 0;
      } else {
        base = priceTable[floor][people]?.[time] ?? 0;
      }

      // 영상은 사진 가격의 10% 추가 (단, 50명 이상은 1.1배 적용 안함)
      finalPrice = shootType === "video" ? Math.round(base * 1.1) : base;
    } else {
      // ===== 행사(상업/비상업) / 학생 =====
      let table:
        | typeof eventCommercialTable
        | typeof eventNonCommercialTable
        | typeof studentTable;

      if (shootType === "eventCommercial") table = eventCommercialTable;
      else if (shootType === "eventNonCommercial") table = eventNonCommercialTable;
      else table = studentTable;

      finalPrice = table[floor]?.[eventDuration] ?? 0;
    }

    setPrice(finalPrice);
  }, [eventDuration, floor, isEventType, isOver50, people, shootType, time]);

  // ✅ 옵션 변경 시 자동 계산
  useEffect(() => {
    calculatePrice();
  }, [calculatePrice]);

  const handleShootTypeChange = (value: ShootType) => {
    setShootType(value);

    // ✅ 행사 타입으로 바꿀 때: 기간 UI로 자동 전환 + 기간 1일 자동 적용
    if (value === "eventCommercial" || value === "eventNonCommercial" || value === "student") {
      setEventDuration("1일");
    }
    // (useEffect가 다음 렌더에서 자동 계산)
  };

  return (
    <div style={{ padding: 20, maxWidth: 420 }}>
      <h2>스튜디오 가격 계산기</h2>

      {/* 촬영 구분 */}
      <div style={{ marginBottom: 10 }}>
        <label>촬영 구분: </label>
        <Select
          value={shootType}
          onChange={(value) => handleShootTypeChange(value as ShootType)}
          style={{ width: "100%" }}
        >
          {shootTypeOptions.map((o) => (
            <Option key={o.value} value={o.value}>
              {o.label}
            </Option>
          ))}
        </Select>
      </div>

      {/* 층 선택 */}
      <div style={{ marginBottom: 10 }}>
        <label>층 선택: </label>
        <Select value={floor} onChange={setFloor} style={{ width: "100%" }}>
          {floors.map((f) => (
            <Option key={f} value={f}>
              {floorLabelMap[f]}
            </Option>
          ))}
        </Select>
      </div>

      {/* 시간 / 기간 선택 */}
      <div style={{ marginBottom: 10 }}>
        <label>{isEventType ? "기간 선택:" : "시간 선택:"} </label>
        {isEventType ? (
          <Select value={eventDuration} onChange={(v) => setEventDuration(v as EventDurationKey)} style={{ width: "100%" }}>
            {durationOptions.map((d) => (
              <Option key={d} value={d}>
                {d}
              </Option>
            ))}
          </Select>
        ) : (
          <Select value={time} onChange={setTime} style={{ width: "100%" }}>
            {hourTimes.map((t) => (
              <Option key={t} value={t}>
                {t}시간
              </Option>
            ))}
          </Select>
        )}
      </div>

      {/* 인원 선택 (행사/학생은 인원 무관이므로 disabled) */}
      <div style={{ marginBottom: 10 }}>
        <label>인원 선택: </label>
        <Select value={people} onChange={(v) => setPeople(v as PeopleOption)} style={{ width: "100%" }} disabled={isEventType}>
          {peopleOptions.map((p) => (
            <Option key={String(p)} value={p as any}>
              {typeof p === "number" ? `${p}명` : p}
            </Option>
          ))}
        </Select>
      </div>

      {/* 자동계산이므로 버튼은 선택 사항 (유지해도 무방) */}
      <Button onClick={calculatePrice} style={{ marginTop: 10 }}>
        수동 재계산
      </Button>

      <div style={{ marginTop: 20, fontSize: 18 }}>
        {isEventType ? (
          <>
            총 가격: <strong>{price.toLocaleString()} 만원</strong>
          </>
        ) : (
          <>
            총 가격: <strong>{price.toLocaleString()} 만원</strong>
            <br />
            시간당 금액: <strong>{(price / time).toLocaleString()} 만원 / 시간</strong>
          </>
        )}
      </div>
    </div>
  );
};

export default PriceCalculator;
