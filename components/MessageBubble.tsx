import type { ChatMessage } from "@/lib/types";

type Props = {
  message: ChatMessage;
  isMine: boolean;
  emphasizeMine?: boolean;
};

export default function MessageBubble({
  message,
  isMine,
  emphasizeMine = false
}: Props) {
  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
  const highlightedOwnMessage = isMine && emphasizeMine;

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`rounded-3xl shadow-sm ${
          isMine
            ? highlightedOwnMessage
              ? "max-w-[84%] rounded-br-md bg-brand px-5 py-4 text-white shadow-md ring-1 ring-brand/20"
              : "max-w-[78%] rounded-br-md bg-brand px-4 py-3 text-white"
            : "rounded-bl-md bg-white text-ink border border-border"
        }`}
      >
        <p
          className={`whitespace-pre-wrap break-words ${
            highlightedOwnMessage
              ? "text-base font-semibold leading-7"
              : "text-sm leading-6"
          }`}
        >
          {message.text}
        </p>
        <p
          className={`mt-1 ${
            highlightedOwnMessage ? "text-xs font-medium" : "text-[11px]"
          } ${
            isMine ? "text-white/75" : "text-muted"
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
}
