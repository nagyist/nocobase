import { expect, test } from '@nocobase/test/client';
import { dayjs } from '@nocobase/utils';
import { faker } from '@faker-js/faker';
import { e2e_GeneralFormsTable, appendJsonCollectionName } from '@nocobase/plugin-workflow-test/client';
import { CreateWorkFlow, EditWorkFlow, FromEventTriggerNode } from '@nocobase/plugin-workflow-test/client';
import { WorkflowManagement, WorkflowListRecords } from '@nocobase/plugin-workflow-test/client';

test.describe('Filter', () => {
    test('filter workflow name', async ({ page }) => {
        //用例标题
        const caseTitle = 'filter workflow name';

        // 1、前置条件：1.1、已登录,1.2、存在一个工作流
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        await page.getByLabel('action-Action-Add new-workflows').click();
        const createWorkFlow = new CreateWorkFlow(page);
        const workFlowName = caseTitle + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await createWorkFlow.name.fill(workFlowName);
        await createWorkFlow.triggerType.click();
        await page.getByRole('option', { name: 'Form event' }).click();
        await page.getByLabel('action-Action-Submit-workflows').click();

        await expect(page.getByText(workFlowName)).toBeAttached();

        // 2、测试步骤：进入“工作流管理”-“筛选”按钮，筛选工作流名称
        await page.getByLabel('action-Filter.Action-Filter-filter-workflows').click();
        await page.getByRole('textbox').fill(workFlowName);
        await page.getByRole('button', { name: 'Submit', exact: true }).click();

        // 3、预期结果：列表中出现筛选的工作流
        await expect(page.getByText(workFlowName)).toBeAttached();

        // 4、后置处理：删除工作流
        await page.getByLabel(`action-Action.Link-Delete-workflows-${workFlowName}`).click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();
        await expect(page.getByText(workFlowName)).toBeHidden();
    });
});

test.describe('Add new', () => {
    test('add new Form event', async ({ page }) => {
        //用例标题
        const caseTitle = 'add new Form event';

        // 1、前置条件：已登录

        // 2、测试步骤：进入“工作流管理”,新建工作流
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        await page.getByLabel('action-Action-Add new-workflows').click();
        const createWorkFlow = new CreateWorkFlow(page);
        const workFlowName = caseTitle + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await createWorkFlow.name.fill(workFlowName);
        await createWorkFlow.triggerType.click();
        await page.getByRole('option', { name: 'Form event' }).click();
        await page.getByLabel('action-Action-Submit-workflows').click();

        // 3、预期结果：列表中出现新建的工作流
        await expect(page.getByText(workFlowName)).toBeVisible();

        // 4、后置处理：删除工作流
        await page.getByLabel('action-Filter.Action-Filter-filter-workflows').click();
        await page.getByRole('textbox').fill(workFlowName);
        await page.getByRole('button', { name: 'Submit', exact: true }).click();
        await page.getByLabel(`action-Action.Link-Delete-workflows-${workFlowName}`).click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();
        await expect(page.getByText(workFlowName)).toBeHidden();
    });
});

test.describe('Sync', () => { });

test.describe('Delete', () => {
    test('delete Form event', async ({ page }) => {
        //用例标题
        const caseTitle = 'delete Form event';

        // 1、前置条件：已登录，存在一个工作流
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        await page.getByLabel('action-Action-Add new-workflows').click();
        const createWorkFlow = new CreateWorkFlow(page);
        const workFlowName = caseTitle + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await createWorkFlow.name.fill(workFlowName);
        await createWorkFlow.triggerType.click();
        await page.getByRole('option', { name: 'Form event' }).click();
        await page.getByLabel('action-Action-Submit-workflows').click();

        await expect(page.getByText(workFlowName)).toBeAttached();

        // 2、测试步骤：进入“工作流管理”-“删除”操作，删除工作流名称
        await page.getByLabel('action-Filter.Action-Filter-filter-workflows').click();
        await page.getByRole('textbox').fill(workFlowName);
        await page.getByRole('button', { name: 'Submit', exact: true }).click();
        await page.getByLabel(`action-Action.Link-Delete-workflows-${workFlowName}`).click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();

        // 3、预期结果：列表中出现筛选的工作流
        await expect(page.getByText(workFlowName)).toBeHidden();

        // 4、后置处理：删除工作流
    });
});

test.describe('Edit', () => {
    test('edit Form event name', async ({ page }) => {
        //用例标题
        const caseTitle = 'edit Form event name';

        // 1、前置条件：1.1、已登录,1.2、存在一个工作流
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        await page.getByLabel('action-Action-Add new-workflows').click();
        const createWorkFlow = new CreateWorkFlow(page);
        let workFlowName = caseTitle + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await createWorkFlow.name.fill(workFlowName);
        await createWorkFlow.triggerType.click();
        await page.getByRole('option', { name: 'Form event' }).click();
        await page.getByLabel('action-Action-Submit-workflows').click();

        await expect(page.getByText(workFlowName)).toBeAttached();

        // 2、测试步骤：进入“工作流管理”-“编辑”按钮，编辑名称，点击“确定”按钮
        await page.getByLabel(`action-Action.Link-Edit-workflows-${workFlowName}`).click();
        const editWorkFlow = new EditWorkFlow(page, workFlowName);
        workFlowName = caseTitle + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await createWorkFlow.name.fill(workFlowName);
        await page.getByLabel('action-Action-Submit-workflows').click();

        // 3、预期结果：编辑成功，列表中出现编辑后的工作流
        await expect(page.getByText(workFlowName)).toBeAttached();

        // 4、后置处理：删除工作流
        await page.getByLabel('action-Filter.Action-Filter-filter-workflows').click();
        await page.getByRole('textbox').fill(workFlowName);
        await page.getByRole('button', { name: 'Submit', exact: true }).click();
        await page.getByLabel(`action-Action.Link-Delete-workflows-${workFlowName}`).click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();
        await expect(page.getByText(workFlowName)).toBeHidden();
    });
});

