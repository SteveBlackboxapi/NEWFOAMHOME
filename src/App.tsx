import { RouterProvider } from "react-router";
import { router } from "./routes";
import { SiteThemeProvider } from "./components/SiteTheme";
import "./components/site-theme.css";

export default function App() {
  return (
    <SiteThemeProvider>
      <RouterProvider router={router} />
    </SiteThemeProvider>
  );
}
