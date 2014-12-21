(function(window) {

function BatteryChart(data) {
  this.svg = null;
  this.height = 650;
  this.width = 800;
  this.margin = {top: 20, right: 20, bottom: 30, left: 100};
  this.data = data;

  this.x = d3.time.scale()
    .range([0, this.width]);

  this.y = d3.scale.linear()
    .range([this.height, 0])

  this.xAxis = d3.svg.axis()
    .scale(this.x)
    .ticks(3)
    .orient("bottom");

  this.yAxis = d3.svg.axis()
    .scale(this.y)
    .ticks(2)
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

  var now = new Date();
  now.setMinutes(0);
  now.setSeconds(0, 0);
  now = now.getTime();

  this.slice = {
    start: now - (14 * 60 * 60 * 1000),
    end: now - (2 * 60 * 60 * 1000),
  };
}

BatteryChart.prototype.draw = function() {

  var height = this.height + (this.data.usage.length * 80);

  var zoom = d3.behavior.drag()
    .on("drag", function(e, i) {
      updateChunk.call(this, d3.event.dx);
    drawAxis.call(this);
    drawArea.call(this, this.data.levelHistory);
    }.bind(this));

  this.svg = d3.select("body").append("svg")
    .attr("width", this.width + this.margin.left + this.margin.right)
    .attr("height", height + this.margin.top + this.margin.bottom)
    .call(zoom)
    .append("g")
    .attr("transform", "translate(" + this.margin.left + "," + this.margin.top + ")")

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
  drawUsageBars.call(this);
}

function updateChunk(dx) {
  var dx = (dx/450 * 12 * 60 * 60 * 1000);
  var min = d3.min(this.data.levelHistory, function(d) { return d[0]; });
  var max = d3.max(this.data.levelHistory, function(d) { return d[0]; });

  if (dx > 0) {
    if (min <= this.slice.start - dx) {
      this.slice.start -= dx;
      this.slice.end -= dx;
    } else {
      var dx = this.slice.start - min;
      this.slice.start -= dx;
      this.slice.end -= dx;
    }
  } else if (dx < 0) {
    if (max > this.slice.end - dx) {
      this.slice.start -= dx;
      this.slice.end -= dx;
    } else {
      dx = max - this.slice.end;
      this.slice.start += dx;
      this.slice.end += dx;
    }
  }
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

  var prefix = [];
  var postfix = [];
  if (data[start][0] > this.slice.start) {
    var dx0 = (data[start][0] - data[start - 1][0]); 
    var dx1 = (data[start][0] - this.slice.start) / dx0;
    var dy0 = data[start][1] - data[start - 1][1];
    var dy1 = dy0 * dx1;
    prefix.push([
      this.slice.start,
      data[start][1] - dy1
    ]);
  }

  if (data[end - 1][0] < this.slice.end &&
      end < data.length) {
    var dx0 = data[end][0] - data[end - 1][0]; 
    var dx1 = (this.slice.end - data[end - 1][0]) / dx0;
    var dy0 = data[end][1] - data[end - 1][1];
    var dy1 = dy0 * dx1;
    postfix.push([
      this.slice.end,
      data[end - 1][1] + dy1
    ]);
  }
  return prefix.concat(data.slice(start, end), postfix);
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
    var y = this.height + 30 + (i * 80);
    this.svg.append('rect')
      .attr('width', this.width)
      .attr('height', 70)
      .attr('x', x)
      .attr('y', y)
      .attr('class', 'stackedbar');

    this.svg.append("text")
      .attr("x", -95)
      .attr("y", y + 36)
      .attr("dy", ".35em")
      .attr('class', 'sb-text')
      .text(usage.label);


    var rects = this.svg.selectAll("rect.sb-" + usage.id)
      .data(usage.data)
      .enter()
      .append("rect")
      .attr('x', d => this.x(d[0]))
      .attr('y', y)
      .attr('width', d => this.x(d[1]) - this.x(d[0]))
      .attr('height', 30)
      .attr('class', 'sb-' + usage.id);

  }, this);
}

window.BatteryChart = BatteryChart;
})(this);
