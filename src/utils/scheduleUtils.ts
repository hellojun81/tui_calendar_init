import axios from 'axios';
import dayjs from 'dayjs';
const apiUrl =
  process.env.NODE_ENV === 'production'
    ? process.env.REACT_APP_API_URL_PRODUCTION
    : process.env.REACT_APP_API_URL_LOCAL;

export interface ISchedule {
  id?: string;
  calendarId?: string;
  title?: string;
  body?: string;
  start?: Date;
  end?: Date;
  goingDuration?: number;
  comingDuration?: number;
  category?: string;
  attendees?: string[];
  recurrenceRule?: string;
  isPending?: boolean;
  isFocused?: boolean;
  isVisible?: boolean;
  isReadOnly?: boolean;
  isPrivate?: boolean;
  color?: string;
  bgcolor?: string;
  dragBgColor?: string;
  borderColor?: string;
  customStyle?: string;
  rentPlace?: string;
  state?: string;
  customerName?: string;
  gubun?: string;
  userInt?: string;
  estPrice?: number;
  etc?: string;
  csKind?: number;
  customerEtc?: string;
  contactPerson?: string;
  // created_at: Date;
  startTime?: string;
  endTime?: string;
  created_at?: Date;
  cskindTitle?: string;
}

export interface ScheduleModalProps {
  isOpen: boolean;
  modalMode: "create" | "edit";
  id: number;
  newStart: Date | undefined;
  newEnd: Date | undefined;
  newTitle: string;
  customerName: string;
  rentPlace: string;
  etc: string;
  gubun?: string;
  userInt?: string;
  estPrice?: number;
  csKind?: number;
  startTime?: string;
  endTime?: string;
  customerEtc?: string;
  contactPerson?: string;
  setNewStart: (date: Date | undefined) => void;
  setNewEnd: (date: Date | undefined) => void;
  onSaveSchedule: () => void;
  onDeleteSchedule: (id: number) => void;
  closeModal: () => void;
  setNewTitle: (title: string) => void;
  setCustomerName: (text: string) => void;
  setRentPlace: (text: string) => void;
  // openJexcelModal: (customerName: string) => void;
  setGubun: (text: string) => void;
  setUserInt: (text: string) => void;
  setEtc: (text: string) => void;
  setEstprice: (text: number) => void;
  setCsKind: (text: number) => void;
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
  setCustomerEtc: (text: string) => void;
  setContactPerson: (text: string) => void;
}

export const openModalUtil = (
  mode: "create" | "edit",
  scheduleData: ISchedule | null,
  setModalMode: (mode: "create" | "edit") => void,
  setCurrentSchedule: (schedule: ISchedule | null) => void,
  setNewStart: (date: Date | undefined) => void,
  setNewEnd: (date: Date | undefined) => void,
  setStartTime: (time: string) => void,
  setEndTime: (time: string) => void,
  setNewTitle: (title: string) => void,
  setCustomerName: (name: string) => void,
  setRentPlace: (place: string) => void,
  setGubun: (gubun: string) => void,
  setUserInt: (userInt: string) => void,
  setEstprice: (price: number) => void,
  setId: (id: number) => void,
  setEtc: (etc: string) => void,
  setIsModalOpen: (isOpen: boolean) => void,
  setCsKind: (csKind: number) => void,
  setCustomerEtc: (CustomerEtc: string) => void,
  setContactPerson: (ContactPerson: string) => void,
) => {
  setModalMode(mode);

  if (mode === "create") {
    // create 모드일 경우 모든 값을 초기화
    setCurrentSchedule(null);
    setNewStart(scheduleData ? new Date(dayjs(scheduleData.start).format('YYYY-MM-DD')) : undefined);
    setNewEnd(scheduleData ? new Date(dayjs(scheduleData.end).format('YYYY-MM-DD')) : undefined);
    setStartTime('00:00');
    setEndTime('00:00');
    setNewTitle('');
    setCustomerName("");
    setRentPlace("");
    setGubun("사진");
    setUserInt("10인이하");
    setEstprice(0);
    setId(0);
    setEtc("");
    setCsKind(1)
    setCustomerEtc("")
    setContactPerson("")
  } else if (mode === "edit" && scheduleData) {
    // edit 모드일 경우 scheduleData 값을 사용
    setCurrentSchedule(scheduleData);
    setNewStart(new Date(dayjs(scheduleData.start).format('YYYY-MM-DD')));
    setNewEnd(new Date(dayjs(scheduleData.end).format('YYYY-MM-DD')));
    setStartTime(scheduleData.startTime || '00:00');
    setEndTime(scheduleData.endTime || '00:00');
    setNewTitle(scheduleData.title || "");
    setCustomerName(scheduleData.customerName || "");
    setRentPlace(scheduleData.rentPlace ? scheduleData.rentPlace : "");
    // setRentPlace(scheduleData.rentPlace ? scheduleData.rentPlace : "");
    setGubun(scheduleData.gubun || "");
    setUserInt(scheduleData.userInt || "");
    setEstprice(scheduleData.estPrice || 0);
    // setId(scheduleData.id || 0);
    setId(Number(scheduleData.id) || 0);
    setEtc(scheduleData.etc || "");
    setCsKind(scheduleData.csKind || 1);
    setCustomerEtc(scheduleData.customerEtc || "")
    setContactPerson(scheduleData.contactPerson || "")
  }
  // console.log('scheduleData.csKind',scheduleData?.csKind)
  // console.log({'scheduleData':scheduleData})
  setIsModalOpen(true);
};

