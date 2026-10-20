"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCallback, useState } from "react";
import {
  DataTable,
  DateText,
  EmptyState,
  PageHeader,
  SearchInput,
  StatusBadge,
} from "@/components/shared";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/toast";
import { useAdminUsers, useUpdateUserStatus } from "@/hooks";
import {
  enumLabel,
  ROLE_OPTIONS,
  SETTABLE_USER_STATUS_OPTIONS,
  type SelectOption,
  USER_STATUS_OPTIONS,
  withAllOption,
} from "@/lib/constants";
import type { AdminUser, SettableUserStatus } from "@/types";

const STATUS_FILTER_ITEMS: SelectOption[] = withAllOption(
  USER_STATUS_OPTIONS,
  "All statuses",
);

const ROLE_FILTER_ITEMS: SelectOption[] = withAllOption(
  ROLE_OPTIONS,
  "All roles",
);

export function UserManagement() {
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [role, setRole] = useState("all");

  const { data, isPending, error, refetch } = useAdminUsers();
  const users = data?.data ?? [];

  const queryClient = useQueryClient();
  const { mutate: updateStatus, isPending: isUpdating } = useUpdateUserStatus();

  const filtered = users.filter((user) => {
    const matchesStatus = status === "all" || user.status === status;
    const matchesRole = role === "all" || user.role === role;
    const term = search.trim().toLowerCase();
    const matchesTerm =
      term === "" ||
      user.name.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term);
    return matchesStatus && matchesRole && matchesTerm;
  });

  const handleStatusChange = useCallback(
    (userId: string, newStatus: SettableUserStatus) => {
      updateStatus(
        {
          userId,
          payload: { status: newStatus },
        },
        {
          onSuccess: () => {
            toast.add({ title: "User status updated", type: "success" });
            queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
          },
          onError: (err) => {
            toast.add({
              title: "Could not update user status",
              description:
                err.message || "Something went wrong. Please try again.",
              type: "error",
            });
          },
        },
      );
    },
    [updateStatus, queryClient],
  );

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title="Users"
        description="Every registered user on the platform — manage their account status here."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search by name or email…"
          className="w-full sm:max-w-md"
        />
        <div className="flex gap-2">
          <Select
            items={ROLE_FILTER_ITEMS}
            value={role}
            onValueChange={(value) => setRole(value ?? "all")}
          >
            <SelectTrigger
              className="w-full sm:w-36"
              aria-label="Filter by role"
            >
              <SelectValue placeholder="All roles" />
            </SelectTrigger>
            <SelectContent>
              {ROLE_FILTER_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            items={STATUS_FILTER_ITEMS}
            value={status}
            onValueChange={(value) => setStatus(value ?? "all")}
          >
            <SelectTrigger
              className="w-full sm:w-40"
              aria-label="Filter by status"
            >
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_FILTER_ITEMS.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <DataTable<AdminUser>
        columns={[
          {
            id: "name",
            header: "Name",
            cell: (user) => (
              <div className="flex flex-col">
                <span className="font-medium">{user.name}</span>
                <span className="text-muted-foreground text-xs">
                  {user.email}
                </span>
              </div>
            ),
          },
          {
            id: "role",
            header: "Role",
            cell: (user) => (
              <span className="font-medium">
                {enumLabel(ROLE_OPTIONS, user.role) ?? user.role}
              </span>
            ),
          },
          {
            id: "status",
            header: "Status",
            cell: (user) => <StatusBadge status={user.status} />,
          },
          {
            id: "joined",
            header: "Joined",
            cell: (user) => (
              <DateText
                value={user.createdAt}
                className="text-muted-foreground text-sm"
              />
            ),
          },
          {
            id: "actions",
            header: "",
            headerClassName: "w-32",
            cell: (user) => {
              if (user.role === "ADMIN") {
                return (
                  <span className="text-muted-foreground text-xs">
                    Protected
                  </span>
                );
              }
              return (
                <div className="flex justify-end">
                  <Select
                    items={SETTABLE_USER_STATUS_OPTIONS}
                    value={user.status}
                    onValueChange={(value) => {
                      if (value && value !== user.status) {
                        handleStatusChange(
                          user.id,
                          value as SettableUserStatus,
                        );
                      }
                    }}
                  >
                    <SelectTrigger
                      className="w-32"
                      disabled={isUpdating}
                      aria-label={`Change status for ${user.name}`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SETTABLE_USER_STATUS_OPTIONS.map((item) => (
                        <SelectItem key={item.value} value={item.value}>
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              );
            },
          },
        ]}
        data={filtered}
        getRowKey={(user) => user.id}
        isLoading={isPending}
        error={error}
        onRetry={refetch}
        emptyState={
          <EmptyState
            title={
              users.length === 0
                ? "No users yet"
                : "No users match your filters"
            }
            description={
              users.length === 0
                ? "When users register they will appear here."
                : "Try a different search term, role, or status."
            }
          />
        }
      />
    </div>
  );
}
