import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../database/services/database.service';

type Summary = {
    totalRevenue: number;
    revenueThisMonth: number;
    totalSold: number;
    newProducts: number;
};

type Point = {
    label: string;
    revenue: number;
    orders: number;
};

type DashboardDto = {
    summary: Summary;
    daily: Point[];
    monthly: Point[];
    yearly: Point[];
};

@Injectable()
export class AdminStatsService {
    constructor(private readonly db: DatabaseService) {}

    private clamp(n: any, min: number, max: number) {
        const x = Number(n);
        if (!Number.isFinite(x)) return min;
        return Math.min(Math.max(x, min), max);
    }

    async dashboard(q: {
        days?: any;
        months?: any;
        years?: any;
    }): Promise<DashboardDto> {
        const days = this.clamp(q.days ?? 14, 7, 60);
        const months = this.clamp(q.months ?? 12, 3, 36);
        const years = this.clamp(q.years ?? 5, 2, 10);

        const [summary, daily, monthly, yearly] = await Promise.all([
            this.getSummary(),
            this.getDaily(days),
            this.getMonthly(months),
            this.getYearly(years),
        ]);

        return { summary, daily, monthly, yearly };
    }

    async getSummary(): Promise<Summary> {
        // 1) Tổng doanh thu (chỉ tính đơn hợp lệ)
        const totalRevenueRows = await this.db.query<{ total: number }>(
            `
      SELECT COALESCE(SUM(total_amount),0) AS total
      FROM orders
      WHERE status IN ('confirmed','shipped','delivered')
      `,
            [],
        );

        // 2) Doanh thu tháng này
        const thisMonthRows = await this.db.query<{ total: number }>(
            `
      SELECT COALESCE(SUM(total_amount),0) AS total
      FROM orders
      WHERE status IN ('confirmed','shipped','delivered')
        AND order_date >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
      `,
            [],
        );

        // 3) Tổng số sản phẩm bán được (sum quantity) từ order_items join orders
        const soldRows = await this.db.query<{ total: number }>(
            `
      SELECT COALESCE(SUM(oi.quantity),0) AS total
      FROM order_items oi
      JOIN orders o ON o.id = oi.order_id
      WHERE o.status IN ('confirmed','shipped','delivered')
      `,
            [],
        );

        // 4) Sản phẩm mới (ví dụ: 30 ngày gần nhất)
        const newProductsRows = await this.db.query<{ total: number }>(
            `
      SELECT COUNT(*) AS total
      FROM products
      WHERE created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)
      `,
            [],
        );

        return {
            totalRevenue: Number(totalRevenueRows?.[0]?.total || 0),
            revenueThisMonth: Number(thisMonthRows?.[0]?.total || 0),
            totalSold: Number(soldRows?.[0]?.total || 0),
            newProducts: Number(newProductsRows?.[0]?.total || 0),
        };
    }

    async getDaily(days: number): Promise<Point[]> {
        // Fix only_full_group_by: group theo d=DATE(order_date), label tạo từ d
        const rows = await this.db.query<Point>(
            `
      SELECT 
        DATE_FORMAT(t.d, '%d/%m') AS label,
        t.revenue,
        t.orders
      FROM (
        SELECT
          DATE(order_date) AS d,
          COALESCE(SUM(total_amount),0) AS revenue,
          COUNT(*) AS orders
        FROM orders
        WHERE status IN ('confirmed','shipped','delivered')
          AND order_date >= DATE_SUB(CURDATE(), INTERVAL ${days} DAY)
        GROUP BY d
        ORDER BY d
      ) t
      `,
            [],
        );

        return Array.isArray(rows)
            ? rows.map((r) => ({
                  label: String((r as any).label),
                  revenue: Number((r as any).revenue || 0),
                  orders: Number((r as any).orders || 0),
              }))
            : [];
    }

    async getMonthly(months: number): Promise<Point[]> {
        // group theo ym=DATE_FORMAT(order_date,'%Y-%m'), label tạo từ ym (không đụng order_date trực tiếp)
        const rows = await this.db.query<Point>(
            `
      SELECT
        DATE_FORMAT(STR_TO_DATE(CONCAT(t.ym,'-01'), '%Y-%m-%d'), '%m/%Y') AS label,
        t.revenue,
        t.orders
      FROM (
        SELECT
          DATE_FORMAT(order_date, '%Y-%m') AS ym,
          COALESCE(SUM(total_amount),0) AS revenue,
          COUNT(*) AS orders
        FROM orders
        WHERE status IN ('confirmed','shipped','delivered')
          AND order_date >= DATE_SUB(CURDATE(), INTERVAL ${months} MONTH)
        GROUP BY ym
        ORDER BY ym
      ) t
      `,
            [],
        );

        return Array.isArray(rows)
            ? rows.map((r) => ({
                  label: String((r as any).label),
                  revenue: Number((r as any).revenue || 0),
                  orders: Number((r as any).orders || 0),
              }))
            : [];
    }

    async getYearly(years: number): Promise<Point[]> {
        const rows = await this.db.query<Point>(
            `
      SELECT
        CAST(t.y AS CHAR) AS label,
        t.revenue,
        t.orders
      FROM (
        SELECT
          YEAR(order_date) AS y,
          COALESCE(SUM(total_amount),0) AS revenue,
          COUNT(*) AS orders
        FROM orders
        WHERE status IN ('confirmed','shipped','delivered')
          AND order_date >= DATE_SUB(CURDATE(), INTERVAL ${years} YEAR)
        GROUP BY y
        ORDER BY y
      ) t
      `,
            [],
        );

        return Array.isArray(rows)
            ? rows.map((r) => ({
                  label: String((r as any).label),
                  revenue: Number((r as any).revenue || 0),
                  orders: Number((r as any).orders || 0),
              }))
            : [];
    }
}
