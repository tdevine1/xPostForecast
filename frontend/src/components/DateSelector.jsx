/**
 * DateSelector.jsx
 *
 * Month and year dropdowns plus a "Fetch Data" button.
 * Dropdowns limit input to valid choices, so no free-text date parsing is needed.
 */

import { useState } from 'react';

/**
 * Years available in NOAA nClimGrid monthly data on Microsoft Planetary Computer.
 * The collection starts in January 1895; the Planetary Computer copy currently
 * ends in September 2022, so Oct-Dec 2022 return "no data".
 */
export const FIRST_YEAR = 1895;
export const LAST_YEAR = 2022;

/**
 * DateSelector component for selecting a month and year.
 *
 * @component
 * @param {Function} onDateChange - Called with a 'YYYY-MM-01' string once both month and year are chosen.
 * @param {Function} fetchTemperatureData - Called when the user clicks "Fetch Data".
 * @returns {JSX.Element} Month and year dropdowns and a fetch button.
 */
function DateSelector({ onDateChange, fetchTemperatureData }) {
  const [month, setMonth] = useState('');
  const [year, setYear] = useState('');

  // Report the date as 'YYYY-MM-01' (the backend only uses year and month).
  const handleMonthChange = (e) => {
    setMonth(e.target.value);
    if (year) onDateChange(`${year}-${e.target.value}-01`);
  };

  const handleYearChange = (e) => {
    setYear(e.target.value);
    if (month) onDateChange(`${e.target.value}-${month}-01`);
  };

  return (
    <div>
      <label>
        Month:{' '}
        <select value={month} onChange={handleMonthChange}>
          <option value="" disabled>Select month</option>
          {Array.from({ length: 12 }, (_, i) => (
            <option key={i + 1} value={String(i + 1).padStart(2, '0')}>
              {new Date(2000, i).toLocaleString('en', { month: 'long' })}
            </option>
          ))}
        </select>
      </label>{' '}

      <label>
        Year:{' '}
        <select value={year} onChange={handleYearChange}>
          <option value="" disabled>Select year</option>
          {Array.from({ length: LAST_YEAR - FIRST_YEAR + 1 }, (_, i) => LAST_YEAR - i).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </label>{' '}

      <button type="button" onClick={fetchTemperatureData}>Fetch Data</button>
    </div>
  );
}

export default DateSelector;
