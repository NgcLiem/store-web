import "../assets/css/services.css"
export default function Services() {
    return (
        <section className="services">
            <div className="container">
                <h2 className="section-title">Dịch Vụ Của Chúng Tôi</h2>

                <div className="services-grid">
                    <div className="service-card">
                        <div className="service-icon">✅</div>
                        <h3>CAM KẾT CHÍNH HÃNG</h3>
                        <p>
                            Cam kết 100% hàng chính hãng có thể kiểm tra trước khi thanh toán
                        </p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon">🚚</div>
                        <h3>GIAO HÀNG HỎA TỐC</h3>
                        <p>
                            Express Delivery <br />
                            Giao hàng tận Tỉ thành toàn quốc trong 24h HCMC <br />
                            24h Toàn Quốc
                        </p>
                    </div>

                    <div className="service-card">
                        <div className="service-icon">📞</div>
                        <h3>HỖ TRỢ 24/24</h3>
                        <p>
                            Hotline &amp; Chat <br />
                            Hỗ trợ khách hàng 24/24 <br />
                            Gọi Ngay
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
