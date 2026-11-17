import Link from "next/link";
import { FaArrowLeft } from "react-icons/fa";

export default function BackButton() {
  return (
    <Link
      href="/admin"
      className="group inline-flex items-center gap-2 text-sm font-medium text-text-muted hover:text-accent transition-colors"
    >
      <FaArrowLeft className="w-3 h-3 transition-transform duration-300 group-hover:-translate-x-1" />
      Kembali ke Dashboard
    </Link>
  );
}