test.describe('Duplicate', () => {
    test('Duplicate Form event triggers with only unconfigured trigger nodes', async ({ page }) => {
        //用例标题
        const caseTitle = 'Duplicate Form event triggers with only unconfigured trigger nodes';

        // 1、前置条件：1.1、已登录,1.2、存在一个工作流
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        await page.getByLabel('action-Action-Add new-workflows').click();
        const createWorkFlow = new CreateWorkFlow(page);
        const workFlowName = caseTitle + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await createWorkFlow.name.fill(workFlowName);
        await createWorkFlow.triggerType.click();
        await page.getByRole('option', { name: 'Form event' }).click();
        await page.getByLabel('action-Action-Submit-workflows').click();

        await expect(page.getByText(workFlowName)).toBeAttached();

        // 2、测试步骤：进入“工作流管理”-“复制”操作
        await page.getByLabel(`action-Action.Link-Duplicate-workflows-${workFlowName}`).click();
        await page.getByLabel(`action-Action-Submit-workflows-${workFlowName}`).click();

        // 3、预期结果：列表中出现筛选的工作流
        await expect(page.getByText(`${workFlowName} copy`)).toBeAttached();

        // 4、后置处理：删除工作流
        await page.getByLabel(`action-Action.Link-Delete-workflows-${workFlowName}  copy`).click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();
        await expect(page.getByText(`${workFlowName} copy`)).toBeHidden();

        await page.getByLabel(`action-Action.Link-Delete-workflows-${workFlowName}`).click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();
        await expect(page.getByText(workFlowName)).toBeHidden();
    });
});

test.describe('Executed', () => { });

test.describe('Configuration page to configure the Trigger node', () => {
    test('Form Submit Button Binding Workflow Add Data Trigger', async ({ page, mockPage }) => {
        //后缀标识，用于不同用例调用e2eTemplateJson.ts中相同模板JSON生成不同的数据表标识、名称
        const appendText = faker.lorem.word(4);
        //用例标题
        const caseTitle = 'Form Submit Button Binding Workflow Add Data Trigger';

        // 1、前置条件：1.1、已登录;1.2、存在一个配置好数据表的表单事件工作流；1.3、存在一个添加数据的区块
        //创建数据表
        const e2eJsonCollectionDisplayName = '自动>组织[普通表]';
        const e2eJsonCollectionName = 'tt_amt_org';

        const collectionDisplayName = e2eJsonCollectionDisplayName + appendText;
        const collectionName = e2eJsonCollectionName + appendText;
        const fieldName = 'orgname';
        const fieldDisplayName = '公司名称(单行文本)';

        //创建数据表
        const newPage = mockPage(appendJsonCollectionName(JSON.parse(JSON.stringify(e2e_GeneralFormsTable)), appendText));
        //配置工作流
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        const workflowManagement = new WorkflowManagement(page);
        await workflowManagement.addNewButton.click();
        const createWorkFlow = new CreateWorkFlow(page);
        const workFlowName = caseTitle + appendText;
        await createWorkFlow.name.fill(workFlowName);
        await createWorkFlow.triggerType.click();
        await page.getByRole('option', { name: 'Form event' }).click();
        await createWorkFlow.submitButton.click();
        await expect(page.getByText(workFlowName)).toBeVisible();

        //配置工作流触发器
        const workflowListRecords = new WorkflowListRecords(page, workFlowName);
        await workflowListRecords.configureAction.click();
        const fromEventTriggerNode = new FromEventTriggerNode(page, workFlowName, collectionName);
        await fromEventTriggerNode.nodeConfigure.click();
        await fromEventTriggerNode.collectionDropDown.click();
        await page.getByRole('option', { name: collectionDisplayName }).click();
        await fromEventTriggerNode.submitButton.click();
        await page.getByRole('link', { name: 'Workflow' }).click();
        await workflowListRecords.editAction.click();
        const editWorkFlow = new EditWorkFlow(page, workFlowName);
        await editWorkFlow.statusIsOn.check();
        await editWorkFlow.submitButton.click();

        //配置录入数据区块
        await newPage.goto();
        await page.waitForLoadState('networkidle');
        await page.getByLabel('schema-initializer-Grid-BlockInitializers').hover();
        await page.getByRole('menuitem', { name: 'table Table' }).hover();
        await page.getByRole('menuitem', { name: `${collectionDisplayName}` }).click();

        // 移开鼠标，关闭菜单
        await page.mouse.move(300, 0);

        await page.getByText('Configure columns').hover();
        await page.getByText(fieldDisplayName).click();
        await page.getByText('Configure actions').hover();
        await page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch').click();
        await expect(page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch')).toBeEnabled();

        await page.getByLabel(`action-Action-Add new-create-${collectionName}-table`).click();
        await page.getByLabel(`schema-initializer-Grid-CreateFormBlockInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: 'form Form' }).click();

        // 移开鼠标，关闭菜单
        await page.mouse.move(300, 0);

        await page.getByLabel(`schema-initializer-ActionBar-CreateFormActionInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: 'Submit' }).click();
        // 绑定工作流
        await page.getByLabel(`schema-initializer-Grid-FormItemInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: `${fieldDisplayName}` }).click();
        await page.mouse.move(300, 0);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`).hover();
        await page
            .getByRole('button', { name: `designer-schema-settings-Action-Action.Designer-${collectionName}` })
            .hover();
        await page.getByRole('menuitem', { name: 'Bind workflows' }).click();
        await page.getByRole('button', { name: 'plus Add workflow' }).click();
        await page.getByRole('button', { name: 'Select workflow' }).getByLabel('Search').click();
        await page.getByRole('option', { name: workFlowName }).click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();

        // 2、测试步骤：进入“数据区块”-“添加”按钮，填写表单，点击“确定”按钮
        const fieldData = fieldDisplayName + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await page.getByRole('textbox').fill(fieldData);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`, { exact: true }).click();

        // 3、预期结果：数据添加成功，工作流成功触发
        await expect(page.getByText(fieldData)).toBeVisible();
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        await expect(workflowListRecords.executionCountPopup).toHaveText('1');

        // 4、后置处理：删除工作流
        await workflowListRecords.deleteAction.click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();
        await expect(page.getByText(workFlowName)).toBeHidden();
    });

    test('Form Submit to Workflow Button Add Data Trigger', async ({ page, mockPage }) => {
        //后缀标识，用于不同用例调用e2eTemplateJson.ts中相同模板JSON生成不同的数据表标识、名称
        const appendText = faker.lorem.word(4);
        //用例标题
        const caseTitle = 'Form Submit to Workflow Button Add Data Trigger';

        // 1、前置条件：1.1、已登录;1.2、存在一个配置好数据表的表单事件工作流；1.3、存在一个添加数据的区块
        //创建数据表
        const e2eJsonCollectionDisplayName = '自动>组织[普通表]';
        const e2eJsonCollectionName = 'tt_amt_org';

        const collectionDisplayName = e2eJsonCollectionDisplayName + appendText;
        const collectionName = e2eJsonCollectionName + appendText;
        const fieldName = 'orgname';
        const fieldDisplayName = '公司名称(单行文本)';

        //创建数据表
        const newPage = mockPage(appendJsonCollectionName(JSON.parse(JSON.stringify(e2e_GeneralFormsTable)), appendText));
        //配置工作流
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        const workflowManagement = new WorkflowManagement(page);
        await workflowManagement.addNewButton.click();
        const createWorkFlow = new CreateWorkFlow(page);
        const workFlowName = caseTitle + appendText;
        await createWorkFlow.name.fill(workFlowName);
        await createWorkFlow.triggerType.click();
        await page.getByRole('option', { name: 'Form event' }).click();
        await createWorkFlow.submitButton.click();
        await expect(page.getByText(workFlowName)).toBeVisible();

        //配置工作流触发器
        const workflowListRecords = new WorkflowListRecords(page, workFlowName);
        await workflowListRecords.configureAction.click();
        const fromEventTriggerNode = new FromEventTriggerNode(page, workFlowName, collectionName);
        await fromEventTriggerNode.nodeConfigure.click();
        await fromEventTriggerNode.collectionDropDown.click();
        await page.getByRole('option', { name: collectionDisplayName }).click();
        await fromEventTriggerNode.submitButton.click();
        await page.getByRole('link', { name: 'Workflow' }).click();
        await workflowListRecords.editAction.click();
        const editWorkFlow = new EditWorkFlow(page, workFlowName);
        await editWorkFlow.statusIsOn.check();
        await editWorkFlow.submitButton.click();

        //配置录入数据区块
        await newPage.goto();
        await page.waitForLoadState('networkidle');
        await page.getByLabel('schema-initializer-Grid-BlockInitializers').hover();
        await page.getByRole('menuitem', { name: 'table Table' }).hover();
        await page.getByRole('menuitem', { name: `${collectionDisplayName}` }).click();

        // 移开鼠标，关闭菜单
        await page.mouse.move(300, 0);

        await page.getByText('Configure columns').hover();
        await page.getByText(fieldDisplayName).click();
        await page.getByText('Configure actions').hover();
        await page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch').click();
        await expect(page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch')).toBeEnabled();

        await page.getByLabel(`action-Action-Add new-create-${collectionName}-table`).click();
        await page.getByLabel(`schema-initializer-Grid-CreateFormBlockInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: 'form Form' }).click();

        // 移开鼠标，关闭菜单
        await page.mouse.move(300, 0);

        // 绑定工作流
        await page.getByLabel(`schema-initializer-ActionBar-CreateFormActionInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: 'Customize' }).hover();
        await page.getByRole('menuitem', { name: 'Submit to workflow' }).click();
        await page.getByLabel(`schema-initializer-Grid-FormItemInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: `${fieldDisplayName}` }).click();
        await page.mouse.move(300, 0);
        await page.getByRole('button', { name: 'Submit to workflow' }).hover();
        await page
            .getByRole('button', { name: `designer-schema-settings-Action-Action.Designer-${collectionName}` })
            .hover();
        await page.getByRole('menuitem', { name: 'Bind workflows' }).click();
        await page.getByRole('button', { name: 'plus Add workflow' }).click();
        await page.getByRole('button', { name: 'Select workflow' }).getByLabel('Search').click();
        await page.getByRole('option', { name: workFlowName }).click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();

        // 2、测试步骤：进入“数据区块”-“添加”按钮，填写表单，点击“确定”按钮
        const fieldData = fieldDisplayName + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await page.getByRole('textbox').fill(fieldData);
        await page.getByLabel(`action-Action-Submit to workflow-customize:triggerWorkflows-${collectionName}-form`).click();

        // 3、预期结果：数据未添加到数据表，工作流成功触发
        await expect(page.getByText(fieldData)).toBeHidden();
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        await expect(workflowListRecords.executionCountPopup).toHaveText('1');

        // 4、后置处理：删除工作流
        await workflowListRecords.deleteAction.click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();
        await expect(page.getByText(workFlowName)).toBeHidden();
    });
});

