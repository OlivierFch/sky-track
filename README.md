# 🪐 SkyTrack — Real-Time 3D Satellite & Solar System Tracker

**SkyTrack** lets you explore satellites orbiting Earth and the inner solar system in an interactive 3D environment. It combines accurate orbital data from the **Celestrak** API with real astronomical calculations, rendered with **Three.js** inside a **React** + **TypeScript** + **Vite** application.

## ✨ Features

### 🛰️ Satellite tracking
- Live satellite visualization — real orbital positions updated in real-time using SGP4/SDP4 propagation
- Orbital trails showing recent trajectory
- Dynamic glow effects — satellites pulse when idle and highlight on selection
- Camera focus — click or select a satellite to smoothly center and follow it
- Coverage footprint — ground coverage cone projected on Earth for the selected satellite
- Starlink laser mesh network — inter-satellite optical links visualized as a dynamic mesh between nearby Starlink satellites
- Sidebar satellite list with color indicators

### ☀️ Solar system visualization
- Real solar position calculated from Spencer 1971 algorithm (Julian date → ecliptic longitude → ECI)
- Sun rendered with core sphere and additive corona glow
- Earth with specular ocean shading and atmospheric limb glow
- Mercury, Venus, and Mars rendered at proportional real-world radii (Earth = 1)
- Inner planet positions derived from J2000.0 Keplerian orbital elements (Standish & Williams 2001)
- Geocentric orbit paths for all four inner planets, visible when focusing the Sun
- Top-down solar system camera view covering the full Mars orbit (~50 AU range)

### 🎥 Camera controls
- Smooth lerp transitions when focusing Earth or the Sun
- Orbit, zoom, and pan with standard mouse controls

## 🧱 Tech Stack

| Layer | Technology |
|---|---|
| **Language** | TypeScript 5 |
| **Framework** | React 18 + Vite 5 |
| **3D Engine** | Three.js + OrbitControls |
| **Orbital Mechanics** | satellite.js (SGP4/SDP4, GMST) |
| **Satellite Data** | Celestrak API (TLE) |

## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/OlivierFch/sky-track.git
cd sky-track
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Run the dev server

```bash
pnpm dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🧭 Controls

| Action | Description |
|---|---|
| **Left Click + Drag** | Rotate the view |
| **Scroll** | Zoom in / out |
| **Click satellite** | Focus camera + follow orbit |
| **Click empty space** | Deselect |
| **H** | Toggle Earth globe visibility |
| **Focus on Earth** (sidebar) | Re-center on Earth |
| **Focus on the Sun** (sidebar) | Switch to top-down solar system view |
