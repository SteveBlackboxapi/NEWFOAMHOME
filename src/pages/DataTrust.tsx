import { useEffect } from "react";
import { Nav } from "../components/Nav";
import { Footer } from "../components/Footer";
import { CreatorFirst } from "./trust-concepts/CreatorFirst";
import "./trust-concepts/trust-concepts.css";

/** The selected creator-first design, without the concept comparison controls. */
export function DataTrust() {
  useEffect(() => {
    document.title = "Data & trust | Foam";
    return () => {
      document.title = "Foam — Numbers everyone can trust";
    };
  }, []);

  return (
    <div className="pc-site trust-lab">
      <Nav />
      <main id="main-content" tabIndex={-1}>
        <CreatorFirst />
      </main>
      <Footer />
    </div>
  );
}
