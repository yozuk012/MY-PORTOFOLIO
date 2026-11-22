import PublicPageGate from "../home/components/PublicPageGate";
import NotesPageContent from "./NotesPageContent";

export default function NotesPage() {
  return (
    <PublicPageGate featureKey="page_notes">
      <NotesPageContent />
    </PublicPageGate>
  );
}