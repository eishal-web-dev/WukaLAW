import { describe, expect, it } from 'vitest'
import { detectSimilarCaseKind, getSimilarCaseFilters } from './similarCaseFilters'

describe('Similar Cases filter detection', () => {
  it.each([
    ['Family Case', 'wife seeks divorce and return of dowry', 'family'],
    ['Civil', 'khula, mehr and child maintenance dispute', 'family'],
    ['Guardianship', 'father seeks visitation of minor child', 'family'],
    ['Criminal Case', 'accused under section 302 PPC for murder', 'criminal'],
    ['General', 'FIR registered for assault and bail is pending', 'criminal'],
    ['Criminal', 'forgery and fraud allegation with accused persons', 'criminal'],
    ['Civil Case', 'property ownership and possession dispute', 'civil'],
    ['Property', 'inheritance partition between legal heirs', 'civil'],
    ['Civil', 'agreement to sell was not honoured', 'civil'],
    ['Civil', 'landlord seeks eviction for unpaid rent', 'civil'],
  ])('detects %s / %s as %s', (caseType, description, expected) => {
    expect(detectSimilarCaseKind(caseType, description)).toBe(expected)
  })
})

describe('Family custom search', () => {
  const groups = getSimilarCaseFilters('Family Case', 'divorce dowry custody')

  it('contains issue, facts, proof and stage groups', () => {
    expect(groups.map((group) => group.id)).toEqual(['issue', 'facts', 'proof', 'stage'])
  })

  it('supports multi-issue family disputes', () => {
    const labels = groups[0].options.map((option) => option.label)
    expect(labels).toEqual(expect.arrayContaining(['Divorce / Khula', 'Dowry recovery', 'Dower / Mehr', 'Maintenance', 'Child custody']))
  })

  it('supports evidence and procedural narrowing', () => {
    const labels = groups.flatMap((group) => group.options.map((option) => option.label))
    expect(labels).toEqual(expect.arrayContaining(['Receipts', 'Witnesses', 'Nikahnama', 'Evidence', 'Final arguments', 'Appeal']))
  })
})

describe('Criminal custom search', () => {
  const groups = getSimilarCaseFilters('Criminal Case', 'murder allegation')

  it('contains issue, method, evidence and defence groups', () => {
    expect(groups.map((group) => group.id)).toEqual(['issue', 'method', 'evidence', 'defence'])
  })

  it('can narrow murder by intent and weapon', () => {
    const labels = groups.flatMap((group) => group.options.map((option) => option.label))
    expect(labels).toEqual(expect.arrayContaining(['Murder / Homicide', 'Intentional', 'Accidental', 'Gun / Firearm', 'Knife / sharp weapon']))
  })

  it('can narrow murder by evidence and defence', () => {
    const labels = groups.flatMap((group) => group.options.map((option) => option.label))
    expect(labels).toEqual(expect.arrayContaining(['Eyewitness', 'CCTV / Video', 'Forensic / DNA', 'I was elsewhere (Alibi)', 'Self-defence', 'False accusation']))
  })
})

describe('Civil custom search', () => {
  const groups = getSimilarCaseFilters('Civil Case', 'property agreement dispute')

  it('contains issue, facts, proof and stage groups', () => {
    expect(groups.map((group) => group.id)).toEqual(['issue', 'facts', 'proof', 'stage'])
  })

  it('supports major civil disputes and proof types', () => {
    const labels = groups.flatMap((group) => group.options.map((option) => option.label))
    expect(labels).toEqual(expect.arrayContaining([
      'Property ownership',
      'Inheritance',
      'Contract / sale agreement',
      'Money recovery',
      'Rent / tenancy',
      'Documents',
      'Revenue record',
      'Registered deed',
    ]))
  })
})
