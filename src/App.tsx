import { Fragment, useState, useEffect, useMemo, useRef } from 'react'

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

const CONFIG_DOC = (f: string) => `https://github.com/Deliver-Different-Testing/dfrntdrive_configurator/blob/master/docs/${f}`
const ACCOUNTS_DOC = (f: string) => `https://github.com/Deliver-Different-Testing/Accounts/blob/master/docs/${f}`
const ROUTED_OPS_DOC = (f: string) => `https://github.com/Deliver-Different-Testing/routed-operations/blob/main/docs/${f}`
const BUILD_ID = '2026-07-02-2028'

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
  { name: 'Scheduled Rating Rebuild', emoji: '📅', slug: 'scheduled-rating-rebuild', status: 'Active', owner: 'strategy', description: 'Modern rebuild of the legacy ClientManager schedule rating/setup tool — schedules, territory, rate codes, dimensions, pricing, and linehaul-oriented setup.', live: 'https://deliver-different-testing.github.io/scheduled-rate-builder/#/schedules', repo: 'https://github.com/Deliver-Different-Testing/scheduled-rate-builder', docs: 'https://github.com/Deliver-Different-Testing/scheduled-rate-builder/blob/main/docs/HANDOVER-KEVIN-SCHEDULES-PROTOTYPE-2026-06-18.md', extraLinks: [{ label: 'Overview', emoji: '📚', url: 'https://github.com/Deliver-Different-Testing/scheduled-rate-builder/blob/main/README.md' }, { label: 'Mockup', emoji: '🖥️', url: 'https://deliver-different-testing.github.io/scheduled-rate-builder/' }] },
  { name: 'Client / Customer Manager', emoji: '🏢', slug: 'client-customer-manager', status: 'Active', owner: 'strategy', description: 'New client/customer workspace inside the rebuild — searchable client list, customer detail workspace, activity/AR/context panels, and new-client flow.', live: 'https://deliver-different-testing.github.io/scheduled-rate-builder/#/clients', repo: 'https://github.com/Deliver-Different-Testing/scheduled-rate-builder', docs: 'https://github.com/Deliver-Different-Testing/scheduled-rate-builder/blob/main/IMPLEMENTATION.md', extraLinks: [{ label: 'Clients page', emoji: '👥', url: 'https://deliver-different-testing.github.io/scheduled-rate-builder/#/clients' }, { label: 'Repo overview', emoji: '📚', url: 'https://github.com/Deliver-Different-Testing/scheduled-rate-builder/blob/main/README.md' }] },
  { name: 'Accounts (Invoice Builder)', emoji: '🧾', slug: 'accounts', status: 'Active', owner: 'kerran', description: 'Invoice template builder, calc editor, field width control, void spec', live: 'https://deliver-different-testing.github.io/Accounts/', repo: 'https://github.com/Deliver-Different-Testing/Accounts', docs: 'https://github.com/Deliver-Different-Testing/Accounts/blob/master/docs/invoice-void-howto.md' },
  { name: 'Automation Engine', emoji: '⚡', slug: 'automation-engine', status: 'Active', owner: 'garry', description: 'Admin Manager with Automation Engine — conditions, actions, scope filters, backend C# services', live: 'https://deliver-different-testing.github.io/Adminmanagerupdate/', repo: 'https://github.com/Deliver-Different-Testing/Adminmanagerupdate', docs: 'https://github.com/Deliver-Different-Testing/Adminmanagerupdate/blob/main/HANDOVER-GARRY.md' },
  { name: 'Drive Configurator', emoji: '📱', slug: 'drive-configurator', status: 'Active', owner: 'garry', description: 'DFRNT Drive app config — workflows, supports, feature flags (Garry)', live: 'https://deliver-different-testing.github.io/dfrntdrive-configurator/', repo: 'https://github.com/Deliver-Different-Testing/dfrntdrive-configurator' },
  { name: 'Stryker Rate Analysis', emoji: '🏥', slug: 'stryker-rate-analysis', status: 'Complete', owner: 'strategy', description: 'Mt Wellington → East Tamaki move impact — zone pricing, drive times, delivery volumes, AM medical analysis', live: 'https://deliver-different-testing.github.io/stryker-analysis/', repo: 'https://github.com/Deliver-Different-Testing/stryker-analysis' },
  { name: 'ECA Dallas Promo', emoji: '🌐', slug: 'eca-dallas-promo', status: 'Active', owner: 'strategy', description: '"35 Years of Intelligence" — promo site with VC Trap article, Auto-Mate intro', live: 'https://deliver-different-testing.github.io/eca-dallas-promo/', repo: 'https://github.com/Deliver-Different-Testing/eca-dallas-promo' },
  { name: '1on1', emoji: '👥', slug: '1on1', status: 'Active', owner: 'strategy', description: '1-on-1 meeting & check-in tool', live: 'https://deliver-different-testing.github.io/1on1/', repo: 'https://github.com/Deliver-Different-Testing/1on1' },
  { name: 'Routed Operations (Route Builder v1)', emoji: '🛣️', slug: 'routed-operations', status: 'Active', owner: 'kevin', description: 'Umbrella Routed Operations product with Route Builder shipping first — stage 1 is parity for the legacy RunBuilder job→run→route→live workflow before broader modules.', live: 'https://deliver-different-testing.github.io/runbuilder/#/routes', repo: 'https://github.com/Deliver-Different-Testing/routed-operations', docs: ROUTED_OPS_DOC('HANDOVER-KEVIN-ROUTED-OPERATIONS-2026-06-23.md'), extraLinks: [{ label: 'Stage 1 plan', emoji: '📚', url: ROUTED_OPS_DOC('ROUTEBUILDER-STAGE1-RUNBUILDER-PARITY-BUILD-PLAN-2026-06-20.md') }, { label: 'Legacy fixes spec', emoji: '🧯', url: ROUTED_OPS_DOC('KEVIN-LEGACY-RUNBUILDER-FIXES-SPEC-2026-06-23.md') }, { label: 'New UI', emoji: '🖥️', url: 'https://deliver-different-testing.github.io/runbuilder/#/routes' }, { label: 'Mockup', emoji: '🎨', url: 'https://deliver-different-testing.github.io/runbuilder/' }] },
]

type SyncMode = 'shared' | 'local'

