import "../assets/css/services.css";

export default function Services() {
    return (
        <section className="services">
            <div className="container">
                <div className="services-header">
                    <h2 className="section-title">Dịch vụ của chúng tôi</h2>
                    <p className="services-subtitle">
                        DONIDG cam kết mang đến trải nghiệm mua sắm an toàn, nhanh chóng và
                        luôn đồng hành cùng bạn trước – trong – sau khi mua hàng.
                    </p>
                </div>

                <div className="services-grid">
                    <div className="service-card">
                        <div className="service-icon service-icon--primary">
                            <i className="fa-solid fa-shield-check" aria-hidden="true"></i>
                        </div>
                        <h3>Cam kết chính hãng</h3>
                        <p>
                            100% sản phẩm chính hãng, có đầy đủ hóa đơn – chứng từ. Hoàn tiền
                            nếu phát hiện hàng giả, hàng kém chất lượng.
                        </p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon service-icon--accent">
                            <i className="fa-solid fa-truck-fast" aria-hidden="true"></i>
                        </div>
                        <h3>Giao hàng hỏa tốc</h3>
                        <p>
                            Giao nhanh nội thành TP.HCM trong 24h, 2–4 ngày cho các tỉnh
                            thành khác. Được kiểm tra hàng trước khi thanh toán.
                        </p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon service-icon--secondary">
                            <i className="fa-solid fa-headset" aria-hidden="true"></i>
                        </div>
                        <h3>Hỗ trợ 24/7</h3>
                        <p>
                            Đội ngũ chăm sóc khách hàng luôn sẵn sàng hỗ trợ qua Hotline,
                            Zalo, Fanpage. Giải đáp nhanh mọi thắc mắc của bạn.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
