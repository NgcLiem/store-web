import { Suspense } from "react";
import dynamic from 'next/dynamic';

const OrdersHandler = dynamic(() => import('./OrdersHandler'), { ssr: false });

export default function MyOrdersPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <OrdersHandler />
        </Suspense>
    );
}
