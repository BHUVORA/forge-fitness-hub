import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { ArrowLeft, ScanLine, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/scanner")({
  component: ScannerPage,
  head: () => ({
    meta: [
      { title: "QR Scanner — IronForge Admin" },
      { name: "description", content: "Scan member QR codes to log gym attendance." },
    ],
  }),
});

interface ScanResult {
  type: "success" | "error";
  name: string;
  message: string;
  time: string;
}

function ScannerPage() {
  const { user, loading, isAdmin, isTrainer } = useAuth();
  const navigate = useNavigate();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const containerId = "qr-scanner-container";
  const [scanning, setScanning] = useState(false);
  const [lastResult, setLastResult] = useState<ScanResult | null>(null);
  const recentScans = useRef<Map<string, number>>(new Map());

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
    if (!loading && user && !isAdmin && !isTrainer) {
      toast.error("Admin/trainer access required");
      navigate({ to: "/dashboard" });
    }
  }, [user, loading, isAdmin, isTrainer, navigate]);

  const handleScan = async (decodedText: string) => {
    // Debounce: skip same QR within 5s
    const last = recentScans.current.get(decodedText);
    if (last && Date.now() - last < 5000) return;
    recentScans.current.set(decodedText, Date.now());

    // Validate UUID
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(decodedText)) {
      setLastResult({ type: "error", name: "Invalid", message: "Not a valid member QR", time: new Date().toLocaleTimeString() });
      return;
    }

    // Lookup member + membership
    const [{ data: profile }, { data: mem }] = await Promise.all([
      supabase.from("profiles").select("full_name").eq("id", decodedText).maybeSingle(),
      supabase.from("memberships").select("end_date, status").eq("user_id", decodedText).order("end_date", { ascending: false }).limit(1).maybeSingle(),
    ]);

    if (!profile) {
      setLastResult({ type: "error", name: "Unknown", message: "Member not found", time: new Date().toLocaleTimeString() });
      return;
    }

    const name = profile.full_name || "Member";
    const isActive = mem && new Date(mem.end_date) >= new Date() && mem.status === "active";

    if (!isActive) {
      setLastResult({ type: "error", name, message: "Membership expired or inactive", time: new Date().toLocaleTimeString() });
      return;
    }

    // Check for duplicate today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const { data: todayCheckIn } = await supabase
      .from("attendance")
      .select("id")
      .eq("user_id", decodedText)
      .gte("check_in_at", todayStart.toISOString())
      .limit(1)
      .maybeSingle();

    if (todayCheckIn) {
      setLastResult({ type: "success", name, message: "Already checked in today", time: new Date().toLocaleTimeString() });
      return;
    }

    const { error } = await supabase.from("attendance").insert({
      user_id: decodedText,
      scanned_by: user?.id ?? null,
    });

    if (error) {
      setLastResult({ type: "error", name, message: error.message, time: new Date().toLocaleTimeString() });
    } else {
      setLastResult({ type: "success", name, message: "Check-in recorded", time: new Date().toLocaleTimeString() });
    }
  };

  const startScanner = async () => {
    try {
      const html5 = new Html5Qrcode(containerId);
      scannerRef.current = html5;
      await html5.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        handleScan,
        () => {}
      );
      setScanning(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Camera not available");
    }
  };

  const stopScanner = async () => {
    try {
      await scannerRef.current?.stop();
      await scannerRef.current?.clear();
    } catch { /* ignore */ }
    scannerRef.current = null;
    setScanning(false);
  };

  useEffect(() => {
    return () => {
      stopScanner();
    };
  }, []);

  if (loading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="mx-auto max-w-2xl">
        <Link to="/dashboard" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <div className="flex items-center gap-3 mb-6">
          <div className="h-12 w-12 rounded-xl bg-gradient-fire flex items-center justify-center">
            <ScanLine className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold">Attendance Scanner</h1>
            <p className="text-sm text-muted-foreground">Scan member QR codes to record check-ins</p>
          </div>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <div id={containerId} className="w-full bg-black rounded-xl overflow-hidden mb-4" style={{ minHeight: scanning ? 300 : 0 }} />

          {!scanning ? (
            <button
              onClick={startScanner}
              className="w-full bg-gradient-fire text-primary-foreground py-3 rounded-lg font-bold uppercase tracking-wide"
            >
              Start camera
            </button>
          ) : (
            <button
              onClick={stopScanner}
              className="w-full bg-secondary text-foreground py-3 rounded-lg font-medium"
            >
              Stop camera
            </button>
          )}
        </div>

        {lastResult && (
          <div
            className={`mt-6 border rounded-2xl p-6 flex items-start gap-4 ${
              lastResult.type === "success" ? "bg-primary/10 border-primary/30" : "bg-destructive/10 border-destructive/30"
            }`}
          >
            {lastResult.type === "success" ? (
              <CheckCircle2 className="h-8 w-8 text-primary flex-shrink-0" />
            ) : (
              <XCircle className="h-8 w-8 text-destructive flex-shrink-0" />
            )}
            <div>
              <p className="font-heading font-bold text-lg">{lastResult.name}</p>
              <p className="text-sm text-muted-foreground">{lastResult.message}</p>
              <p className="text-xs text-muted-foreground mt-1">{lastResult.time}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
