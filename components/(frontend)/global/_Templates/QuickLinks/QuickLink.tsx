import Link from "next/link";

export default function QuickLink({
  label,
  url,
  isLast
}: {
  label: string;
  url: string;
  isLast: boolean;
}) {
  return (
    <span className="inline text-left">
      <Link
        href={url || "#"}
        className="text-gray-600 hover:text-[#b76e79] hover:underline transition-colors font-normal inline text-left break-words"
      >
        {label}
      </Link>
      {!isLast && (
        <span className="text-gray-300 mx-1.5 sm:mx-2 select-none font-light inline">
          |
        </span>
      )}
    </span>
  );
}
