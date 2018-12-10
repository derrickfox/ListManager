'use strict'; // necessary for es6 output in node

import { browser, element, by, ElementFinder, ElementArrayFinder } from 'protractor';
import { promise } from 'selenium-webdriver';

const expectedH1 = 'Tour of lists';
const expectedTitle = `${expectedH1}`;
const targetList = { id: 15, name: 'Magneta' };
const targetListDashboardIndex = 3;
const nameSuffix = 'X';
const newListName = targetList.name + nameSuffix;

class List {
  id: number;
  name: string;

  // Factory methods

  // List from string formatted as '<id> <name>'.
  static fromString(s: string): List {
    return {
      id: +s.substr(0, s.indexOf(' ')),
      name: s.substr(s.indexOf(' ') + 1),
    };
  }

  // List from list list <li> element.
  static async fromLi(li: ElementFinder): Promise<List> {
      let stringsFromA = await li.all(by.css('a')).getText();
      let strings = stringsFromA[0].split(' ');
      return { id: +strings[0], name: strings[1] };
  }

  // List id and name from the given detail element.
  static async fromDetail(detail: ElementFinder): Promise<List> {
    // Get list id from the first <div>
    let _id = await detail.all(by.css('div')).first().getText();
    // Get name from the h2
    let _name = await detail.element(by.css('h2')).getText();
    return {
        id: +_id.substr(_id.indexOf(' ') + 1),
        name: _name.substr(0, _name.lastIndexOf(' '))
    };
  }
}

