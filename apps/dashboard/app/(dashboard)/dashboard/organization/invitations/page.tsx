import { db, eq, invitation } from "@trynotifly/db";
import { ActionSubmit } from "@/components/dashboard/action-submit";
import { ServerActionForm } from "@/components/dashboard/server-action-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDashboardContext } from "@/lib/dashboard-context";
import { resendInvitationAction, revokeInvitationAction } from "../actions";

function inviteStatus(status: string, expiresAt: Date) {
  if (status === "pending" && expiresAt <= new Date()) {
    return "expired";
  }

  return status;
}

export default async function InvitationsPage() {
  const { organization, role } = await getDashboardContext();
  const canManage = role === "owner" || role === "admin";
  const invitations = await db.query.invitation.findMany({
    where: eq(invitation.organizationId, organization.id),
    with: {
      user: true,
    },
    orderBy: (table, { desc }) => [desc(table.createdAt)],
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Organization</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Invitations</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Track pending, accepted, expired, and revoked workspace invitations.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Invitation history</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Invited by</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invitations.map((item) => {
                const status = inviteStatus(item.status, item.expiresAt);
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.email}</TableCell>
                    <TableCell>{item.role ?? "member"}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          status === "accepted"
                            ? "default"
                            : status === "pending"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.expiresAt.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.user.name ?? item.user.email}
                    </TableCell>
                    <TableCell className="space-x-2 text-right">
                      <ServerActionForm action={resendInvitationAction} className="inline-flex">
                        <input type="hidden" name="invitationId" value={item.id} />
                        <ActionSubmit
                          variant="outline"
                          pendingLabel="Resending"
                          className={!canManage || status !== "pending" ? "hidden" : undefined}
                        >
                          Resend
                        </ActionSubmit>
                      </ServerActionForm>
                      <ServerActionForm action={revokeInvitationAction} className="inline-flex">
                        <input type="hidden" name="invitationId" value={item.id} />
                        <ActionSubmit
                          variant="destructive"
                          pendingLabel="Revoking"
                          className={!canManage || status !== "pending" ? "hidden" : undefined}
                        >
                          Revoke
                        </ActionSubmit>
                      </ServerActionForm>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          {invitations.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No invitations have been sent yet.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
