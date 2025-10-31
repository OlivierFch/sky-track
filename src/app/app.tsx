import { useCallback, useState } from "react";
import { useSatellites } from "../domains/satellites/hooks/use-satellites";
import { GlobeVisibility } from "../core/types";
import { Globe } from "../domains/globe/components/globe/globe";
import { Layout } from "../ui/layouts/layout/layout";
import { LeftSidebar } from "../ui/layouts/left-sidebar/left-sidebar";
import { View } from "../ui/layouts/view/view";
import { useKeyShortcut } from "../hooks/use-key-shortcut";
import { RightSidebar } from "../ui/layouts/right-sidebar/right-sidebar";
import "../styles.css";


const App = () => {
    const { satellites, selectedSatelliteId, setSelectedSatelliteId } = useSatellites();
    const [globeVisibility, setGlobeVisibility] = useState<GlobeVisibility>("visible");

    const handleVisibilityToggle = useCallback(() => {
      const newMode: GlobeVisibility = globeVisibility === "visible" ? "hidden" : "visible";
      setGlobeVisibility(newMode);
    }, [globeVisibility]);

    const handleSatelliteSidebarSelect = useCallback((id: string) => {
      setSelectedSatelliteId((prev) => (prev === id ? null : id)); // toggle behavior
    }, [selectedSatelliteId]);

    // Press "h" to change to focus mode
    useKeyShortcut("h", handleVisibilityToggle);

    // TODO: See to separate in different files css style
    return (
      <Layout>
        <LeftSidebar
              satellites={satellites}
              onSelect={handleSatelliteSidebarSelect}
              onToggleVisibility={handleVisibilityToggle}
              isGlobeVisible={globeVisibility === "visible"}
              selectedSatelliteId={selectedSatelliteId}
        />

        <View>
          <Globe
            satellites={satellites}
            selectedSatelliteId={selectedSatelliteId}
            globeVisibility={globeVisibility}
            onSatelliteSelect={setSelectedSatelliteId}
          />
        </View>

        <RightSidebar />
      </Layout>
    );

};

export { App };
