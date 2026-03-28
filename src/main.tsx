import { ViteReactSSG } from "vite-react-ssg";
import "@fontsource/jetbrains-mono/latin.css";
import "./index.css";
import { routes } from "./routes";

export const createRoot = ViteReactSSG({ routes });
