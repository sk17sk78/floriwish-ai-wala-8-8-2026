import dynamic from "next/dynamic";
const RichTextEditor = dynamic(
  () => import("@/lib/Forms/RichTextEditor/temp/RichTextEditor"),
  { ssr: false }
);

export default function AdminBlogText({
  text,
  name,
  onChange
}: {
  text: string;
  name: string;
  onChange: (newStr: string) => void;
}) {
  return (
    <div className="p-0 border bg-ivory-1">
      <RichTextEditor
        name={name}
        defaultValue={text}
        content={text}
        onChangeContent={onChange}
      />
    </div>
  );
}
