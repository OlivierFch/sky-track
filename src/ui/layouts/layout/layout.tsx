import { ReactNode } from "react";

const Layout = ({ children }: { children: ReactNode }) => {
    return <div className="app">{children}</div>;
};

export { Layout };
