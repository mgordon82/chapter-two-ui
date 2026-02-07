import { type InsightItem } from '../types/insights';

export const mockInsights: InsightItem[] = [
  {
    id: 'insight-1',
    category: 'LEAVE_RIGHTS',
    title: 'Possible issues around medical leave or accommodations',
    description:
      'Parts of your story suggest there may be tension around medical leave, disability, or reasonable accommodations. This could involve how your employer handled requests, documentation, or changes to your role.',
    confidence: 'MEDIUM',
    suggestedNextStep:
      'Write down a timeline of key events related to your leave or accommodations, including dates, emails, and conversations. This will make it easier to compare your experience to relevant laws later.'
  },
  {
    id: 'insight-2',
    category: 'RETALIATION',
    title: 'Potential retaliation concerns',
    description:
      'You mentioned changes in treatment after you spoke up or asked for help. In some situations, negative actions after a protected request can raise retaliation concerns.',
    confidence: 'LOW',
    suggestedNextStep:
      'Note any changes that happened shortly after you reported an issue or asked for help, such as shifts in schedule, duties, performance reviews, or tone from leadership.'
  },
  {
    id: 'insight-3',
    category: 'GENERAL_FAIRNESS',
    title: 'Emotional impact matters',
    description:
      'How you feel about what happened is important. Even before applying legal standards, feeling confused, anxious, or unsafe at work is a signal that something deserves attention.',
    confidence: 'HIGH',
    suggestedNextStep:
      'Consider journaling how this situation is affecting your sleep, health, and daily life. This can help you decide what kind of support or next steps feel right.'
  }
];
