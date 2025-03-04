"use client"
import React, { useState, useEffect } from 'react';
interface GetplaceMoneyResult {
    place: number;
    placeOriginfee: number;
    overfee: number;
}

// let floor_fee_half = []
// let basic_fee = []

const Home: React.FC = () => {
    const [inputValues, setInputValues] = useState<string[]>(['', '']);
    const [floor_fee_half, setfloor_fee_half] = useState<number[]>([0, 0, 0, 0]);
    const [basic_fee, setbasic_fee] = useState<number[]>([0, 0, 0, 0]);
    const [phototype, setphototype] = useState<string>('1');
    const [floortype, setfloortype] = useState<string>('1');
    const [resultMsg, setresultMsg] = useState<string>('');
    const [useHour, setuseHour] = useState<number>(4);
    const [tmoney, setTmoney] = useState<number>(0);

    const [userCnt, setUserCnt] = useState<number>(5);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === "" || /^[0-9]+$/.test(value)) {
            setUserCnt(parseInt(value, 10));
        }
    };

    // const [disCountMoney, setdisCountMoney] = useState<number>(0);
    const [originTmoney, setOriginTmoney] = useState<number>(0);
    const [result, setResult] = useState<GetplaceMoneyResult | null>(null);
    const [selectedFloors, setSelectedFloors] = useState<string[]>([]);

    const floorOptions = [
        { value: "1", label: "1층_마당_별채" },
        { value: "2", label: "2층" },
        { value: "3", label: "3층" },
    ];

    const handleCheckboxChange = (value: string) => {
        setSelectedFloors((prev) =>
            prev.includes(value) ? prev.filter((item) => item !== value) : [...prev, value]
        );
    };


    const handleSelectChange1 = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setphototype(e.target.value);
    };


    const handleSelectChange3 = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const description = selectedOption.getAttribute('data-description');
        setuseHour(parseInt(e.target.value));
        if (description != null) {
            //   setuseHour2(parseInt(description));
        }
    };

    const GetplaceMoney = (phototype: string, floor: string):
        GetplaceMoneyResult => {
        let placeOriginfee = 0
        let place = 0
        let basicUser = 0
        let overUser = 0
        let overfee = 0

        switch (floor) {   ///묶음 할인가 적용
            case '1':   //1층+별채+마당
                placeOriginfee = 200000;
                place = 1
                basicUser = 10
                overUser = userCnt - basicUser;
                break;
            case '2':   //1층+2층
                placeOriginfee = 100000
                place = 2
                basicUser = 5
                overUser = userCnt - basicUser;

                break;
            case '3':   //1층+3층
                placeOriginfee = 100000
                place = 3
                basicUser = 5
                overUser = userCnt - basicUser;
                break;
        }
        overfee = (overUser * 5000) * useHour
        if (overfee < 0) { overfee = 0 }

        // console.log({ 'getplaceMoney': floor, 'userCnt': userCnt, 'overuser': overUser, 'overfee': overfee })
        return { place: place, placeOriginfee: placeOriginfee, overfee: overfee }
    };

    const formatMoney = (amount: number): string => {
        return amount.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW' });
    }
    const handleButtonClick = () => {
        let totalMoney = 0;
        let totalMsg = "";
    
        for (let i = 0; i < selectedFloors.length; i++) {
            let info = GetplaceMoney(phototype, selectedFloors[i]);
    
            let floortotalMoney = info.placeOriginfee * useHour + info.overfee;
            let result = `<p>${info.place}층 <span style="font-weight: bold;">정상가: ${formatMoney(floortotalMoney)}</span></p>`;
            
            totalMsg += result;
            totalMoney += floortotalMoney;
        }
    
        let discount10 = totalMoney * 0.9;
        let discount15 = totalMoney * 0.85;
        let discount20 = totalMoney * 0.8;
    
        if (selectedFloors.length > 1) {
            totalMsg += `
                <p style="color: black; font-weight: bold; font-size: 30px;">합계금: <span style="color: red;">${formatMoney(totalMoney)}</span></p>
                <p style="color: green;">10% 할인: <span style="font-weight: bold;">${formatMoney(discount10)}</span> | 시간당 금액: ${formatMoney(discount10 / useHour)}</p>
                <p style="color: orange;">15% 할인: <span style="font-weight: bold;">${formatMoney(discount15)}</span> | 시간당 금액: ${formatMoney(discount15 / useHour)}</p>
                <p style="color: red;">20% 할인: <span style="font-weight: bold;">${formatMoney(discount20)}</span> | 시간당 금액: ${formatMoney(discount20 / useHour)}</p>
            `;
        } else {
            totalMsg += `<p style="font-weight: bold;">합계금: <span style="color: red;">${formatMoney(totalMoney)}</span> | 시간당 금액: ${formatMoney(totalMoney / useHour)}</p>`;
        }
    
        setresultMsg(totalMsg);
    };
    

  

    function roundUpToTenThousand(won: number): number {
        return Math.ceil(won / 50000) * 50000;
    }

    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h1>AUBESTUDIO NEW PRICE</h1>
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="photo-video-select">촬영구분</label>
                <select
                    id="photo-video-select"
                    value={phototype}
                    onChange={handleSelectChange1}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                    <option value="1">사진</option>
                    <option value="2">영상</option>
                </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
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
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="location-select">이용시간</label>
                <select
                    id="location-select"
                    value={useHour}
                    onChange={handleSelectChange3}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                    <option value='4' data-description='4'>4시간(BASIC)</option>
                    <option value='5' data-description='5'>5시간</option>
                    <option value='6' data-description='6'>6시간</option>
                    <option value='7' data-description='7'>7시간</option>
                    <option value='8' data-description='8'>8시간</option>
                    <option value='9' data-description='9'>9시간</option>
                    <option value='10' data-description='10'>10시간</option>
                    <option value='11' data-description='11'>11시간</option>
                    <option value='12' data-description='12'>12시간</option>

                </select>
            </div>
            <div style={{ marginBottom: "20px" }}>
                <label htmlFor="user-count-input">총인원수</label>
                <input
                    id="user-count-input"
                    type="number"
                    value={userCnt}
                    onChange={handleInputChange}
                    placeholder="총인원수를 입력하세요"
                    min={1} // 최소값 설정
                    max={1000} // 최대값 설정 (필요 시 조정)
                    style={{ width: "100%", padding: "8px", boxSizing: "border-box" }}
                />
            </div>

            {/* <h1>견적가:{formatMoney(originTmoney)}원</h1> */}
            {/* <h1>시간당금액:{formatMoney(tmoney / useHour)}원</h1> */}
            {/* <p style={{ whiteSpace: "pre-line" }}>{resultMsg}</p> */}
            <div dangerouslySetInnerHTML={{ __html: resultMsg }} />

            <button onClick={handleButtonClick} style={{ padding: '10px 20px' }}>
                계산
            </button>
        </div>
    );
};

export default Home;
