var usage = {
  cellular: [
    [10, 11],
    [13, 14],
    [19, 22],
    [25, 26],
    [30, 32],
    [53, 58],
    [111, 150],
    [210, 240],
    [310, 311],
    [313, 314],
    [319, 322],
    [325, 326],
    [330, 332],
    [353, 358],
    [370, 390],
    [420, 450],
    [490, null],
  ],
  wifi: [
    [10, 11],
    [13, 14],
    [19, 22],
    [25, 26],
    [30, 32],
    [53, 58],
    [111, 150],
    [210, 240],
    [310, 311],
    [313, 314],
    [319, 322],
    [325, 326],
    [330, 332],
    [353, 358],
    [370, 390],
    [420, 450],
    [490, null],
  ],
};

function drawBar() {
    var start = inputData.batteryHistory[0][0];
    var length = settings.timeWindow;
    var curPer = parseInt((new Date().getTime() - start) / length * 100) * 10;

    for (var key in usage) {
      var canvas = document.getElementById('canvasbar-' + key);
      if (canvas.getContext) {
        var ctx = canvas.getContext('2d');

        ctx.clearRect(0,0,100,20);
        ctx.fillStyle = "orange";

        usage[key].forEach(function(range) {
          var valStart = range[0];
          var valEnd = range[1] ? range[1] : curPer;
          ctx.fillRect(valStart, 0, valEnd - valStart, 1);
        });
    }
  }
}

document.addEventListener('DOMContentLoaded', function() {
  drawBar();
});
