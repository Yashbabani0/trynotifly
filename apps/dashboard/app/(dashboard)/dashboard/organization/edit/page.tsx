import { ActionSubmit } from "@/components/dashboard/action-submit";
import { ServerActionForm } from "@/components/dashboard/server-action-form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDashboardContext } from "@/lib/dashboard-context";
import { updateOrganizationAction } from "../actions";

export default async function EditOrganizationPage() {
  const { organization, role } = await getDashboardContext();
  const canManage = role === "owner" || role === "admin";

  return (
    <div className="mx-auto max-w-4xl">
      <div>
        <p className="text-sm text-muted-foreground">Organization</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Edit organization</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Keep your workspace identity and operating details current.
        </p>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Workspace details</CardTitle>
        </CardHeader>
        <CardContent>
          <ServerActionForm action={updateOrganizationAction} className="grid gap-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Organization name</Label>
                <Input id="name" name="name" defaultValue={organization.name} disabled={!canManage} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug">Slug</Label>
                <Input id="slug" name="slug" defaultValue={organization.slug} disabled={!canManage} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" name="website" defaultValue={organization.website ?? ""} disabled={!canManage} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Input id="timezone" name="timezone" defaultValue={organization.timezone ?? "Asia/Kolkata"} disabled={!canManage} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                <Input id="industry" name="industry" defaultValue={organization.industry ?? ""} disabled={!canManage} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="useCase">Use case</Label>
                <Input id="useCase" name="useCase" defaultValue={organization.useCase ?? ""} disabled={!canManage} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" type="reset" disabled={!canManage}>
                Reset
              </Button>
              <ActionSubmit pendingLabel="Saving..." className={!canManage ? "hidden" : undefined}>
                Save changes
              </ActionSubmit>
            </div>
          </ServerActionForm>
        </CardContent>
      </Card>
    </div>
  );
}
