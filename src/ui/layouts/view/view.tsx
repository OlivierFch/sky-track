import { ReactNode } from "react";

const View = ({ children }: { children: ReactNode }) => {
    return <div className="view">{children}</div>;
};

export { View };
