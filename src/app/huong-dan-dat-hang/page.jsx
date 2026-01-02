"use client";
import Image from "next/image";
import "./guide.css";
import Link from "next/link";

export default function GuidePage() {
    return (
        <main>
            <div className="guide-container">
                <h1 className="guide-title">HƯỚNG DẪN MUA HÀNG ONLINE</h1>

                <p>
                    Khi mua hàng Online, bạn có thể lựa chọn một trong các cách mua hàng sau.
                </p>

                <h2 className="guide-subtitle">Cách 1:</h2>
                <p>
                    Gọi điện đến tổng đài <b>097 567 1080</b> từ 8h30 đến 21h30 tất cả các
                    ngày trong tuần. Nhân viên bán hàng Online sẽ ghi nhận thông tin đặt hàng
                    của bạn.
                </p>

                <h2 className="guide-subtitle">Cách 2: Đặt hàng trên website</h2>

                <h3 className="guide-step">Bước 1: Truy cập website và chọn sản phẩm</h3>
                <p>
                    Bạn có thể truy cập vào website <Link href="/">donidg.vn</Link> và thực hiện các cách đặt hàng
                    đơn giản sau:
                </p>
                <p>
                    – Chọn menu danh mục sản phẩm hoặc click tìm kiếm để tìm sản phẩm mong muốn
                </p>
                <Image
                    src="/images/step1.jpg"
                    alt="Chọn sản phẩm"
                    width={700}
                    height={400}
                    className="guide-img"
                />

                <h3 className="guide-step">Bước 2: Tìm được sản phẩm cần mua</h3>
                <p>
                    Sau khi tìm được sản phẩm cần mua, bạn tiến hành đặt hàng hoặc nếu muốn mua
                    thêm sản phẩm khác bạn hãy thêm sản phẩm vào giỏ hàng.
                </p>
                <Image
                    src="/images/step2.jpg"
                    alt="Chi tiết sản phẩm"
                    width={700}
                    height={400}
                    className="guide-img"
                />

                <h3 className="guide-step">Bước 3: Kiểm tra giỏ hàng</h3>
                <p>
                    Quá trình này có thể lặp lại cho đến khi bạn hoàn tất việc bỏ tất cả sản phẩm
                    cần đặt mua vào giỏ hàng. Sau đó truy cập trang giỏ hàng để xem lại.
                </p>
                <Image
                    src="/images/step3.jpg"
                    alt="Giỏ hàng"
                    width={700}
                    height={400}
                    className="guide-img"
                />

                <h3 className="guide-step">Bước 4: Điền thông tin giao hàng & Thanh toán</h3>
                <p>
                    – Điền đầy đủ thông tin cá nhân để nhân viên giao hàng có thể liên lạc và giao hàng nhanh chóng.
                    – Chọn phương thức thanh toán: <b>Thanh toán khi nhận hàng</b> hoặc <b>Thanh toán online qua chuyển khoản</b>.
                </p>
                <Image
                    src="/images/step4.jpg"
                    alt="Thanh toán"
                    width={700}
                    height={400}
                    className="guide-img"
                />

                <p>
                    Sau khi điền đầy đủ thông tin và kiểm tra lại đơn hàng, giá tiền, bạn hãy bấm
                    vào nút <b>ĐẶT HÀNG</b> để hoàn tất.
                </p>
            </div>
        </main>
    );
}
