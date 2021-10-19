#!/usr/bin/env node

const fs = require("fs");
const os = require("os");
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const chalk = require("chalk");
const csv = require("csv-parser");
const inquirer = require("inquirer");
const dayjs = require("dayjs");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const { resolve } = require("path");
const ora = require("ora");
const boxen = require("boxen");

const AuditReport = require("./src/audit-report");

const defaultSavePath = `${os.homedir()}/Accessibility Reports`;

async function parseCsvFile(file) {
  let urls = [];
  const readStream = fs.createReadStream(file).pipe(csv(["url"]));
  for await (const data of readStream) {
    urls.push(data.url.replace(/\s/gi, "")); //strip whitespace at the same time
  }
  return urls;
}

async function runAudit() {
  //setup yargs
  const argv = yargs(hideBin(process.argv))
    .alias("v", "version")
    .alias("f", "file")
    .nargs("f", 1)
    .describe("f", "Load a file")
    .demandOption(["f"])
    .help("h")
    .alias("h", "help").argv;

  const answers = await inquirer.prompt([
    {
      name: "saveLocation",
      type: "input",
      message: "Where would you like to save your results?",
      default: defaultSavePath,
      validate: (answer) => !!answer,
    },
  ]);

  let urls = await parseCsvFile(argv.file);

  let auditDetails = {
    baseUrl: null,
    saveDir: null,
    reports: [],
  };

  //get base url for folder name
  let baseUrl = urls[0].replace(/^(http|https):\/\//i, "").split("/")[0];
  auditDetails.baseUrl = baseUrl;
  //set start time for baseUrl
  let startTime = dayjs().format("YYYY_MM_DD_HH_mm_ss");
  //generate save directory
  let dir = `${defaultSavePath}/${baseUrl}/${startTime}`;
  auditDetails.saveDir = dir;

  if (urls.length > 0) {
    console.log("\n");
    for (const url of urls) {
      let details = {
        url: url,
        reportLocation: null,
        score: null,
        failedAudits: null,
      };
      //generate report name
      let reportName = url.replace(/^(http|https):\/\//i, ""); //remove http(s)
      reportName = reportName.replace(/\/$/i, ""); //remove trailing slash
      if (reportName !== baseUrl) {
        reportName = reportName.replace(`${baseUrl}/`, ""); //remove base url
      }
      reportName = reportName.replace(/\//gi, "--"); //encode remaining slashes

      const spinner = ora({
        text: `Report for ${url}\t${chalk.bold("RUNNING")}`,
        color: "magenta",
        spinner: "arc",
      });
      spinner.start();

      const { result, reportLocation } = await auditUrl(
        url,
        dir,
        baseUrl,
        reportName
      );

      let score = result.lhr.categories.accessibility.score
        ? result.lhr.categories.accessibility.score * 100
        : "n/a";
      let styledScore = chalk.bold(`Score: ${score}`);
      if (score >= 90) {
        styledScore = chalk.green.bold(`Score: ${score}`);
      } else if (score >= 50) {
        styledScore = chalk.yellow.bold(`Score: ${score}`);
      } else {
        styledScore = chalk.red.bold(`Score: ${score}`);
      }
      spinner.succeed(`Report for ${url}\t${styledScore} `);

      //get failed audit items
      let audits = Object.values(result.lhr.audits);
      details.failedAudits = audits.filter((audit) => audit.score === 0);

      details.reportLocation = reportLocation;
      details.score = score;
      auditDetails.reports.push(details);
    }

    const savedAudit = AuditReport.saveAudit(auditDetails);

    if (savedAudit) {
      let reportIndexLocation = `${auditDetails.saveDir}/report-index.html`;
      console.log("\n");
      console.log(
        boxen(`${chalk.bold.green("AUDIT COMPLETE!")}`, {
          padding: 1,
          margin: 0,
          borderColor: "green",
        })
      );
      console.log(
        `\nYou can view your report at:\n ${chalk.underline.blue(
          reportIndexLocation
        )}\n`
      );
    } else {
      console.error("Audit details not saved!!!");
    }
  } else {
    console.log(chalk.red.bold("No URLs passed to audit tool!"));
  }
}

async function auditUrl(url, dir, baseUrl, reportName) {
  let response = {};
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  const options = {
    logLevel: "silent", //options are 'silent','info','verbose'
    output: "html",
    onlyCategories: ["accessibility"],
    port: chrome.port,
  };
  const runnerResult = await lighthouse(url, options);

  // `.report` is the HTML report as a string
  const reportHtml = runnerResult.report;

  //check for directory (use reports so recursive covers all folders)
  if (!fs.existsSync(`${dir}/reports`)) {
    fs.mkdirSync(`${dir}/reports`, { recursive: true });
  }
  //save report
  let reportLocation = `${dir}/reports/${reportName}.html`;
  fs.writeFileSync(reportLocation, reportHtml);

  await chrome.kill();

  response.result = runnerResult;
  response.reportLocation = reportLocation;

  return response;
}

runAudit();