interface RunsheetEntry { id: string; ts: number; text: string; by?: string | null }
interface ReleaseNoteEntry {
  id: string
  devKey: string
  title: string
  body: string
  ts: number
  by?: string | null
  sourceItemKey?: string | null
  sourceUrl?: string | null
  autoGenerated?: boolean
  exceptions?: string | null
}

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
        key: 'linehaul-driver-workflow-simplification',
        title: 'Linehaul driver workflow simplification',
        summary: 'Keep the existing LH master-job linkage, make the linked master inherit/receive the linehaul run courier assignment, hide child LH jobs from the LH driver handset, and route the master into Tote Linehaul Pickup while preserving child-job tracking and chain of custody.',
        date: '2026-07-02',
        url: CONFIG_DOC('STEVE-LINEHAUL-DRIVER-WORKFLOW-SIMPLIFICATION-GARRY-2026-07-02.md'),
      },
      {
        key: 'master-job-persistence-anchor-check',
        title: 'Master-job persistence anchor — quick check for today',
        summary: 'Clean answer for today: spec intent says the durable master-job anchor is the recurring tucJobBooking row, not the first live recurring job number; implementation is not yet proven complete until the LinehaulRunID persistence work is actually verified end-to-end.',
        date: '2026-06-30',
        url: 'https://github.com/Deliver-Different-Testing/runviewer-fixes/blob/main/ADDENDUM-KEVIN-GARRY-MASTER-JOB-PERSISTENCE-ANCHOR-2026-06-30.md',
      },
      {
        key: 'linehaul-scanning-clarifications',
        title: 'Linehaul scanning — clarification pack for Claude Code',
        summary: 'Answers the additional-item reconciliation questions and locks the target behaviour: unexpected items must become real backend items, propagate into downstream leg expected counts, reconcile tote completion against all expected pieces, and allow multiple totes per master leg.',
        date: '2026-06-27',
        url: CONFIG_DOC('STEVE-LINEHAUL-SCANNING-GARRY-CLARIFICATIONS-2026-06-27.md'),
      },
      {
        key: 'linehaul-run-modal-master-job-selector',
        title: 'Linehaul Run modal — master-job selector',
        summary: 'Add a recurring master linehaul job lookup to Edit Linehaul Run, shortlist recurring active parent tucJobBooking rows by matching from/to depots, stamp the selected booking row with LinehaulRunId, and use that link as the missing bridge into Garry\'s tote scanning flow and runviewer visibility.',
        date: '2026-06-25',
        url: CONFIG_DOC('STEVE-LINEHAUL-RUN-MODAL-MASTER-JOB-GARRY-2026-06-25.md'),
      },
      {
        key: 'linehaul-scanning-handover',
        title: 'Linehaul scanning — finalised handover',
        summary: 'Tote-first scan workflow for linehaul: verify current Additional Item propagation, add tblLinehaulTote + tblLinehaulToteItem, reuse tblBulkScan/ScanType for depot+tote audit, make first valid item bind tote to active LinehaulRunId, then let one tote scan fan out Picked Up across child linehaul jobs.',
        date: '2026-06-24',
        url: CONFIG_DOC('STEVE-LINEHAUL-SCANNING-HANDOVER-GARRY-2026-06-24.md'),
      },
      {
        key: 'linehaul-flight-mode-minimal',
        title: 'Linehaul flight mode — minimal setup brief',
        summary: 'Add a Road / Flight toggle to the linehaul setup modal, use tblAirport code/name lookup, persist minimal flight-segment metadata, and hand booked jobs into the existing despatchweb domestic/nationwide flight path.',
        date: '2026-06-22',
        url: CONFIG_DOC('STEVE-LINEHAUL-FLIGHT-MODE-MINIMAL-GARRY-2026-06-22.md'),
      },
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
    currentWorkUrl: ROUTED_OPS_DOC('HANDOVER-KEVIN-ROUTED-OPERATIONS-2026-06-23.md'),
    forwardWorkUrl: ROUTED_OPS_DOC('HANDOVER-KEVIN-ROUTED-OPERATIONS-2026-06-23.md'),
    forwardWorkItems: [
      {
        key: 'routed-speed-autobook-dual-zip-nz-addendum',
        title: 'Routed-speed AutoBook — NZ + dual ZIP addendum',
        summary: 'Extend the routed-speed autobook work to NZ tenants, resolve routes from pickup or delivery ZIP, and support split ownership where parent/LHP/linehaul inherit the pickup route while LHD inherits the delivery route when both sides map to different recurring routes.',
        date: '2026-07-02',
        url: CONFIG_DOC('KEVIN-ROUTED-SPEED-AUTOBOOK-DUAL-ZIP-NZ-ADDENDUM-2026-07-02.md'),
      },
      {
        key: 'master-job-persistence-anchor-check',
        title: 'Master-job persistence anchor — quick check for today',
        summary: 'Clean answer for today: spec intent says the durable master-job anchor is the recurring tucJobBooking row, not the first live recurring job number; implementation is not yet proven complete until the LinehaulRunID persistence work is actually verified end-to-end.',
        date: '2026-06-30',
        url: 'https://github.com/Deliver-Different-Testing/runviewer-fixes/blob/main/ADDENDUM-KEVIN-GARRY-MASTER-JOB-PERSISTENCE-ANCHOR-2026-06-30.md',
      },
      {
        key: 'linehaul-run-id-recurring-linehaul-fix',
        title: 'LinehaulRunID persistence on recurring linehaul legs',
        summary: 'Persist the selected linehaul run against the recurring master booking row rather than the first live job number, and carry LinehaulRunID through recurring linehaul creation into tucJob for the initial live legs and tucJobBooking for recurring linehaul leg records.',
        date: '2026-06-29',
        url: 'https://github.com/Deliver-Different-Testing/runviewer-fixes/blob/main/HANDOVER-KEVIN-LINEHAULRUNID-RECURRING-LINEHAUL-2026-06-29.md',
      },
      {
        key: 'runviewer-outstanding-fixes-consolidated',
        title: 'RunViewer / Print Manager outstanding fixes',
        summary: 'Single Kevin fix pack consolidating the open RunViewer + Print Manager issues, including tucJob-first print/status behaviour plus the recurring Booking App bugs where schedule time overrides the entered booking time and recurring creation fails to reliably seed booking items before tucJobItems copy-through.',
        date: '2026-06-27',
        url: 'https://github.com/Deliver-Different-Testing/runviewer/blob/master/docs/STEVE-KEVIN-RUNVIEWER-OUTSTANDING-FIXES-2026-06-27.md',
      },
      {
        key: 'time-persistence-addendum',
        title: 'Time persistence addendum',
        summary: 'Tight addendum to fix #5: keep Kevin’s WebAPI PickupReadyDateTime fix, stop recurring parent jobs from reverting to schedule datetime, advance the initial live-insert window to the next valid day, and explicitly do not change ad hoc routed will-call time semantics.',
        date: '2026-06-27',
        url: 'https://github.com/Deliver-Different-Testing/runviewer/blob/main/docs/STEVE-KEVIN-TIME-PERSISTENCE-ADDENDUM-2026-06-27.md',
      },
      {
        key: 'print-manager-fixes',
        title: 'Print Manager fixes',
        summary: 'Make Print Manager job detail match the RunViewer/Linehaul detail, make item edits use the same pricing and extra-items-table logic as DespatchWeb, and fix the filter dropdown selectors so they do not cover each other and collapse cleanly.',
        date: '2026-06-26',
        url: 'https://github.com/Deliver-Different-Testing/runviewer/blob/master/docs/STEVE-KEVIN-PRINT-MANAGER-FIXES-2026-06-26.md',
      },
      {
        key: 'runviewer-offsets-admin-linehaul-handover',
        title: 'RunViewer offsets + Admin Manager + linehaul tweak',
        summary: 'Persist resolved pickup/delivery early-late offsets across tucJobBooking, tblBulkJob, tucJob, and tucJobArchive; add Admin Manager service/speed editing for the offset mins; preserve the user-selected recurring booking ready time into tucJobBooking/tucJob instead of reverting to schedule start time; and remove duplicated delivery-location rendering in the linehaul dash while keeping the abbreviated right-hand destination detail.',
        date: '2026-06-25',
        url: ROUTED_OPS_DOC('HANDOVER-KEVIN-RUNVIEWER-OFFSETS-ADMIN-LINEHAUL-2026-06-25.md'),
      },
      {
        key: 'legacy-runbuilder-fixes-spec',
        title: 'Legacy RunBuilder / RouteViewer fixes spec',
        summary: 'Initial screenshot-driven fix pack: verify today-default date behaviour, trace run-status origin, and fix BUILDING/LIVE drift against actual dispatch/job state in the legacy interface.',
        date: '2026-06-23',
        url: ROUTED_OPS_DOC('KEVIN-LEGACY-RUNBUILDER-FIXES-SPEC-2026-06-23.md'),
      },
      {
        key: 'routed-operations-handover',
        title: 'Routed Operations handover',
        summary: 'Rename RouteBuilder into the broader Routed Operations stream while keeping Route Builder as release 1 and preserving legacy RunBuilder as the reference workflow.',
        date: '2026-06-23',
        url: ROUTED_OPS_DOC('HANDOVER-KEVIN-ROUTED-OPERATIONS-2026-06-23.md'),
      },
      {
        key: 'first-up-runviewer-recurring-fixes',
        title: 'First-up RunViewer + recurring fixes',
        summary: 'Stop recurring-route setup from creating bulk-job data, preserve booking time on Manual push-to-live, close out price-breakdown behaviour for recurring-route-created jobs, and make RunViewer + Linehaul job details editable like recurring jobs / despatchweb.',
        date: '2026-06-20',
        url: 'https://github.com/Deliver-Different-Testing/runviewer/blob/master/docs/STEVE-KEVIN-FIRST-UP-FIXES-RUNVIEWER-RECURRING-2026-06-20.md',
      },
      {
        key: 'routebuilder-rebuild',
        title: 'RouteBuilder rebuild',
        summary: 'Stage 1 brief: make the existing Runbuilder job→run→route→live workflow work in the new React UI first, including RH-popout route criteria (A-B, A-A, forced-last-stop, delivery/pickup windows, fixed route before driver send), before expanding Quoting, Scheduled Routes, or Polygon Builder.',
        date: '2026-06-20',
        url: 'https://github.com/Deliver-Different-Testing/routebuilder/blob/main/docs/ROUTEBUILDER-STAGE1-RUNBUILDER-PARITY-BUILD-PLAN-2026-06-20.md',
      },
      {
        key: 'recurring-resilience',
        title: 'Recurring resilience — Phase 1',
        summary: 'tucJobBookingProcessingError table, UTL_stpJobBooking_Monitor TRY/CATCH cursor wrap with XACT_ABORT OFF, end-of-run digest email. Unblocks 2026-06-15 outage class.',
        date: '2026-06-17',
        url: CONFIG_DOC('HANDOVER-KEVIN-RECURRING-RESILIENCE-2026-06-17.md'),
      },
      {
        key: 'recurring-windows-booking-spec',
        title: 'Recurring windows + booking-time persistence',
        summary: 'Add pickup/delivery window defaults on tucJobType with client overrides, preserve the user-entered/uploaded recurring time from tucJobPrebook into live tucJob, and keep route-list grouping tied to schedule time.',
        date: '2026-06-23',
        url: CONFIG_DOC('KEVIN-RECURRING-WINDOWS-BOOKING-SPEC-2026-06-23.md'),
      },
      {
        key: 'usa-bulk-uploader-fixes',
        title: 'USA Bulk Uploader fixes',
        summary: 'Enable CSV upload, hide Google Drive until approval, make mapping labels generic, fix Boston/USA geocoding, make zipPolygon the coverage-first validation layer, and support stop type at import time.',
        date: '2026-06-23',
        url: 'https://github.com/Deliver-Different-Testing/bulkimport/blob/master/KEVIN-USA-BULK-UPLOADER-BRIEF-2026-06-23.md',
      },
      {
        key: 'legacy-runbuilder-delivery-window-build',
        title: 'Legacy RunBuilder delivery-window build mode',
        summary: 'Add a build parameter in the existing date popup so ops can choose Max Boxes or Delivery Window, expose minutes-per-stop there as an editable build setting, and use the schedule day Start/End window instead of only MaxJobsPerRun.',
        date: '2026-06-23',
        url: 'https://github.com/Deliver-Different-Testing/runbuilder/blob/master/docs/KEVIN-RUNBUILDER-BUILD-WINDOW-SPEC-2026-06-23.md',
      },
    ],
  },
  {
    key: 'kerran',
    name: 'Kerran',
    emoji: '🧾',
    focus: 'Accounts — AR, BCTI, settlements, revenue tracking, payment method, contractor flows',
    currentWorkUrl: ACCOUNTS_DOC('KERRAN-ATB-NATIVE-ENDPOINT-FIX-2026-06-25.md'),
    forwardWorkUrl: ACCOUNTS_DOC('FORWARD-KERRAN.md'),
    forwardWorkItems: [
      {
        key: 'atb-native-term-cohort-handover',
        title: 'ATB native endpoint + term-cohort handover',
        summary: 'Replace the mixed All Terms ATB idea with a required term cohort selector, render one cohort per table with dynamic bucket columns, use native Xero/QBO aged-receivables reports for the financial truth, persist a DFRNT snapshot for reminder operations, and always send the DFRNT invoice PDF rather than provider reminder copies.',
        date: '2026-06-25',
        url: ACCOUNTS_DOC('KERRAN-ATB-NATIVE-ENDPOINT-FIX-2026-06-25.md'),
      },
      {
        key: 'ar-atb-ui-mock-to-real',
        title: 'Aged Trial Balance UI mock → real build',
        summary: 'The mocked /clients/ar Accounts Receivable screen is not done. Wire the ATB page from mock data to real QBO/Xero API, keep the filters/side panel, and make the mocked AR UI fully operational.',
        date: '2026-06-18',
        url: ACCOUNTS_DOC('KERRAN-AR-HANDOVER-IMPLEMENTATION-2026-06-18.md'),
      },
      {
        key: 'ar-pack',
        title: 'AR / Accounts Receivable feature pack',
        summary: 'Broader AR delivery behind the mocked ATB UI: snapshot/refresh/send flow, AR settings, tblAccountsSettings, template persistence, cadence engine, and reminder log tables.',
        date: '2026-06-18',
        url: ACCOUNTS_DOC('KERRAN-AR-HANDOVER-IMPLEMENTATION-2026-06-18.md'),
      },
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
        key: 'recurring-scheduled-booking-check',
        title: 'Recurring scheduled booking — zero-day + linehaul timing check',
        summary: 'Trace the scheduled recurring booking SP chain and lock the behaviour for Initial days = 0, a new template-only/no-live-jobs mode, and the multi-linehaul bug where LH1 can drift 24 hours after pickup.',
        date: '2026-06-30',
        url: CONFIG_DOC('JACOB-RECURRING-SCHEDULED-BOOKING-CHECK-2026-06-30.md'),
      },
      {
        key: 'flight-functionality-behaviour-check',
        title: 'Flight functionality behaviour check',
        summary: 'Validate whether the existing domestic/nationwide flight path already gives us everything needed once a linehaul master job is booked as a flight job, with explicit focus on charter-flight handling, required job fields, and any hidden assumptions that would break the thin Road/Flight approach.',
        date: '2026-06-30',
        url: CONFIG_DOC('JACOB-FLIGHT-FUNCTIONALITY-BEHAVIOUR-CHECK-2026-06-30.md'),
      },
      {
        key: 'pdf-intake-job-creation-spec',
        title: 'PDF intake → job creation spec + implementation map',
        summary: 'The original product/spec markdown is now updated to reflect what is already coded versus what remains: pure-.NET extraction, SQL-backed submission queue, saved source PDF, field-level review UI, and the remaining OCR/template/richer-review work.',
        date: '2026-06-29',
        url: 'https://github.com/Deliver-Different-Testing/PDF-Overlay-Tool/blob/main/docs/PDF_INTAKE_JOB_CREATION.md',
      },
      {
        key: 'pdf-intake-backend-handover',
        title: 'PDF intake backend — SQL-backed review queue',
        summary: 'First real backend slice is now in the PDF Overlay Tool: managed .NET PDF extraction, tblPdfIntakeSubmission persistence, real /v1/intake submission/review/rates/book/source endpoints, and a React page wired to the live API contract with field-level review controls. Next step is compile verification on a machine with dotnet plus richer multi-package/review UX.',
        date: '2026-06-29',
        url: 'https://github.com/Deliver-Different-Testing/PDF-Overlay-Tool/blob/main/docs/HANDOVER-JACOB-PDF-INTAKE-BACKEND-2026-06-29.md',
      },
      {
        key: 'client-difot-reporting',
        title: 'Client DIFOT reporting',
        summary: 'Use the configurator scaffold first: sync the shell to the live configurator menu/route structure, then build DIFOT under Client Reporting. Do the heavy EF Core surfacing from tucJobArchive, use Zimmer-style parent + earliest DEL child timing, and shape the dataset so the same contract can drive screen preview, PDF, XLSX, and later Google Sheet export.',
        date: '2026-06-26',
        url: CONFIG_DOC('HANDOVER-CLIENT-DIFOT-REPORTING-2026-06-26.md'),
      },
      {
        key: 'baggage-pax-portal-changes',
        title: 'Baggage pax portal changes',
        summary: 'Implement the baggage passenger-flow fixes against the real GitLab app: airline-code-driven branding, prefill the on-hold job delivery address from tucJob, and align Authority to Leave with booking app behaviour while posting ATL id cleanly back to DeliverToLeaveId.',
        date: '2026-06-26',
        url: 'https://github.com/Deliver-Different-Testing/baggage-portal/blob/master/JACOB-BAGGAGE-PAX-PORTAL-CHANGES-2026-06-26.md',
      },
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

interface RowState { status: ItemStatus; notes: string; updated: number | null; updatedBy?: string | null }

const blankRow: RowState = { status: 'Not started', notes: '', updated: null, updatedBy: null }

const API_BASE = (import.meta.env.VITE_PROJECT_DASH_API_URL || '').replace(/\/$/, '')
const HAS_SHARED_API = API_BASE.length > 0

function userDisplayName(name: string) {
  return name.trim() || 'Unknown'
}

function normalizeRowState(value: Partial<RowState> | undefined): RowState {
  return {
    status: value?.status && STATUS_OPTIONS.includes(value.status) ? value.status : 'Not started',
    notes: typeof value?.notes === 'string' ? value.notes : '',
    updated: typeof value?.updated === 'number' ? value.updated : null,
    updatedBy: typeof value?.updatedBy === 'string' ? value.updatedBy : null,
  }
}

function normalizeRunsheetEntry(value: Partial<RunsheetEntry> & { ts?: number; text?: string; id?: string | number }): RunsheetEntry {
  const ts = typeof value.ts === 'number' ? value.ts : Date.now()
  const id = value.id !== undefined ? String(value.id) : String(ts)
  return {
    id,
    ts,
    text: typeof value.text === 'string' ? value.text : '',
    by: typeof value.by === 'string' ? value.by : null,
  }
}

function normalizeReleaseNoteEntry(value: Partial<ReleaseNoteEntry> & { ts?: number; title?: string; body?: string; id?: string | number; devKey?: string }): ReleaseNoteEntry {
  const ts = typeof value.ts === 'number' ? value.ts : Date.now()
  const id = value.id !== undefined ? String(value.id) : String(ts)
  return {
    id,
    devKey: typeof value.devKey === 'string' ? value.devKey : '',
    title: typeof value.title === 'string' ? value.title : '',
    body: typeof value.body === 'string' ? value.body : '',
    ts,
    by: typeof value.by === 'string' ? value.by : null,
    sourceItemKey: typeof value.sourceItemKey === 'string' ? value.sourceItemKey : null,
    sourceUrl: typeof value.sourceUrl === 'string' ? value.sourceUrl : null,
    autoGenerated: Boolean(value.autoGenerated),
    exceptions: typeof value.exceptions === 'string' ? value.exceptions : '',
  }
}

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`)
  if (!response.ok) throw new Error(`GET ${path} failed (${response.status})`)
  return response.json()
}

async function apiSend<T>(path: string, method: 'POST' | 'PUT' | 'PATCH' | 'DELETE', body?: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (!response.ok) throw new Error(`${method} ${path} failed (${response.status})`)
  return response.status === 204 ? undefined as T : response.json()
}

function loadDevState(devKey: string): Record<string, RowState> {
  try {
    const raw = localStorage.getItem(`forward-work:${devKey}:v1`)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    if (!parsed || typeof parsed !== 'object') return {}
    return Object.fromEntries(Object.entries(parsed).map(([key, value]) => [key, normalizeRowState(value as Partial<RowState>)]))
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

function loadRunsheetEntries(projectSlug: string): RunsheetEntry[] {
  try {
    const raw = localStorage.getItem(`runsheet-${projectSlug}`)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(entry => normalizeRunsheetEntry(entry))
  } catch {
    return []
  }
}

function saveRunsheetEntries(projectSlug: string, entries: RunsheetEntry[]) {
  localStorage.setItem(`runsheet-${projectSlug}`, JSON.stringify(entries))
}

function loadReleaseNotes(devKey: string): ReleaseNoteEntry[] {
  try {
    const raw = localStorage.getItem(`release-notes-${devKey}`)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.map(entry => normalizeReleaseNoteEntry(entry))
  } catch {
    return []
  }
}

function saveReleaseNotes(devKey: string, entries: ReleaseNoteEntry[]) {
  localStorage.setItem(`release-notes-${devKey}`, JSON.stringify(entries))
}

const RELEASE_NOTES_EVENT = 'project-dashboard:release-notes-updated'

function emitReleaseNotesUpdated(devKey: string) {
  window.dispatchEvent(new CustomEvent(RELEASE_NOTES_EVENT, { detail: { devKey } }))
}

function upsertReleaseNoteLocally(devKey: string, entry: ReleaseNoteEntry) {
  const normalized = normalizeReleaseNoteEntry(entry)
  const existing = loadReleaseNotes(devKey)
  const next = [normalized, ...existing.filter(candidate => candidate.id !== normalized.id && candidate.sourceItemKey !== normalized.sourceItemKey)]
    .sort((a, b) => b.ts - a.ts)
  saveReleaseNotes(devKey, next)
  emitReleaseNotesUpdated(devKey)
  return normalized
}

function deleteReleaseNoteLocally(devKey: string, entryId: string) {
  const next = loadReleaseNotes(devKey).filter(entry => entry.id !== entryId)
  saveReleaseNotes(devKey, next)
  emitReleaseNotesUpdated(devKey)
}

function sourceDocToRawUrl(url?: string) {
  if (!url) return null
  const githubBlob = url.match(/^https:\/\/github\.com\/([^/]+)\/([^/]+)\/blob\/([^/]+)\/(.+)$/)
  if (githubBlob) {
    return `https://raw.githubusercontent.com/${githubBlob[1]}/${githubBlob[2]}/${githubBlob[3]}/${githubBlob[4]}`
  }
  return url
}

