import { select } from 'd3';

import { ELEMENT_SUB_TYPE, ELEMENT_TYPE } from "../DesignSection/ElementsPicker/ElementsPicker";

export const CHART_TYPE = {
  VERTICAL_BAR_CHART: 'VERTICAL_BAR_CHART',
  HORIZONTAL_BAR_CHART: 'HORIZONTAL_BAR_CHART',
  PIE_CHART: 'PIE_CHART',
  DONUT_CHART: 'DONUT_CHART',
  LINE_CHART: 'LINE_CHART'
};

export const CHART_COLUMNS = {
  DATASET1: 'DATASET1',
  DATASET2: 'DATASET2',
  DATASET3: 'DATASET3',
  DATASET4: 'DATASET4',
  DATASET5: 'DATASET5',
  LABEL: 'LABEL'
};

export const prepareInitialChartData = (chartType) => {
  let dummyData = [1, 2, 3, 4, 5, null];
  let prepareData = dummyData.map((data, index) => {
    return prepareGraphObject([data ? `Item ${data}` : ''], index, chartType);
  });
  return prepareData;
};

export const prepareGraphObject = (data, index, chartType) => {
  let graphObject = {
    id: index,
    [CHART_COLUMNS.LABEL]: data[0] || '',
    [CHART_COLUMNS.DATASET1]: data[1] || (data[0] ? (index + 1) * 10 : ''),
  };
  if (chartType !== CHART_TYPE.PIE_CHART) {
    graphObject[CHART_COLUMNS.DATASET2] = data[2] || '';
    graphObject[CHART_COLUMNS.DATASET3] = data[3] || '';
    graphObject[CHART_COLUMNS.DATASET4] = data[4] || '';
    graphObject[CHART_COLUMNS.DATASET5] = data[5] || '';
  }
  return graphObject;
};

export const removeEmptyObject = (chartData) => {
  const filteredData = chartData.filter(d => d[CHART_COLUMNS.LABEL]
    || d[CHART_COLUMNS.DATASET1]
    || d[CHART_COLUMNS.DATASET2]
    || d[CHART_COLUMNS.DATASET3]
    || d[CHART_COLUMNS.DATASET4]
    || d[CHART_COLUMNS.DATASET5]);
  return filteredData;
}


export class ChartCommonUtils {
    static colors = {
        [CHART_COLUMNS.DATASET1]: "#436ebe",
        [CHART_COLUMNS.DATASET2]: "#008ed4",
        [CHART_COLUMNS.DATASET3]: "#00addd",
        [CHART_COLUMNS.DATASET4]: "#00cadc",
        [CHART_COLUMNS.DATASET5]: "#37e5d4",
        [CHART_COLUMNS.LABEL]: 'black'
    }

    static addChartToCanvas(svg, chartConfig, handleAddElement) {
        this.convertD3SvgInImage(svg, (image) => {
            handleAddElement({
                type: ELEMENT_TYPE.IMAGE,
                subType: ELEMENT_SUB_TYPE.CHART,
                chartType: chartConfig.chartType,
                value: image,
                data: {
                    chartObjectList: chartConfig.chartObjectList,
                    colors: chartConfig.colors,
                    chartType: chartConfig.chartType,
                    fontSize: chartConfig.fontSize,
                    keys: chartConfig.keys,
                    scale: chartConfig.scale,
                    scaleX: chartConfig.scaleX,
                    scaleY: chartConfig.scaleY
                }
            });
        });
    }

    static getD3SVGBase64 = svg => {
        var html = svg
            .attr("version", 1.1)
            .attr("xmlns", "http://www.w3.org/2000/svg")
            .node().parentNode.innerHTML;

        return "data:image/svg+xml;base64," + btoa(html);
    };

    static convertD3SvgInImage = (svg, callback) => {
        let image = new Image();
        image.src = this.getD3SVGBase64(svg);
        this.removeD3Svg(svg);
        image.onload = () => {
            callback(image);
        };
    };

    static removeD3Svg = (svg) => {
        svg.node().parentNode.remove();
    };

    static createSvgPlaceHolder = (width, height) => {
        console.log('createSvgPlaceHolder: ', width, height);
        const svg = select('body')
            .append('div')
            .append('svg')
            .attr("width", width)
            .attr("height", height);

        return svg;
    }

    static calculateFontSize = (chartData) => {
        let fontSize = getFontSizeInNumber(chartData) || 10;
        return getFontSizeInNumber(chartData, fontSize) * chartData.scale + 'px';
    }

