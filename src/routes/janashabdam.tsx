import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { FEATURES } from "@/config/features";

export const Route = createFileRoute("/janashabdam")({
  beforeLoad: () => {
    if (!FEATURES.janashabdam) {
      throw redirect({ to: "/" });
    }
  },
  head: () => ({
    meta: [
      { title: "ജനശബ്ദം · Janashabdam" },
      { name: "description", content: "Citizen issue reporting, public verification, and follow-up for Kerala." },
      { property: "og:title", content: "Janashabdam · ജനശബ്ദം" },
      { property: "og:description", content: "Your voice, our responsibility." },
    ],
  }),
  component: () => <Outlet />,
});
