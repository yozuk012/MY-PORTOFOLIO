import { notFound } from "next/navigation";
import FeatureGate from "./FeatureGate";

function NotFoundFallback() {
  notFound();
}

export default function PublicPageGate({ featureKey, children }) {
  return (
    <FeatureGate featureKey={featureKey} fallback={<NotFoundFallback />}>
      {children}
    </FeatureGate>
  );
}