"use client";

import { Suspense } from "react";
import MomoReturnHandler from "./MomoReturnHandler";

export default function MomoReturnPage() {
    return (
        <Suspense fallback={<div style={{ padding: 24 }}><h2>Loading...</h2></div>}>
            <MomoReturnHandler />
        </Suspense>
    );
}
