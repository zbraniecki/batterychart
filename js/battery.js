var now = new Date().getTime();

var batteryData = {
  levelHistory: [
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
    [now - (60 * 60 * 1000),1],
    [now,0.5]
  ],
  estimations: {
    discharge: 7200000,
    charge: 3600000,
  },
  charging: false,
  usage: [
    {
      'id': 'signal',
      'label': 'Signal',
      'data': [
        [now - (30 * 60 * 1000), now]  
      ]
    },
    {
      'id': 'wifi',
      'label': 'Wi-Fi',
      'data': [
        [now - (30 * 60 * 1000), now]  
      ]
    },
    {
      'id': 'screen',
      'label': 'Screen',
      'data': [
        [now - (30 * 60 * 1000), now]  
      ]
    },
    {
      'id': 'charging',
      'label': 'Charging',
      'data': [
        [now - (30 * 60 * 1000), now]  
      ]
    }
  ]
};

document.addEventListener('DOMContentLoaded', function() {
  var batteryChart = new BatteryChart(batteryData);

  batteryChart.draw();
});
