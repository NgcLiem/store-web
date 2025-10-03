import Link from "next/link";
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
                        <p><a href="nike">Nike</a></p>
                        <p><a href="adidas">Adidas</a></p>
                    </div>

                    <div className="footer-section">
                        <h3>Theo Dõi Chúng Tôi</h3>
                        <p><Link href="facebook">Facebook</Link></p>
                        <p><Link href="instagram">Instagram</Link></p>
                        <p><Link href="tiktok">Tiktok</Link></p>
                        <p><Link href="youtube">YouTube</Link></p>
                    </div>

                    <div className="footer-section">
                        <h3>Hỗ trợ</h3>
                        <p><Link href="huong-dan-dat-hang">Hướng dẫn đặt hàng</Link></p>
                        <p><Link href="chinh-sach-doi-hang">Chính sách đổi hàng</Link></p>
                        <p><Link href="bao-quan-giay">7 cách bảo quản giày</Link></p>
                        <p><Link href="ngay-hot-deal">Ngày hot deal</Link></p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
