"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import {
  IconApi,
  IconBellRinging,
  IconBrandWhatsapp,
  IconBuilding,
  IconChartBar,
  IconChevronDown,
  IconCreditCard,
  IconGlobe,
  IconDeviceMobile,
  IconHome,
  IconKey,
  IconLogout,
  IconMail,
  IconMenu2,
  IconReceipt,
  IconSettings,
  IconShieldLock,
  IconUser,
  IconUsers,
  IconWebhook,
} from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

type NavItem = {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  exact?: boolean;
};

type NavGroup = {
  title: string;
  items: NavItem[];
};

const navGroups: NavGroup[] = [
  {
    title: "Main",
    items: [
      { title: "Overview", href: "/dashboard", icon: IconHome },
      { title: "Logs", href: "/dashboard/logs", icon: IconReceipt },
      { title: "Analytics", href: "/dashboard/analytics", icon: IconChartBar },
    ],
  },
  {
    title: "Organization",
    items: [
      { title: "Overview", href: "/dashboard/organization", icon: IconBuilding },
      { title: "Edit Organization", href: "/dashboard/organization/edit", icon: IconSettings },
      { title: "Members", href: "/dashboard/organization/members", icon: IconUsers },
      { title: "Invitations", href: "/dashboard/organization/invitations", icon: IconMail },
      { title: "Domains", href: "/dashboard/organization/domains", icon: IconGlobe, exact: false },
    ],
  },
  {
    title: "Channels",
    items: [
      { title: "Email", href: "/dashboard/channels/email", icon: IconMail },
      { title: "SMS", href: "/dashboard/channels/sms", icon: IconDeviceMobile },
      { title: "WhatsApp", href: "/dashboard/channels/whatsapp", icon: IconBrandWhatsapp },
      { title: "App Push", href: "/dashboard/channels/app-push", icon: IconBellRinging },
    ],
  },
  {
    title: "Developer",
    items: [
      { title: "API Keys", href: "/dashboard/api-keys", icon: IconKey },
      { title: "Webhooks", href: "/dashboard/webhooks", icon: IconWebhook },
      { title: "Events", href: "/dashboard/events", icon: IconApi },
    ],
  },
  {
    title: "Billing",
    items: [
      { title: "Plans", href: "/dashboard/billing/plans", icon: IconCreditCard },
      { title: "Usage", href: "/dashboard/billing/usage", icon: IconChartBar },
      { title: "Credits", href: "/dashboard/billing/credits", icon: IconReceipt },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Profile", href: "/dashboard/account/profile", icon: IconUser },
      { title: "Security", href: "/dashboard/account/security", icon: IconShieldLock },
      {
        title: "Connected Accounts",
        href: "/dashboard/account/connected-accounts",
        icon: IconUsers,
      },
    ],
  },
];

export function isActive(
  pathname: string,
  href: string,
  options: {
    exact?: boolean;
  } = {},
) {
  const exact = options.exact ?? true;

  if (exact) {
    return pathname === href;
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

type DashboardShellProps = {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  organization: {
    name: string;
    slug: string;
    logo?: string | null;
    plan: string;
  };
  role: string;
  children: React.ReactNode;
};

function initials(name?: string | null, email?: string | null) {
  const source = name || email || "TN";
  return source
    .split(/\s|@/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function Breadcrumbs({ pathname }: { pathname: string }) {
  const parts = pathname
    .split("/")
    .filter(Boolean)
    .filter((part) => part !== "dashboard");

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-sm text-muted-foreground">
      <Link href="/dashboard" className="hover:text-foreground">
        Dashboard
      </Link>
      {parts.map((part, index) => {
        const href = `/dashboard/${parts.slice(0, index + 1).join("/")}`;
        const label = part.replaceAll("-", " ");
        return (
          <span key={href} className="flex items-center gap-2">
            <span>/</span>
            <Link href={href} className="capitalize hover:text-foreground">
              {label}
            </Link>
          </span>
        );
      })}
    </nav>
  );
}

function SidebarContent({
  pathname,
  onNavigate,
  organization,
}: {
  pathname: string;
  onNavigate?: () => void;
  organization: DashboardShellProps["organization"];
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden bg-sidebar text-sidebar-foreground">
      <div className="flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border px-4">
        <Avatar className="size-9 rounded-xl">
          <AvatarImage src={organization.logo ?? undefined} alt={organization.name} />
          <AvatarFallback className="rounded-xl">{initials(organization.name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{organization.name}</p>
          <p className="truncate text-xs text-sidebar-foreground/60">{organization.slug}</p>
        </div>
        <Badge variant="secondary" className="ml-auto uppercase">
          {organization.plan.toLowerCase()}
        </Badge>
      </div>
      <ScrollArea className="min-h-0 flex-1">
        <div className="px-3 py-4">
        <div className="space-y-2">
          {navGroups.map((group) => (
            <Collapsible
              key={group.title}
              defaultOpen={group.items.some((item) =>
                isActive(pathname, item.href, { exact: item.exact ?? true }),
              )}
            >
              <CollapsibleTrigger className="flex h-8 w-full items-center justify-between rounded-md px-2 text-xs font-medium uppercase tracking-wide text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
                {group.title}
                <IconChevronDown className="size-3.5" />
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-1 space-y-1">
                {group.items.map((item) => {
                  const active = isActive(pathname, item.href, {
                    exact: item.exact ?? true,
                  });
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={onNavigate}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex h-9 items-center gap-2 rounded-md px-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring",
                        active
                          ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-sm"
                          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      )}
                    >
                      <Icon className="size-4" />
                      <span className="truncate">{item.title}</span>
                      {item.badge ? (
                        <Badge variant="outline" className="ml-auto">
                          {item.badge}
                        </Badge>
                      ) : null}
                    </Link>
                  );
                })}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>
        </div>
      </ScrollArea>
    </div>
  );
}

export function DashboardShell({
  user,
  organization,
  role,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const displayName = user.name || user.email || "Account";
  const currentPage = useMemo(() => {
    const item = navGroups
      .flatMap((group) => group.items)
      .find((entry) => isActive(pathname, entry.href, { exact: entry.exact ?? true }));
    return item?.title ?? "Dashboard";
  }, [pathname]);

  async function signOut() {
    await authClient.signOut();
    router.push("/signIn");
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden h-dvh w-72 overflow-hidden border-r border-sidebar-border bg-sidebar lg:block">
        <SidebarContent pathname={pathname} organization={organization} />
      </aside>
      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/95 px-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 sm:px-6">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open navigation">
                <IconMenu2 className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="h-dvh w-80 overflow-hidden p-0">
              <SheetTitle className="sr-only">Dashboard navigation</SheetTitle>
              <SidebarContent
                pathname={pathname}
                organization={organization}
                onNavigate={() => setOpen(false)}
              />
            </SheetContent>
          </Sheet>

          <div className="min-w-0 flex-1">
            <Breadcrumbs pathname={pathname} />
            <h1 className="truncate text-base font-semibold sm:hidden">{currentPage}</h1>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="gap-2 px-2">
                <Avatar className="size-8">
                  <AvatarImage src={user.image ?? undefined} alt={displayName} />
                  <AvatarFallback>{initials(user.name, user.email)}</AvatarFallback>
                </Avatar>
                <span className="hidden max-w-40 truncate text-sm md:inline">{displayName}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64">
              <DropdownMenuLabel>
                <span className="block truncate">{displayName}</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {role}
                </span>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/account/profile">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/account/security">Security</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => void signOut()} className="text-destructive">
                <IconLogout className="size-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <Separator />
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
