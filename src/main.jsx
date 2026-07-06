import { createRoot } from "react-dom/client";
import App from "./app/App.jsx";
import "./styles/index.css";
import { GoogleOAuthProvider } from "@react-oauth/google";
// import { ErrorBoundary } from "./app/components/Error boundry.jsx";

createRoot(document.getElementById("root")).render(
  <GoogleOAuthProvider
    clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
  >
    {/* <ErrorBoundary> */}
      <App />
    {/* </ErrorBoundary> */}
  </GoogleOAuthProvider>
);
