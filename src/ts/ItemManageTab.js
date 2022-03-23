import { itemManageTabContentTemplate, generateItemManageTableRowTemplate } from './template';
import { selectDom } from './utils';

class ItemManageTab {
  constructor(vendingMachine) {
    this.vendingMachine = vendingMachine;

    this.itemManageTabButton = selectDom('#item-manage-tab-button');
    this.tabContent = selectDom('#tab-content');
    this.itemInfoForm = selectDom('#item-info-form', this.tabContent);
    this.itemInfoInputs = Array.from(this.itemInfoForm.querySelectorAll('.item-info-input'));
    this.itemStatusTable = selectDom('.item-status-table', this.tabContent);

    this.itemManageTabButton.addEventListener('click', this.#onClickItemManageTabButton);
    this.itemInfoForm.addEventListener('submit', this.#onSubmitItemInfoForm);
    this.itemStatusTable.addEventListener('click', this.#onClickItemStatusTableButton);
  }

  #onClickItemManageTabButton = () => {
    if (this.itemManageTabButton.classList.contains('selected')) {
      return;
    }

    this.#changeTabContent(itemManageTabContentTemplate);
  };

  #onSubmitItemInfoForm = (e) => {
    e.preventDefault();

    const itemInfo = this.itemInfoInputs.map((itemInfoInput) => itemInfoInput.value);

    try {
      this.vendingMachine.validateItemInput(...itemInfo);
    } catch (error) {
      return alert(error.message);
    }

    const newItem = this.vendingMachine.addItem(...itemInfo);
    this.#renderAddedItem(newItem);
  };

  #onClickItemStatusTableButton = (e) => {
    if (e.target.classList.contains('edit-item-button')) {
      console.log('hihi');
      return;
    }

    if (
      e.target.classList.contains('delete-item-button') &&
      confirm('정말 ㅇㅇㅇ 상품을 삭제하시겠습니까?')
    ) {
      const targetItem = e.target.closest('tr');
      const { itemName } = targetItem.dataset;

      this.vendingMachine.deleteItem(itemName);
      targetItem.remove();
      return;
    }
  };

  #changeTabContent(contentTemplate) {
    this.tabContent.replaceChildren();
    this.tabContent.insertAdjacentHTML('afterbegin', contentTemplate);
    this.itemManageTabButton.classList.add('selected');
  }

  #renderAddedItem(newItem) {
    this.itemStatusTable.insertAdjacentHTML(
      'beforeend',
      generateItemManageTableRowTemplate(newItem)
    );
  }
}

export default ItemManageTab;
