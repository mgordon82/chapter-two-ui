export type IssueCategory =
  | 'DISCRIMINATION'
  | 'RETALIATION'
  | 'HARASSMENT'
  | 'WAGE_ISSUES'
  | 'LEAVE_RIGHTS'
  | 'ADA_ACCESS'
  | 'GENERAL_FAIRNESS';

export interface InsightItem {
  id: string;
  category: IssueCategory;
  title: string;
  description: string;
  confidence: 'LOW' | 'MEDIUM' | 'HIGH';
  suggestedNextStep: string;
}