describe('Tutorial part 6', () => {

  beforeAll(() => browser.get(''));

  function getPageElts() {
    let navElts = element.all(by.css('app-root nav a'));

    return {
      navElts: navElts,

      appDashboardHref: navElts.get(0),
      appDashboard: element(by.css('app-root app-dashboard')),
      topLists: element.all(by.css('app-root app-dashboard > div h4')),

      appListsHref: navElts.get(1),
      appLists: element(by.css('app-root app-lists')),
      allLists: element.all(by.css('app-root app-lists li')),
      selectedListSubview: element(by.css('app-root app-lists > div:last-child')),

      listDetail: element(by.css('app-root app-list-detail > div')),

      searchBox: element(by.css('#search-box')),
      searchResults: element.all(by.css('.search-result li'))
    };
  }

  describe('Initial page', () => {

    it(`has title '${expectedTitle}'`, () => {
      expect(browser.getTitle()).toEqual(expectedTitle);
    });

    it(`has h1 '${expectedH1}'`, () => {
        expectHeading(1, expectedH1);
    });

    const expectedViewNames = ['Dashboard', 'Lists'];
    it(`has views ${expectedViewNames}`, () => {
      let viewNames = getPageElts().navElts.map((el: ElementFinder) => el.getText());
      expect(viewNames).toEqual(expectedViewNames);
    });

    it('has dashboard as the active view', () => {
      let page = getPageElts();
      expect(page.appDashboard.isPresent()).toBeTruthy();
    });

  });

  describe('Dashboard tests', () => {

    beforeAll(() => browser.get(''));

    it('has top lists', () => {
      let page = getPageElts();
      expect(page.topLists.count()).toEqual(4);
    });

    it(`selects and routes to ${targetList.name} details`, dashboardSelectTargetList);

    it(`updates list name (${newListName}) in details view`, updateListNameInDetailView);

    it(`cancels and shows ${targetList.name} in Dashboard`, () => {
      element(by.buttonText('go back')).click();
      browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      let targetListElt = getPageElts().topLists.get(targetListDashboardIndex);
      expect(targetListElt.getText()).toEqual(targetList.name);
    });

    it(`selects and routes to ${targetList.name} details`, dashboardSelectTargetList);

    it(`updates list name (${newListName}) in details view`, updateListNameInDetailView);

    it(`saves and shows ${newListName} in Dashboard`, () => {
      element(by.buttonText('save')).click();
      browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

      let targetListElt = getPageElts().topLists.get(targetListDashboardIndex);
      expect(targetListElt.getText()).toEqual(newListName);
    });

  });

  describe('Lists tests', () => {

    beforeAll(() => browser.get(''));

    it('can switch to Lists view', () => {
      getPageElts().appListsHref.click();
      let page = getPageElts();
      expect(page.appLists.isPresent()).toBeTruthy();
      expect(page.allLists.count()).toEqual(10, 'number of lists');
    });

    it('can route to list details', async () => {
      getListLiEltById(targetList.id).click();

      let page = getPageElts();
      expect(page.listDetail.isPresent()).toBeTruthy('shows list detail');
      let list = await List.fromDetail(page.listDetail);
      expect(list.id).toEqual(targetList.id);
      expect(list.name).toEqual(targetList.name.toUpperCase());
    });

    it(`updates list name (${newListName}) in details view`, updateListNameInDetailView);

    it(`shows ${newListName} in Lists list`, () => {
      element(by.buttonText('save')).click();
      browser.waitForAngular();
      let expectedText = `${targetList.id} ${newListName}`;
      expect(getListAEltById(targetList.id).getText()).toEqual(expectedText);
    });

    it(`deletes ${newListName} from Lists list`, async () => {
      const listesBefore = await toListArray(getPageElts().allLists);
      const li = getListLiEltById(targetList.id);
      li.element(by.buttonText('x')).click();

      const page = getPageElts();
      expect(page.appLists.isPresent()).toBeTruthy();
      expect(page.allLists.count()).toEqual(9, 'number of lists');
      const listesAfter = await toListArray(page.allLists);
      // console.log(await List.fromLi(page.allLists[0]));
      const expectedLists =  listesBefore.filter(h => h.name !== newListName);
      expect(listesAfter).toEqual(expectedLists);
      // expect(page.selectedListSubview.isPresent()).toBeFalsy();
    });

    it(`adds back ${targetList.name}`, async () => {
      const newListName = 'Alice';
      const listesBefore = await toListArray(getPageElts().allLists);
      const numLists = listesBefore.length;

      element(by.css('input')).sendKeys(newListName);
      element(by.buttonText('add')).click();

      let page = getPageElts();
      let listesAfter = await toListArray(page.allLists);
      expect(listesAfter.length).toEqual(numLists + 1, 'number of lists');

      expect(listesAfter.slice(0, numLists)).toEqual(listesBefore, 'Old lists are still there');

      const maxId = listesBefore[listesBefore.length - 1].id;
      expect(listesAfter[numLists]).toEqual({id: maxId + 1, name: newListName});
    });

    it('displays correctly styled buttons', async () => {
      element.all(by.buttonText('x')).then(buttons => {
        for (const button of buttons) {
          // Inherited styles from styles.css
          expect(button.getCssValue('font-family')).toBe('Arial');
          expect(button.getCssValue('border')).toContain('none');
          expect(button.getCssValue('padding')).toBe('5px 10px');
          expect(button.getCssValue('border-radius')).toBe('4px');
          // Styles defined in lists.component.css
          expect(button.getCssValue('left')).toBe('194px');
          expect(button.getCssValue('top')).toBe('-32px');
        }
      });

      const addButton = element(by.buttonText('add'));
      // Inherited styles from styles.css
      expect(addButton.getCssValue('font-family')).toBe('Arial');
      expect(addButton.getCssValue('border')).toContain('none');
      expect(addButton.getCssValue('padding')).toBe('5px 10px');
      expect(addButton.getCssValue('border-radius')).toBe('4px');
    });

  });

  describe('Progressive list search', () => {

    beforeAll(() => browser.get(''));

    it(`searches for 'Ma'`, async () => {
      getPageElts().searchBox.sendKeys('Ma');
      browser.sleep(1000);

      expect(getPageElts().searchResults.count()).toBe(4);
    });

    it(`continues search with 'g'`, async () => {
      getPageElts().searchBox.sendKeys('g');
      browser.sleep(1000);
      expect(getPageElts().searchResults.count()).toBe(2);
    });

    it(`continues search with 'e' and gets ${targetList.name}`, async () => {
      getPageElts().searchBox.sendKeys('n');
      browser.sleep(1000);
      let page = getPageElts();
      expect(page.searchResults.count()).toBe(1);
      let list = page.searchResults.get(0);
      expect(list.getText()).toEqual(targetList.name);
    });

    it(`navigates to ${targetList.name} details view`, async () => {
      let list = getPageElts().searchResults.get(0);
      expect(list.getText()).toEqual(targetList.name);
      list.click();

      let page = getPageElts();
      expect(page.listDetail.isPresent()).toBeTruthy('shows list detail');
      let list2 = await List.fromDetail(page.listDetail);
      expect(list2.id).toEqual(targetList.id);
      expect(list2.name).toEqual(targetList.name.toUpperCase());
    });
  });

  async function dashboardSelectTargetList() {
    let targetListElt = getPageElts().topLists.get(targetListDashboardIndex);
    expect(targetListElt.getText()).toEqual(targetList.name);
    targetListElt.click();
    browser.waitForAngular(); // seems necessary to gets tests to pass for toh-pt6

    let page = getPageElts();
    expect(page.listDetail.isPresent()).toBeTruthy('shows list detail');
    let list = await List.fromDetail(page.listDetail);
    expect(list.id).toEqual(targetList.id);
    expect(list.name).toEqual(targetList.name.toUpperCase());
  }

  async function updateListNameInDetailView() {
    // Assumes that the current view is the list details view.
    addToListName(nameSuffix);

    let page = getPageElts();
    let list = await List.fromDetail(page.listDetail);
    expect(list.id).toEqual(targetList.id);
    expect(list.name).toEqual(newListName.toUpperCase());
  }

});

function addToListName(text: string): promise.Promise<void> {
  let input = element(by.css('input'));
  return input.sendKeys(text);
}

function expectHeading(hLevel: number, expectedText: string): void {
    let hTag = `h${hLevel}`;
    let hText = element(by.css(hTag)).getText();
    expect(hText).toEqual(expectedText, hTag);
};

function getListAEltById(id: number): ElementFinder {
  let spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('..'));
}

function getListLiEltById(id: number): ElementFinder {
  let spanForId = element(by.cssContainingText('li span.badge', id.toString()));
  return spanForId.element(by.xpath('../..'));
}

async function toListArray(allLists: ElementArrayFinder): Promise<List[]> {
  let promisedLists = await allLists.map(List.fromLi);
  // The cast is necessary to get around issuing with the signature of Promise.all()
  return <Promise<any>> Promise.all(promisedLists);
}
