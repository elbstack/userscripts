// ==UserScript==
// @name         Enhance toggl
// @namespace    http://elbstack.com/
// @version      0.1
// @description  Enhances toggl with additional displayed info!
// @author       Dominic Melius
// @match        https://toggl.com/app/reports/*
// @grant        none
// ==/UserScript==

function enhanceToggl() {
  const time = 1000;
  const avgNodeXpath = "//span[contains(text(), 'Avg. hourly rate')]"
  const billableXpath = "//span[contains(text(), 'Billable hours')]";
  const amountXpath = "//span[contains(text(),'Amount')]";

  const billableNode = document.evaluate(
    billableXpath,
    document,
    null,
    XPathResult.FIRST_ORDERED_NODE_TYPE,
    null
  ).singleNodeValue;

  if (billableNode !== null) {
  	const avgNode = document.evaluate(avgNodeXpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;

  	if (avgNode !== null) {
    	return;
  	}

    const nodes = [];
    let node;
    const nodeList = document.evaluate(
      amountXpath,
      document,
      null,
      XPathResult.ORDERED_NODE_ITERATOR_TYPE,
      null
    );
    while ((node = nodeList.iterateNext())) {
      nodes.push(node);
    }

    const amountTitleNode = nodes[1];

    const amountNode = amountTitleNode.parentElement.parentElement;
    const amountText =
      amountNode.childNodes[1].childNodes[0].childNodes[0].innerText;
    const amountValue = Number(amountText.replace(",", ""));

    const container = amountNode.parentElement;
    const avgHourlyRateNode = amountNode.cloneNode(true);

    const billableHoursNode = container.childNodes[1];
    const billableHoursText = billableHoursNode.childNodes[1].innerText;
    const billableValues = billableHoursText.split(":");
    const hours = Number(billableValues[0]);
    let minutes = Number(billableValues[1]);
    let seconds = Number(billableValues[2]);

    if (minutes > 0) minutes = minutes / 60;
    if (seconds > 0) seconds = seconds / 60 / 60;

    const totalHoursValue = hours + minutes + seconds;
    const avgHourlyRateValue = amountValue / totalHoursValue;

    avgHourlyRateNode.childNodes[0].childNodes[0].innerText =
      "Avg. hourly rate";
    avgHourlyRateNode.childNodes[1].childNodes[0].childNodes[0].innerText = avgHourlyRateValue.toFixed(
      2
    );

    container.insertBefore(avgHourlyRateNode, amountNode);
  } else {
    setTimeout(function() {
      enhanceToggl();
    }, time);
  }
}

(function() {
  "use strict";
  setInterval(function() {
    if (
      this.lastPathStr !== location.pathname ||
      this.lastQueryStr !== location.search ||
      this.lastPathStr === null ||
      this.lastQueryStr === null
    ) {
      this.lastPathStr = location.pathname;
      this.lastQueryStr = location.search;
      enhanceToggl();
    }
  }, 500);
})();
