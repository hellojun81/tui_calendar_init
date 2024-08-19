import React, { useState, useMemo } from 'react';
import { Table, Layout, Button, Modal, Form, Input, Select, Switch, Tabs } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import SetupLink from './setup_link';
import "./styles.css";


const { Sider, Content } = Layout;
const { Option } = Select;
const { TabPane } = Tabs;

type FieldData = {
  key: string;
  fieldName: string;
  dataType: string;
  fieldUse: boolean;
};
type DataStructure = {
  [key: string]: FieldData[];
};

const initialData: DataStructure = {
  고객: [
    { key: '1', fieldName: '고객 이름', dataType: '텍스트 (String)', fieldUse: true },
    { key: '2', fieldName: '연락처', dataType: '텍스트 (String)', fieldUse: true },
    { key: '3', fieldName: '이메일', dataType: '텍스트 (String)', fieldUse: true },
    { key: '4', fieldName: '주소', dataType: '텍스트 (String)', fieldUse: false },
  ],
  의뢰: [
    { key: '1', fieldName: '의뢰 상태', dataType: '단수선택 리스트 (Single List)', fieldUse: true },
    { key: '2', fieldName: '예상 견적', dataType: '숫자 (Number)', fieldUse: true },
    { key: '3', fieldName: '의뢰 항목', dataType: '복수선택 리스트 (Multi List)', fieldUse: false },
    { key: '4', fieldName: '문의 일시', dataType: '날짜 (Date)', fieldUse: true },
  ],
};


const FieldSettings = () => {
  const [data, setData] = useState(initialData);
  const [activeTab, setActiveTab] = useState('의뢰');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingField, setEditingField] = useState<any | null>(null);
  const [form] = Form.useForm();

  const handleAddOrEditField = () => {
    form.validateFields().then((values) => {
      const newField = {
        key: editingField ? editingField.key : (data[activeTab].length + 1).toString(),
        fieldName: values.fieldName,
        dataType: values.dataType,
        fieldUse: values.fieldUse,
      };

      if (editingField) {
        const updatedData = data[activeTab].map((item) =>
          item.key === editingField.key ? newField : item
        );
        setData({ ...data, [activeTab]: updatedData });
      } else {
        setData({ ...data, [activeTab]: [...data[activeTab], newField] });
      }

      form.resetFields();
      setIsModalVisible(false);
      setEditingField(null);
    });
  };

  const handleEdit = (record: any) => {
    setEditingField(record);
    form.setFieldsValue({
      fieldName: record.fieldName,
      dataType: record.dataType,
      fieldUse: record.fieldUse,
    });
    setIsModalVisible(true);
  };

  const handleDelete = (key: string) => {
    setData({
      ...data,
      [activeTab]: data[activeTab].filter((item) => item.key !== key),
    });
  };

  // Use useMemo to memoize the columns to avoid unnecessary re-renders
  const columns = useMemo(() => [
    {
      title: '필드 이름',
      dataIndex: 'fieldName',
      key: 'fieldName',
    },
    {
      title: '데이터 타입',
      dataIndex: 'dataType',
      key: 'dataType',
    },
    {
      title: '필드 사용',
      dataIndex: 'fieldUse',
      key: 'fieldUse',
      render: (fieldUse: boolean) => (fieldUse ? 'Yes' : 'No'),
    },
    {
      title: '',
      key: 'action',
      render: (_: any, record: any) => (
        <>
          <EditOutlined style={{ marginRight: 8 }} onClick={() => handleEdit(record)} />
          <DeleteOutlined onClick={() => handleDelete(record.key)} />
        </>
      ),
    },
  ], [data, activeTab]);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider width={200} className="site-layout-background">
        <SetupLink />
      </Sider>
      <Content style={{ padding: '0 24px', minHeight: 280 }}>
        <h2>필드 설정</h2>
        <Tabs activeKey={activeTab} onChange={setActiveTab} destroyInactiveTabPane>
          {Object.keys(data).map((tab) => (
            <TabPane tab={tab} key={tab}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setIsModalVisible(true)}
                style={{ marginBottom: 16 }}
              >
                필드 추가하기
              </Button>
              <Table dataSource={data[tab]} columns={columns} pagination={false} />
            </TabPane>
          ))}
        </Tabs>
        <Modal
          title={editingField ? '필드 수정하기' : '필드 추가하기'}
          visible={isModalVisible}
          onCancel={() => {
            setIsModalVisible(false);
            setEditingField(null);
            form.resetFields();
          }}
          onOk={handleAddOrEditField}
        >
          <Form form={form} layout="vertical">
            <Form.Item
              name="fieldName"
              label="필드 이름"
              rules={[{ required: true, message: '필드 이름을 입력해주세요' }]}
            >
              <Input />
            </Form.Item>
            <Form.Item
              name="dataType"
              label="데이터 타입"
              rules={[{ required: true, message: '데이터 타입을 선택해주세요' }]}
            >
              <Select>
                <Option value="텍스트 (VARCHAR(255))">텍스트 (String)</Option>
                <Option value="숫자 (INT)">숫자 (Number)</Option>
                <Option value="날짜 (Date)">날짜 (Date)</Option>
                <Option value="시간 (Time)">시간 (Time)</Option>
                <Option value="토클 (Boolean)">토클 (Boolean)</Option>
                <Option value="단수선택(ENUM)">단수선택 (Single List)</Option>
                <Option value="복수선택 (Multi List)">복수선택 (Multi List)</Option>
              </Select>
            </Form.Item>
            <Form.Item
              name="fieldUse"
              label="필터 사용"
              valuePropName="checked"
            >
              <Switch defaultChecked />
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default FieldSettings;
