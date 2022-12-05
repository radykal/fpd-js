import {
  scaleBand,
  scaleLinear,
  max,
  stack,
  scaleOrdinal,
  axisBottom,
  axisLeft
} from "d3";

import "../chart.scss";

import { removeEmptyObject, prepareInitialChartData, CHART_COLUMNS ,ChartCommonUtils, CHART_TYPE} from "../ChartDataUtils";

export class StackBarChartHorizontalUtils extends ChartCommonUtils {
  static keys = Object.values(CHART_COLUMNS).filter(key => key !== CHART_COLUMNS.LABEL);
  static chartType = CHART_TYPE.HORIZONTAL_BAR_CHART
  static chartData = prepareInitialChartData();
  static fontSize = '10px';

  static getShapeElement() {
    return rowChart;
  }

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
    const maxValue = max(computedData, d => max(d, d => d[1]));

    const yScale = scaleBand()
      .domain(filteredChartData.map(d => d[CHART_COLUMNS.LABEL]))
      .range([0, height])
      .padding(0.2);

    const xScale = scaleLinear()
      .domain([0, maxValue])
      .range([0, width]);

    const zScale = scaleOrdinal()
      .domain(data.keys)
      .range(Object.values(colors));

    let graphG = svg.append("g");
    const xAxis = axisBottom(xScale).tickSize(-height);
    let xAxisG = graphG
      .append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(xAxis);
    let calculatedFontSize = this.calculateFontSize(data);

    xAxisG
      .selectAll(".tick text")
      .attr('font-weight', bold ? 'bold' : 'normal')
      .attr('font-style', italic ? 'italic' : 'normal')
      .attr('font-size', calculatedFontSize)
      .attr('fill', colors[CHART_COLUMNS.LABEL]);

    xAxisG
      .selectAll(".domain")
      .remove();

    this.applyTickColor(xAxisG);

    const yAxis = axisLeft(yScale);

    let yAxisG = graphG
      .append("g")
      .attr("transform", `translate(0, 0)`)
      .call(yAxis);
    yAxisG
      .selectAll(".tick text")
      .attr('font-weight', bold ? 'bold' : 'normal')
      .attr('font-style', italic ? 'italic' : 'normal')
      .attr('font-size', calculatedFontSize)
      .attr('fill', colors[CHART_COLUMNS.LABEL]);
    yAxisG
      .selectAll(".domain, .tick line")
      .remove();

    graphG
      .selectAll(".bar")
      .data(computedData)
      .enter()
      .append("g")
      .attr("class", "bar")
      .attr("fill", d => zScale(d.key))
      .selectAll("rect")
      .data(d => d)
      .enter()
      .append("rect")
      .attr("x", d => { return xScale(d[0]) })
      .attr("y", d => yScale(d.data[CHART_COLUMNS.LABEL]))
      .attr("height", d => yScale.bandwidth())
      .attr("width", d => xScale(d[1]) - xScale(d[0]));

    this.modifyXAxis(svg, xAxisG, height, margin);
    this.modifyYAxis(svg, yAxisG, graphG, width, xAxisG, margin, yScale.bandwidth(), parseFloat(calculatedFontSize));
    return svg;
  };

  static modifyXAxis = (svg, xAxisG, height, margin) => {
    const xTextNodes = xAxisG.selectAll('text').nodes();
    let maxHeightOfText = max(xTextNodes, (node) => node.getBoundingClientRect().height);
    svg.attr('height', height + maxHeightOfText + margin.bottom + margin.top);
  }

  static modifyYAxis = (svg, yAxisG, graphG, width, xAxisG, margin, barHeight, fontSize) => {
    const yTextNodes = yAxisG.selectAll('text').nodes();
    let maxWidthOfText = max(yTextNodes, (node) => node.getBoundingClientRect().width);

    yTextNodes.forEach((text, i) => {
      if (i % 2 === 0 && fontSize > barHeight) {
        text.remove();
      }
    })

    let overflowWidth = yAxisG.node().getBoundingClientRect().x - xAxisG.node().getBoundingClientRect().x;
    let translateX = maxWidthOfText + margin.left;

    if (overflowWidth > 0) {
      translateX = translateX + overflowWidth;
    }
    graphG.attr("transform", `translate(${translateX},${margin.top})`);
    svg.attr('width', width + translateX + margin.left);

  }
}
