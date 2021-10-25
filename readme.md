# Accessibility Auditor

A simple tool that accepts a CSV file containing URLs and runs a Lighthouse accessibility audit on all of them. The resulting reports are saved to a folder and a parent report summary and viewer is generated.

## Quick Start
1. Clone the repo to the folder of your choice ``` git clone git@github.com:cs-ferguson/a11y-auditor.git <<folder name>>```
2. Install the package; currently it isn't hosted in a package manager, so you can do this by installing it from the directory you pulled the code down to... ```npm install -g <<directory here>>```
3. Check the package installed by running `a11yaudit -h` in your terminal.
4. Create a CSV file containing the list of URLs you wish to audit (Read about the format of the CSV file [here](#csv-file).
4. Start the Audit by running `a11yaudit -f="<<Path to CSV file>>"` 
5. Choose your save location (defaults to `~/Accessibility Reports`).
6. The auditor will run for each URL and output a single [Report Index](#report-index) file (a link to this file will display in the CLI at the end of the run).

## Report Index
The Report Index file gives a summary list of all of the Reports in the Audit, their overall Score, and an overview of any failed Audits. These can be viewed within the Page or in a new tab.

## CSV File
The CSV file should be single column, no header, with each URL on a new line.

Example:

```
URL One
URL Two
URL Three
```

Note: The auditor will automatically remove any white space in the URLs.

## Report Directory Structure
Reports are saved to the chosen Directory, with the following structure:
```
|- Accessibility Reports
  |- <<domain of first URL in CSV>>
    |- <<YYYY_MM_DD_HH_mm_ss>>
```





