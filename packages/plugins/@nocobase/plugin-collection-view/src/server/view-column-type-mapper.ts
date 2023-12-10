import Database, { DBColumnTypeMapper } from '@nocobase/database';

type InferredField = {
  name: string;
  type: string;
  source?: string;
};

type InferredFieldResult = {
  [key: string]: InferredField;
};
export class ViewColumnTypeMapper {
  static async inferFields(options: {
    db: Database;
    viewName: string;
    viewSchema?: string;
  }): Promise<InferredFieldResult> {
    const { db } = options;
    if (!db.inDialect('postgres')) {
      options.viewSchema = undefined;
    }

    const columns = await db.sequelize.getQueryInterface().describeTable(options.viewName, options.viewSchema);

    const columnUsage = await db.queryInterface.viewColumnUsage({
      viewName: options.viewName,
      schema: options.viewSchema,
    });

    const rawFields = [];

    for (const [name, column] of Object.entries(columns)) {
      const inferResult: any = { name };

      const usage = columnUsage[name];

      if (usage) {
        const collection = db.tableNameCollectionMap.get(
          `${usage.table_schema ? `${usage.table_schema}.` : ''}${usage.table_name}`,
        );

        const collectionField = (() => {
          if (!collection) return false;

          const fieldAttribute = Object.values(collection.model.rawAttributes).find(
            (field) => field.field === usage.column_name,
          );

          if (!fieldAttribute) {
            return false;
          }

          // @ts-ignore
          const fieldName = fieldAttribute.fieldName;

          return collection.getField(fieldName);
        })();

        const belongsToAssociationField = (() => {
          if (!collection) return false;

          const field = Object.values(collection.model.rawAttributes).find(
            (field) => field.field === usage.column_name,
          );

          if (!field) {
            return false;
          }

          const association = Object.values(collection.model.associations).find(
            (association) =>
              association.associationType === 'BelongsTo' && association.foreignKey === (field as any).fieldName,
          );

          if (!association) {
            return false;
          }

          return collection.getField(association.as);
        })();

        if (belongsToAssociationField) {
          rawFields.push([
            belongsToAssociationField.name,
            {
              name: belongsToAssociationField.name,
              type: belongsToAssociationField.type,
              source: `${belongsToAssociationField.collection.name}.${belongsToAssociationField.name}`,
            },
          ]);
        }

        if (collectionField) {
          if (collectionField.options.interface) {
            inferResult.type = collectionField.type;
            inferResult.source = `${collectionField.collection.name}.${collectionField.name}`;
          }
        }
      }

      if (!inferResult.type) {
        Object.assign(
          inferResult,
          DBColumnTypeMapper.inferToFieldType({
            dialect: db.sequelize.getDialect(),
            name,
            type: column.type,
          }),
        );
      }

      rawFields.push([name, inferResult]);
    }

    return Object.fromEntries(rawFields);
  }
}