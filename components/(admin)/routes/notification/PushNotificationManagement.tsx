"use client";

import { useState, useEffect, useMemo } from "react";
import {
  Bell,
  Send,
  Sparkles,
  Users,
  UserCheck,
  Globe,
  Image as ImageIcon,
  Link as LinkIcon,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Eye,
  History,
  Smartphone,
  Monitor,
  ExternalLink,
  PlusCircle,
  Inbox
} from "lucide-react";

interface Stats {
  totalActive: number;
  totalRegistered: number;
  totalGuests: number;
}

interface Campaign {
  _id: string;
  title: string;
  message: string;
  imageUrl?: string;
  clickUrl: string;
  targetType: string;
  totalSent: number;
  successCount: number;
  failureCount: number;
  createdAt: string;
}

const TEMPLATES = [
  {
    tag: "Order Shipped",
    title: "🚚 Your Floriwish order has been shipped",
    message: "Your fresh floral parcel is on its way. Track your delivery status live.",
    clickUrl: "/user/orders",
    imageUrl: ""
  },
  {
    tag: "Out for Delivery",
    title: "🎁 Your surprise is arriving today",
    message: "Our delivery executive is heading to the destination with your hand-crafted gifts.",
    clickUrl: "/user/orders",
    imageUrl: ""
  },
  {
    tag: "Special Offer",
    title: "🎉 Special Surprise: Flat ₹299 OFF Today",
    message: "Use code FLORIWISH299 on premium cakes & flower bouquets. Valid for today only!",
    clickUrl: "/cakes",
    imageUrl: "https://d22rebqllszdz8.cloudfront.net/c738cc2b-aab2-472f-925d-c673915cfacc/a35c7f6964a04132.webp"
  },
  {
    tag: "New Collection",
    title: "🌹 New Wedding Jaimala Collection is Live",
    message: "Explore our latest hand-crafted fresh flower Jaimala & Varmala collection with same-day setup.",
    clickUrl: "/flower",
    imageUrl: ""
  },
  {
    tag: "Cart Reminder",
    title: "🛒 You left something special in your cart",
    message: "Your favourite floral gifts are waiting! Complete your order now before slots fill up.",
    clickUrl: "/cart",
    imageUrl: ""
  }
];

