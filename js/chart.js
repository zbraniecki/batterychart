(function(window) {

function BatteryChart(data) {
  this.svg = null;
  this.height = 100;
  this.width = 250;
  this.margin = {top: 20, right: 20, bottom: 30, left: 50};
  this.data = data;

  this.stackbar = {
    height: 20,
  }

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

  calculateInitialSlice.call(this);
}

BatteryChart.prototype.buildDOM = function() {
  var height = this.height + (this.data.usage.length * (this.stackbar.height + 4));

  var zoom = d3.behavior.drag()
    .on("drag", function(e, i) {
      updateChunk.call(this, d3.event.dx);
      drawAxis.call(this);
      drawArea.call(this, this.data.levelHistory);
      drawUsageBars.call(this);
    }.bind(this));

  this.svg = d3.select("#chart").append("svg")
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

  this.data.usage.forEach(function(usage, i) {
    var x = 0;
    var y = this.height + 30 + (i * (this.stackbar.height + 4));
    this.svg.append('rect')
      .attr('width', this.width)
      .attr('height', this.stackbar.height)
      .attr('x', x)
      .attr('y', y)
      .attr('class', 'stackedbar');

    this.svg.append("text")
      .attr("x", -1 * (this.stackbar.height + 23))
      .attr("y", y + 12)
      .attr("dy", ".35em")
      .attr('class', 'sb-text')
      .text(usage.label);
  }, this);

  this.svg.append("path").attr("class", 'area levelLine');
  this.svg.append("path").attr("class", 'line levelLine');
  this.svg.append("path").attr("class", 'area estimationLine');
  this.svg.append("path").attr("class", 'line estimationLine');
}

BatteryChart.prototype.draw = function() {
  if (!this.svg) {
    this.buildDOM();
  }

  drawLevel.call(this);
  drawEstimation.call(this);
  //drawUsageBars.call(this);
}

function calculateInitialSlice() {

  var lastFullCharge = null;

  for(var i = this.data.levelHistory.length - 1; i > 0; i--) {
    if (this.data.levelHistory[i][1] === 1) {
      lastFullCharge = this.data.levelHistory[i][0];
      break;
    }
  }

  var min = d3.min(this.data.levelHistory, function(d) { return d[0]; });
  var max = d3.max(this.data.levelHistory, function(d) { return d[0]; });

  var now = new Date();
  now.setMinutes(0);
  now.setSeconds(0, 0);
  now = now.getTime();

  this.slice = {
    start: now - (7 * 60 * 60 * 1000),
    end: now + (12 * 60 * 60 * 1000),
  };

  /*if (lastFullCharge) {
    this.slice = {
      start: lastFullCharge - (10 * 60 * 60 * 1000),
      end: lastFullCharge + (15 * 60 * 60 * 1000)
    };
    console.log(this.slice);
  } else {
    var lastData = this.data.levelHistory[this.data.levelHistory.length - 1];
    this.slice = {
      start: lastData[0] - (8 * 60 * 60 * 1000),
      end: lastData[0]
    };
  }*/
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

  drawArea.call(this, data, 'levelLine');
}

function drawEstimation() {
  var estimationDatum = [this.data.levelHistory[this.data.levelHistory.length - 1]];

  if (this.data.charging) {
    if (this.data.estimations.charge !== Infinity &&
        this.data.estimations.charge !== 0) {
      estimationDatum.push([new Date().getTime() + this.data.estimations.charge,1]);
    }
  } else {
    if (this.data.estimations.discharge !== Infinity &&
        this.data.estimations.discharge !== 0) {
      estimationDatum.push([new Date().getTime() + this.data.estimations.discharge,0]);
    }
  }

  drawArea.call(this, estimationDatum, 'estimationLine');
}

function getDataChunk(data) {
  return data;
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

function getStackBarDataChunk(data) {
  var start = data.findIndex(function(d) {
    return d[0] >= this.slice.start;
  }, this);

  if (start === -1) {
    return [];
  }

  var end = data.length;

  var i = start;
  while (++i < data.length) {
    if (data[i][1] > this.slice.end) {
      end = i;
      break;
    }
  }

  if (data[start][1] > this.slice.end) {
    return [];
  }

  var prefix = [];
  var postfix = [];
  if (start > 0 && data[start - 1][1] > this.slice.start) {
    prefix.push([
      this.slice.start,
      data[start - 1][1]
    ]);
  }

  if (end < data.length && data[end][0] < this.slice.end) {
    postfix.push([
      data[end][0],
      this.slice.end
    ]);
  }
  return prefix.concat(data.slice(start, end), postfix);
}



function drawArea(data, name) {

  data = getDataChunk.call(this, data);

  this.svg.select("path.area." + name).datum(data).attr("d", this.area);
  this.svg.select("path.line." + name).datum(data).attr("d", this.line);
}

function drawAxis() {
  this.x.domain([this.slice.start, this.slice.end]);

  this.svg.select("g.x.axis").call(this.xAxis); 
}

function drawUsageBars() {

  this.data.usage.forEach(function(usage, i) {
    
    var data = getStackBarDataChunk.call(this, usage.data);

    var x = 0;
    var y = this.height + 30 + (i * (this.stackbar.height + 4));

    var rects = this.svg.selectAll("rect.sb-" + usage.id)
      .data(data)
      .attr('x', function(d) {
        return this.x(d[0]);
      }.bind(this))
      .attr('width', function(d) {
        return this.x(d[1]) - this.x(d[0])
      }.bind(this))
      .enter()
      .append("rect")
      .attr('x', function(d) {
        return this.x(d[0]);
      }.bind(this))
      .attr('width', function(d) {
        return this.x(d[1]) - this.x(d[0])
      }.bind(this))
      .attr('y', y)
      .attr('height', this.stackbar.height)
      .attr('class', ' sb-rect sb-' + usage.id);

  }, this);
}

window.BatteryChart = BatteryChart;
})(this);
