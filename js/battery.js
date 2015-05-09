var now = new Date();
now.setMinutes(0);
now.setSeconds(0, 0);
now = now.getTime();

// https://developer.mozilla.org/en-US/docs/Web/API/Data_Store_API/Using_the_Data_Store_API

var batteryData = {
  levelHistory: [
/*    [now - (38 * 60 * 60 * 1000),0.4],
    [now - (37 * 60 * 60 * 1000),0.7],
    [now - (36 * 60 * 60 * 1000),0.6],
    [now - (35 * 60 * 60 * 1000),0.7],
    [now - (34 * 60 * 60 * 1000),0.4],
    [now - (33 * 60 * 60 * 1000),0.2],
    [now - (32 * 60 * 60 * 1000),0.3],
    [now - (31 * 60 * 60 * 1000),0.5],
    [now - (30 * 60 * 60 * 1000),0.8],
    [now - (29 * 60 * 60 * 1000),0.7],
    [now - (28 * 60 * 60 * 1000),0.3],
    [now - (27 * 60 * 60 * 1000),0.2],
    [now - (26 * 60 * 60 * 1000),0.1],
    [now - (25 * 60 * 60 * 1000),0.4],
    [now - (24 * 60 * 60 * 1000),0.6],
    [now - (23 * 60 * 60 * 1000),0.7],
    [now - (22 * 60 * 60 * 1000),0.7],
    [now - (21 * 60 * 60 * 1000),0.9],
    [now - (20 * 60 * 60 * 1000),1],
    [now - (19 * 60 * 60 * 1000),0.4],
    [now - (18 * 60 * 60 * 1000),0.7],
    [now - (17 * 60 * 60 * 1000),0.6],
    [now - (16 * 60 * 60 * 1000),0.7],
    [now - (15 * 60 * 60 * 1000),0.4],
    [now - (14 * 60 * 60 * 1000),0.2],
    [now - (13 * 60 * 60 * 1000),0.3],
    [now - (12 * 60 * 60 * 1000),0.5],
    [now - (11 * 60 * 60 * 1000),0.8],
    [now - (10 * 60 * 60 * 1000),0.7],
    [now - (9 * 60 * 60 * 1000),0.3],
    [now - (8 * 60 * 60 * 1000),0.2],
    [now - (7 * 60 * 60 * 1000),0.1],
    [now - (6 * 60 * 60 * 1000),0.4],
    [now - (5 * 60 * 60 * 1000),0.6],
    [now - (4 * 60 * 60 * 1000),0.7],
    [now - (3 * 60 * 60 * 1000),0.7],
    [now - (2 * 60 * 60 * 1000),0.9],
    [now - (60 * 60 * 1000),1],*/

    [now - (7 * 60 * 60 * 1000),0.5],
    [now, navigator.battery.level],
  ],
  estimations: {
    discharge: 0,
    charge: 0,
  },
  charging: false,
  usage: [
    {
      'id': 'signal',
      'label': 'Signal',
      'data': [
        //[now - (15 * 60 * 60 * 1000), now - (12 * 60 * 60 * 1000)],
        //[now - (10 * 60 * 60 * 1000), now - (9 * 60 * 60 * 1000)],
        [now - (8 * 60 * 60 * 1000), now - (6 * 60 * 60 * 1000)], 
        //[now - (5 * 60 * 60 * 1000), now - (4 * 60 * 60 * 1000)],  
        //[now - (3.5 * 60 * 60 * 1000), now - (1 * 60 * 60 * 1000)]   
      ]
    },
    /*{
      'id': 'wifi',
      'label': 'Wi-Fi',
      'data': [
        [now - (10 * 60 * 60 * 1000), now - (9 * 60 * 60 * 1000)],
        [now - (5 * 60 * 60 * 1000), now - (4 * 60 * 60 * 1000)],  
        [now - (3.5 * 60 * 60 * 1000), now - (1 * 60 * 60 * 1000)]   
      ]
    },
    {
      'id': 'screen',
      'label': 'Screen',
      'data': [
        [now - (5 * 60 * 60 * 1000), now - (4 * 60 * 60 * 1000)],  
        [now - (3.5 * 60 * 60 * 1000), now - (1 * 60 * 60 * 1000)]   
      ]
    },
    {
      'id': 'charging',
      'label': 'Charging',
      'data': [
        [now - (15 * 60 * 60 * 1000), now - (12 * 60 * 60 * 1000)],
        [now - (10 * 60 * 60 * 1000), now - (9 * 60 * 60 * 1000)],
      ]
    }*/
  ]
};

var batteryChart;
document.addEventListener('DOMContentLoaded', function() {
  batteryChart = new BatteryChart(batteryData);
  batteryData.estimations.discharge = navigator.battery.dischargingTime * 1000;
  batteryData.estimations.charge = navigator.battery.chargingTime * 1000;
  batteryData.charging = navigator.battery.charging;
  batteryChart.draw();
  init();
});

function redraw() {
  batteryChart.draw();
}

function init() {
  console.log('init');
  navigator.battery.addEventListener('dischargingtimechange', function() {
    console.log('dischargingtimechange');
    batteryData.estimations.discharge = navigator.battery.dischargingTime * 1000;
    batteryChart.draw();
  });

  navigator.battery.addEventListener('chargingtimechange', function() {
    console.log('chargingtimechange');
    batteryData.estimations.charge = navigator.battery.chargingTime * 1000;
    batteryChart.draw();
  });

  navigator.battery.addEventListener('chargingchange', function() {
    console.log('chargingchange');
    batteryData.charging = navigator.battery.charging;
    batteryChart.draw();
  });
}