async function fetchSourceDoc(url?: string) {
  const rawUrl = sourceDocToRawUrl(url)
  if (!rawUrl) return ''
  try {
    const response = await fetch(rawUrl)
    if (!response.ok) return ''
    return await response.text()
  } catch {
    return ''
  }
}

function cleanMarkdownLine(line: string) {
  return line
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[`*_>#-]/g, ' ')
    .replace(/\|/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractDocHighlights(markdown: string) {
  if (!markdown) return [] as string[]
  const withoutFrontMatter = markdown.replace(/^---[\s\S]*?---\s*/,'')
  const withoutCode = withoutFrontMatter.replace(/```[\s\S]*?```/g, ' ')
  const lines = withoutCode.split(/\r?\n/)
  const bullets: string[] = []
  const prose: string[] = []

  lines.forEach(raw => {
    const line = raw.trim()
    if (!line || /^#{1,6}\s/.test(line) || /^\|/.test(line) || /^[-=]{3,}$/.test(line)) return
    if (/^>/.test(line)) return

    if (/^([-*+]|\d+\.)\s+/.test(line)) {
      const cleaned = cleanMarkdownLine(line.replace(/^([-*+]|\d+\.)\s+/, ''))
      if (cleaned.length >= 20 && cleaned.length <= 220) bullets.push(cleaned)
      return
    }

    const cleaned = cleanMarkdownLine(line)
    if (cleaned.length >= 40 && cleaned.length <= 220) prose.push(cleaned)
  })

  const merged = [...bullets, ...prose]
  return merged.filter((line, index) => merged.findIndex(other => other.toLowerCase() === line.toLowerCase()) === index).slice(0, 4)
}

function isTechnicalLine(line: string) {
  return /(tbl|tuc|stp|api|sql|migration|controller|repository|context|foreign key|jwt|xact_abort|try\/catch|cursor|table|column|nvarchar|bit\b|identity\()/i.test(line)
    || /[A-Za-z]+_[A-Za-z0-9_]+/.test(line)
    || /[a-z]+[A-Z][A-Za-z]+/.test(line)
}

function splitSummary(summary: string) {
  const sentences = summary
    .split(/(?<=[.!?])\s+/)
    .map(part => part.trim())
    .filter(Boolean)

  const impact = sentences.find(sentence => !isTechnicalLine(sentence)) || ''
  const technical = sentences.find(sentence => isTechnicalLine(sentence)) || ''

  return { impact, technical }
}

function sentenceCase(text: string) {
  const trimmed = text.trim()
  if (!trimmed) return ''
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1)
}

function tenantReleaseTitle(item: ForwardWorkItem) {
  const cleaned = item.title
    .replace(/\s+—\s+pull commit.*$/i, '')
    .replace(/\s+\([^)]*\)$/g, '')
    .replace(/\s+completed$/i, '')
    .trim()

  if (/recurring\s+resilience/i.test(cleaned)) {
    return 'Recurring booking resilience improvements'
  }

  if (/improvement|improvements|update|updates|alignment|integration|resilience|cleanup|redesign|rebuild|fix|fixes|brief/i.test(cleaned)) {
    return sentenceCase(cleaned)
  }

  return `${sentenceCase(cleaned)} update`
}

function tenantImpactLine(item: ForwardWorkItem, highlights: string[]) {
  if (/recurring\s+resilience/i.test(item.title)) {
    return 'We’ve improved recurring booking processing so bad data no longer stops the whole run.'
  }

  const summaryParts = splitSummary(item.summary)
  const candidate = summaryParts.impact || highlights[0] || item.summary
  const cleaned = cleanMarkdownLine(candidate)

  if (/unblock|no longer|continue|review|manage|see|view|track|record|skip/i.test(cleaned)) {
    return sentenceCase(cleaned)
  }

  return `This update improves ${item.title.toLowerCase()} and makes the workflow easier to use and support.`
}

function tenantNeedsToKnow(item: ForwardWorkItem, highlights: string[]) {
  if (/recurring\s+resilience/i.test(item.title)) {
    return 'If a recurring booking contains invalid data, it will now be skipped and recorded for follow-up while the rest of the valid bookings continue processing.'
  }

  const combined = [item.summary, ...highlights].map(cleanMarkdownLine).filter(Boolean)
  const best = combined.find(line => /(can now|now|review|manage|view|continue|skip|record|see)/i.test(line) && !isTechnicalLine(line))
  if (best) return sentenceCase(best)
  return 'No action is required unless exceptions are noted below.'
}

function relevantUiLine(item: ForwardWorkItem) {
  if (!item.url) return ''
  if (/github\.com/i.test(item.url)) return ''
  return `View it here: ${item.url}`
}

function composeReleaseNoteBody(baseBody: string, exceptions: string) {
  const trimmedBase = baseBody.trim()
  const trimmedExceptions = exceptions.trim()
  if (!trimmedExceptions) return trimmedBase
  return `${trimmedBase}\n\nExceptions to spec\n${trimmedExceptions}`.trim()
}

function splitReleaseNoteBody(body: string) {
  const marker = /\n\nExceptions to spec\n/i
  const parts = body.split(marker)
  return {
    baseBody: parts[0]?.trim() || body.trim(),
    exceptions: parts[1]?.trim() || '',
  }
}

function buildAutoReleaseNote(item: ForwardWorkItem, markdown: string) {
  const highlights = extractDocHighlights(markdown).filter(line => !isTechnicalLine(line))
  const changeLine = tenantImpactLine(item, highlights)
  const needsToKnow = tenantNeedsToKnow(item, highlights)
  const uiLine = relevantUiLine(item)
  return {
    title: tenantReleaseTitle(item),
    baseBody: [
      `We’ve released an update for ${tenantReleaseTitle(item).toLowerCase()}.`,
      '',
      'What changed',
      `- ${changeLine}`,
      '',
      'What you need to know',
      `- ${needsToKnow}`,
      ...(uiLine ? ['', 'Where to find it', `- ${uiLine}`] : []),
    ].join('\n').trim(),
  }
}

function autoReleaseTitle(item: ForwardWorkItem) {
  return tenantReleaseTitle(item)
}

function ForwardWorkTable({ dev, currentUser }: { dev: Dev; currentUser: string }) {
  const devKey = dev.key
  const [state, setState] = useState<Record<string, RowState>>(() => loadDevState(devKey))
  const [order, setOrder] = useState<string[]>(() => loadDevOrder(devKey, dev.forwardWorkItems))
  const [syncMode, setSyncMode] = useState<SyncMode>(HAS_SHARED_API ? 'shared' : 'local')
  const [syncMessage, setSyncMessage] = useState<string>(HAS_SHARED_API ? 'Shared sync connected' : 'Local-only mode')
  const [editingNotesKey, setEditingNotesKey] = useState<string | null>(null)
  const [releasePrompt, setReleasePrompt] = useState<null | {
    noteId: string
    itemKey: string
    itemTitle: string
    baseBody: string
    exceptions: string
  }>(null)
  const pollRef = useRef<number | null>(null)

  const hydrateFromRemote = async () => {
    if (!HAS_SHARED_API) return
    try {
      const data = await apiGet<{ state: Record<string, RowState>; order: string[] }>(`/api/forward-work/${devKey}`)
      const nextState = Object.fromEntries(Object.entries(data.state || {}).map(([key, value]) => [key, normalizeRowState(value)]))
      const remoteOrder = Array.isArray(data.order) ? data.order.filter(key => typeof key === 'string') : []
      setState(prev => {
        const merged = { ...prev }
        Object.entries(nextState).forEach(([key, value]) => {
          if (editingNotesKey === key) return
          merged[key] = value
        })
        return merged
      })
      setOrder(loadDevOrder(devKey, dev.forwardWorkItems).map(key => key))
      if (remoteOrder.length > 0) {
        const known = new Set(dev.forwardWorkItems.map(item => item.key))
        const cleaned = remoteOrder.filter(key => known.has(key))
        const missing = dev.forwardWorkItems.map(item => item.key).filter(key => !cleaned.includes(key))
        setOrder([...cleaned, ...missing])
      }
      setSyncMode('shared')
      setSyncMessage('Shared sync connected')
    } catch {
      setSyncMode('local')
      setSyncMessage('Shared API unavailable — using local browser state')
    }
  }

  useEffect(() => {
    setState(loadDevState(devKey))
    setOrder(loadDevOrder(devKey, dev.forwardWorkItems))
    void hydrateFromRemote()
  }, [devKey, dev.forwardWorkItems])

  useEffect(() => {
    saveDevState(devKey, state)
  }, [devKey, state])

  useEffect(() => {
    setOrder(prev => {
      const known = new Set(dev.forwardWorkItems.map(item => item.key))
      const cleaned = prev.filter(key => known.has(key))
      const missing = dev.forwardWorkItems.map(item => item.key).filter(key => !cleaned.includes(key))
      return [...cleaned, ...missing]
    })
  }, [dev.forwardWorkItems])

  useEffect(() => {
    saveDevOrder(devKey, order)
  }, [devKey, order])

  useEffect(() => {
    if (!HAS_SHARED_API || editingNotesKey) return
    pollRef.current = window.setInterval(() => {
      void hydrateFromRemote()
    }, 15000)
    return () => {
      if (pollRef.current) window.clearInterval(pollRef.current)
    }
  }, [devKey, editingNotesKey, dev.forwardWorkItems])

  const persistRow = async (key: string, row: RowState) => {
    if (!HAS_SHARED_API) return
    try {
      const saved = await apiSend<RowState>(`/api/forward-work/${devKey}/${key}`, 'PUT', {
        status: row.status,
        notes: row.notes,
        updatedBy: userDisplayName(currentUser),
      })
      setState(prev => ({ ...prev, [key]: normalizeRowState(saved) }))
      setSyncMode('shared')
      setSyncMessage(`Shared sync updated by ${userDisplayName(currentUser)}`)
    } catch {
      setSyncMode('local')
      setSyncMessage('Could not sync change — kept locally in this browser')
    }
  }

  const persistOrder = async (nextOrder: string[]) => {
    if (!HAS_SHARED_API) return
    try {
      await apiSend(`/api/forward-work/${devKey}/order`, 'PUT', {
        order: nextOrder,
        updatedBy: userDisplayName(currentUser),
      })
      setSyncMode('shared')
      setSyncMessage(`Order synced by ${userDisplayName(currentUser)}`)
    } catch {
      setSyncMode('local')
      setSyncMessage('Could not sync order — kept locally in this browser')
    }
  }

  const updateRowDraft = (key: string, patch: Partial<RowState>) => {
    setState(prev => ({
      ...prev,
      [key]: { ...blankRow, ...prev[key], ...patch, updated: Date.now(), updatedBy: userDisplayName(currentUser) },
    }))
  }

  const commitRow = (key: string, patch: Partial<RowState>) => {
    const nextRow = { ...blankRow, ...state[key], ...patch, updated: Date.now(), updatedBy: userDisplayName(currentUser) }
    setState(prev => ({ ...prev, [key]: nextRow }))
    void persistRow(key, nextRow)
  }

  const createReleaseNote = async (entry: ReleaseNoteEntry) => {
    const optimistic = upsertReleaseNoteLocally(devKey, entry)
    if (!HAS_SHARED_API) return optimistic
    try {
      const saved = await apiSend<ReleaseNoteEntry>(`/api/release-notes/${devKey}/entries`, 'POST', {
        title: optimistic.title,
        body: optimistic.body,
        createdBy: userDisplayName(currentUser),
        sourceItemKey: optimistic.sourceItemKey,
        sourceUrl: optimistic.sourceUrl,
        autoGenerated: optimistic.autoGenerated,
        exceptions: optimistic.exceptions,
      })
      return upsertReleaseNoteLocally(devKey, normalizeReleaseNoteEntry(saved))
    } catch {
      setSyncMode('local')
      return optimistic
    }
  }

  const updateReleaseNote = async (entry: ReleaseNoteEntry) => {
    const optimistic = upsertReleaseNoteLocally(devKey, entry)
    if (!HAS_SHARED_API || optimistic.id.startsWith('local-')) return optimistic
    try {
      const saved = await apiSend<ReleaseNoteEntry>(`/api/release-notes/${devKey}/entries/${optimistic.id}`, 'PATCH', {
        title: optimistic.title,
        body: optimistic.body,
        exceptions: optimistic.exceptions,
        updatedBy: userDisplayName(currentUser),
      })
      return upsertReleaseNoteLocally(devKey, normalizeReleaseNoteEntry(saved))
    } catch {
      try {
        const recreated = await apiSend<ReleaseNoteEntry>(`/api/release-notes/${devKey}/entries`, 'POST', {
          title: optimistic.title,
          body: optimistic.body,
          createdBy: userDisplayName(currentUser),
        })
        await apiSend(`/api/release-notes/${devKey}/entries/${optimistic.id}`, 'DELETE')
        deleteReleaseNoteLocally(devKey, optimistic.id)
        return upsertReleaseNoteLocally(devKey, normalizeReleaseNoteEntry({
          ...recreated,
          sourceItemKey: optimistic.sourceItemKey,
          sourceUrl: optimistic.sourceUrl,
          autoGenerated: optimistic.autoGenerated,
          exceptions: optimistic.exceptions,
        }))
      } catch {
        setSyncMode('local')
        return optimistic
      }
    }
  }

  const triggerAutoReleaseNote = async (item: ForwardWorkItem) => {
    const existing = loadReleaseNotes(devKey).find(entry => entry.sourceItemKey === item.key || entry.title === autoReleaseTitle(item))
    if (existing) {
      const split = splitReleaseNoteBody(existing.body)
      setReleasePrompt({
        noteId: existing.id,
        itemKey: item.key,
        itemTitle: item.title,
        baseBody: split.baseBody,
        exceptions: existing.exceptions || split.exceptions,
      })
      return
    }

    const markdown = await fetchSourceDoc(item.url)
    const generated = buildAutoReleaseNote(item, markdown)
    const saved = await createReleaseNote(normalizeReleaseNoteEntry({
      id: `local-${Date.now()}`,
      devKey,
      title: autoReleaseTitle(item),
      body: generated.baseBody,
      ts: Date.now(),
      by: userDisplayName(currentUser),
      sourceItemKey: item.key,
      sourceUrl: item.url || null,
      autoGenerated: true,
      exceptions: '',
    }))

    setReleasePrompt({
      noteId: saved.id,
      itemKey: item.key,
      itemTitle: item.title,
      baseBody: generated.baseBody,
      exceptions: '',
    })
  }

  const handleStatusChange = (item: ForwardWorkItem, nextStatus: ItemStatus) => {
    const previousStatus = state[item.key]?.status ?? 'Not started'
    commitRow(item.key, { status: nextStatus })
    if (nextStatus === 'Done' && previousStatus !== 'Done') {
      void triggerAutoReleaseNote(item)
    }
  }

  const saveExceptions = async () => {
    if (!releasePrompt) return
    const existing = loadReleaseNotes(devKey).find(entry => entry.id === releasePrompt.noteId)
    if (!existing) {
      setReleasePrompt(null)
      return
    }

    await updateReleaseNote({
      ...existing,
      body: composeReleaseNoteBody(releasePrompt.baseBody, releasePrompt.exceptions),
      exceptions: releasePrompt.exceptions,
    })
    setReleasePrompt(null)
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
      void persistOrder(next)
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
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
        {STATUS_OPTIONS.map(s => (
          <span key={s} className={`px-2 py-0.5 rounded-full font-medium ${statusPillClass[s]}`}>
            {s}: {counts[s]}
          </span>
        ))}
        </div>
        <span className={`px-2 py-1 rounded-full font-medium ${syncMode === 'shared' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
          {syncMessage}
        </span>
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
                          onChange={e => handleStatusChange(item, e.target.value as ItemStatus)}
                          className={`text-xs font-medium rounded-full px-2.5 py-1 border-0 focus:outline-none focus:ring-2 focus:ring-cyan/50 ${statusPillClass[row.status]}`}
                        >
                          {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {row.updated && (
                          <div className="text-[10px] text-gray-400 mt-1">
                            {new Date(row.updated).toLocaleDateString()} {new Date(row.updated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {row.updatedBy ? ` · ${row.updatedBy}` : ''}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2">
                        <textarea
                          value={row.notes}
                          onFocus={() => setEditingNotesKey(item.key)}
                          onBlur={() => {
                            setEditingNotesKey(current => current === item.key ? null : current)
                            void persistRow(item.key, state[item.key] ?? row)
                          }}
                          onChange={e => updateRowDraft(item.key, { notes: e.target.value })}
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

      {releasePrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-gray-200 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
              <div className="text-sm font-semibold text-primary">Auto release note drafted</div>
              <div className="text-xs text-gray-500 mt-1">
                <strong>{releasePrompt.itemTitle}</strong> has been drafted automatically. Only add anything not done, changed, or deferred.
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="text-[11px] uppercase tracking-wide text-gray-500 font-semibold mb-2">Generated note preview</div>
                <div className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{composeReleaseNoteBody(releasePrompt.baseBody, releasePrompt.exceptions)}</div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-2">Exceptions to spec</label>
                <textarea
                  value={releasePrompt.exceptions}
                  onChange={e => setReleasePrompt(prev => prev ? { ...prev, exceptions: e.target.value } : prev)}
                  placeholder="Optional — list anything in the MD that wasn't done, was deferred, or was done differently."
                  rows={5}
                  className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan/50 resize-y"
                />
              </div>
            </div>
            <div className="px-5 py-4 border-t border-gray-100 bg-gray-50 flex items-center justify-end gap-2">
              <button onClick={() => setReleasePrompt(null)} className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-white transition">No exceptions</button>
              <button onClick={() => void saveExceptions()} className="text-sm px-3 py-2 rounded-lg bg-cyan text-white hover:bg-cyan/80 transition font-medium">Save exceptions</button>
            </div>
          </div>
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

function ProjectCard({ project, currentUser }: { project: Project; currentUser: string }) {
  const [open, setOpen] = useState(false)
  const [entries, setEntries] = useState<RunsheetEntry[]>(() => loadRunsheetEntries(project.slug))
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState('')
  const [syncMode, setSyncMode] = useState<SyncMode>(HAS_SHARED_API ? 'shared' : 'local')

  useEffect(() => {
    saveRunsheetEntries(project.slug, entries)
  }, [project.slug, entries])

  useEffect(() => {
    if (!HAS_SHARED_API || !open) return
    let cancelled = false
    const load = async () => {
      try {
        const data = await apiGet<RunsheetEntry[]>(`/api/runsheets/${project.slug}`)
        if (!cancelled) {
          setEntries(data.map(normalizeRunsheetEntry))
          setSyncMode('shared')
        }
      } catch {
        if (!cancelled) setSyncMode('local')
      }
    }
    void load()
    const interval = window.setInterval(() => { void load() }, 15000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [project.slug, open])

  const addEntry = async () => {
    if (!input.trim()) return
    const optimistic = normalizeRunsheetEntry({ id: `local-${Date.now()}`, ts: Date.now(), text: input.trim(), by: userDisplayName(currentUser) })
    setEntries(prev => [optimistic, ...prev])
    setInput('')
    if (!HAS_SHARED_API) return
    try {
      const saved = await apiSend<RunsheetEntry>(`/api/runsheets/${project.slug}/entries`, 'POST', {
        text: optimistic.text,
        createdBy: userDisplayName(currentUser),
      })
      setEntries(prev => [normalizeRunsheetEntry(saved), ...prev.filter(entry => entry.id !== optimistic.id)])
      setSyncMode('shared')
    } catch {
      setSyncMode('local')
    }
  }

  const deleteEntry = async (entry: RunsheetEntry) => {
    setEntries(prev => prev.filter(e => e.id !== entry.id))
    if (!HAS_SHARED_API || entry.id.startsWith('local-')) return
    try {
      await apiSend(`/api/runsheets/${project.slug}/entries/${entry.id}`, 'DELETE')
      setSyncMode('shared')
    } catch {
      setSyncMode('local')
    }
  }

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
          <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg ${syncMode === 'shared' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
            {syncMode === 'shared' ? '☁️ Shared runsheet' : '💾 Local runsheet'}
          </span>
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
                <div key={e.id} className="flex items-start gap-2 text-sm bg-white rounded-lg p-2 border border-gray-100">
                  <span className="text-xs text-gray-400 whitespace-nowrap mt-0.5">{new Date(e.ts).toLocaleDateString()} {new Date(e.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  <span className="flex-1 text-gray-700">{e.text}</span>
                  <span className="text-[10px] text-gray-400 mt-0.5 whitespace-nowrap">{e.by || 'Unknown'}</span>
                  <button onClick={() => deleteEntry(e)} className="text-gray-300 hover:text-red-400 text-xs">✕</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function ReleaseNotesPanel({ dev, currentUser }: { dev: Dev; currentUser: string }) {
  const [entries, setEntries] = useState<ReleaseNoteEntry[]>(() => loadReleaseNotes(dev.key))
  const [syncMode, setSyncMode] = useState<SyncMode>(HAS_SHARED_API ? 'shared' : 'local')
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingBody, setEditingBody] = useState('')

  useEffect(() => {
    setEntries(loadReleaseNotes(dev.key))
  }, [dev.key])

  useEffect(() => {
    saveReleaseNotes(dev.key, entries)
  }, [dev.key, entries])

  useEffect(() => {
    const onUpdated = (event: Event) => {
      const detail = (event as CustomEvent<{ devKey?: string }>).detail
      if (detail?.devKey === dev.key) {
        setEntries(loadReleaseNotes(dev.key))
      }
    }
    window.addEventListener(RELEASE_NOTES_EVENT, onUpdated)
    return () => window.removeEventListener(RELEASE_NOTES_EVENT, onUpdated)
  }, [dev.key])

  useEffect(() => {
    if (!HAS_SHARED_API) return
    let cancelled = false
    const load = async () => {
      try {
        const data = await apiGet<ReleaseNoteEntry[]>(`/api/release-notes/${dev.key}`)
        if (!cancelled) {
          setEntries(data.map(normalizeReleaseNoteEntry))
          setSyncMode('shared')
        }
      } catch {
        if (!cancelled) setSyncMode('local')
      }
    }
    void load()
    const interval = window.setInterval(() => { void load() }, 15000)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [dev.key])

  const deleteEntry = async (entry: ReleaseNoteEntry) => {
    setEntries(prev => prev.filter(item => item.id !== entry.id))
    deleteReleaseNoteLocally(dev.key, entry.id)
    if (!HAS_SHARED_API || entry.id.startsWith('local-')) return
    try {
      await apiSend(`/api/release-notes/${dev.key}/entries/${entry.id}`, 'DELETE')
      setSyncMode('shared')
    } catch {
      setSyncMode('local')
    }
  }

  const regenerateEntry = async (entry: ReleaseNoteEntry) => {
    const item = dev.forwardWorkItems.find(candidate => candidate.key === entry.sourceItemKey || autoReleaseTitle(candidate) === entry.title)
    if (!item) return

    const markdown = await fetchSourceDoc(item.url)
    const generated = buildAutoReleaseNote(item, markdown)
    const regeneratedBody = composeReleaseNoteBody(generated.baseBody, entry.exceptions || '')

    const updated = normalizeReleaseNoteEntry({
      ...entry,
      title: tenantReleaseTitle(item),
      body: regeneratedBody,
      exceptions: entry.exceptions || '',
      sourceItemKey: item.key,
      sourceUrl: item.url || null,
      autoGenerated: true,
    })

    upsertReleaseNoteLocally(dev.key, updated)
    setEntries(loadReleaseNotes(dev.key))

    if (!HAS_SHARED_API || entry.id.startsWith('local-')) return
    try {
      const saved = await apiSend<ReleaseNoteEntry>(`/api/release-notes/${dev.key}/entries/${entry.id}`, 'PATCH', {
        title: updated.title,
        body: updated.body,
        exceptions: updated.exceptions,
        updatedBy: userDisplayName(currentUser),
      })
      upsertReleaseNoteLocally(dev.key, normalizeReleaseNoteEntry(saved))
      setEntries(loadReleaseNotes(dev.key))
      setSyncMode('shared')
    } catch {
      setSyncMode('local')
    }
  }

  const startEdit = (entry: ReleaseNoteEntry) => {
    setEditingEntryId(entry.id)
    setEditingTitle(entry.title)
    setEditingBody(entry.body)
  }

  const cancelEdit = () => {
    setEditingEntryId(null)
    setEditingTitle('')
    setEditingBody('')
  }

  const saveEdit = async (entry: ReleaseNoteEntry) => {
    const title = editingTitle.trim()
    const body = editingBody.trim()
    if (!title || !body) return

    const updated = normalizeReleaseNoteEntry({
      ...entry,
      title,
      body,
      exceptions: splitReleaseNoteBody(body).exceptions,
    })

    upsertReleaseNoteLocally(dev.key, updated)
    setEntries(loadReleaseNotes(dev.key))
    cancelEdit()

    if (!HAS_SHARED_API || entry.id.startsWith('local-')) return
    try {
      const saved = await apiSend<ReleaseNoteEntry>(`/api/release-notes/${dev.key}/entries/${entry.id}`, 'PATCH', {
        title,
        body,
        exceptions: splitReleaseNoteBody(body).exceptions,
        updatedBy: userDisplayName(currentUser),
      })
      const normalized = normalizeReleaseNoteEntry(saved)
      upsertReleaseNoteLocally(dev.key, normalized)
      setEntries(loadReleaseNotes(dev.key))
      setSyncMode('shared')
    } catch {
      setSyncMode('local')
    }
  }

  return (
    <section>
      <div className="flex items-center justify-between gap-3 mb-3 mt-2">
        <div className="flex items-center gap-2">
          <span className="text-base">📝</span>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">Release notes</h2>
          <span className="text-xs text-gray-400">({entries.length})</span>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg ${syncMode === 'shared' ? 'bg-green-50 text-green-700' : 'bg-amber-50 text-amber-700'}`}>
          {syncMode === 'shared' ? '☁️ Shared notes' : '💾 Local notes'}
        </span>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
          Release notes are auto-generated when a forward-work item is marked <strong>Done</strong>. Developers only need to note any exceptions to spec.
        </div>
        {entries.length === 0 ? (
          <div className="p-5 text-sm text-gray-400">No release notes yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {entries.map(entry => (
              <div key={entry.id} className="p-4">
                {editingEntryId === entry.id ? (
                  <div className="space-y-3">
                    <input
                      value={editingTitle}
                      onChange={e => setEditingTitle(e.target.value)}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan/50"
                    />
                    <textarea
                      value={editingBody}
                      onChange={e => setEditingBody(e.target.value)}
                      rows={8}
                      className="w-full text-sm px-3 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-cyan/50 resize-y"
                    />
                    <div className="flex justify-end gap-2">
                      <button onClick={cancelEdit} className="text-sm px-3 py-1.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition">Cancel</button>
                      <button onClick={() => void saveEdit(entry)} className="text-sm px-3 py-1.5 rounded-lg bg-cyan text-white hover:bg-cyan/80 transition font-medium">Save</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="font-medium text-primary flex items-center gap-2 flex-wrap">
                          <span>{entry.title}</span>
                          {entry.autoGenerated && <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan/10 text-cyan font-semibold uppercase tracking-wide">Auto</span>}
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(entry.ts).toLocaleDateString()} {new Date(entry.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          {entry.by ? ` · ${entry.by}` : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => startEdit(entry)} className="text-xs text-cyan hover:text-cyan/80 font-medium">Edit</button>
                        {entry.autoGenerated && (
                          <button onClick={() => void regenerateEntry(entry)} className="text-xs text-purple-600 hover:text-purple-500 font-medium">Regenerate</button>
                        )}
                        <button onClick={() => void deleteEntry(entry)} className="text-xs text-red-500 hover:text-red-400 font-medium">Delete</button>
                      </div>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap mt-2 leading-relaxed">{entry.body}</div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
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
  const [editorName, setEditorName] = useState(() => localStorage.getItem('dash-user-name') || 'Steve')

  const switchTab = (t: Tab) => { setTab(t); localStorage.setItem('dash-tab', t) }

  useEffect(() => {
    localStorage.setItem('dash-user-name', editorName)
  }, [editorName])

  const activeDev = devs.find(d => d.key === tab)
  const tabProjects = projects.filter(p => p.owner === tab)

  return (
    <div className="min-h-screen bg-light-grey" data-build={BUILD_ID}>
      <header className="bg-primary text-white px-6 py-4 shadow-lg">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-bold">⚡ DFRNT Project Dash</h1>
            <p className="text-xs text-white/70 mt-1">{HAS_SHARED_API ? 'Shared Railway sync enabled' : 'Local browser mode — add VITE_PROJECT_DASH_API_URL for multi-user sync'}</p>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <span className="text-white/80">Editing as</span>
            <input
              value={editorName}
              onChange={e => setEditorName(e.target.value)}
              className="px-3 py-1.5 rounded-lg text-primary bg-white border border-white/20 min-w-40"
              placeholder="Your name"
            />
          </label>
        </div>
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
                <ForwardWorkTable dev={activeDev} currentUser={editorName} />
              </div>
            </section>
            <ReleaseNotesPanel dev={activeDev} currentUser={editorName} />
            <section>
              <SectionHeading icon="📦" title="Projects" count={tabProjects.length} />
              {tabProjects.length === 0 ? (
                <div className="bg-white rounded-xl border border-gray-200 p-5 text-sm text-gray-500">
                  No projects attributed to {activeDev.name} yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {tabProjects.map(p => <ProjectCard key={p.slug} project={p} currentUser={editorName} />)}
                </div>
              )}
            </section>
          </>
        ) : (
          <section>
            <SectionHeading icon="🧭" title="Strategy & analysis projects" count={tabProjects.length} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {tabProjects.map(p => <ProjectCard key={p.slug} project={p} currentUser={editorName} />)}
            </div>
          </section>
        )}
      </main>
    </div>
  )
}
