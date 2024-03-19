import '../../../ui/view/modules/TextLayers.js';

import {
    addEvents,
    elementAvailableColors
} from '../../../helpers/utils.js';

import ColorPanel from '../../../ui/view/comps/ColorPanel.js';

export default class TextLayersModule extends EventTarget {

    constructor(fpdInstance, wrapper) {

        super();

        this.fpdInstance = fpdInstance;

        this.container = document.createElement("fpd-module-text-layers");
        wrapper.append(this.container);

        this.listElem = this.container.querySelector('.fpd-list');

        addEvents(
            fpdInstance,
            ['elementAdd', 'elementRemove', 'viewSelect', 'productCreate'],
            (evt) => {

                if (fpdInstance.productCreated) {
                    this.#updateList();
                }
            }
        )

        addEvents(
            fpdInstance,
            ['elementModify', 'textLinkApply'],
            (evt) => {

                if (fpdInstance.productCreated) {

                    const { element, options } = evt.detail;
                    const rowElem = this.listElem.querySelector('.fpd-list-row[id="' + element.id + '"]');

                    if (rowElem) {

                        const fontSizeInput = rowElem.querySelector('[data-control="fontSize"]');
                        if (options.fontSize && fontSizeInput)
                            fontSizeInput.value = options.fontSize;

                        const fontFamilyDropdown = rowElem.querySelector('fpd-dropdown');
                        if (options.fontFamily && fontFamilyDropdown)
                            fontFamilyDropdown.setAttribute('value', options.fontFamily);

                        const textInput = rowElem.querySelector('.fpd-text-input');

                        if (options.text && textInput)
                            textInput.value = options.text;

                    }

                }

            }
        )

    }

    #updateList() {

        this.listElem.innerHTML = '';

