"use client";

import { Suspense } from "react";
import OrdersHandler from "./OrdersHandler";

export const dynamic = 'force-dynamic';

export default function MyOrdersPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrdersHandler />
        </Suspense>
    );
}
