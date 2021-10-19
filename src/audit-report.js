const fs = require("fs");
const OpenIcon = require("./assets/icons/open-icon");

const AuditReport = {
  getHtmlTemplate() {
    let htmlContent = "";
    try {
      htmlContent = fs.readFileSync(
        `${__dirname}/templates/report.html`,
        "utf-8"
      );
    } catch (error) {
      console.error(error);
    }

    return htmlContent;
  },

  generateFailedAuditMarkup({ failedAudits, reportLocation }) {
    let markup = "";

    if (failedAudits.length > 0) {
      markup += "<ul>";
      for (const audit of failedAudits) {
        markup += `<li title="${audit.title}">${audit.id}</li>`;
      }
      markup += "</ul>";
    }

    return markup;
  },

  generateScoreMarkup(score) {
    let size = 120;
    let strokeWidth = 8;
    let radius = (size - strokeWidth) / 2;
    let circumference = radius * 2 * Math.PI;

    let scoreMarkup = `
      <svg class="gauge" viewBox="0 0 ${size} ${size}">
        <circle class="gauge-base" r="${radius}" cx="${size / 2}" cy="${
      size / 2
    }" stroke-width="${strokeWidth}"></circle> 
        <circle class="gauge-arc" r="${radius}" cx="${size / 2}" cy="${
      size / 2
    }" stroke-width="${strokeWidth}" style="transform: rotate(-87.9537deg); stroke-dasharray: ${
      circumference * score * 0.01
    }, ${circumference};"></circle>
      </svg>
      <span class="score-text">${score}</span></td>
    `;
    return scoreMarkup;
  },

  generateBodyContent(baseUrl, reports) {
    let htmlContent = this.getHtmlTemplate();

    htmlContent = htmlContent.replace(
      "{{reportTitle}}",
      `Accessibility Report for ${baseUrl}`
    );

    //html content for audits
    let reportsTableHtml = `
    <section>
      <table>
        <thead>
          <tr>
            <th>Report Url</th>
            <th></th>
            <th></th>
            <th>Score</th>
            <th>Items to check</th>
          </tr>
        </thead>
        <tbody>`;

    for (const report of reports) {
      let scoreRating =
        report.score > 90 ? "pass" : report.score > 50 ? "average" : "fail";

      reportsTableHtml += `
          <tr>
            <td>${report.url}</td>
            <td><a class="reportLink" href="${
              report.reportLocation
            }">View</a></td>
            <td><a href="${report.reportLocation}" target="_blank">
              Open ${OpenIcon.text}
            </a></td>
            <td class="score ${scoreRating}">
              ${this.generateScoreMarkup(report.score)}
            </td>
            <td>${this.generateFailedAuditMarkup(report)}</td>
          </tr>`;
    }

    reportsTableHtml += `
        </tbody>
      </table>
    </section>
    <iframe title="Report View" id="reportframe" src="">
    </iframe>`;

    htmlContent = htmlContent.replace("{{reportContent}}", reportsTableHtml);

    return htmlContent;
  },

  saveAudit({ saveDir, baseUrl, reports }) {
    // console.log(audits);
    let htmlContent = this.generateBodyContent(baseUrl, reports);
    try {
      //check for directory
      if (fs.existsSync(saveDir)) {
        //save report
        fs.writeFileSync(`${saveDir}/report-index.html`, htmlContent);
      } else {
        console.error(`Save location ${saveDir} does not exist!`);
      }
      return true;
    } catch (error) {
      console.error(error);
      return false;
    }
  },
};

module.exports = AuditReport;
