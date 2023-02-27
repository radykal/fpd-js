import Options from './Options.js';
import UIManager from '../ui/UIManager';
export default class FancyProductDesigner {
  container = null;
  $container = null;
  constructor(elem, opts = {}) {
    this.container = elem;
    this.$container = $(elem);
    this.optionsInstance = new Options();
    this.mainOptions = this.optionsInstance.merge(this.optionsInstance.defaults, opts);
    this.uiManager = new UIManager(this, {
      onUiReady: this.#uiReady
    });
  }
  #uiReady() {
    console.log("ui ready");
  }
}
window.FancyProductDesigner = FancyProductDesigner;
//# sourceMappingURL=FancyProductDesigner.js.map
