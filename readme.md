# Accessibility Auditor

A simple tool that accepts a CSV file containing URLs and runs a Lighthouse accessibility audit on all of them. The resulting reports are saved to a folder and a parent report summary and viewer is generated.

## Quick Start
1. Clone
2. Install (just install from directory for now until it's in a package manager)
3. check install `a11yaudit -h`
4. run `a11yaudit -f="<<Path to CSV file>>"` (Read about the format of the CSV file...)
5. Choose your save location (defaults to `~/Accessibility Reports`)
6. The report will run for each URL and output a report (the link will display in the CLI at the end of the run)

## Report Index
The Report Index file gives a summary list of all of the Reports in the Audit, their overall Score, and an overview of any failed Audits. These can be viewed within the Page or in a new tab.

## CSV File
The CSV file should be single column, no header, with each URL on a new line.
```URL One \n URL Two \n  URL Three```

## Report Directory Structure
Reports are saved to the chosen Directory, with the following structure:
|- Accessibility Reports
  |- <<domain of first URL in CSV>>
    |- <<YYYY_MM_DD_HH_mm_ss>>





