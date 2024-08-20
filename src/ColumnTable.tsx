import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Table, Button, Modal, Form, Input, Select, message } from 'antd';
import { ColumnsType } from 'antd/es/table';

interface ColumnData {
  id: number;
  name: string;
  type: string;
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
  const [form] = Form.useForm();

  //  컬럼 목록 가져오기
  const fetchColumns = async () => {
    console.log('tableName',tableName)
    try {
      const response = await axios.get<ColumnData[]>(`http://localhost:3001/api/table/${tableName}`);
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
  const handleAddColumn = () => {
    form.validateFields().then(async (values) => {
      try {
        const response = await axios.post<ColumnData>('http://localhost:3001/api/columns', {
          name: values.name,
          type: values.type,
        });
        setColumns([...columns, response.data]);
        form.resetFields();
        setIsModalVisible(false);
        message.success('Column added successfully');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    });
  };

  // 컬럼 수정
  const handleEditColumn = () => {
    form.validateFields().then(async (values) => {
      try {
        const response = await axios.put<ColumnData>(`http://localhost:3001/api/columns/${editingColumn?.id}`, {
          name: values.name,
          type: values.type,
        });
        setColumns(columns.map(col => (col.id === editingColumn?.id ? response.data : col)));
        form.resetFields();
        setIsModalVisible(false);
        setEditingColumn(null);
        message.success('Column edited successfully');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      }
    });
  };

  // 컬럼 삭제
  const handleDeleteColumn = async (id: number) => {
    try {
      await axios.delete(`http://localhost:3001/api/columns/${id}`);
      setColumns(columns.filter(col => col.id !== id));
      message.success('Column deleted successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  const showAddModal = () => {
    setEditingColumn(null);
    setIsModalVisible(true);
  };

  const showEditModal = (column: ColumnData) => {
    setEditingColumn(column);
    form.setFieldsValue({ name: column.Field, type: column.Type });
    setIsModalVisible(true);
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  const tableColumns: ColumnsType<ColumnData> = [
    { title: '필드명', dataIndex: 'Field', key: 'id' },
    { title: '속성', dataIndex: 'Type', key: 'type' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <>
          <Button onClick={() => showEditModal(record)} style={{ marginRight: 8 }}>Edit</Button>
          <Button danger onClick={() => handleDeleteColumn(record.id)}>Delete</Button>
        </>
      ),
    },
  ];

  return (
    <div>
      <Button type="primary" onClick={showAddModal} style={{ marginBottom: 16 }}>Add Column</Button>
      <Table dataSource={columns} columns={tableColumns} rowKey="id" />

      <Modal
        title={editingColumn ? 'Edit Column' : 'Add Column'}
        visible={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={editingColumn ? handleEditColumn : handleAddColumn}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Column Name"
            rules={[{ required: true, message: 'Please enter the column name' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label="Column Type"
            rules={[{ required: true, message: 'Please select the column type' }]}
          >
            <Select placeholder="Select a column type">
              <Option value="VARCHAR(255)">VARCHAR(255)</Option>
              <Option value="INT">INT</Option>
              <Option value="TEXT">TEXT</Option>
              <Option value="DATE">DATE</Option>
              <Option value="BOOLEAN">BOOLEAN</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ColumnTable;
