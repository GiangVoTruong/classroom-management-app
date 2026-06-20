import { useEffect, useRef, useState } from 'react';
import { useSocket } from '../hooks/useSocket';

function normalizePhone(phone) {
  return String(phone).replace(/\D/g, '');
}

function messageKey(msg) {
  return `${msg.from}|${msg.to}|${msg.timestamp}|${msg.text}`;
}

function isSameConversation(msg, myPhone, otherPhone) {
  const mine = normalizePhone(myPhone);
  const other = normalizePhone(otherPhone);
  const from = normalizePhone(msg.from);
  const to = normalizePhone(msg.to);
  return (from === other && to === mine) || (from === mine && to === other);
}

export default function Chat({
  myPhone,
  otherPhone,
  contacts = [],
  onSelectContact,
  selectedContact,
}) {
  const [messages, setMessages] = useState([]);
  const [lastMessages, setLastMessages] = useState({});
  const [text, setText] = useState('');
  const [search, setSearch] = useState('');
  const { socketRef, ready } = useSocket(myPhone, 'chat');
  const bottomRef = useRef(null);

  const activePhone = otherPhone || selectedContact;
  const myPhoneNorm = normalizePhone(myPhone);

  const updateLastMessage = (msg) => {
    const from = normalizePhone(msg.from);
    const to = normalizePhone(msg.to);
    const other = from === myPhoneNorm ? to : from;
    setLastMessages((prev) => ({ ...prev, [other]: msg.text }));
  };

  useEffect(() => {
    const socket = socketRef.current;
    if (!ready || !socket || !contacts.length) return;

    contacts.forEach((c) => {
      const contactPhone = normalizePhone(c.phone);
      socket.emit('getHistory', { phone1: myPhone, phone2: c.phone }, (res) => {
        const msgs = res?.messages || [];
        const last = msgs[msgs.length - 1];
        if (last) {
          setLastMessages((prev) => ({ ...prev, [contactPhone]: last.text }));
        }
      });
    });
  }, [myPhone, contacts, ready, socketRef]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!ready || !socket) return;

    const onPreview = (msg) => {
      const from = normalizePhone(msg.from);
      const to = normalizePhone(msg.to);
      if (from === myPhoneNorm || to === myPhoneNorm) updateLastMessage(msg);
    };

    socket.on('receiveMessage', onPreview);
    socket.on('messageSent', onPreview);

    return () => {
      socket.off('receiveMessage', onPreview);
      socket.off('messageSent', onPreview);
    };
  }, [myPhoneNorm, ready, socketRef]);

  useEffect(() => {
    const socket = socketRef.current;
    if (!ready || !socket || !activePhone) return;

    socket.emit('getHistory', { phone1: myPhone, phone2: activePhone }, (res) => {
      setMessages(res?.messages || []);
    });

    const appendMessage = (msg) => {
      if (!isSameConversation(msg, myPhone, activePhone)) return;

      setMessages((prev) => {
        const key = messageKey(msg);
        if (prev.some((m) => messageKey(m) === key)) return prev;
        return [...prev, msg];
      });
      updateLastMessage(msg);
    };

    const onIncoming = (msg) => {
      if (normalizePhone(msg.from) === normalizePhone(activePhone)) appendMessage(msg);
    };

    const onOutgoing = (msg) => {
      if (normalizePhone(msg.from) === myPhoneNorm) appendMessage(msg);
    };

    socket.on('receiveMessage', onIncoming);
    socket.on('messageSent', onOutgoing);

    return () => {
      socket.off('receiveMessage', onIncoming);
      socket.off('messageSent', onOutgoing);
    };
  }, [myPhone, myPhoneNorm, activePhone, ready, socketRef]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = (e) => {
    e?.preventDefault();
    if (!text.trim() || !socketRef.current || !activePhone) return;
    socketRef.current.emit('sendMessage', {
      from: myPhone,
      to: activePhone,
      text: text.trim(),
    });
    setText('');
  };

  const filtered = contacts.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="messages-layout">
      <div className="messages-list-panel">
        <h2 className="section-title">All Message</h2>
        <input
          className="filter-input"
          placeholder="Filter"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <div className="contact-list">
          {filtered.map((c) => (
            <button
              key={c.phone}
              type="button"
              className={`contact-item ${activePhone === c.phone ? 'active' : ''}`}
              onClick={() => onSelectContact?.(c.phone)}
            >
              <div className="contact-avatar">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <circle cx="12" cy="8" r="4" />
                  <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
                </svg>
              </div>
              <div className="contact-info">
                <strong>{c.name}</strong>
                <span>{lastMessages[normalizePhone(c.phone)] || ''}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="messages-chat-panel">
        {activePhone ? (
          <>
            <div className="chat-messages-area">
              {messages.map((m) => (
                <div
                  key={messageKey(m)}
                  className={`chat-msg ${normalizePhone(m.from) === myPhoneNorm ? 'outgoing' : 'incoming'}`}
                >
                  {m.text}
                </div>
              ))}
              <div ref={bottomRef} />
            </div>
            <form className="chat-reply-bar" onSubmit={send}>
              <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Reply message"
              />
              <button type="submit" className="chat-send-btn" disabled={!text.trim()} aria-label="Send">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                </svg>
              </button>
            </form>
          </>
        ) : (
          <div className="chat-placeholder">Select a conversation</div>
        )}
      </div>
    </div>
  );
}
