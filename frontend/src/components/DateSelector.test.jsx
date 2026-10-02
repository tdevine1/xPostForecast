import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import DateSelector, { FIRST_YEAR, LAST_YEAR } from './DateSelector';

afterEach(cleanup);

describe('DateSelector', () => {
  it('offers every year the dataset covers', () => {
    render(<DateSelector onDateChange={() => {}} fetchTemperatureData={() => {}} />);
    const years = screen.getByLabelText(/year/i).querySelectorAll('option:not([disabled])');
    expect(years).toHaveLength(LAST_YEAR - FIRST_YEAR + 1);
  });

  it('reports YYYY-MM-01 once both month and year are chosen', () => {
    const onDateChange = vi.fn();
    render(<DateSelector onDateChange={onDateChange} fetchTemperatureData={() => {}} />);

    fireEvent.change(screen.getByLabelText(/month/i), { target: { value: '07' } });
    expect(onDateChange).not.toHaveBeenCalled(); // year not chosen yet

    fireEvent.change(screen.getByLabelText(/year/i), { target: { value: '2020' } });
    expect(onDateChange).toHaveBeenLastCalledWith('2020-07-01');
  });

  it('calls fetchTemperatureData when "Fetch Data" is clicked', () => {
    const fetchTemperatureData = vi.fn();
    render(<DateSelector onDateChange={() => {}} fetchTemperatureData={fetchTemperatureData} />);
    fireEvent.click(screen.getByRole('button', { name: /fetch data/i }));
    expect(fetchTemperatureData).toHaveBeenCalledOnce();
  });
});
