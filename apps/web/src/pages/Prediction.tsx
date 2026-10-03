import ClientCourtPrediction from './ClientCourtPrediction'

/** Lawyer-facing prediction workspace.
 *
 * The assessment component is shared with the client portal so both roles
 * render the same evidence-grounded backend response. Lawyers must choose an
 * assigned case explicitly; no demo score or cross-case aggregate is shown.
 */
export default function Prediction() {
  return <ClientCourtPrediction audience="lawyer" requireCaseSelection />
}
