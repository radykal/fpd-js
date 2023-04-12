import {
  select,
  pie,
  arc,
  rgb,
  scaleLinear,
  interpolateHslLong,
  sum
} from "d3";

import { ChartCommonUtils , CHART_TYPE, CHART_COLUMNS, prepareInitialChartData, removeEmptyObject } from "ChartCommonUtils";

export class PieChartUtils extends ChartCommonUtils {
  static keys = [CHART_COLUMNS.DATASET1];
  static chartType = CHART_TYPE.PIE_CHART;
  static chartData = prepareInitialChartData(this.chartType);
  static fontSize = '20px';

  static addChart(handleAddElement) {
    let config = {
      keys: this.keys,
      chartType: this.chartType,
      chartObjectList: this.chartData,
      colors: this.colors,
      fontSize: this.fontSize,
      scale: 1,
      scaleX: 1,
      scaleY: 1
    }

    let svg = this.createChart(config);
    setTimeout(() => {
      this.addChartToCanvas(svg, config, handleAddElement);
    }, 0)
  }


  static createChart(config) {
    const chartData = config.chartObjectList;
    const colors = config.colors || this.colors;
    const { bold, italic } = config;

    const svg = this.createSvgPlaceHolder(300, 300);
    const height = +svg.attr("height");
    const width = +svg.attr("width");
    const isDonutChart = config.chartType === CHART_TYPE.DONUT_CHART;
    const innerRadius = isDonutChart ? 50 : 0;

    const filteredChartData = removeEmptyObject(chartData);
    const computedData = pie().value(d => d[CHART_COLUMNS.DATASET1])(filteredChartData);

    let customColors = scaleLinear().domain([0, filteredChartData.length])
      .interpolate(interpolateHslLong)
      .range([rgb(colors[CHART_COLUMNS.DATASET1]), rgb('#FFF500')]);

    const segments = arc().innerRadius(innerRadius).outerRadius(width / 2 - 50);

    const container = svg.append("g")
      .attr('class', 'container')
    const chartContainer = container.append('g')
      .attr('class', 'chart-container');

    const sections = chartContainer
      .selectAll("path").data(computedData);

    sections.enter().append("path").attr("d", segments)
      .attr("fill", (d, i) => {
        return customColors(i);
      });

    const content = select('g').selectAll('text').data(computedData);

    let total = sum(filteredChartData, d => {
      return d[CHART_COLUMNS.DATASET1];
    })
    console.log(total);

    let textElements = content.enter()
      .append('g')
      .attr('class', 'text-container')
      .append('text');

    let calculatedFontSize = this.calculateFontSize(config);

    textElements.attr("dy", ".50em")
      .attr('font-weight', bold ? 'bold' : 'normal')
      .attr('font-style', italic ? 'italic' : 'normal')
      .attr('font-size', calculatedFontSize)
      .attr('fill', colors[CHART_COLUMNS.LABEL])
      .style("text-anchor", "middle");

    textElements.append('tspan').text(d => {
      return d.data.LABEL;
    })
    textElements
      .append('tspan').text(d => {
        return (parseInt((d.data[CHART_COLUMNS.DATASET1] * 100) / total)) + '%';
      })
      .attr('x', '0')
      .attr('y', function (d) {
        return this.getBBox().height + 7;
      });

    textElements
      .attr('transform', function (d) {
        var _d = segments.centroid(d);
        _d[0] *= isDonutChart ? 1.6 : 2.3;
        _d[1] *= isDonutChart ? 1.6 : 2.3;
        return "translate(" + _d + ")";
      })

    container.selectAll('.text-container')
      .each(function (d) {
        getTransformValue(d, chartContainer, this, segments);
      })

    removeOverlapText(container);

    let containerClientRect = container.node().getBoundingClientRect();

    let maxValue = containerClientRect.width > containerClientRect.height ? containerClientRect.width : containerClientRect.height;
    svg.attr('width', maxValue);
    svg.attr('height', maxValue);

    let svgBBox = svg.node().getBBox();
    container.attr('transform', `translate(${-svgBBox.x}, ${-svgBBox.y})`)

    return svg;
  }
}

function getTransformValue(d, chartContainer, textObj, segments) {
  let chartContainerClientRect = chartContainer.node().getBoundingClientRect();
  let textContainerClientRect = textObj.getBoundingClientRect();
  let transformX = 0;
  let transformY = 0;

  var deg = (d.startAngle + d.endAngle) * 90 / Math.PI % 360;

  if (textContainerClientRect.top < chartContainerClientRect.top) {
    transformY = chartContainerClientRect.top - textContainerClientRect.bottom;
  } else if (textContainerClientRect.top > chartContainerClientRect.bottom) {
    transformY = chartContainerClientRect.bottom - textContainerClientRect.top;
  } else if (textContainerClientRect.left < chartContainerClientRect.left && deg >= 180) {
    transformX = chartContainerClientRect.left - textContainerClientRect.right;
  } else if (textContainerClientRect.left > chartContainerClientRect.left && deg <= 180) {
    transformX = chartContainerClientRect.right - textContainerClientRect.left;
  }

  textObj.setAttribute('transform', `translate(${transformX}, ${transformY})`);
}

function removeOverlapText(container) {
  let textContainers = container.selectAll('.text-container');
  var prev;
  var prevD;
  textContainers.each(function (d, prevI) {
    prev = this;
    prevD = d;
    textContainers.each(function (d, i) {
      if (i !== prevI) {
        checkAndRemove(prev, prevD, d, this);
      }
    });
  });
}

function checkAndRemove(prev, prevD, d, vm) {
  var thisbb = vm.getBoundingClientRect(),
    prevbb = prev.getBoundingClientRect();
  // move if they overlap
  if (!(thisbb.right < prevbb.left ||
    thisbb.left > prevbb.right ||
    thisbb.bottom < prevbb.top ||
    thisbb.top > prevbb.bottom)) {

    if ((d.endAngle - d.startAngle) < (prevD.endAngle - prevD.startAngle)) {
      console.log('remove this')
      vm.remove();
      return;
    } else {
      console.log('remove prev')
      select(prev).remove();
      return;
    }
  }
}
