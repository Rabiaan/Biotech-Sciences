import { useMemo, useState } from "react";
import { MessageSquare, Mail, CheckCircle2, Circle, X, RefreshCw, ChevronDown, ChevronUp } from "lucide-react";

function groupByEmail(messages) {
  const map = new Map();
  for (const m of messages) {
    const key = (m.email || "").toLowerCase();
    if (!map.has(key)) {
      map.set(key, { email: m.email, name: m.name, items: [] });
    }
    map.get(key).items.push(m);
  }
  const groups = Array.from(map.values());
  for (const g of groups) {
    g.items.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    g.allAnswered = g.items.every((i) => i.answered);
    g.latest = g.items[0];
  }
  groups.sort((a, b) => new Date(b.latest.timestamp) - new Date(a.latest.timestamp));
  return groups;
}

function formatDate(value) {
  const d = new Date(value);
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" }) +
    " " + d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export default function ContactQueries({ messages, loading, onToggle, onRefresh }) {
  const [expanded, setExpanded] = useState({});
  const [updating, setUpdating] = useState(null);
  const [reply, setReply] = useState(null);
  const [replySubject, setReplySubject] = useState("");
  const [replyBody, setReplyBody] = useState("");

  const groups = useMemo(() => groupByEmail(messages || []), [messages]);

  const toggleExpand = (email) =>
    setExpanded((prev) => ({ ...prev, [email]: !prev[email] }));

  const handleToggle = async (msg) => {
    setUpdating(msg.id);
    try {
      await onToggle(msg.id, !msg.answered);
    } finally {
      setUpdating(null);
    }
  };

  const openReply = (email, name, subject) => {
    setReply({ email, name });
    setReplySubject(subject ? `Re: ${subject}` : "");
    setReplyBody("");
  };

  const sendReply = () => {
    if (!reply) return;
    const subject = encodeURIComponent(replySubject || "");
    const body = encodeURIComponent(replyBody || "");
    window.location.href = `mailto:${reply.email}?subject=${subject}&body=${body}`;
    setReply(null);
  };

  const openCount = groups.filter((g) => !g.allAnswered).length;

  if (loading) {
    return (
      <div className="text-xs text-[#19221f]/50 font-mono py-10">
        Loading customer queries...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-syne text-lg font-bold text-[#19221f]">Customer Queries</h3>
          <p className="text-xs text-[#19221f]/50 font-display mt-0.5">
            {groups.length} contact{groups.length === 1 ? "" : "s"} · {openCount} open
          </p>
        </div>
        <button
          onClick={onRefresh}
          className="p-2 bg-white border border-[#19221f]/10 rounded-full hover:bg-neutral-100 text-[#19221f]/70 hover:text-[#19221f] transition-all flex items-center gap-1 text-[10px] uppercase font-mono tracking-wider font-bold shadow-xs"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {groups.length === 0 ? (
        <div className="bg-white rounded-3xl border border-[#19221f]/5 py-20 text-center space-y-3">
          <MessageSquare className="w-10 h-10 mx-auto text-[#19221f]/20" />
          <p className="text-xs text-[#19221f]/50 font-display font-medium">
            No customer queries received yet.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {groups.map((g) => {
            const isOpen = expanded[g.email];
            return (
              <div
                key={g.email}
                className="bg-white rounded-3xl border border-[#19221f]/5 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => toggleExpand(g.email)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left hover:bg-[#f3f6ed]/30 transition-colors"
                >
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#19221f]/5 flex items-center justify-center text-[10px] font-mono font-bold text-[#19221f]/70 uppercase flex-shrink-0">
                      {(g.name || g.email || "U").charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-syne font-bold text-[#19221f] truncate">
                          {g.name || "Unknown"}
                        </h4>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider font-bold ${
                            g.allAnswered
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {g.allAnswered ? "Resolved" : "Open"}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#19221f]/50">
                        <Mail className="w-3 h-3" />
                        <span className="truncate">{g.email}</span>
                        <span className="mx-1">·</span>
                        <span>{g.items.length} message{g.items.length === 1 ? "" : "s"}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-[10px] font-mono text-[#19221f]/40 hidden sm:block">
                      {formatDate(g.latest.timestamp)}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-[#19221f]/40" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-[#19221f]/40" />
                    )}
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-[#19221f]/5 divide-y divide-[#19221f]/5">
                    {g.items.map((m) => (
                      <div key={m.id} className="p-5 flex items-start justify-between gap-4">
                        <div className="space-y-1.5 min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-syne font-bold text-[#19221f] text-sm">
                              {m.subject}
                            </span>
                            {m.answered ? (
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider font-bold text-green-700">
                                <CheckCircle2 className="w-3 h-3" /> Answered
                                {m.answeredAt ? ` · ${formatDate(m.answeredAt)}` : ""}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider font-bold text-amber-700">
                                <Circle className="w-3 h-3" /> Pending
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#19221f]/70 font-display leading-relaxed whitespace-pre-wrap">
                            {m.message}
                          </p>
                          <span className="text-[10px] font-mono text-[#19221f]/40">
                            {formatDate(m.timestamp)}
                          </span>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <button
                            onClick={() => openReply(g.email, g.name, m.subject)}
                            className="text-[10px] font-mono uppercase font-bold px-3 py-1.5 rounded-full border border-[#7a493b]/20 bg-[#7a493b]/5 text-[#7a493b] hover:bg-[#7a493b]/10 transition-all flex items-center gap-1.5"
                          >
                            <Mail className="w-3 h-3" /> Reply by Email
                          </button>
                          <button
                            onClick={() => handleToggle(m)}
                            disabled={updating === m.id}
                            className={`text-[10px] font-mono uppercase font-bold px-3 py-1.5 rounded-full border transition-all ${
                              m.answered
                                ? "border-[#19221f]/15 text-[#19221f]/60 hover:bg-[#19221f]/5"
                                : "border-green-200 bg-green-50 text-green-700 hover:bg-green-100"
                            }`}
                          >
                            {updating === m.id
                              ? "..."
                              : m.answered
                              ? "Reopen"
                              : "Mark Answered"}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {reply && (
        <div
          className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
          onClick={() => setReply(null)}
        >
          <div
            className="bg-white rounded-3xl border border-[#19221f]/5 shadow-2xl w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-[#19221f]/5 flex items-center justify-between">
              <div>
                <h3 className="font-syne text-lg font-bold text-[#19221f]">Reply to Customer</h3>
                <p className="text-[11px] text-[#19221f]/60 font-display mt-0.5">
                  This opens your email client with the reply pre-filled.
                </p>
              </div>
              <button
                onClick={() => setReply(null)}
                className="p-2 hover:bg-[#19221f]/5 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 stroke-[1.5]" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold">
                  To
                </label>
                <input
                  type="email"
                  value={reply.email}
                  readOnly
                  className="w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3 text-xs font-display text-[#19221f]/70"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold">
                  Subject
                </label>
                <input
                  type="text"
                  value={replySubject}
                  onChange={(e) => setReplySubject(e.target.value)}
                  placeholder="Subject"
                  className="w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f]"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-widest text-[#19221f]/50 font-bold">
                  Message
                </label>
                <textarea
                  rows={6}
                  value={replyBody}
                  onChange={(e) => setReplyBody(e.target.value)}
                  placeholder={`Write your reply to ${reply.name || reply.email}...`}
                  className="w-full bg-[#f3f6ed]/40 border border-[#19221f]/10 rounded-xl px-4 py-3 text-xs focus:outline-none focus:border-[#7a493b] font-display text-[#19221f] resize-none"
                />
              </div>
            </div>
            <div className="p-6 border-t border-[#19221f]/5 flex items-center justify-end gap-3">
              <button
                onClick={() => setReply(null)}
                className="px-5 py-3 text-[10px] font-mono font-bold uppercase tracking-widest rounded-full border border-[#19221f]/15 text-[#19221f]/70 hover:bg-[#19221f]/5 transition-all"
              >
                Cancel
              </button>
              <button
                onClick={sendReply}
                className="inline-flex items-center gap-2 bg-[#7a493b] text-white text-[10px] font-mono font-bold uppercase tracking-widest px-5 py-3 rounded-full hover:bg-[#5e3a3f] transition-all shadow-md"
              >
                <Mail className="w-3.5 h-3.5" /> Open Email & Send
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
