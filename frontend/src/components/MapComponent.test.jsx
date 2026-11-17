/**
 * Tests for the map's own logic: one marker per point, a colour that follows the temperature,
 * and a popup with the details. Leaflet itself needs a real browser,
 * so react-leaflet is replaced with simple stand-ins that show the props they receive.
 */
import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import MapComponent from './MapComponent';

vi.mock('leaflet/dist/leaflet.css', () => ({}));
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, center, zoom }) => (
    <div data-testid="map" data-center={center.join(',')} data-zoom={zoom}>{children}</div>
  ),
  TileLayer: ({ url }) => <div data-testid="tiles" data-url={url} />,
  CircleMarker: ({ children, color, center }) => (
    <div data-testid="marker" data-color={color} data-center={center.join(',')}>{children}</div>
  ),
  Popup: ({ children }) => <div>{children}</div>,
}));

afterEach(cleanup);

describe('MapComponent', () => {
  it('shows just the map when there are no points', () => {
    render(<MapComponent />);

    expect(screen.getByTestId('map').getAttribute('data-center')).toBe('38.5976,-80.4549');
    expect(screen.queryAllByTestId('marker')).toHaveLength(0);
  });

  it('draws one marker per point, coloured from cold blue to hot red', () => {
    render(
      <MapComponent
        temperatures={[
          { lat: 38.1, lon: -80.1, tavg: -10 },
          { lat: 38.2, lon: -80.2, tavg: 110 },
        ]}
      />,
    );

    const markers = screen.getAllByTestId('marker');
    expect(markers).toHaveLength(2);
    expect(markers[0].getAttribute('data-color')).toBe('#002366'); // coldest
    expect(markers[1].getAttribute('data-color')).toBe('#b22222'); // hottest
  });

  it('gives each marker a popup with its latitude, longitude, and temperature', () => {
    render(<MapComponent temperatures={[{ lat: 38.93751, lon: -80.22921, tavg: 54.123 }]} />);

    expect(screen.getByText('38.9375')).toBeTruthy();
    expect(screen.getByText('-80.2292')).toBeTruthy();
    expect(screen.getByText(/54\.12 °F/)).toBeTruthy();
  });
});
