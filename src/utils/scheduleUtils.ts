
import axios from 'axios';
import dayjs from 'dayjs';

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
  bgColor?: string;
  dragBgColor?: string;
  borderColor?: string;
  customStyle?: string;
  rentPlace?: string;
  state?: string;
  customerName?: string;
  gubun?:string;
  userInt?:string;
  estPrice?:number;
  etc?:string;
  csKind:number;
  created_at:Date;
}

export interface ScheduleModalProps {
  isOpen: boolean;
  modalMode: "create" | "edit";
  id: Number;
  newStart: Date | undefined;
  newEnd: Date | undefined;
  newTitle: string;
  customerName: string;
  rentPlace: string;
  etc: string;
  gubun?:string;
  userInt?:string;
  estPrice?:number;
  csKind?:number;
  setNewStart: (date: Date | undefined) => void;
  setNewEnd: (date: Date | undefined) => void;
  onSaveSchedule: () => void;
  onDeleteSchedule: (id: number) => void;
  closeModal: () => void;
  // onRawDataChange: (key: string, value: string) => void;
  setNewTitle: (title: string) => void;
  setCustomerName: (text: string) => void;
  setRentPlace: (text: string) => void;
  openJexcelModal: (customerName: string) => void; // 수정된 부분
  setGubun: (text: string) => void;
  setUserInt: (text: string) => void;
  setEtc: (text: string) => void;
  setEstprice: (text: number) => void;
}

export const openModalUtil = (
    mode: "create" | "edit",
    scheduleData: ISchedule | null,
    setModalMode: (mode: "create" | "edit") => void,
    setCurrentSchedule: (schedule: ISchedule | null) => void,
    setNewStart: (date: Date | undefined) => void,
    setNewEnd: (date: Date | undefined) => void,
    setNewTitle: (title: string) => void,
    setCustomerName: (name: string) => void,
    setRentPlace: (place: string) => void,
    setGubun: (gubun: string) => void,
    setUserInt: (userInt: string) => void,
    setEstprice: (price: number) => void,
    setId: (id: string) => void,
    setEtc: (etc: string) => void,
    setIsModalOpen: (isOpen: boolean) => void
  ) => {
    setModalMode(mode);
    setCurrentSchedule(scheduleData);
    setNewStart(scheduleData ? new Date(dayjs(scheduleData.start).format('YYYY-MM-DD')) : undefined);
    setNewEnd(scheduleData ? new Date(dayjs(scheduleData.end).format('YYYY-MM-DD')) : undefined);
    setNewTitle(scheduleData ? scheduleData.title || "" : "");
    setCustomerName(scheduleData ? scheduleData.customerName || "" : "");
    setRentPlace(scheduleData ? scheduleData.rentPlace || "" : "");
    setGubun(scheduleData ? scheduleData.gubun || "" : "");
    setUserInt(scheduleData ? scheduleData.userInt || "" : "");
    setEstprice(scheduleData ? scheduleData.estPrice || 0 : 0);
    setId(scheduleData ? scheduleData.id || "" : "");
    setEtc(scheduleData ? scheduleData.etc || "" : "");
    setIsModalOpen(true);
  };
  export const openJexcelModalUtil = (
    customerName: string,
    setSearchQuery: React.Dispatch<React.SetStateAction<string>>,
    setIsJexcelModalOpen: React.Dispatch<React.SetStateAction<boolean>>
  ) => {
    console.log('openJexcelModal', customerName);
    setSearchQuery(customerName);  // 검색어 상태 설정
    setIsJexcelModalOpen(true);    // 모달 열기
  };


  export const closeModalUtil = (
    setIsModalOpen: React.Dispatch<React.SetStateAction<boolean>>,
    setCurrentSchedule: React.Dispatch<React.SetStateAction<ISchedule | null>>
  ) => {
    setIsModalOpen(false);
    setCurrentSchedule(null);
  };


export const saveSchedule = async (
  newTitle: string,
  newStart: Date | undefined,
  newEnd: Date | undefined,
  customerName: string,
  rentPlace: string,
  modalMode: string,
  currentSchedule: ISchedule | null,
  gubun: string,
  userInt: string,
  estPrice: number,
  etc: string,
  csKind:number,
  currentYear: number,
  currentMonth: number,
  setSchedules: Function,
  closeModal: Function,
  getSchedules: Function
) => {
  const newSchedule: ISchedule = {
    id: currentSchedule?.id || String(Math.random()),
    calendarId: "1",
    title: newTitle,
    start: newStart ? new Date(dayjs(newStart).format('YYYY-MM-DD HH:mm:ss')) : undefined,
    end: newEnd ? new Date(dayjs(newEnd).format('YYYY-MM-DD HH:mm:ss')) : undefined,      
    category: 'allday',
    bgColor: 'red',
    customerName,
    rentPlace,
    estPrice: Number(estPrice),
    userInt,
    gubun,
    etc,
    csKind
  };
  
  try {
    if (modalMode === "create") {
        console.log('newSchedule',newSchedule)
      await axios.post('http://localhost:3001/api/schedules', newSchedule);
    } else {
      await axios.put(`http://localhost:3001/api/schedules/${currentSchedule?.id}`, newSchedule);
    }

    setSchedules(prev => (
      modalMode === "edit" && currentSchedule
        ? prev.map(s => (s.id === currentSchedule.id ? newSchedule : s))
        : [...prev, newSchedule]
    ));
    getSchedulesUtil(currentYear, currentMonth);
    closeModal();
  } catch (err) {
    console.error('Error saving schedule:', err);
  }
};

export const getCurrentDate = (daysOffset: number = 14) => {
  const currentDate = new Date();
  const startDate = new Date();
  startDate.setDate(currentDate.getDate() - daysOffset);

  const str_Date = startDate.toISOString().split('T')[0];
  const end_Date = currentDate.toISOString().split('T')[0];

  return { startDate: str_Date, endDate: end_Date };
};



export const getSchedulesUtil = async (
  year: number,
  month: number,
  setSchedules: React.Dispatch<React.SetStateAction<any[]>>, // 스케줄 데이터를 저장할 상태 함수
  formatMonth: (month: number) => string // 월을 포맷팅하는 함수
) => {
  const fetchSchedules = async () => {
    try {
      const newMonth = `${year}-${formatMonth(month)}`;
      console.log('newMonth', newMonth);

      // 서버로부터 데이터를 가져오는 비동기 호출
      const res = await axios.get<ISchedule[]>(`http://localhost:3001/api/schedules?${newMonth}`);
      setSchedules(res.data);  // 가져온 데이터를 상태에 저장
      console.log('resData', res.data);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    }
  };
  await fetchSchedules();  // 비동기 함수를 호출
};
