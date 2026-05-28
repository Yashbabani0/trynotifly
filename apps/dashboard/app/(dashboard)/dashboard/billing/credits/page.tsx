import { creditTransaction, db, eq } from "@trynotifly/db";
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

export default async function CreditsPage() {
  const { organization } = await getDashboardContext();
  const transactions = await db.query.creditTransaction.findMany({
    where: eq(creditTransaction.organizationId, organization.id),
    orderBy: (table, { desc }) => [desc(table.createdAt)],
    limit: 100,
  });

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">Billing</p>
        <h2 className="mt-2 text-3xl font-semibold tracking-tight">Credits</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Current balance: {organization.balance.toLocaleString()} credits.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.map((transaction) => (
                <TableRow key={transaction.id}>
                  <TableCell>{transaction.createdAt.toLocaleDateString()}</TableCell>
                  <TableCell>{transaction.type}</TableCell>
                  <TableCell>{transaction.status}</TableCell>
                  <TableCell>{transaction.description ?? "No description"}</TableCell>
                  <TableCell className="text-right font-mono">{transaction.amount}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {transactions.length === 0 ? (
            <div className="py-10 text-center text-sm text-muted-foreground">
              No credit transactions yet.
            </div>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
