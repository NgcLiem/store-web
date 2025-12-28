import { Suspense } from "react";
import MomoReturnHandler from "./MomoReturnHandler";

export const dynamic = "force-dynamic"; // tránh prerender static

export default function Page() {
  return (
    <Suspense fallback={<div style={{ padding: 24 }}><h2>Loading...</h2></div>}>
      <MomoReturnHandler />
    </Suspense>
  );
}
