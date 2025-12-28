import { Suspense } from "react";
import OrdersHandler from "./OrdersHandler";

export default function MyOrdersPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrdersHandler />
        </Suspense>
    );
}
