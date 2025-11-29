import type { ReactNode } from "react";
import "./PageLayout.css";

interface PageLayoutProps {
  children: ReactNode;
}

export function PageLayout({ children }: PageLayoutProps) {
  return (
    <div className="page-root">
      <header className="page-header">
        <h1>Tabular Functions Lab</h1>
        <p>Numerical interpolation and differentiation of tabulated functions</p>
      </header>

      <main className="page-main">{children}</main>

      <footer className="page-footer">
        <small>Numerical Methods · Sprint 3</small>
      </footer>
    </div>
  );
}
