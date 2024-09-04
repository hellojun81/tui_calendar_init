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
  }

export interface ScheduleModalProps {
    isOpen: boolean;
    modalMode: "create" | "edit";
    id: Number;
    newStart: Date | null;
    newEnd: Date | null;
    newTitle: string;
    customerName: string;
    rentPlace: string;
    setNewStart: (date: Date | null) => void;
    setNewEnd: (date: Date | null) => void;
    onSaveSchedule: () => void;
    onDeleteSchedule: (id: number) => void;
    closeModal: () => void;
    onRawDataChange: (key: string, value: string) => void;
    setNewTitle: (title: string) => void;
    setCustomerName: (text: string) => void;
    setRentPlace: (text: string) => void;
    openJexcelModal: (customerName: string) => void; // 수정된 부분
  }