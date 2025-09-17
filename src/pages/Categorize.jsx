import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Categorize.css"; // CSS riêng cho dropdown

function Categorize() {
    const [open, setOpen] = useState(false);

    return (
        <div
            className="categorize"
            onMouseEnter={() => setOpen(true)}
            onMouseLeave={() => setOpen(false)}
        >
            <button className="dropdown-btn">
                Phân loại <span className="arrow"></span>
            </button>

            {open && (
                <ul className="dropdown-menu">
                    <li>
                        <Link to="/products/men">Giày Nam</Link>
                    </li>
                    <li>
                        <Link to="/products/women">Giày Nữ</Link>
                    </li>
                    <li>
                        <Link to="/products/kids">Giày Trẻ Em</Link>
                    </li>
                </ul>
            )}
        </div>
    );
}

export default Categorize;
