import { HexColor } from "../../../core/types";

const ColorBox = ({ color }: { color?: HexColor }) => (
  <div
    role="img"
    aria-label={`Color swatch ${color}`}
    title={color}
    style={{
      width: 24,
      height: 24,
      borderRadius: 8,
      background: color,
      border: "1px solid rgba(255, 255, 255, 1)",
      boxShadow: "0 1px 2px rgba(0,0,0,0.12)",
    }}
  />
);

export { ColorBox };
