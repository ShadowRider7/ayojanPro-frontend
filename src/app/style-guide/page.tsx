"use client";

import { SettingsIcon, UserIcon } from "lucide-react";
import { useState } from "react";
import {
  ConfirmDialog,
  CurrencyText,
  DataTable,
  type DataTableColumn,
  DateText,
  EmptyState,
  ErrorState,
  FileUpload,
  PageHeader,
  PaginationBar,
  SearchInput,
  StatusBadge,
} from "@/components/shared";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Spinner } from "@/components/ui/spinner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

const STATUSES = [
  "DRAFT",
  "PUBLISHED",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "ACCEPTED",
  "WITHDRAWN",
  "OPEN",
  "FILLED",
  "DELIVERED",
  "DISPUTED",
];

const SELECT_ITEMS = [
  { value: "PHOTOGRAPHY", label: "Photography" },
  { value: "VIDEOGRAPHY", label: "Videography" },
  { value: "DECORATION", label: "Decoration" },
];

type DemoRow = {
  id: string;
  title: string;
  status: string;
  budget: number;
  createdAt: string;
};

const DEMO_ROWS: DemoRow[] = [
  {
    id: "evt_1",
    title: "Rahim & Karima Wedding",
    status: "PUBLISHED",
    budget: 250000,
    createdAt: "2026-05-02T10:00:00.000Z",
  },
  {
    id: "evt_2",
    title: "TechCorp Annual Gala",
    status: "IN_PROGRESS",
    budget: 480000,
    createdAt: "2026-04-18T09:30:00.000Z",
  },
  {
    id: "evt_3",
    title: "University Convocation",
    status: "DRAFT",
    budget: 120000,
    createdAt: "2026-04-09T14:15:00.000Z",
  },
];

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}

