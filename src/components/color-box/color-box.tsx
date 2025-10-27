import { FunctionComponent } from "react";
import { randomHexColor } from "../../lib/random-hex-color";
import { HexColor } from "../../types";

const ColorSwatch = ({
  color,
  size = 32,
  rounded = 8,
}: {
  color?: HexColor;
  size?: number;
  rounded?: number;
}) => {
  return (
    <div
      role="img"
      aria-label={`Color swatch ${color}`}
      title={color}
      style={{
        width: size,
        height: size,
        borderRadius: rounded,
        background: color,
        border: "1px solid rgba(255, 255, 255, 1)",
        boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
      }}
    />
  );
}

interface ColorBoxProps {
  color?: HexColor;
}
const ColorBox: FunctionComponent<ColorBoxProps> = ({ color }) => {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <ColorSwatch color={color} size={24} />
    </div>
  );
}

export { ColorBox, randomHexColor };
