import { Suspense } from "react";
import dynamic from 'next/dynamic';

const SearchHandler = dynamic(() => import('./SearchHandler'), { ssr: false });

export default function SearchPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <SearchHandler />
        </Suspense>
    );
}
