export interface Notification {
  id: string;
  type: string;
  title: string;
  description: string;
  read: boolean;
  /**
   * ISO timestamp from the backend. Optional for locally created notifications.
   */
  createdAt?: string;
  /**
   * Human-friendly relative time derived from createdAt. Optional for local data.
   */
  time?: string;
  relatedId?: string;
}
