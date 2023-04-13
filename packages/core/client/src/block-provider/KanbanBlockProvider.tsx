import { ArrayField } from '@formily/core';
import { createForm } from '@formily/core';
import { Schema, useField, useFieldSchema } from '@formily/react';
import { Spin } from 'antd';
import uniq from 'lodash/uniq';
import React, { createContext, useContext, useEffect, useMemo } from 'react';
import { useACLRoleContext } from '../acl';
import { useRequest } from '../api-client';
import { useCollection, useCollectionManager } from '../collection-manager';
import { FixedBlockWrapper } from '../schema-component';
import { toColumns } from '../schema-component/antd/kanban/Kanban';
import { BlockProvider, useBlockRequestContext } from './BlockProvider';
import { isAssocField } from '../filter-provider/utils';

export const KanbanBlockContext = createContext<any>({});

const useGroupField = (props) => {
  const { getCollectionField } = useCollectionManager();
  const { groupField, collection } = props;
  if (typeof groupField === 'string') {
    return getCollectionField(`${collection}.${groupField}`);
  }
  if (groupField?.name) {
    return getCollectionField(groupField?.name);
  }
};

const InternalKanbanBlockProvider = (props) => {
  const field = useField<any>();
  const { resource, service } = useBlockRequestContext();
  if (service.loading && !field.loaded) {
    return <Spin />;
  }
  field.loaded = true;
  return (
    <FixedBlockWrapper>
      <KanbanBlockContext.Provider
        value={{
          ...props,
          props: {
            resource: props.resource,
          },
          field,
          service,
          resource,
          fixedBlock: field?.decoratorProps?.fixedBlock,
        }}
      >
        {props.children}
      </KanbanBlockContext.Provider>
    </FixedBlockWrapper>
  );
};

const recursiveProperties = (schema: Schema, component = 'CollectionField', associationFields, appends: any = []) => {
  schema.mapProperties((s: any) => {
    const name = s.name.toString();
    if (s['x-component'] === component && !appends.includes(name)) {
      // 关联字段和关联的关联字段
      const [firstName] = name.split('.');
      if (associationFields.has(name)) {
        appends.push(name);
      } else if (associationFields.has(firstName) && !appends.includes(firstName)) {
        appends.push(firstName);
      }
    } else {
      recursiveProperties(s, component, associationFields, appends);
    }
  });
};

const useAssociationNames = (collection) => {
  const { getCollectionFields } = useCollectionManager();
  const collectionFields = getCollectionFields(collection);
  const associationFields = new Set();
  for (const collectionField of collectionFields) {
    if (collectionField.target) {
      associationFields.add(collectionField.name);
      const fields = getCollectionFields(collectionField.target);
      for (const field of fields) {
        if (field.target) {
          associationFields.add(`${collectionField.name}.${field.name}`);
        }
      }
    }
  }
  const fieldSchema = useFieldSchema();
  const kanbanSchema = fieldSchema.reduceProperties((buf, schema) => {
    if (schema['x-component'].startsWith('Kanban')) {
      return schema;
    }
    return buf;
  }, new Schema({}));
  const gridSchema: any = kanbanSchema?.properties?.card?.properties?.grid;
  const appends = [];
  if (gridSchema) {
    recursiveProperties(gridSchema, 'CollectionField', associationFields, appends);
  }

  return uniq(appends);
};

export const KanbanBlockProvider = (props) => {
  const params = { ...props.params };
  const appends = useAssociationNames(props.collection);
  const groupField: any = useGroupField(props);
  const isAssociationField = isAssocField(groupField);
  let assocService;
  if (!groupField) {
    return null;
  }
  if (isAssociationField) {
    const options = {
      url: `${groupField.target}:list`,
      params: {
        paginate: false,
        sort: ['sort'],
      },
    };
    assocService = useRequest(options);
    params['filter'] = {
      $and: [{ [groupField.name]: { id: { $notExists: true } } }],
    };
  } else {
    params['filter'] = {
      $and: [{ [groupField.name]: { $empty: true } }],
    };
  }
  if (!Object.keys(params).includes('appends')) {
    params['appends'] = appends;
  }
  return (
    <BlockProvider {...props} params={params} assocService={assocService}>
      <InternalKanbanBlockProvider {...props} params={params} assocService={assocService} groupField={groupField} />
    </BlockProvider>
  );
};

export const useKanbanBlockContext = () => {
  return useContext(KanbanBlockContext);
};

const useDisableCardDrag = () => {
  const ctx = useKanbanBlockContext();
  const { allowAll, allowConfigure, parseAction } = useACLRoleContext();
  if (allowAll || allowConfigure) {
    return false;
  }
  const result = parseAction(`${ctx?.props?.resource}:update`, { ignoreScope: true });
  return !result;
};

export const useKanbanBlockProps = () => {
  const field = useField<ArrayField>();
  const ctx = useKanbanBlockContext();
  useEffect(() => {
    if (!ctx?.service?.loading && !ctx?.assocService?.loading) {
      ctx.groupField.dataSource = ctx?.assocService?.data?.data;
      field.value = toColumns(ctx.groupField, ctx?.service?.data?.data);
    }
  }, [ctx?.service?.loading, ctx?.assocService?.loading]);

  return {
    groupField: ctx.groupField,
    disableCardDrag: useDisableCardDrag(),
    async onCardDragEnd({ columns, groupField }, { fromColumnId, fromPosition }, { toColumnId, toPosition }) {
      const sourceColumn = columns.find((column) => column.id === fromColumnId);
      const destinationColumn = columns.find((column) => column.id === toColumnId);
      const sourceCard = sourceColumn?.cards?.[fromPosition];
      const targetCard = destinationColumn?.cards?.[toPosition];
      const values = {
        sourceId: sourceCard.id,
        sortField: `${groupField.name}_sort`,
      };
      if (targetCard) {
        values['targetId'] = targetCard.id;
      } else {
        values['targetScope'] = {
          [groupField.name]: toColumnId,
        };
      }
      await ctx.resource.move(values);
      ctx.field.updateColumn = [fromColumnId, toColumnId];
    },
  };
};
