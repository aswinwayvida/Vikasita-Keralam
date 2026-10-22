import { applications } from "@/data/applications";

export type QueueStage =
  "New" | "Checking documents" | "Ready to submit" | "Follow-up needed" | "Completed";

export type AdminApplication = (typeof applications)[number] & {
  queueStage: QueueStage;
  reviewer: string;
  ageHours: number;
  documentCount: number;
  reference: string;
  email: string;
  submittedAt: string;
};

export const applicationStages: QueueStage[] = [
  "New",
  "Checking documents",
  "Ready to submit",
  "Follow-up needed",
  "Completed",
];
export const applicationReviewers = [
  "Not assigned",
  "Anitha K.",
  "Rahul M.",
  "Nithya S.",
  "District desk",
];

export const adminApplications: AdminApplication[] = applications.map((application, index) => {
  const queueStage = applicationStages[index % applicationStages.length];
  const documentCount =
    queueStage === "New" ? 2 : queueStage === "Checking documents" ? 3 + (index % 2) : 5;

  return {
    ...application,
    queueStage,
    reviewer: applicationReviewers[index % applicationReviewers.length],
    ageHours: 3 + ((index * 7) % 76),
    documentCount,
    reference: `VK-${String(260800 + index).padStart(6, "0")}`,
    email: `applicant${String(index + 1).padStart(3, "0")}@example.com`,
    submittedAt: application.createdAt,
  };
});

export const adminApplicationMetrics = {
  total: adminApplications.length,
  open: adminApplications.filter((item) => item.queueStage !== "Completed").length,
  waitingOver24Hours: adminApplications.filter(
    (item) => item.queueStage !== "Completed" && item.ageHours >= 24,
  ).length,
  documentsNeeded: adminApplications.filter(
    (item) => item.queueStage !== "Completed" && item.documentCount < 5,
  ).length,
  delayed: adminApplications.filter((item) => item.queueStage !== "Completed" && item.ageHours > 48)
    .length,
  unassigned: adminApplications.filter(
    (item) => item.queueStage !== "Completed" && item.reviewer === "Not assigned",
  ).length,
  stageCounts: Object.fromEntries(
    applicationStages.map((stage) => [
      stage,
      adminApplications.filter((item) => item.queueStage === stage).length,
    ]),
  ) as Record<QueueStage, number>,
  newUnassigned: adminApplications.filter(
    (item) => item.queueStage === "New" && item.reviewer === "Not assigned",
  ).length,
  documentRepliesNeeded: adminApplications.filter(
    (item) => item.queueStage === "Checking documents" && item.documentCount < 5,
  ).length,
  readyInPlatform: adminApplications.filter((item) => item.queueStage === "Ready to submit").length,
  followUpsWaiting: adminApplications.filter(
    (item) => item.queueStage === "Follow-up needed" && item.ageHours >= 24,
  ).length,
};
export function formatWaitingTime(hours: number) {
  if (hours <= 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days} ${days === 1 ? "day" : "days"}`;
}

export function maskPhone(value: string) {
  return `\u2022\u2022\u2022\u2022\u2022\u2022${value.slice(-4)}`;
}

export function maskEmail(value: string) {
  const [name, domain] = value.split("@");
  if (!name || !domain) return value;
  return `${name.slice(0, 2)}\u2022\u2022\u2022@${domain}`;
}
