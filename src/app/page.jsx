import Services from "@/components/Services";
import ProductSection from "@/components/NewProduct";
import Accessories from "@/components/Accessories";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import Header from "@/components/Header";


export default function HomePage() {
  return (
    <>
      <Hero />
      <ProductSection />
      <Accessories />
      <Services />
    </>
  );
}
