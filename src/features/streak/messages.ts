export function getStreakMessage(streak: number): string {
  if (streak <= 0) return "Start your streak! Complete a stage each day to build momentum.";
  if (streak === 1) return "Day one! Come back tomorrow to keep it going.";
  if (streak <= 3) return "Keep it up! Progress comes with regular practice.";
  if (streak <= 6) return "You're building a habit! Nice work.";
  if (streak <= 13) return "A whole week! You're on fire.";
  if (streak <= 29) return "Two weeks strong. Your voice is thanking you.";
  return "Incredible dedication. You're unstoppable.";
}
