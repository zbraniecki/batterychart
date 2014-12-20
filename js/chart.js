(function(window) {

function BatteryChart(data) {
  this.svg = null;
  this.height = 250;
  this.width = 450;
  this.margin = {top: 20, right: 20, bottom: 30, left: 60};
  this.data = data;

  this.x = d3.time.scale()
    .range([0, this.width]);

  this.y = d3.scale.linear()
    .range([this.height, 0]);

  this.xAxis = d3.svg.axis()
    .scale(this.x)
    .orient("bottom");

  this.yAxis = d3.svg.axis()
    .scale(this.y)
    .tickFormat(d3.format('%'))
    .orient("left");

  this.line = d3.svg.line()
    .x(d => this.x(d[0]))
    .y(d => this.y(d[1]));

  this.area = d3.svg.area()
    .x(d => this.x(d[0]))
    .y0(this.height)
    .y1(d => this.y(d[1]));

  var min = d3.min(this.data.levelHistory, function(d) { return d[0]; });
  var max = d3.max(this.data.levelHistory, function(d) { return d[0]; });

  this.slice = {
    start: min + (2 * 60 * 60 * 1000),
    end: min + (8 * 60 * 60 * 1000),
  };

  document.getElementById('b').addEventListener('click', function() {
    this.slice = {
      start: min + (4 * 60 * 60 * 1000),
      end: min + (10 * 60 * 60 * 1000),
    };
    drawAxis.call(this);
    drawArea.call(this, this.data.levelHistory);
  }.bind(this));
}

BatteryChart.prototype.draw = function() {

  var height = this.height + (this.data.usage.length * 20);

  var zoom = d3.behavior.drag()
    .on("drag", function(e, i) {
      var dx = (d3.event.dx/500 * 6 * 60 * 60 * 1000);
      this.slice.start += dx;
      this.slice.end += dx;
    drawAxis.call(this);
    drawArea.call(this, this.data.levelHistory);
    }.bind(this));

  this.svg = d3.select("body").append("svg")
    .attr("width", this.width + this.margin.left + this.margin.right)
    .attr("height", height + this.margin.top + this.margin.bottom)
    .append("g")
    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")
    .call(zoom);

  this.x.domain([this.slice.start, this.slice.end]);
  this.svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + this.height + ")")
    .call(this.xAxis);

  this.svg.append("g")
    .attr("class", "y axis")
    .call(this.yAxis);

  drawLevel.call(this);
  //drawEstimation.call(this);
  //drawUsageBars.call(this);
}

function drawLevel() {
  var data = getDataChunk.call(this, this.data.levelHistory);

  this.svg.append("path")
    .datum(data)
    .attr("class", 'area ' + 'levelLine')
    .attr("d", this.area)

  this.svg.append("path")
    .datum(data)
    .attr("class", 'line ' + 'levelLine')
    .attr("d", this.line);
}

function drawEstimation() {
  var estimationDatum = [this.data.levelHistory[this.data.levelHistory.length - 1]];

  estimationDatum.push([new Date().getTime() + this.data.estimations.discharge,0]);

  drawArea.call(this, estimationDatum, 'estimationLine');
}

function getDataChunk(data) {
  var start = data.findIndex(function(d) {
    return d[0] >= this.slice.start;
  }, this);

  var end = data.length - 1;

  var i = start;
  while (++i < data.length) {
    if (data[i][0] > this.slice.end) {
      end = i;
      break;
    }
  }
  return data.slice(start, end);
}



function drawArea(data, name) {

  data = getDataChunk.call(this, data);

  this.svg.select("path.area.levelLine").datum(data).attr("d", this.area);
  this.svg.select("path.line.levelLine").datum(data).attr("d", this.line);
}

function drawAxis() {
  this.x.domain([this.slice.start, this.slice.end]);

  this.svg.select("g.x.axis").call(this.xAxis); 
}

function drawUsageBars() {

  this.data.usage.forEach(function(usage, i) {
    
    var x = 0;
    var y = this.height + 20 + (i * 20);
    this.svg.append('rect')
      .attr('width', this.width)
      .attr('height', 15)
      .attr('x', x)
      .attr('y', y)
      .attr('class', 'stackedbar');

    this.svg.append("text")
      .attr("x", -50)
      .attr("y", y + 8)
      .attr("dy", ".35em")
      .text(usage.label);


    var rects = this.svg.selectAll("rect.sb-" + usage.id)
      .data(usage.data)
      .enter()
      .append("rect")
      .attr('x', d => this.x(d[0]))
      .attr('y', y)
      .attr('width', d => this.x(d[1]) - this.x(d[0]))
      .attr('height', 15)
      .attr('class', 'sb-' + usage.id);

  }, this);
}

window.BatteryChart = BatteryChart;
})(this);
