import axios from 'axios';
import dayjs from 'dayjs';
const apiUrl = process.env.REACT_APP_API_URL;

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
  gubun?: string;
  userInt?: string;
  estPrice?: number;
  etc?: string;
  csKind?:number;
  // created_at: Date;
  startTime?:number;
  endTime?:number;
  created_at?:Date;
  cskindTitle?:string;
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
  startTime?:number;
  endTime?:number;
  setNewStart: (date: Date | undefined) => void;
  setNewEnd: (date: Date | undefined) => void;
  onSaveSchedule: () => void;
  onDeleteSchedule: (id: number) => void;
  closeModal: () => void;
  setNewTitle: (title: string) => void;
  setCustomerName: (text: string) => void;
  setRentPlace: (text: string) => void;
  openJexcelModal: (customerName: string) => void;
  setGubun: (text: string) => void;
  setUserInt: (text: string) => void;
  setEtc: (text: string) => void;
  setEstprice: (text: number) => void;
  setCsKind: (text: number) => void;
  setStartTime:(time: number) => void;
  setEndTime:(time: number) => void;
}

export const openModalUtil = (
  mode: "create" | "edit",
  scheduleData: ISchedule | null,
  setModalMode: (mode: "create" | "edit") => void,
  setCurrentSchedule: (schedule: ISchedule | null) => void,
  setNewStart: (date: Date | undefined) => void,
  setNewEnd: (date: Date | undefined) => void,
  setStartTime: (time: number) => void,
  setEndTime: (time: number) => void,
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

) => {
  setModalMode(mode);

  if (mode === "create") {
    // create 모드일 경우 모든 값을 초기화
    setCurrentSchedule(null);
    setNewStart(scheduleData ? new Date(dayjs(scheduleData.start).format('YYYY-MM-DD')) : undefined);
    setNewEnd(scheduleData ? new Date(dayjs(scheduleData.end).format('YYYY-MM-DD')) : undefined);
    setStartTime(0);
    setEndTime(0);
    setNewTitle('');
    setCustomerName("");
    setRentPlace("");
    setGubun("사진");
    setUserInt("10인이하");
    setEstprice(0);
    setId(0);
    setEtc("");
    setCsKind(1)
  } else if (mode === "edit" && scheduleData) {
    // edit 모드일 경우 scheduleData 값을 사용
    setCurrentSchedule(scheduleData);
    setNewStart(new Date(dayjs(scheduleData.start).format('YYYY-MM-DD')));
    setNewEnd(new Date(dayjs(scheduleData.end).format('YYYY-MM-DD')));
    setStartTime(scheduleData.startTime || 0);
    setEndTime(scheduleData.endTime || 0);
    setNewTitle(scheduleData.title || "");
    setCustomerName(scheduleData.customerName || "");
    setRentPlace(scheduleData.rentPlace ? scheduleData.rentPlace : "");
    // setRentPlace(scheduleData.rentPlace ? scheduleData.rentPlace : "");
    setGubun(scheduleData.gubun || "");
    setUserInt(scheduleData.userInt || "");
    setEstprice(scheduleData.estPrice || 0);
    setId(scheduleData.id || 0);
    setEtc(scheduleData.etc || "");
    setCsKind(scheduleData.csKind || 1);
  }
  // console.log('scheduleData.csKind',scheduleData?.csKind)
  console.log({'scheduleData':scheduleData})
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
  startTime:number,
  endTime:number,
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

  console.log('csKind',csKind)

  newSchedule.start = dayjs(newSchedule.start).format('YYYY-MM-DD');  
  newSchedule.end = dayjs(newSchedule.end).format('YYYY-MM-DD');  
  // newSchedule.start = dayjs(dayjs(newSchedule.start).format('YYYY-MM-DD')).toDate();  
  // newSchedule.end = dayjs(dayjs(newSchedule.end).format('YYYY-MM-DD')).toDate();  
 
  console.log({'save newSchedule':newSchedule});
  try {
    if (modalMode === "create") {
      await axios.post(`${apiUrl}/api/schedules`, newSchedule);
    } else {
      // console.log({'EditMode newSchedule':newSchedule});
      await axios.put(`${apiUrl}/api/schedules/${currentSchedule?.id}`, newSchedule);
    }

    setSchedules((prev: ISchedule[]) => (
      modalMode === "edit" && currentSchedule
        ? prev.map(s => (s.id === currentSchedule.id ? newSchedule : s))
        : [...prev, newSchedule]
    ));
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
  setSchedules: React.Dispatch<React.SetStateAction<ISchedule[]>>,
  formatMonth: (month: number) => string
) => {
  const fetchSchedules = async () => {
    try {
      const newMonth = `${year}-${formatMonth(month)}`;
      const res = await axios.get<ISchedule[]>(`${apiUrl}/api/schedules/schedules?SearchMonth=${newMonth}`);
      console.log(res.data)
      const updatedSchedules = res.data.map(schedule => ({
        ...schedule,
        // start: dayjs(schedule.start).tz('Asia/Seoul').format(), // start 값을 변경
        //   end: dayjs(schedule.end).tz('Asia/Seoul').format(), // start 값을 변경
        start: dayjs(schedule.start).format('YYYY-MM-DD'), // start 값을 변경
        end: dayjs(schedule.end).format('YYYY-MM-DD') // start 값을 변경
      }));

      // 업데이트된 스케줄 배열을 상태에 저장
      setSchedules(updatedSchedules);
    } catch (err) {
      console.error('Error fetching schedules:', err);
    }
  };
  await fetchSchedules();
};
