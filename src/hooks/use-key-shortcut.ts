import { useEffect } from "react";

const useKeyShortcut = (key: string, callback: () => void) => {
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === key) callback();
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [key, callback]);
};

export { useKeyShortcut };
