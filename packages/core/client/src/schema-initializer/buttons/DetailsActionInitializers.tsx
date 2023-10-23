import { SchemaInitializerV2 } from '../../application';

// 表单的操作配置
export const detailsActionInitializers = new SchemaInitializerV2({
  name: 'DetailsActionInitializers',
  'data-testid': 'configure-actions-button-of-details-block',
  title: '{{t("Configure actions")}}',
  icon: 'SettingOutlined',
  style: {
    marginLeft: 8,
  },
  items: [
    {
      type: 'itemGroup',
      title: '{{t("Enable actions")}}',
      name: 'enable-actions',
      children: [
        {
          name: 'edit',
          title: '{{t("Edit")}}',
          Component: 'UpdateActionInitializer',
          schema: {
            'x-component': 'Action',
            'x-decorator': 'ACLActionProvider',
            'x-component-props': {
              type: 'primary',
            },
          },
        },
        {
          name: 'delete',
          title: '{{t("Delete")}}',
          Component: 'DestroyActionInitializer',
          schema: {
            'x-component': 'Action',
            'x-decorator': 'ACLActionProvider',
          },
        },
        {
          name: 'duplicate',
          title: '{{t("Duplicate")}}',
          Component: 'DuplicateActionInitializer',
          schema: {
            'x-component': 'Action',
            'x-action': 'duplicate',
            'x-decorator': 'ACLActionProvider',
            'x-component-props': {
              type: 'primary',
            },
          },
        },
      ],
    },
  ],
});
