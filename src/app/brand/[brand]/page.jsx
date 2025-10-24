import Hero from "@/components/Hero";
import BrandProducts from "@/components/BrandProducts";

export default function BrandPage({ params }) {
  const brand = params.brand || 'Thương hiệu';
  return (
    <main>
      <Hero />
      <section className="products">
        <div className="container">
          <div className="page-layout">
            <aside className="sidebar">
              <h3>Danh mục sản phẩm</h3>
              {/* You can later populate categories here */}
            </aside>
            <div className="content">
              <h2>{brand.charAt(0).toUpperCase() + brand.slice(1)}</h2>
              <BrandProducts brand={brand} />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
