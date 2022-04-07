import { ItemInfoType, Coin, ValidationInfo, TestCase, VendingMachineInterface } from '../types';
import {
  ITEM_ERROR_MESSAGE,
  CASH_ERROR_MESSAGE,
  ITEM_PURCHASE_CASH_ERROR_MESSAGE,
} from '../constant/errorMessage';
import {
  ITEM,
  CASH,
  ITEM_PURCHASE_CASH,
  COIN_10,
  COIN_50,
  COIN_100,
  COIN_500,
} from '../constant/rule';

class VendingMachine implements VendingMachineInterface {
  private _itemList: ItemInfoType[] = [];

  private _coinCollection: Record<Coin, number> = {
    [COIN_500]: 0,
    [COIN_100]: 0,
    [COIN_50]: 0,
    [COIN_10]: 0,
  };

  private itemPurchaseCash = 0;

  private itemInputTestCases: TestCase[] = [
    { testCase: this.isBlank, errorMessage: ITEM_ERROR_MESSAGE.BLANK_NOT_ALLOWED },
    { testCase: this.isNotNumberType, errorMessage: ITEM_ERROR_MESSAGE.NOT_NUMBER_TYPE },
    {
      testCase: this.isExceedMaxNameLength,
      errorMessage: ITEM_ERROR_MESSAGE.ITEM_NAME_MAX_LENGTH,
    },
    { testCase: this.isAlreadyExist.bind(this), errorMessage: ITEM_ERROR_MESSAGE.ALREADY_EXIST },
    { testCase: this.isExceedPriceRange, errorMessage: ITEM_ERROR_MESSAGE.EXCEED_PRICE_RANGE },
    {
      testCase: this.isNotDividedByPriceUnit,
      errorMessage: ITEM_ERROR_MESSAGE.NOT_DIVIDED_BY_PRICE_UNIT,
    },
    {
      testCase: this.isExceedQuantityRange,
      errorMessage: ITEM_ERROR_MESSAGE.EXCEED_QUANTITY_RANGE,
    },
    {
      testCase: this.isNotDividedByQuantityUnit,
      errorMessage: ITEM_ERROR_MESSAGE.NOT_DIVIDED_BY_QUANTITY_UNIT,
    },
  ];

  private cashInputTestCases: TestCase[] = [
    {
      testCase: this.isNotNumberTypeCash,
      errorMessage: CASH_ERROR_MESSAGE.NOT_NUMBER_TYPE,
    },
    { testCase: this.isLowerThanMinRange, errorMessage: CASH_ERROR_MESSAGE.LOWER_THAN_MIN_RANGE },
    {
      testCase: this.isExceedTotalAmountRange.bind(this),
      errorMessage: CASH_ERROR_MESSAGE.EXCEED_TOTAL_AMOUNT_RANGE,
    },
    {
      testCase: this.isNotDividedByUnitCash,
      errorMessage: CASH_ERROR_MESSAGE.NOT_DIVIDED_BY_UNIT,
    },
  ];

  private itemPurchaseCashInputTestCases: TestCase[] = [
    {
      testCase: this.isNotNumberTypeCash,
      errorMessage: ITEM_PURCHASE_CASH_ERROR_MESSAGE.NOT_NUMBER_TYPE,
    },
    {
      testCase: this.isExceedItemPurchaseCashRange,
      errorMessage: ITEM_PURCHASE_CASH_ERROR_MESSAGE.EXCEED_CASH_RANGE,
    },
    {
      testCase: this.isNotDividedByUnitItemPurchaseCash,
      errorMessage: CASH_ERROR_MESSAGE.NOT_DIVIDED_BY_UNIT,
    },
  ];

  public get itemList(): ItemInfoType[] {
    return this._itemList;
  }

  public get coinCollection(): Record<Coin, number> {
    return this._coinCollection;
  }

  getItemPurchaseCash(): number {
    return this.itemPurchaseCash;
  }

  addItem(itemInfo: ItemInfoType) {
    this._itemList = [...this._itemList, itemInfo];
    return itemInfo;
  }

  deleteItem(itemName: string) {
    this._itemList = this._itemList.filter((savedItem) => savedItem.itemName !== itemName);
  }

  editItem(itemInfo: ItemInfoType, itemIndex: number) {
    this._itemList[itemIndex] = itemInfo;
  }

  purchaseItem(itemIndex: number): void {
    const itemInfo: ItemInfoType = this.itemList[itemIndex];

    if (this.itemPurchaseCash < itemInfo.itemPrice) {
      throw new Error(ITEM_PURCHASE_CASH_ERROR_MESSAGE.LACK_MONEY);
    }

    this.itemList[itemIndex] = { ...itemInfo, itemQuantity: itemInfo.itemQuantity - 1 };
    this.itemPurchaseCash -= itemInfo.itemPrice;
  }

