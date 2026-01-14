export interface User {
  name?: string | null;
  profilePic?: string | null;
}

export interface Report {
  _id: string;
  reporterId: string;
  description: string;
  category: string;
  whatsappNumber?: string;
  imageUrl?: string;
  status: "open" | "claimed";
  user: User;
  createdAt: string;
  claimed_at?: string | null;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  hasNext: boolean;
  totalPages: number;
}

export interface ReportsResponse {
  reports: Report[];
  pagination: Pagination;
}
