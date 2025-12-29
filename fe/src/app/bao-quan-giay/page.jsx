"use client";
import { useState } from "react";
import "./shoeCare.css";

export default function ShoeCare() {
    const [comments, setComments] = useState([]);
    const [input, setInput] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        if (input.trim() !== "") {
            setComments([...comments, input]);
            setInput("");
        }
    };

    return (
        <div className="care-container">
            <div className="care-banner">
                <h1>7 Cách Bảo Quản Giày Tốt Nhất</h1>
                <p>Giữ giày của bạn luôn mới, bền đẹp và sạch sẽ!</p>
            </div>

            <section className="care-section">
                <h2>1. Làm sạch giày thường xuyên</h2>
                <p>Sau mỗi lần đi ra ngoài, hãy lau sạch bụi bẩn bằng khăn ẩm hoặc bàn chải mềm.</p>
            </section>
            <section className="care-section">
                <h2>2. Tránh ánh nắng trực tiếp</h2>
                <p>Nắng gắt làm giày bong keo, bạc màu. Nên phơi ở nơi thoáng mát.</p>
            </section>
            <section className="care-section">
                <h2>3. Sử dụng túi hút ẩm hoặc giấy báo</h2>
                <p>Hút ẩm và giữ form giày ổn định khi không sử dụng.</p>
            </section>
            <section className="care-section">
                <h2>4. Để giày nơi khô ráo</h2>
                <p>Tránh môi trường ẩm mốc. Nên dùng kệ giày thông thoáng.</p>
            </section>
            <section className="care-section">
                <h2>5. Dùng dung dịch bảo vệ giày</h2>
                <p>Xịt chống thấm, chống bám bẩn giúp giày luôn như mới.</p>
            </section>
            <section className="care-section">
                <h2>6. Không giặt giày bằng máy giặt</h2>
                <p>Máy giặt dễ làm hỏng form, rách vải. Hãy giặt tay nhẹ nhàng.</p>
            </section>
            <section className="care-section">
                <h2>7. Xoay vòng giày</h2>
                <p>Đừng đi 1 đôi liên tục, hãy thay đổi để giày có thời gian nghỉ.</p>
            </section>

            <div className="related-articles">
                <h2>Bài viết liên quan</h2>
                <ul>
                    <li><a href="#">Top 5 loại dung dịch bảo vệ giày hiệu quả nhất</a></li>
                    <li><a href="#">Cách làm sạch giày trắng bị ố vàng</a></li>
                    <li><a href="#">Những lỗi thường gặp khi bảo quản giày</a></li>
                    <li><a href="#">So sánh giặt giày bằng tay và bằng máy</a></li>
                </ul>
            </div>

            <div className="comments-section">
                <h2>Ý kiến khách hàng</h2>
                <form onSubmit={handleSubmit} className="comment-form">
                    <textarea
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Viết bình luận của bạn..."
                    ></textarea>
                    <button type="submit">Gửi</button>
                </form>

                <div className="comment-list">
                    {comments.length === 0 ? (
                        <p>Chưa có bình luận nào. Hãy là người đầu tiên!</p>
                    ) : (
                        comments.map((cmt, i) => (
                            <div key={i} className="comment-item">
                                <strong>Khách hàng {i + 1}:</strong>
                                <p>{cmt}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