  chargeCoin(rechargeCoin: number): number {
    let candidateCoins = [COIN_500, COIN_100, COIN_50, COIN_10];
    let remainCoin = rechargeCoin;

    while (remainCoin !== 0) {
      if (COIN_50 > remainCoin) {
        this._coinCollection[COIN_10] += remainCoin / COIN_10;
        break;
      } else if (COIN_100 > remainCoin) {
        candidateCoins = [COIN_50, COIN_10];
      } else if (COIN_500 > remainCoin) {
        candidateCoins = [COIN_100, COIN_50, COIN_10];
      }

      const selectedCoin = candidateCoins[Math.floor(Math.random() * candidateCoins.length)];
      this._coinCollection[selectedCoin] += 1;
      remainCoin -= selectedCoin;
    }

    return this.calculateTotalCoinAmount();
  }

  calculateTotalCoinAmount(): number {
    return Object.entries(this._coinCollection).reduce(
      (prev, [key, value]) => prev + Number(key) * value,
      0
    );
  }

  chargeCash(chargedCash: number): number {
    this.itemPurchaseCash += chargedCash;

    return this.itemPurchaseCash;
  }

  validateTestCase(testCases: TestCase[], validationInfo: ValidationInfo) {
    testCases.every(({ testCase, errorMessage }) => {
      if (testCase(validationInfo)) throw new Error(errorMessage);
      return true;
    });
  }

  validateItemInput(itemInfo: ItemInfoType, isAddMode = true, itemIndex: number | null = null) {
    const validationInfo: ValidationInfo = { itemInfo, isAddMode, itemIndex };

    this.validateTestCase(this.itemInputTestCases, validationInfo);
  }

  validateCashInput(rechargedCash: number) {
    this.validateTestCase(this.cashInputTestCases, rechargedCash);
  }

  validateItemPurchaseCashInput(rechargedCash: number) {
    this.validateTestCase(this.itemPurchaseCashInputTestCases, rechargedCash);
  }

  private isBlank({ itemInfo: { itemName } }: { itemInfo: ItemInfoType; isAddMode: boolean }) {
    return itemName.length === 0;
  }

  private isNotNumberType({
    itemInfo: { itemPrice, itemQuantity },
  }: {
    itemInfo: ItemInfoType;
    isAddMode: boolean;
    itemIndex: number;
  }) {
    return Number.isNaN(itemPrice) || Number.isNaN(itemQuantity);
  }

  private isExceedMaxNameLength({
    itemInfo: { itemName },
  }: {
    itemInfo: ItemInfoType;
    isAddMode: boolean;
    itemIndex: number;
  }) {
    return itemName.length > ITEM.NAME_MAX_LENGTH;
  }

  private isAlreadyExist({
    itemInfo: { itemName },
    isAddMode,
    itemIndex,
  }: {
    itemInfo: ItemInfoType;
    isAddMode: boolean;
    itemIndex: number;
  }) {
    return this._itemList.some((savedItem, savedItemIndex) => {
      if (!isAddMode && itemIndex === savedItemIndex) {
        return false;
      }

      return savedItem.itemName === itemName;
    });
  }

  private isExceedPriceRange({
    itemInfo: { itemPrice },
  }: {
    itemInfo: ItemInfoType;
    isAddMode: boolean;
    itemIndex: number;
  }) {
    return itemPrice < ITEM.MIN_PRICE || itemPrice > ITEM.MAX_PRICE;
  }

  private isNotDividedByPriceUnit({
    itemInfo: { itemPrice },
  }: {
    itemInfo: ItemInfoType;
    isAddMode: boolean;
    itemIndex: number;
  }) {
    return itemPrice % ITEM.PRICE_UNIT !== 0;
  }

  private isExceedQuantityRange({
    itemInfo: { itemQuantity },
  }: {
    itemInfo: ItemInfoType;
    isAddMode: boolean;
    itemIndex: number;
  }) {
    return itemQuantity < ITEM.MIN_QUANTITY || itemQuantity > ITEM.MAX_QUANTITY;
  }

  private isNotDividedByQuantityUnit({
    itemInfo: { itemQuantity },
  }: {
    itemInfo: ItemInfoType;
    isAddMode: boolean;
    itemIndex: number;
  }) {
    return itemQuantity % ITEM.QUANTITY_UNIT !== 0;
  }

  private isNotNumberTypeCash(rechargedCash: number) {
    return isNaN(rechargedCash);
  }

  private isLowerThanMinRange(rechargedCash: number) {
    return rechargedCash < CASH.MIN;
  }

  private isExceedTotalAmountRange(rechargedCash: number) {
    return rechargedCash > CASH.MAX - this.calculateTotalCoinAmount();
  }

  private isNotDividedByUnitCash(rechargedCash: number) {
    return rechargedCash % CASH.UNIT !== 0;
  }

  private isExceedItemPurchaseCashRange(rechargedCash: number) {
    return rechargedCash < ITEM_PURCHASE_CASH.MIN || rechargedCash > ITEM_PURCHASE_CASH.MAX;
  }

  private isNotDividedByUnitItemPurchaseCash(rechargeCoin: number) {
    return rechargeCoin % ITEM_PURCHASE_CASH.UNIT !== 0;
  }
}

export default VendingMachine;
