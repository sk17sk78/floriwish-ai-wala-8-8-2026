"use client";

import { useEffect, useState, useCallback, memo } from "react";
import { Bell, X, Sparkles } from "lucide-react";
import { requestFCMToken, listenToForegroundMessages } from "@/config/firebase";
import { useAppStates } from "@/hooks/useAppState/useAppState";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "floriwish_push_prompt_v2";

function NotificationPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const {
    auth: {
      data: { customerId }
    }
  } = useAppStates();

  const setupForegroundListener = useCallback(() => {
    listenToForegroundMessages((payload) => {
      const title = payload.notification?.title || payload.data?.title || "Floriwish Alert";
      const body = payload.notification?.body || payload.data?.body || "You have a new update";
      const url = payload.data?.url || payload.data?.click_action || "/";

      toast({
        title: title,
        description: body,
        duration: 6000,
        action: (
          <button
            onClick={() => {
              if (url && url !== "/") {
                router.push(url);
              }
            }}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-sienna-1 rounded-lg hover:bg-sienna-2 transition-colors shadow-sm"
          >
            View
          </button>
        )
      });
    });
  }, [router, toast]);

  const registerToken = useCallback(async (userId?: string | null) => {
    try {
      const token = await requestFCMToken();
      if (!token) return;

      await fetch("/api/frontend/notifications/token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          userId: userId || null,
          deviceInfo: navigator.userAgent.includes("Mobile")
            ? "Mobile Browser"
            : navigator.userAgent.includes("iPad")
            ? "iPad Tablet"
            : "Desktop Browser",
          userAgent: navigator.userAgent
        })
      });
    } catch (err) {
      console.warn("FCM token registration notice:", err);
    }
  }, []);

  const handleRequestPermission = async () => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      setShowPrompt(false);
      return;
    }

    setIsProcessing(true);
    try {
      // Direct user gesture — triggers the native browser dialog right below the URL/lock icon on Chrome/Edge/Safari/Firefox!
      let permission: NotificationPermission = "default";
      try {
        permission = await Notification.requestPermission();
      } catch {
        // Fallback for older browsers using callback syntax
        permission = await new Promise((resolve) => {
          Notification.requestPermission((p) => resolve(p));
        });
      }

      if (permission === "granted") {
        localStorage.setItem(STORAGE_KEY, "granted");
        setShowPrompt(false);
        await registerToken(customerId);
        setupForegroundListener();

        toast({
          title: "🎉 Notifications Enabled!",
          description: "You'll now get instant delivery updates & special offers.",
          duration: 4000
        });
      } else if (permission === "denied") {
        localStorage.setItem(STORAGE_KEY, "denied");
        setShowPrompt(false);
      } else {
        localStorage.setItem(STORAGE_KEY, "dismissed");
        setShowPrompt(false);
      }
    } catch (err) {
      console.error("Error requesting notification permission:", err);
      setShowPrompt(false);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDismiss = () => {
    localStorage.setItem(STORAGE_KEY, "dismissed");
    setShowPrompt(false);
  };

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) {
      return;
    }

    // 1. Pre-register service worker so browser URL icon immediately recognizes notification support
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/firebase-messaging-sw.js", { scope: "/" }).catch(() => {});
    }

    // 2. If already granted in browser URL bar icon, silent register FCM token
    if (Notification.permission === "granted") {
      registerToken(customerId);
      setupForegroundListener();
      return;
    }

    // 3. If denied by browser settings, do not prompt
    if (Notification.permission === "denied") {
      return;
    }

    const isMobileDevice =
      /Android|iPhone|iPad|iPod|Tablet|Mobile/i.test(navigator.userAgent) ||
      (typeof window !== "undefined" && window.innerWidth < 768);

    // 4. On Desktop / Laptop: Trigger native browser prompt from URL address bar on user interaction
    if (!isMobileDevice) {
      const handleDesktopNativeTrigger = async () => {
        if (Notification.permission === "default") {
          try {
            const permission = await Notification.requestPermission();
            if (permission === "granted") {
              await registerToken(customerId);
              setupForegroundListener();
            }
          } catch (e) {
            console.warn("Desktop native prompt notice:", e);
          }
        }
      };

      // Prompt natively on first click or after 2s of activity on desktop
      const desktopTimer = setTimeout(() => {
        window.addEventListener("pointerdown", handleDesktopNativeTrigger, { once: true });
        window.addEventListener("keydown", handleDesktopNativeTrigger, { once: true });
      }, 1500);

      return () => {
        clearTimeout(desktopTimer);
        window.removeEventListener("pointerdown", handleDesktopNativeTrigger);
        window.removeEventListener("keydown", handleDesktopNativeTrigger);
      };
    }

    // 5. On Mobile & Tablet: Show clean floating prompt after 3.5s delay
    const savedState = localStorage.getItem(STORAGE_KEY);
    if (savedState === "dismissed" || savedState === "granted") {
      return;
    }

    const timer = setTimeout(() => {
      if (Notification.permission === "default") {
        setShowPrompt(true);
      }
    }, 3500);

    return () => clearTimeout(timer);
  }, [customerId, registerToken, setupForegroundListener]);

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-20 left-3 right-3 sm:hidden z-[9999] animate-in fade-in slide-in-from-bottom-4 duration-300">
      <div className="bg-white/95 backdrop-blur-xl border border-zinc-200/90 rounded-2xl p-3 shadow-[0_12px_36px_-6px_rgba(0,0,0,0.18)] flex items-center justify-between gap-3 text-zinc-900">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center text-sienna-1 shrink-0">
            <Bell width={18} height={18} className="animate-pulse" />
          </div>
          <div className="min-w-0 pr-1">
            <p className="text-xs font-bold text-zinc-900 truncate flex items-center gap-1">
              Enable Updates
              <Sparkles width={12} height={12} className="text-amber-500 shrink-0" />
            </p>
            <p className="text-[11px] text-zinc-500 truncate leading-tight">
              Get live order & discount alerts
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <button
            type="button"
            onClick={handleRequestPermission}
            disabled={isProcessing}
            className="px-3.5 py-1.5 bg-sienna-1 hover:bg-sienna-2 text-white font-semibold text-xs rounded-xl shadow-xs active:scale-95 transition-all cursor-pointer disabled:opacity-50"
          >
            {isProcessing ? "..." : "Allow"}
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss"
            className="p-1.5 text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors cursor-pointer"
          >
            <X width={15} height={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default memo(NotificationPrompt);

