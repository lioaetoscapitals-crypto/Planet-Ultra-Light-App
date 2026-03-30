import AppProviders from "./app/providers/AppProviders";
import AppRouter from "./app/navigation/AppRouter";

export default function App() {
  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