    static applyTickColor(axis) {
        axis
            .selectAll(".tick line")
            .style('stroke', '#C0C0BB');
    }
}

import { StackBarChartVerticalUtils } from './StackBarChartVertical/StackBarChartVerticalUtils';
import { StackBarChartHorizontalUtils } from './StackBarChartHorizontal/StackBarChartHorizontalUtils';
import { CHART_TYPE } from './ChartEnums';
import { ChartCommonUtils } from './ChartCommonUtils';
import { ELEMENT_SUB_TYPE } from '../../DesignSection/ElementsPicker/ElementsPicker';
import { PieChartUtils } from './PieChart/PieChartUtils';
import { LineChartUtils } from './LineChart/LineChartUtils';

export const findChartClassByChartType = (chartType) => {
  let chartUtilsClass;

  switch (chartType) {
    case CHART_TYPE.VERTICAL_BAR_CHART:
      chartUtilsClass = StackBarChartVerticalUtils;
      break;
    case CHART_TYPE.HORIZONTAL_BAR_CHART:
      chartUtilsClass = StackBarChartHorizontalUtils;
      break;
    case CHART_TYPE.PIE_CHART:
    case CHART_TYPE.DONUT_CHART:
      chartUtilsClass = PieChartUtils;
      break;
    case CHART_TYPE.LINE_CHART:
      chartUtilsClass = LineChartUtils;
      break;
    default:
      chartUtilsClass = StackBarChartVerticalUtils;
  }
  return chartUtilsClass;
}

export const updateChartData = (key, value, chartData = {}) => {
  let copyChartData = { ...chartData, [key]: value };
  return copyChartData;
}

export const findLayer = (id, layer) => {
  let layerIndex = layer.findIndex(l => l.id === id);
  return {
    layerIndex, foundLayer: layerIndex > -1 ? layer[layerIndex] : {}
  };
};

const updateLayers = (image, layerIndex, layer, key, data, chartType) => {
  let copyLayers = [...layer];
  let copyLayer = { ...copyLayers[layerIndex] };
  copyLayer.image = image;
  copyLayer.data = updateChartData(key, data, copyLayer.data);
  copyLayer.chartType = chartType;
  copyLayers[layerIndex] = copyLayer;
  return copyLayers;
}

export const updateCanvasChart = (layer, layerId, key, value, modifiedChartType, callback) => {
  let { layerIndex, foundLayer } = findLayer(layerId, layer);
  if (foundLayer) {
    let chartType = modifiedChartType || foundLayer.chartType;
    let data = { ...foundLayer.data, [key]: value };
    getChartImage(data, chartType, (image) => {
      let copyLayers = updateLayers(image, layerIndex, layer, key, value, chartType);
      callback(copyLayers, false);
    });
  } else {
    callback(null, true);
  }
};

export const getChartImage = (data, chartType, callback) => {
  let chartClass = findChartClassByChartType(chartType);
  let svg = chartClass.createChart(data);
  ChartCommonUtils.convertD3SvgInImage(svg, (image) => {
    callback(image, true);
  });
};

export const getChartFontSize = (shapeRef) => {
  if (shapeRef && shapeRef.current) {
    let chartData = shapeRef.current.getAttr('data');
    return getFontSizeInNumber(chartData)
  }
  return null;
};

export const getFontSizeInNumber = (chartData) => {
  if (chartData && chartData.fontSize) {
    return parseFloat(chartData.fontSize);
  }
  return null;
};


export const updateChartFontSize = (shapeProps, scaleX) => {
  if (shapeProps && shapeProps.subType === ELEMENT_SUB_TYPE.CHART) {
    let chartData = shapeProps.data;
    let fontSize = getFontSizeInNumber(chartData);
    let updatedProps = { ...shapeProps };
    updatedProps.data = { ...updatedProps.data };
    updatedProps.data.fontSize = `${fontSize * scaleX}px`;
    updatedProps.data.scale = updatedProps.data.scale * (1 / scaleX);
    return updatedProps;
  }
  return shapeProps;
};

export const updateChartScale = (shapeProps, scaleX, scaleY) => {
  if (shapeProps && shapeProps.subType === ELEMENT_SUB_TYPE.CHART) {
    let updatedProps = { ...shapeProps };
    updatedProps.data = { ...updatedProps.data };
    updatedProps.data.scaleX = updatedProps.data.scaleX * (1 / scaleX);
    updatedProps.data.scaleY = updatedProps.data.scaleY * (1 / scaleY);
    return updatedProps;
  }
  return shapeProps;
};
