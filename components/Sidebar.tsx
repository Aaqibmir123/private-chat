import type { User } from "@/lib/types";

type Props = {
  users: User[];
  activeUserId: string | null;
  currentUser: User;
  onSelectUser: (user: User) => void;
  onLogout: () => void;
};

export default function Sidebar({
  users,
  activeUserId,
  currentUser,
  onSelectUser,
  onLogout
}: Props) {
  return (
    <aside className="flex h-full flex-col border-r border-border bg-surfaceAlt">
      <div className="border-b border-border px-4 py-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand">
              Private Chat
            </p>
            <h2 className="mt-1 text-lg font-semibold text-ink">
              {currentUser.name}
            </h2>
            <p className="text-sm text-muted">{currentUser.phone}</p>
          </div>
          <button
            onClick={onLogout}
            className="rounded-full border border-border px-3 py-2 text-sm font-medium text-ink transition hover:border-brand hover:text-brand"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 scrollbar-thin">
        <p className="px-2 pb-3 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
          Users
        </p>
        <div className="space-y-2">
          {users.map((user) => {
            const active = activeUserId === user._id;
            return (
              <button
                key={user._id}
                onClick={() => onSelectUser(user)}
                className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition ${
                  active ? "bg-green-50" : "hover:bg-slate-50"
                }`}
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white">
                  {user.name
                    .split(" ")
                    .map((part) => part[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="truncate font-medium text-ink">{user.name}</p>
                  <p className="truncate text-sm text-muted">{user.phone}</p>
                </div>
              </button>
            );
          })}
          {users.length === 0 && (
            <p className="px-2 py-6 text-sm text-muted">
              No other users yet. Register another account to start chatting.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}
