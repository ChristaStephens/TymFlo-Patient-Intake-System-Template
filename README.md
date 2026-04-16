# TymFlo Patient Intake System — Template

  A privacy-first, browser-only patient intake form for healthcare practices, built with React + Vite.

  ## Features

  - 7-step sequential accordion form with progress bar
  - Draw or type electronic signature with auto-captured timestamp  
  - PDF download via browser print
  - EHR CSV export (`patient-intake-{lastname}-{firstname}.csv`)
  - Session & device save controls (all client-side, no server)
  - Required field validation
  - Privacy notice banner
  - 35-condition medical history checklists (past & family)
  - Legal pages: Terms of Use, Privacy Notice
  - TymFlo branding

  ## Privacy

  No patient data is ever sent to any server. All form data stays entirely within the patient's browser.

  ## Configuration

  Edit `artifacts/intake-form/src/lib/config.ts` and set `PRACTICE_NAME` to customize for each licensed practice.

  ## Contact

  hello@tymflo.com · 313-217-1082

  ---

  *Licensed by TymFlo. May not be copied or reused without authorization.*
  