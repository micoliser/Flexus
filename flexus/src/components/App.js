import {
  BrowserRouter as Router,
  Routes,
  Route,
  Outlet,
} from "react-router-dom";
import { useEffect } from "react";
import AOS from "aos";
import "aos/dist/aos.css";
import Header from "./Header";
import Footer from "./Footer";
import Home from "../pages/Home";
import Products from "../pages/Products";
import Contact from "../pages/Contact";
import About from "../pages/About";

const Layout = () => {
  useEffect(() => {
    AOS.init({
      duration: 700,
      easing: "ease-in-out",
      once: false,
      mirror: true,
    });
  }, []);

  return (
    <div className="App">
      <Header />
      <Outlet />
      <Footer />
      <div className="d-flex gap-2 align-items-center layout-contact">
        <a href="tel:+234701234567" className="btn btn-brand-secondary">
          <i className="bi bi-telephone fs-4"></i>
        </a>
        <a
          href="https://wa.me/2347012345670"
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-brand-primary"
        >
          <i className="bi bi-whatsapp fs-4"></i>
        </a>
      </div>
    </div>
  );
};

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Products />} />
          <Route path="/contact" element={<Contact />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
