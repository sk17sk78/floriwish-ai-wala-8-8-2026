"use client";

import { useEffect, useMemo, useState } from "react";

type FranchiseEnquiry = {
  _id: string;
  status: "new" | "contacted" | "closed";
  name: string;
  phone: string;
  email: string;
  city: string;
  investmentRange: string;
  message?: string;
  submittedAt?: string;
  createdAt?: string;
};

export default function FranchiseEnquiries() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [docs, setDocs] = useState<FranchiseEnquiry[]>([]);
  const [error, setError] = useState<string>("");

  const load = async () => {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/admin/action/franchise-enquiry");
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

  const updateStatus = async (id: string, next: FranchiseEnquiry["status"]) => {
    try {
      await fetch(`/api/admin/action/franchise-enquiry/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next })
      });
      setDocs((prev) =>
        prev.map((d) => (d._id === id ? { ...d, status: next } : d))
      );
    } catch {
      // ignore, user can refresh
    }
  };

  return (
    <div className="w-full">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h1 className="text-xl font-semibold text-charcoal-1">
            Franchise Enquiries
          </h1>
          <p className="text-sm text-charcoal-3/70">
            Submissions from the franchise enquiry form.
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
          {error || "Failed to load franchise enquiries."}
        </div>
      ) : null}

      <div className="overflow-x-auto border border-charcoal-1/10 rounded-md bg-white">
        <table className="min-w-[900px] w-full text-sm">
          <thead className="bg-charcoal-1/5 text-charcoal-2">
            <tr>
              <th className="text-left p-3">Submitted</th>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Phone</th>
              <th className="text-left p-3">Email</th>
              <th className="text-left p-3">City</th>
              <th className="text-left p-3">Investment</th>
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
                  <td className="p-3 whitespace-nowrap">{r.phone}</td>
                  <td className="p-3">{r.email}</td>
                  <td className="p-3">{r.city}</td>
                  <td className="p-3">{r.investmentRange}</td>
                  <td className="p-3 max-w-[320px]">
                    <div className="line-clamp-2">{r.message || "-"}</div>
                  </td>
                  <td className="p-3">
                    <select
                      value={r.status}
                      onChange={(e) =>
                        updateStatus(
                          r._id,
                          e.target.value as FranchiseEnquiry["status"]
                        )
                      }
                      className="border border-charcoal-1/20 rounded-md px-2 py-1 bg-white"
                    >
                      <option value="new">new</option>
                      <option value="contacted">contacted</option>
                      <option value="closed">closed</option>
                    </select>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="p-4 text-charcoal-3/70" colSpan={8}>
                  {status === "loading"
                    ? "Loading..."
                    : "No franchise enquiries yet."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

