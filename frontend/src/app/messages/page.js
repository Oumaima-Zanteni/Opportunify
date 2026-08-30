"use client";

import { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { api } from "../../lib/api";
import ProtectedRoute from "../../components/ProtectedRoute";
import { useAuth } from "../../context/AuthContext";
import { timeAgo } from "../../lib/constants";

const POLL_INTERVAL = 5000;

function groupByDay(messages) {
  const groups = [];
  let currentKey = null;
  messages.forEach((m) => {
    const key = new Date(m.createdAt).toDateString();
    if (key !== currentKey) {
      groups.push({ key, date: m.createdAt, items: [m] });
      currentKey = key;
    } else {
      groups[groups.length - 1].items.push(m);
    }
  });
  return groups;
}

function dayLabel(date) {
  const d = new Date(date);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return "Hier";
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
}

function hourLabel(date) {
  return new Date(date).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function Avatar({ user, size = "md" }) {
  const sizes = { sm: "h-8 w-8 text-[10px]", md: "h-10 w-10 text-xs", lg: "h-11 w-11 text-sm" };
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-600 to-brand-500 font-semibold text-white ${sizes[size]}`}
    >
      {user?.firstName?.[0]}
      {user?.lastName?.[0]}
    </div>
  );
}

function MessagesContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [conversations, setConversations] = useState([]);
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [mobilePanel, setMobilePanel] = useState("list");

  const scrollRef = useRef(null);
  const activeIdRef = useRef(null);
  const lastMessageAtRef = useRef(null);

  const scrollToBottom = useCallback((smooth = true) => {
    const el = scrollRef.current;
    if (!el) return;
    requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: smooth ? "smooth" : "auto" });
    });
  }, []);

  const openConversation = useCallback(
    async (convId) => {
      try {
        const data = await api.get(`/messages/conversations/${convId}`);
        activeIdRef.current = convId;
        setActive(data.conversation);
        setMessages(data.messages);
        lastMessageAtRef.current = data.messages.at(-1)?.createdAt || null;
        setConversations((prev) => prev.map((c) => (c._id === convId ? { ...c, unreadCount: 0 } : c)));
        setMobilePanel("chat");
        scrollToBottom(false);
      } catch (err) {
        toast.error(err.message);
      }
    },
    [scrollToBottom]
  );

  const startNewConversation = useCallback(
    async (participantId, applicationId) => {
      try {
        const data = await api.post("/messages/conversations", {
          participantId,
          applicationId: applicationId || undefined,
        });
        setConversations((prev) =>
          prev.find((c) => c._id === data.conversation._id) ? prev : [data.conversation, ...prev]
        );
        await openConversation(data.conversation._id);
      } catch (err) {
        toast.error(err.message);
      }
    },
    [openConversation]
  );

  useEffect(() => {
    (async () => {
      try {
        const data = await api.get("/messages/conversations");
        setConversations(data.conversations);

        const toId = searchParams.get("to");
        if (!toId) return;

        const applicationId = searchParams.get("application");
        const found = data.conversations.find(
          (c) =>
            c.participants.some((p) => p._id === toId) &&
            (applicationId ? c.relatedApplication?._id === applicationId : !c.relatedApplication)
        );

        if (found) await openConversation(found._id);
        else await startNewConversation(toId, applicationId);
      } catch {
        toast.error("Impossible de charger les conversations");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    const id = setInterval(async () => {
      try {
        if (activeIdRef.current && lastMessageAtRef.current) {
          const since = encodeURIComponent(lastMessageAtRef.current);
          const data = await api.get(`/messages/conversations/${activeIdRef.current}?since=${since}`);
          if (data.messages.length > 0) {
            setMessages((prev) => {
              const known = new Set(prev.map((m) => m._id));
              const fresh = data.messages.filter((m) => !known.has(m._id));
              return fresh.length ? [...prev, ...fresh] : prev;
            });
            lastMessageAtRef.current = data.messages.at(-1).createdAt;
            scrollToBottom();
          }
        }
        const list = await api.get("/messages/conversations");
        setConversations(
          list.conversations.map((c) => (c._id === activeIdRef.current ? { ...c, unreadCount: 0 } : c))
        );
      } catch {}
    }, POLL_INTERVAL);
    return () => clearInterval(id);
  }, [scrollToBottom]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || !active || sending) return;
    setSending(true);
    setText("");
    try {
      const data = await api.post(`/messages/conversations/${active._id}`, { content });
      setMessages((prev) => [...prev, data.message]);
      lastMessageAtRef.current = data.message.createdAt;
      setConversations((prev) =>
        prev.map((c) =>
          c._id === active._id ? { ...c, lastMessage: data.message, lastMessageAt: data.message.createdAt } : c
        )
      );
      scrollToBottom();
    } catch (err) {
      toast.error(err.message);
      setText(content);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  const otherParticipant = (conv) => conv?.participants?.find((p) => p._id !== user?.id);

  const filtered = conversations.filter((c) => {
    if (!search.trim()) return true;
    const o = otherParticipant(c);
    return `${o?.firstName} ${o?.lastName} ${o?.company || ""}`.toLowerCase().includes(search.toLowerCase());
  });

  const other = otherParticipant(active);
  const groups = groupByDay(messages);

  return (
    <div className="section py-6 lg:py-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-ink sm:text-3xl">Messagerie</h1>
          <p className="mt-1 text-sm text-ink-muted">Discutez avec recruteurs et candidats</p>
        </div>
      </div>

      <div className="mt-5 grid h-[calc(100svh-12rem)] min-h-[520px] gap-0 overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-card lg:grid-cols-[320px_1fr]">
        {/* ===== Colonne de gauche : conversations ===== */}
        <aside
          className={`flex flex-col border-b border-neutral-200 bg-white lg:border-b-0 lg:border-r ${
            mobilePanel === "chat" ? "hidden lg:flex" : "flex"
          }`}
        >
          <div className="shrink-0 border-b border-neutral-100 p-4">
            <div className="relative">
              <svg
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher une conversation…"
                className="input pl-9 text-sm"
              />
            </div>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {loading ? (
              [1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3 border-b border-neutral-50 p-4">
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded-full bg-neutral-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-100" />
                    <div className="h-2.5 w-full animate-pulse rounded bg-neutral-50" />
                  </div>
                </div>
              ))
            ) : filtered.length === 0 ? (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-xl">💬</div>
                <p className="mt-3 text-sm font-semibold text-ink">
                  {search ? "Aucun résultat" : "Aucune conversation"}
                </p>
                <p className="mt-1 text-xs text-ink-muted">
                  {search ? "Essayez un autre nom." : "Contactez quelqu'un depuis une offre."}
                </p>
              </div>
            ) : (
              filtered.map((c) => {
                const o = otherParticipant(c);
                const isActive = active?._id === c._id;
                const unread = c.unreadCount > 0;
                return (
                  <button
                    key={c._id}
                    onClick={() => openConversation(c._id)}
                    className={`flex w-full items-start gap-3 border-b border-neutral-50 px-4 py-3.5 text-left transition ${
                      isActive ? "bg-neutral-50" : "hover:bg-neutral-50"
                    }`}
                  >
                    <div className="relative pt-0.5">
                      <Avatar user={o} />
                      {unread && (
                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-500" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline justify-between gap-2">
                        <p className={`truncate text-sm ${unread ? "font-bold text-ink" : "font-semibold text-ink"}`}>
                          {o?.firstName} {o?.lastName}
                        </p>
                        <span className="shrink-0 text-[10px] text-ink-muted">
                          {c.lastMessage ? timeAgo(c.lastMessage.createdAt) : ""}
                        </span>
                      </div>
                      <p className={`mt-0.5 truncate text-xs leading-relaxed ${unread ? "font-medium text-ink-soft" : "text-ink-muted"}`}>
                        {c.lastMessage
                          ? `${c.lastMessage.sender === user?.id ? "Vous : " : ""}${c.lastMessage.content}`
                          : "Nouvelle conversation"}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </aside>

        {/* ===== Panneau de conversation ===== */}
        <section
          className={`flex min-w-0 flex-col bg-white ${
            mobilePanel === "list" ? "hidden lg:flex" : "flex"
          }`}
        >
          {active ? (
            <>
              {/* En-tête LinkedIn */}
              <header className="flex shrink-0 items-center gap-3 border-b border-neutral-100 px-4 py-3.5">
                <button
                  onClick={() => setMobilePanel("list")}
                  className="rounded-lg p-1.5 text-ink-muted transition hover:bg-neutral-100 hover:text-ink lg:hidden"
                  aria-label="Retour"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <Avatar user={other} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-base font-bold text-ink">
                    {other?.firstName} {other?.lastName}
                  </p>
                  <p className="truncate text-xs text-ink-muted">
                    {other?.title || other?.company || (other?.role === "recruiter" ? "Recruteur" : "Candidat")}
                  </p>
                </div>
                {active.relatedApplication && (
                  <Link
                    href={`/applications/${active.relatedApplication._id}`}
                    className="hidden shrink-0 text-xs font-semibold text-brand-600 hover:underline sm:block"
                  >
                    Voir la candidature →
                  </Link>
                )}
              </header>

              {/* Fil de discussion style LinkedIn */}
              <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto bg-white p-4">
                {messages.length === 0 ? (
                  <div className="flex h-full flex-col items-center justify-center text-center">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-neutral-50 text-2xl">
                      👋
                    </div>
                    <p className="mt-3 font-semibold text-ink">Démarrez la conversation</p>
                    <p className="mt-1 max-w-xs text-sm text-ink-muted">
                      Envoyez un premier message à {other?.firstName} pour lancer l&apos;échange.
                    </p>
                  </div>
                ) : (
                  groups.map((g) => (
                    <div key={g.key} className="space-y-2">
                      <div className="my-5 flex items-center gap-3">
                        <div className="h-px flex-1 bg-neutral-200" />
                        <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-muted">
                          {dayLabel(g.date)}
                        </span>
                        <div className="h-px flex-1 bg-neutral-200" />
                      </div>

                      {g.items.map((m, i) => {
                        const senderId = m.sender?._id || m.sender;
                        const mine = String(senderId) === String(user?.id);
                        const prev = g.items[i - 1];
                        const prevId = prev?.sender?._id || prev?.sender;
                        const sameSender = prev && String(prevId) === String(senderId);
                        const showName = !mine && !sameSender;

                        return (
                          <div
                            key={m._id}
                            className={`flex gap-3 py-0.5 ${mine ? "flex-row-reverse" : "flex-row"}`}
                          >
                            <div className="shrink-0 pt-1">
                              {!mine && (showName ? <Avatar user={m.sender} size="sm" /> : <div className="w-8" />)}
                              {mine && <div className="w-8" />}
                            </div>

                            <div
                              className={`max-w-[85%] sm:max-w-[75%] ${
                                mine ? "items-end" : "items-start"
                              } flex flex-col`}
                            >
                              {showName && !mine && (
                                <span className="mb-0.5 ml-1 text-[11px] font-semibold text-ink-soft">
                                  {m.sender?.firstName} {m.sender?.lastName}
                                </span>
                              )}

                              <div
                                className={`relative px-4 py-2.5 text-sm leading-relaxed ${
                                  mine
                                    ? "rounded-2xl rounded-br-sm bg-brand-600 text-white"
                                    : "rounded-2xl rounded-bl-sm border border-neutral-200 bg-white text-ink shadow-sm"
                                }`}
                              >
                                <p className="whitespace-pre-wrap break-words">{m.content}</p>
                              </div>

                              <span
                                className={`mt-0.5 text-[10px] ${
                                  mine ? "text-ink-muted" : "text-ink-muted"
                                }`}
                              >
                                {hourLabel(m.createdAt)}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>

              {/* Zone de saisie */}
              <form onSubmit={sendMessage} className="shrink-0 border-t border-neutral-100 p-4">
                <div className="flex items-end gap-2 rounded-2xl border border-neutral-200 bg-white p-2 shadow-sm focus-within:border-brand-300 focus-within:ring-2 focus-within:ring-brand-100">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={1}
                    placeholder="Écrivez un message…"
                    className="min-h-[44px] max-h-32 w-full flex-1 resize-none bg-transparent px-3 py-2.5 text-sm outline-none placeholder:text-neutral-400"
                  />
                  <button
                    type="submit"
                    disabled={sending || !text.trim()}
                    className="mb-0.5 flex h-10 w-10 items-center justify-center rounded-full bg-brand-600 text-white shadow-sm transition hover:bg-brand-700 disabled:bg-neutral-300"
                    aria-label="Envoyer"
                  >
                    {sending ? (
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
                    ) : (
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19V5m0 0l-7 7m7-7l7 7" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="mt-1.5 text-[10px] text-ink-muted">Entrée pour envoyer, Maj+Entrée pour une nouvelle ligne</p>
              </form>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-50 to-neutral-100 text-3xl">
                💬
              </div>
              <p className="mt-4 text-lg font-bold text-ink">Aucune conversation sélectionnée</p>
              <p className="mt-1 max-w-sm text-sm text-ink-muted">
                Choisissez une conversation, ou contactez un recruteur depuis une offre.
              </p>
              <Link href="/offers" className="btn-primary mt-5">
                Voir les offres
              </Link>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="section py-20 text-center text-ink-muted">Chargement…</div>}>
        <MessagesContent />
      </Suspense>
    </ProtectedRoute>
  );
}
