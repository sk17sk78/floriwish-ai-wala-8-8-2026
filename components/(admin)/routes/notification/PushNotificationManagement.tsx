"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Bell,
  Send,
  Users,
  UserCheck,
  Globe,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  History,
  Smartphone,
  Monitor,
  Tablet,
  PlusCircle,
  Inbox,
  Search,
  Trash2,
  ToggleLeft,
  ToggleRight,
  FlaskConical,
  ChevronLeft,
  ChevronRight,
  User,
  Filter,
  X,
  Zap,
  Signal,
  AlertTriangle,
  Clock,
  BadgeCheck,
  Copy,
  Check
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Stats {
  totalActive: number;
  totalLoggedIn: number;
  totalGuests: number;
  totalInactive: number;
  totalMobile: number;
  totalDesktop: number;
  totalTablet: number;
}

interface Campaign {
  _id: string;
  title: string;
  message: string;
  imageUrl?: string;
  clickUrl: string;
  targetType: string;
  targetLabel?: string;
  totalSent: number;
  successCount: number;
  failureCount: number;
  invalidCount?: number;
  status?: string;
  sentAt?: string;
  createdAt: string;
}

interface Subscriber {
  _id: string;
  subscriberId: string;
  tokenPreview: string;
  user: { _id: string; name: string; email: string; mobile: string } | null;
  isGuest: boolean;
  deviceType: "mobile" | "desktop" | "tablet";
  browser: string;
  os: string;
  osVersion: string;
  platform: string;
  isActive: boolean;
  subscribedAt: string;
  lastSentAt: string | null;
  lastError: string | null;
  updatedAt: string;
}

interface UserSearchResult {
  userId: string;
  name: string;
  email: string;
  mobile: string;
  devices: { subscriberId: string; deviceType: string; browser: string; os: string; isActive: boolean }[];
}

// ─── Templates ────────────────────────────────────────────────────────────────
const TEMPLATES = [
  { tag: "Order Shipped", title: "🚚 Your Floriwish order has been shipped", message: "Your fresh floral parcel is on its way. Track your delivery status live.", clickUrl: "/user/orders", imageUrl: "" },
  { tag: "Out for Delivery", title: "🎁 Your surprise is arriving today", message: "Our delivery executive is heading to the destination with your hand-crafted gifts.", clickUrl: "/user/orders", imageUrl: "" },
  { tag: "Special Offer", title: "🎉 Special Surprise: Flat ₹299 OFF Today", message: "Use code FLORIWISH299 on premium cakes & flower bouquets. Valid for today only!", clickUrl: "/cakes", imageUrl: "https://d22rebqllszdz8.cloudfront.net/c738cc2b-aab2-472f-925d-c673915cfacc/a35c7f6964a04132.webp" },
  { tag: "New Collection", title: "🌹 New Wedding Jaimala Collection is Live", message: "Explore our latest hand-crafted fresh flower Jaimala & Varmala collection with same-day setup.", clickUrl: "/flower", imageUrl: "" },
  { tag: "Cart Reminder", title: "🛒 You left something special in your cart", message: "Your favourite floral gifts are waiting! Complete your order now before slots fill up.", clickUrl: "/cart", imageUrl: "" }
];

