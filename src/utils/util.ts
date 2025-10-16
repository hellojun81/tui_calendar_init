export const formatMoney = (amount: number): string => {
  return amount.toLocaleString("ko-KR", { style: "currency", currency: "KRW" });
};
export const apiUrl = process.env.NODE_ENV === "production" ? process.env.REACT_APP_API_URL_PRODUCTION : process.env.REACT_APP_API_URL_LOCAL;

export const formatDate = (dateString?: string | Date): string | null => {
  // 1. 인자가 undefined 또는 null일 경우 명시적으로 처리
  if (dateString === undefined || dateString === null) {
    console.error("formatDate: dateString is undefined or null.");
    return null; // 또는 'Invalid Date' 같은 문자열 반환
  }

  const date = new Date(dateString);

  // 2. new Date()가 유효하지 않은 날짜를 반환할 경우 처리
  if (isNaN(date.getTime())) {
    console.error(`formatDate: Invalid date string received: ${dateString}`);
    return null;
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  // console.log(`${year}-${month}-${day}`)
  return `${year}-${month}-${day}`;
};

/**
 * 견적 금액(estPrice)을 정수형 문자열로 변환합니다.
 * @param estPrice - 견적 금액 (number | undefined)
 * @returns 정수형 문자열 ("100000")
 */
export const formatEstPriceToAmount = (estPrice: number | undefined): string => {
  return String(Math.round(estPrice || 0));
};

/**
 * 인원 문자열에서 숫자 부분만 추출합니다.
 * 예: "10인이하" -> "10", "20인" -> "20"
 * @param userInt - 인원 문자열 (string | undefined)
 * @returns 추출된 숫자 문자열 ("10")
 */
export const extractPersonnelNumber = (userInt: string | undefined): string => {
  const match = userInt?.match(/\d+/);
  return match ? match[0] : "";
};
export const formatRentPlaceForKakao = (rentPlace: string | undefined): string => {
  if (!rentPlace) {
    return "";
  }

  // 콤마로 분리하고 각 요소 뒤에 "층"을 붙여서 "+"로 다시 연결합니다.
  const floors = rentPlace.split(",").filter((f) => f.trim() !== "");

  // 각 층 번호에 "층"을 붙입니다. (예: "1" -> "1층")
  const formattedFloors = floors.map((floor) => `${floor.trim()}층`);

  // "+"로 연결합니다.
  return formattedFloors.join("+");
};