        this.fpdInstance.getElements(this.fpdInstance.currentViewIndex, 'all', false)
            .forEach((element) => {

                if (element.checkEditable() && element.getType() == 'text') {
                    this.#appendLayerItem(element);
                }

            });

    }

    #createFontsDropdown(fonts, wrapper, element) {

        const fontsDropdown = document.createElement('fpd-dropdown');
        fontsDropdown.searchable = true;
        wrapper.append(fontsDropdown);

        const listArea = fontsDropdown.querySelector('.fpd-dropdown-list > .fpd-scroll-area');
        fonts.forEach((fontObj, i) => {

            if(!listArea) return;
            
            if (typeof fontObj == 'object') {
                fontObj = fontObj.name;
            }

            const fontItem = document.createElement('span');
            fontItem.className = 'fpd-item';
            fontItem.family = fontObj;
            fontItem.style.fontFamily = fontObj;
            fontItem.innerText = fontObj;
            fontItem.addEventListener('click', (evt) => {

                fontsDropdown.setAttribute('value', evt.currentTarget.innerText);

                this.fpdInstance.currentViewInstance.fabricCanvas.
                    setElementOptions({ fontFamily: fontObj }, element);

            })

            listArea.append(fontItem)

        });

        return fontsDropdown;

    }

    #appendLayerItem(element) {

        //create row node
        const rowElem = document.createElement('div');
        rowElem.className = 'fpd-list-row';
        rowElem.id = element.id;
        this.listElem.prepend(rowElem);

        if (element.editable) {

            //title display
            const titleElem = document.createElement('div');
            titleElem.className = 'fpd-cell-full fpd-title';
            titleElem.innerText = element.title;
            rowElem.append(titleElem);

            //text input
            const textWrapper = document.createElement('div');
            textWrapper.className = 'fpd-cell-full';
            rowElem.append(textWrapper);

            let textInput;
            if (element.maxLines == 1) {

                textInput = document.createElement('input');
                textInput.value = element.text;
                textWrapper.append(textInput);

            }
            else {

                textInput = document.createElement('textarea');
                textInput.value = element.text;
                if(element.maxLines)
                    textInput.rows = element.maxLines;
                textWrapper.append(textInput);

            }

            textInput.className = 'fpd-text-input';

            const textClear = document.createElement('span');
            textClear.className = 'fpd-clear-text';
            textClear.innerText = this.fpdInstance.translator.getTranslation('modules', 'text_layers_clear', 'Clear');
            textWrapper.append(textClear);

            addEvents(
                textClear,
                'click',
                (evt) => {

                    evt.stopPropagation();

                    this.fpdInstance.currentViewInstance.fabricCanvas.
                        setElementOptions({ text: '' }, element);

                    textInput.value = '';

                }
            )

            //update input when text has changed
            element.on({
                'editing:exited': () => {
                    textInput.value = element.text;
                },
            })

            addEvents(
                textInput,
                'keyup',
                (evt) => {

                    evt.stopPropagation();

                    let txt = evt.target.value;
                    txt = txt.replace(FancyProductDesigner.forbiddenTextChars, '');

                    //remove emojis
                    if (this.fpdInstance.mainOptions.disableTextEmojis) {
                        txt = txt.replace(FPDEmojisRegex, '');
                        txt = txt.replace(String.fromCharCode(65039), ""); //fix: some emojis left a symbol with char code 65039
                    }

                    this.fpdInstance.currentViewInstance.fabricCanvas.
                        setElementOptions({ text: txt }, element);

                }
            )

            //font-family
            const availableFonts = Array.isArray(this.fpdInstance.mainOptions.fonts) ? this.fpdInstance.mainOptions.fonts : [];
            if (availableFonts.length) {

                const fontsWrapper = document.createElement('div');
                fontsWrapper.className = 'fpd-cell-1';
                rowElem.append(fontsWrapper);

                const fontsDropdown = this.#createFontsDropdown(availableFonts, fontsWrapper, element);
                fontsDropdown.setAttribute('value', element.fontFamily);

            }

        }

        //font size
        if (element.resizable || element.__editorMode) {

            const fontSizeWrapper = document.createElement('div');
            fontSizeWrapper.className = 'fpd-cell-2';
            rowElem.append(fontSizeWrapper);

            const fontSizeInput = document.createElement('input');
            fontSizeInput.className = 'fpd-tooltip';
            fontSizeInput.setAttribute('aria-label', this.fpdInstance.translator.getTranslation('toolbar', 'font_size', 'Font Size'));
            fontSizeInput.type = 'number';
            fontSizeInput.value = element.fontSize;
            fontSizeInput.dataset.control = 'fontSize';
            fontSizeInput.min = element.minFontSize;
            fontSizeInput.max = element.maxFontSize;
            fontSizeWrapper.append(fontSizeInput);

            addEvents(
                fontSizeInput,
                'change',
                (evt) => {

                    this.fpdInstance.currentViewInstance.fabricCanvas.
                        setElementOptions({ fontSize: parseInt(evt.currentTarget.value) }, element);

                    fontSizeInput.value = element.fontSize;

                }
            )

        }

        //color panel
        if (element.hasColorSelection()) {

            const colorPanelWrapper = document.createElement('div');
            colorPanelWrapper.className = 'fpd-cell-full';
            rowElem.append(colorPanelWrapper);

            const availableColors = elementAvailableColors(element, this.fpdInstance);

            const colorPanel = ColorPanel(this.fpdInstance, {
                colors: availableColors,
                patterns: Array.isArray(element.patterns) && (element.isSVG() || element.getType() === 'text') ? element.patterns : null,
                onMove: (hexColor) => {

                    element.changeColor(hexColor);

                },
                onChange: (hexColor) => {

                    this.fpdInstance.currentViewInstance.fabricCanvas
                        .setElementOptions({ fill: hexColor }, element);

                },
                onPatternChange: (patternImg) => {

                    this.fpdInstance.currentViewInstance.fabricCanvas.setElementOptions(
                        { pattern: patternImg },
                        element
                    );

                }
            })

            if (colorPanel)
                colorPanelWrapper.append(colorPanel)

        }

    }

}

window.FPDTextLayersModule = TextLayersModule;