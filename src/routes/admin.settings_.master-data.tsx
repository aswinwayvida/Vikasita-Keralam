import { createFileRoute } from "@tanstack/react-router";

import { EligibilityMasterDataSettings } from "@/components/admin/EligibilityMasterDataSettings";

export const Route = createFileRoute("/admin/settings_/master-data")({
  head: () => ({
    meta: [
      { title: "Eligibility Master Data · Settings" },
      {
        name: "description",
        content: "Manage standard eligibility master values and options.",
      },
    ],
  }),
  component: EligibilityMasterDataSettings,
});
