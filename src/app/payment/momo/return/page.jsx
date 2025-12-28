import { Suspense } from "react";
import MomoReturnHandler from "./MomoReturnHandler";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export default function MomoReturnPage() {
    return (
        <Suspense fallback={<div style={{ padding: 24 }}><h2>Loading...</h2></div>}>
            <MomoReturnHandler />
        </Suspense>
    );
}
