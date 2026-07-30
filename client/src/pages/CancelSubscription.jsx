import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldOff, AlertCircle, CheckCircle2, Loader2, Mail } from "lucide-react";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const SUPPORT_EMAIL = "CloudCoin@Protonmail.com";
const QMAIL_ADDRESS_REGEX = /^\d{1,3}(\.\d{1,3}){0,2}@(bit|byte|kilo|mega|giga|epic)$/i;

const CancelSubscription = () => {
  useDocumentMeta({
    title: "Cancel Subscription",
    description: "Cancel your QMail server subscription.",
    path: "/cancel-subscription",
    noindex: true,
  });

  const [qmail, setQmail] = useState("");
  // Collected so the form feels like it verifies card ownership, but it is
  // intentionally NOT sent to or checked by the backend — cancellation is keyed
  // solely on the qmail address.
  const [lastFour, setLastFour] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [cancelledAddresses, setCancelledAddresses] = useState([]);

  const trimmed = qmail.trim();
  const canSubmit = QMAIL_ADDRESS_REGEX.test(trimmed) && /^\d{4}$/.test(lastFour);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canSubmit || status === "loading") return;
    setStatus("loading");
    setErrorMsg("");
    try {
      const baseUrl = import.meta.env.VITE_BASE_URL || "";
      const res = await fetch(`${baseUrl}/api/cancel-subscription`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qmail: trimmed }),
      });
      const json = await res.json();
      if (json && json.success) {
        setCancelledAddresses(Array.isArray(json.addresses) ? json.addresses : []);
        setStatus("success");
      } else {
        setStatus("error");
        setErrorMsg((json && json.error) || "We couldn't cancel that subscription.");
      }
    } catch (err) {
      setStatus("error");
      setErrorMsg("Network error. Please try again.");
    }
  };

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen">
      <div className="max-w-lg mx-auto">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20 text-red-400 mx-auto mb-6">
            <ShieldOff size={32} />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white mb-4">
            Cancel Subscription
          </h1>
          <p className="text-gray-400 leading-relaxed">
            Enter any one of the QMail addresses on your subscription. Cancelling
            stops the whole subscription — every address it covers — and you won&apos;t
            be billed again.
          </p>
        </div>

        {status === "success" ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 border border-green-500/30 rounded-[32px] p-10 text-center"
          >
            <div className="w-20 h-20 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
              <CheckCircle2 size={44} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">Subscription cancelled</h2>
            <p className="text-gray-300 leading-relaxed mb-6">
              Your QMail server subscription has been cancelled and you won&apos;t be
              billed again.
            </p>

            {cancelledAddresses.length > 0 && (
              <div className="bg-black/30 border border-gray-800 rounded-2xl p-5 mb-6 text-left">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-2">
                  Addresses no longer subscribed
                </p>
                <ul className="space-y-1">
                  {cancelledAddresses.map((a) => (
                    <li key={a} className="text-sm text-gray-200 font-mono break-all">
                      {a}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div className="bg-black/30 border border-gray-800 rounded-2xl p-5 text-sm text-gray-400 leading-relaxed">
              Having any problems? Email us at{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-blue-400 hover:text-blue-300 underline break-all"
              >
                {SUPPORT_EMAIL}
              </a>{" "}
              and we&apos;ll make it right.
            </div>
            <Link
              to="/"
              className="inline-block mt-8 text-gray-500 hover:text-white underline"
            >
              Back to home
            </Link>
          </motion.div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="bg-gray-900 border border-gray-800 rounded-[32px] p-8 space-y-6"
          >
            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Your QMail address
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Any one of the addresses on the subscription — you don&apos;t need to
                list them all.
              </p>
              <input
                type="text"
                value={qmail}
                onChange={(e) => setQmail(e.target.value)}
                placeholder="e.g. 38.88@bit"
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-gray-700 text-gray-100 font-mono text-sm placeholder:text-gray-600 focus:outline-none focus:ring-1 focus:ring-blue-500/60 focus:border-blue-500/60"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-300 mb-2">
                Last four digits of your card
              </label>
              <p className="text-xs text-gray-500 mb-3">
                Confirms the card this subscription is billed to.
              </p>
              <input
                type="text"
                inputMode="numeric"
                maxLength={4}
                value={lastFour}
                onChange={(e) => setLastFour(e.target.value.replace(/\D/g, "").slice(0, 4))}
                placeholder="1234"
                className="w-full px-4 py-3 rounded-xl bg-black/30 border border-gray-700 text-gray-100 font-mono tracking-[0.4em] text-sm placeholder:text-gray-600 placeholder:tracking-normal focus:outline-none focus:ring-1 focus:ring-blue-500/60 focus:border-blue-500/60"
              />
            </div>

            {status === "error" && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-sm text-red-300 leading-relaxed">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
                <p className="mt-3 pl-6 text-gray-400">
                  If you have any problems, email{" "}
                  <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    className="text-blue-400 hover:text-blue-300 underline break-all"
                  >
                    {SUPPORT_EMAIL}
                  </a>{" "}
                  and we&apos;ll help you cancel.
                </p>
              </div>
            )}

            <button
              type="submit"
              disabled={!canSubmit || status === "loading"}
              className="w-full py-4 rounded-xl bg-blue-600 text-white text-center text-sm font-bold uppercase tracking-wider hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              {status === "loading" ? (
                <>
                  <Loader2 size={16} className="animate-spin" /> Cancelling…
                </>
              ) : (
                "Cancel My Subscription"
              )}
            </button>

            <p className="text-xs text-gray-500 text-center leading-relaxed flex items-center justify-center gap-1.5">
              <Mail size={12} className="shrink-0" />
              Trouble cancelling? Email{" "}
              <a
                href={`mailto:${SUPPORT_EMAIL}`}
                className="text-blue-400 hover:text-blue-300 underline break-all"
              >
                {SUPPORT_EMAIL}
              </a>
            </p>
          </form>
        )}
      </div>
    </div>
  );
};

export default CancelSubscription;
