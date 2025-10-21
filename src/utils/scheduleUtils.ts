import axios from "axios";
import dayjs from "dayjs";

export const apiUrl = process.env.NODE_ENV === "production" ? process.env.REACT_APP_API_URL_PRODUCTION : process.env.REACT_APP_API_URL_LOCAL;

/** 공통 noop */
const noop = (..._args: any[]) => {};

/** 스케줄 타입 */
export interface ISchedule {
  id?: string;
  calendarId?: string;
  title?: string;
  body?: string;
  start?: Date | string;
  end?: Date | string;
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
  bgcolor?: string; // 서버 필드
  bgColor?: string; // 프론트 변환 필드
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
  ADmedia?: number;
  cskindTitle?: string;
  customerEtc?: string;
  contactPerson?: string;
  contactTel?: string;
  startTime?: string;
  endTime?: string;
  created_at?: Date | string;
  moneyFinishNY?: number;
  messageLogCount?: number;
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
  ADmedia?: number;
  startTime?: string;
  endTime?: string;
  customerEtc?: string;
  contactPerson?: string;
  contactTel?: string;
  moneyFinishNY?: number;
  messageLogCount?: number;
  vatSendCount?: number;
  setNewStart: (date: Date | undefined) => void;
  setNewEnd: (date: Date | undefined) => void;
  onSaveSchedule: () => void;
  onDeleteSchedule: (id: number) => void;
  closeModal: () => void;
  setNewTitle: (title: string) => void;
  setCustomerName: (text: string) => void;
  setRentPlace: (text: string) => void;
  setGubun: (text: string) => void;
  setUserInt: (text: string) => void;
  setEtc: (text: string) => void;
  setEstprice: (text: number) => void;
  setCsKind: (text: number) => void;
  setADmedia?: (text: number) => void; // ✅ 선택 인자화 (호출 안 해도 에러 X)
  setStartTime: (time: string) => void;
  setEndTime: (time: string) => void;
  setCustomerEtc: (text: string) => void;
  setContactPerson: (text: string) => void;
  setContactTel?: (text: string) => void; // ✅ 선택으로 변경
  setmoneyFinishNY?: (text: number) => void;
  isSmsModalOpen?: boolean;
  setIsSmsModalOpen?: React.Dispatch<React.SetStateAction<boolean>>;
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
  setADmedia: (ADmedia: number) => void,
  setCustomerEtc: (customerEtc: string) => void,
  setContactPerson: (contactPerson: string) => void,
  setContactTel: (contactTel: string) => void,
  setmoneyFinishNY: (moneyFinishNY: number) => void
  // setmessageLogCount: (messageLogCount: number) => void
) => {
  setModalMode(mode);

  // setContactTel과 setADmedia는 이제 호출부에서 필수이므로 noop 처리가 필요 없습니다.
  // (만약 Schedule.tsx에서 여전히 선택적으로 전달한다면 주석 처리한 부분이 필요할 수 있습니다.)

  if (mode === "create") {
    // create 모드 초기화
    setCurrentSchedule(null);
    setNewStart(scheduleData ? new Date(dayjs(scheduleData.start).format("YYYY-MM-DD")) : undefined);
    setNewEnd(scheduleData ? new Date(dayjs(scheduleData.end).format("YYYY-MM-DD")) : undefined);
    setStartTime("00:00");
    setEndTime("00:00");
    setNewTitle("");
    setCustomerName("");
    setRentPlace("");
    setGubun("사진");
    setUserInt("10인이하");
    setEstprice(0);
    setId(0);
    setEtc("");
    setCsKind(1);
    setADmedia(7); // setADmedia가 이제 필수 인자로 들어옵니다.
    setCustomerEtc("");
    setContactPerson("");
    setContactTel(""); // setContactTel이 이제 필수 인자로 들어옵니다.
  } else if (mode === "edit" && scheduleData) {
    setCurrentSchedule(scheduleData);
    setNewStart(new Date(dayjs(scheduleData.start).format("YYYY-MM-DD")));
    setNewEnd(new Date(dayjs(scheduleData.end).format("YYYY-MM-DD")));
    setStartTime(scheduleData.startTime || "00:00");
    setEndTime(scheduleData.endTime || "00:00");
    setNewTitle(scheduleData.title || "");
    setCustomerName(scheduleData.customerName || "");
    setRentPlace(scheduleData.rentPlace ? scheduleData.rentPlace : "");
    setGubun(scheduleData.gubun || "");
    setUserInt(scheduleData.userInt || "");
    setEstprice(scheduleData.estPrice || 0);
    setId(Number(scheduleData.id ?? 0));
    setEtc(scheduleData.etc || "");
    setCsKind(scheduleData.csKind ?? 1);
    setADmedia(scheduleData.ADmedia ?? 7); // setADmedia 업데이트
    setCustomerEtc(scheduleData.customerEtc ?? "");
    setContactPerson(scheduleData.contactPerson ?? "");
    setContactTel(scheduleData.contactTel ?? ""); // setContactTel 업데이트
  }
  setIsModalOpen(true);
};