const TARGET_OPTIONS = [
  { id: "all", label: "All Subscribers", desc: "All active devices", icon: <Globe width={14} height={14} /> },
  { id: "loggedin", label: "Logged-in Users", desc: "Registered customers", icon: <UserCheck width={14} height={14} /> },
  { id: "guest", label: "Guest Visitors", desc: "Anonymous browsers", icon: <Users width={14} height={14} /> },
  { id: "mobile", label: "Mobile", desc: "Android & smartphones", icon: <Smartphone width={14} height={14} /> },
  { id: "desktop", label: "Desktop", desc: "Laptops & PCs", icon: <Monitor width={14} height={14} /> },
  { id: "tablet", label: "Tablet", desc: "iPad & tablets", icon: <Tablet width={14} height={14} /> },
  { id: "user", label: "Specific User", desc: "Target by search", icon: <User width={14} height={14} /> }
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function DeviceIcon({ type }: { type: string }) {
  if (type === "mobile") return <Smartphone width={13} height={13} className="text-blue-500" />;
  if (type === "tablet") return <Tablet width={13} height={13} className="text-purple-500" />;
  return <Monitor width={13} height={13} className="text-zinc-500" />;
}

function StatusBadge({ status, failureCount }: { status?: string; failureCount: number }) {
  if (status === "failed" || (failureCount > 0 && status === undefined)) {
    return <span className="px-2 py-0.5 rounded-full bg-red-50 text-red-700 text-[10px] font-semibold">Failed</span>;
  }
  if (status === "partial") {
    return <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold">{failureCount} failed</span>;
  }
  return <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">Sent</span>;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString("en-IN", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function PushNotificationManagement() {
  const [activeTab, setActiveTab] = useState<"compose" | "subscribers" | "history" | "test">("compose");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const [stats, setStats] = useState<Stats>({
    totalActive: 0, totalLoggedIn: 0, totalGuests: 0,
    totalInactive: 0, totalMobile: 0, totalDesktop: 0, totalTablet: 0
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Compose form state
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [clickUrl, setClickUrl] = useState("/");
  const [targetType, setTargetType] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(null);
  const [userSearchQuery, setUserSearchQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<UserSearchResult[]>([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sendFeedback, setSendFeedback] = useState<{ type: "success" | "error"; text: string; data?: any } | null>(null);

  // Subscriber list state
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [subPage, setSubPage] = useState(1);
  const [subTotalPages, setSubTotalPages] = useState(1);
  const [subTotal, setSubTotal] = useState(0);
  const [isLoadingSubscribers, setIsLoadingSubscribers] = useState(false);
  const [subSearch, setSubSearch] = useState("");
  const [subDeviceFilter, setSubDeviceFilter] = useState("all");
  const [subStatusFilter, setSubStatusFilter] = useState("active");
  const [subUserTypeFilter, setSubUserTypeFilter] = useState("all");
  const [subActionLoading, setSubActionLoading] = useState<string | null>(null);
  const [subActionFeedback, setSubActionFeedback] = useState<{ id: string; type: "success" | "error"; text: string } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Test notification state
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const userSearchRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Load Stats ─────────────────────────────────────────────────────────────
  const loadStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const res = await fetch("/api/admin/notifications/stats");
      const data = await res.json();
      if (data.success) {
        setStats(data.stats);
        setCampaigns(data.campaigns || []);
      }
    } catch (err) {
      console.error("Failed to load push stats:", err);
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => { loadStats(); }, [loadStats]);

  // ─── Load Subscribers ────────────────────────────────────────────────────────
  const loadSubscribers = useCallback(async (page = 1) => {
    setIsLoadingSubscribers(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: "20",
        search: subSearch,
        deviceType: subDeviceFilter,
        status: subStatusFilter,
        userType: subUserTypeFilter
      });
      const res = await fetch(`/api/admin/notifications/subscribers?${params}`);
      const data = await res.json();
      if (data.success) {
        setSubscribers(data.subscribers);
        setSubTotalPages(data.pagination.totalPages);
        setSubTotal(data.pagination.total);
        setSubPage(page);
      }
    } catch (err) {
      console.error("Failed to load subscribers:", err);
    } finally {
      setIsLoadingSubscribers(false);
    }
  }, [subSearch, subDeviceFilter, subStatusFilter, subUserTypeFilter]);

  useEffect(() => {
    if (activeTab === "subscribers") {
      loadSubscribers(1);
    }
  }, [activeTab, loadSubscribers]);

  // ─── User Search (debounced) ─────────────────────────────────────────────────
  useEffect(() => {
    if (targetType !== "user") { setUserSearchResults([]); return; }
    if (userSearchQuery.length < 2) { setUserSearchResults([]); return; }

    if (userSearchRef.current) clearTimeout(userSearchRef.current);
    userSearchRef.current = setTimeout(async () => {
      setIsSearchingUsers(true);
      try {
        const res = await fetch(`/api/admin/notifications/search-users?q=${encodeURIComponent(userSearchQuery)}`);
        const data = await res.json();
        if (data.success) setUserSearchResults(data.results);
      } catch { /* ignore */ } finally {
        setIsSearchingUsers(false);
      }
    }, 350);
  }, [userSearchQuery, targetType]);

  // ─── Send Notification ───────────────────────────────────────────────────────
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setSendFeedback({ type: "error", text: "Please provide both a Title and Message." });
      return;
    }
    if (targetType === "user" && !selectedUser) {
      setSendFeedback({ type: "error", text: "Please search and select a target user." });
      return;
    }

    setIsSending(true);
    setSendFeedback(null);

    try {
      const res = await fetch("/api/admin/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          message: message.trim(),
          imageUrl: imageUrl.trim() || undefined,
          clickUrl: clickUrl.trim() || "/",
          targetType,
          targetUserId: targetType === "user" ? selectedUser?.userId : undefined
        })
      });

      const data = await res.json();
      if (data.success) {
        setSendFeedback({ type: "success", text: data.message || "Notification dispatched successfully.", data: data.data });
        setTitle(""); setMessage(""); setImageUrl(""); setClickUrl("/");
        loadStats();
      } else {
        setSendFeedback({ type: "error", text: data.message || "Failed to dispatch notification." });
      }
    } catch (err: any) {
      setSendFeedback({ type: "error", text: err.message || "Network error." });
    } finally {
      setIsSending(false);
    }
  };

  // ─── Subscriber Actions ──────────────────────────────────────────────────────
  const handleToggleSubscriber = async (sub: Subscriber) => {
    setSubActionLoading(sub._id);
    try {
      const res = await fetch(`/api/admin/notifications/subscribers/${sub._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !sub.isActive })
      });
      const data = await res.json();
      setSubActionFeedback({ id: sub._id, type: data.success ? "success" : "error", text: data.message });
      if (data.success) loadSubscribers(subPage);
    } catch { setSubActionFeedback({ id: sub._id, type: "error", text: "Request failed." }); }
    finally { setSubActionLoading(null); setTimeout(() => setSubActionFeedback(null), 3000); }
  };

  const handleDeleteSubscriber = async (sub: Subscriber) => {
    if (!confirm(`Delete this subscriber? This action cannot be undone.`)) return;
    setSubActionLoading(sub._id);
    try {
      const res = await fetch(`/api/admin/notifications/subscribers/${sub._id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSubscribers(prev => prev.filter(s => s._id !== sub._id));
        loadStats();
      }
    } catch { /* ignore */ }
    finally { setSubActionLoading(null); }
  };

  const handleTestSubscriber = async (sub: Subscriber) => {
    setSubActionLoading(`test_${sub._id}`);
    try {
      const res = await fetch(`/api/admin/notifications/subscribers/${sub._id}`, { method: "POST" });
      const data = await res.json();
      setSubActionFeedback({ id: sub._id, type: data.success ? "success" : "error", text: data.message });
      if (!data.success) loadSubscribers(subPage); // Refresh if token became invalid
    } catch { setSubActionFeedback({ id: sub._id, type: "error", text: "Request failed." }); }
    finally { setSubActionLoading(null); setTimeout(() => setSubActionFeedback(null), 4000); }
  };

  // ─── Test Notification (self) ────────────────────────────────────────────────
  const handleSelfTest = async () => {
    setTestLoading(true);
    setTestResult(null);
    try {
      if (!("Notification" in window)) {
        setTestResult({ success: false, message: "Notifications not supported in this browser." });
        return;
      }
      if (Notification.permission !== "granted") {
        setTestResult({ success: false, message: "Notification permission is not granted for this browser." });
        return;
      }

      // Get FCM token for this browser
      const { requestFCMToken: reqToken } = await import("@/config/firebase");
      const result = await reqToken();
      if (!result.token) {
        setTestResult({ success: false, message: `Could not get FCM token: ${result.error || "Unknown error"}` });
        return;
      }

      // Register it first
      await fetch("/api/frontend/notifications/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: result.token, userAgent: navigator.userAgent })
      });

      // Find it in DB and send test
      const subRes = await fetch(`/api/admin/notifications/subscribers?search=${result.token.substring(0, 8)}&limit=5`);
      const subData = await subRes.json();
      const mySub = subData.subscribers?.[0];

      if (!mySub) {
        // Direct send via /send API to this single token
        const sendRes = await fetch("/api/admin/notifications/send", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: "🔔 Floriwish Admin Test", message: "Test notification from your admin panel.", clickUrl: "/", targetType: "all" })
        });
        const sendData = await sendRes.json();
        setTestResult({ success: sendData.success, message: sendData.message });
      } else {
        const testRes = await fetch(`/api/admin/notifications/subscribers/${mySub._id}`, { method: "POST" });
        const testData = await testRes.json();
        setTestResult({ success: testData.success, message: testData.message });
      }
    } catch (err: any) {
      setTestResult({ success: false, message: err.message || "Test failed." });
    } finally {
      setTestLoading(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-zinc-900 font-sans">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Bell width={14} height={14} className="text-zinc-700" />
            <span>Marketing & Communications</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Push Notifications</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Broadcast web notifications to subscribers and manage devices.</p>
        </div>

        {/* Stats Pills */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: "Active", value: stats.totalActive, color: "text-emerald-700" },
            { label: "Mobile", value: stats.totalMobile, color: "text-blue-700" },
            { label: "Desktop", value: stats.totalDesktop, color: "text-zinc-700" },
            { label: "Tablet", value: stats.totalTablet, color: "text-purple-700" },
            { label: "Inactive", value: stats.totalInactive, color: "text-red-600" }
          ].map(s => (
            <div key={s.label} className="px-3 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs">
              <span className="text-zinc-500">{s.label}: </span>
              <span className={`font-semibold ${s.color}`}>{s.value.toLocaleString()}</span>
            </div>
          ))}
          <button onClick={loadStats} disabled={isLoadingStats} title="Refresh"
            className="p-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-lg text-zinc-600 transition-colors disabled:opacity-50 cursor-pointer">
            <RefreshCw width={14} height={14} className={isLoadingStats ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-zinc-200 pb-px overflow-x-auto">
        {[
          { id: "compose", label: "New Broadcast", icon: <PlusCircle width={15} height={15} /> },
          { id: "subscribers", label: "Subscribers", icon: <Users width={15} height={15} />, badge: stats.totalActive },
          { id: "history", label: "Campaign History", icon: <History width={15} height={15} />, badge: campaigns.length },
          { id: "test", label: "Test Notification", icon: <FlaskConical width={15} height={15} /> }
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id ? "border-zinc-900 text-zinc-900" : "border-transparent text-zinc-500 hover:text-zinc-800"}`}>
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && tab.badge > 0 && (
              <span className="ml-1 px-1.5 py-0.5 text-[10px] rounded-full bg-zinc-100 text-zinc-700 font-semibold">{tab.badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* ─── TAB 1: COMPOSE ─────────────────────────────────────────────────────── */}
      {activeTab === "compose" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Form */}
          <div className="lg:col-span-7 bg-white border border-zinc-200/90 rounded-xl p-6 shadow-xs space-y-6">
            {/* Templates */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Quick Templates</label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((t, idx) => (
                  <button key={idx} type="button" onClick={() => { setTitle(t.title); setMessage(t.message); setClickUrl(t.clickUrl); setImageUrl(t.imageUrl); setSendFeedback(null); }}
                    className="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-700 rounded-lg transition-colors cursor-pointer">
                    {t.tag}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-5">
              {/* Target Audience */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">Target Audience</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-2">
                  {TARGET_OPTIONS.map(opt => (
                    <button key={opt.id} type="button" onClick={() => { setTargetType(opt.id); setSelectedUser(null); setSendFeedback(null); }}
                      className={`p-2.5 text-left rounded-xl border transition-all cursor-pointer ${
                        targetType === opt.id ? "border-zinc-900 bg-zinc-50/80 ring-1 ring-zinc-900" : "border-zinc-200 bg-white hover:bg-zinc-50/60"}`}>
                      <div className="flex items-center gap-1.5 mb-0.5">{opt.icon}
                        <p className="text-xs font-semibold text-zinc-900">{opt.label}</p>
                      </div>
                      <p className="text-[10px] text-zinc-500">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* User Search (for "user" target) */}
              {targetType === "user" && (
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-zinc-700">Search User (name / email / phone)</label>
                  <div className="relative">
                    <Search width={14} height={14} className="absolute left-3 top-3 text-zinc-400" />
                    <input type="text" placeholder="e.g. Salman, user@email.com, 9876..." value={userSearchQuery}
                      onChange={e => setUserSearchQuery(e.target.value)}
                      className="w-full pl-8 pr-3 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900" />
                    {isSearchingUsers && <RefreshCw width={13} height={13} className="absolute right-3 top-3 animate-spin text-zinc-400" />}
                  </div>
                  {userSearchResults.length > 0 && !selectedUser && (
                    <div className="border border-zinc-200 rounded-lg bg-white divide-y divide-zinc-100 max-h-48 overflow-y-auto shadow-sm">
                      {userSearchResults.map(u => (
                        <button key={u.userId} type="button" onClick={() => { setSelectedUser(u); setUserSearchResults([]); }}
                          className="w-full px-3 py-2.5 text-left hover:bg-zinc-50 transition-colors cursor-pointer">
                          <p className="text-xs font-semibold text-zinc-900">{u.name}</p>
                          <p className="text-[11px] text-zinc-500">{u.email} · {u.mobile} · {u.devices.length} device(s)</p>
                        </button>
                      ))}
                    </div>
                  )}
                  {selectedUser && (
                    <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
                      <div>
                        <p className="text-xs font-semibold text-emerald-800">{selectedUser.name}</p>
                        <p className="text-[11px] text-emerald-600">{selectedUser.devices.length} device(s) · {selectedUser.email}</p>
                      </div>
                      <button type="button" onClick={() => { setSelectedUser(null); setUserSearchQuery(""); }}
                        className="p-1 text-emerald-600 hover:text-emerald-800 cursor-pointer"><X width={13} height={13} /></button>
                    </div>
                  )}
                </div>
              )}

              {/* Title */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 mb-1.5">
                  <label htmlFor="notif-title">Notification Title *</label>
                  <span className="text-zinc-400 font-normal">{title.length}/100</span>
                </div>
                <input id="notif-title" type="text" required maxLength={100}
                  placeholder="e.g. 🌹 New Wedding Jaimala Collection is Live"
                  value={title} onChange={e => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 placeholder:text-zinc-400" />
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 mb-1.5">
                  <label htmlFor="notif-message">Message Body *</label>
                  <span className="text-zinc-400 font-normal">{message.length}/250</span>
                </div>
                <textarea id="notif-message" rows={3} required maxLength={250}
                  placeholder="e.g. Explore our latest fresh flower Jaimala collection with same-day setup."
                  value={message} onChange={e => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 placeholder:text-zinc-400 resize-none" />
              </div>

              {/* URL + Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="notif-url" className="block text-xs font-semibold text-zinc-700 mb-1.5">Click Destination URL</label>
                  <input id="notif-url" type="text" placeholder="/cakes or /wedding-jaimala"
                    value={clickUrl} onChange={e => setClickUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 placeholder:text-zinc-400" />
                </div>
                <div>
                  <label htmlFor="notif-image" className="block text-xs font-semibold text-zinc-700 mb-1.5">Banner Image URL (Optional)</label>
                  <input id="notif-image" type="url" placeholder="https://.../banner.webp"
                    value={imageUrl} onChange={e => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 placeholder:text-zinc-400" />
                </div>
              </div>

              {/* Feedback */}
              {sendFeedback && (
                <div className={`p-3.5 rounded-lg text-sm flex items-start gap-2.5 ${
                  sendFeedback.type === "success" ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-rose-50 text-rose-800 border border-rose-200"}`}>
                  {sendFeedback.type === "success" ? <CheckCircle2 width={18} height={18} className="shrink-0 text-emerald-600 mt-0.5" /> : <AlertCircle width={18} height={18} className="shrink-0 text-rose-600 mt-0.5" />}
                  <div>
                    <p>{sendFeedback.text}</p>
                    {sendFeedback.data && (
                      <div className="mt-1.5 flex gap-3 text-xs">
                        <span>✓ Sent: <strong>{sendFeedback.data.successCount}</strong></span>
                        {sendFeedback.data.failureCount > 0 && <span>✕ Failed: <strong>{sendFeedback.data.failureCount}</strong></span>}
                        {sendFeedback.data.invalidTokens?.length > 0 && <span>🗑 Invalid cleaned: <strong>{sendFeedback.data.invalidTokens.length}</strong></span>}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button type="submit" disabled={isSending}
                className="w-full py-3 px-6 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
                <Send width={15} height={15} />
                <span>{isSending ? "Dispatching..." : "Send Broadcast Now"}</span>
              </button>
            </form>
          </div>

          {/* Preview */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">Live Preview</span>
                <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-md">
                  {(["desktop", "mobile"] as const).map(d => (
                    <button key={d} type="button" onClick={() => setPreviewDevice(d)}
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${previewDevice === d ? "bg-white text-zinc-900 shadow-xs" : "text-zinc-500 hover:text-zinc-800"}`}>
                      {d === "desktop" ? "Desktop" : "Mobile"}
                    </button>
                  ))}
                </div>
              </div>

              {previewDevice === "desktop" ? (
                <div className="bg-white border border-zinc-300 rounded-xl p-3.5 shadow-md space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-rose-600 flex items-center justify-center text-[7px] text-white font-bold">F</div>
                      <span className="font-medium text-zinc-700">floriwish.com</span>
                    </div>
                    <span>just now</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                      <Bell width={18} height={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">{title || "Notification Title Preview"}</p>
                      <p className="text-[11px] text-zinc-600 mt-0.5 line-clamp-2 leading-snug">{message || "Your message body will be displayed here."}</p>
                    </div>
                  </div>
                  {imageUrl && (
                    <div className="w-full h-32 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLElement).style.display = "none"; }} />
                    </div>
                  )}
                  <div className="pt-1.5 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Target: {clickUrl || "/"}</span>
                    <span>Chrome / Edge / Firefox</span>
                  </div>
                </div>
              ) : (
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-rose-600 flex items-center justify-center text-[8px] text-white font-bold">F</div>
                      <span className="font-semibold text-zinc-800">Floriwish</span>
                    </div>
                    <span>now</span>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-900">{title || "Notification Title Preview"}</p>
                    <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">{message || "Your message body will be displayed here."}</p>
                  </div>
                  {imageUrl && (
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-zinc-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={e => { (e.target as HTMLElement).style.display = "none"; }} />
                    </div>
                  )}
                  <p className="text-[10px] text-zinc-400">Android Chrome · Tap opens {clickUrl || "/"}</p>
                </div>
              )}
              <p className="text-[11px] text-zinc-500 text-center">
                iOS requires Add-to-Home-Screen (PWA) for Web Push support.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: SUBSCRIBERS ──────────────────────────────────────────────────── */}
      {activeTab === "subscribers" && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search width={14} height={14} className="absolute left-3 top-3 text-zinc-400" />
              <input type="text" placeholder="Search by name, email, ID..."
                value={subSearch} onChange={e => { setSubSearch(e.target.value); }}
                onKeyDown={e => e.key === "Enter" && loadSubscribers(1)}
                className="w-full pl-8 pr-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900" />
            </div>
            <select value={subDeviceFilter} onChange={e => setSubDeviceFilter(e.target.value)}
              className="px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none bg-white">
              <option value="all">All Devices</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
            </select>
            <select value={subStatusFilter} onChange={e => setSubStatusFilter(e.target.value)}
              className="px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none bg-white">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="all">All Status</option>
            </select>
            <select value={subUserTypeFilter} onChange={e => setSubUserTypeFilter(e.target.value)}
              className="px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none bg-white">
              <option value="all">All Users</option>
              <option value="loggedin">Logged-in</option>
              <option value="guest">Guest</option>
            </select>
            <button onClick={() => loadSubscribers(1)} disabled={isLoadingSubscribers}
              className="px-4 py-2 bg-zinc-900 text-white text-sm rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-2">
              <Filter width={13} height={13} />
              <span>Apply</span>
            </button>
          </div>

          <div className="text-xs text-zinc-500">
            Showing {subscribers.length} of {subTotal.toLocaleString()} subscribers (page {subPage}/{subTotalPages})
          </div>

          {/* Table */}
          <div className="bg-white border border-zinc-200/90 rounded-xl overflow-hidden shadow-xs">
            {isLoadingSubscribers ? (
              <div className="py-16 flex items-center justify-center">
                <RefreshCw width={20} height={20} className="animate-spin text-zinc-400" />
              </div>
            ) : subscribers.length === 0 ? (
              <div className="py-16 text-center space-y-2">
                <Inbox width={36} height={36} className="mx-auto text-zinc-300 stroke-1" />
                <p className="text-sm font-medium text-zinc-600">No subscribers found</p>
                <p className="text-xs text-zinc-400">Try adjusting your filters.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-zinc-50 text-zinc-700 font-semibold border-b border-zinc-200">
                    <tr>
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Subscriber ID</th>
                      <th className="py-3 px-4">Device</th>
                      <th className="py-3 px-4">Browser / OS</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Last Active</th>
                      <th className="py-3 px-4 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 text-zinc-600">
                    {subscribers.map(sub => (
                      <tr key={sub._id} className={`hover:bg-zinc-50/50 ${!sub.isActive ? "opacity-60" : ""}`}>
                        <td className="py-3 px-4">
                          {sub.user ? (
                            <div>
                              <p className="font-semibold text-zinc-900 text-xs">{sub.user.name}</p>
                              <p className="text-[10px] text-zinc-500">{sub.user.email}</p>
                              {sub.user.mobile && <p className="text-[10px] text-zinc-400">{sub.user.mobile}</p>}
                            </div>
                          ) : (
                            <span className="text-zinc-400 italic">Guest</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span
                              className="font-mono text-[11px] text-zinc-700 bg-zinc-100/90 hover:bg-zinc-200/80 px-2 py-0.5 rounded border border-zinc-200 select-all cursor-text"
                              title={`Full ID: ${sub.subscriberId} (Click to select)`}
                            >
                              {sub.subscriberId}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard.writeText(sub.subscriberId);
                                setCopiedId(sub.subscriberId);
                                setTimeout(() => setCopiedId(null), 2000);
                              }}
                              title="Copy Subscriber ID"
                              className="p-1 text-zinc-400 hover:text-zinc-800 hover:bg-zinc-100 rounded transition-colors cursor-pointer shrink-0"
                            >
                              {copiedId === sub.subscriberId ? (
                                <Check width={13} height={13} className="text-emerald-600 animate-in zoom-in-50 duration-150" />
                              ) : (
                                <Copy width={13} height={13} />
                              )}
                            </button>
                          </div>
                          {copiedId === sub.subscriberId && (
                            <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">✓ Copied to clipboard!</p>
                          )}
                          {sub.lastError && (
                            <p className="text-[10px] text-red-500 mt-0.5 truncate max-w-[160px]" title={sub.lastError}>
                              ⚠ {sub.lastError}
                            </p>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <DeviceIcon type={sub.deviceType} />
                            <span className="capitalize">{sub.deviceType}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p>{sub.browser}</p>
                          <p className="text-[10px] text-zinc-400">{sub.os} {sub.osVersion}</p>
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            sub.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                            {sub.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-500 whitespace-nowrap">
                          {sub.lastSentAt ? timeAgo(sub.lastSentAt) : sub.updatedAt ? timeAgo(sub.updatedAt) : "—"}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center justify-center gap-1">
                            {/* Test */}
                            <button onClick={() => handleTestSubscriber(sub)} disabled={!!subActionLoading || !sub.isActive}
                              title="Send test notification" className="p-1.5 text-zinc-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors cursor-pointer disabled:opacity-40">
                              {subActionLoading === `test_${sub._id}` ? <RefreshCw width={13} height={13} className="animate-spin" /> : <Zap width={13} height={13} />}
                            </button>
                            {/* Toggle */}
                            <button onClick={() => handleToggleSubscriber(sub)} disabled={!!subActionLoading}
                              title={sub.isActive ? "Disable subscriber" : "Enable subscriber"}
                              className="p-1.5 text-zinc-500 hover:text-blue-600 hover:bg-blue-50 rounded-md transition-colors cursor-pointer disabled:opacity-40">
                              {subActionLoading === sub._id ? <RefreshCw width={13} height={13} className="animate-spin" /> : sub.isActive ? <ToggleRight width={13} height={13} /> : <ToggleLeft width={13} height={13} />}
                            </button>
                            {/* Delete */}
                            <button onClick={() => handleDeleteSubscriber(sub)} disabled={!!subActionLoading}
                              title="Delete subscriber" className="p-1.5 text-zinc-500 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors cursor-pointer disabled:opacity-40">
                              <Trash2 width={13} height={13} />
                            </button>
                          </div>
                          {subActionFeedback?.id === sub._id && (
                            <p className={`text-[10px] mt-1 text-center ${subActionFeedback.type === "success" ? "text-emerald-600" : "text-red-600"}`}>
                              {subActionFeedback.text.slice(0, 40)}
                            </p>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          {subTotalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button onClick={() => loadSubscribers(subPage - 1)} disabled={subPage <= 1 || isLoadingSubscribers}
                className="p-2 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 cursor-pointer">
                <ChevronLeft width={14} height={14} />
              </button>
              <span className="text-xs text-zinc-600">Page {subPage} of {subTotalPages}</span>
              <button onClick={() => loadSubscribers(subPage + 1)} disabled={subPage >= subTotalPages || isLoadingSubscribers}
                className="p-2 border border-zinc-200 rounded-lg text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 cursor-pointer">
                <ChevronRight width={14} height={14} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: CAMPAIGN HISTORY ─────────────────────────────────────────────── */}
      {activeTab === "history" && (
        <div className="bg-white border border-zinc-200/90 rounded-xl overflow-hidden shadow-xs">
          {campaigns.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Inbox width={36} height={36} className="mx-auto text-zinc-300 stroke-1" />
              <p className="text-sm font-medium text-zinc-600">No broadcasts sent yet</p>
              <p className="text-xs text-zinc-400">Dispatched push notification campaigns will be logged here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-700 font-semibold border-b border-zinc-200">
                  <tr>
                    <th className="py-3 px-4">Sent At</th>
                    <th className="py-3 px-4">Title & Message</th>
                    <th className="py-3 px-4">Audience</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4 text-center">Targeted</th>
                    <th className="py-3 px-4 text-center">Success</th>
                    <th className="py-3 px-4 text-center">Failed</th>
                    <th className="py-3 px-4 text-center">Invalid</th>
                    <th className="py-3 px-4 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-600">
                  {campaigns.map(camp => (
                    <tr key={camp._id} className="hover:bg-zinc-50/50">
                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-500">
                        {formatDate(camp.sentAt || camp.createdAt)}
                      </td>
                      <td className="py-3.5 px-4 max-w-xs">
                        <p className="font-semibold text-zinc-900 truncate">{camp.title}</p>
                        <p className="text-zinc-500 truncate text-[11px]">{camp.message}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[11px] font-medium">
                          {camp.targetLabel || camp.targetType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-500 truncate max-w-[120px]">{camp.clickUrl}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-zinc-900">{camp.totalSent}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">{camp.successCount}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-red-500">{camp.failureCount}</td>
                      <td className="py-3.5 px-4 text-center font-semibold text-amber-500">{camp.invalidCount ?? 0}</td>
                      <td className="py-3.5 px-4 text-center">
                        <StatusBadge status={camp.status} failureCount={camp.failureCount} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 4: TEST NOTIFICATION ────────────────────────────────────────────── */}
      {activeTab === "test" && (
        <div className="max-w-lg mx-auto bg-white border border-zinc-200/90 rounded-xl p-8 shadow-xs space-y-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 border border-zinc-200 flex items-center justify-center mx-auto">
            <FlaskConical width={28} height={28} className="text-zinc-600" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-zinc-900">Test Notification</h2>
            <p className="text-sm text-zinc-500 mt-1">
              Send a test notification to your current browser/device to verify the push pipeline is working end-to-end.
            </p>
          </div>

          <div className="bg-zinc-50 rounded-xl p-4 text-left text-xs text-zinc-600 space-y-1.5">
            <p className="font-semibold text-zinc-800 mb-2">Prerequisites:</p>
            <p>✓ You must allow notifications in this browser</p>
            <p>✓ HTTPS connection required</p>
            <p>✓ Firebase Admin SDK must be configured in .env</p>
            <p>✗ iOS Safari (non-PWA) is not supported via FCM</p>
          </div>

          <button onClick={handleSelfTest} disabled={testLoading}
            className="w-full py-3 px-6 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm rounded-xl transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50">
            {testLoading ? <RefreshCw width={15} height={15} className="animate-spin" /> : <Zap width={15} height={15} />}
            <span>{testLoading ? "Sending..." : "Send Test to This Browser"}</span>
          </button>

          {testResult && (
            <div className={`p-4 rounded-xl text-sm flex items-start gap-3 text-left ${
              testResult.success ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-rose-50 border border-rose-200 text-rose-800"}`}>
              {testResult.success
                ? <CheckCircle2 width={18} height={18} className="shrink-0 text-emerald-600 mt-0.5" />
                : <AlertCircle width={18} height={18} className="shrink-0 text-rose-600 mt-0.5" />}
              <div>
                <p className="font-semibold">{testResult.success ? "✓ Test Successful" : "✕ Test Failed"}</p>
                <p className="text-xs mt-0.5 opacity-80">{testResult.message}</p>
              </div>
            </div>
          )}

          <div className="text-[11px] text-zinc-400">
            Note: Web Push delivery to device is best-effort. Actual notification appearance depends on browser/OS notification settings.
          </div>
        </div>
      )}
    </div>
  );
}
