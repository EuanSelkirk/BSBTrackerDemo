import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Leaderboard from "./pages/Leaderboard";
import Events from "./pages/Events";
import RoutesPage from "./pages/Routes";

export default function App() {
  return (
    <Router>
      <Header />
      <main className="pt-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/events" element={<Events />} />
          <Route path="/routes" element={<RoutesPage />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}
