import Link from "next/link";
import "../assets/css/footer.css";

export default function Footer() {
    return (
        <footer className="footer" id="contact">
            <div className="footer-container">
                <div className="footer-grid">

                    <div className="footer-section">
                        <h3 className="footer-title">DONIDG STUDIO</h3>
                        <p className="footer-text">
                            <i className="fa-solid fa-shop"></i> Chuyên cung cấp giày sneaker chính hãng,
                            uy tín – chất lượng. Cam kết 100% hàng chính hãng.
                        </p>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-title">LIÊN HỆ</h3>
                        <p><i className="fa-solid fa-location-dot"></i> 123 Đường ABC, Quận 1, TP.HCM</p>
                        <p><i className="fa-solid fa-phone"></i> 0123 456 789</p>
                        <p><i className="fa-solid fa-envelope"></i> min@donidgstudio.com</p>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-title">THƯƠNG HIỆU</h3>
                        <Link href="/nike" className="footer-link">Nike</Link>
                        <Link href="/adidas" className="footer-link">Adidas</Link>
                        <Link href="/jordan" className="footer-link">Jordan</Link>
                        <Link href="/puma" className="footer-link">Puma</Link>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-title">THEO DÕI CHÚNG TÔI</h3>

                        <a href="https://facebook.com" target="_blank" className="footer-social">
                            <i className="fa-brands fa-facebook"></i> Facebook
                        </a>
                        <a href="https://instagram.com" target="_blank" className="footer-social">
                            <i className="fa-brands fa-instagram"></i> Instagram
                        </a>
                        <a href="https://tiktok.com" target="_blank" className="footer-social">
                            <i className="fa-brands fa-tiktok"></i> TikTok
                        </a>
                        <a href="https://youtube.com" target="_blank" className="footer-social">
                            <i className="fa-brands fa-youtube"></i> YouTube
                        </a>
                    </div>

                    <div className="footer-section">
                        <h3 className="footer-title">HỖ TRỢ</h3>
                        <Link href="/huong-dan-dat-hang" className="footer-link">Hướng dẫn đặt hàng</Link>
                        <Link href="/chinh-sach-doi-hang" className="footer-link">Chính sách đổi hàng</Link>
                        <Link href="/bao-quan-giay" className="footer-link">Cách bảo quản giày</Link>
                        <Link href="/sale" className="footer-link">Ngày hot deal</Link>
                    </div>
                </div>

                <div className="footer-bottom">
                    © {new Date().getFullYear()} DONIDG STUDIO — All Rights Reserved.
                </div>
            </div>
        </footer>
    );
}
