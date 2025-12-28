"use client";

import { Suspense } from "react";
import ResetPasswordHandler from "./ResetPasswordHandler";

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordHandler />
        </Suspense>
    );
}
