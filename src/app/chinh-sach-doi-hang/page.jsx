"use client";
import "./faq.css";

export default function FAQ() {
    return (
        <div className="faq-container">
            {/* Banner */}
            <div className="faq-banner">
                <h1>Câu hỏi thường gặp?</h1>
                <p>Bạn có thắc mắc, đọc dưới này nhé!</p>
            </div>

            {/* Giao hàng */}
            <section className="faq-section" id="shipping">
                <h2>Giao Hàng - Vận Chuyển</h2>
                <div className="faq-grid">
                    <div>
                        <h3>DONIDG có giao hàng tận nơi cho tôi không?</h3>
                        <p>DONIDG giao hàng trên toàn quốc và nhận thanh toán tại nhà.</p>
                    </div>
                    <div>
                        <h3>Phí vận chuyển ra sao?</h3>
                        <p>Phí vận chuyển được tính dựa trên cân nặng sản phẩm và số lượng.</p>
                    </div>
                    <div>
                        <h3>Tôi ở tỉnh lẻ thì nhận hàng bao lâu?</h3>
                        <p>Khoảng 2-4 ngày làm việc tùy vị trí địa lý.</p>
                    </div>
                    <div>
                        <h3>Nếu chuyển hàng nhưng tôi không ưng?</h3>
                        <p>Bạn được đổi hàng trong 30 ngày, shop sẽ hỗ trợ đổi trả.</p>
                    </div>
                </div>
            </section>

            {/* Thanh toán */}
            <section className="faq-section" id="payment">
                <h2>Đặt Hàng - Thanh Toán</h2>
                <div className="faq-grid">
                    <div>
                        <h3>Tôi muốn hủy đơn hàng thì làm sao?</h3>
                        <p>Liên hệ hotline 097 567 1080 khi đơn chưa được đóng gói.</p>
                    </div>
                    <div>
                        <h3>Tôi thanh toán thế nào khi đặt hàng xong?</h3>
                        <p>Thanh toán khi nhận hàng hoặc chuyển khoản online.</p>
                    </div>
                    <div>
                        <h3>Tôi muốn mua nhiều có được giảm không?</h3>
                        <p>Đơn hàng từ 5 sản phẩm trở lên sẽ có ưu đãi riêng.</p>
                    </div>
                    <div>
                        <h3>Đặt hàng online có rủi ro không?</h3>
                        <p>DONIDG cam kết uy tín, bạn hoàn toàn yên tâm khi mua.</p>
                    </div>
                </div>
            </section>

            {/* Đổi hàng */}
            <section className="faq-section" id="warranty">
                <h2>Đổi Hàng - Bảo Hành</h2>
                <div className="faq-grid">
                    <div>
                        <h3>Quy định đổi hàng thế nào?</h3>
                        <p>
                            Shop nhận đổi sản phẩm với giá trị bằng hoặc cao hơn. Nếu thấp hơn thì không hoàn tiền.
                        </p>
                    </div>
                    <div>
                        <h3>Tôi bị mất hóa đơn có đổi được hàng không?</h3>
                        <p>Không, bạn cần hóa đơn để được đổi hàng.</p>
                    </div>
                    <div>
                        <h3>Tôi có thể đổi hàng trong bao lâu?</h3>
                        <p>Trong vòng 30 ngày kể từ ngày mua hàng.</p>
                    </div>
                    <div>
                        <h3>DONIDG bảo hành bao lâu?</h3>
                        <p>15 ngày, riêng sản phẩm SALE không bảo hành.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}