export const openJexcelModalUtil = (
  customerName: string,
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>,
  setIsJexcelModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  console.log('openJexcelModal', customerName);
  setSearchQuery(customerName);
  setIsJexcelModalOpen(true);
};

export const closeModalUtil = (
  setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setCurrentSchedule: React.Dispatch<React.SetStateAction<ISchedule | null>>
) => {
  setIsModalOpen(false);
  setCurrentSchedule(null);
};

export const saveSchedule = async (
  csKind: number,
  newTitle: string,
  Start: Date | undefined,
  end: Date | undefined,
  startTime: string,
  endTime: string,
  customerName: string,
  rentPlace: string,
  modalMode: string,
  currentSchedule: ISchedule | null,
  gubun: string,
  userInt: string,
  estPrice: number,
  etc: string,
  setSchedules: Function,
  closeModal: Function,
) => {
  const newSchedule: ISchedule = {
    id: currentSchedule?.id || String(Math.random()),
    calendarId: "1",
    title: newTitle,
    start: dayjs(Start).format('YYYY-MM-DD') ? new Date(dayjs(Start).format('YYYY-MM-DD')) : undefined,
    end: dayjs(end).format('YYYY-MM-DD') ? new Date(dayjs(end).format('YYYY-MM-DD')) : undefined,
    startTime,
    endTime,
    customerName,
    rentPlace,
    estPrice: Number(estPrice),
    userInt,
    gubun,
    etc,
    csKind,
  };

  // console.log('csKind',csKind)
  newSchedule.start = new Date(dayjs(newSchedule.start).format('YYYY-MM-DD'));
  newSchedule.end = new Date(dayjs(newSchedule.end).format('YYYY-MM-DD'));

  // newSchedule.start = dayjs(newSchedule.start).format('YYYY-MM-DD');  
  // newSchedule.end = dayjs(newSchedule.end).format('YYYY-MM-DD');  

  console.log({ 'save newSchedule': newSchedule });
  try {
    let result
    if (modalMode === "create") {
      console.log('NEW SCHEDULE CREATE')
      result = await axios.post(`${apiUrl}/api/schedules`, newSchedule);

    } else {
      console.log('SCHEDULE EDIT')
      // console.log({'EditMode newSchedule':newSchedule});
      result = await axios.put(`${apiUrl}/api/schedules/${currentSchedule?.id}`, newSchedule);
    }
    console.log('saveScheduleResult=', result)

    setSchedules((prev: ISchedule[]) => (
      modalMode === "edit" && currentSchedule
        ? prev.map(s => (s.id === currentSchedule.id ? newSchedule : s))
        : [...prev, newSchedule]
    ));
    closeModal();

  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response && err.response.status === 409) {
        // 409 Conflict 처리
        alert(err.response.data.message);  // 사용자에게 메시지 표시
      }
    } else {
      // Axios 에러가 아닌 경우 처리
      console.error('예상치 못한 에러:', err);
    }
  }
};

// export const getCurrentDate = (daysOffset: number = 365) => {
//   const currentDate = new Date();
//   const startDate = new Date();
//   startDate.setDate(currentDate.getDate() - daysOffset);
//   const str_Date = startDate.toISOString().split('T')[0];
//   const end_Date = currentDate.toISOString().split('T')[0];
//   console.log({ startDate: str_Date, endDate: end_Date })
//   return { startDate: str_Date, endDate: end_Date };
// };  
export const getCurrentDate = (daysOffset: number = 365) => {
  const currentDate = new Date();
  const startDate = new Date();
  startDate.setDate(currentDate.getDate() - daysOffset);

  // Format the start date to YYYY-MM-DD format
  const str_Date = startDate.toISOString().split('T')[0];

  // Adjust the end date to Korean local time (UTC+9)
  const koreanEndDate = new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'Asia/Seoul',
  }).format(currentDate);

  // Convert the formatted Korean end date to YYYY-MM-DD format
  // const formattedEndDate = koreanEndDate.replace(/\./g, '-').replace(/\s/g, '').split('-').reverse().join('-');
  const formattedEndDate = left(koreanEndDate.replace(/\./g, '-').replace(/\s+/g, ''), 10);

  console.log({ startDate: str_Date, endDate: formattedEndDate });
  return { startDate: str_Date, endDate: formattedEndDate };
};

const left = (str: string, length: number) => {
  return str.substring(0, length);
};

export const getSchedulesUtil = async (
  year: number,
  month: number,
  sort: string,
  setSchedules: React.Dispatch<React.SetStateAction<ISchedule[]>>,
  formatMonth: (month: number) => string
) => {
  const fetchSchedules = async () => {
    try {
      // console.log('getSchedulesUtil')
      const newMonth = `${year}-${formatMonth(month)}`;
      const res = await axios.get<ISchedule[]>(`${apiUrl}/api/schedules/schedules?SearchMonth=${newMonth}&sort=${sort}`);
      console.log('scheduleUtils.ts getSchedules=', res.data)
      const updatedSchedules = res.data.map(schedule => ({
        ...schedule,
        // start: dayjs(schedule.start).tz('Asia/Seoul').format(), // start 값을 변경
        //   end: dayjs(schedule.end).tz('Asia/Seoul').format(), // start 값을 변경
        start: new Date(dayjs(schedule.start).format('YYYY-MM-DD')), // start 값을 변경
        end: new Date(dayjs(schedule.end).format('YYYY-MM-DD')), // start 값을 변경
        bgColor: schedule.bgcolor
      }));

      // 업데이트된 스케줄 배열을 상태에 저장
      setSchedules(updatedSchedules);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    }
  };
  await fetchSchedules();
};
