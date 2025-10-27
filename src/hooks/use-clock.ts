import { useEffect, useState } from "react";
import { DateTime } from "luxon";


const useClock = (defaultFormat = "HH:mm:ss") => {
    const [clock, setClock] = useState(() => DateTime.local().toFormat(defaultFormat));

    useEffect(() => {
        const id = setInterval(() => {
            setClock(DateTime.local().toFormat(defaultFormat));
        }, 1000)
        return () => clearInterval(id);
    }, [defaultFormat])
    return clock;
};

export { useClock };