test.describe('Configuration Page Path Jump Workflow Management Page', () => {
    test('Form event Workflow Configuration Page Path Jump Workflow Management Page', async ({ page, mockPage }) => {
        //后缀标识，用于不同用例调用e2eTemplateJson.ts中相同模板JSON生成不同的数据表标识、名称
        const appendText = faker.lorem.word(4);
        //用例标题
        const caseTitle = 'Form event Workflow Configuration Page Path Jump Workflow Management Page';

        // 1、前置条件：1.1、已登录;1.2、存在一个配置好数据表的表单事件工作流；1.3、存在一个添加数据的区块
        //创建数据表
        const e2eJsonCollectionDisplayName = '自动>组织[普通表]';
        const e2eJsonCollectionName = 'tt_amt_org';

        const collectionDisplayName = e2eJsonCollectionDisplayName + appendText;
        const collectionName = e2eJsonCollectionName + appendText;
        const fieldName = 'orgname';
        const fieldDisplayName = '公司名称(单行文本)';

        //创建数据表
        // const newPage = mockPage(appendJsonCollectionName(JSON.parse(JSON.stringify(e2e_GeneralFormsTable)), appendText));
        //配置工作流
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        const workflowManagement = new WorkflowManagement(page);
        await workflowManagement.addNewButton.click();
        const createWorkFlow = new CreateWorkFlow(page);
        const workFlowName = caseTitle + appendText;
        await createWorkFlow.name.fill(workFlowName);
        await createWorkFlow.triggerType.click();
        await page.getByRole('option', { name: 'Form event' }).click();
        await createWorkFlow.submitButton.click();
        await expect(page.getByText(workFlowName)).toBeVisible();

        //配置工作流触发器
        const workflowListRecords = new WorkflowListRecords(page, workFlowName);
        await workflowListRecords.configureAction.click();

        // 2、测试步骤：跳转到工作流管理页面
        await page.getByRole('link', { name: 'Workflow' }).click();

        // 3、预期结果：跳转路径正确
        await page.waitForLoadState('networkidle');
        expect(page.url()).toBe(`${process.env.APP_BASE_URL}/admin/settings/workflow`);

        // 4、后置处理：删除工作流
        await workflowListRecords.deleteAction.click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();
        await expect(page.getByText(workFlowName)).toBeHidden();
    });

    test('Form event Workflow History Version Configuration Page Path Jump Workflow Management Page', async ({
        page,
        mockPage,
    }) => {
        //后缀标识，用于不同用例调用e2eTemplateJson.ts中相同模板JSON生成不同的数据表标识、名称
        const appendText = faker.lorem.word(4);
        //用例标题
        const caseTitle = 'Form event Workflow History Version Configuration Page Path Jump Workflow Management Page';

        // 1、前置条件：1.1、已登录;1.2、存在一个配置好数据表的表单事件工作流；1.3、存在一个添加数据的区块
        //创建数据表
        const e2eJsonCollectionDisplayName = '自动>组织[普通表]';
        const e2eJsonCollectionName = 'tt_amt_org';

        const collectionDisplayName = e2eJsonCollectionDisplayName + appendText;
        const collectionName = e2eJsonCollectionName + appendText;
        const fieldName = 'orgname';
        const fieldDisplayName = '公司名称(单行文本)';

        //创建数据表
        const newPage = mockPage(appendJsonCollectionName(JSON.parse(JSON.stringify(e2e_GeneralFormsTable)), appendText));
        //配置工作流
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        const workflowManagement = new WorkflowManagement(page);
        await workflowManagement.addNewButton.click();
        const createWorkFlow = new CreateWorkFlow(page);
        const workFlowName = caseTitle + appendText;
        await createWorkFlow.name.fill(workFlowName);
        await createWorkFlow.triggerType.click();
        await page.getByRole('option', { name: 'Form event' }).click();
        await createWorkFlow.submitButton.click();
        await expect(page.getByText(workFlowName)).toBeVisible();

        //配置工作流触发器
        const workflowListRecords = new WorkflowListRecords(page, workFlowName);
        await workflowListRecords.configureAction.click();
        const fromEventTriggerNode = new FromEventTriggerNode(page, workFlowName, collectionName);
        await fromEventTriggerNode.nodeConfigure.click();
        await fromEventTriggerNode.collectionDropDown.click();
        await page.getByRole('option', { name: collectionDisplayName }).click();
        await fromEventTriggerNode.submitButton.click();
        await page.getByRole('link', { name: 'Workflow' }).click();
        await workflowListRecords.editAction.click();
        const editWorkFlow = new EditWorkFlow(page, workFlowName);
        await editWorkFlow.statusIsOn.check();
        await editWorkFlow.submitButton.click();

        //配置录入数据区块
        await newPage.goto();
        await page.waitForLoadState('networkidle');
        await page.getByLabel('schema-initializer-Grid-BlockInitializers').hover();
        await page.getByRole('menuitem', { name: 'table Table' }).hover();
        await page.getByRole('menuitem', { name: `${collectionDisplayName}` }).click();

        // 移开鼠标，关闭菜单
        await page.mouse.move(300, 0);

        await page.getByText('Configure columns').hover();
        await page.getByText(fieldDisplayName).click();
        await page.getByText('Configure actions').hover();
        await page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch').click();
        await expect(page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch')).toBeEnabled();

        await page.getByLabel(`action-Action-Add new-create-${collectionName}-table`).click();
        await page.getByLabel(`schema-initializer-Grid-CreateFormBlockInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: 'form Form' }).click();

        // 移开鼠标，关闭菜单
        await page.mouse.move(300, 0);

        await page.getByLabel(`schema-initializer-ActionBar-CreateFormActionInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: 'Submit' }).click();
        // 绑定工作流
        await page.getByLabel(`schema-initializer-Grid-FormItemInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: `${fieldDisplayName}` }).click();
        await page.mouse.move(300, 0);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`).hover();
        await page
            .getByRole('button', { name: `designer-schema-settings-Action-Action.Designer-${collectionName}` })
            .hover();
        await page.getByRole('menuitem', { name: 'Bind workflows' }).click();
        await page.getByRole('button', { name: 'plus Add workflow' }).click();
        await page.getByRole('button', { name: 'Select workflow' }).getByLabel('Search').click();
        await page.getByRole('option', { name: workFlowName }).click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();

        // 2、测试步骤：进入“数据区块”页面，添加一条数据,再进入工作流配置界面，复制到新版本
        const fieldData = fieldDisplayName + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await page.getByRole('textbox').fill(fieldData);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`, { exact: true }).click();
        await expect(page.getByText(fieldData)).toBeVisible();
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        await expect(workflowListRecords.executionCountPopup).toHaveText('1');

        await workflowListRecords.configureAction.click();
        await page.getByLabel('more').click();
        await page.getByLabel('revision').click();
        await page.waitForLoadState('networkidle');
        //元素重复
        await page.getByLabel('version', { exact: true }).click();
        await page.getByLabel('version-1').click();

        await page.getByRole('link', { name: 'Workflow' }).click();

        // 3、预期结果：跳转路径正确
        await page.waitForLoadState('networkidle');
        expect(page.url()).toBe(`${process.env.APP_BASE_URL}/admin/settings/workflow`);

        // 4、后置处理：删除工作流
        await workflowListRecords.deleteAction.click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();
        await expect(page.getByText(workFlowName)).toBeHidden();
    });

    test('Form event Workflow Execution Log Page Path Jump Workflow Management Page', async ({ page, mockPage }) => {
        //后缀标识，用于不同用例调用e2eTemplateJson.ts中相同模板JSON生成不同的数据表标识、名称
        const appendText = faker.lorem.word(4);
        //用例标题
        const caseTitle = 'Form event Workflow Execution Log Page Path Jump Workflow Management Page';

        // 1、前置条件：1.1、已登录;1.2、存在一个配置好数据表的表单事件工作流；1.3、存在一个添加数据的区块
        //创建数据表
        const e2eJsonCollectionDisplayName = '自动>组织[普通表]';
        const e2eJsonCollectionName = 'tt_amt_org';

        const collectionDisplayName = e2eJsonCollectionDisplayName + appendText;
        const collectionName = e2eJsonCollectionName + appendText;
        const fieldName = 'orgname';
        const fieldDisplayName = '公司名称(单行文本)';

        //创建数据表
        const newPage = mockPage(appendJsonCollectionName(JSON.parse(JSON.stringify(e2e_GeneralFormsTable)), appendText));
        //配置工作流
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        const workflowManagement = new WorkflowManagement(page);
        await workflowManagement.addNewButton.click();
        const createWorkFlow = new CreateWorkFlow(page);
        const workFlowName = caseTitle + appendText;
        await createWorkFlow.name.fill(workFlowName);
        await createWorkFlow.triggerType.click();
        await page.getByRole('option', { name: 'Form event' }).click();
        await createWorkFlow.submitButton.click();
        await expect(page.getByText(workFlowName)).toBeVisible();

        //配置工作流触发器
        const workflowListRecords = new WorkflowListRecords(page, workFlowName);
        await workflowListRecords.configureAction.click();
        const fromEventTriggerNode = new FromEventTriggerNode(page, workFlowName, collectionName);
        await fromEventTriggerNode.nodeConfigure.click();
        await fromEventTriggerNode.collectionDropDown.click();
        await page.getByRole('option', { name: collectionDisplayName }).click();
        await fromEventTriggerNode.submitButton.click();
        await page.getByRole('link', { name: 'Workflow' }).click();
        await workflowListRecords.editAction.click();
        const editWorkFlow = new EditWorkFlow(page, workFlowName);
        await editWorkFlow.statusIsOn.check();
        await editWorkFlow.submitButton.click();

        //配置录入数据区块
        await newPage.goto();
        await page.waitForLoadState('networkidle');
        await page.getByLabel('schema-initializer-Grid-BlockInitializers').hover();
        await page.getByRole('menuitem', { name: 'table Table' }).hover();
        await page.getByRole('menuitem', { name: `${collectionDisplayName}` }).click();

        // 移开鼠标，关闭菜单
        await page.mouse.move(300, 0);

        await page.getByText('Configure columns').hover();
        await page.getByText(fieldDisplayName).click();
        await page.getByText('Configure actions').hover();
        await page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch').click();
        await expect(page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch')).toBeEnabled();

        await page.getByLabel(`action-Action-Add new-create-${collectionName}-table`).click();
        await page.getByLabel(`schema-initializer-Grid-CreateFormBlockInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: 'form Form' }).click();

        // 移开鼠标，关闭菜单
        await page.mouse.move(300, 0);

        await page.getByLabel(`schema-initializer-ActionBar-CreateFormActionInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: 'Submit' }).click();
        // 绑定工作流
        await page.getByLabel(`schema-initializer-Grid-FormItemInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: `${fieldDisplayName}` }).click();
        await page.mouse.move(300, 0);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`).hover();
        await page
            .getByRole('button', { name: `designer-schema-settings-Action-Action.Designer-${collectionName}` })
            .hover();
        await page.getByRole('menuitem', { name: 'Bind workflows' }).click();
        await page.getByRole('button', { name: 'plus Add workflow' }).click();
        await page.getByRole('button', { name: 'Select workflow' }).getByLabel('Search').click();
        await page.getByRole('option', { name: workFlowName }).click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();

        // 2、测试步骤：进入“数据区块”页面，添加一条数据,再进入工作流执行日志界面，返回工作流管理界面
        const fieldData = fieldDisplayName + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await page.getByRole('textbox').fill(fieldData);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`, { exact: true }).click();
        await expect(page.getByText(fieldData)).toBeVisible();
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        await expect(workflowListRecords.executionCountPopup).toHaveText('1');
        await workflowListRecords.executionCountPopup.click();
        await page.getByText('View').click();
        await page.waitForLoadState('networkidle');
        await page.getByRole('link', { name: 'Workflow', exact: true }).click();

        // 3、预期结果：跳转路径正确
        await page.waitForLoadState('networkidle');
        expect(page.url()).toBe(`${process.env.APP_BASE_URL}/admin/settings/workflow`);

        // 4、后置处理：删除工作流
        await workflowListRecords.deleteAction.click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();
        await expect(page.getByText(workFlowName)).toBeHidden();
    });

    test.skip('Form event Workflow Execution Log Page Path Jump Execution Log Screen', async ({ page, mockPage }) => {
        //后缀标识，用于不同用例调用e2eTemplateJson.ts中相同模板JSON生成不同的数据表标识、名称
        const appendText = faker.lorem.word(4);
        //用例标题
        const caseTitle = 'Form event Workflow Execution Log Page Path Jump Execution Log Screen';

        // 1、前置条件：1.1、已登录;1.2、存在一个配置好数据表的表单事件工作流；1.3、存在一个添加数据的区块
        //创建数据表
        const e2eJsonCollectionDisplayName = '自动>组织[普通表]';
        const e2eJsonCollectionName = 'tt_amt_org';

        const collectionDisplayName = e2eJsonCollectionDisplayName + appendText;
        const collectionName = e2eJsonCollectionName + appendText;
        const fieldName = 'orgname';
        const fieldDisplayName = '公司名称(单行文本)';

        //创建数据表
        const newPage = mockPage(appendJsonCollectionName(JSON.parse(JSON.stringify(e2e_GeneralFormsTable)), appendText));
        //配置工作流
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        const workflowManagement = new WorkflowManagement(page);
        await workflowManagement.addNewButton.click();
        const createWorkFlow = new CreateWorkFlow(page);
        const workFlowName = caseTitle + appendText;
        await createWorkFlow.name.fill(workFlowName);
        await createWorkFlow.triggerType.click();
        await page.getByRole('option', { name: 'Form event' }).click();
        await createWorkFlow.submitButton.click();
        await expect(page.getByText(workFlowName)).toBeVisible();

        //配置工作流触发器
        const workflowListRecords = new WorkflowListRecords(page, workFlowName);
        await workflowListRecords.configureAction.click();
        const fromEventTriggerNode = new FromEventTriggerNode(page, workFlowName, collectionName);
        await fromEventTriggerNode.nodeConfigure.click();
        await fromEventTriggerNode.collectionDropDown.click();
        await page.getByRole('option', { name: collectionDisplayName }).click();
        await fromEventTriggerNode.submitButton.click();
        await page.getByRole('link', { name: 'Workflow' }).click();
        await workflowListRecords.editAction.click();
        const editWorkFlow = new EditWorkFlow(page, workFlowName);
        await editWorkFlow.statusIsOn.check();
        await editWorkFlow.submitButton.click();

        //配置录入数据区块
        await newPage.goto();
        await page.waitForLoadState('networkidle');
        await page.getByLabel('schema-initializer-Grid-BlockInitializers').hover();
        await page.getByRole('menuitem', { name: 'table Table' }).hover();
        await page.getByRole('menuitem', { name: `${collectionDisplayName}` }).click();

        // 移开鼠标，关闭菜单
        await page.mouse.move(300, 0);

        await page.getByText('Configure columns').hover();
        await page.getByText(fieldDisplayName).click();
        await page.getByText('Configure actions').hover();
        await page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch').click();
        await expect(page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch')).toBeEnabled();

        await page.getByLabel(`action-Action-Add new-create-${collectionName}-table`).click();
        await page.getByLabel(`schema-initializer-Grid-CreateFormBlockInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: 'form Form' }).click();

        // 移开鼠标，关闭菜单
        await page.mouse.move(300, 0);

        await page.getByLabel(`schema-initializer-ActionBar-CreateFormActionInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: 'Submit' }).click();
        // 绑定工作流
        await page.getByLabel(`schema-initializer-Grid-FormItemInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: `${fieldDisplayName}` }).click();
        await page.mouse.move(300, 0);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`).hover();
        await page
            .getByRole('button', { name: `designer-schema-settings-Action-Action.Designer-${collectionName}` })
            .hover();
        await page.getByRole('menuitem', { name: 'Bind workflows' }).click();
        await page.getByRole('button', { name: 'plus Add workflow' }).click();
        await page.getByRole('button', { name: 'Select workflow' }).getByLabel('Search').click();
        await page.getByRole('option', { name: workFlowName }).click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();

        // 2、测试步骤：进入“数据区块”页面，添加一条数据,再进入工作流执行日志界面，返回工作流管理界面
        const fieldData = fieldDisplayName + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await page.getByRole('textbox').fill(fieldData);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`, { exact: true }).click();
        await expect(page.getByText(fieldData)).toBeVisible();
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        await expect(workflowListRecords.executionCountPopup).toHaveText('1');
        await workflowListRecords.executionCountPopup.click();
        await page.getByText('View').click();
        await page.waitForLoadState('networkidle');
        //跳转其他执行日志界面，元素无法定位

        // 3、预期结果：跳转路径正确
        await page.waitForLoadState('networkidle');
        // expect(page.url()).toBe(`${process.env.APP_BASE_URL}/admin/settings/workflow`);

        // 4、后置处理：删除工作流
        await workflowListRecords.deleteAction.click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();
        await expect(page.getByText(workFlowName)).toBeHidden();
    });
});

test.describe('Configuration page version switching', () => { });

test.describe('Configuration page disable enable', () => {
    test('Form event Workflow Add Data Trigger Disable Do Not Trigger', async ({ page, mockPage }) => {
        //后缀标识，用于不同用例调用e2eTemplateJson.ts中相同模板JSON生成不同的数据表标识、名称
        const appendText = faker.lorem.word(4);
        //用例标题
        const caseTitle = 'Form event Workflow Add Data Trigger Disable Do Not Trigger';

        // 1、前置条件：1.1、已登录;1.2、存在一个配置好数据表的数据表事件工作流；1.3、存在一个添加数据的区块
        //创建数据表
        const e2eJsonCollectionDisplayName = '自动>组织[普通表]';
        const e2eJsonCollectionName = 'tt_amt_org';

        const collectionDisplayName = e2eJsonCollectionDisplayName + appendText;
        const collectionName = e2eJsonCollectionName + appendText;
        const fieldName = 'orgname';
        const fieldDisplayName = '公司名称(单行文本)';

        //创建数据表
        const newPage = mockPage(appendJsonCollectionName(JSON.parse(JSON.stringify(e2e_GeneralFormsTable)), appendText));
        //配置工作流
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        const workflowManagement = new WorkflowManagement(page);
        await workflowManagement.addNewButton.click();
        const createWorkFlow = new CreateWorkFlow(page);
        const workFlowName = caseTitle + appendText;
        await createWorkFlow.name.fill(workFlowName);
        await createWorkFlow.triggerType.click();
        await page.getByRole('option', { name: 'Form event' }).click();
        await createWorkFlow.submitButton.click();
        await expect(page.getByText(workFlowName)).toBeVisible();

        //配置工作流触发器
        const workflowListRecords = new WorkflowListRecords(page, workFlowName);
        await workflowListRecords.configureAction.click();
        const fromEventTriggerNode = new FromEventTriggerNode(page, workFlowName, collectionName);
        await fromEventTriggerNode.nodeConfigure.click();
        await fromEventTriggerNode.collectionDropDown.click();
        await page.getByRole('option', { name: collectionDisplayName }).click();
        await fromEventTriggerNode.submitButton.click();
        await page.getByRole('link', { name: 'Workflow' }).click();
        await workflowListRecords.editAction.click();
        const editWorkFlow = new EditWorkFlow(page, workFlowName);
        await editWorkFlow.statusIsOn.check();
        await editWorkFlow.submitButton.click();

        //配置录入数据区块
        await newPage.goto();
        await page.waitForLoadState('networkidle');
        await page.getByLabel('schema-initializer-Grid-BlockInitializers').hover();
        await page.getByRole('menuitem', { name: 'table Table' }).hover();
        await page.getByRole('menuitem', { name: `${collectionDisplayName}` }).click();

        // 移开鼠标，关闭菜单
        await page.mouse.move(300, 0);

        await page.getByText('Configure columns').hover();
        await page.getByText(fieldDisplayName).click();
        await page.getByText('Configure actions').hover();
        await page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch').click();
        await expect(page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch')).toBeEnabled();

        await page.getByLabel(`action-Action-Add new-create-${collectionName}-table`).click();
        await page.getByLabel(`schema-initializer-Grid-CreateFormBlockInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: 'form Form' }).click();

        // 移开鼠标，关闭菜单
        await page.mouse.move(300, 0);

        await page.getByLabel(`schema-initializer-ActionBar-CreateFormActionInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: 'Submit' }).click();
        // 绑定工作流
        await page.getByLabel(`schema-initializer-Grid-FormItemInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: `${fieldDisplayName}` }).click();
        await page.mouse.move(300, 0);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`).hover();
        await page
            .getByRole('button', { name: `designer-schema-settings-Action-Action.Designer-${collectionName}` })
            .hover();
        await page.getByRole('menuitem', { name: 'Bind workflows' }).click();
        await page.getByRole('button', { name: 'plus Add workflow' }).click();
        await page.getByRole('button', { name: 'Select workflow' }).getByLabel('Search').click();
        await page.getByRole('option', { name: workFlowName }).click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();

        await page.mouse.move(300, 0);

        // 2、测试步骤：数据区块添加数据触发工作流，禁用工作流，添加数据不触发工作流
        let fieldData = fieldDisplayName + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await page.getByRole('textbox').fill(fieldData);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`, { exact: true }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText(fieldData)).toBeVisible();
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        await expect(workflowListRecords.executionCountPopup).toHaveText('1');
        await workflowListRecords.configureAction.click();
        await page.waitForLoadState('networkidle');
        await page.getByRole('switch', { name: 'On Off' }).click();
        // await expect(page.getByRole('switch', { name: 'On Off' })).toBeDisabled();
        await newPage.goto();
        await page.getByLabel(`action-Action-Add new-create-${collectionName}-table`).click();
        fieldData = fieldDisplayName + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await page.getByRole('textbox').fill(fieldData);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`, { exact: true }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText(fieldData)).toBeVisible();
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        // 3、预期结果：触发次数为1
        await expect(workflowListRecords.executionCountPopup).toHaveText('1');

        // 4、后置处理：删除工作流
        await workflowListRecords.deleteAction.click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();
        await expect(page.getByText(workFlowName)).toBeHidden();
    });

    test('Form event Workflow Add Data Trigger Disable Enable Post Trigger', async ({ page, mockPage }) => {
        //后缀标识，用于不同用例调用e2eTemplateJson.ts中相同模板JSON生成不同的数据表标识、名称
        const appendText = faker.lorem.word(4);
        //用例标题
        const caseTitle = 'Form event Workflow Add Data Trigger Disable Enable Post Trigger';

        // 1、前置条件：1.1、已登录;1.2、存在一个配置好数据表的数据表事件工作流；1.3、存在一个添加数据的区块
        //创建数据表
        const e2eJsonCollectionDisplayName = '自动>组织[普通表]';
        const e2eJsonCollectionName = 'tt_amt_org';

        const collectionDisplayName = e2eJsonCollectionDisplayName + appendText;
        const collectionName = e2eJsonCollectionName + appendText;
        const fieldName = 'orgname';
        const fieldDisplayName = '公司名称(单行文本)';

        //创建数据表
        const newPage = mockPage(appendJsonCollectionName(JSON.parse(JSON.stringify(e2e_GeneralFormsTable)), appendText));
        //配置工作流
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        const workflowManagement = new WorkflowManagement(page);
        await workflowManagement.addNewButton.click();
        const createWorkFlow = new CreateWorkFlow(page);
        const workFlowName = caseTitle + appendText;
        await createWorkFlow.name.fill(workFlowName);
        await createWorkFlow.triggerType.click();
        await page.getByRole('option', { name: 'Form event' }).click();
        await createWorkFlow.submitButton.click();
        await expect(page.getByText(workFlowName)).toBeVisible();

        //配置工作流触发器
        const workflowListRecords = new WorkflowListRecords(page, workFlowName);
        await workflowListRecords.configureAction.click();
        const fromEventTriggerNode = new FromEventTriggerNode(page, workFlowName, collectionName);
        await fromEventTriggerNode.nodeConfigure.click();
        await fromEventTriggerNode.collectionDropDown.click();
        await page.getByRole('option', { name: collectionDisplayName }).click();
        await fromEventTriggerNode.submitButton.click();
        await page.getByRole('link', { name: 'Workflow' }).click();
        await workflowListRecords.editAction.click();
        const editWorkFlow = new EditWorkFlow(page, workFlowName);
        await editWorkFlow.statusIsOn.check();
        await editWorkFlow.submitButton.click();

        //配置录入数据区块
        await newPage.goto();
        await page.waitForLoadState('networkidle');
        await page.getByLabel('schema-initializer-Grid-BlockInitializers').hover();
        await page.getByRole('menuitem', { name: 'table Table' }).hover();
        await page.getByRole('menuitem', { name: `${collectionDisplayName}` }).click();

        // 移开鼠标，关闭菜单
        await page.mouse.move(300, 0);

        await page.getByText('Configure columns').hover();
        await page.getByText(fieldDisplayName).click();
        await page.getByText('Configure actions').hover();
        await page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch').click();
        await expect(page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch')).toBeEnabled();

        await page.getByLabel(`action-Action-Add new-create-${collectionName}-table`).click();
        await page.getByLabel(`schema-initializer-Grid-CreateFormBlockInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: 'form Form' }).click();

        // 移开鼠标，关闭菜单
        await page.mouse.move(300, 0);

        await page.getByLabel(`schema-initializer-ActionBar-CreateFormActionInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: 'Submit' }).click();
        // 绑定工作流
        await page.getByLabel(`schema-initializer-Grid-FormItemInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: `${fieldDisplayName}` }).click();
        await page.mouse.move(300, 0);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`).hover();
        await page
            .getByRole('button', { name: `designer-schema-settings-Action-Action.Designer-${collectionName}` })
            .hover();
        await page.getByRole('menuitem', { name: 'Bind workflows' }).click();
        await page.getByRole('button', { name: 'plus Add workflow' }).click();
        await page.getByRole('button', { name: 'Select workflow' }).getByLabel('Search').click();
        await page.getByRole('option', { name: workFlowName }).click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();

        // 2、测试步骤：数据区块添加数据触发工作流，禁用工作流，添加数据不触发工作流
        let fieldData = fieldDisplayName + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await page.getByRole('textbox').fill(fieldData);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`, { exact: true }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText(fieldData)).toBeVisible();
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        await expect(workflowListRecords.executionCountPopup).toHaveText('1');
        await workflowListRecords.configureAction.click();
        await page.waitForLoadState('networkidle');
        await page.getByRole('switch', { name: 'On Off' }).click();
        // await expect(page.getByRole('switch', { name: 'On Off' })).toBeDisabled();
        await newPage.goto();
        await page.getByLabel(`action-Action-Add new-create-${collectionName}-table`).click();
        fieldData = fieldDisplayName + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await page.getByRole('textbox').fill(fieldData);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`, { exact: true }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText(fieldData)).toBeVisible();
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        await expect(workflowListRecords.executionCountPopup).toHaveText('1');

        await workflowListRecords.configureAction.click();
        await page.waitForLoadState('networkidle');
        await page.getByRole('switch', { name: 'On Off' }).click();
        await newPage.goto();
        await page.getByLabel(`action-Action-Add new-create-${collectionName}-table`).click();
        fieldData = fieldDisplayName + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await page.getByRole('textbox').fill(fieldData);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`, { exact: true }).click();
        await page.waitForLoadState('networkidle');
        await expect(page.getByText(fieldData)).toBeVisible();
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        // 3、预期结果：触发次数为1
        await expect(workflowListRecords.executionCountPopup).toHaveText('2');

        // 4、后置处理：删除工作流
        await workflowListRecords.deleteAction.click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();
        await expect(page.getByText(workFlowName)).toBeHidden();
    });
});