export default function PushNotificationManagement() {
  const [activeTab, setActiveTab] = useState<"compose" | "history">("compose");
  const [previewDevice, setPreviewDevice] = useState<"desktop" | "mobile">("desktop");

  const [stats, setStats] = useState<Stats>({
    totalActive: 0,
    totalRegistered: 0,
    totalGuests: 0
  });
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [clickUrl, setClickUrl] = useState("/");
  const [targetType, setTargetType] = useState<"all" | "user" | "guest">("all");
  const [targetUserId, setTargetUserId] = useState("");

  // Submit State
  const [isSending, setIsSending] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadData = async () => {
    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const applyTemplate = (t: (typeof TEMPLATES)[0]) => {
    setTitle(t.title);
    setMessage(t.message);
    setClickUrl(t.clickUrl);
    setImageUrl(t.imageUrl || "");
    setFeedback(null);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !message.trim()) {
      setFeedback({
        type: "error",
        text: "Please provide both a Title and Message."
      });
      return;
    }

    setIsSending(true);
    setFeedback(null);

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
          targetUserId: targetType === "user" ? targetUserId.trim() : undefined
        })
      });

      const data = await res.json();

      if (data.success) {
        setFeedback({
          type: "success",
          text: data.message || "Notification dispatched successfully."
        });
        setTitle("");
        setMessage("");
        setImageUrl("");
        setClickUrl("/");
        loadData();
      } else {
        setFeedback({
          type: "error",
          text: data.message || "Failed to dispatch notification."
        });
      }
    } catch (err: any) {
      setFeedback({
        type: "error",
        text: err.message || "Network communication error."
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 text-zinc-900 font-sans">
      {/* 1. Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200">
        <div>
          <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">
            <Bell width={14} height={14} className="text-zinc-700" />
            <span>Marketing & Communications</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Push Notifications
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            Broadcast web notifications to active customer browsers and track campaign delivery.
          </p>
        </div>

        {/* Live Metrics Pills */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs">
            <span className="text-zinc-500">Active Devices: </span>
            <span className="font-semibold text-zinc-900">
              {stats.totalActive.toLocaleString()}
            </span>
          </div>
          <div className="px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs">
            <span className="text-zinc-500">Customers: </span>
            <span className="font-semibold text-zinc-900">
              {stats.totalRegistered.toLocaleString()}
            </span>
          </div>
          <div className="px-3.5 py-1.5 bg-zinc-50 border border-zinc-200 rounded-lg text-xs">
            <span className="text-zinc-500">Guests: </span>
            <span className="font-semibold text-zinc-900">
              {stats.totalGuests.toLocaleString()}
            </span>
          </div>
          <button
            onClick={loadData}
            disabled={isLoading}
            title="Refresh statistics"
            className="p-2 border border-zinc-200 bg-white hover:bg-zinc-50 rounded-lg text-zinc-600 transition-colors disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw
              width={14}
              height={14}
              className={isLoading ? "animate-spin" : ""}
            />
          </button>
        </div>
      </div>

      {/* 2. Clean Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-px">
        <button
          onClick={() => setActiveTab("compose")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "compose"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <PlusCircle width={16} height={16} />
          <span>New Broadcast</span>
        </button>
        <button
          onClick={() => setActiveTab("history")}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
            activeTab === "history"
              ? "border-zinc-900 text-zinc-900"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <History width={16} height={16} />
          <span>Campaign History</span>
          {campaigns.length > 0 && (
            <span className="ml-1 px-2 py-0.5 text-[11px] rounded-full bg-zinc-100 text-zinc-700 font-semibold">
              {campaigns.length}
            </span>
          )}
        </button>
      </div>

      {/* 3. Tab: Compose Notification */}
      {activeTab === "compose" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start pt-2">
          {/* Left Form (7 Cols) */}
          <div className="lg:col-span-7 bg-white border border-zinc-200/90 rounded-xl p-6 sm:p-7 shadow-xs space-y-6">
            {/* Quick Templates */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                Quick Preset Templates
              </label>
              <div className="flex flex-wrap gap-2">
                {TEMPLATES.map((t, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => applyTemplate(t)}
                    className="px-3 py-1.5 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-xs font-medium text-zinc-700 rounded-lg transition-colors cursor-pointer"
                  >
                    {t.tag}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSend} className="space-y-5">
              {/* Target Selector */}
              <div>
                <label className="block text-xs font-semibold text-zinc-700 uppercase tracking-wider mb-2">
                  Target Audience
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { id: "all", label: "All Subscribers", desc: "All active devices" },
                    { id: "user", label: "Specific User", desc: "Target by User ID" },
                    { id: "guest", label: "Guests Only", desc: "Anonymous browsers" }
                  ].map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setTargetType(item.id as any)}
                      className={`p-3 text-left rounded-xl border transition-all cursor-pointer ${
                        targetType === item.id
                          ? "border-zinc-900 bg-zinc-50/80 text-zinc-900 ring-1 ring-zinc-900"
                          : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50/60"
                      }`}
                    >
                      <p className="text-xs font-semibold text-zinc-900">{item.label}</p>
                      <p className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {targetType === "user" && (
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1.5">
                    Customer User ID *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter customer MongoDB ObjectId (e.g. 64b8f...)"
                    value={targetUserId}
                    onChange={(e) => setTargetUserId(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900"
                  />
                </div>
              )}

              {/* Title */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 mb-1.5">
                  <label htmlFor="title-input">Notification Title *</label>
                  <span className="text-zinc-400 font-normal">{title.length}/100</span>
                </div>
                <input
                  id="title-input"
                  type="text"
                  required
                  maxLength={100}
                  placeholder="e.g. 🌹 New Wedding Jaimala Collection is Live"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900 placeholder:text-zinc-400"
                />
              </div>

              {/* Message */}
              <div>
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-700 mb-1.5">
                  <label htmlFor="message-input">Message Body *</label>
                  <span className="text-zinc-400 font-normal">{message.length}/250</span>
                </div>
                <textarea
                  id="message-input"
                  rows={3}
                  required
                  maxLength={250}
                  placeholder="e.g. Explore our latest fresh flower Jaimala collection with same-day setup."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900 placeholder:text-zinc-400 resize-none"
                />
              </div>

              {/* Destination URL & Banner Image */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="url-input"
                    className="block text-xs font-semibold text-zinc-700 mb-1.5"
                  >
                    Click Destination URL
                  </label>
                  <div className="relative">
                    <input
                      id="url-input"
                      type="text"
                      placeholder="/cakes or /wedding-jaimala"
                      value={clickUrl}
                      onChange={(e) => setClickUrl(e.target.value)}
                      className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900 placeholder:text-zinc-400"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="image-input"
                    className="block text-xs font-semibold text-zinc-700 mb-1.5"
                  >
                    Banner Image URL (Optional)
                  </label>
                  <input
                    id="image-input"
                    type="url"
                    placeholder="https://.../banner.webp"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-zinc-900 text-zinc-900 placeholder:text-zinc-400"
                  />
                </div>
              </div>

              {/* Feedback Alert */}
              {feedback && (
                <div
                  className={`p-3.5 rounded-lg text-sm flex items-start gap-2.5 ${
                    feedback.type === "success"
                      ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      : "bg-rose-50 text-rose-800 border border-rose-200"
                  }`}
                >
                  {feedback.type === "success" ? (
                    <CheckCircle2 width={18} height={18} className="shrink-0 text-emerald-600 mt-0.5" />
                  ) : (
                    <AlertCircle width={18} height={18} className="shrink-0 text-rose-600 mt-0.5" />
                  )}
                  <span>{feedback.text}</span>
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSending}
                  className="w-full py-3 px-6 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Send width={15} height={15} />
                  <span>{isSending ? "Dispatching..." : "Send Broadcast Now"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Live Preview (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="bg-white border border-zinc-200/90 rounded-xl p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                <span className="text-xs font-semibold text-zinc-700 uppercase tracking-wider">
                  Live Preview
                </span>
                <div className="flex items-center gap-1 bg-zinc-100 p-0.5 rounded-md">
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("desktop")}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                      previewDevice === "desktop"
                        ? "bg-white text-zinc-900 shadow-xs"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    Desktop
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewDevice("mobile")}
                    className={`px-2.5 py-1 text-xs font-medium rounded transition-colors cursor-pointer ${
                      previewDevice === "mobile"
                        ? "bg-white text-zinc-900 shadow-xs"
                        : "text-zinc-500 hover:text-zinc-800"
                    }`}
                  >
                    Mobile
                  </button>
                </div>
              </div>

              {/* Realistic Notification Card */}
              {previewDevice === "desktop" ? (
                /* Desktop Chrome Style Card */
                <div className="bg-white border border-zinc-300 rounded-xl p-3.5 shadow-md space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3.5 h-3.5 rounded-full bg-sienna-1 flex items-center justify-center text-[7px] text-white font-bold">
                        F
                      </div>
                      <span className="font-medium text-zinc-700">floriwish.com</span>
                    </div>
                    <span>just now</span>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-lg bg-zinc-100 border border-zinc-200 flex items-center justify-center text-zinc-700 shrink-0">
                      <Bell width={18} height={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">
                        {title || "Notification Title Preview"}
                      </p>
                      <p className="text-[11px] text-zinc-600 mt-0.5 line-clamp-2 leading-snug">
                        {message || "Your message body will be displayed here."}
                      </p>
                    </div>
                  </div>

                  {imageUrl && (
                    <div className="w-full h-32 rounded-lg overflow-hidden bg-zinc-100 border border-zinc-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Preview banner"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}

                  <div className="pt-1.5 border-t border-zinc-100 flex items-center justify-between text-[10px] text-zinc-400">
                    <span>Target URL: {clickUrl || "/"}</span>
                    <span>Google Chrome</span>
                  </div>
                </div>
              ) : (
                /* Mobile Android/iOS Style Card */
                <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between text-[11px] text-zinc-500">
                    <div className="flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded-full bg-sienna-1 flex items-center justify-center text-[8px] text-white font-bold">
                        F
                      </div>
                      <span className="font-semibold text-zinc-800">Floriwish</span>
                    </div>
                    <span>now</span>
                  </div>

                  <div>
                    <p className="text-xs font-bold text-zinc-900">
                      {title || "Notification Title Preview"}
                    </p>
                    <p className="text-xs text-zinc-600 mt-0.5 leading-relaxed">
                      {message || "Your message body will be displayed here."}
                    </p>
                  </div>

                  {imageUrl && (
                    <div className="w-full h-36 rounded-xl overflow-hidden bg-zinc-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={imageUrl}
                        alt="Preview banner"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                  )}
                </div>
              )}

              <p className="text-[11px] text-zinc-500 text-center">
                Subscribers clicking the notification will navigate to <span className="font-mono text-zinc-700">{clickUrl || "/"}</span>.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tab: Campaign History */}
      {activeTab === "history" && (
        <div className="bg-white border border-zinc-200/90 rounded-xl overflow-hidden shadow-xs">
          {campaigns.length === 0 ? (
            <div className="py-16 text-center text-zinc-400 space-y-2">
              <Inbox width={36} height={36} className="mx-auto text-zinc-300 stroke-1" />
              <p className="text-sm font-medium text-zinc-600">No broadcasts sent yet</p>
              <p className="text-xs text-zinc-400">
                Dispatched push notification campaigns will be logged here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-zinc-50 text-zinc-700 font-semibold border-b border-zinc-200">
                  <tr>
                    <th className="py-3 px-4">Dispatched At</th>
                    <th className="py-3 px-4">Title & Message</th>
                    <th className="py-3 px-4">Audience</th>
                    <th className="py-3 px-4">Destination</th>
                    <th className="py-3 px-4 text-center">Sent</th>
                    <th className="py-3 px-4 text-center">Delivered</th>
                    <th className="py-3 px-4 text-center">Delivery Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 text-zinc-600">
                  {campaigns.map((camp) => (
                    <tr key={camp._id} className="hover:bg-zinc-50/50">
                      <td className="py-3.5 px-4 whitespace-nowrap text-zinc-500">
                        {new Date(camp.createdAt).toLocaleString(undefined, {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit"
                        })}
                      </td>
                      <td className="py-3.5 px-4 max-w-sm">
                        <p className="font-semibold text-zinc-900 truncate">
                          {camp.title}
                        </p>
                        <p className="text-zinc-500 truncate text-[11px]">
                          {camp.message}
                        </p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="capitalize px-2 py-0.5 rounded bg-zinc-100 text-zinc-700 text-[11px] font-medium">
                          {camp.targetType}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-zinc-500 truncate max-w-[140px]">
                        {camp.clickUrl}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-zinc-900">
                        {camp.totalSent}
                      </td>
                      <td className="py-3.5 px-4 text-center font-semibold text-emerald-600">
                        {camp.successCount}
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        {camp.failureCount === 0 ? (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                            Delivered
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-[10px] font-semibold">
                            {camp.failureCount} failed
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
