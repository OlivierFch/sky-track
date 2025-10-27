# 🪐 SkyTrack — Real-Time 3D Satellite Tracker

**SkyTrack** lets you explore satellites orbiting Earth in an interactive 3D environment.
It combines accurate orbital data from the **Celestrak** API
 with a **TypeScript** + **Vite** + **React** front-end and a **Three.js** rendering engine.

*// TODO: Add a preview of the project*

## ✨ Features

- 🛰️ Live satellite visualization — see real orbital positions in real-time.
- 🌐 Interactive 3D globe — pan, zoom, and rotate Earth with smooth orbit controls.
- ✨ Dynamic glow effects — satellites gently pulse when idle and highlight when selected.
- 🎯 Camera focus — click or select a satellite to smoothly center and follow it.
- 🧭 Sidebar control — toggle the globe visibility and select satellites directly from the list.


## 🧱 Tech Stack

| Layer | Technology |
|-------|-------------|
| **Language** | TypeScript |
| **Framework** | [React 18](https://react.dev/) + [Vite](https://vitejs.dev/) |
| **3D Engine** | [Three.js](https://threejs.org/) |
| **Orbital Computation** | [Satellite.js](https://github.com/shashwatak/satellite-js) |
| **Data Source** | [Celestrak API](https://celestrak.org/NORAD/elements/) |
| **Date/Time** | Luxon |


## ⚙️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/your-username/skytrack.git
cd skytrack
```

### 2. Install dependencies

```bash
pnpm install
# or npm install / yarn install
```

### 2. Run the dev server

```bash
pnpm dev
# or npm dev / yarn dev
```


## 🧭 Controls

| Action                  | Description                        |
| ----------------------- | ---------------------------------- |
| **Left Click + Drag**   | Rotate the globe                   |
| **Scroll**              | Zoom in/out                        |
| **Click satellite**     | Focus + follow in orbit            |
| **Click empty space**   | Deselect and reset view            |
| **Toggle Globe button** | Hide/show Earth for a clearer view |