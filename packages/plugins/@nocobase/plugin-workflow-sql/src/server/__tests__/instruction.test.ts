import Database from '@nocobase/database';
import { Application } from '@nocobase/server';
import { EXECUTION_STATUS, JOB_STATUS } from '@nocobase/plugin-workflow';
import { getApp, sleep } from '@nocobase/plugin-workflow-test';

import Plugin from '..';

describe('workflow > instructions > sql', () => {
  let app: Application;
  let db: Database;
  let PostRepo;
  let PostCollection;
  let ReplyRepo;
  let WorkflowModel;
  let workflow;

  beforeEach(async () => {
    app = await getApp({
      plugins: [Plugin],
    });

    db = app.db;
    WorkflowModel = db.getCollection('workflows').model;
    PostCollection = db.getCollection('posts');
    PostRepo = PostCollection.repository;
    ReplyRepo = db.getCollection('replies').repository;

    workflow = await WorkflowModel.create({
      enabled: true,
      type: 'collection',
      config: {
        mode: 1,
        collection: 'posts',
      },
    });
  });

  afterEach(() => app.destroy());

  describe('invalid', () => {
    it('no sql', async () => {
      const n1 = await workflow.createNode({
        type: 'sql',
        config: {},
      });

      const post = await PostRepo.create({ values: { title: 't1' } });

      await sleep(500);

      const [execution] = await workflow.getExecutions();
      const [sqlJob] = await execution.getJobs({ order: [['id', 'ASC']] });
      expect(execution.status).toBe(EXECUTION_STATUS.RESOLVED);
      expect(sqlJob.status).toBe(JOB_STATUS.RESOLVED);
    });

    it('empty sql', async () => {
      const n1 = await workflow.createNode({
        type: 'sql',
        config: {
          sql: '',
        },
      });

      const post = await PostRepo.create({ values: { title: 't1' } });

      await sleep(500);

      const [execution] = await workflow.getExecutions();
      const [sqlJob] = await execution.getJobs({ order: [['id', 'ASC']] });
      expect(execution.status).toBe(EXECUTION_STATUS.RESOLVED);
      expect(sqlJob.status).toBe(JOB_STATUS.RESOLVED);
    });

    it('invalid sql', async () => {
      const n1 = await workflow.createNode({
        type: 'sql',
        config: {
          sql: '1',
        },
      });

      const post = await PostRepo.create({ values: { title: 't1' } });

      await sleep(500);

      const [execution] = await workflow.getExecutions();
      const [sqlJob] = await execution.getJobs({ order: [['id', 'ASC']] });
      expect(execution.status).toBe(EXECUTION_STATUS.ERROR);
      expect(sqlJob.status).toBe(JOB_STATUS.ERROR);
    });
  });

  describe('sql with variables', () => {
    it('update', async () => {
      const queryInterface = db.sequelize.getQueryInterface();
      const n1 = await workflow.createNode({
        type: 'sql',
        config: {
          sql: `update ${PostCollection.quotedTableName()} set ${queryInterface.quoteIdentifier(
            'read',
          )}={{$context.data.id}} where ${queryInterface.quoteIdentifier('id')}={{$context.data.id}}`,
        },
      });

      const n2 = await workflow.createNode({
        type: 'query',
        config: {
          collection: 'posts',
          params: {
            filter: {
              id: '{{ $context.data.id }}',
            },
          },
        },
        upstreamId: n1.id,
      });

      await n1.setDownstream(n2);

      const post = await PostRepo.create({ values: { title: 't1' } });

      await sleep(500);

      const [execution] = await workflow.getExecutions();
      const [sqlJob, queryJob] = await execution.getJobs({ order: [['id', 'ASC']] });
      expect(sqlJob.status).toBe(JOB_STATUS.RESOLVED);
      expect(queryJob.status).toBe(JOB_STATUS.RESOLVED);
      expect(queryJob.result.read).toBe(post.id);
    });

    it('delete', async () => {
      const queryInterface = db.sequelize.getQueryInterface();
      const n1 = await workflow.createNode({
        type: 'sql',
        config: {
          sql: `delete from ${PostCollection.quotedTableName()} where ${queryInterface.quoteIdentifier(
            'id',
          )}={{$context.data.id}};`,
        },
      });

      const n2 = await workflow.createNode({
        type: 'query',
        config: {
          collection: 'posts',
          params: {
            filter: {
              id: '{{ $context.data.id }}',
            },
          },
        },
        upstreamId: n1.id,
      });

      await n1.setDownstream(n2);

      const post = await PostRepo.create({ values: { title: 't1' } });

      await sleep(500);

      const [execution] = await workflow.getExecutions();
      const [sqlJob, queryJob] = await execution.getJobs({ order: [['id', 'ASC']] });
      expect(sqlJob.status).toBe(JOB_STATUS.RESOLVED);
      expect(queryJob.status).toBe(JOB_STATUS.RESOLVED);
      expect(queryJob.result).toBeNull();
    });
  });
});
