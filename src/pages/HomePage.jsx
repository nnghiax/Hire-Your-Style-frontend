import ListProducts from "../components/landing/ListProducts";

import SplashCursor from "../components/common/SplashCursor";
import Footer from "../components/common/Footer";
import Header from "../components/common/Header";
import BackToTop from "../components/common/BackToTop";

function LandingPage() {
  return (
    <>
      {/* <SplashCursor /> */}
      <BackToTop />
      <Header />
      <ListProducts />
      <Footer />
    </>
  );
}

export default LandingPage;
