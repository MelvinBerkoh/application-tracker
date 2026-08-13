export type ScheduleInterviewActionState = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: {
    title?: string[];
    occurredAt?: string[];
    description?: string[];
  };
};