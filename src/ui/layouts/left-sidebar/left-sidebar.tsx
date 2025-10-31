import { FunctionComponent } from "react";
import { ISatellite } from "../../../core/types";
import { ColorBox } from "../../components/color-box/color-box";

interface LeftSidebarProps {
    satellites: ISatellite[];
    onSelect: (id: string) => void;
    onToggleVisibility: () => void;
    isGlobeVisible: boolean;
    selectedSatelliteId: string | null;
}

const LeftSidebar: FunctionComponent<LeftSidebarProps> = ({
    satellites,
    onSelect,
    onToggleVisibility,
    isGlobeVisible,
    selectedSatelliteId
}) => {
    return (
        <div className="sidebar left">
            <h1>SkyTrack</h1>

            <div className="card">
                <h2>Satellites</h2>

                <button onClick={onToggleVisibility}>
                {isGlobeVisible ? "Hide Globe 🌍" : "Show Globe 🌎"}
                </button>

                <ul>
                {satellites.map(s => (
                    <li
                    key={s.id}
                    onClick={() => onSelect(s.id)}
                    className={s.id === selectedSatelliteId ? "is-selected" : ""}
                    >
                    {s.name} <ColorBox color={s.color} />
                    </li>
                ))}
                </ul>
            </div>

            <footer className="footer">
                Built with Three.js, Satellite.js and Celestrak 🚀
            </footer>
        </div>
    );
};

export { LeftSidebar };
