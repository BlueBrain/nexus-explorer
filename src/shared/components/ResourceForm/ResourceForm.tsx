import * as React from 'react';
import { Cascader, Form, Button, Spin, Modal } from 'antd';
import { CascaderOptionType, CascaderValueType } from 'antd/lib/cascader';
import { ResourcePayload } from '@bbp/nexus-sdk';

import ResourceEditor from '../ResourceEditor';
import {
  DEFAULT_RESOURCE,
  RESOURCES_SCHEMA_URI,
  DEFAULT_RESOURCES,
} from './defaultResourcePayloads';

import './ResourceForm.less';
import { format } from 'url';

const AVAILABLE_SCHEMAS: CascaderOptionType[] = [
  {
    value: '_',
    label: 'Any Resource',
  },
  {
    value: 'Storage',
    label: 'Storage',
    children: [
      { value: 'DiskStorage', label: 'Disk Storage' },
      { value: 'RemoteStorage', label: 'Remote Storage' },
      { value: 'S3Storage', label: 'S3 Storage' },
    ],
  },
  {
    value: 'View',
    label: 'View',
    children: [
      { value: 'SparqlView', label: 'Sparql View' },
      { value: 'ElasticSearchView', label: 'ElasticSearch View' },
      { value: 'AggregateSparqlView', label: 'Aggregate Sparql View' },
      {
        value: 'AggregateElasticSearchView',
        label: 'Aggregate ElasticSearch View',
      },
      {
        value: 'CompositeView',
        label: 'Composite View',
      },
    ],
  },
  {
    value: 'Resolver',
    label: 'Resolver',
    children: [
      { value: 'InProject', label: 'In Project' },
      { value: 'CrossProject', label: 'Cross Project' },
    ],
  },
];

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 5 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 19 },
  },
};

const formItemLayoutWithOutLabel = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 19, offset: 5 },
  },
};

export interface ResourceFormProps {
  resource?: {
    schemaId: string;
    payload: ResourcePayload;
  };
  busy?: boolean;
  onSubmit?(resource: { schemaId: string; payload: ResourcePayload }): any;
  onDeprecate?(): any;
  mode?: 'create' | 'edit';
}

/**
 * Adaptation of the following example:
 * based on: https://ant.design/components/form/#components-form-demo-dynamic-form-item
 */
const ResourceForm: React.FunctionComponent<ResourceFormProps> = ({
  busy = false,
  onSubmit = () => {},
  onDeprecate = () => {},
  mode = 'create',
}) => {
  const [jsonValue, setJsonValue] = React.useState<{ [key: string]: any }>(
    DEFAULT_RESOURCE
  );
  const [form] = Form.useForm();

  const handleSubmit = async (rawData: any) => {
    try {
      form.setFieldsValue({ editorContent: rawData });
      const values = await form.validateFields();
      const { resourceTypes, editorContent } = values;
      const selectedSchema: string =
        resourceTypes.find((type: string) =>
          Object.keys(RESOURCES_SCHEMA_URI).includes(type)
        ) || '_';
      const payload = {
        ...editorContent,
      };
      onSubmit({
        payload,
        schemaId: RESOURCES_SCHEMA_URI[selectedSchema],
      });
    } catch (error) {
      // TODO: do something with error
    }
  };

  const handleTypeChange = (
    value: CascaderValueType,
    selectedOptions?: CascaderOptionType[] | undefined
  ) => {
    const selectedType =
      value
        .find(entry => Object.keys(DEFAULT_RESOURCES).includes(`${entry}`))
        ?.toString() || '_';
    setJsonValue(DEFAULT_RESOURCES[selectedType]);
  };

  const confirmDeprecate = () => {
    Modal.confirm({
      title: 'Deprecate Resource',
      content: 'Are you sure?',
      onOk: onDeprecate,
    });
  };

  return (
    <Spin spinning={busy}>
      <Form className="resource-form" form={form}>
        <Form.Item
          label="Resource Type"
          name="resourceTypes"
          rules={[{ required: true }]}
          initialValue={['_']}
          {...formItemLayout}
        >
          <Cascader
            options={AVAILABLE_SCHEMAS}
            disabled={mode === 'edit'}
            onChange={handleTypeChange}
          />
        </Form.Item>
        <Form.Item
          name="editorContent"
          rules={[{ required: false }]}
          {...formItemLayoutWithOutLabel}
        >
          <ResourceEditor
            editable={true}
            rawData={jsonValue}
            onSubmit={handleSubmit}
            showExpanded={false}
          />
        </Form.Item>
        <Form.Item {...formItemLayoutWithOutLabel}>
          {mode === 'edit' && (
            <Button
              danger
              onClick={confirmDeprecate}
              style={{ float: 'right' }}
            >
              Deprecate
            </Button>
          )}
        </Form.Item>
      </Form>
    </Spin>
  );
};

export default ResourceForm;
