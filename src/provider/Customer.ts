// src/types.ts
export interface Customer {
    id: number;
    customerName: string;
    contactPerson: string;
    position: string;
    phone: string;
    email: string;
    leadSource: string;
    inboundDate: Date;
    businessNumber: string;
    representative: string;
    location: string;
    notes: string;
}



export interface JSpreadsheetInstance {
    getRowData: (rowIndex: number) => any;
    options: {
        onselection?: (
            instance: JSpreadsheetInstance,
            x1: number,
            y1: number,
            x2: number,
            y2: number
        ) => void;
    };
}
