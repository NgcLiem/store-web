"use client";

export default function Products() {
    const products = [
        {
            name: "Nike Air Max 270",
            price: "2.500.000đ",
            img: "/images/image 203.png",
        },
        {
            name: "Adidas Ultraboost 22",
            price: "3.200.000đ",
            img: "/images/image 204.png",
        },
        {
            name: "Jordan 1 Retro High",
            price: "4.500.000đ",
            img: "/images/image 205.png",
        },
        {
            name: "Yeezy Boost 350 V2",
            price: "5.800.000đ",
            img: "/images/image 206.png",
        },
        {
            name: "Nike Dunk Low",
            price: "2.800.000đ",
            img: "/images/image 217.png",
        },
        {
            name: "Adidas Stan Smith",
            price: "1.900.000đ",
            img: "/images/image 228.png",
        },
        {
            name: "Adidas Stan Smith Special",
            price: "2.000.000đ",
            img: "/images/image 230.png",
        },
        {
            name: "Adidas Stan Smith Premium",
            price: "3.000.000đ",
            img: "/images/image 232.png",
        },
        {
            name: "Nike Dunk Low",
            price: "2.800.000đ",
            img: "/images/image 217.png",
        },
        {
            name: "Adidas Stan Smith",
            price: "1.900.000đ",
            img: "/images/image 228.png",
        },
        {
            name: "Adidas Stan Smith Special",
            price: "2.000.000đ",
            img: "/images/image 230.png",
        },
        {
            name: "Adidas Stan Smith Premium",
            price: "3.000.000đ",
            img: "/images/image 232.png",
        },
        {
            name: "Adidas Stan Smith",
            price: "1.900.000đ",
            img: "/images/image 228.png",
        },
        {
            name: "Adidas Stan Smith Special",
            price: "2.000.000đ",
            img: "/images/image 230.png",
        },
        {
            name: "Adidas Stan Smith Premium",
            price: "3.000.000đ",
            img: "/images/image 232.png",
        },
    ];

    return (
        <section className="products" id="products">
            <div className="container">
                <div className="section-header">
                    <h2 className="section-title">Sản phẩm mới</h2>
                </div>
            </div>

            {/* Grid hiển thị sản phẩm */}
            <div className="products-grid">
                {products.map((product, index) => (
                    <div key={index} className="product-card">
                        <div className="product-badge">Sale</div>
                        <div className="containProduct">
                            <img
                                src={product.img}
                                alt={product.name}
                                className="product-image"
                            />
                        </div>
                        <div className="product-info">
                            <h3>{product.name}</h3>
                            <div className="product-price">{product.price}</div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}
