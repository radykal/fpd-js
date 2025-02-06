import "../view/ElementToolbar";
import ColorPanel from "../view/comps/ColorPanel.js";
import ColorPalette from "../view/comps/ColorPalette.js";
import ColorPicker from "../view/comps/ColorPicker.js";
import Filters from "../../helpers/Filters.js";
import tinycolor from "tinycolor2";

import {
	addEvents,
	toggleElemClasses,
	addElemClasses,
	removeElemClasses,
	isBitmap,
	elementAvailableColors,
	getBgCssFromElement,
	getFilename,
} from "../../helpers/utils.js";
import { postJSON } from "../../helpers/request";
import Snackbar from "../view/comps/Snackbar";

export default class ElementToolbar extends EventTarget {
	currentPlacement = "";
	#colorWrapper;

	constructor(fpdInstance) {
		super();

		this.fpdInstance = fpdInstance;
		this.container = document.createElement("fpd-element-toolbar");

		this.#setWrapper();

		//set max values in inputs
		const maxValuesKeys = Object.keys(fpdInstance.mainOptions.maxValues);
		maxValuesKeys.forEach((key) => {
			const inputElem = this.container.querySelector('[data-control="' + key + '"]');

			if (inputElem) {
				inputElem.setAttribute("max", fpdInstance.mainOptions.maxValues[key]);
			}
		});

		//fonts
		if (Array.isArray(fpdInstance.mainOptions.fonts) && fpdInstance.mainOptions.fonts.length) {
			const fontsList = this.subPanel.querySelector(".fpd-fonts-list");

			fpdInstance.mainOptions.fonts.forEach((fontObj) => {
				let fontName = typeof fontObj == "object" ? fontObj.name : fontObj;

				const fontListItem = document.createElement("span");
				fontListItem.className = "fpd-item";
				fontListItem.dataset.value = fontName;
				fontListItem.innerText = fontName;
				fontListItem.style.fontFamily = fontName;
				fontsList.append(fontListItem);

				addEvents(fontListItem, "click", (evt) => {
					removeElemClasses(Array.from(fontsList.children), ["fpd-active"]);

					addElemClasses(fontListItem, ["fpd-active"]);

					fpdInstance.currentViewInstance.fabricCanvas.setElementOptions({ fontFamily: fontName });

					this.#updateVariantStylesBtn(fpdInstance.currentElement);
				});
			});

			addEvents(this.subPanel.querySelector(".fpd-panel-font-family input"), "keyup", (evt) => {
				const searchStr = evt.currentTarget.value;
				fontsList.querySelectorAll(".fpd-item").forEach((item) => {
					if (searchStr.length == 0) {
						item.classList.remove("fpd-hidden");
					} else {
						item.classList.toggle(
							"fpd-hidden",
							!item.innerText.toLowerCase().includes(searchStr.toLowerCase())
						);
					}
				});
			});
		} else {
			this.navElem.querySelector(".fpd-tool-font-family").style.display = "none";
		}

		//advanced editing - filters
		const filtersGrid = this.subPanel.querySelector(".fpd-tool-filters");
		for (const filterKey in Filters) {
			const filterItem = document.createElement("div");
			const filterData = Filters[filterKey];
			filterItem.className = "fpd-item";
			filterItem.setAttribute("aria-label", filterData.name);
			filterItem.style.backgroundImage = `url(${filterData.preview})`;
			filtersGrid.append(filterItem);

			addEvents(filterItem, "click", (evt) => {
				fpdInstance.currentViewInstance.fabricCanvas.setElementOptions({
					filter: filterData.array || filterKey,
				});
			});
		}

		//advanced editing - crop
		const cropMasksGrid = this.subPanel.querySelector(".fpd-tool-crop-masks");
		if (Array.isArray(fpdInstance.mainOptions.cropMasks)) {
			fpdInstance.mainOptions.cropMasks.forEach((maskURL) => {
				const maskItem = document.createElement("div");
				maskItem.className = "fpd-item";
				maskItem.setAttribute("aria-label", getFilename(maskURL));
				maskItem.style.backgroundImage = `url(${maskURL})`;
				cropMasksGrid.append(maskItem);

				addEvents(maskItem, "click", (evt) => {
					this.toggle(false);
					fpdInstance.advancedImageEditor.loadImage(fpdInstance.currentElement, maskURL);
				});
			});
		}

		addEvents(fpdInstance, "elementSelect", () => {
			const selectedElem = fpdInstance.currentElement;

			if (this.#hasToolbar(selectedElem)) {
				this.#update(selectedElem);
				this.#updatePosition();

				if (selectedElem.getType() == "text") {
					selectedElem.off("changed", this.#updatePosition.bind(this));
					selectedElem.on("changed", this.#updatePosition.bind(this));
				}

				this.#updateVariantStylesBtn(selectedElem);
			} else {
				this.toggle(false);
			}
		});

		addEvents(fpdInstance, "elementChange", () => {
			if (this.currentPlacement == "smart") this.toggle(false);
		});

		addEvents(fpdInstance, "elementModify", (evt) => {
			const { options } = evt.detail;

			if (options.fontSize !== undefined) {
				this.#updateUIValue("fontSize", options.fontSize);
				this.navElem.querySelector(".fpd-tool-text-size > input").value = options.fontSize;
			}

			if (options.fontFamily !== undefined) {
				this.navElem.querySelector(".fpd-tool-font-family fpd-dropdown > input").value = options.fontFamily;
			}

			if (options.scaleX !== undefined) {
				this.#updateUIValue("scaleX", parseFloat(Number(options.scaleX).toFixed(2)));
			}

			if (options.scaleY !== undefined) {
				this.#updateUIValue("scaleY", parseFloat(Number(options.scaleY).toFixed(2)));
			}

			if (options.angle !== undefined) {
				this.#updateUIValue("angle", parseInt(options.angle));
			}

			if (options.text !== undefined) {
				this.#updateUIValue("text", options.text);
			}
		});

		addEvents(document.body, ["mouseup", "touchend"], () => {
			if (this.fpdInstance.currentElement) {
				this.#updatePosition();
			}
		});

		addEvents(this.subPanel.querySelectorAll(".fpd-number"), "change", (evt) => {
			const inputElem = evt.currentTarget;
			let numberParameters = {};

			if (inputElem.value > Number(inputElem.max)) {
				inputElem.value = Number(inputElem.max);
			}

			if (inputElem.value < Number(inputElem.min)) {
				inputElem.value = Number(inputElem.min);
			}

			let value = Number(inputElem.value);

			if (inputElem.classList.contains("fpd-slider-number")) {
				inputElem.previousElementSibling.setAttribute("value", value);

				if (
					inputElem.dataset.control === "scaleX" &&
					fpdInstance.currentElement &&
					fpdInstance.currentElement.lockUniScaling
				) {
					numberParameters.scaleY = value;
					this.#updateUIValue("scaleY", value);
				}
			}

			numberParameters[inputElem.dataset.control] = value;

			if (fpdInstance.currentViewInstance) {
				fpdInstance.currentViewInstance.fabricCanvas.setElementOptions(numberParameters);
			}
		});

		addEvents(this.subPanel.querySelectorAll("fpd-range-slider"), "onInput", (evt) => {
			const slider = evt.currentTarget;
			const value = evt.detail;

			if (fpdInstance.currentViewInstance && fpdInstance.currentElement) {
				var props = {},
					propKey = slider.dataset.control;

				props[propKey] = value;

				//proportional scaling
				if (propKey === "scaleX" && fpdInstance.currentElement && fpdInstance.currentElement.lockUniScaling) {
					props.scaleY = value;
					this.#updateUIValue("scaleY", value);
				}

				fpdInstance.currentViewInstance.fabricCanvas.setElementOptions(props);
			}

			const numberInput = evt.currentTarget.nextElementSibling;
			if (numberInput && numberInput.classList.contains("fpd-slider-number")) {
				numberInput.value = value;
			}
		});

		//call content in tab
		addEvents(this.subPanel.querySelectorAll(".fpd-panel-tabs > span"), "click", (evt) => {
			const targetTab = evt.currentTarget;
			const tabsPanel = targetTab.parentNode;
			const tabsContent = tabsPanel.nextElementSibling;

			//select tab
			removeElemClasses(tabsPanel.querySelectorAll("span"), ["fpd-active"]);
			addElemClasses(targetTab, ["fpd-active"]);

			//select tab content
			const contentTabs = Array.from(tabsContent.children);
			removeElemClasses(contentTabs, ["fpd-active"]);

			addElemClasses(
				contentTabs.filter((ct) => ct.dataset.id == targetTab.dataset.tab),
				["fpd-active"]
			);
		});

		//toggle options
		addEvents(this.subPanel.querySelectorAll(".fpd-toggle"), "click", (evt) => {
			const item = evt.currentTarget;
			let toggleParameters = {};

			toggleElemClasses(item, ["fpd-enabled"], !item.classList.contains("fpd-enabled"));

			toggleParameters[item.dataset.control] = item.classList.contains("fpd-enabled")
				? item.dataset.enabled
				: item.dataset.disabled;

			if (["true", "false"].includes(toggleParameters[item.dataset.control])) {
				toggleParameters[item.dataset.control] =
					toggleParameters[item.dataset.control] === "true" ? true : false;
			}

			if (item.classList.contains("fpd-tool-uniscaling-locker")) {
				this.#lockUniScaling(toggleParameters[item.dataset.control]);
			}

			fpdInstance.currentViewInstance.fabricCanvas.setElementOptions(toggleParameters);
		});

		//buttons with mulitple options
		addEvents(this.subPanel.querySelectorAll(".fpd-btn-options"), "click", (evt) => {
			evt.preventDefault();

			const item = evt.currentTarget;
			const options = JSON.parse(item.dataset.options);
			const optionKeys = Object.keys(options);
			const currentVal = fpdInstance.currentElement
				? fpdInstance.currentElement[item.dataset.control]
				: optionKeys[0];
			const nextOption =
				optionKeys.indexOf(currentVal) == optionKeys.length - 1
					? optionKeys[0]
					: optionKeys[optionKeys.indexOf(currentVal) + 1];
			const fpdOpts = {};

			fpdOpts[item.dataset.control] = nextOption;
			item.querySelector("span").className = options[nextOption];

			fpdInstance.currentViewInstance.fabricCanvas.setElementOptions(fpdOpts);
		});

		//button group
		addEvents(this.subPanel.querySelectorAll(".fpd-btn-group [data-option]"), "click", (evt) => {
			evt.preventDefault();

			const item = evt.currentTarget;
			const option = item.dataset.option;

			removeElemClasses(Array.from(item.parentNode.children), ["fpd-active"]);

			addElemClasses(item, ["fpd-active"]);

			const fpdOpts = {};
			fpdOpts[item.parentNode.dataset.control] = option;

			fpdInstance.currentViewInstance.fabricCanvas.setElementOptions(fpdOpts);
		});

		//do action inside group
		addEvents(this.subPanel.querySelectorAll(".fpd-tools-group > [data-do]"), "click", (evt) => {
			const btn = evt.currentTarget;
			const doAction = btn.dataset.do;

			if (doAction == "align-left") fpdInstance.currentElement.alignToPosition("left");
			else if (doAction == "align-right") fpdInstance.currentElement.alignToPosition("right");
			else if (doAction == "align-top") fpdInstance.currentElement.alignToPosition("top");
			else if (doAction == "align-bottom") fpdInstance.currentElement.alignToPosition("bottom");
			else if (doAction == "align-middle") fpdInstance.currentElement.centerElement(false, true);
			else if (doAction == "align-center") fpdInstance.currentElement.centerElement(true, false);
			else if (doAction == "layer-up" || doAction == "layer-down") {
				let currentZ = fpdInstance.currentElement.getZIndex();

				currentZ = doAction == "layer-up" ? currentZ + 1 : currentZ - 1;
				currentZ = currentZ < 0 ? 0 : currentZ;

				fpdInstance.currentViewInstance.fabricCanvas.setElementOptions({ z: currentZ });
			} else if (doAction == "flip-x" || doAction == "flip-y") {
				const flipOpts = {};

				if (doAction == "flip-x") flipOpts.flipX = !fpdInstance.currentElement.flipX;
				else flipOpts.flipY = !fpdInstance.currentElement.flipY;

				fpdInstance.currentViewInstance.fabricCanvas.setElementOptions(flipOpts);
			}
		});

		//edit text panel
		addEvents(this.subPanel.querySelector('textarea[data-control="text"]'), "keyup", (evt) => {
			evt.stopPropagation;
			evt.preventDefault();

			var selectionStart = evt.currentTarget.selectionStart,
				selectionEnd = evt.currentTarget.selectionEnd;

			fpdInstance.currentViewInstance.fabricCanvas.setElementOptions({
				text: evt.currentTarget.value,
			});

			evt.currentTarget.selectionStart = selectionStart;
			evt.currentTarget.selectionEnd = selectionEnd;
		});

		//curved text
		addEvents(this.subPanel.querySelectorAll(".fpd-curved-options > span"), "click", (evt) => {
			const item = evt.currentTarget;
			let curvedOpts = {};

			if (item.dataset.value == "normal") {
				curvedOpts.curved = false;
			} else {
				curvedOpts.curved = true;
				curvedOpts.curveReverse = item.dataset.value == "curveReverse";
			}

			fpdInstance.currentViewInstance.fabricCanvas.setElementOptions(curvedOpts);
			this.#toggleCurvedOptions(curvedOpts);
		});

		//reset
		addEvents(this.navElem.querySelector(".fpd-tool-reset"), "click", (evt) => {
			let originParams = fpdInstance.currentElement.originParams;
			delete originParams["clipPath"];
			delete originParams["path"];

			//if element has bounding box, rescale for scale mode
			if (fpdInstance.currentElement.boundingBox) {
				fpdInstance.currentElement.scaleX = 1;
				originParams.boundingBox = fpdInstance.currentElement.boundingBox;
			}

			fpdInstance.currentViewInstance.fabricCanvas.setElementOptions(originParams);
			fpdInstance.deselectElement();
		});

		//duplicate
		addEvents(this.navElem.querySelector(".fpd-tool-duplicate"), "click", (evt) => {
			fpdInstance.currentViewInstance.fabricCanvas.duplicateElement(fpdInstance.currentElement);
		});

		//remove
		addEvents(this.navElem.querySelector(".fpd-tool-remove"), "click", (evt) => {
			fpdInstance.currentViewInstance.fabricCanvas.removeElement(fpdInstance.currentElement);
		});

		//remove shadow
		addEvents(this.subPanel.querySelector(".fpd-panel-color .fpd-remove-shadow"), "click", (evt) => {
			fpdInstance.currentViewInstance.fabricCanvas.setElementOptions({
				shadowColor: null,
			});
		});

		addEvents(this.navElem.querySelector(".fpd-tool-remove-bg"), "click", (evt) => {
			let element = fpdInstance.currentElement;

			fpdInstance.deselectElement();
			fpdInstance.toggleSpinner(true, fpdInstance.translator.getTranslation("misc", "loading_image"));

			postJSON({
				url: fpdInstance.mainOptions.aiService.serverURL,
				body: {
					service: "removeBG",
					image: element.source,
				},
				onSuccess: (data) => {
					if (data && data.new_image) {
						element.setSrc(
							data.new_image,
							() => {
								element.source = data.new_image;
								element.canvas.renderAll();

								Snackbar(fpdInstance.translator.getTranslation("misc", "ai_remove_bg_success"));
							},
							{ crossOrigin: "anonymous" }
						);
					} else {
						fpdInstance.aiRequestError(data.error);
					}

					fpdInstance.toggleSpinner(false);
				},
				onError: fpdInstance.aiRequestError.bind(fpdInstance),
			});
		});

		//nav item
		addEvents(this.navElem.querySelectorAll("[class^=fpd-tool-]"), "click", (evt) => {
			const navItem = evt.currentTarget;

			if (navItem.dataset.panel) {
				//has a sub a panel

				//add active state to nav item
				removeElemClasses(this.navElem.querySelectorAll("[class^=fpd-tool-]"), ["fpd-active"]);
				addElemClasses(navItem, ["fpd-active"]);

				const subPanels = Array.from(this.subPanel.children);
				const targetPanel = subPanels.filter((p) => p.classList.contains("fpd-panel-" + navItem.dataset.panel));
				removeElemClasses(subPanels, ["fpd-active"]);
				addElemClasses(targetPanel, ["fpd-active"]);

				if (this.currentPlacement == "smart") {
					addElemClasses(this.container, ["fpd-panel-visible"]);

					this.#updatePosition();
				}
			}
		});

		addEvents(this.container.querySelector(".fpd-close"), "click", (evt) => {
			this.toggle(false);
			fpdInstance.deselectElement();
		});

		addEvents(this.container.querySelector(".fpd-close-sub-panel"), "click", (evt) => {
			removeElemClasses(Array.from(this.subPanel.children), ["fpd-active"]);

			removeElemClasses(this.container, ["fpd-panel-visible"]);
		});
	}

	#updateVariantStylesBtn(elem) {
		if (elem.hasOwnProperty("fontFamily")) {
			this.#toggleVariantStylesBtn(false, false);

			if (Array.isArray(this.fpdInstance.mainOptions.fonts) && this.fpdInstance.mainOptions.fonts.length) {
				const targetFontObj = this.fpdInstance.mainOptions.fonts.find(
					(fontObj) => fontObj.name == elem.fontFamily
				);

				//hide style buttons for fonts that do not have a bold or italic variant
				if (targetFontObj?.url && targetFontObj.url.toLowerCase().includes(".ttf")) {
					if (targetFontObj.variants) {
						this.#toggleVariantStylesBtn(
							Boolean(targetFontObj.variants.n7),
							Boolean(targetFontObj.variants.i4)
						);
					} else {
						this.#toggleVariantStylesBtn(false, false);
					}
				} else if (targetFontObj?.url === "google") {
					//google webfonts

					if (targetFontObj.variants) {
						this.#toggleVariantStylesBtn(
							Boolean(targetFontObj.variants.includes("bold")),
							Boolean(targetFontObj.variants.includes("italic"))
						);
					}
				}
			}
		}
	}

	#toggleVariantStylesBtn(bold = true, italic = true) {
		toggleElemClasses(this.subPanel.querySelector(".fpd-tool-text-bold"), ["fpd-disabled"], !bold);

		toggleElemClasses(this.subPanel.querySelector(".fpd-tool-text-italic"), ["fpd-disabled"], !italic);
	}

	#toggleNavItem(tool, toggle = true) {
		const tools = this.navElem.querySelectorAll(".fpd-tools-nav .fpd-tool-" + tool);

		toggleElemClasses(tools, ["fpd-hidden"], !Boolean(toggle));

		return tools;
	}

	#togglePanelTool(panel, tools, toggle) {
		toggle = Boolean(toggle);

		const panelElem = this.subPanel.querySelector(".fpd-panel-" + panel);

		toggleElemClasses(panelElem.querySelectorAll(".fpd-tool-" + tools), ["fpd-hidden"], !toggle);

		return panel;
	}

	#togglePanelTab(panel, tab, toggle) {
		const panelElem = this.subPanel.querySelector(".fpd-panel-" + panel);

		toggleElemClasses(
			panelElem.querySelectorAll('.fpd-panel-tabs [data-tab="' + tab + '"]'),
			["fpd-hidden"],
			!toggle
		);
	}

	#updateElementColor(element, hexColor) {
		let elementType = element.isColorizable();

		if (elementType !== "png") {
			element.changeColor(hexColor);
		}
	}

	#setElementColor(element, hexColor) {
		this.navElem.querySelector(".fpd-current-fill").style.background = hexColor;
		this.fpdInstance.currentViewInstance.fabricCanvas.setElementOptions({ fill: hexColor }, element);
	}

	#updateGroupPath(element, pathIndex, hexColor) {
		const groupColors = element.changeObjectColor(pathIndex, hexColor);
		this.fpdInstance.currentViewInstance.fabricCanvas.setElementOptions({ fill: groupColors }, element);
	}

	#lockUniScaling(locked) {
		const lockElem = this.subPanel.querySelector(".fpd-tool-uniscaling-locker > span");
		lockElem.className = locked ? "fpd-icon-locked" : "fpd-icon-unlocked";

		toggleElemClasses(this.subPanel.querySelector(".fpd-tool-scaleY"), ["fpd-disabled"], locked);
	}

	#toggleCurvedOptions(opts = {}) {
		const curvedOptionsElem = this.subPanel.querySelector(".fpd-curved-options");

		removeElemClasses(curvedOptionsElem.querySelectorAll("[data-value]"), ["fpd-active"]);

		if (opts.curved) {
			if (opts.curveReverse) {
				addElemClasses(curvedOptionsElem.querySelectorAll('[data-value="curveReverse"]'), ["fpd-active"]);
			} else {
				addElemClasses(curvedOptionsElem.querySelectorAll('[data-value="curved"]'), ["fpd-active"]);
			}
		} else {
			addElemClasses(curvedOptionsElem.querySelectorAll('[data-value="normal"]'), ["fpd-active"]);
		}

		toggleElemClasses(this.subPanel.querySelector(".fpd-tool-curved-text-radius"), ["fpd-hidden"], !opts.curved);
	}

	#hasToolbar(elem) {
		return elem && !elem._ignore && !elem.uploadZone;
	}

	#update(element) {
		this.#reset();
		removeElemClasses(this.container, ["fpd-type-image"]);

		let colorPanel;

		//COLOR: colors array, true=svg colorization
		if (element.hasColorSelection()) {
			let availableColors = elementAvailableColors(element, this.fpdInstance);

			if (element.type === "group" && element.getObjects().length > 1) {
				const paletterPerPath = Array.isArray(element.colors) && element.colors.length > 1;

				colorPanel = ColorPalette({
					colors: availableColors,
					colorNames: this.fpdInstance.mainOptions.hexNames,
					palette: element.colors,
					subPalette: paletterPerPath,
					enablePicker: this.fpdInstance.mainOptions.editorMode ? true : !paletterPerPath,
					onChange: (hexColor, pathIndex) => {
						this.#updateGroupPath(element, pathIndex, hexColor);
					},
					//only for colorpicker per path
					onMove: (hexColor, pathIndex) => {
						element.changeObjectColor(pathIndex, hexColor);
					},
				});
			} else {
				colorPanel = ColorPanel(this.fpdInstance, {
					initialColor: element.fill,
					colors: availableColors,
					patterns:
						Array.isArray(element.patterns) && (element.isSVG() || element.getType() === "text")
							? element.patterns
							: null,
					onMove: (hexColor) => {
						this.#updateElementColor(element, hexColor);
					},
					onChange: (hexColor) => {
						this.#setElementColor(element, hexColor);
					},
					onPatternChange: (patternImg) => {
						this.navElem.querySelector(".fpd-current-fill").style.background = `url("${patternImg}")`;

						this.fpdInstance.currentViewInstance.fabricCanvas.setElementOptions(
							{ pattern: patternImg },
							element
						);
					},
				});
			}

			if (colorPanel) this.#colorWrapper.append(colorPanel);

			//stroke
			const strokeColorWrapper = this.subPanel.querySelector(".fpd-stroke-color-wrapper");
			strokeColorWrapper.innerHTML = "";
			const strokeColorPanel = ColorPanel(this.fpdInstance, {
				colors:
					Array.isArray(element.strokeColors) && element.strokeColors.length > 0
						? element.strokeColors
						: [element.stroke ? element.stroke : "#000"],
				onMove: (hexColor) => {
					this.fpdInstance.currentViewInstance.fabricCanvas.setElementOptions({ stroke: hexColor }, element);
				},
				onChange: (hexColor) => {
					this.fpdInstance.currentViewInstance.fabricCanvas.setElementOptions({ stroke: hexColor }, element);
				},
			});
			strokeColorWrapper.append(strokeColorPanel);

			//shadow
			const shadowColorWrapper = this.subPanel.querySelector(".fpd-shadow-color-wrapper");
			shadowColorWrapper.innerHTML = "";
			const shadowColorPicker = ColorPicker({
				initialColor: tinycolor(element.shadowColor).isValid() ? element.shadowColor : "#000000",
				colorNames: this.fpdInstance.mainOptions.hexNames,
				palette: this.fpdInstance.mainOptions.colorPickerPalette,
				onMove: (hexColor) => {
					this.fpdInstance.currentViewInstance.fabricCanvas.setElementOptions(
						{ shadowColor: hexColor },
						element
					);
				},
				onChange: (hexColor) => {
					this.fpdInstance.currentViewInstance.fabricCanvas.setElementOptions(
						{ shadowColor: hexColor },
						element
					);
				},
			});
			shadowColorWrapper.append(shadowColorPicker);

			this.#toggleNavItem("color");
			this.#togglePanelTab("color", "fill", true);
			this.#togglePanelTab("color", "stroke", element.getType() === "text");
			this.#togglePanelTab("color", "shadow", true);
		}

		//enable only patterns
		if (
			!colorPanel &&
			(element.isSVG() || element.getType() === "text") &&
			element.patterns &&
			element.patterns.length
		) {
			colorPanel = ColorPanel(this.fpdInstance, {
				colors: [],
				patterns: element.patterns,
				onPatternChange: (patternImg) => {
					this.navElem.querySelector(".fpd-current-fill").style.background = `url("${patternImg}")`;

					this.fpdInstance.currentViewInstance.fabricCanvas.setElementOptions(
						{ pattern: patternImg },
						element
					);
				},
			});

			this.#colorWrapper.append(colorPanel);

			this.#toggleNavItem("color");
			this.#togglePanelTab("color", "fill", true);
		}

		//TRANSFORM
		let showScale = Boolean(
			(element.resizable && element.getType() === "image") || element.uniScalingUnlockable || element.__editorMode
		);
		if (showScale || element.rotatable) {
			this.#toggleNavItem("transform");
			this.#togglePanelTool("transform", "scale", showScale);
			this.#lockUniScaling(element.lockUniScaling);
			this.#togglePanelTool(
				"transform",
				"uniscaling-locker",
				Boolean(element.uniScalingUnlockable || element.__editorMode)
			);
			this.#togglePanelTool("transform", "angle", Boolean(element.rotatable || element.__editorMode));
			this.#togglePanelTool("transform", "flip", Boolean(showScale || element.__editorMode));
		}

		//POSITION
		if (element.draggable || element.zChangeable || element.__editorMode) {
			this.#toggleNavItem("position");
			this.#togglePanelTab("position", "arrange", Boolean(element.zChangeable || element.__editorMode));
			this.#togglePanelTab("position", "align", Boolean(element.draggable || element.__editorMode));
		}
		//EDIT TEXT
		if (element.getType() === "text" && (element.editable || element.__editorMode)) {
			this.#toggleNavItem("edit-text");

			this.#toggleNavItem(
				"text-size",
				Boolean(element.resizable || element.__editorMode) && !element.widthFontSize
			);
			this.#toggleNavItem("font-family");
			this.#toggleNavItem("text-format");

			if (element.curvable) {
				this.#toggleNavItem("curved-text");
				this.#toggleCurvedOptions(element);

				this.subPanel
					.querySelector('fpd-range-slider[data-control="curveRadius"]')
					.setAttribute("max", element.maxCurveRadius);
			}

			this.subPanel.querySelector('textarea[data-control="text"]').value = element.text;

			this.#toggleNavItem("edit-text", !element.textPlaceholder && !element.numberPlaceholder);
		} else if (element.getType() !== "text") {
			addElemClasses(this.container, ["fpd-type-image"]);
		}

		if (element.advancedEditing && element.source && isBitmap(element.source)) {
			this.#toggleNavItem("advanced-editing");
			this.#togglePanelTab("advanced-editing", "filters", true);
			this.#togglePanelTab(
				"advanced-editing",
				"crop",
				Boolean(
					Array.isArray(this.fpdInstance.mainOptions.cropMasks) &&
						this.fpdInstance.mainOptions.cropMasks.length
				)
			);

			this.#toggleNavItem(
				"remove-bg",
				Boolean(
					this.fpdInstance.mainOptions.aiService.serverURL && this.fpdInstance.mainOptions.aiService.removeBG
				)
			);
		}

		this.#togglePanelTool("text-size", "text-line-spacing", !element.curved);
		this.#toggleNavItem("reset");
		this.#toggleNavItem("duplicate", element.copyable || element.__editorMode);
		this.#toggleNavItem("remove", element.removable || element.__editorMode);

		//display only enabled tabs and when tabs length > 1
		this.subPanel.querySelectorAll(".fpd-panel-tabs").forEach((tabs) => {
			const visibleTabs = tabs.querySelectorAll("[data-tab]:not(.fpd-hidden)");

			toggleElemClasses(tabs, ["fpd-hidden"], visibleTabs.length <= 1);

			//select first visible tab
			if (visibleTabs.item(0)) visibleTabs.item(0).click();
		});

		//set UI value by selected element
		this.container.querySelectorAll("[data-control]").forEach((uiElement) => {
			const parameter = uiElement.dataset.control;

			if (uiElement.classList.contains("fpd-number")) {
				if (element[parameter] !== undefined) {
					var numVal =
						uiElement.step && uiElement.step.length > 1
							? parseFloat(element[parameter]).toFixed(2)
							: parseInt(element[parameter]);
					uiElement.value = numVal;

					if (uiElement.classList.contains("fpd-slider-number")) {
						const inputSlider = uiElement.previousElementSibling;
						if (parameter == "fontSize") {
							inputSlider.setAttribute("min", element.minFontSize);
							inputSlider.setAttribute("max", element.maxFontSize);
						} else if (parameter == "scaleX" || parameter == "scaleY") {
							inputSlider.setAttribute("min", element.minScaleLimit);
						}

						inputSlider.setAttribute("value", numVal);
					}
				}
			} else if (uiElement.classList.contains("fpd-toggle")) {
				toggleElemClasses(uiElement, ["fpd-enabled"], element[parameter] === uiElement.dataset.enabled);
			} else if (uiElement.classList.contains("fpd-btn-options")) {
				const options = JSON.parse(uiElement.dataset.options);
				uiElement.querySelector("span").className = options[element[parameter]];
			} else if (uiElement.classList.contains("fpd-btn-group")) {
				removeElemClasses(Array.from(uiElement.children), ["fpd-active"]);

				const control = uiElement.dataset.control;
				addElemClasses(uiElement.querySelector('[data-option="' + element[control] + '"]'), ["fpd-active"]);
			} else if (parameter == "fontFamily") {
				this.navElem.querySelector(".fpd-tool-font-family fpd-dropdown > input").value = element[parameter];

				if (element[parameter] !== undefined) {
					removeElemClasses(this.subPanel.querySelectorAll(".fpd-fonts-list .fpd-item"), ["fpd-active"]);

					addElemClasses(
						this.subPanel.querySelector(
							'.fpd-fonts-list .fpd-item[data-value="' + element[parameter] + '"]'
						),
						["fpd-active"]
					);
				}
			} else if (parameter == "fontSize") {
				this.navElem.querySelector(".fpd-tool-text-size > input").value = element[parameter];
			}

			const bgCss = getBgCssFromElement(element);
			if (bgCss) {
				this.navElem.querySelector(".fpd-current-fill").style.background = bgCss;
			}
		});

		//select first visible nav item
		if (this.currentPlacement == "sidebar") {
			this.navElem.querySelector("[data-panel]:not(.fpd-hidden)").click();
		}

		this.toggle();

		//reset scroll
		this.container.querySelectorAll(".fpd-scroll-area").forEach((scrollArea) => {
			scrollArea.scrollLeft = scrollArea.scrollTop = 0;
		});

		this.container.dataset.fabricType = element.type;
		this.container.dataset.elementType = element.getType();
	}

	#updatePosition() {
		if (
			this.currentPlacement !== "smart" ||
			!this.#hasToolbar(this.fpdInstance.currentElement) ||
			this.fpdInstance.container.classList.contains("fpd-aie-visible")
		)
			return;

		this.toggle(Boolean(this.fpdInstance.currentElement));

		if (this.fpdInstance.currentElement) {
			const fpdElem = this.fpdInstance.currentElement;
			const fpdContRect = this.fpdInstance.container.getBoundingClientRect();

			//top
			const elemBoundingRect = fpdElem.getBoundingRect();
			const lowestY =
				elemBoundingRect.top + elemBoundingRect.height + fpdElem.controls.mtr.offsetY + fpdElem.cornerSize;
			let posTop = this.fpdInstance.productStage.getBoundingClientRect().top + lowestY;

			//below container
			if (posTop > fpdContRect.height + fpdContRect.top) {
				posTop = fpdContRect.height + fpdContRect.top;
			}

			//stay in viewport
			if (posTop > window.innerHeight - this.container.clientHeight) {
				posTop = window.innerHeight - this.container.clientHeight;
			}

			//left
			const oCoords = fpdElem.oCoords;
			const halfWidth = this.container.offsetWidth / 2;
			const viewStageRect = this.fpdInstance.currentViewInstance.fabricCanvas.wrapperEl.getBoundingClientRect();
			let posLeft = viewStageRect.left + oCoords.mt.x;
			posLeft = posLeft < halfWidth ? halfWidth : posLeft; //move toolbar not left outside of document
			posLeft = posLeft > window.innerWidth - halfWidth ? window.innerWidth - halfWidth : posLeft; //move toolbar not right outside of document

			this.container.style.top = posTop + "px";
			this.container.style.left = posLeft + "px";
		}
	}

	toggle(toggle = true) {
		toggleElemClasses(this.container, ["fpd-show"], toggle);
		toggleElemClasses(document.body, ["fpd-toolbar-visible"], toggle);
	}

	#setWrapper() {
		const layout = this.fpdInstance.container.dataset.layout;
		this.container.className = "fpd-layout-" + layout;

		if (!this.fpdInstance.container.classList.contains("fpd-sidebar")) {
			this.fpdInstance.mainOptions.toolbarPlacement = "smart";
		}

		if (
			this.fpdInstance.mainOptions.toolbarPlacement == "smart" ||
			this.fpdInstance.container.classList.contains("fpd-layout-small")
		) {
			if (this.currentPlacement != "smart") {
				if (this.fpdInstance.mainOptions.toolbarDynamicContext == "body")
					document.body.appendChild(this.container);
				else
					document
						.querySelector(this.fpdInstance.mainOptions.toolbarDynamicContext)
						.appendChild(this.container);
			}

			this.currentPlacement = "smart";
			this.container.className += " fpd-container fpd-smart";
		} else {
			if (this.currentPlacement != "sidebar") {
				this.fpdInstance.mainBar.container.appendChild(this.container);
			}

			this.currentPlacement = "sidebar";
			this.container.className += " fpd-container fpd-sidebar";
		}

		this.navElem = this.container.querySelector(".fpd-tools-nav");
		this.subPanel = this.container.querySelector(".fpd-sub-panel");
		this.#colorWrapper = this.subPanel.querySelector(".fpd-color-wrapper");

		removeElemClasses(this.fpdInstance.container, ["fpd-toolbar-smart", "fpd-toolbar-sidebar"]);

		addElemClasses(this.fpdInstance.container, ["fpd-toolbar-" + this.currentPlacement]);
	}

	#updateUIValue(tool, value) {
		this.subPanel.querySelectorAll('[data-control="' + tool + '"]').forEach((toolInput) => {
			toolInput.value = value;
			toolInput.setAttribute("value", value);
		});
	}

	#reset() {
		this.#colorWrapper.innerHTML = "";

		removeElemClasses(this.container, ["fpd-panel-visible"]);

		//hide tool in row
		addElemClasses(this.navElem.querySelectorAll("[class^=fpd-tool-]"), ["fpd-hidden"]);

		removeElemClasses(this.navElem.querySelectorAll("[class^=fpd-tool-]"), ["fpd-active"]);

		//hide all sub panels in sub toolbar
		removeElemClasses(Array.from(this.subPanel.children), ["fpd-active"]);

		addElemClasses(this.subPanel.querySelectorAll(".fpd-panel-tabs > span"), ["fpd-hidden"]);

		//remove active tabs
		removeElemClasses(this.subPanel.querySelectorAll(".fpd-panel-tabs-content > *, .fpd-panel-tabs > *"), [
			"fpd-active",
		]);
	}
}
