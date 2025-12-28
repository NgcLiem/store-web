import { Suspense } from "react";
import dynamic from 'next/dynamic';

const ResetPasswordHandler = dynamic(() => import('./ResetPasswordHandler'), { ssr: false });

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordHandler />
        </Suspense>
    );
}
