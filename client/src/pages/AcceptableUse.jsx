import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Ban, ShieldAlert, Scale } from 'lucide-react';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const Section = ({ icon: Icon, title, children }) => (
  <div className="mb-10">
    <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-3">
      <Icon className="w-5 h-5 text-blue-400 shrink-0" />
      {title}
    </h2>
    <div className="text-gray-300 text-sm leading-relaxed space-y-3">{children}</div>
  </div>
);

export default function AcceptableUse() {
  useDocumentMeta({
    title: 'Who Should Not Use Qmail — Acceptable Use Policy',
    description:
      "Qmail's Acceptable Use Policy: who should not use Qmail, our zero-tolerance stance, and how we cooperate with lawful law-enforcement requests.",
    path: '/acceptable-use',
  });

  return (
    <div className="min-h-screen pt-28 pb-20 bg-[#0a0a1a]">
      <div className="container mx-auto px-4 max-w-3xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
            Qmail Acceptable Use Policy
          </h1>
          <p className="text-gray-400 mb-12">Who should — and should not — use Qmail.</p>

          <div className="bg-gray-900/60 border border-gray-700/50 rounded-2xl p-8 md:p-12">

            <Section icon={BookOpen} title="Our Philosophical Foundation">
              <p>
                Qmail was built on a foundational belief drawn from philosopher John
                Locke's <em>Second Treatise of Government</em>: every individual possesses
                a natural, God-given right to freedom, privacy, and self-determination.
              </p>
              <p>
                In what Locke calls the <strong className="text-white">State of Nature</strong>,
                human beings are meant to live freely without being dominated, spied on, or
                controlled by others. We believe that privacy tools like Qmail exist to
                safeguard this natural state of freedom.
              </p>
              <p>However, Locke also drew a sharp line between liberty and license:</p>
              <ul className="list-disc list-outside space-y-2 pl-5">
                <li>
                  <strong className="text-white">Good</strong> is the exercise of your
                  personal freedom while respecting the equal rights, life, bodily autonomy,
                  and property of others.
                </li>
                <li>
                  <strong className="text-white">Evil</strong> occurs when someone attempts
                  to drag others into what Locke called a{' '}
                  <strong className="text-white">State of War</strong> — using force,
                  coercion, or deception to take away another person's agency, property,
                  safety, or life.
                </li>
              </ul>
              <p>
                <strong className="text-white">The Catch-All Rule:</strong> Qmail is designed
                exclusively to protect honest human freedom. If you intend to use Qmail to
                force another human being into a State of War — by stripping away their
                rights, safety, or choices — you are forbidden from using this platform.
              </p>
            </Section>

            <Section icon={Ban} title="Who Should Not Use Qmail">
              <p>
                To be entirely specific, Qmail is strictly off-limits to anyone participating
                in or facilitating:
              </p>
              <ul className="list-disc list-outside space-y-2 pl-5">
                <li>
                  <strong className="text-white">Human Exploitation &amp; Trafficking:</strong>{' '}
                  Any attempt to abuse, exploit, coerce, or strip individuals of their bodily
                  freedom or self-determination.
                </li>
                <li>
                  <strong className="text-white">Violence &amp; Bodily Harm:</strong>{' '}
                  Planning, coordinating, or threatening murder, assault, or physical violence
                  against any person.
                </li>
                <li>
                  <strong className="text-white">Extortion &amp; Blackmail:</strong> Using
                  secret communications to threaten others, force choices under duress, or
                  steal property and reputation.
                </li>
                <li>
                  <strong className="text-white">Cyberattacks &amp; Sabotage:</strong>{' '}
                  Distributing malware, ransomware, or conducting attacks intended to ruin
                  property, steal data, or collapse critical infrastructure.
                </li>
                <li>
                  <strong className="text-white">Severe Financial Fraud:</strong> Executing
                  large-scale schemes designed to strip innocent people of their property or
                  savings through deception.
                </li>
              </ul>
            </Section>

            <Section icon={ShieldAlert} title="Zero Tolerance: Absolute Disqualification">
              <p>
                There are certain behaviors whose core purpose is to exist in a permanent
                State of War against human freedom and safety. Qmail maintains a strict
                Zero-Tolerance Policy for anyone using our platform to advance or engage in:
              </p>
              <ul className="list-disc list-outside space-y-2 pl-5">
                <li>
                  <strong className="text-white">Child Exploiters &amp; Abusers:</strong>{' '}
                  Anyone convicted of any activity involving the abuse, exploitation, or
                  endangerment of minors.
                </li>
                <li>
                  <strong className="text-white">Violent Extremism &amp; Terrorism:</strong>{' '}
                  Any individual or organization — including jihadist networks and terrorist
                  groups of any ideology — that uses terror, mass violence, or intimidation to
                  destroy innocent lives and strip people of their basic liberties.
                </li>
                <li>
                  <strong className="text-white">Coercive Subversion &amp; Totalitarian Action:</strong>{' '}
                  Any group or individual using forced subjugation, violent overthrow, or
                  coercive violence to destroy individual property rights, bodily autonomy, and
                  human freedom.
                </li>
              </ul>
              <p>
                <strong className="text-white">Our Stance on Administration &amp; Protection:</strong>{' '}
                If you engage in these acts, you have explicitly declared a State of War against
                humanity. Qmail administrators will offer no shelter, protection, or technical
                leniency to those who inflict these harms. While our system is built for privacy,
                we will actively comply with lawful warrants, assemble split data fragments, and
                hand over necessary evidence to law enforcement to ensure perpetrators face
                justice in a court of law.
              </p>
            </Section>

            <Section icon={Scale} title="Technical Disclosure & Law Enforcement Cooperation">
              <p>
                Qmail utilizes advanced security architecture to keep your communications
                secure:
              </p>
              <h3 className="text-base font-semibold text-white pt-2">How Our Security Works</h3>
              <p>
                Your messages are non-identifiably fragmented ("striped") across up to 32
                independent servers. Under normal circumstances, no single server or
                administrator holds a readable copy of your communication.
              </p>
              <h3 className="text-base font-semibold text-white pt-2">Our Stance on Illegal Activity</h3>
              <p>
                While we have designed Qmail to provide high-grade privacy for lawful, free
                individuals, we are not a safe haven for criminal harm.
              </p>
              <p>
                If a user uses Qmail to commit crimes that drag others into a State of War, we
                will cooperate with legal authorities within the bounds of constitutional due
                process:
              </p>
              <ol className="list-decimal list-outside space-y-2 pl-5">
                <li>
                  <strong className="text-white">Required Legal Authorization:</strong> Qmail
                  administrators will only take action if served with a valid search warrant
                  signed by a judge, grounded in verified probable cause.
                </li>
                <li>
                  <strong className="text-white">Re-assembling Data:</strong> Upon receiving a
                  valid search warrant, all necessary system administrators will coordinate to
                  combine the split data fragments across our 32 servers to reconstruct and
                  disclose the specific messages authorized by the court order.
                </li>
                <li>
                  <strong className="text-white">Due Process:</strong> While we have never had
                  to execute this process in the past, we will not hesitate to do so when
                  presented with lawful judicial authority. Anyone accused of a crime under
                  this process retains the right to due process, full legal representation, and
                  a fair trial in a court of law.
                </li>
              </ol>
            </Section>

          </div>
        </motion.div>
      </div>
    </div>
  );
}
