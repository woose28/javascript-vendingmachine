import CoinRechargeTab from './view/CoinRechargeTab';
import { HASH } from './constant/hash';
import ItemManageTab from './view/ItemManageTab';
import VendingMachine from './VendingMachine';

const initApp = function () {
  const vendingMachine = new VendingMachine();
  const itemManageTab = new ItemManageTab(vendingMachine);
  const coinRechargeTab = new CoinRechargeTab(vendingMachine);

  return function () {
    const currentHash = location.hash;
    if (!currentHash || currentHash === HASH.ITEM_MANAGE) {
      itemManageTab.renderInitialTabState();
      return;
    }
    if (currentHash === HASH.COIN_RECHARGE) {
      coinRechargeTab.renderInitialTabState();
      return;
    }
    if (currentHash === HASH.ITEM_PURCHASE) {
      return;
    }
  };
};

export default initApp();
