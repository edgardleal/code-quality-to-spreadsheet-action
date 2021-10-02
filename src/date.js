/*
 * date.js
 * Copyright (C) 2021 edgardleal <edgardleal@MacBook-Air-de-Edgard.local>
 *
 * Distributed under terms of the MIT license.
 */
function twoDigits(value = 0) {
  if (value >= 10) {
    return `${value}`;
  }
  return `0${value}`;
}

class CustomDate {
  dateInstance;

  constructor(value = new Date()) {
    this.dateInstance = value;
  }

  getDate() {
    return new Date(this.dateInstance);
  }

  split() {
    const day = this.dateInstance.getDate();
    const month = this.dateInstance.getMonth() + 1;
    const year = this.dateInstance.getFullYear();

    return [day, month, year];
  }

  /**
   * @return {string}
   */
  toString() {
    const parts = this.split();
    return `${parts[2]}-${twoDigits(parts[1])}-${twoDigits(parts[0])}`;
  }

  /**
   * @return {CustomDate}
   */
  static toDay() {
    const now = new Date();
    return new CustomDate(now);
  }

  /**
   * @return {CustomDate}
   */
  static startOfThiMonth(dateParameter = new Date()) {
    const date = new Date(dateParameter);
    date.setDate(1);
    return new CustomDate(date);
  }
}

module.exports = CustomDate;
