// src/utils/money.js
export const formatVND = (value) => {
    const n = Number(value ?? 0);          // DECIMAL của mysql2 trả về string → ép số
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
        maximumFractionDigits: 0,            // 2.700.000 đ (không .00)
    })
        .format(n)
        .replace('₫', 'đ');                  // đổi ký hiệu để hợp với thiết kế
};
