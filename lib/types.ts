export type User = {
  _id: string;
  name: string;
  phone: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type ChatMessage = {
  _id: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
};
