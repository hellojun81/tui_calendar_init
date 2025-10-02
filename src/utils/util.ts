export const formatMoney = (amount: number): string => {
  return amount.toLocaleString('ko-KR', { style: 'currency', currency: 'KRW' });
}
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
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  console.log(`${year}-${month}-${day}`)
  return `${year}-${month}-${day}`;
};
