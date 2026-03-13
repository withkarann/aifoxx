export interface Category {
  name: string;
  subcategories: string[];
}

export const CATEGORIES: Category[] = [
  { name: "Marketing", subcategories: ["SEO", "Ads", "Social Media", "Email"] },
  { name: "Content Creation", subcategories: ["Writing", "Blogging", "Copywriting"] },
  { name: "Coding", subcategories: ["Code Generation", "Code Review", "DevOps", "Testing"] },
  { name: "Design", subcategories: ["Image Generation", "UI/UX", "Logo"] },
  { name: "Video", subcategories: ["Generation", "Editing", "Subtitles"] },
  { name: "Productivity", subcategories: ["Automation", "Notes", "Scheduling"] },
  { name: "Research", subcategories: ["Search", "Summarization", "Data Analysis"] },
  { name: "Business", subcategories: ["Finance", "HR", "Legal", "Sales"] },
];
