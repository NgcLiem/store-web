import { Suspense } from "react";
import dynamic from 'next/dynamic';

const MomoReturnHandler = dynamic(() => import('./MomoReturnHandler'), { ssr: false });

export default function MomoReturnPage() {
    return (
        <Suspense fallback={<div style={{ padding: 24 }}><h2>Loading...</h2></div>}>
            <MomoReturnHandler />
        </Suspense>
    );
}
