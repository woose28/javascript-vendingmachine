import VendingMachineTab from './VendingMachineTab';
import { ItemInfoType, Coin } from '../types';
import {
  generateItemPurchaseTabContentTemplate,
  generateItemPurchaseTableDataTemplate,
} from '../template';
import { selectDom, selectDoms } from '../utils';
import { ID, CLASS } from '../constant/selector';
import { INITIAL_COIN_COLLECTION } from '../constant/rule';

class ItemPurchaseTab extends VendingMachineTab {
  private cashChargeForm: HTMLFormElement | null;

  private cashChargeInput: HTMLInputElement | null;

  private chargedAmountSpan: HTMLSpanElement | null;

  private itemStatusTable: HTMLTableElement | null;

  private returnButton: HTMLButtonElement | null;

  private coinCountsTableCells: NodeListOf<HTMLTableCellElement>;

  render(): void {
    const itemList: ItemInfoType[] = this.vendingMachine.itemList;
    const chargedCash = this.vendingMachine.getItemPurchaseCash();

    this.changeTabContent(generateItemPurchaseTabContentTemplate(itemList, chargedCash));

    this.bindEvent();
  }

  private bindEvent(): void {
    this.cashChargeForm = selectDom(`#${ID.CASH_CHARGE_FORM}`);
    this.cashChargeInput = selectDom(`.${CLASS.CASH_CHARGE_INPUT}`);
    this.chargedAmountSpan = selectDom(`#${ID.CHARGED_AMOUNT}`);
    this.itemStatusTable = selectDom(`.${CLASS.ITEM_STATUS_TABLE}`);
    this.returnButton = selectDom(`.${CLASS.RETURN_BUTTON}`);
    this.coinCountsTableCells = selectDoms(`.${CLASS.COIN_COUNT}`);

    this.cashChargeForm.addEventListener('submit', this.onSubmitCashChargeForm);
    this.itemStatusTable.addEventListener('click', this.onClickPurchaseItemButton);
    this.returnButton.addEventListener('click', this.onClickReturnCoinButton);
  }

  private onSubmitCashChargeForm = (e: SubmitEvent) => {
    e.preventDefault();

    const inputedCash = this.cashChargeInput.valueAsNumber;

    try {
      this.vendingMachine.validateItemPurchaseCashInput(inputedCash);
    } catch (error) {
      alert(error.message);
      return;
    }

    const chargedAmount = this.vendingMachine.chargeCash(inputedCash);
    this.renderChargedAmount(String(chargedAmount));
  };

  private onClickPurchaseItemButton = ({ target }: MouseEvent) => {
    const targetElement = target as HTMLElement;

    if (!targetElement.classList.contains(CLASS.PURCHASE_ITEM_BUTTON)) {
      return;
    }

    const targetItem: HTMLTableRowElement = targetElement.closest('tr');
    const itemIndex = targetItem.rowIndex - 1;

    try {
      this.vendingMachine.purchaseItem(itemIndex);
    } catch (error) {
      alert(error.message);
      return;
    }

    const itemInfo: ItemInfoType = this.vendingMachine.itemList[itemIndex];
    const chargedAmount = this.vendingMachine.getItemPurchaseCash();

    this.renderItemInfo(targetItem, itemInfo);
    this.renderChargedAmount(String(chargedAmount));
  };

  private onClickReturnCoinButton = () => {
    let returnedCoinCollection: Record<Coin, number>;

    try {
      returnedCoinCollection = this.vendingMachine.returnCoin();
    } catch (error) {
      alert(error.message);

      this.renderReturnedCoinTable();
      return;
    }

    const chargedAmount = this.vendingMachine.getItemPurchaseCash();

    this.renderChargedAmount(String(chargedAmount));
    this.renderReturnedCoinTable(returnedCoinCollection);
  };

  private renderChargedAmount(chargedAmount: string): void {
    this.chargedAmountSpan.textContent = chargedAmount;
  }

  private renderItemInfo(targetItem: HTMLTableRowElement, itemInfo: ItemInfoType) {
    targetItem.replaceChildren();
    targetItem.insertAdjacentHTML('afterbegin', generateItemPurchaseTableDataTemplate(itemInfo));
  }

  private renderReturnedCoinTable(
    returnedCoinCollection: Record<Coin, number> = INITIAL_COIN_COLLECTION
  ): void {
    this.coinCountsTableCells.forEach((coinCountsTableCell) => {
      const { coinValue } = coinCountsTableCell.dataset;

      coinCountsTableCell.textContent = `${returnedCoinCollection[coinValue]}개`;
    });
  }
}

export default ItemPurchaseTab;
