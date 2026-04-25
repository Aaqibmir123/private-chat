import type { ChatMessage, User } from "@/lib/types";
import MessageBubble from "./MessageBubble";

type Props = {
  currentUser: User;
  selectedUser: User | null;
  messages: ChatMessage[];
  messageText: string;
  onMessageTextChange: (value: string) => void;
  onSend: () => void;
  onBack: () => void;
  loading: boolean;
  error: string;
  typing: boolean;
  mobileOnlyShowBack: boolean;
};

export default function ChatWindow({
  currentUser,
  selectedUser,
  messages,
  messageText,
  onMessageTextChange,
  onSend,
  onBack,
  loading,
  error,
  typing,
  mobileOnlyShowBack
}: Props) {
  if (!selectedUser) {
    return (
      <div className="flex h-full items-center justify-center bg-[linear-gradient(180deg,rgba(255,255,255,0.6),rgba(255,255,255,0.9))] p-6">
        <div className="max-w-md rounded-3xl border border-dashed border-border bg-white/80 p-8 text-center shadow-soft">
          <h3 className="text-2xl font-semibold text-ink">Pick a user</h3>
          <p className="mt-3 text-sm leading-6 text-muted">
            Select someone from the list to open a private chat.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex h-full flex-col bg-[linear-gradient(180deg,rgba(244,247,245,0.65),rgba(232,240,235,0.9))]">
      <header className="flex items-center gap-3 border-b border-border bg-surfaceAlt px-4 py-4">
        {mobileOnlyShowBack && (
          <button
            onClick={onBack}
            className="rounded-full border border-border px-3 py-2 text-sm font-medium text-ink lg:hidden"
          >
            Back
          </button>
        )}
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
          {selectedUser.name
            .split(" ")
            .map((part) => part[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </div>
        <div className="min-w-0">
          <h2 className="truncate text-base font-semibold text-ink">
            {selectedUser.name}
          </h2>
          <p className="truncate text-sm text-muted">{selectedUser.phone}</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-5 scrollbar-thin">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-muted">
            Loading messages...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="max-w-md rounded-3xl border border-dashed border-border bg-white/80 p-8 text-center">
              <h3 className="text-xl font-semibold text-ink">Empty chat</h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                Send the first message to start the conversation with{" "}
                {selectedUser.name}.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => (
              <MessageBubble
                key={message._id}
                message={message}
                isMine={message.senderId === currentUser._id}
              />
            ))}
          </div>
        )}
      </div>

      {typing && (
        <div className="px-4 pb-2 text-sm text-muted">
          {selectedUser.name} is typing...
        </div>
      )}

      {error && (
        <div className="px-4 pb-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="border-t border-border bg-surfaceAlt p-4">
        <div className="flex items-end gap-3">
          <textarea
            value={messageText}
            onChange={(e) => onMessageTextChange(e.target.value)}
            placeholder={`Message ${selectedUser.name}`}
            rows={1}
            className="max-h-36 flex-1 resize-none rounded-2xl border border-border bg-white px-4 py-3 outline-none transition focus:border-brand"
          />
          <button
            onClick={onSend}
            disabled={!messageText.trim()}
            className="rounded-2xl bg-brand px-5 py-3 font-medium text-white transition hover:bg-brandDeep disabled:cursor-not-allowed disabled:opacity-60"
          >
            Send
          </button>
        </div>
      </div>
    </section>
  );
}
