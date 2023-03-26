export const yin = (data: number[], sampleRate: number) => {
  var DEFAULT_THRESHOLD = 0.07;

  function difference(data: number[]) {
    var n = data.length;
    var results = new Array<number>(n);
    var difference;
    var summation;
    for (
      var tau = 0, windowSize = Math.floor(n * 0.5);
      tau <= windowSize;
      tau++
    ) {
      summation = 0;
      for (var j = 0; j < windowSize; j++) {
        difference = data[j] - data[j + tau];
        summation += difference * difference;
      }
      results[tau] = summation;
    }
    return results;
  }

  function cumulativeMeanNormalizedDifference(data: number[]) {
    var n = data.length;
    var results = new Array<number>(n);
    var summation;

    for (var tau = 0; tau < n; tau++) {
      summation = 0;
      for (var j = 0; j <= tau; j++) {
        summation += data[j];
      }
      results[tau] = data[tau] / (summation / tau);
    }
    return results;
  }

  function absoluteThreshold(data: number[], threshold: number) {
    var x;
    var k = Number.POSITIVE_INFINITY;
    var tau = -1;

    for (var i = 0, n = data.length; i < n; i++) {
      x = data[i];
      if (x < threshold) {
        return i;
      }
      if (x < k) {
        k = x;
        tau = i;
      }
    }
    return tau;
  }

  function bestLocalEstimate(data: number[], tau: number) {
    var i = tau + 1;
    var n = data.length;
    var k = data[tau];
    while (i < n && data[i] < k) {
      k = data[i];
      i++;
    }
    return i - 1;
  }

  /**
   * Estimates fundamental frequency of an audio signal given its time-domain data
   *
   * @param {Float32Array} data The time-domain data for the audio signal
   * @param {Number} sampleRate The sample rate
   * @param {Number} [threshold = 0.07] The threshold
   * @returns {Number} frequency
   */

  var threshold = DEFAULT_THRESHOLD;
  var results = cumulativeMeanNormalizedDifference(difference(data));
  var tau = absoluteThreshold(results, threshold);
  console.log(
    "yin value ",
    (sampleRate / bestLocalEstimate(results, tau)).toFixed(2)
  );
  return (sampleRate / bestLocalEstimate(results, tau)).toFixed(2);
};

export default yin;
