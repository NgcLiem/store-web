"use client";

import { Suspense } from "react";
import SearchHandler from "./SearchHandler";

export const dynamic = 'force-dynamic';

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchHandler />
        </Suspense>
    );
}
