import Navbar from "./components/Navbar";
import NavbarFooter from "./components/NavbarFooter";
import HeroSlider from "./components/HeroSlider";
import CollectionSection from './components/CollectionsSection';
import ArticlesSection from "./components/ArticlesSection";
import CraftsmenSection from "./components/CraftsmenSection";

export default function Home() {
  return (
    <main className="flex flex-col min-h-screen bg-white">
      {/* ====== NAVBAR ====== */}
      <Navbar/>

      {/* ====== HERO SECTION ====== */}
      <HeroSlider/>

      {/* ====== COLLECTION SECTION ====== */}
      <CollectionSection />

      {/* ====== CRAFTSMEN SECTION ====== */}
      <CraftsmenSection />

      {/* ====== KNIFE TALKS SECTION ====== */}
      <ArticlesSection />

      {/* ====== FOOTER ====== */}
      <footer className="w-full bg-gray-900 text-white py-8 mt-10">
        <div className="max-w-6xl mx-auto px-6">
          <NavbarFooter/>
          <div className="text-center mt-6">
            <p className="text-gray-400 text-sm">© 2025 HandmadeKnives | All rights reserved.</p>
            <div className="flex justify-center gap-4 mt-3 text-lg">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fa-brands fa-facebook"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <i className="fa-brands fa-youtube"></i>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}