test.describe('Configuration page execution history', () => { });

test.describe('Configuration page copy to new version', () => {
    test('Copy the Form event of the Configuration Trigger node', async ({ page, mockPage }) => {
        //后缀标识，用于不同用例调用e2eTemplateJson.ts中相同模板JSON生成不同的数据表标识、名称
        const appendText = faker.lorem.word(4);
        //用例标题
        const caseTitle = 'Copy the Form event of the Configuration Trigger node';

        // 1、前置条件：1.1、已登录;1.2、存在一个配置好数据表的表单事件工作流；1.3、存在一个添加数据的区块
        //创建数据表
        const e2eJsonCollectionDisplayName = '自动>组织[普通表]';
        const e2eJsonCollectionName = 'tt_amt_org';

        const collectionDisplayName = e2eJsonCollectionDisplayName + appendText;
        const collectionName = e2eJsonCollectionName + appendText;
        const fieldName = 'orgname';
        const fieldDisplayName = '公司名称(单行文本)';

        //创建数据表
        const newPage = mockPage(appendJsonCollectionName(JSON.parse(JSON.stringify(e2e_GeneralFormsTable)), appendText));
        //配置工作流
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        const workflowManagement = new WorkflowManagement(page);
        await workflowManagement.addNewButton.click();
        const createWorkFlow = new CreateWorkFlow(page);
        const workFlowName = caseTitle + appendText;
        await createWorkFlow.name.fill(workFlowName);
        await createWorkFlow.triggerType.click();
        await page.getByRole('option', { name: 'Form event' }).click();
        await createWorkFlow.submitButton.click();
        await expect(page.getByText(workFlowName)).toBeVisible();

        //配置工作流触发器
        const workflowListRecords = new WorkflowListRecords(page, workFlowName);
        await workflowListRecords.configureAction.click();
        const fromEventTriggerNode = new FromEventTriggerNode(page, workFlowName, collectionName);
        await fromEventTriggerNode.nodeConfigure.click();
        await fromEventTriggerNode.collectionDropDown.click();
        await page.getByRole('option', { name: collectionDisplayName }).click();
        await fromEventTriggerNode.submitButton.click();
        await page.getByRole('link', { name: 'Workflow' }).click();
        await workflowListRecords.editAction.click();
        const editWorkFlow = new EditWorkFlow(page, workFlowName);
        await editWorkFlow.statusIsOn.check();
        await editWorkFlow.submitButton.click();

        //配置录入数据区块
        await newPage.goto();
        await page.waitForLoadState('networkidle');
        await page.getByLabel('schema-initializer-Grid-BlockInitializers').hover();
        await page.getByRole('menuitem', { name: 'table Table' }).hover();
        await page.getByRole('menuitem', { name: `${collectionDisplayName}` }).click();

        // 移开鼠标，关闭菜单
        await page.mouse.move(300, 0);

        await page.getByText('Configure columns').hover();
        await page.getByText(fieldDisplayName).click();
        await page.getByText('Configure actions').hover();
        await page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch').click();
        await expect(page.getByRole('menuitem', { name: 'Add new' }).getByRole('switch')).toBeEnabled();

        await page.getByLabel(`action-Action-Add new-create-${collectionName}-table`).click();
        await page.getByLabel(`schema-initializer-Grid-CreateFormBlockInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: 'form Form' }).click();

        // 移开鼠标，关闭菜单
        await page.mouse.move(300, 0);

        await page.getByLabel(`schema-initializer-ActionBar-CreateFormActionInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: 'Submit' }).click();
        // 绑定工作流
        await page.getByLabel(`schema-initializer-Grid-FormItemInitializers-${collectionName}`).hover();
        await page.getByRole('menuitem', { name: `${fieldDisplayName}` }).click();
        await page.mouse.move(300, 0);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`).hover();
        await page
            .getByRole('button', { name: `designer-schema-settings-Action-Action.Designer-${collectionName}` })
            .hover();
        await page.getByRole('menuitem', { name: 'Bind workflows' }).click();
        await page.getByRole('button', { name: 'plus Add workflow' }).click();
        await page.getByRole('button', { name: 'Select workflow' }).getByLabel('Search').click();
        await page.getByRole('option', { name: workFlowName }).click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();

        // 2、测试步骤：进入“数据区块”页面，添加一条数据,再进入工作流配置界面，复制到新版本
        const fieldData = fieldDisplayName + dayjs().format('YYYYMMDDHHmmss.SSS').toString();
        await page.getByRole('textbox').fill(fieldData);
        await page.getByLabel(`action-Action-Submit-submit-${collectionName}-form`, { exact: true }).click();
        await expect(page.getByText(fieldData)).toBeVisible();
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        await expect(workflowListRecords.executionCountPopup).toHaveText('1');

        await workflowListRecords.configureAction.click();
        await page.getByLabel('more').click();
        await page.getByLabel('revision').click();
        await page.waitForLoadState('networkidle');
        await fromEventTriggerNode.nodeConfigure.click();
        // 3、预期结果：新版本工作流配置内容同旧版本一样
        await expect(page.getByRole('button', { name: collectionDisplayName }).getByLabel('Search')).toBeVisible();

        // 4、后置处理：删除工作流
        await page.goto('/admin/settings/workflow');
        await page.waitForLoadState('networkidle');
        await workflowListRecords.deleteAction.click();
        await page.getByRole('button', { name: 'OK', exact: true }).click();
        await expect(page.getByText(workFlowName)).toBeHidden();
    });
});

test.describe('Configuration page  delete version', () => { });

test.describe('Node Add Modify Delete', () => { });
