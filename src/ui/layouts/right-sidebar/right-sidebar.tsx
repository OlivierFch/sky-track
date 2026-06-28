import { useMemo } from "react";
import { twoline2satrec } from "satellite.js";
import { ISatellite } from "../../../core/types";
import { useSatellitePosition } from "../../../domains/satellites/hooks/use-satellite-position";
import { SCIENTIFIC_COLOR, STARLINK_COLOR, COMMS_COLOR } from "../../../domains/satellites/hooks/use-satellites";
import { ColorBox } from "../../components/color-box/color-box";

const LEGEND = [
  { color: SCIENTIFIC_COLOR, label: "Scientific" },
  { color: STARLINK_COLOR, label: "Starlink" },
  { color: COMMS_COLOR, label: "Communications" },
];

const formatLat = (lat: number) => `${Math.abs(lat).toFixed(4)}° ${lat >= 0 ? "N" : "S"}`;
const formatLon = (lon: number) => `${Math.abs(lon).toFixed(4)}° ${lon >= 0 ? "E" : "W"}`;

const SatelliteDetails = ({ satellite }: { satellite: ISatellite }) => {
  const pos = useSatellitePosition(satellite.tle);

  const orbital = useMemo(() => {
    const satrec = twoline2satrec(satellite.tle.line1, satellite.tle.line2);
    const periodMin = (2 * Math.PI / satrec.no) * 60;
    return {
      noradId: satrec.satnum,
      inclinationDeg: (satrec.inclo * 180 / Math.PI).toFixed(2),
      eccentricity: satrec.ecco.toFixed(7),
      periodMin: periodMin.toFixed(1),
    };
  }, [satellite.tle]);

  return (
    <div className="card">
      <div className="satellite-detail-header">
        <ColorBox color={satellite.color} />
        <h2>{satellite.name ?? satellite.id}</h2>
      </div>

      {pos ? (
        <dl className="satellite-detail-data">
          <dt>Latitude</dt>
          <dd>{formatLat(pos.lat)}</dd>
          <dt>Longitude</dt>
          <dd>{formatLon(pos.lon)}</dd>
          <dt>Altitude</dt>
          <dd>{pos.alt.toFixed(1)} km</dd>
          <dt>Speed</dt>
          <dd>{pos.velocityKms.toFixed(2)} km/s</dd>
          <dt>Period</dt>
          <dd>{orbital.periodMin} min</dd>
          <dt>Inclination</dt>
          <dd>{orbital.inclinationDeg}°</dd>
          <dt>Eccentricity</dt>
          <dd>{orbital.eccentricity}</dd>
          <dt>NORAD ID</dt>
          <dd>{orbital.noradId}</dd>
        </dl>
      ) : (
        <p className="detail-placeholder">Computing position…</p>
      )}
    </div>
  );
};

interface RightSidebarProps {
  satellites: ISatellite[];
  selectedSatelliteId: string | null;
}

const RightSidebar = ({ satellites, selectedSatelliteId }: RightSidebarProps) => {
  const selected = satellites.find(s => s.id === selectedSatelliteId) ?? null;

  return (
    <div className="sidebar right">
      {selected ? (
        <SatelliteDetails satellite={selected} />
      ) : (
        <p className="detail-placeholder">Select a satellite to view details</p>
      )}

      <div className="color-legend">
        {LEGEND.map(({ color, label }) => (
          <div key={label} className="color-legend-item">
            <ColorBox color={color} />
            <span>{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export { RightSidebar };
