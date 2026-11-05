import { createFileRoute } from "@tanstack/react-router";
import { RoleAccessSettings } from "@/components/admin/RoleAccessSettings";

export const Route = createFileRoute("/admin/volunteers")({
  head: () => ({ meta: [{ title: "Users · Admin" }] }),
  component: UsersPage,
});

function UsersPage() {
  return <RoleAccessSettings defaultTab="users" />;
}