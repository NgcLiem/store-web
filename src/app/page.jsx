import Hero from "../components/Hero";
import Services from "@/components/Services";
import ProductSection from "@/components/NewProduct";
import Accessories from "@/components/Accessories";


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
