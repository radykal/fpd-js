import { 
    addEvents,
	pixelToUnit
} from '../helpers/utils.js';

export default class PricingRules {

	constructor(fpdInstance) {

		this.fpdInstance = fpdInstance;

		addEvents(
			fpdInstance, 
			[
				'elementModify',
				'productCreate',
				'elementAdd',
				'elementRemove',
				'viewCreate',
				'viewRemove',
				'elementFillChange',
				'textLinkApply'
			],
			this.doPricingRules.bind(this)
		)

	}

	doPricingRules() {

		const unitFormat =this.fpdInstance.mainOptions.dynamicViewsOptions ? this.fpdInstance.mainOptions.dynamicViewsOptions.unit : 'mm';

		this.fpdInstance.pricingRulesPrice = 0;

		var pricingRules = this.fpdInstance.mainOptions.pricingRules;
		if( pricingRules && pricingRules.length > 0) {

			//loop all pricing groups
			pricingRules.forEach((pGroup) => {

				if(!pGroup.property || !pGroup.target) return;

				var targetElems = [];
				
				//get view instance as target
				if(pGroup.property == 'canvasSize') {

					targetElems = this.fpdInstance.viewInstances;

				}
				//get single element as target
				else if(pGroup.target.elements !== undefined && pGroup.target.elements.charAt(0) === '#') {

					targetElems.push(
						this.fpdInstance.currentViewInstance.fabricCanvas.getElementByTitle(
							pGroup.target.elements.replace('#', ''), 
							pGroup.target.views
						)
					);
				}
				//get custom elements as target
				else if(pGroup.target.elements !== undefined && pGroup.target.elements.search('custom') !== -1) {

					targetElems = this.fpdInstance.getCustomElements(
						pGroup.target.elements.replace('custom', '').toLowerCase(),
						pGroup.target.views,
						false
					);

				}
				//get mutliple elements as target
				else {
					
					targetElems = this.fpdInstance.getElements(pGroup.target.views, pGroup.target.elements, false);

				}				

				//loop all target elements in group
				var property,
					loopTargetsOnce = false;

				//only loop once for these props
				if(['elementsLength', 'colorsLength'].indexOf(pGroup.property) !== -1) {
					loopTargetsOnce = true;
				}

				targetElems.forEach((targetElem, index) => {

					if(!targetElem || (loopTargetsOnce && index > 0)) {
						return;
					}

					//getCustomElements returns an object with the element
					if(targetElem.hasOwnProperty('element')) {
						targetElem = targetElem.element;
					}

					//get property for condition					
					if(pGroup.property === 'textLength') { //for text in all views
						property = targetElem.text ? targetElem.text.replace(/\s/g, "").length : null;						
					}
					else if(pGroup.property === 'linesLength') { //for text in all views
						property = targetElem.text ? targetElem.text.split("\n").length : null;
					}
					if(pGroup.property === 'fontSize') { //for text in all views
						property = targetElem.text ? targetElem.fontSize : null;
					}
					else if(pGroup.property === 'imageSize') { //for image in all views
						property = targetElem.getType() === 'image' && targetElem.title ? {width: targetElem.width, height: targetElem.height} : null;
					}
					else if(pGroup.property === 'imageSizeScaled') { //for image in all views
						property = targetElem.getType() === 'image' && targetElem.title ? {width: targetElem.width * targetElem.scaleX, height: targetElem.height * targetElem.scaleY} : null;
					}
					else if(pGroup.property === 'canvasSize') { //views: all
						property = {width: pixelToUnit(targetElem.options.stageWidth, unitFormat), height: pixelToUnit(targetElem.options.stageHeight, unitFormat) };
					}
					else if(pGroup.property === 'pattern') { //text and svg in all views
						property = targetElem.pattern;
					}
					// ---- one time loop props
					else if(pGroup.property === 'elementsLength') { //views: all, elements: all
						property = targetElems.length;						
					}
					else if(pGroup.property === 'colorsLength') { //views: all
						property = this.fpdInstance.getUsedColors(pGroup.target.views).length;
					}

					//property for element is not valid
					if(property === null || property === undefined) {
						return;
					}

					//add real property to every rule
					pGroup.rules.forEach((pRule) => {
						pRule.property = property;
					});

					if(pGroup.type === 'any') { //if-else
						pGroup.rules.some(this.#loopPricingGroup.bind(this))
					}
					else { //all, if-loop
						pGroup.rules.forEach(this.#loopPricingGroup.bind(this));
					}

				});

			});

		}

		this.fpdInstance.calculatePrice();

	}

	#loopPricingGroup(pRule, index) {

		if(this.#condition(pRule.operator, pRule.property, pRule.value)) {

			if(typeof pRule.price === 'number') {
				this.fpdInstance.pricingRulesPrice += pRule.price;
			}
			return true;
		}
		else
			return false;

	};

	#condition(oper, prop, value) {

		//check if prop is an object that contains more props to compare
		if(typeof value === 'object') {

			var keys = Object.keys(value),
				tempReturn = null;

			//as soon as if one is false in the prop object, the whole condition becomes false
			keys.forEach((key) => {

				if(tempReturn !== false) {
					tempReturn = this.#operator(oper, prop[key], value[key]);
				}

			});
			return tempReturn;
		}
		else { //just single to compare
			return this.#operator(oper, prop, value);
		}

	}

	#operator(oper, prop, value) {

		if(oper === '=') {
			return prop === value;
		}
		else if(oper === '>') {
			return prop > value;
		}
		else if(oper === '<') {
			return prop < value;
		}
		else if(oper === '>=') {
			return prop >= value;
		}
		else if(oper === '<=') {
			return prop <= value;
		}

	}

}