export const openJexcelModalUtil = (
  customerName: string,
  setSearchQuery: React.Dispatch<React.SetStateAction<string>>,
  setIsJexcelModalOpen: React.Dispatch<React.SetStateAction<boolean>>
) => {
  console.log("openJexcelModal", customerName);
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

/**
 * 저장 유틸
 * - closeModal을 선택 인자로 변경 (호출 안 해도 컴파일 OK)
 */
export const saveSchedule = async (
  csKind: number,
  ADmedia: number,
  newTitle: string,
  Start: Date | undefined,
  End: Date | undefined,
  startTime: string,
  endTime: string,
  customerName: string,
  rentPlace: string,
  modalMode: "create" | "edit" | string,
  currentSchedule: ISchedule | null,
  gubun: string,
  userInt: string,
  estPrice: number,
  etc: string,
  setSchedules: (updater: (prev: ISchedule[]) => ISchedule[]) => void,
  closeModal?: () => void
) => {
  const newSchedule: ISchedule = {
    id: currentSchedule?.id ?? String(Math.random()),
    calendarId: "1",
    title: newTitle,
    start: Start ? new Date(dayjs(Start).format("YYYY-MM-DD")) : undefined,
    end: End ? new Date(dayjs(End).format("YYYY-MM-DD")) : undefined,
    startTime,
    endTime,
    customerName,
    rentPlace,
    estPrice: Number(estPrice),
    userInt,
    gubun,
    etc,
    csKind,
    ADmedia,
  };

  // 보정(YYYY-MM-DD 로 고정)
  if (newSchedule.start) newSchedule.start = new Date(dayjs(newSchedule.start).format("YYYY-MM-DD"));
  if (newSchedule.end) newSchedule.end = new Date(dayjs(newSchedule.end).format("YYYY-MM-DD"));

  try {
    let result;
    if (modalMode === "create") {
      console.log("NEW SCHEDULE CREATE");
      result = await axios.post(`${apiUrl}/api/schedules`, newSchedule);
    } else {
      console.log("SCHEDULE EDIT");
      result = await axios.put(`${apiUrl}/api/schedules/${currentSchedule?.id}`, newSchedule);
    }
    console.log("saveScheduleResult=", result);

    setSchedules((prev: ISchedule[]) =>
      modalMode === "edit" && currentSchedule ? prev.map((s) => (s.id === currentSchedule.id ? newSchedule : s)) : [...prev, newSchedule]
    );

    closeModal?.();
  } catch (err) {
    if (axios.isAxiosError(err)) {
      if (err.response && err.response.status === 409) {
        alert(err.response.data.message);
      } else {
        console.error("Axios 에러:", err.message);
      }
    } else {
      console.error("예상치 못한 에러:", err);
    }
  }
};

export const getCurrentDate = (daysOffset: number = 365) => {
  const currentDate = new Date();
  const startDate = new Date();
  startDate.setDate(currentDate.getDate() - daysOffset);

  const str_Date = startDate.toISOString().split("T")[0];

  const koreanEndDate = new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: "Asia/Seoul",
  }).format(currentDate);

  const formattedEndDate = left(koreanEndDate.replace(/\./g, "-").replace(/\s+/g, ""), 10);
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
      const newMonth = `${year}-${formatMonth(month)}`;
      console.log("apiUrl", apiUrl);
      const res = await axios.get<ISchedule[]>(`${apiUrl}/api/schedules?SearchMonth=${newMonth}&sort=${sort}`);
      console.log("getSchedulesUtil", res);
      const updatedSchedules = res.data.map((schedule) => ({
        ...schedule,
        start: new Date(dayjs(schedule.start).format("YYYY-MM-DD")),
        end: new Date(dayjs(schedule.end).format("YYYY-MM-DD")),
        bgColor: schedule.bgcolor,
      }));

      setSchedules(updatedSchedules);
    } catch (err) {
      console.error("Error fetching schedules:", err);
    }
  };
  await fetchSchedules();
};
