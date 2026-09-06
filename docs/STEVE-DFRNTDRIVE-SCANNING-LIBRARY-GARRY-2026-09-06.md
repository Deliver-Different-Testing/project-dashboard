# DFRNT Drive scanning library — ready to wire in (2026-09-06)

## TL;DR

A self-owned scanning library that replaces the **Scanbot SDK** (~US$30k/year) is
built, unit-tested and pushed to GitHub. It's ready for you to pull into the DFRNT
Drive MAUI app and start the field trial.

**Repo:** https://github.com/Deliver-Different-Testing/dfrntdrive_scanning (branch `main`)

## Why we did this

Scanbot costs ~US$30k/year (last invoice NZ$56,469 for the Dec 2025–Nov 2026 term).
The four things we use it for now have free, native replacements:

| Scanbot feature | Native replacement |
|---|---|
| Barcode / QR (labels, locations) | Google ML Kit (Android) / Apple Vision (iOS) |
| PDF document scanning | ML Kit Document Scanner / VisionKit |
| Matrix Scan (side-of-pallet multi-scan) | our `PalletVerifier` (sweep + accumulate) |
| Single-code / aim selection | ML Kit / Vision `AimMode` + our `AimSelector` |

Camera + decode come from the open-source
[`BarcodeScanning.Native.Maui`](https://github.com/afriscic/BarcodeScanning.Native.Maui)
package (MIT). Everything else is ours, in the repo.

## What's in the repo

| Project | What it is | Builds where |
|---|---|---|
| `src/DfrntDrive.Scanning.Core` | Platform-neutral contracts + logic (scan session, pallet verifier, telemetry). No MAUI. | anywhere |
| `src/DfrntDrive.Scanning.Maui` | `ScannerView` control (Single/Continuous/Pallet) + Android/iOS document scanners | MAUI + platform SDKs |
| `tests/DfrntDrive.Scanning.Core.Tests` | 26 unit tests over the logic — all passing | anywhere |
| `docs/` | Integration guide, Scanbot call-site migration map, field-trial plan | — |

The split is deliberate: everything that has to be *correct* (duplicate suppression,
pallet matching, value normalisation) is in `Core` and unit-tested with no device needed.

## The Matrix Scan replacement — please read

The native engines return every barcode in a frame but don't track them across frames
the way Scanbot's overlay does. So the pallet check works differently:

> The driver **sweeps** the camera across the pallet face for a few seconds. Every code
> seen is accumulated into a set and matched against the job's expected barcodes. The
> screen shows **matched / missing / unexpected**.

A code must be seen in ≥2 frames before it counts, so a single misread of a neighbouring
carton is discarded. This is the one feature that behaves differently from Scanbot, and
it's the explicit **go/no-go** item in the field trial. (Same limitation as Scanbot: a
side scan only sees outward-facing cartons.)

## How to wire it in

1. Add a project/package reference to `DfrntDrive.Scanning.Maui`.
2. In `MauiProgram.cs`, replace the Scanbot init with `builder.UseDfrntScanning();`
3. Add camera permissions (see `docs/INTEGRATION.md` in the scanning repo).
4. Swap the Scanbot scanner screens for `ScannerView`. `docs/SCANBOT-MIGRATION.md` is a
   call-site checklist — the middle column ("where it's called in DFRNT Drive") is left
   blank for you to fill from the app, since I don't have the app repo yet (see below).

The contract to the rest of the app doesn't change: you still get a decoded string + a
symbology and write them to `JobBarcode`. The configurator's `barcodeScan` flag and the
DB schema are untouched. This is a swap of the on-device engine only.

## What's verified and what isn't

- ✅ **Core logic** compiles and all 26 unit tests pass.
- ✅ **MAUI project** restores its NuGet deps cleanly (BarcodeScanning.Native.Maui 3.1.0,
  ML Kit Doc Scanner, MAUI Controls pinned to 10.0.20).
- ⚠️ **Android + iOS device heads have NOT been compiled yet.** The build environment
  couldn't download the Android SDK, and iOS needs macOS. The platform files
  (`Platforms/Android/*`, `Platforms/iOS/*`) were written from the binding type names and
  Apple/Google docs, so **expect to fix a few API-name details on the first device build.**
  A GitHub Actions workflow (`.github/workflows/build.yml`) will compile both heads on
  push — that CI run is the quickest way to surface anything that needs adjusting.

## Two things I need from you

1. **The DFRNT Drive app repo.** I couldn't reach it — it's on GitLab (`git.customd.com`,
   blocked from my environment) or Azure DevOps (`UrgentCouriersDevOps`, the token had
   expired). If you **mirror it to GitHub** under `Deliver-Different-Testing` (like you do
   for `dfrntdrive_configurator`), I can map the exact Scanbot call sites and do the wiring
   myself. Otherwise a fresh read-only token works too.
2. **The Scanbot notice deadline.** The licence term ends **30 Nov 2026**. The order form
   should say the notice window (30/60/90 days). We want the field trial done before that
   date, so it's worth pinning down now.

## Field trial before we switch

`docs/FIELD-TRIAL.md` (in the scanning repo) has the plan. Run the native build alongside
Scanbot for ~2 weeks with a few drivers + the sort team, scan the **same** parcels/pallets
with both, and compare. The library emits per-scan telemetry (time-to-first-scan,
frames-to-decode, pallet catch rate) that dumps to CSV. Switch each feature only when
native meets the bar; pallet catch rate is the go/no-go number.

## Also worth doing (security)

A few credentials surfaced during this work that should be rotated regardless: an expired
Azure DevOps token that was posted in Slack, the tokens in the "Repo Details for AI Agent"
Google Doc, and the production DB keys that were emailed to a shared inbox.

---
*Prepared by Steve's AI assistant. Questions → Steve.*
