"use client"
import React, { useState, useEffect } from 'react';
interface GetplaceMoneyResult {
    place: number;
    placeOriginfee: number;
    discountMoney: number;
}

// let floor_fee_half = []
// let basic_fee = []

const Home: React.FC = () => {
    const [inputValues, setInputValues] = useState<string[]>(['', '']);
    const [floor_fee_half, setfloor_fee_half] = useState<number[]>([0, 0, 0, 0]);
    const [basic_fee, setbasic_fee] = useState<number[]>([0, 0, 0, 0]);
    const [phototype, setphototype] = useState<string>('1');
    const [floortype, setfloortype] = useState<string>('1');
    const [userCnt, setuserCnt] = useState<string>('10');
    const [useHour, setuseHour] = useState<number>(4);
    const [tmoney, setTmoney] = useState<number>(0);
    const [UserCnt, setUserCnt] = useState<number>(0);
    // const [disCountMoney, setdisCountMoney] = useState<number>(0);
    const [originTmoney, setOriginTmoney] = useState<number>(0);
    const [result, setResult] = useState<GetplaceMoneyResult | null>(null);
    basic_fee[0] = 40000;
    basic_fee[1] = 210000;
    basic_fee[2] = 140000;
    basic_fee[3] = 140000;
    floor_fee_half[0] = 50000
    floor_fee_half[1] = 300000
    floor_fee_half[2] = 200000
    floor_fee_half[3] = 200000
    // useEffect(() => {
    //     console.log('disCountMoney', disCountMoney);
    //     setTmoney(tmoney-disCountMoney)
    // }, [disCountMoney]);



    const handleChange = (index: number) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const newValues = [...inputValues];
        newValues[index] = e.target.value;
        setInputValues(newValues);
    };

    const handleSelectChange1 = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setphototype(e.target.value);
    };

    const handleSelectChange2 = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setfloortype(e.target.value);
    };
    const handleSelectChange3 = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedOption = e.target.options[e.target.selectedIndex];
        const description = selectedOption.getAttribute('data-description');
        setuseHour(parseInt(e.target.value));
        if (description != null) {
            //   setuseHour2(parseInt(description));
        }
    };
    const handleSelectChange4 = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setuserCnt(e.target.value);
    };

    const GetUserFee = (phototype: string, usersCnt: number, useHour: number): number => {
        let UsersFee = 0
        if (usersCnt <= 10) {
            usersCnt = 0
            UsersFee = 0
        }
        if (usersCnt > 10 && usersCnt <= 15) {
            UsersFee = 250000
        }
        if (usersCnt > 15 && usersCnt <= 20) {
            UsersFee = 500000
        }
        if (usersCnt > 20 && usersCnt <= 25) {
            UsersFee = 750000
        }
        if (usersCnt > 25 && usersCnt <= 30) {
            UsersFee = 1000000
        }
        if (usersCnt >= 31) {
            UsersFee = 1500000
        }
        if (usersCnt >= 51) {
            UsersFee = 1750000
        }
        if (usersCnt >= 100) {
            UsersFee = 2500000
        }
        console.log('GetUserFee', UsersFee)
        return UsersFee;
    }


    const GetplaceMoney = (phototype: string, floor_fee: number[], useHour: number, floor: string, basic_fee: number[],):
        GetplaceMoneyResult => {
        let placeOriginfee = 0
        let place = 0
        let discountMoney = 0
        if (useHour >= 9) {
            place = basic_fee[parseInt(floortype)];
        } else {
            place = floor_fee[parseInt(floortype)];
        }
        let arr = []
        if (useHour >= 9) {
            arr = basic_fee
        } else {
            arr = floor_fee
        }
        placeOriginfee = basic_fee[parseInt(floortype)]
        switch (floortype) {   ///묶음 할인가 적용
            case '4':   //1층+별채
                place = arr[1] + arr[0];
                placeOriginfee = basic_fee[1] + basic_fee[0];
                discountMoney = 0
                break;
            case '5':   //1층+2층
                place = arr[1] + arr[2];
                placeOriginfee = basic_fee[1] + basic_fee[2];
                if (useHour >= 9) { discountMoney = 500000 } else { discountMoney = 300000 }
                break;
            case '6':   //1층+3층
                place = arr[1] + arr[3]
                placeOriginfee = basic_fee[1] + basic_fee[3];
                if (useHour >= 9) { discountMoney = 500000 } else { discountMoney = 300000 }
                break;
            case '7':   //2층+3층
                place = arr[2] + arr[3];
                placeOriginfee = basic_fee[2] + basic_fee[3];
                if (useHour >= 9) { discountMoney = 700000 } else { discountMoney = 400000 }
                break;
            case '8':   //1층+2층+별채
                place = arr[1] + arr[2] + arr[0];
                placeOriginfee = basic_fee[1] + basic_fee[2] + basic_fee[0];
                if (useHour >= 9) { discountMoney = 500000 } else { discountMoney = 300000 }
                break;
            case '9':   //1층+3층+별채
                place = arr[1] + arr[3] + arr[0];
                placeOriginfee = basic_fee[1] + basic_fee[3] + basic_fee[0];
                if (useHour >= 9) { discountMoney = 500000 } else { discountMoney = 300000 }
                break;
            case '10':   //ALL
                place = arr[1] + arr[2] + arr[3] + arr[0];
                placeOriginfee = basic_fee[1] + basic_fee[2] + basic_fee[3] + basic_fee[0];
                if (useHour >= 9) { discountMoney = 1200000 } else { discountMoney = 500000 }
                break;
        }




        return { place: place, placeOriginfee: placeOriginfee, discountMoney: discountMoney }
    };

    const formatMoney = (amount: number): string => {
        return amount.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW' });
    }

    const handleButtonClick = () => {
        let users = parseInt(userCnt)
        setUserCnt(users)
        let usersfee = GetUserFee(phototype, users, useHour)
        const getresult = GetplaceMoney(phototype, floor_fee_half, useHour, floortype, basic_fee);
        setResult(getresult);
        let GetPlaceMoney = getresult?.place ?? 0;
        let GetOriginPlaceMoney = getresult?.placeOriginfee ?? 0;
        let discountMoney = getresult?.discountMoney ?? 0;
        setTmoney(tmoney)
        console.log({ 'tMoney2': tmoney, 'useHour': useHour })
        let tMoney2 = (tmoney) * useHour
        setTmoney((GetPlaceMoney * useHour) + usersfee)
        let totalMoney = 0
        let overTime = 0
        if (useHour > 4) {
            overTime = useHour - 4
            totalMoney = (GetOriginPlaceMoney * overTime)
        }
        if (useHour >= 9) {
            GetPlaceMoney = GetOriginPlaceMoney
        }
     

        totalMoney = (totalMoney + (GetPlaceMoney * (useHour - overTime)) + usersfee)



        let photoyypefee=300000
        if (useHour >= 9) {
            photoyypefee = 500000
        }
        // if(UserCnt>=31){
        //     photoyypefee=photoyypefee+500000
        // }if(UserCnt>=51){
        //     photoyypefee=photoyypefee+1000000
        // }if(UserCnt>=100){
        //     photoyypefee=photoyypefee+1500000
        // }

        console.log({
            '오버타임': overTime, '오버타임사용료': totalMoney,
            '렌탈장소':floortype, '4시간_기본사용료': GetPlaceMoney, 사용시간: useHour,
            '총인원수추가요금': usersfee, '9시간_기본사용료': GetOriginPlaceMoney,
            '총사용인원': users, '촬영구분': phototype,'영상촬영추가요금':photoyypefee,
            '할인금액': discountMoney,
            '반올림전 금액':totalMoney
        })

        totalMoney = roundUpToTenThousand(totalMoney);
        if (phototype === '1') {
            setTmoney(totalMoney - discountMoney)
        } else {
            setTmoney(totalMoney - discountMoney + photoyypefee)
        }
    };

    function roundUpToTenThousand(won: number): number {
        return Math.ceil(won / 50000) * 50000;
    }
    



    return (
        <div style={{ padding: '20px', maxWidth: '400px', margin: 'auto' }}>
            <h1>AUBESTUDIO PRICE</h1>
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
                <label htmlFor="location-select">렌탈장소</label>
                <select
                    id="location-select"
                    value={floortype}
                    onChange={handleSelectChange2}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                    <option value="1">1층</option>
                    <option value="2">2층</option>
                    <option value="3">3층</option>
                    <option value="0">별채</option>
                    <option value="4">1층+별채</option>
                    <option value="5">1층+2층</option>
                    <option value="6">1층+3층</option>
                    <option value="7">2층+3층</option>
                    <option value="8">1층+2층+별채</option>
                    <option value="9">1층+3층+별채</option>
                    <option value="10">ALL</option>
                </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="location-select">이용시간</label>
                <select
                    id="location-select"
                    value={useHour}
                    onChange={handleSelectChange3}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                    <option value='4' data-description='4'>4시간(HALF)</option>
                    <option value='5' data-description='5'>5시간</option>
                    <option value='6' data-description='6'>6시간</option>
                    <option value='7' data-description='7'>7시간</option>
                    <option value='8' data-description='8'>8시간</option>
                    <option value='9' data-description='9'>9시간(ALL)</option>
                </select>
            </div>
            <div style={{ marginBottom: '20px' }}>
                <label htmlFor="location-select">총인원수</label>
                <select
                    id="location-select"
                    value={userCnt}
                    onChange={handleSelectChange4}
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                    <option value={10}>10인이하</option>
                    <option value={11}>11~15인</option>
                    <option value={16}>16~20인</option>
                    <option value={21}>21~25인</option>
                    <option value={26}>26~30인</option>
                    <option value={31}>31인 이상</option>
                    {/* <option value={51}>50~80인</option>
                    <option value={100}>100이상</option> */}
           
                    {/* <option value={40}>40~50인</option>
          <option value={50}>50인이상</option> */}
                </select>
            </div>

            {/* <h1>견적가:{formatMoney(originTmoney)}원</h1> */}
            <h1>할인가:{formatMoney(tmoney)}원</h1>
            <h1>시간당금액:{formatMoney(tmoney / useHour)}원</h1>
            <button onClick={handleButtonClick} style={{ padding: '10px 20px' }}>
                계산
            </button>
        </div>
    );
};

export default Home;