export default function StyleGuidePage() {
  const [search, setSearch] = useState("");
  const [select, setSelect] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [page, setPage] = useState(2);
  const [files, setFiles] = useState<File[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const columns: DataTableColumn<DemoRow>[] = [
    { id: "title", header: "Event", cell: (row) => row.title },
    {
      id: "status",
      header: "Status",
      cell: (row) => <StatusBadge status={row.status} />,
    },
    {
      id: "budget",
      header: "Budget",
      headerClassName: "text-right",
      className: "text-right",
      cell: (row) => <CurrencyText value={row.budget} />,
    },
    {
      id: "createdAt",
      header: "Created",
      cell: (row) => <DateText value={row.createdAt} mode="relative" />,
    },
  ];

  return (
    <main className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-6">
      <PageHeader
        title="Style guide"
        description="Task 2 preview of the UI kit and shared components. Remove in Task 22."
      >
        <Button variant="outline">Secondary action</Button>
        <Button>Primary action</Button>
      </PageHeader>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-2">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button size="xs">Extra small</Button>
          <Button size="sm">Small</Button>
          <Button size="lg">Large</Button>
          <Button size="icon" aria-label="Icon button">
            <Spinner />
          </Button>
        </div>
      </Section>

      <Section
        title="Status badges"
        description="Every backend status resolves to a tone via STATUS_TONES."
      >
        <div className="flex flex-wrap gap-2">
          {STATUSES.map((status) => (
            <StatusBadge key={status} status={status} />
          ))}
          <StatusBadge status="UNKNOWN_VALUE" />
        </div>
        <Separator />
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </Section>

      <Section title="Avatar & menu">
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            <AvatarFallback>AP</AvatarFallback>
          </Avatar>
          <Avatar>
            <AvatarFallback>AP</AvatarFallback>
          </Avatar>
          <Avatar size="lg">
            <AvatarFallback>AP</AvatarFallback>
          </Avatar>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger render={<Button variant="outline" />}>
            Open menu
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-48">
            <DropdownMenuLabel>My account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              <UserIcon /> Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <SettingsIcon /> Settings
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </Section>

      <Section title="Text, currency & dates">
        <div className="flex flex-wrap gap-6">
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Currency</span>
            <CurrencyText value={250000} />
            <CurrencyText value="1234.5" />
            <CurrencyText value={null} />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">Date</span>
            <DateText value="2026-05-02T10:00:00.000Z" />
            <DateText value="2026-05-02T10:00:00.000Z" mode="datetime" />
            <DateText value="2026-05-02T10:00:00.000Z" mode="relative" />
          </div>
        </div>
      </Section>

      <Section title="Form controls">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sg-name">Event name</Label>
            <Input id="sg-name" placeholder="Rahim & Karima Wedding" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="sg-service">Service</Label>
            <Select
              items={SELECT_ITEMS}
              value={select}
              onValueChange={(value) => setSelect(value ?? "")}
            >
              <SelectTrigger id="sg-service" className="w-full">
                <SelectValue placeholder="Choose a service" />
              </SelectTrigger>
              <SelectContent>
                {SELECT_ITEMS.map((item) => (
                  <SelectItem key={item.value} value={item.value}>
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sg-notes">Notes</Label>
          <Textarea id="sg-notes" placeholder="Anything the team should know" />
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Checkbox id="sg-bookings" defaultChecked />
          <Label htmlFor="sg-bookings">Accepting new bookings</Label>
        </div>
        <div className="flex items-center gap-3">
          <InputOTP maxLength={6} value={otp} onChange={setOtp}>
            <InputOTPGroup>
              {[0, 1, 2].map((slot) => (
                <InputOTPSlot key={slot} index={slot} />
              ))}
            </InputOTPGroup>
            <InputOTPSeparator />
            <InputOTPGroup>
              {[3, 4, 5].map((slot) => (
                <InputOTPSlot key={slot} index={slot} />
              ))}
            </InputOTPGroup>
          </InputOTP>
          <span className="text-sm text-muted-foreground">
            {otp ? otp : "6-digit code"}
          </span>
        </div>
      </Section>

      <Section
        title="Search input"
        description="Debounced by 300ms; try typing."
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search events…"
          className="max-w-sm"
        />
        <p className="text-sm text-muted-foreground">Value: {search || "—"}</p>
      </Section>

      <Section title="Tabs, skeletons & states">
        <Tabs defaultValue="overview">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>
          <TabsContent value="overview" className="text-sm">
            Overview panel content.
          </TabsContent>
          <TabsContent value="activity" className="text-sm">
            Activity panel content.
          </TabsContent>
        </Tabs>
        <div className="flex gap-3">
          <Skeleton className="size-11 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <EmptyState
          title="No events yet"
          description="Create your first event to start receiving proposals."
          action={<Button size="sm">Create event</Button>}
        />
        <ErrorState
          description="We could not load this list."
          onRetry={() => undefined}
        />
      </Section>

      <Section
        title="Data table"
        description="Uniform loading / empty / error handling."
      >
        <DataTable
          columns={columns}
          data={DEMO_ROWS}
          getRowKey={(row) => row.id}
        />
        <DataTable
          columns={columns}
          data={[]}
          getRowKey={(row: DemoRow) => row.id}
        />
        <DataTable
          columns={columns}
          data={undefined}
          isLoading
          getRowKey={(row: DemoRow) => row.id}
        />
      </Section>

      <Section title="Pagination">
        <PaginationBar
          page={page}
          totalPages={12}
          onPageChange={setPage}
          showSummary
          totalItems={120}
          pageSize={10}
        />
      </Section>

      <Section title="File upload">
        <FileUpload
          value={files}
          onChange={setFiles}
          accept="image/*,.pdf"
          multiple
          description="PNG, JPG or PDF up to 5 MB each."
          className="max-w-lg"
        />
      </Section>

      <Section title="Confirm dialog">
        <Button variant="destructive" onClick={() => setConfirmOpen(true)}>
          Delete event
        </Button>
        <ConfirmDialog
          open={confirmOpen}
          onOpenChange={setConfirmOpen}
          title="Delete this event?"
          description="This action cannot be undone. All requirements and proposals will be removed."
          confirmLabel="Delete"
          onConfirm={() => setConfirmOpen(false)}
        />
      </Section>
    </main>
  );
}
