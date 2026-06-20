import { Fragment, useState, useEffect, useMemo } from 'react'

type DevKey = 'garry' | 'kevin' | 'kerran' | 'jacob' | 'strategy'

interface Project {
  name: string
  emoji: string
  slug: string
  status: 'Active' | 'Complete' | 'Paused'
  description: string
  owner: DevKey
  live?: string
  repo?: string
  docs?: string
  extraLinks?: { label: string; emoji: string; url: string }[]
}

const projects: Project[] = [
  { name: 'DFRNT CSP', emoji: '💬', slug: 'dfrnt-csp', status: 'Active', owner: 'jacob', description: 'Unified inbox (email/chat/tasks), client health, Auto-Mate AI assistant', live: 'https://deliver-different-testing.github.io/DFRNT-CRM/', repo: 'https://github.com/Deliver-Different-Testing/DFRNT-CRM', docs: 'https://github.com/Deliver-Different-Testing/DFRNT-CRM/blob/main/IMPLEMENTATION.md' },
  { name: 'PDF Overlay Tool', emoji: '📄', slug: 'pdf-overlay-tool', status: 'Active', owner: 'jacob', description: 'Standalone PDF template stamping R&D — renderer library, microservice, and admin field-mapper UI', repo: 'https://github.com/Deliver-Different-Testing/PDF-Overlay-Tool', docs: 'https://github.com/Deliver-Different-Testing/PDF-Overlay-Tool/blob/main/docs/plan.md' },
  { name: 'Setup Dashboard', emoji: '🧩', slug: 'setup-dashboard', status: 'Complete', owner: 'garry', description: '10-step tenant onboarding wizard with smart CSV import, training arena', live: 'https://deliver-different-testing.github.io/setup-dashboard/', repo: 'https://github.com/Deliver-Different-Testing/setup-dashboard', docs: 'https://github.com/Deliver-Different-Testing/setup-dashboard/blob/main/IMPLEMENTATION.md' },
  { name: 'Agents & Partners', emoji: '🤝', slug: 'agents-partners', status: 'Active', owner: 'garry', description: 'Fleet management, marketplace, courier compliance & recruitment', live: 'https://deliver-different-testing.github.io/NP-Agent-Management/', repo: 'https://github.com/Deliver-Different-Testing/NP-Agent-Management', docs: 'https://github.com/Deliver-Different-Testing/NP-Agent-Management/blob/main/IMPLEMENTATION.md', extraLinks: [{ label: 'Applicant Portal', emoji: '📋', url: 'https://deliver-different-testing.github.io/NP-Agent-Management/portal/#/apply/dfrnt' }, { label: 'Courier Login', emoji: '🔑', url: 'https://deliver-different-testing.github.io/NP-Agent-Management/portal/#/courier/dfrnt/login' }, { label: 'Courier Dashboard', emoji: '🚚', url: 'https://deliver-different-testing.github.io/NP-Agent-Management/portal/#/courier/dfrnt/dashboard' }] },
  { name: 'Reports', emoji: '📊', slug: 'reports', status: 'Active', owner: 'kerran', description: 'Rate schedule, invoice builder (ported to Accounts)', live: 'https://deliver-different-testing.github.io/reports/', repo: 'https://github.com/Deliver-Different-Testing/reports' },
  { name: 'Booking Redesign', emoji: '📦', slug: 'booking-redesign', status: 'Paused', owner: 'strategy', description: 'Single-page booking with voice input, per-location accessorials', live: 'https://deliver-different-testing.github.io/booking-redesign/', repo: 'https://github.com/Deliver-Different-Testing/booking-redesign' },
  { name: 'Auto Dispatch', emoji: '🚀', slug: 'auto-dispatch', status: 'Active', owner: 'strategy', description: 'AI-powered dispatch with HERE Maps, ECA Dallas MVP deadline', repo: 'https://github.com/Deliver-Different-Testing/auto-dispatch' },
  { name: 'ECA Dallas', emoji: '🏢', slug: 'eca-dallas', status: 'Active', owner: 'strategy', description: 'Battlecard v2.0, 17-slide branded presentation, onboarding strategy' },
  { name: 'Kiwibank Cash Flow', emoji: '🏦', slug: 'kiwibank-cashflow', status: 'Active', owner: 'strategy', description: 'Interactive 5-tab cash flow model — P&L per entity, OPEX sliders, Cool exit scenarios, CSV export', live: 'https://deliver-different-testing.github.io/kiwibank-cashflow/', repo: 'https://github.com/Deliver-Different-Testing/kiwibank-cashflow' },
  { name: 'Accounts (Invoice Builder)', emoji: '🧾', slug: 'accounts', status: 'Active', owner: 'kerran', description: 'Invoice template builder, calc editor, field width control, void spec', live: 'https://deliver-different-testing.github.io/Accounts/', repo: 'https://github.com/Deliver-Different-Testing/Accounts', docs: 'https://github.com/Deliver-Different-Testing/Accounts/blob/master/docs/invoice-void-howto.md' },
  { name: 'Automation Engine', emoji: '⚡', slug: 'automation-engine', status: 'Active', owner: 'garry', description: 'Admin Manager with Automation Engine — conditions, actions, scope filters, backend C# services', live: 'https://deliver-different-testing.github.io/Adminmanagerupdate/', repo: 'https://github.com/Deliver-Different-Testing/Adminmanagerupdate', docs: 'https://github.com/Deliver-Different-Testing/Adminmanagerupdate/blob/main/HANDOVER-GARRY.md' },
  { name: 'Drive Configurator', emoji: '📱', slug: 'drive-configurator', status: 'Active', owner: 'garry', description: 'DFRNT Drive app config — workflows, supports, feature flags (Garry)', live: 'https://deliver-different-testing.github.io/dfrntdrive-configurator/', repo: 'https://github.com/Deliver-Different-Testing/dfrntdrive-configurator' },
  { name: 'Stryker Rate Analysis', emoji: '🏥', slug: 'stryker-rate-analysis', status: 'Complete', owner: 'strategy', description: 'Mt Wellington → East Tamaki move impact — zone pricing, drive times, delivery volumes, AM medical analysis', live: 'https://deliver-different-testing.github.io/stryker-analysis/', repo: 'https://github.com/Deliver-Different-Testing/stryker-analysis' },
  { name: 'ECA Dallas Promo', emoji: '🌐', slug: 'eca-dallas-promo', status: 'Active', owner: 'strategy', description: '"35 Years of Intelligence" — promo site with VC Trap article, Auto-Mate intro', live: 'https://deliver-different-testing.github.io/eca-dallas-promo/', repo: 'https://github.com/Deliver-Different-Testing/eca-dallas-promo' },
  { name: '1on1', emoji: '👥', slug: '1on1', status: 'Active', owner: 'strategy', description: '1-on-1 meeting & check-in tool', live: 'https://deliver-different-testing.github.io/1on1/', repo: 'https://github.com/Deliver-Different-Testing/1on1' },
  { name: 'RouteBuilder (RunBuilder v2)', emoji: '🛣️', slug: 'routebuilder', status: 'Active', owner: 'kevin', description: 'React 19 + .NET 9 rebuild of RunBuilder — parallel with legacy, app-layer over SPs, surfaces tucJob + tucJobBooking (Kevin)', live: 'https://deliver-different-testing.github.io/runbuilder/', repo: 'https://github.com/Deliver-Different-Testing/runbuilder', docs: 'https://github.com/Deliver-Different-Testing/runbuilder/blob/master/docs/STEVE-RUNBUILDER-V2-SCOPING-2026-06-13.md', extraLinks: [{ label: 'Mockup', emoji: '🎨', url: 'https://deliver-different-testing.github.io/runbuilder/' }] },
]

