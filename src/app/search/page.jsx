import { Suspense } from "react";
import SearchHandler from "./SearchHandler";

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchHandler />
        </Suspense>
    );
}
