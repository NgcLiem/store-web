import Link from "next/link";

export default function Header() {
    return (
        <header className="header">
            <nav className="nav">
                <div className="logo">
                    <img src="/images/logo.png" alt="DONIDG STUDIO" />
                </div>
                <ul className="nav-menu">
                    <li><Link href="/">Trang chủ</Link></li>
                    <li><Link href="/newProducts">Sản phẩm mới</Link></li>
                    <li><Link href="/products">Sản phẩm</Link></li>
                    <li><Link href="/cart">Giỏ hàng</Link></li>
                    <li><Link href="/categorize">Phân loại</Link></li>
                    <li><Link href="/contact">Liên hệ</Link></li>
                </ul>
                <div className="nav-icons">
                    <span><i className="fa-solid fa-magnifying-glass"></i></span>
                    <span><i className="fa-regular fa-user"></i></span>
                    <Link href="/cart">
                        <i className="fa-solid fa-cart-shopping"></i>
                    </Link>
                </div>
            </nav>
        </header>
    );
}
