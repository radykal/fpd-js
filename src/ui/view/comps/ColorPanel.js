import ColorPicker from "./ColorPicker.js";
import ColorPalette from "./ColorPalette.js";
import Patterns from "./Patterns.js";
import { isHexColor } from "../../../fabricjs/utils.js";

const ColorPanel = (fpdInstance, props) => {
	if (!props.colors) return;

	const colorPanel = document.createElement("div");
	colorPanel.className = "fpd-color-panel";

	if (props.colors.length === 1) {
		const colorPicker = ColorPicker({
			initialColor: isHexColor(props.initialColor) ? props.initialColor : props.colors[0],
			colorNames: fpdInstance.mainOptions.hexNames,
			palette: fpdInstance.mainOptions.colorPickerPalette,
			onMove: (hexColor) => {
				if (props.onMove) props.onMove(hexColor);
			},
			onChange: (hexColor) => {
				if (props.onChange) props.onChange(hexColor);
			},
		});

		colorPanel.append(colorPicker);
	} else {
		const colorPalette = ColorPalette({
			colors: props.colors,
			colorNames: fpdInstance.mainOptions.hexNames,
			palette: fpdInstance.mainOptions.colorPickerPalette,
			onChange: (hexColor) => {
				if (props.onChange) props.onChange(hexColor);
			},
		});

		colorPanel.append(colorPalette);
	}

	if (props.patterns) {
		const patternsPanel = Patterns({
			images: props.patterns,
			onChange: (patternImg) => {
				if (props.onPatternChange) props.onPatternChange(patternImg);
			},
		});

		colorPanel.append(patternsPanel);
	}

	return colorPanel;
};

export default ColorPanel;
