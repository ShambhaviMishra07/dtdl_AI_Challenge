
import "./styles/global.css";
import "./styles/hero.css";
import "./styles/process.css";
import "./styles/showcase.css";
import "./styles/footer.css";
import "./styles/neural.css";

import Header from "./components/Header";
import Hero from "./components/Hero";
import ProcessSection from "./components/ProcessSection";
import ChallengeShowcase from "./components/ChallengeShowcase";
import Testimonials from "./components/Testimonials";
import ClosingCTA from "./components/ClosingCTA";
import Footer from "./components/Footer";
import CustomCursor from "./components/CustomCursor";

import { useTheme } from "./hooks/useTheme";

export default function App() {
  const { theme, toggle } = useTheme();

  return (
    <>
      <CustomCursor />

      <Header theme={theme} onToggleTheme={toggle} />

      <main>
        <Hero />
        <ProcessSection />
        <ChallengeShowcase />
        <Testimonials />
        <ClosingCTA />
      </main>

      <Footer />
    </>
  );
}
