"use client";

import { useEffect, useMemo, useState } from "react";

type SupportMessage = {
  _id: string;
  status: "new" | "responded" | "closed";
  name: string;
  phone: string;
  email: string;
  subject: string;
  message: string;
  submittedAt?: string;
  createdAt?: string;
};

export default function SupportMessages() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [docs, setDocs] = useState<SupportMessage[]>([]);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string>("");

  const load = async () => {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/admin/action/support-message");
      const json = await res.json();
      if (!res.ok) throw new Error(json?.error || "Failed to load");
      setDocs(Array.isArray(json?.data) ? json.data : []);
      setStatus("idle");
    } catch (e) {
      setStatus("error");
      setError(e instanceof Error ? e.message : "Failed to load");
    }
  };

  useEffect(() => {
    load();
  }, []);

  const rows = useMemo(() => docs, [docs]);

  const updateStatus = async (id: string, next: SupportMessage["status"]) => {
    try {
      await fetch(`/api/admin/action/support-message/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next })
      });
      setDocs((prev) =>
        prev.map((d) => (d._id === id ? { ...d, status: next } : d))
      );
    } catch {
      // ignore
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-charcoal-1">
            Support Messages
          </h1>
          <p className="text-sm text-charcoal-3/70">
            Messages submitted through the Contact Us form.
          </p>
        </div>
        <button
          onClick={load}
          className="px-4 py-2 rounded-md bg-charcoal-1 text-white text-sm hover:bg-charcoal-1/90"
          disabled={status === "loading"}
        >
          {status === "loading" ? "Refreshing..." : "Refresh"}
        </button>
      </div>

      {status === "error" ? (
        <div className="p-4 rounded-md border border-rose-200 bg-rose-50 text-rose-800 text-sm">
          {error || "Failed to load support messages."}
        </div>
      ) : null}

      <div className="overflow-x-auto border border-charcoal-1/10 rounded-md bg-white">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-charcoal-1/5 text-charcoal-2">
            <tr>
              <th className="text-left p-3">Submitted</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Contact</th>
              <th className="text-left p-3">Subject</th>
              <th className="text-left p-3">Message</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((r) => (
                <tr key={r._id} className="border-t border-charcoal-1/10">
                  <td className="p-3 whitespace-nowrap">
                    {r.submittedAt
                      ? new Date(r.submittedAt).toLocaleString()
                      : r.createdAt
                        ? new Date(r.createdAt).toLocaleString()
                        : "-"}
                  </td>
                  <td className="p-3">{r.name}</td>
                  <td className="p-3">
                    <div className="flex flex-col">
                        <span>{r.phone}</span>
                        <span className="text-xs text-charcoal-3">{r.email}</span>
                    </div>
                  </td>
                  <td className="p-3 font-medium text-charcoal-1">{r.subject}</td>
                  <td className="p-3 max-w-[400px]">
                    <div className={expandedIds.has(r._id) ? "" : "line-clamp-2"} title={!expandedIds.has(r._id) ? r.message : ""}>
                      {r.message || "-"}
                    </div>
                    {r.message && r.message.length > 80 && (
                      <button
                        onClick={() => toggleExpand(r._id)}
                        className="text-xs text-rose-600 hover:underline mt-1 font-medium"
                      >
                        {expandedIds.has(r._id) ? "View Less" : "View More"}
                      </button>
                    )}
                  </td>
                  <td className="p-3">
                    <select
                      value={r.status}
                      onChange={(e) =>
                        updateStatus(
                          r._id,
                          e.target.value as SupportMessage["status"]
                        )
                      }
                      className="border border-charcoal-1/20 rounded-md px-2 py-1 bg-white"
                    >
                      <option value="new">new</option>
                      <option value="responded">responded</option>
                      <option value="closed">closed</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-charcoal-3/70" colSpan={6}>
                  {status === "loading"
                    ? "Loading..."
                    : "No support messages yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
