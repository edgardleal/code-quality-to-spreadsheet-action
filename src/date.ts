/**
 * date.ts
 *
 * Distributed under terms of the MIT license.
 * @author Edgard Leal
 * @module date.ts
 */

export const ONE_SECOND = 1000;
/**
 * 1000 * 60
 */
export const ONE_MINUTE = ONE_SECOND * 60;
export const ONE_HOUR = ONE_MINUTE * 60;
export const ONE_DAY = ONE_HOUR * 24;

export interface ISplitedDate {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

export function splitDate(date: Date = new Date()): ISplitedDate {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const minute = date.getMinutes();
  const second = date.getSeconds();
  return {
    year,
    month,
    day,
    hour,
    minute,
    second,
  };
}

function twoDigits(value: number): string {
  const prefix = value < 10 ? '0' : '';
  return `${prefix}${value}`;
}

export function formatYMD(date: Date = new Date()): string {
  const fields = splitDate(date);
  return `${twoDigits(fields.year)}-${twoDigits(fields.month)}-${twoDigits(fields.day)}`;
}
