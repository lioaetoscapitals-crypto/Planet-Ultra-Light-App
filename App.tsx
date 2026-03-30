import { useState } from "react";
import AuthFlowScreen from "./src/screens/AuthFlowScreen";
import PlanetScreen from "./src/screens/PlanetScreen";

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);

  if (!authenticated) {
    return <AuthFlowScreen onAuthenticated={() => setAuthenticated(true)} />;
  }

  return <PlanetScreen />;
}
