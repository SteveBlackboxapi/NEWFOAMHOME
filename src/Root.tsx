import { Outlet, ScrollRestoration } from "react-router";
import { Nav } from "./components/Nav";
import { Footer } from "./components/Footer";

export function Root() {
  return (
    <div className="font-founders font-normal min-h-screen bg-surface">
      <ScrollRestoration />
      <Nav />
      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
