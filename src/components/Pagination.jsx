import React, { useState } from "react";


function Pagination({ totalPages, onChange }) {
    const [currentPage, setCurrentPage] = useState(1);

    const handleClick = (page) => {
        setCurrentPage(page);
        onChange(page);
    };

    return (
        <div className="pagination">
            {[...Array(totalPages)].map((_, i) => (
                <button
                    key={i}
                    onClick={() => handleClick(i + 1)}
                    className={currentPage === i + 1 ? "active" : ""}
                >
                    {i + 1}
                </button>
            ))}
        </div>
    );
}

export default Pagination;
