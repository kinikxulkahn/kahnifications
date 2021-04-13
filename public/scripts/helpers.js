class Helpers {

  static clamp(min, max) {
    return Math.min(Math.max(this, min), max);
  }

  /* Source: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random */
  static random(min, max) {
    return Math.random() * (max - min) + min;
  }

  static randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }
  
  static randomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1) + min);
  }

}