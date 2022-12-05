import {
  scaleBand,
  scaleLinear,
  max,
  stack,
  scaleOrdinal,
  axisBottom,
  axisLeft,
  line
} from "d3";

import { ChartCommonUtils , CHART_TYPE, CHART_COLUMNS, prepareInitialChartData, removeEmptyObject } from "ChartCommonUtils";

export class LineChartUtils extends ChartCommonUtils {
  static keys = Object.values(CHART_COLUMNS).filter(key => key !== CHART_COLUMNS.LABEL);
  static chartType = CHART_TYPE.LINE_CHART
  static chartData = prepareInitialChartData();
  static fontSize = '10px';

  static addChart(handleAddElement, chartType) {
    let config = {
      keys: this.keys,
      chartType: this.chartType,
      chartObjectList: this.chartData,
      colors: this.colors,
      fontSize: this.fontSize,
      scale: 1,
      scaleX: 1,
      scaleY: 1
    };

    let svg = this.createChart(config);
    setTimeout(() => {
      this.addChartToCanvas(svg, config, handleAddElement, chartType);
    }, 0)
  }

  static createChart = (data) => {
    const chartData = data.chartObjectList;
    const colors = data.colors || this.colors;
    const { bold, italic } = data;

    const svg = this.createSvgPlaceHolder(300 / data.scaleX, 300 / data.scaleY);

    const margin = { top: 15, bottom: 15, right: 15, left: 15 };
    const height = +svg.attr("height");
    const width = +svg.attr("width");
    //const innerHeight = height - margin.top - margin.bottom;
    //const innerWidth = width - margin.left - margin.right;

    const filteredChartData = removeEmptyObject(chartData);

    const dataset = stack().keys(data.keys);
    const computedData = dataset(filteredChartData);
    const maxValue = max(computedData, d => max(d, d => d[1] - d[0]));

    const xScale = scaleBand()
      .domain(chartData.map(d => d.LABEL))
      .range([0, width]);

    const yScale = scaleLinear()
      .domain([maxValue, 0])
      .range([0, height]);

    const zScale = scaleOrdinal()
      .domain(data.keys)
      .range(Object.values(colors));

    let graphG = svg.append("g").attr("transform", `translate(${margin.left},5)`);

    let xAxisG = graphG
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(axisBottom(xScale));

    let calculatedFontSize = this.calculateFontSize(data);

    xAxisG
      .selectAll(".tick text")
      .attr('font-weight', bold ? 'bold' : 'normal')
      .attr('font-style', italic ? 'italic' : 'normal')
      .attr('font-size', calculatedFontSize)
      .attr('fill', colors[CHART_COLUMNS.LABEL]);

    xAxisG
      .selectAll(".domain, .tick line")
      .remove();

    const yAxis = axisLeft(yScale).tickSize(-width);

    let yAxisG = graphG
      .append("g")
      .call(yAxis);
    yAxisG
      .selectAll(".tick text")
      .attr('font-weight', bold ? 'bold' : 'normal')
      .attr('font-style', italic ? 'italic' : 'normal')
      .attr('font-size', calculatedFontSize)
      .attr('fill', colors[CHART_COLUMNS.LABEL]);

    yAxisG
      .selectAll(".domain")
      .remove();

    this.applyTickColor(yAxisG);

    var lineObj = line()
      .x(d => xScale(d.data.LABEL))
      .y(d => yScale(d[1] - d[0]));

    let lines = graphG.append('g')
      .attr('class', 'lines')
      .attr("transform", `translate(${margin.left}, 0)`);

    let modifyComputedData = getModifyComputedData(computedData);

    lines.selectAll('.line-group')
      .data(modifyComputedData).enter()
      .append('g')
      .attr('class', 'line-group')
      .append('path')
      .attr('class', 'line')
      .attr('fill', 'none')
      .attr('d', (d, index) => lineObj(d))
      .attr('stroke-width', '2')
      .style('stroke', (d, i) => zScale(computedData[i].key));

    var circleRadius = 3;
    var circleOpacity = '0.85';

    lines.selectAll("circle-group")
      .data(modifyComputedData).enter()
      .append("g")
      .style("fill", (d, i) => zScale(computedData[i].key))
      .selectAll("circle")
      .data((d, index) => modifyComputedData[index])
      .enter()
      .append("g")
      .attr("class", "circle")
      .append("circle")
      .attr("cx", d => xScale(d.data.LABEL))
      .attr("cy", d => yScale(d[1] - d[0]))
      .attr("r", circleRadius)
      .style('opacity', circleOpacity)

    this.modifyXAxis(svg, xAxisG, xScale.bandwidth(), height, margin, parseFloat(calculatedFontSize));
    this.modifyYAxis(svg, yAxisG, graphG, width, xAxisG, margin);

    return svg;
  }
  static modifyXAxis = (svg, xAxisG, barWidth, height, margin, fontSize) => {
    const xTextNodes = xAxisG.selectAll('text').nodes();
    let maxWidthOfText = max(xTextNodes, (node) => node.getBoundingClientRect().width);

    if (maxWidthOfText > barWidth) {
      xAxisG.selectAll(".tick text")
        .attr('transform', `rotate(-45)`)
        .style("text-anchor", "end");

      xTextNodes.forEach((text, i) => {
        if (i % 2 === 0 && fontSize > barWidth) {
          text.remove();
        }
      })
    }
    let maxHeightOfText = max(xTextNodes, (node) => node.getBoundingClientRect().height);
    svg.attr('height', height + maxHeightOfText + margin.bottom + margin.top);

  }

  static modifyYAxis = (svg, yAxisG, graphG, width, xAxisG, margin) => {
    const yTextNodes = yAxisG.selectAll('text').nodes();
    let maxWidthOfText = max(yTextNodes, (node) => node.getBoundingClientRect().width);

    let overflowWidth = yAxisG.node().getBoundingClientRect().x - xAxisG.node().getBoundingClientRect().x;
    let translateX = maxWidthOfText + margin.left;

    if (overflowWidth > 0) {
      translateX = translateX + overflowWidth;
    }
    graphG.attr("transform", `translate(${translateX},${margin.top})`);
    svg.attr('width', width + translateX);

  }
}

const getModifyComputedData = (computedData) => {
  let modifiedData = computedData.map(c => {
    let copyData = [...c];
    delete copyData.key;
    delete copyData.index;
    return copyData;
  });

  modifiedData = computedData.filter(data => {
    let hasData = false;
    data.forEach(d => {
      hasData = hasData || !!d.data[data.key];
    })
    return hasData;
  });

  return modifiedData;
};
