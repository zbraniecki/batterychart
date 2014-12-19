var inputData = {
  batteryHistory: [
  ],
  estimatedDischarge: null,
  estimatedCharge: null,
  currentLevel: null,
  charging: null,
};

var settings = {
  timeWindow: 12 * 60 * 60 * 1000,
  sampling: 10000,
};

// CODE

var templatePlotData = [
  {
    label: "Total",
    color: "#E66000",
    data: [
    ],
    xaxis: 1,
    shadowSize: 0,
  },
  {
    label: "Total (prediction)",
    color: "#4D4E53",
    data: [
    ],
    xaxis: 1,
    shadowSize: 0,
  },
];

function estimateBatteryDischarge() {
  var battery = navigator.battery;
  var newVal = battery.dischargingTime;
  inputData.estimatedDischarge = newVal;
}

function estimateBatteryCharge() {
  var battery = navigator.battery;
  var newVal = battery.chargingTime;
  inputData.estimatedCharge = newVal;
}

function getBatteryCharging() {
  var battery = navigator.battery;
  inputData.charging = battery.charging;
}

function readLevel() {
  var battery = navigator.battery;
  inputData.currentLevel = battery.level;
  var newEntry = [new Date().getTime(), inputData.currentLevel];

  var lastIndex = inputData.batteryHistory.length - 1;

  if (lastIndex !== 0 &&
      inputData.batteryHistory[lastIndex][1] == inputData.currentLevel) {
    inputData.batteryHistory[lastIndex] = newEntry;
  } else {
    inputData.batteryHistory.push(newEntry);
  }
  cache();
}

function getPlotData() {
  var plotData = $.extend(true, new Array(), templatePlotData);

  plotData[0].data = inputData.batteryHistory;

  var lastIndex = inputData.batteryHistory.length - 1;

  if (inputData.estimatedDischarge !== Infinity) {
    plotData[1].data = [
      inputData.batteryHistory[lastIndex],
      [new Date().getTime() + (inputData.estimatedDischarge * 1000), 0],
    ];
  } else if (inputData.estimatedCharge !== Infinity) {
    plotData[1].data = [
      inputData.batteryHistory[lastIndex],
      [new Date().getTime() + (inputData.estimatedCharge * 1000), 1],
    ];
  }
  return plotData;
}


var options = {
  legend: {
    show: false,
  },
  grid: {
    borderWidth: {
      top: null,
      right: null,
      left: 2,
      bottom: 2 
    },
  },
  series: {
    lines: {
      show: true,
      fill: true,
      fillColor: {
        colors: [ { opacity: 0.8 }, { opacity: 0.1 } ] 
      },
      lineWidth: 1,
    }
  },
  xaxes: [
    {
      tickLength: 6,
      tickFormatter: function(val, axis) {
        var hour = new Date(val).getHours();
        if (hour >= 12) {
          hour = (hour % 12 || 12) + ' pm';
        } else {
          hour += ' am';
        }
        return hour;
      },
      ticks: function(axis) {
        var ticks = [];
        var firstTick = new Date(axis.datamin);
        firstTick.setHours(firstTick.getHours() + 1);
        firstTick.setMinutes(0);
        for (var i = 0; i < 12; i++) {
          ticks.push(firstTick.getTime() + (i * 2 * 60 * 60 * 1000));
        }
        return ticks;
      },
      position: "bottom"
    },
  ],
  yaxis: {
    min: 0,
    max: 1,
    tickLength: 0,
    tickFormatter: function(val, axis) {
      return parseInt((val*100) + '%');
    },
  },
};

function start() {
  var battery = navigator.battery;

  readFromCache();
  readLevel();
  estimateBatteryDischarge();
  estimateBatteryCharge();
  getBatteryCharging();

  battery.addEventListener('chargingchange', function() {
    getBatteryCharging();
  });

  battery.addEventListener('levelchange', function() {
    readLevel();
  });

  battery.addEventListener('chargingtimechange', function() {
    estimateBatteryCharge();
  });

  battery.addEventListener('dischargingtimechange', function() {
    estimateBatteryDischarge();
  });

  setInterval(function() {
    readLevel();
    draw();
  }, settings.sampling);
}



function readFromCache() {
  var bh = localStorage.getItem('batteryHistory');
  if (bh) {
    inputData.batteryHistory = JSON.parse(localStorage.getItem('batteryHistory'));
  }
}

function cache() {
  localStorage.setItem('batteryHistory', JSON.stringify(inputData.batteryHistory));
}

function draw() {
  var plotData = getPlotData();


  if (inputData.estimatedDischarge !== Infinity ||
      inputData.estimatedCharge !== Infinity) {

    if (inputData.estimatedDischarge !== Infinity) {
      var endTick = (new Date().getTime() + inputData.estimatedDischarge * 1000) - inputData.batteryHistory[0][0] + (60 * 60 * 1000);
      settings.timeWindow = endTick;
    } else {
      var endTick = (new Date().getTime() + inputData.estimatedCharge * 1000) - inputData.batteryHistory[0][0] + (60 * 60 * 1000);
      settings.timeWindow = endTick;
    }
  }

  options.xaxes[0].min = plotData[0].data[0][0];
  options.xaxes[0].max = plotData[0].data[0][0] + settings.timeWindow;
  $.plot("#placeholder", plotData, options);
  updateEstimation();
}

function formatTime(time) {
  if (time > 60 * 60 * 1000) {
    var approxTime = time / 60 / 60 / 1000;
    return Math.round(approxTime) + ' hrs';
  }

  var date = new Date(time);

  var minutes = date.getMinutes();

  if (minutes < 10) {
    minutes = '0' + minutes;
  }
  return minutes + 'minutes';
}

function updateEstimation() {
  var charge = inputData.currentLevel;
  var left = null;
  if (inputData.estimatedDischarge !== Infinity) {
    left = inputData.estimatedDischarge;
  } else if (inputData.estimatedCharge !== Infinity) {
    left = inputData.estimatedCharge;
  }

  var est = document.getElementById('est');

  var msg = parseInt(charge * 100) + '%';

  if (left) {
    var hrs = left * 1000;
    msg += ' - approx. ' + formatTime(hrs);
    if (inputData.charging) {
      msg += ' until full';
    } else {
      msg += ' left';
    }
  } else {
    if (inputData.charging) {
      msg += ' - charging';
    }
  } 
  est.textContent =  msg; 
}


document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('clear').addEventListener('click', function() {
    inputData.batteryHistory = [];
    localStorage.removeItem('batteryHistory');
    var battery = navigator.battery;
    inputData.batteryHistory.push([new Date().getTime(), battery.level]);
    draw();
  });
  start();
  draw();
});
