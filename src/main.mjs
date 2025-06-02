import { chromium } from "playwright";
import "dotenv/config";
import { Afip } from "./afip.service.mjs";
import { FileService } from "./file.service.mjs";
import { sendMail } from "./mail.service.mjs";

const browser = await chromium.launch({
  headless: false, // Set to true if you want to run in headless mode
  executablePath:
    "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});
const page = await browser.newPage();

await page.goto(
  "https://auth.afip.gov.ar/contribuyente_/login.xhtml?action=SYSTEM&system=admin_mono"
);

const afip = new Afip(page);
await afip.login();

await page.waitForTimeout(2000);

await afip.issueInvoice();

await afip.chooseCompany();

await afip.generateReceipt();
await afip.setSellingPoint();

await afip.fillInvoiceDetailsPart1();
await afip.fillInvoiceDetailsPart2();
await afip.fillInvoiceDetailsPart3();

await afip.confirmInvoice();

// Get and move the invoice file
const fileService = new FileService();
const downloadsPath = `${process.env.HOME}/Downloads`;
const destFolder = `${process.cwd()}/src/invoices`;

const lastModifiedFile = await fileService.getLastModifiedFileByPrefix(
  downloadsPath,
  USER_CUIT
);
const originFilePath = `${downloadsPath}/${lastModifiedFile}`;
await fileService.moveFile({
  originFilePath,
  destinationFolderPath: destFolder,
});

const invoiceFilePath = `${destFolder}/${lastModifiedFile}`;

await sendMail({
  from: process.env.FROM,
  to: process.env.TO,
  subject: "Nueva factura",
  text: "Adjunto la factura.",
  attachments: [
    {
      filename: lastModifiedFile,
      path: invoiceFilePath,
    },
  ],
});
