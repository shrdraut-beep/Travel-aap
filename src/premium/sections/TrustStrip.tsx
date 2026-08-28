import React from "react";
import { motion } from "framer-motion";
import { Headphones, ShieldCheck, Wallet2, Wand2 } from "lucide-react";

const ITEMS = [
  {
    icon: Wand2,
    title: "AI itineraries",
    copy: "Describe the trip; get a day-by-day plan in seconds."
  },
  {
    icon: Wallet2,
    title: "Transparent fares",
    copy: "Taxes and fees shown upfront — no surprises at checkout."
  },
  {
    icon: ShieldCheck,
    title: "Protected payments",
    copy: "Bank-grade encryption on every booking and refund."
  },
  {
    icon: Headphones,
    title: "24×7 support",
    copy: "Real people on chat and call, wherever you are."
  }
];

export const TrustStrip: React.FC = () => (
  <section className="border-y border-slate-100 bg-white">
    <div className="mx-auto grid max-w-[1200px] gap-8 px-5 py-14 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
      {ITEMS.map((item, index) => (
        <motion.div
          key={item.title}
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 0.4, delay: index * 0.06 }}
          className="flex gap-4"
        >
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-slate-900/[0.04] text-slate-900">
            <item.icon className="h-5 w-5" />
          </span>
          <div>
            <p className="text-[15px] font-bold tracking-tight text-slate-900">
              {item.title}
            </p>
            <p className="mt-1 text-[13.5px] leading-relaxed text-slate-500">
              {item.copy}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  </section>
);
