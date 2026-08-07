export default function CartItemName({ name }: { name: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-zinc-900 text-sm font-medium leading-relaxed">
        {name}
      </span>
    </div>
  );
}
