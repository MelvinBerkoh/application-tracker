export type ResumeVersionActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    name?: string[];
  };
};