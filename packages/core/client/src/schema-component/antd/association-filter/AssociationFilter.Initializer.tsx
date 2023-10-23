import { useAssociatedFields } from '../../../filter-provider/utils';
import { SchemaInitializerItemOptions } from '../../../schema-initializer';
import { SchemaInitializerV2 } from '../../../application';

export const associationFilterInitializer = new SchemaInitializerV2({
  name: 'AssociationFilter.Initializer',
  'data-testid': 'configure-fields-button-of-association-filter',
  style: {
    marginTop: 16,
  },
  icon: 'SettingOutlined',
  title: '{{t("Configure fields")}}',
  items: [
    {
      type: 'itemGroup',
      title: '{{t("Association fields")}}',
      useChildren() {
        const associatedFields = useAssociatedFields();
        const useProps = '{{useAssociationFilterProps}}';
        const children: SchemaInitializerItemOptions[] = associatedFields.map((field) => ({
          type: 'item',
          name: field.key,
          title: field.uiSchema?.title,
          Component: 'AssociationFilterDesignerDisplayField',
          schema: {
            name: field.name,
            title: field.uiSchema?.title,
            type: 'void',
            'x-designer': 'AssociationFilter.Item.Designer',
            'x-component': 'AssociationFilter.Item',
            'x-component-props': {
              fieldNames: {
                label: field.targetKey || 'id',
              },
              useProps,
            },
            properties: {},
          },
        }));

        return children;
      },
    },
    {
      type: 'divider',
    },
    {
      type: 'item',
      title: '{{t("Delete")}}',
      Component: 'AssociationFilterDesignerDelete',
    },
  ],
});
