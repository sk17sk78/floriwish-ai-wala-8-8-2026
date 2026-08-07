"use client";

import { useEffect, useState } from "react";

export default function SupportMessageCount() {
  const [count, setCount] = useState<number>(0);

  const fetchCount = async () => {
    try {
      // Fetch only "new" messages count
      const res = await fetch("/api/admin/action/support-message?filterBy=status&keyword=new&limit=0");
      const json = await res.json();
      if (res.ok && typeof json?.count === "number") {
        setCount(json.count);
      }
    } catch (e) {
      console.error("Failed to fetch support message count", e);
    }
  };

  useEffect(() => {
    fetchCount();
  }, []);

  if (count === 0) return null;

  return (
    <span className="bg-rose-600 scale-90 text-white flex items-center justify-center px-1.5 py-0.5 font-medium rounded-md !text-xs">
      {count}
    </span>
  );
}
