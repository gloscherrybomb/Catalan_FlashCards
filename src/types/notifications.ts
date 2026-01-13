export interface NotificationSettings {
  enabled: boolean;
  dueCardReminders: boolean;
  streakReminders: boolean;
  dailyGoalReminders: boolean;
  preferredTime: 'morning' | 'afternoon' | 'evening';
  quietHoursStart: number;
  quietHoursEnd: number;
}
