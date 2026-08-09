export type FilterOption = { label: string; query: string }
export type FilterGroup = { id: string; label: string; helper?: string; options: FilterOption[] }
export type SimilarCaseKind = 'family' | 'criminal' | 'civil'

export function detectSimilarCaseKind(caseType: string, description = ''): SimilarCaseKind {
  const value = `${caseType} ${description}`.toLowerCase()
  if (/family|divorce|khula|dowry|mehr|maintenance|custody|guardianship|marriage/.test(value)) return 'family'
  if (/criminal|murder|homicide|bail|fraud|forgery|accused|fir|ppc|crpc|assault/.test(value)) return 'criminal'
  return 'civil'
}

export const FILTERS: Record<SimilarCaseKind, FilterGroup[]> = {
  family: [
    {
      id: 'issue',
      label: 'What is your case about?',
      helper: 'Choose the main family-law issue.',
      options: [
        { label: 'Divorce / Khula', query: 'dissolution of marriage khula divorce' },
        { label: 'Dowry recovery', query: 'dowry articles bridal gifts jahez recovery' },
        { label: 'Dower / Mehr', query: 'dower haq mehr meher unpaid dower' },
        { label: 'Maintenance', query: 'maintenance allowance wife child maintenance' },
        { label: 'Child custody', query: 'child custody guardianship visitation minor child' },
      ],
    },
    {
      id: 'facts',
      label: 'What happened?',
      helper: 'Add the facts that make your case different.',
      options: [
        { label: 'Cruelty', query: 'cruelty mental cruelty physical cruelty matrimonial' },
        { label: 'Maintenance not paid', query: 'failure to maintain non payment maintenance' },
        { label: 'Dowry kept by other side', query: 'retained dowry articles return recovery' },
        { label: 'Mehr unpaid', query: 'unpaid dower mehr outstanding dower' },
        { label: 'Children involved', query: 'minor children custody welfare visitation' },
        { label: 'Second marriage issue', query: 'second marriage permission arbitration council family dispute' },
      ],
    },
    {
      id: 'proof',
      label: 'What proof do you have?',
      options: [
        { label: 'Receipts', query: 'receipts documentary proof purchase evidence' },
        { label: 'Witnesses', query: 'family witnesses witness testimony evidence' },
        { label: 'Nikahnama', query: 'nikahnama marriage contract dower terms' },
        { label: 'Messages / calls', query: 'messages chats calls electronic evidence family dispute' },
        { label: 'Previous court order', query: 'previous family court order decree interim order' },
      ],
    },
    {
      id: 'stage',
      label: 'Where is the case now?',
      options: [
        { label: 'Just filed', query: 'family suit filed service notice initial stage' },
        { label: 'Written statement', query: 'written statement reply family court proceedings' },
        { label: 'Evidence', query: 'evidence recorded cross examination witnesses family court' },
        { label: 'Final arguments', query: 'final arguments arguments concluded family court' },
        { label: 'Appeal', query: 'family appeal appellate court High Court' },
        { label: 'Enforcement', query: 'execution enforcement decree recovery proceedings' },
      ],
    },
  ],
  criminal: [
    {
      id: 'issue',
      label: 'What is your case about?',
      helper: 'Choose the closest criminal issue.',
      options: [
        { label: 'Murder / Homicide', query: 'murder homicide qatl qatal section 302 PPC' },
        { label: 'Attempted murder', query: 'attempted murder section 324 PPC firearm assault' },
        { label: 'Bail', query: 'pre arrest bail post arrest bail criminal bail' },
        { label: 'Assault / hurt', query: 'hurt assault injury PPC criminal' },
        { label: 'Fraud / Forgery', query: 'fraud forgery cheating forged document deception' },
      ],
    },
    {
      id: 'method',
      label: 'How did it happen?',
      options: [
        { label: 'Intentional', query: 'intentional murder premeditated deliberate intention motive' },
        { label: 'Accidental', query: 'accidental killing accidental death no intention' },
        { label: 'Gun / Firearm', query: 'firearm gun pistol shooting weapon recovery' },
        { label: 'Knife / sharp weapon', query: 'knife dagger sharp edged weapon stabbing' },
        { label: 'Blunt weapon', query: 'blunt weapon blunt force injury' },
        { label: 'Multiple accused', query: 'multiple accused common intention section 34 PPC common object' },
      ],
    },
    {
      id: 'evidence',
      label: 'What evidence matters?',
      options: [
        { label: 'Eyewitness', query: 'eyewitness ocular account eye witness testimony' },
        { label: 'Circumstantial', query: 'circumstantial evidence chain of circumstances' },
        { label: 'CCTV / Video', query: 'CCTV video footage electronic evidence' },
        { label: 'Forensic / DNA', query: 'forensic ballistic DNA medical evidence' },
        { label: 'Weapon recovery', query: 'weapon recovery firearm recovery forensic matching' },
        { label: 'Confession', query: 'confession admission judicial confession extra judicial confession' },
      ],
    },
    {
      id: 'defence',
      label: 'What is the defence?',
      options: [
        { label: 'I was elsewhere (Alibi)', query: 'plea of alibi not present crime scene' },
        { label: 'Self-defence', query: 'self defence private defence right of private defence' },
        { label: 'False accusation', query: 'false implication falsely implicated enmity' },
        { label: 'Identity disputed', query: 'identity disputed identification parade mistaken identity' },
        { label: 'Evidence unreliable', query: 'unreliable witness contradictions benefit of doubt' },
      ],
    },
  ],
  civil: [
    {
      id: 'issue',
      label: 'What is your case about?',
      helper: 'Choose the closest civil dispute.',
      options: [
        { label: 'Property ownership', query: 'property ownership title possession land' },
        { label: 'Inheritance', query: 'inheritance succession legal heirs partition' },
        { label: 'Contract / sale agreement', query: 'specific performance agreement to sell contract' },
        { label: 'Money recovery', query: 'recovery of money civil suit debt payment' },
        { label: 'Rent / tenancy', query: 'rent tenancy eviction landlord tenant' },
        { label: 'Stop something (injunction)', query: 'injunction temporary injunction permanent injunction' },
      ],
    },
    {
      id: 'facts',
      label: 'What is the dispute?',
      options: [
        { label: 'Ownership denied', query: 'ownership denied title dispute possession' },
        { label: 'Agreement not honoured', query: 'agreement breached specific performance refusal' },
        { label: 'Payment not made', query: 'payment unpaid debt recovery consideration' },
        { label: 'Possession dispute', query: 'possession dispossession property dispute' },
        { label: 'Fraud alleged', query: 'fraud misrepresentation civil transaction forged document' },
      ],
    },
    {
      id: 'proof',
      label: 'What proof matters?',
      options: [
        { label: 'Documents', query: 'documentary evidence title documents agreement record' },
        { label: 'Witnesses', query: 'witness testimony oral evidence civil' },
        { label: 'Revenue record', query: 'revenue record mutation fard land record ownership' },
        { label: 'Registered deed', query: 'registered sale deed registry title document' },
        { label: 'Payment record', query: 'payment receipt bank record consideration evidence' },
      ],
    },
    {
      id: 'stage',
      label: 'Where is the case now?',
      options: [
        { label: 'Just filed', query: 'civil suit filed notice service initial stage' },
        { label: 'Evidence', query: 'civil evidence witnesses cross examination' },
        { label: 'Temporary order', query: 'interim order stay temporary injunction' },
        { label: 'Final arguments', query: 'final arguments civil judgment reserved' },
        { label: 'Appeal', query: 'civil appeal appellate court High Court' },
        { label: 'Enforcement', query: 'execution decree enforcement possession recovery' },
      ],
    },
  ],
}

export function getSimilarCaseFilters(caseType: string, description = ''): FilterGroup[] {
  return FILTERS[detectSimilarCaseKind(caseType, description)]
}
