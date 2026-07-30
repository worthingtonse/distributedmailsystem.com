import { m } from "framer-motion";

// Shared delivery visualization: Sender -> scattered QMail server field -> Receiver.
// Used on both the How It Works page and the landing page hero.
const SENDER = { x: 75, y: 160 };
const RECEIVER = { x: 725, y: 160 };

// Fixed but scattered server coordinates (a field, not a line).
// Deliberately no three are collinear with the sender node.
const SERVERS = [
  { x: 290, y: 105 },
  { x: 300, y: 210 },
  { x: 352, y: 150 },
  { x: 358, y: 262 },
  { x: 395, y: 68 },
  { x: 410, y: 195 },
  { x: 455, y: 30 },
  { x: 452, y: 120 },
  { x: 470, y: 240 },
  { x: 500, y: 90 },
  { x: 512, y: 175 },
  { x: 520, y: 258 },
];

export default function QmailDelivery({ className = "" }) {
  return (
    <div className={`relative w-full max-w-5xl mx-auto h-80 ${className}`}>
      <svg
        viewBox="0 0 800 320"
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full"
      >
        {/* Faint connection lines: Sender -> each server -> Receiver */}
        {SERVERS.map((s, i) => (
          <g key={`line-${i}`}>
            <m.line
              x1={SENDER.x} y1={SENDER.y} x2={s.x} y2={s.y}
              stroke="rgba(59,130,246,0.18)" strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.5 + i * 0.04, duration: 0.6 }}
            />
            <m.line
              x1={s.x} y1={s.y} x2={RECEIVER.x} y2={RECEIVER.y}
              stroke="rgba(74,222,128,0.15)" strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ delay: 0.7 + i * 0.04, duration: 0.6 }}
            />
          </g>
        ))}

        {/* Scattered field of QMail server dots */}
        {SERVERS.map((s, i) => (
          <m.g
            key={`dot-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 + i * 0.06, duration: 0.4 }}
          >
            <circle cx={s.x} cy={s.y} r="9" fill="rgba(167,139,250,0.15)" />
            <circle cx={s.x} cy={s.y} r="4.5" fill="#a78bfa" />
          </m.g>
        ))}

        {/* Traveling packets: Sender -> a server -> Receiver */}
        {SERVERS.map((s, i) => (
          <m.circle
            key={`pkt-${i}`}
            r="3.5"
            fill="#22d3ee"
            initial={{ cx: SENDER.x, cy: SENDER.y, opacity: 0 }}
            animate={{
              cx: [SENDER.x, s.x, RECEIVER.x],
              cy: [SENDER.y, s.y, RECEIVER.y],
              opacity: [0, 1, 1, 0],
            }}
            transition={{
              delay: 1.4 + i * 0.22,
              duration: 2.6,
              repeat: Infinity,
              repeatDelay: 0.6,
              ease: "easeInOut",
            }}
          />
        ))}

        {/* Sender (far left) */}
        <m.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <circle cx={SENDER.x} cy={SENDER.y} r="30" fill="rgba(59,130,246,0.15)" stroke="rgba(59,130,246,0.55)" strokeWidth="1.5" />
          <rect x={SENDER.x - 13} y={SENDER.y - 9} width="26" height="18" rx="2.5" fill="none" stroke="#93c5fd" strokeWidth="1.6" />
          <path d={`M${SENDER.x - 13} ${SENDER.y - 7} L${SENDER.x} ${SENDER.y + 2} L${SENDER.x + 13} ${SENDER.y - 7}`} fill="none" stroke="#93c5fd" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <text x={SENDER.x} y={SENDER.y + 50} textAnchor="middle" fill="#93c5fd" fontSize="16" fontWeight="600">Sender</text>
        </m.g>

        {/* Receiver (far right) */}
        <m.g
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.5 }}
        >
          <circle cx={RECEIVER.x} cy={RECEIVER.y} r="30" fill="rgba(74,222,128,0.12)" stroke="rgba(74,222,128,0.55)" strokeWidth="1.5" />
          <circle cx={RECEIVER.x} cy={RECEIVER.y - 6} r="5.5" fill="none" stroke="#86efac" strokeWidth="1.6" />
          <path d={`M${RECEIVER.x - 11} ${RECEIVER.y + 12} a11 11 0 0 1 22 0`} fill="none" stroke="#86efac" strokeWidth="1.6" strokeLinecap="round" />
          <text x={RECEIVER.x} y={RECEIVER.y + 50} textAnchor="middle" fill="#86efac" fontSize="16" fontWeight="600">Receiver</text>
        </m.g>

        {/* Field caption */}
        <text x="400" y="308" textAnchor="middle" fill="#9ca3af" fontSize="14">Global QMail Servers</text>
      </svg>
    </div>
  );
}
