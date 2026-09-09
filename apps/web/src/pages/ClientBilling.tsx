import { CreditCard } from 'lucide-react'
import { Card } from '../components/design'

/**
 * Client-facing Billing page. There is no billing model, no payment
 * integration, and no invoice storage anywhere in this backend
 * (confirmed: only User, Case, Document, Chunk, GeneratedReport exist).
 * Per the spec's explicit instruction for this page: "If billing is not
 * implemented, show a clean and truthful 'Billing is not available yet'
 * state." No fake plans, balances, invoices, or payment history --
 * this doesn't call any endpoint at all, since there's genuinely
 * nothing real to fetch yet.
 */
export default function ClientBilling() {
  return (
    <div className="p-6 sm:p-8 max-w-md mx-auto flex items-center justify-center h-full">
      <Card className="p-10 text-center space-y-3">
        <CreditCard size={28} className="mx-auto text-muted-foreground" />
        <h2 className="text-base font-semibold text-foreground">Billing is not available yet</h2>
        <p className="text-sm text-muted-foreground">
          Billing and payment features haven't been set up for this account. Contact your lawyer directly
          for any questions about fees.
        </p>
      </Card>
    </div>
  )
}
