import { Page, expect, oneEmptyTableWithTreeCollection, test } from '@nocobase/test/client';
import { expectOptions } from '../expectOptions';

test.describe('tree table block', () => {
  test('supported options', async ({ page, mockPage }) => {
    await mockPage(oneEmptyTableWithTreeCollection).goto();

    await expectOptions({
      page,
      showMenu: () => showSettingsMenu(page),
      supportedOptions: [
        'Edit block title',
        'Tree table',
        'Enable drag and drop sorting',
        'Fix block',
        'Set the data scope',
        'Set default sorting rules',
        'Records per page',
        'Connect data blocks',
        'Save as template',
        'Delete',
      ],
    });
  });

  test('tree table', async ({ page, mockPage, mockRecords }) => {
    const nocoPage = await mockPage(oneEmptyTableWithTreeCollection).waitForInit();
    await mockRecords('treeCollection', 20);
    await nocoPage.goto();

    // 默认情况下的 tree table 是开启状态，且有显示展开按钮
    await expect(page.getByLabel('Expand row').first()).toBeVisible({ timeout: 1000 * 20 });

    await showSettingsMenu(page);
    await expect(page.getByRole('menuitem', { name: 'Tree table' }).getByRole('switch')).toBeChecked();
    await page.getByRole('menuitem', { name: 'Tree table' }).click();
    await expect(page.getByRole('menuitem', { name: 'Tree table' }).getByRole('switch')).not.toBeChecked();
    await expect(page.getByLabel('Expand row')).toBeHidden();
  });
});

async function showSettingsMenu(page: Page) {
  await page.getByLabel('block-item-CardItem-treeCollection-table').hover();
  await page.getByLabel('designer-schema-settings-CardItem-TableBlockDesigner-treeCollection').hover();
}