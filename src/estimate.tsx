"use client";
import React, { useState } from "react";

interface GetplaceMoneyResult {
  place: number;
  placeOriginfee: number;
  overfee: number;
}

/** ✅ 리터럴 타입으로 고정 */
type Duration = 168 | 336 | 504 | 720;
type FloorKey = "1" | "2" | "3";
type Pricing = { total: number } & Record<FloorKey, number>;

/** ✅ 명시적 타입 지정 */
const eventPricing: Record<Duration, Pricing> = {
  168: { total: 4000, "1": 3400, "2": 300, "3": 300 },
  336: { total: 6000, "1": 5100, "2": 450, "3": 450 },
  504: { total: 7000, "1": 5950, "2": 525, "3": 525 },
  720: { total: 8000, "1": 6800, "2": 600, "3": 600 },
};

const Home: React.FC = () => {
  const [phototype, setphototype] = useState<string>("1");
  const [useHour, setuseHour] = useState<number>(4);
  const [userCnt, setUserCnt] = useState<number>(5);
  const [selectedFloors, setSelectedFloors] = useState<FloorKey[]>([]);
  const [resultMsg, setresultMsg] = useState<string>("");

  const floorOptions = [
    { value: "1", label: "1층_마당_별채" },
    { value: "2", label: "2층" },
    { value: "3", label: "3층" },
  ] as const;

  const handleCheckboxChange = (value: FloorKey) => {
    setSelectedFloors((prev) => (prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]));
  };

  const handleSelectChange1 = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const v = e.target.value;
    setphototype(v);
    setresultMsg("");
    if (v === "3") {
      setuseHour(168);
    } else {
      setuseHour(4);
    }
  };

  const handleSelectChange3 = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setuseHour(parseInt(e.target.value, 10));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || /^[0-9]+$/.test(value)) {
      setUserCnt(value === "" ? 0 : parseInt(value, 10));
    }
  };

  /** ✅ floor를 FloorKey로, duration 인덱싱을 Duration으로 고정 */
  const GetplaceMoney = (phototype: string, floor: FloorKey): GetplaceMoneyResult => {
    if (phototype === "3") {
      const pricing = eventPricing[useHour as Duration];
      const price = pricing[floor]; // 타입 안전
      return {
        place: parseInt(floor, 10),
        placeOriginfee: price * 1000, // 만원 → 원
        overfee: 0,
      };
    }

    let placeOriginfee = 0;
    let basicUser = 0;
    let overUser = 0;
    let place = parseInt(floor, 10);

    switch (floor) {
      case "1":
        placeOriginfee = 200000;
        basicUser = 10;
        break;
      case "2":
        placeOriginfee = 100000;
        basicUser = 5;
        break;
      case "3":
        placeOriginfee = 100000;
        basicUser = 5;
        break;
    }
    overUser = userCnt - basicUser;
    const overfee = Math.max(0, overUser * 5000 * useHour);

    return { place, placeOriginfee, overfee };
  };

  const formatMoney = (amount: number): string => amount.toLocaleString("ko-KR", { style: "currency", currency: "KRW" });

  const handleButtonClick = () => {
    let totalMoney = 0;
    let totalMsg = "";

    for (const floor of selectedFloors) {
      const info = GetplaceMoney(phototype, floor);

      let floortotalMoney = 0;
      switch (phototype) {
        case "3":
          // 행사: 총액 기준. (원 코드의 *10은 유지하되 필요 시 조정)
          floortotalMoney = info.placeOriginfee * 10;
          break;
        case "2":
          floortotalMoney = (info.placeOriginfee * useHour + info.overfee) * 1.1;
          break;
        default:
          floortotalMoney = info.placeOriginfee * useHour + info.overfee;
      }

      totalMsg += `<p>${info.place}층 <span style="font-weight: bold;">정상가: ${formatMoney(floortotalMoney)}</span></p>`;
      totalMoney += floortotalMoney;
    }

    const discount10 = totalMoney * 0.9;
    const discount15 = totalMoney * 0.85;
    const discount20 = totalMoney * 0.8;

    if (selectedFloors.length > 1) {
      totalMsg += `
        <p style="color: black; font-weight: bold; font-size: 30px;">합계금: <span style="color: red;">${formatMoney(totalMoney)}</span></p>
        <p style="color: green;">10% 할인: <span style="font-weight: bold;">${formatMoney(discount10)}</span> | 시간당 금액: ${formatMoney(
        discount10 / useHour
      )}</p>
        <p style="color: orange;">15% 할인: <span style="font-weight: bold;">${formatMoney(discount15)}</span> | 시간당 금액: ${formatMoney(
        discount15 / useHour
      )}</p>
        <p style="color: red;">20% 할인: <span style="font-weight: bold;">${formatMoney(discount20)}</span> | 시간당 금액: ${formatMoney(
        discount20 / useHour
      )}</p>
      `;
    } else {
      totalMsg += `<p style="font-weight: bold;">합계금: <span style="color: red;">${formatMoney(totalMoney)}</span> | 시간당 금액: ${formatMoney(
        totalMoney / useHour
      )}</p>`;
    }

    setresultMsg(totalMsg);
  };

  return (
    <div style={{ padding: "20px", maxWidth: "400px", margin: "auto" }}>
      <h1>AUBESTUDIO NEW PRICE</h1>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="photo-video-select">구분</label>
        <select id="photo-video-select" value={phototype} onChange={handleSelectChange1} style={{ width: "100%", padding: "8px" }}>
          <option value="1">사진</option>
          <option value="2">영상</option>
          <option value="3">행사</option>
        </select>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <div>
          <label>렌탈장소</label>
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            {floorOptions.map((floor) => (
              <label key={floor.value} style={{ display: "flex", alignItems: "center" }}>
                <input
                  type="checkbox"
                  value={floor.value}
                  checked={selectedFloors.includes(floor.value)}
                  onChange={() => handleCheckboxChange(floor.value)}
                />
                {floor.label}
              </label>
            ))}
          </div>
          <p>선택된 층: {selectedFloors.length > 0 ? selectedFloors.join(", ") : "없음"}</p>
        </div>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="location-select">{phototype === "3" ? "이용기간" : "이용시간"}</label>
        {phototype === "3" ? (
          <select
            id="location-select"
            value={useHour}
            onChange={(e) => setuseHour(parseInt(e.target.value, 10))}
            style={{ width: "100%", padding: "8px" }}
          >
            <option value="168">1주일</option>
            <option value="336">2주일</option>
            <option value="504">3주일</option>
            <option value="720">한달</option>
          </select>
        ) : (
          <select id="location-select" value={useHour} onChange={handleSelectChange3} style={{ width: "100%", padding: "8px" }}>
            <option value="4">4시간(BASIC)</option>
            <option value="5">5시간</option>
            <option value="6">6시간</option>
            <option value="7">7시간</option>
            <option value="8">8시간</option>
            <option value="9">9시간</option>
            <option value="10">10시간</option>
            <option value="11">11시간</option>
            <option value="12">12시간</option>
          </select>
        )}
      </div>

      <div style={{ marginBottom: "20px" }}>
        <label htmlFor="user-count-input">총인원수</label>
        <input
          id="user-count-input"
          type="number"
          value={userCnt}
          onChange={handleInputChange}
          min={1}
          max={1000}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      <div dangerouslySetInnerHTML={{ __html: resultMsg }} />

      <button onClick={handleButtonClick} style={{ padding: "10px 20px" }}>
        계산
      </button>
    </div>
  );
};

export default Home;
