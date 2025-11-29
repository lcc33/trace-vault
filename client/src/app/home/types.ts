export interface Report {
  _id: string;
  reporterId: string;
  title: string;
  description: string;
  category: string;
  location: string;
  imageUrl?: string;
  status: string;
  user: {
    name?: string;
    email?: string;
    profilePic?: string;
  };
  createdAt: string;
  updatedAt: string;
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