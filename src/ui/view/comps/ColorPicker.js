import Picker from "vanilla-picker/csp";
import tinycolor from "tinycolor2";

import ColorPalette from "./ColorPalette.js";

import { addEvents } from "../../../helpers/utils.js";

const ColorPicker = (props) => {
	let initialSet = false; //picker change is fired on initial set, so only fire callbacks on interaction
	const changeTimeout = 500; //change callback after 500ms of no-dragging
	let changeTimeoutHandle = null;

	const colorPickerWrapper = document.createElement("div");
	colorPickerWrapper.className = "fpd-colorpicker-wrapper";

	const picker = new Picker({
		parent: colorPickerWrapper,
		popup: false,
		alpha: false,
		color: tinycolor(props.initialColor).isValid() ? props.initialColor : "#fff",
		onChange: (color) => {
			const hexColor = tinycolor(color.rgbaString).toHexString();

			if (initialSet && props.onMove) props.onMove(hexColor);

			if (typeof changeTimeoutHandle === "number") {
				clearTimeout(changeTimeoutHandle);
			}

			changeTimeoutHandle = setTimeout(() => {
				if (initialSet && props.onChange) props.onChange(hexColor);

				initialSet = true;
			}, changeTimeout);
		},
	});

	if (window.EyeDropper !== undefined) {
		const eyeDropperHandle = picker.domElement.querySelector(".picker_sample");

		const eyeDropperIcon = document.createElement("span");
		eyeDropperIcon.className = "fpd-icon-color";
		eyeDropperHandle.append(eyeDropperIcon);

		addEvents(eyeDropperHandle, "click", (evt) => {
			const eyeDropper = new EyeDropper();

			eyeDropper
				.open()
				.then((result) => {
					picker.setColor(result.sRGBHex);
				})
				.catch((err) => {
					console.log(err);
				});
		});
	}

	if (props.palette && Array.isArray(props.palette)) {
		const colorPickerPalette = ColorPalette({
			colors: props.palette,
			colorNames: props.colorNames,
			onChange: (color) => {
				if (props.onChange) props.onChange(color);
			},
		});

		colorPickerWrapper.append(colorPickerPalette);
	}

	return colorPickerWrapper;
};

export default ColorPicker;
