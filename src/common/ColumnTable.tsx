import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { ColumnsType } from 'antd/es/table';
const apiUrl = process.env.REACT_APP_API_URL;

interface ColumnData {
    displayName: string;
    fieldName: string;
    Type: string;
    id: number;
}

interface ColumnTableProps {
    tableName: string | null;
    fieldName: string | null;
    typeName: string | null;
}

const { Option } = Select;
const ColumnTable: React.FC<ColumnTableProps> = ({
    tableName,
    fieldName,
    typeName,
}) => {
    const [columns, setColumns] = useState<ColumnData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingColumn, setEditingColumn] = useState<ColumnData | null>(null);
    const [selectedType, setSelectedType] = useState<string | null>(null);
    const [form] = Form.useForm();

    // 컬럼 목록 가져오기
    const fetchColumns = async () => {
        try {
            const response = await axios.get<ColumnData[]>(`${apiUrl}/api/columns`, {
                params: { tableName: tableName }
            });
            setColumns(response.data);
            setLoading(false);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchColumns();
    }, []);

    // 컬럼 추가
    const handleAddColumn = (column: ColumnData) => {
        form.validateFields().then(async (values) => {
            try {
                const response = await axios.post<ColumnData>(`${apiUrl}/api/columns`, {
                    tableName: tableName,
                    displayName: values.displayName,
                    type: values.type,
                    options: values.options, // enum 또는 set의 옵션 전달
                });
                setColumns([...columns, response.data]);
                await fetchColumns();
                form.resetFields();
                setIsModalVisible(false);
                message.success('Column added successfully');

            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            }
        });
    };

    // 컬럼 수정
    const handleEditColumn = async (column: ColumnData) => {
        form.validateFields().then(async (values) => {
            try {
                const response = await axios.put<ColumnData>(`${apiUrl}/api/columns`, {
                    tableName: tableName,
                    id: values.id,
                    newName: values.displayName,
                    type: values.type,
                    options: values.options, // enum 또는 set의 옵션 전달
                });
                await fetchColumns();
                form.resetFields();
                setIsModalVisible(false);
                setEditingColumn(null);
                message.success('Column renamed successfully');
            } catch (err) {
                setError(err instanceof Error ? err.message : 'An error occurred');
            }
        });
    };

    // 컬럼 삭제
    const handleDeleteColumn = async (column: ColumnData) => {
        try {
            await axios.delete(`${apiUrl}/api/columns/${tableName}?id=${column.id}`);
            await fetchColumns();
            message.success('Column deleted successfully');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred');
        }
    };

    const showAddModal = () => {
        form.resetFields();  
        setEditingColumn(null);
        setIsModalVisible(true);
    };

    const showEditModal = (column: ColumnData) => {
        const typeMatch = column.Type.match(/^(\w+)\((.+)\)$/);
        console.log(typeMatch)
        if (typeMatch) {
            console.log(typeMatch[1])
            console.log(typeMatch[2])
            setEditingColumn(column);
            form.setFieldsValue({
                displayName: column.displayName,
                id: column.id,
                type: typeMatch[1],
                options: typeMatch[2], // 초기값 설정
            });
            setSelectedType(column.Type); // 선택된 타입을 상태로 설정
            setIsModalVisible(true);

        }else{
            setEditingColumn(column);
            form.setFieldsValue({
                displayName: column.displayName,
                id: column.id,
                type: column.Type,
                options: '', // 초기값 설정
            });
            setSelectedType(column.Type); // 선택된 타입을 상태로 설정
            setIsModalVisible(true);
        }
    };

    const handleTypeChange = (value: string) => {
        setSelectedType(value); // 선택된 타입을 상태로 설정
    };

    const isEnumOrSet = selectedType?.toLowerCase().includes('enum') || selectedType?.toLowerCase().includes('set');

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    const tableColumns: ColumnsType<ColumnData> = [
        { title: '디스플레이명', dataIndex: 'displayName' },
        { title: '타입', dataIndex: 'Type' },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <>
                    <Button onClick={() => showEditModal(record)} style={{ marginRight: 8 }}>Edit</Button>
                    <Button danger onClick={() => handleDeleteColumn(record)}>Delete</Button>
                </>
            ),
        },
    ];

    return (
        <div>
            <Button type="primary" onClick={showAddModal} style={{ marginBottom: 16 }}>Add Column</Button>
            <Table dataSource={columns} columns={tableColumns} rowKey="id" />
            <Modal
                title={editingColumn ? '수정' : '추가'}
                visible={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                onOk={editingColumn ? handleEditColumn : handleAddColumn}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        name="id"
                        label="ID"
                    >
                        <Input disabled />
                    </Form.Item>
                    <Form.Item
                        name="displayName"
                        label="Display Name"
                        rules={[{ required: true, message: 'Please enter the column name' }]}
                    >
                        <Input />
                    </Form.Item>
                    <Form.Item
                        name="type"
                        label="Column Type"
                        rules={[{ required: true, message: 'Please select the column type' }]}
                    >
                        <Select placeholder="입력할 정보 타입을 선택하세요" onChange={handleTypeChange}>
                            <Option value="VARCHAR(255)">텍스트(VARCHAR)</Option>
                            <Option value="INT">숫자(INT)</Option>
                            <Option value="DATE">날짜(DATE)</Option>
                            <Option value="BOOLEAN">토글(BOOLEAN)</Option>
                            <Option value="enum">enum</Option>
                            <Option value="set">set</Option>
                        </Select>
                    </Form.Item>
                    {isEnumOrSet ? (
                        <Form.Item
                            name="options"
                            label="옵션 정보"
                            rules={[{ required: true, message: 'Please enter the options for the ENUM or SET' }]}
                        >
                            <Input placeholder="예: '1','2','3' 또는 'a','b','c'" />
                        </Form.Item>
                    ) : null}
                </Form>
            </Modal>
        </div>
    );
};

export default ColumnTable;