interface RunsheetEntry { ts: number; text: string }

interface ForwardWorkItem {
  key: string
  title: string
  summary: string
  date: string | null
  url?: string
}

interface Dev {
  key: DevKey
  name: string
  emoji: string
  focus: string
  currentWorkUrl: string
  forwardWorkUrl: string
  forwardWorkItems: ForwardWorkItem[]
}

const CONFIG_DOC = (f: string) => `https://github.com/Deliver-Different-Testing/dfrntdrive_configurator/blob/master/docs/${f}`
const ACCOUNTS_DOC = (f: string) => `https://github.com/Deliver-Different-Testing/Accounts/blob/master/docs/${f}`
const BUILD_ID = '2026-06-20-2048'

const devs: Dev[] = [
  {
    key: 'garry',
    name: 'Garry',
    emoji: '🛠️',
    focus: 'Drive Configurator + MAUI mobile app',
    currentWorkUrl: CONFIG_DOC('STEVE-COMPLIANCE-BUNDLE-2026-06-13.md'),
    forwardWorkUrl: CONFIG_DOC('FORWARD-GARRY.md'),
    forwardWorkItems: [
      {
        key: 'np-modal',
        title: 'NP Modal redesign',
        summary: 'Sticky directory header on /agents, popup NP modal mirroring courier shell (areas-covered map, tabs), narrow Edit Agent to promotion only.',
        date: '2026-06-19',
        url: CONFIG_DOC('STEVE-NP-MODAL-GARRY-2026-06-19.md'),
      },
      {
        key: 'quiz-module',
        title: 'Quiz module — pull commit d21ce47',
        summary: 'Greenfield module shipped on GitHub. Pull to GitLab, apply migration 007, deploy + smoke test per §7.',
        date: '2026-06-19',
        url: CONFIG_DOC('STEVE-QUIZ-MODULE-IMPLEMENTATION-GARRY-2026-06-19.md'),
      },
      {
        key: 'applicant-portal-doc-fields',
        title: 'Applicant portal doc-fields amendment',
        summary: 'Per-doc-type fields child table, MaxImages column, structured per-field AI verification in review modal.',
        date: '2026-06-16',
        url: CONFIG_DOC('STEVE-APPLICANT-PORTAL-DOC-FIELDS-AMENDMENT-2026-06-16.md'),
      },
      {
        key: 'configurator-cleanup',
        title: 'Configurator cleanup (rolling)',
        summary: 'Recruitment sidebar fix, Applicant Portal page rebuild, Stages preview pane, DF Drive Config sidebar cleanup.',
        date: '2026-06-13',
        url: CONFIG_DOC('GARRY-CONFIGURATOR-CLEANUP.md'),
      },
      {
        key: 'recurring-routes-combined-fixes',
        title: 'Recurring Routes combined fixes (11 items)',
        summary: 'Sidebar most-specific-wins, Mapped Stops from tucJobBooking, Flight mode, LinehaulRunId on job tables, Speed FK on linehaul runs.',
        date: '2026-06-17',
        url: CONFIG_DOC('STEVE-RECURRING-ROUTES-COMBINED-FIXES-2026-06-17.md'),
      },
      {
        key: 'recurring-routes-combined',
        title: 'Recurring Routes combined spec',
        summary: 'Single combined spec covering all 6 pieces of Recurring Routes work (recommended entry point).',
        date: '2026-06-16',
        url: CONFIG_DOC('STEVE-RECURRING-ROUTES-COMBINED-2026-06-16.md'),
      },
      {
        key: 'recurring-routes-index',
        title: 'Recurring Routes 3-doc index',
        summary: 'Original 3-doc index: Mapped Stops rename, sidebar fix, Route Type chip, Linehaul tab + Roster, Mapped Stops drill-down.',
        date: '2026-06-16',
        url: CONFIG_DOC('STEVE-RECURRING-ROUTES-2026-06-16.md'),
      },
      {
        key: 'courier-portal-repo-state',
        title: 'Courier portal repo-state audit',
        summary: 'What is actually present today in dfrntdrive_configurator: live vs partial vs missing; source-of-truth route trees.',
        date: '2026-06-17',
        url: CONFIG_DOC('STEVE-COURIER-PORTAL-REPO-STATE-HANDOVER-GARRY-2026-06-17.md'),
      },
      {
        key: 'courier-portal-and-modal',
        title: 'Courier portal + Courier modal update',
        summary: 'Mobile portal finish-line brief + modal redesign (§10–§17): shared nuggets, Communications, Driver Mgmt, Login & Access block + 2FA, flag investigation.',
        date: '2026-06-17',
        url: CONFIG_DOC('STEVE-COURIER-PORTAL-AND-COURIER-MODAL-UPDATE-GARRY-2026-06-17.md'),
      },
      {
        key: 'courier-portal-full-build',
        title: 'Courier portal full build brief',
        summary: 'Upgrade legacy portal into configurator framework: auth, courier shell, runs, schedules, settings, contractor flows, AI docs.',
        date: '2026-06-15',
        url: CONFIG_DOC('STEVE-COURIER-PORTAL-GARRY-FULL-BUILD-2026-06-15.md'),
      },
      {
        key: 'courier-portal-project',
        title: 'Courier portal rebuild canonical brief',
        summary: 'Phase 1: lightweight applicant/courier auth + themed shell. SMS 2FA moved to next auth-hardening phase.',
        date: '2026-06-15',
        url: CONFIG_DOC('STEVE-COURIER-PORTAL-GARRY-PROJECT-2026-06-15.md'),
      },
      {
        key: 'courier-portal-phase-3',
        title: 'Courier portal Phase 3',
        summary: 'Compliance dashboard + My Documents.',
        date: null,
      },
    ],
  },
  {
    key: 'kevin',
    name: 'Kevin',
    emoji: '🚚',
    focus: 'despatchweb (recurring bookings) + runviewer + RouteBuilder',
    currentWorkUrl: 'https://github.com/Deliver-Different-Testing/runbuilder/blob/master/docs/STEVE-RUNBUILDER-V2-SCOPING-2026-06-13.md',
    forwardWorkUrl: CONFIG_DOC('FORWARD-KEVIN.md'),
    forwardWorkItems: [
      {
        key: 'routebuilder-rebuild',
        title: 'RouteBuilder rebuild',
        summary: 'Staff-facing recurring-route management on the existing recurring-route schema. Reuses Hub auth. Phase 2 brief = SP-by-SP lift into v2 app layer (13 SPs → EF services + controllers + React pages).',
        date: '2026-06-14',
        url: CONFIG_DOC('HANDOVER-KEVIN-ROUTEBUILDER-REBUILD-2026-06-14.md'),
      },
      {
        key: 'recurring-resilience',
        title: 'Recurring resilience — Phase 1',
        summary: 'tucJobBookingProcessingError table, UTL_stpJobBooking_Monitor TRY/CATCH cursor wrap with XACT_ABORT OFF, end-of-run digest email. Unblocks 2026-06-15 outage class.',
        date: '2026-06-17',
        url: CONFIG_DOC('HANDOVER-KEVIN-RECURRING-RESILIENCE-2026-06-17.md'),
      },
    ],
  },
  {
    key: 'kerran',
    name: 'Kerran',
    emoji: '🧾',
    focus: 'Accounts — AR, BCTI, settlements, revenue tracking, payment method, contractor flows',
    currentWorkUrl: ACCOUNTS_DOC('KERRAN-OUTSTANDING-WORK-2026-06-13.md'),
    forwardWorkUrl: ACCOUNTS_DOC('FORWARD-KERRAN.md'),
    forwardWorkItems: [
      {
        key: 'payment-terms-xero-qbo',
        title: 'Payment Terms ↔ Xero / QBO integration',
        summary: 'Push Accounts-side payment terms to Xero/QBO on contact create/edit and fold into the AR reminders due-date offset logic.',
        date: '2026-06-13',
        url: ACCOUNTS_DOC('KERRAN-PAYMENT-TERMS-INTEGRATION-2026-06-13.md'),
      },
      {
        key: 'revenue-tracking-rationalisation',
        title: 'Revenue Tracking rationalisation',
        summary: 'Replace the list page with a JobType × Service matrix slide-over edit and link Services to GL accounts.',
        date: '2026-06-12',
        url: ACCOUNTS_DOC('KERRAN-REVENUE-TRACKING-RATIONALISATION-2026-06-12.md'),
      },
      {
        key: 'ar-pack',
        title: 'AR / Accounts Receivable feature pack',
        summary: 'Wire /clients/ar from mock to real QBO/Xero API, land AR snapshot/refresh/send flow, and finish tblAccountsSettings/template/cadence/log tables.',
        date: '2026-06-18',
        url: ACCOUNTS_DOC('KERRAN-AR-HANDOVER-IMPLEMENTATION-2026-06-18.md'),
      },
      {
        key: 'recurring-deductions',
        title: 'Recurring deductions',
        summary: 'Schedule deductions across weekly/fortnightly/monthly periods with end-date and cap rules, run at settlement-batch creation.',
        date: '2026-06-12',
        url: ACCOUNTS_DOC('RECURRING_DEDUCTIONS_KERRAN_SPEC_2026-06-12.md'),
      },
      {
        key: 'openforce-payment-method-alignment',
        title: 'Openforce batched lane + portal payment method alignment',
        summary: 'Statement-receipt-driven QBO push trigger, webhook/poller flow, TucOpenforceBatchLineDeduction child table, and portal payment-method alignment.',
        date: '2026-06-10',
        url: ACCOUNTS_DOC('KERRAN-OPENFORCE-BATCHED-LANE-AND-PORTAL-PAYMENT-METHOD-ALIGNMENT-2026-06-10.md'),
      },
      {
        key: 'master-sub-routing',
        title: 'Master / Sub settlement routing',
        summary: 'Route sub-courier earnings into the Master’s settlement run using the project_courier_taxonomy_master_sub rules.',
        date: '2026-06-10',
        url: ACCOUNTS_DOC('KERRAN-MASTER-SUB-SETTLEMENT-ROUTING-IMPLEMENTATION-2026-06-10.md'),
      },
      {
        key: 'tenant-generated-contractor-invoices',
        title: 'Tenant-generated contractor invoices',
        summary: 'Hide tenant-generated invoices on the courier portal until the batch is settled and reconcile against the payment statement.',
        date: '2026-06-10',
        url: ACCOUNTS_DOC('KERRAN-TENANT-GENERATED-CONTRACTOR-INVOICES-2026-06-10.md'),
      },
      {
        key: 'courier-portal-payment-method',
        title: 'Courier-portal payment method alignment',
        summary: 'Show per-courier PaymentMethod in the portal so couriers can see how each invoice or batch will be paid.',
        date: '2026-06-10',
        url: ACCOUNTS_DOC('KERRAN-COURIER-PORTAL-PAYMENTMETHOD-ALIGNMENT-2026-06-10.md'),
      },
      {
        key: 'ar-reminder-cycle',
        title: 'AR reminder cycle',
        summary: 'Build the reminder cadence engine that Payment Terms folds into for per-customer due-date offset behaviour.',
        date: '2026-06-05',
        url: ACCOUNTS_DOC('AR_REMINDER_CYCLE_PROJECT_2026-06-05.md'),
      },
      {
        key: 'bcti-kerran-handover',
        title: 'BCTI consolidated handover',
        summary: 'Primary Kerran entry point for contractor BCTI + agent/inter-tenant BCTI, process schedules, deductions, and extra payments.',
        date: '2026-06-03',
        url: ACCOUNTS_DOC('BCTI_KERRAN_HANDOVER.md'),
      },
      {
        key: 'self-billing-bcti',
        title: 'Self-billing / BCTI platform spec',
        summary: 'Original upstream BCTI spec for edge cases, dispute flow, compliance wording, and accounting-sync expectations behind the consolidated handover.',
        date: '2026-04-20',
        url: ACCOUNTS_DOC('self-billing-bcti-spec.md'),
      },
      {
        key: 'bcti-auto-allocate-credits',
        title: 'BCTI auto-allocate credit notes',
        summary: 'Auto-allocate credit notes to open bills so they net off correctly at settlement time.',
        date: '2026-06-04',
        url: ACCOUNTS_DOC('BCTI_AUTO_ALLOCATE_CREDITS_2026-06-04.md'),
      },
      {
        key: 'extra-payments',
        title: 'Extra payments to couriers & agents',
        summary: 'One-off and recurring extra-payments framework for courier and agent settlement/BCTI flows.',
        date: '2026-06-03',
        url: ACCOUNTS_DOC('EXTRA_PAYMENTS.md'),
      },
      {
        key: 'contractor-financial-summary',
        title: 'Contractor financial summary',
        summary: 'Add YTD Earned / Paid / Outstanding / Deductions tabs to the contractor detail page.',
        date: '2026-06-07',
        url: ACCOUNTS_DOC('CONTRACTOR_FINANCIAL_SUMMARY_2026-06-07.md'),
      },
      {
        key: 'courier-earnings-reporting',
        title: 'Courier earnings reporting + portal publishing',
        summary: 'Generate earnings statement reports and publish them to the portal for couriers.',
        date: '2026-06-09',
        url: ACCOUNTS_DOC('COURIER-EARNINGS-REPORTING-AND-PORTAL-PUBLISHING-SPEC-2026-06-09.md'),
      },
      {
        key: 'otg-contractor-setup-flow-b',
        title: 'OTG contractor setup — Flow B',
        summary: 'Contractor Invoices → Openforce flow using Steve’s preferred contractor setup path.',
        date: '2026-06-05',
        url: ACCOUNTS_DOC('OTG_CONTRACTOR_SETUP_2026-06-05.md'),
      },
      {
        key: 'payment-method-backend',
        title: 'Payment / Invoice Method backend',
        summary: 'Backend half of the per-courier PaymentMethod / InvoiceMethod work; confirm landed GitLab code vs spec delta.',
        date: '2026-06-06',
        url: ACCOUNTS_DOC('PAYMENT_METHOD_BACKEND_KERRAN_2026-06-06.md'),
      },
      {
        key: 'payment-method-per-courier',
        title: 'Per-courier Payment & Invoice Method',
        summary: 'Focused UI and override brief for the per-courier payment/invoice method behaviour.',
        date: '2026-06-08',
        url: ACCOUNTS_DOC('PAYMENT_METHOD_PER_COURIER_KERRAN_2026-06-08.md'),
      },
      {
        key: 'settlement-batch-cancel-validation',
        title: 'Settlement batch cancel + validation + QBO bug',
        summary: 'Add visibility, cancel, custom range, pre-flight validation, and fix the QBO sync bug Steve found.',
        date: '2026-06-05',
        url: ACCOUNTS_DOC('SETTLEMENT_BATCH_CANCEL_KERRAN_2026-06-05.md'),
      },
    ],
  },
  {
    key: 'jacob',
    name: 'Jacob',
    emoji: '💬',
    focus: 'despatchweb + Integration Manager → DFRNT CSP app',
    currentWorkUrl: CONFIG_DOC('CURRENT-JACOB.md'),
    forwardWorkUrl: CONFIG_DOC('FORWARD-JACOB.md'),
    forwardWorkItems: [
      {
        key: 'dfrnt-csp',
        title: 'DFRNT CSP app build',
        summary: 'Unified inbox (email/chat/tasks), client health, Auto-Mate AI assistant. Repo: Deliver-Different-Testing/DFRNT-CRM. Spec: DFRNT-CRM/IMPLEMENTATION.md.',
        date: '2026-06-13',
        url: 'https://github.com/Deliver-Different-Testing/DFRNT-CRM/blob/main/IMPLEMENTATION.md',
      },
      {
        key: 'pdf-overlay-tool',
        title: 'PDF Overlay Tool',
        summary: 'Standalone R&D workstream for customer PDF template stamping: renderer library, microservice, and admin field-mapper UI.',
        date: '2026-06-19',
        url: 'https://github.com/Deliver-Different-Testing/PDF-Overlay-Tool/blob/main/docs/plan.md',
      },
    ],
  },
]

