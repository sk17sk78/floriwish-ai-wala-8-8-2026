export default function ContentInfoBulletPoint({
  text,
  bulletClassName = "bg-[#d89db3]",
}: {
  text: string;
  bulletClassName?: string;
}) {
  return (
    <>
      <span className={`mt-1.5 h-2 w-2 rounded-full ${bulletClassName}`} />
      <p className="text-[13px] font-normal leading-relaxed text-zinc-500">
        {text}
      </p>
    </>
  );
}
