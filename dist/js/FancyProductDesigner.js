import Options from './Options.js';
import UIManager from '../ui/UIManager';
export default class FancyProductDesigner {
  constructor(elem, opts = {}) {
    console.log(elem, opts);
    this.optionsInstance = new Options();
    this.mainOptions = this.optionsInstance.merge(this.optionsInstance.defaults, opts);
    this.uiManager = new UIManager(this.mainOptions);
    this.#initUI();
  }
  #initUI() {}
}
window.FancyProductDesigner = FancyProductDesigner;