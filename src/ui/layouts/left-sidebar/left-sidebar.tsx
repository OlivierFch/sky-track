import { FunctionComponent } from "react";
import { ISatellite } from "../../../core/types";
import { ColorBox } from "../../components/color-box/color-box";

interface LeftSidebarProps {
  satellites: ISatellite[];
  onSelect: (id: string) => void;
  onToggleVisibility: () => void;
  isGlobeVisible: boolean;
  showTrails: boolean;
  onToggleTrails: () => void;
  onFocusSun: () => void;
  onFocusEarth: () => void;
  selectedSatelliteId: string | null;
  starlinkNetworkMode: boolean;
  onToggleStarlinkNetwork: () => void;
}

const LeftSidebar: FunctionComponent<LeftSidebarProps> = ({
  satellites,
  onSelect,
  onToggleVisibility,
  isGlobeVisible,
  showTrails,
  onToggleTrails,
  onFocusSun,
  onFocusEarth,
  selectedSatelliteId,
  starlinkNetworkMode,
  onToggleStarlinkNetwork,
}) => (
  <div className="sidebar left">
    <h1>SkyTrack</h1>

    <div className="card">
      <h2>Globe View</h2>
      <button
        className={`globe-toggle${isGlobeVisible ? " active" : ""}`}
        onClick={onToggleVisibility}
      >
        <span className="globe-toggle-dot" />
        {isGlobeVisible ? "Earth visible" : "Earth hidden"}
      </button>
      <button
        className={`globe-toggle${showTrails ? " active" : ""}`}
        onClick={onToggleTrails}
      >
        <span className="globe-toggle-dot" />
        {showTrails ? "Visible trajectories" : "Hidden trajectories"}
      </button>
      <button
        className={`globe-toggle${starlinkNetworkMode ? " active" : ""}`}
        onClick={onToggleStarlinkNetwork}
      >
        <span className="globe-toggle-dot" style={starlinkNetworkMode ? { background: "#4488ff" } : undefined} />
        {starlinkNetworkMode ? "Starlink network ON" : "Starlink network"}
      </button>
    </div>

    <div className="card">
      <h2>Camera</h2>
      <button className="globe-toggle active" onClick={onFocusEarth}>
        <span className="globe-toggle-dot" />
        Focus on Earth
      </button>
      <button className="globe-toggle active" onClick={onFocusSun}>
        <span className="globe-toggle-dot" style={{ background: "#ffee88" }} />
        Focus on the Sun
      </button>
    </div>

    <div className="card satellites-card">
      <h2>
        Satellites
        <span className="satellite-count">{satellites.length}</span>
      </h2>
      <ul>
        {satellites.map(s => (
          <li
            key={s.id}
            onClick={() => onSelect(s.id)}
            className={`satellite-item${s.id === selectedSatelliteId ? " is-selected" : ""}`}
          >
            <ColorBox color={s.color} />
            <span>{s.name}</span>
          </li>
        ))}
      </ul>
    </div>

    <footer className="footer">
      Built with Three.js, Satellite.js and Celestrak 🚀
    </footer>
  </div>
);

export { LeftSidebar };
