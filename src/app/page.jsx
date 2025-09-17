import Header from "../components/Header";
import Pagination from "../components/Pagination";
import Hero from "../components/Hero";
import Services from "@/components/Services";
import StoreSection from "@/components/StoreSection";
import ProductSection from "@/components/NewProduct";
import ProductHot from "@/components/HotProduct";
import Accessories from "@/components/Accessories";
import Footer from "@/components/Footer";


export default function HomePage() {
  return (
    <>
      <Header />
      <Hero />
      <StoreSection />
      <ProductSection />
      <ProductHot />
      <Accessories />
      <Services />
    </>
  );
}
