var now = new Date().getTime();

var batteryData = {
  levelHistory: [
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
      'label': 'Signal',
      'data': [
        [now - (30 * 60 * 1000), now]  
      ]
    },
    {
      'label': 'Wi-Fi',
      'data': [
        [now - (30 * 60 * 1000), now]  
      ]
    },
    {
      'label': 'Screen',
      'data': [
        [now - (30 * 60 * 1000), now]  
      ]
    },
    {
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
