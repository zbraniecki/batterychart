(function(window) {

function BatteryChart(data) {
  this.svg = null;
  this.height = 250;
  this.width = 450;
  this.x = null;
  this.y = null;
  this.margin = {top: 20, right: 20, bottom: 30, left: 60};
  this.data = data;
}

BatteryChart.prototype.draw = function() {

  var height = this.height + (this.data.usage.length * 20);

  this.svg = d3.select("body").append("svg")
    .attr("width", this.width + this.margin.left + this.margin.right)
    .attr("height", height + this.margin.top + this.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")");

  drawAxis.call(this);
  drawLevel.call(this);
  drawEstimation.call(this);
  drawUsageBars.call(this);
}

function drawLevel() {
  drawArea.call(this, this.data.levelHistory, 'levelLine');
}

function drawEstimation() {
  var estimationDatum = [this.data.levelHistory[this.data.levelHistory.length - 1]];

  estimationDatum.push([new Date().getTime() + this.data.estimations.discharge,0]);

  drawArea.call(this, estimationDatum, 'estimationLine');
}

function drawArea(data, name) {
  var line = d3.svg.line()
    .x(d => this.x(d[0]))
    .y(d => this.y(d[1]));

  var area = d3.svg.area()
    .x(d => this.x(d[0]))
    .y0(this.height)
    .y1(d => this.y(d[1]));

  this.svg.append("path")
    .datum(data)
    .attr("class", 'area ' + name)
    .attr("d", area);

  this.svg.append("path")
    .datum(data)
    .attr("class", 'line ' + name)
    .attr("d", line);
}

function drawAxis() {
  this.x = d3.time.scale()
    .range([0, this.width]);

  this.y = d3.scale.linear()
    .range([this.height, 0]);

  var xAxis = d3.svg.axis()
    .scale(this.x)
    .orient("bottom");

  var yAxis = d3.svg.axis()
    .scale(this.y)
    .tickFormat(d3.format('%'))
    .orient("left");

  var min = d3.min(this.data.levelHistory, function(d) { return d[0]; });
  var max = d3.max(this.data.levelHistory, function(d) { return d[0]; });
  this.x.domain([min, max + (8 * 60 * 60 * 1000)]);

  this.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + this.height + ")")
    .call(xAxis);

  this.svg.append("g")
    .attr("class", "y axis")
    .call(yAxis)
}

function drawUsageBars() {

  this.data.usage.forEach(function(usage, i) {
    this.svg.append('rect')
      .attr('width', this.width)
      .attr('height', 15)
      .attr('x', 0)
      .attr('y', this.height + 20 + (i * 20))
      .attr('class', 'stackedbar');

    this.svg.append("text")
      .attr("x", -50)
      .attr("y", this.height + 28 + (i * 20))
      .attr("dy", ".35em")
      .text(usage.label);
  }, this);
}

window.BatteryChart = BatteryChart;
})(this);
