import type { ChatMessage } from "@/lib/types";

type Props = {
  message: ChatMessage;
  isMine: boolean;
};

export default function MessageBubble({ message, isMine }: Props) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[78%] rounded-3xl px-4 py-3 shadow-sm ${
          isMine
            ? "rounded-br-md bg-brand text-white"
            : "rounded-bl-md bg-white text-ink border border-border"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm leading-6">
          {message.text}
        </p>
        <p
          className={`mt-1 text-[11px] ${
            isMine ? "text-white/75" : "text-muted"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