type ItemStatus = 'Not started' | 'In progress' | 'Blocked' | 'In review' | 'Done'

const STATUS_OPTIONS: ItemStatus[] = ['Not started', 'In progress', 'Blocked', 'In review', 'Done']

const statusPillClass: Record<ItemStatus, string> = {
  'Not started': 'bg-gray-100 text-gray-700',
  'In progress': 'bg-cyan/10 text-cyan',
  'Blocked': 'bg-red-100 text-red-700',
  'In review': 'bg-amber-100 text-amber-800',
  'Done': 'bg-green-100 text-green-700',
}

interface RowState { status: ItemStatus; notes: string; updated: number | null }

const blankRow: RowState = { status: 'Not started', notes: '', updated: null }

function loadDevState(devKey: string): Record<string, RowState> {
  try {
    const raw = localStorage.getItem(`forward-work:${devKey}:v1`)
    if (!raw) return {}
    return JSON.parse(raw)
  } catch {
    return {}
  }
}

function saveDevState(devKey: string, state: Record<string, RowState>) {
  localStorage.setItem(`forward-work:${devKey}:v1`, JSON.stringify(state))
}

function loadDevOrder(devKey: string, items: ForwardWorkItem[]): string[] {
  try {
    const raw = localStorage.getItem(`forward-work-order:${devKey}:v1`)
    const stored = raw ? JSON.parse(raw) : []
    if (!Array.isArray(stored)) return items.map(item => item.key)
    const known = new Set(items.map(item => item.key))
    const cleaned = stored.filter((key): key is string => typeof key === 'string' && known.has(key))
    const missing = items.map(item => item.key).filter(key => !cleaned.includes(key))
    return [...cleaned, ...missing]
  } catch {
    return items.map(item => item.key)
  }
}

