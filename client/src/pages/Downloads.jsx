import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Download,
  Monitor,
  Smartphone,
  HardDrive,
  FileText,
  ShieldCheck,
  ArrowRight,
  Clock,
} from "lucide-react";
import { useDocumentMeta } from "../hooks/useDocumentMeta";

const BIN_BASE = "https://cloudcoinconsortium.com/bin";

const releases = [
  {
    name: "Windows",
    icon: Monitor,
    description: "Windows 10 or later",
    latestFile: "core-windows-latest.exe",
    latestUrl: `${BIN_BASE}/core-windows-latest.exe`,
    archiveFile: "core-windows-2026-07-20.exe",
    archiveUrl: `${BIN_BASE}/core-windows-2026-07-20.exe`,
    checksum: "9a1fc4cbf2669a58683db7a4ea86136f37ab79661684b8b5244c4bedd8488bcc",
    size: "2.2 MB",
    note: "Current Windows desktop build",
  },
  {
    name: "macOS",
    icon: Monitor,
    description: "macOS 12 or later",
    latestFile: "QMail.dmg",
    latestUrl: `${BIN_BASE}/QMail.dmg`,
    checksum: "ffd8915a282f018cd2259ff866a84f248727dd718d9521a14c2e3a7acad23849",
    size: "164 MB",
    note: "Current macOS release",
  },
  {
    name: "Linux",
    icon: HardDrive,
    description: "Ubuntu, Debian, Fedora",
    latestFile: "core-linux-latest",
    latestUrl: `${BIN_BASE}/core-linux-latest`,
    archiveFile: "core-linux-2026-07-20",
    archiveUrl: `${BIN_BASE}/core-linux-2026-07-20`,
    checksum: "bdfa33502b0209edc91bbead4627897e448a2837279c96c74ec409727d3d96c2",
    size: "25.1 MB",
    note: "Desktop AppImage build",
  },
  {
    name: "Android",
    icon: Smartphone,
    description: "Android 10 or later",
    latestFile: "qmail-android-latest.apk",
    latestUrl: `${BIN_BASE}/qmail-android-latest.apk`,
    archiveFile: "qmail-android-2026-07-17.apk",
    archiveUrl: `${BIN_BASE}/qmail-android-2026-07-17.apk`,
    checksum: "402cce38f83e9128f0f3872e8d51b613d270293f708940ce8b462345255ca030",
    size: "49 MB",
    note: "Android client build",
  },
];

const Downloads = () => {
  useDocumentMeta({
    title: "Download QMail",
    description:
      "Download QMail for Windows, macOS, Linux, or Android. Stable latest builds and checksums are available here.",
    path: "/download",
  });

  return (
    <div className="pt-32 pb-20 container mx-auto px-4 min-h-screen">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16 space-y-5"
        >
          <h1 className="text-4xl md:text-6xl font-black text-white mb-6">
            Download <span className="qmail-gradient-text">QMail</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Grab the current release for your platform, verify it with the
            published checksum, and use the stable latest link for future
            updates.
          </p>
          <p className="text-sm text-blue-300/80">
            Need an address first?{" "}
            <Link to="/register" className="underline hover:text-blue-200">
              Claim your QMail mailbox
            </Link>{" "}
            (from $10 · 30-day money-back).
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2 text-xs uppercase tracking-[0.22em] text-gray-500">
            <span className="rounded-full border border-gray-700 bg-gray-900/70 px-4 py-2">
              Latest builds
            </span>
            <span className="rounded-full border border-gray-700 bg-gray-900/70 px-4 py-2">
              SHA256 published
            </span>
            <span className="rounded-full border border-gray-700 bg-gray-900/70 px-4 py-2">
              Archive links included
            </span>
          </div>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-2">
          {releases.map((release, i) => {
            const Icon = release.icon;
            return (
              <motion.section
                key={release.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-gray-900 border border-gray-800 rounded-[2rem] p-8 text-left transition-all hover:border-blue-500/50 hover:-translate-y-0.5"
              >
                <div className="flex items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                    <Icon size={28} className="text-blue-300" />
                  </div>
                  <div className="min-w-0">
                    <h2 className="text-2xl font-black text-white">{release.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{release.description}</p>
                    <p className="text-xs text-cyan-300/80 mt-2">{release.note}</p>
                  </div>
                </div>

                <div className="mt-6 grid gap-3 text-sm">
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-black/40 px-4 py-3">
                    <span className="text-gray-500">Latest file</span>
                    <span className="font-mono text-gray-200 text-right break-all">
                      {release.latestFile}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-black/40 px-4 py-3">
                    <span className="text-gray-500">SHA256</span>
                    <span className="font-mono text-[11px] text-gray-200 text-right break-all">
                      {release.checksum}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-4 rounded-2xl border border-gray-800 bg-black/40 px-4 py-3">
                    <span className="text-gray-500">Size</span>
                    <span className="font-semibold text-gray-200">{release.size}</span>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <a
                    href={release.latestUrl}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all bg-blue-600 text-white hover:bg-blue-500"
                  >
                    <Download size={16} /> Download latest
                  </a>
                  <a
                    href={`${BIN_BASE}/SHA256SUMS`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all bg-gray-800 text-gray-200 border border-gray-700 hover:border-blue-500/50 hover:text-white"
                  >
                    <ShieldCheck size={16} /> Check sums
                  </a>
                  {release.archiveUrl && (
                    <a
                      href={release.archiveUrl}
                      className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-bold transition-all bg-gray-900 text-gray-300 border border-gray-700 hover:border-blue-500/50 hover:text-white"
                    >
                      <ArrowRight size={16} /> Versioned build
                    </a>
                  )}
                </div>

                <div className="mt-5 text-xs text-gray-500 leading-relaxed">
                  <p>
                    Stable link:{" "}
                    <span className="font-mono text-gray-300 break-all">
                      {release.latestFile}
                    </span>
                  </p>
                  {release.archiveFile && (
                    <p className="mt-1">
                      Archive file:{" "}
                      <span className="font-mono text-gray-300 break-all">
                        {release.archiveFile}
                      </span>
                    </p>
                  )}
                </div>
              </motion.section>
            );
          })}
        </div>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-blue-500/20 bg-blue-500/10 p-5">
            <div className="flex items-center gap-2 mb-2">
              <FileText className="text-blue-300" size={16} />
              <h3 className="font-bold text-white">Verify before running</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Compare the downloaded file against `SHA256SUMS` before installing.
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5">
            <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="text-emerald-300" size={16} />
              <h3 className="font-bold text-white">Keep archives</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Versioned files stay available so you can roll back or compare
              releases.
            </p>
          </div>
          <div className="rounded-2xl border border-yellow-500/20 bg-yellow-500/10 p-5">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="text-yellow-300" size={16} />
              <h3 className="font-bold text-white">Use stable links</h3>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Point users at the `-latest` files and let the archive handle
              older builds.
            </p>
          </div>
        </div>

        <div className="mt-16 text-center space-y-3">
          <p className="text-xs uppercase tracking-[0.25em] text-gray-500">
            Release bucket
          </p>
          <a
            href={BIN_BASE}
            className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm font-semibold"
          >
            Browse `/bin` release files <ArrowRight size={14} />
          </a>
        </div>

        <div className="mt-10 text-center space-y-3">
          <Link
            to="/register"
            className="inline-flex text-blue-400 hover:text-blue-300 text-sm font-semibold"
          >
            Don&apos;t have a mailbox yet? Register here →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Downloads;
