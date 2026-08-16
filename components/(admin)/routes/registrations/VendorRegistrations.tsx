"use client";

import { useEffect, useMemo, useState } from "react";
import { 
  Search, 
  RefreshCw, 
  ChevronLeft, 
  ChevronRight, 
  Filter, 
  Building, 
  MapPin, 
  Mail, 
  Phone, 
  MessageSquare,
  Calendar,
  ExternalLink,
  SlidersHorizontal,
  Download,
  FileSpreadsheet
} from "lucide-react";

type VendorRegistration = {
  _id: string;
  status: "new" | "contacted" | "converted" | "rejected";
  fullName: string;
  email: string;
  businessName: string;
  city: string;
  interestedCategory: string;
  mobile: string;
  whatsapp?: string;
  address: string;
  gstNumber?: string;
  foundUs?: string;
  socialPlatform?: string;
  socialLink?: string;
  submittedAt?: string;
  createdAt?: string;
};

export default function VendorRegistrations() {
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [docs, setDocs] = useState<VendorRegistration[]>([]);
  const [error, setError] = useState<string>("");
  
  // Search & Filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>("all");

  // Pagination states
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  const load = async () => {
    setStatus("loading");
    setError("");
    try {
      const res = await fetch("/api/admin/action/vendor-registration");
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

  // Filtered rows based on status & search query
  const filteredDocs = useMemo(() => {
    return docs.filter((item) => {
      // Status filter
      if (selectedStatusFilter !== "all" && item.status !== selectedStatusFilter) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase();
        const matchName = item.fullName?.toLowerCase().includes(q);
        const matchBusiness = item.businessName?.toLowerCase().includes(q);
        const matchCity = item.city?.toLowerCase().includes(q);
        const matchEmail = item.email?.toLowerCase().includes(q);
        const matchMobile = item.mobile?.toLowerCase().includes(q);
        const matchCat = item.interestedCategory?.toLowerCase().includes(q);
        return matchName || matchBusiness || matchCity || matchEmail || matchMobile || matchCat;
      }
      return true;
    });
  }, [docs, selectedStatusFilter, searchQuery]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatusFilter, pageSize]);

  // Pagination calculations
  const totalItems = filteredDocs.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalItems);

  const paginatedRows = useMemo(() => {
    return filteredDocs.slice(startIndex, startIndex + pageSize);
  }, [filteredDocs, startIndex, pageSize]);

  const updateStatus = async (id: string, next: VendorRegistration["status"]) => {
    try {
      await fetch(`/api/admin/action/vendor-registration/${id}`, {
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

  // Google Sheet / CSV Export Function
  const exportToGoogleSheetsCSV = () => {
    if (!filteredDocs.length) return;

    // CSV Headers for Google Sheets
    const headers = [
      "Submitted Date",
      "Full Name",
      "Email",
      "Business Name",
      "City",
      "Interested Category",
      "Mobile",
      "WhatsApp",
      "Address",
      "GST Number",
      "Found Us",
      "Social Platform",
      "Social Link",
      "Status"
    ];

    const escapeCsv = (val: string | undefined | null) => {
      if (!val) return '""';
      const clean = String(val).replace(/"/g, '""');
      return `"${clean}"`;
    };

    // Format all filtered records into CSV rows
    const csvRows = filteredDocs.map((r) => {
      const submittedDate = r.submittedAt
        ? new Date(r.submittedAt).toLocaleString("en-IN")
        : r.createdAt
          ? new Date(r.createdAt).toLocaleString("en-IN")
          : "";

      return [
        escapeCsv(submittedDate),
        escapeCsv(r.fullName),
        escapeCsv(r.email),
        escapeCsv(r.businessName),
        escapeCsv(r.city),
        escapeCsv(r.interestedCategory),
        escapeCsv(r.mobile),
        escapeCsv(r.whatsapp),
        escapeCsv(r.address),
        escapeCsv(r.gstNumber),
        escapeCsv(r.foundUs),
        escapeCsv(r.socialPlatform),
        escapeCsv(r.socialLink),
        escapeCsv(r.status)
      ].join(",");
    });

    const csvContent = "\uFEFF" + [headers.map((h) => `"${h}"`).join(","), ...csvRows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const today = new Date().toISOString().split("T")[0];
    link.setAttribute("href", url);
    link.setAttribute("download", `Vendor_Registrations_GoogleSheet_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="w-full max-w-full space-y-4 font-sans text-stone-900 pb-12 overflow-x-hidden">
      {/* Clean Human-Crafted Title Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-2 border-b border-stone-200 pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Vendor Registrations
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-700 border border-stone-200">
              {docs.length} Submissions
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Submissions received from vendor onboarding registration form.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Download Google Sheet (CSV) Button */}
          <button
            onClick={exportToGoogleSheetsCSV}
            disabled={!filteredDocs.length}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-lg shadow-2xs transition-all disabled:opacity-40 cursor-pointer"
            title="Download CSV file for Google Sheets / Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            <span>Export Google Sheet ({filteredDocs.length})</span>
          </button>

          {/* Refresh Button */}
          <button
            onClick={load}
            disabled={status === "loading"}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white hover:bg-stone-50 border border-stone-300 rounded-lg shadow-2xs transition-all disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${status === "loading" ? "animate-spin text-rose-600" : "text-stone-500"}`} />
            <span>{status === "loading" ? "Refreshing..." : "Refresh"}</span>
          </button>
        </div>
      </div>

      {/* Clean Search & Filter Control Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-stone-200 shadow-2xs">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[220px]">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search vendor name, business, city, mobile, email..."
            className="w-full pl-9 pr-3 py-1.5 text-xs font-medium bg-stone-50 hover:bg-stone-100/70 focus:bg-white border border-stone-200 focus:border-stone-400 rounded-md focus:outline-none transition-all placeholder:text-stone-400"
          />
        </div>

        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2.5">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-xs font-medium">
            <Filter className="w-3.5 h-3.5 text-stone-500" />
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="bg-transparent text-xs font-semibold text-stone-800 focus:outline-none cursor-pointer"
            >
              <option value="all">All Status ({docs.length})</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Page Size Select */}
          <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-stone-50 border border-stone-200 rounded-md text-xs font-medium text-stone-600">
            <SlidersHorizontal className="w-3 h-3 text-stone-500" />
            <span>Per Page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              className="bg-transparent text-xs font-bold text-stone-900 focus:outline-none cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error Banner */}
      {status === "error" && (
        <div className="p-3.5 rounded-lg border border-rose-200 bg-rose-50 text-rose-800 text-xs font-medium">
          {error || "Failed to load vendor registrations."}
        </div>
      )}

      {/* Clean Human Table Box */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-2xs overflow-hidden w-full max-w-full">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-xs text-left border-collapse table-auto">
            <thead className="bg-stone-50 text-stone-600 font-bold uppercase tracking-wider text-[11px] border-b border-stone-200">
              <tr>
                <th className="py-3 px-3 whitespace-nowrap">Submitted Date</th>
                <th className="py-3 px-3">Vendor & Email</th>
                <th className="py-3 px-3">Business Name</th>
                <th className="py-3 px-3">City</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 whitespace-nowrap">Mobile / WhatsApp</th>
                <th className="py-3 px-3">GST / Link</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Status Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-200/80">
              {paginatedRows.length ? (
                paginatedRows.map((r) => (
                  <tr key={r._id} className="hover:bg-stone-50/80 transition-colors">
                    {/* Submitted At */}
                    <td className="py-3 px-3 whitespace-nowrap text-stone-500 font-medium">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                        <span className="text-[11px]">
                          {r.submittedAt
                            ? new Date(r.submittedAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                            : r.createdAt
                              ? new Date(r.createdAt).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
                              : "-"}
                        </span>
                      </div>
                    </td>

                    {/* Vendor & Email */}
                    <td className="py-3 px-3">
                      <p className="font-bold text-stone-900 text-xs">{r.fullName}</p>
                      <p className="text-[11px] text-stone-500 font-medium flex items-center gap-1 mt-0.5 break-all">
                        <Mail className="w-3 h-3 text-stone-400 shrink-0" /> {r.email}
                      </p>
                    </td>

                    {/* Business Name */}
                    <td className="py-3 px-3 font-semibold text-stone-800 text-xs">
                      {r.businessName || "-"}
                    </td>

                    {/* City */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-medium text-[11px] border border-stone-200">
                        <MapPin className="w-3 h-3 text-stone-500 shrink-0" /> {r.city}
                      </span>
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-rose-50 text-rose-800 font-medium text-[11px] border border-rose-100">
                        {r.interestedCategory || "Vendor Partner"}
                      </span>
                    </td>

                    {/* Mobile & WhatsApp */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <a
                        href={`tel:${r.mobile}`}
                        className="font-bold text-stone-900 hover:text-rose-600 flex items-center gap-1 transition-colors text-xs"
                      >
                        <Phone className="w-3 h-3 text-stone-400 shrink-0" /> {r.mobile}
                      </a>
                      {r.whatsapp ? (
                        <a
                          href={`https://wa.me/${r.whatsapp.replace(/\D/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-emerald-700 font-medium hover:underline flex items-center gap-1 mt-0.5"
                        >
                          <MessageSquare className="w-3 h-3 shrink-0" /> WA: {r.whatsapp}
                        </a>
                      ) : null}
                    </td>

                    {/* GST / Social */}
                    <td className="py-3 px-3">
                      {r.gstNumber ? (
                        <p className="text-[11px] font-semibold text-stone-800">GST: {r.gstNumber}</p>
                      ) : (
                        <p className="text-[11px] text-stone-400">No GST</p>
                      )}
                      {r.socialLink ? (
                        <a
                          href={r.socialLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[11px] text-rose-600 font-medium hover:underline inline-flex items-center gap-0.5 mt-0.5"
                        >
                          <span>{r.socialPlatform || "Social"}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      ) : null}
                    </td>

                    {/* Status Select */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      <select
                        value={r.status}
                        onChange={(e) =>
                          updateStatus(
                            r._id,
                            e.target.value as VendorRegistration["status"]
                          )
                        }
                        className={`text-xs font-semibold px-2.5 py-1 rounded-md border focus:outline-none cursor-pointer transition-all ${
                          r.status === "new"
                            ? "bg-amber-50 text-amber-900 border-amber-300"
                            : r.status === "contacted"
                            ? "bg-blue-50 text-blue-900 border-blue-300"
                            : r.status === "converted"
                            ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                            : "bg-stone-100 text-stone-700 border-stone-300"
                        }`}
                      >
                        <option value="new">New</option>
                        <option value="contacted">Contacted</option>
                        <option value="converted">Converted</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td className="py-10 px-4 text-center text-stone-400 font-medium" colSpan={8}>
                    {status === "loading"
                      ? "Loading submissions..."
                      : "No vendor registrations found matching your query."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Clean Tactile Pagination Footer */}
        <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex flex-col md:flex-row items-center justify-between gap-3">
          <div className="text-xs text-stone-600 font-medium text-center md:text-left">
            Showing <span className="font-bold text-stone-900">{totalItems > 0 ? startIndex + 1 : 0}</span> to{" "}
            <span className="font-bold text-stone-900">{endIndex}</span> of{" "}
            <span className="font-bold text-stone-900">{totalItems}</span> submissions
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1.5">
            {/* Previous Page Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1 || status === "loading"}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-stone-300 bg-white hover:bg-stone-100 disabled:opacity-40 font-semibold text-xs text-stone-700 transition-all cursor-pointer shadow-2xs"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* Numeric Page Number Pills */}
            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-7 h-7 rounded-md font-bold text-xs transition-all cursor-pointer ${
                    currentPage === pageNum
                      ? "bg-stone-900 text-white shadow-2xs"
                      : "bg-white text-stone-700 hover:bg-stone-100 border border-stone-300"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
            </div>

            {/* Next Page Button */}
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages || status === "loading"}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-stone-300 bg-white hover:bg-stone-100 disabled:opacity-40 font-semibold text-xs text-stone-700 transition-all cursor-pointer shadow-2xs"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