function saveDevOrder(devKey: string, order: string[]) {
  localStorage.setItem(`forward-work-order:${devKey}:v1`, JSON.stringify(order))
}

function ForwardWorkTable({ dev }: { dev: Dev }) {
  const devKey = dev.name.toLowerCase()
  const [state, setState] = useState<Record<string, RowState>>(() => loadDevState(devKey))
  const [order, setOrder] = useState<string[]>(() => loadDevOrder(devKey, dev.forwardWorkItems))

  useEffect(() => {
    setOrder(prev => {
      const known = new Set(dev.forwardWorkItems.map(item => item.key))
      const cleaned = prev.filter(key => known.has(key))
      const missing = dev.forwardWorkItems.map(item => item.key).filter(key => !cleaned.includes(key))
      const next = [...cleaned, ...missing]
      saveDevOrder(devKey, next)
      return next
    })
  }, [dev.forwardWorkItems, devKey])

  const updateRow = (key: string, patch: Partial<RowState>) => {
    setState(prev => {
      const next = { ...prev, [key]: { ...blankRow, ...prev[key], ...patch, updated: Date.now() } }
      saveDevState(devKey, next)
      return next
    })
  }

  const orderedItems = useMemo(() => {
    const orderIndex = new Map(order.map((key, index) => [key, index]))
    const items = [...dev.forwardWorkItems].sort((a, b) => (orderIndex.get(a.key) ?? Number.MAX_SAFE_INTEGER) - (orderIndex.get(b.key) ?? Number.MAX_SAFE_INTEGER))
    const open = items.filter(item => (state[item.key]?.status ?? 'Not started') !== 'Done')
    const done = items.filter(item => (state[item.key]?.status ?? 'Not started') === 'Done')
    return [...open, ...done]
  }, [dev.forwardWorkItems, order, state])

  const moveItem = (key: string, direction: -1 | 1) => {
    const isDone = (state[key]?.status ?? 'Not started') === 'Done'
    const bucket = orderedItems.filter(item => ((state[item.key]?.status ?? 'Not started') === 'Done') === isDone)
    const currentIndex = bucket.findIndex(item => item.key === key)
    const targetIndex = currentIndex + direction
    if (currentIndex < 0 || targetIndex < 0 || targetIndex >= bucket.length) return

    const fromKey = bucket[currentIndex].key
    const toKey = bucket[targetIndex].key

    setOrder(prev => {
      const next = [...prev]
      const fromPos = next.indexOf(fromKey)
      const toPos = next.indexOf(toKey)
      if (fromPos < 0 || toPos < 0) return prev
      ;[next[fromPos], next[toPos]] = [next[toPos], next[fromPos]]
      saveDevOrder(devKey, next)
      return next
    })
  }

  const counts = dev.forwardWorkItems.reduce<Record<ItemStatus, number>>((acc, item) => {
    const s = state[item.key]?.status ?? 'Not started'
    acc[s] = (acc[s] ?? 0) + 1
    return acc
  }, { 'Not started': 0, 'In progress': 0, 'Blocked': 0, 'In review': 0, 'Done': 0 })

  return (
    <div className="border-t border-gray-100 bg-gray-50 p-4">
      <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
        {STATUS_OPTIONS.map(s => (
          <span key={s} className={`px-2 py-0.5 rounded-full font-medium ${statusPillClass[s]}`}>
            {s}: {counts[s]}
          </span>
        ))}
      </div>
      {dev.forwardWorkItems.length === 0 ? (
        <p className="text-sm text-gray-400 text-center py-4">No queued items</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
              <tr>
                <th className="text-left px-3 py-2 font-medium w-20">Order</th>
                <th className="text-left px-3 py-2 font-medium">Item</th>
                <th className="text-left px-3 py-2 font-medium whitespace-nowrap">Created</th>
                <th className="text-left px-3 py-2 font-medium">Status</th>
                <th className="text-left px-3 py-2 font-medium w-72">Notes</th>
              </tr>
            </thead>
            <tbody>
              {orderedItems.map((item, visibleIndex) => {
                const row = state[item.key] ?? blankRow
                const isDone = row.status === 'Done'
                const bucket = orderedItems.filter(candidate => ((state[candidate.key]?.status ?? 'Not started') === 'Done') === isDone)
                const bucketIndex = bucket.findIndex(candidate => candidate.key === item.key)
                const isFirst = bucketIndex === 0
                const isLast = bucketIndex === bucket.length - 1
                const previous = orderedItems[visibleIndex - 1]
                const previousStatus = previous ? (state[previous.key]?.status ?? 'Not started') : null
                const showDoneDivider = row.status === 'Done' && previousStatus !== 'Done'

                return (
                  <Fragment key={item.key}>
                    {showDoneDivider && (
                      <tr className="border-t-2 border-gray-200 bg-gray-50">
                        <td colSpan={5} className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-gray-500">Done</td>
                      </tr>
                    )}
                    <tr key={item.key} className="border-t border-gray-100 align-top">
                      <td className="px-3 py-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => moveItem(item.key, -1)}
                            disabled={isFirst}
                            className={`px-2 py-1 rounded border text-xs ${isFirst ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                          >↑</button>
                          <button
                            onClick={() => moveItem(item.key, 1)}
                            disabled={isLast}
                            className={`px-2 py-1 rounded border text-xs ${isLast ? 'border-gray-100 text-gray-300 cursor-not-allowed' : 'border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                          >↓</button>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="font-medium text-primary">
                          {item.url ? (
                            <a href={item.url} target="_blank" rel="noopener noreferrer" className="hover:text-cyan transition">
                              {item.title}
                            </a>
                          ) : item.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-0.5 leading-snug">{item.summary}</div>
                      </td>
                      <td className="px-3 py-2 text-xs text-gray-600 whitespace-nowrap">{item.date ?? '—'}</td>
                      <td className="px-3 py-2">
                        <select
                          value={row.status}
                          onChange={e => updateRow(item.key, { status: e.target.value as ItemStatus })}
                          className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-cyan/50 ${statusPillClass[row.status]}`}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {row.updated && (
                          <div className="text-[10px] text-gray-400 mt-1">
                            {new Date(row.updated).toLocaleDateString()} {new Date(row.updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <textarea
                          value={row.notes}
                          onChange={e => updateRow(item.key, { notes: e.target.value })}
                          placeholder="Dev notes..."
                          rows={2}
                          className="w-full text-xs px-2 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan/50 resize-y"
                        />
                      </td>
                    </tr>
                  </Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

const statusColors: Record<string, string> = {
  Active: 'bg-green-500',
  Complete: 'bg-blue-500',
  Paused: 'bg-amber-500',
}

function ProjectCard({ project }: { project: Project }) {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<RunsheetEntry[]>([])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('')
  const key = `runsheet-${project.slug}`

  useEffect(() => {
    const stored = localStorage.getItem(key)
    if (stored) setEntries(JSON.parse(stored))
  }, [key])

  const save = (e: RunsheetEntry[]) => { setEntries(e); localStorage.setItem(key, JSON.stringify(e)) }

  const addEntry = () => {
    if (!input.trim()) return
    const updated = [{ ts: Date.now(), text: input.trim() }, ...entries]
    save(updated)
    setInput('')
  }

  const deleteEntry = (ts: number) => save(entries.filter(e => e.ts !== ts))

  const filtered = filter ? entries.filter(e => e.text.toLowerCase().includes(filter.toLowerCase())) : entries

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-5">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-primary">
            <span className="mr-2">{project.emoji}</span>{project.name}
          </h3>
          <span className={`${statusColors[project.status]} text-white text-xs font-medium px-2.5 py-0.5 rounded-full`}>
            {project.status}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-2">
          {project.live && <a href={project.live} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-cyan/10 text-cyan hover:bg-cyan/20 transition">🌐 Live</a>}
          {project.repo && <a href={project.repo} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">📦 Repo</a>}
          {project.docs && <a href={project.docs} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition">📄 Docs</a>}
          {project.extraLinks?.map(link => (
            <a key={link.label} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition">{link.emoji} {link.label}</a>
          ))}
          <button onClick={() => setOpen(!open)} className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition ${open ? 'bg-primary text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            📋 Runsheet {entries.length > 0 && <span className="bg-white/20 rounded-full px-1.5">{entries.length}</span>}
          </button>
        </div>
      </div>
      {open && (
        <div className="border-t border-gray-100 bg-gray-50 p-4">
          <div className="flex gap-2 mb-3">
            <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addEntry()} placeholder="Add entry..." className="flex-1 text-sm px-3 py-1.5 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan/50" />
            <button onClick={addEntry} className="text-sm px-3 py-1.5 bg-cyan text-white rounded-lg hover:bg-cyan/80 transition font-medium">Add</button>
          </div>
          {entries.length > 3 && (
            <input value={filter} onChange={e => setFilter(e.target.value)} placeholder="Filter entries..." className="w-full text-sm px-3 py-1.5 rounded-lg border border-gray-200 mb-3 focus:outline-none focus:ring-2 focus:ring-cyan/50" />
          )}
          {filtered.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-2">No entries yet</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {filtered.map(e => (
                <div key={e.ts} className="flex items-start gap-2 text-sm bg-white rounded-lg p-2 border border-gray-100">
                  <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">{new Date(e.ts).toLocaleDateString()} {new Date(e.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="flex-1 text-gray-700">{e.text}</span>
                  <button onClick={() => deleteEntry(e.ts)} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

type Tab = DevKey

const tabs: { key: Tab; label: string; emoji: string }[] = [
  { key: 'garry', label: 'Garry', emoji: '🛠️' },
  { key: 'kevin', label: 'Kevin', emoji: '🚚' },
  { key: 'kerran', label: 'Kerran', emoji: '🧾' },
  { key: 'jacob', label: 'Jacob', emoji: '💬' },
  { key: 'strategy', label: 'Strategy', emoji: '🧭' },
]

function DevHeader({ dev }: { dev: Dev }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-5">
      <div className="flex items-start justify-between mb-2">
        <h3 className="text-lg font-semibold text-primary">
          <span className="mr-2">{dev.emoji}</span>{dev.name}
        </h3>
        <span className="text-xs font-medium text-gray-500">{dev.forwardWorkItems.length} queued</span>
      </div>
      <p className="text-gray-600 text-sm mb-4">{dev.focus}</p>
      <div className="flex flex-wrap gap-2">
        <a href={dev.currentWorkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-cyan/10 text-cyan hover:bg-cyan/20 transition">
          📌 Current work
        </a>
        <a href={dev.forwardWorkUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 hover:bg-purple-100 transition">
          🛣️ Forward work doc
        </a>
      </div>
    </div>
  )
}

function SectionHeading({ icon, title, count }: { icon: string; title: string; count?: number }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-2">
      <span className="text-base">{icon}</span>
      <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">{title}</h2>
      {count !== undefined && <span className="text-xs text-gray-400">({count})</span>}
    </div>
  )
}

export default function App() {
  const [tab, setTab] = useState<Tab>(() => (localStorage.getItem('dash-tab') as Tab) || 'garry')

  const switchTab = (t: Tab) => { setTab(t); localStorage.setItem('dash-tab', t) }

  const activeDev = devs.find(d => d.key === tab)
  const tabProjects = projects.filter(p => p.owner === tab)

  return (
    <div className="min-h-screen bg-light-grey" data-build={BUILD_ID}>
      <header className="bg-primary text-white px-6 py-4 shadow-lg">
        <h1 className="text-xl font-bold">⚡ DFRNT Project Dash</h1>
      </header>
      <nav className="bg-white border-b border-gray-200 px-6 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex gap-1 overflow-x-auto">
          {tabs.map(t => (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition whitespace-nowrap ${tab === t.key ? 'border-cyan text-primary' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <span className="mr-1.5">{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>
      </nav>
      <main className="max-w-6xl mx-auto p-6 space-y-6">
        {activeDev ? (
          <>
            <DevHeader dev={activeDev} />
            <section>
              <SectionHeading icon="🗂️" title="Forward work" count={activeDev.forwardWorkItems.length} />
              <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                <ForwardWorkTable dev={activeDev} />
              </div>
            </section>
            <section>
              <SectionHeading icon="📦" title="Projects" count={tabProjects.length} />
              {tabProjects.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-500">
                  No projects attributed to {activeDev.name} yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {tabProjects.map(p => <ProjectCard key={p.slug} project={p} />)}
                </div>
              )}
            </section>
          </>
        ) : (
          <section>
            <SectionHeading icon="🧭" title="Strategy & analysis projects" count={tabProjects.length} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tabProjects.map(p => <ProjectCard key={p.slug} project={p} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
