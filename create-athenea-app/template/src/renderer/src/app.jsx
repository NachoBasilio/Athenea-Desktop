import { LocationProvider, Router, Route } from "preact-iso";
import Home from "./routes/Home/Home";

export default function App() {
  return (
    <LocationProvider>
      <Router>
        <Route path="/" component={Home} />
        <Route default component={Home} />
      </Router>
    </LocationProvider>
  );
}
