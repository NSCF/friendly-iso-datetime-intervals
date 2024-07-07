import { describe, it, expect } from 'vitest'

import getISODateRange from './index.js';

describe('getISODateRange', () => {
  it('should return a single date in ISO format', () => {
    const result = getISODateRange('2024-07-07', null, null, null, false, false);
    expect(result).toBe('2024-07-07');
  });

  it('should return a single date in ISO format with slashes', () => {
    const result = getISODateRange('2024-07-07', null, null, null, true, false);
    expect(result).toBe('2024/07/07');
  });

  it('should return a date range in ISO format', () => {
    const result = getISODateRange('2024-07-07', '2024-07-08', null, null, false, false);
    expect(result).toBe('2024-07-07/08');
  });

  it('should return a date range in ISO format with slashes and roman numeral months', () => {
    const result = getISODateRange('2024-07-07', '2024-07-08', null, null, true, true);
    expect(result).toBe('2024/vii/07-08');
  });

  it('should throw an error for an invalid start date', () => {
    expect(() => {
      getISODateRange('invalid-date', null, null, null, false, false);
    }).toThrow('invalid start date, a valid start date is required');
  });

  it('should throw an error for an invalid end date', () => {
    expect(() => {
      getISODateRange('2024-07-07', 'invalid-date', null, null, false, false);
    }).toThrow('invalid end date');
  });

  it('should return a date range with time in ISO format', () => {
    const result = getISODateRange('2024-07-07', '2024-07-08', '12:00', '14:00', false, false);
    expect(result).toBe('2024-07-07T12:00/08T14:00');
  });

  it('should throw an error if end date is before start date', () => {
    expect(() => {
      getISODateRange('2024-07-08', '2024-07-07', null, null, false, false);
    }).toThrow('end date is before start date');
  });

  it('should throw an error for partial date with time', () => {
    expect(() => {
      getISODateRange('2024-07', null, '12:00', null, false, false);
    }).toThrow('start time not valid for partial start date');
  });

  it('should throw an error for mismatched start and end date formats', () => {
    expect(() => {
      getISODateRange('2024-07-07', '2024-07', null, null, false, false);
    }).toThrow('start date and end date formats do not match');
  });

  it('should handle timezone Z correctly', () => {
    const result = getISODateRange('2024-07-07T00:00:00Z', '2024-07-08T00:00:00Z', null, null, false, false);
    expect(result).toBe('2024-07-07T00:00:00/08T00:00:00Z');
  });

  it('should handle timezone Z correctly with slashes', () => {
    const result = getISODateRange('2024-07-07T00:00:00Z', '2024-07-08T00:00:00Z', null, null, true, false);
    expect(result).toBe('2024/07/07 00:00:00-08 00:00:00');
  });
});
