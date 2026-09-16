export interface AccessLog {
  id: string;
  userId: string;
  appSlug: string;
  launchedAt: Date;
  userName?: string;
  userEmail?: string;
}
