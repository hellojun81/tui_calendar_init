import React, { useRef, useEffect } from 'react';
import jspreadsheet from 'jspreadsheet-ce';
import 'jspreadsheet-ce/dist/jspreadsheet.css';

interface JexcelComponentProps {
    data: string[][];
    columns: any[];
    onEdit: (rowIndex: number) => void;
}

const JexcelComponent: React.FC<JexcelComponentProps> = ({ data, columns, onEdit }) => {
    const tableRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (tableRef.current) {
            if (tableRef.current.jspreadsheet) {
                tableRef.current.jspreadsheet.destroy();
            }

            tableRef.current.jspreadsheet = jspreadsheet(tableRef.current, {
                data: data.length ? data : [[]],
                columns: columns,
                oneditionstart: (instance, cell, x, y) => {
                    onEdit(y);  // Trigger onEdit when a cell is edited
                },
            });
        }

        return () => {
            if (tableRef.current && tableRef.current.jspreadsheet) {
                tableRef.current.jspreadsheet.destroy();
            }
        };
    }, [data, columns, onEdit]);

    return <div ref={tableRef} className='jexcel' />;
};

export default JexcelComponent;
