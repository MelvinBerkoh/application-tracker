export type ImportedJobPosting = {
  jobUrl: string;
  companyName?: string;
  roleTitle?: string;
  jobDescription?: string;
  location?: string;
  workArrangement?: "ONSITE" | "HYBRID" | "REMOTE";
  salaryMin?: number;
  salaryMax?: number;
  salaryCurrency?: string;
  source?: string;
};

export type ImportJobPostingActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  data?: ImportedJobPosting;
  fieldErrors?: {
    jobUrl?: string[];
  };
};