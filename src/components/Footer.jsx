import "../assets/css/footer.css"

export default function Footer() {
    return (
        <footer className="footer" id="contact">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-section">
                        <h3>DONIDG STUDIO</h3>
                        <p>
                            Chuyên cung cấp giày sneaker chính hãng với chất lượng tốt nhất.
                            Cam kết 100% hàng chính hãng.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h3>Liên Hệ</h3>
                        <p>📍 123 Đường ABC, Quận 1, TP.HCM</p>
                        <p>📞 0123 456 789</p>
                        <p>✉️ info@donidgstudio.com</p>
                    </div>

                    <div className="footer-section">
                        <h3>Thương Hiệu</h3>
                        <p><a href="#nike">Nike</a></p>
                        <p><a href="#adidas">Adidas</a></p>
                    </div>

                    <div className="footer-section">
                        <h3>Theo Dõi Chúng Tôi</h3>
                        <p><a href="#">Facebook</a></p>
                        <p><a href="#">Instagram</a></p>
                        <p><a href="#">Tiktok</a></p>
                        <p><a href="#">YouTube</a></p>
                    </div>

                    <div className="footer-section">
                        <h3>Hỗ trợ</h3>
                        <p><a href="#">Hướng dẫn đặt hàng</a></p>
                        <p><a href="#">Chính sách đổi hàng</a></p>
                        <p><a href="#">7 cách bảo quản giày</a></p>
                        <p><a href="#">Ngày hot deal</a></p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
