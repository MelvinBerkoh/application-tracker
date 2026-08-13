export type ManageInterviewActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    occurredAt?: string[];
  };
};