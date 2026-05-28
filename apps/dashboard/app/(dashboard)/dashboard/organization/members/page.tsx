import { db, eq, member } from "@trynotifly/db";
import { ActionSubmit } from "@/components/dashboard/action-submit";
import { ServerActionForm } from "@/components/dashboard/server-action-form";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getDashboardContext } from "@/lib/dashboard-context";
import {
  inviteMemberAction,
  removeMemberAction,
  updateMemberRoleAction,
} from "../actions";

export default async function MembersPage() {
  const { organization, role } = await getDashboardContext();
  const canManage = role === "owner" || role === "admin";
  const members = await db.query.member.findMany({
    where: eq(member.organizationId, organization.id),
    with: {
      user: true,
    },
    orderBy: (table, { asc }) => [asc(table.createdAt)],
  });

  return (
    <div className="mx-auto flex max-w-7xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Organization</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Members</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Manage workspace access. Owners and admins can invite teammates and update roles.
        </p>
      </div>

      <section className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <CardTitle>Invite teammate</CardTitle>
          </CardHeader>
          <CardContent>
            <ServerActionForm action={inviteMemberAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" name="email" placeholder="teammate@example.com" disabled={!canManage} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  name="role"
                  defaultValue="member"
                  disabled={!canManage}
                  className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <ActionSubmit className={!canManage ? "hidden" : "w-full"} pendingLabel="Sending...">
                Send invitation
              </ActionSubmit>
            </ServerActionForm>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Team</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {members.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <div className="font-medium">{item.user.name}</div>
                      <div className="text-xs text-muted-foreground">{item.user.email}</div>
                    </TableCell>
                    <TableCell>
                      {canManage ? (
                        <ServerActionForm action={updateMemberRoleAction} className="flex items-center gap-2">
                          <input type="hidden" name="memberId" value={item.id} />
                          <select
                            name="role"
                            defaultValue={item.role}
                            className="h-9 w-32 rounded-md border border-input bg-background px-3 text-sm"
                          >
                            <option value="owner">Owner</option>
                            <option value="admin">Admin</option>
                            <option value="member">Member</option>
                          </select>
                          <ActionSubmit variant="outline" pendingLabel="Saving">
                            Save
                          </ActionSubmit>
                        </ServerActionForm>
                      ) : (
                        <Badge variant="secondary">{item.role}</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {item.createdAt.toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <ServerActionForm action={removeMemberAction} className="inline-flex">
                        <input type="hidden" name="memberId" value={item.id} />
                        <ActionSubmit
                          variant="destructive"
                          pendingLabel="Removing"
                          className={!canManage ? "hidden" : undefined}
                        >
                          Remove
                        </ActionSubmit>
                      </ServerActionForm>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {members.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No members found.
              </div>
            ) : null}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
