import { addElemClasses, addEvents, localStorageAvailable } from "../../../helpers/utils.js";

export default class GuidedTour {
	constructor(fpdInstance) {
		this.fpdInstance = fpdInstance;
	}

	start() {
		if (this.fpdInstance.mainOptions.guidedTour && Object.keys(this.fpdInstance.mainOptions.guidedTour).length) {
			const firstKey = Object.keys(this.fpdInstance.mainOptions.guidedTour)[0];
			this.selectStep(firstKey);
		}
	}

	selectStep = (target) => {
		const currentStep = document.body.querySelector(".fpd-gt-step");
		if (currentStep) currentStep.remove();

		let keyIndex = Object.keys(this.fpdInstance.mainOptions.guidedTour).indexOf(target),
			splitTarget = target.split(":"),
			targetElem = null;

		if (splitTarget[0] === "module") {
			targetElem = this.fpdInstance.mainBar.container.querySelector(
				'.fpd-navigation > [data-module="' + splitTarget[1] + '"]'
			);
		} else if (splitTarget[0] === "action") {
			targetElem = document.body.querySelector('.fpd-btn[data-action="' + splitTarget[1] + '"]');
		} else if (splitTarget.length === 1) {
			//css selector
			targetElem = document.body.querySelector(splitTarget[0]);
		}

		if (targetElem) {
			//if module or action is not available, go to next
			if (targetElem.length === 0) {
				if (Object.keys(this.fpdInstance.mainOptions.guidedTour)[keyIndex + 1]) {
					this.selectStep(Object.keys(this.fpdInstance.mainOptions.guidedTour)[keyIndex + 1]);
				}

				return;
			}

			const stepElem = document.createElement("div");
			stepElem.className = "fpd-container fpd-gt-step";
			stepElem.innerHTML = `<div class="fpd-gt-pointer">
                <span class="fpd-icon-arrow-dropdown"></span>
            </div>
            <div class="fpd-gt-close">
                <span class="fpd-icon-close"></span>
            </div>
            <div class="fpd-gt-text">${this.fpdInstance.mainOptions.guidedTour[target]}</div>
            <div class="fpd-gt-actions">
                <div class="fpd-gt-next fpd-btn fpd-primary">${this.fpdInstance.translator.getTranslation(
					"misc",
					"guided_tour_next",
					"Next"
				)}</div>
                <div class="fpd-gt-back fpd-btn fpd-primary">${this.fpdInstance.translator.getTranslation(
					"misc",
					"guided_tour_back",
					"Back"
				)}</div>
                <span class="fpd-gt-counter">${
					String(keyIndex + 1) + "/" + Object.keys(this.fpdInstance.mainOptions.guidedTour).length
				}</span>
            </div>`;

			document.body.append(stepElem);

			let domRect = targetElem.getBoundingClientRect(),
				offsetX = domRect.width * 0.5,
				posLeft = domRect.left + offsetX,
				posTop = domRect.top + domRect.height;

			if (posLeft < 24) {
				posLeft = 24;
			}

			stepElem.style.left = posLeft + "px";
			stepElem.style.top = posTop + "px";

			const stepDomRect = stepElem.getBoundingClientRect();

			//if step is outside viewport, reposition step and pointer
			if (stepDomRect.width + stepDomRect.left > window.innerWidth) {
				offsetX = window.innerWidth - (stepDomRect.width + posLeft);
				stepElem.style.left = posLeft + offsetX + "px";
				stepElem.querySelector(".fpd-gt-pointer").style.marginLeft = Math.abs(offsetX) + "px";
			}

			let maxTop = window.innerHeight - stepDomRect.height;
			if (posTop > maxTop) {
				posTop -= stepDomRect.height;
				stepElem.style.top = posTop + "px";
				addElemClasses(stepElem, ["fpd-reverse"]);
			}

			const backElem = stepElem.querySelector(".fpd-gt-back");
			const prevTarget = Object.keys(this.fpdInstance.mainOptions.guidedTour)[keyIndex - 1];
			if (prevTarget) {
				addEvents(backElem, "click", (evt) => {
					this.selectStep(prevTarget);
				});
			} else {
				addElemClasses(backElem, ["fpd-hidden"]);
			}

			const nextElem = stepElem.querySelector(".fpd-gt-next");
			const nextTarget = Object.keys(this.fpdInstance.mainOptions.guidedTour)[keyIndex + 1];
			if (nextTarget) {
				addEvents(nextElem, "click", (evt) => {
					this.selectStep(nextTarget);
				});
			} else {
				addElemClasses(nextElem, ["fpd-hidden"]);
			}

			addEvents(stepElem.querySelector(".fpd-gt-close"), "click", (evt) => {
				if (localStorageAvailable()) {
					window.localStorage.setItem("fpd-gt-closed", "yes");
				}

				stepElem.remove();
			});
		}
	};
}
