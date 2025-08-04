export class Afip {
  constructor(page) {
    this.page = page;
    this.invoicePage = null;
  }
  async login() {
    console.log("[login] Starting login process");
    try {
      const { page } = this;
      await page.fill("input[id='F1:username']", process.env.USER_CUIT);
      await page.click("input[id='F1:btnSiguiente']");
      await page.waitForTimeout(2000);
      await page.fill("input[id='F1:password']", process.env.AFIP_PASSWORD);
      await page.click("input[id='F1:btnIngresar']");
    } catch (error) {
      console.log("[login] Error:", error);
      throw error;
    }
  }

  async issueInvoice() {
    console.log("[issueInvoice] Starting invoice issuing process");
    try {
      const { page } = this;
      const [newPage] = await Promise.all([
        page.context().waitForEvent("page"),
        page.click('button:has-text("Emitir Factura")'),
      ]);
      this.invoicePage = newPage;
      await this.invoicePage.waitForLoadState("domcontentloaded");
      await this.invoicePage.waitForLoadState("load");
      await this.invoicePage.waitForLoadState("networkidle");
      await newPage.waitForTimeout(2000);
    } catch (error) {
      console.log("[issueInvoice] Error:", error);
      throw error;
    }
  }

  async chooseCompany() {
    console.log("[chooseCompany] Selecting company");
    try {
      const inputs = await this.invoicePage.$$("input");
      for (const input of inputs) {
        const value = await input.getAttribute("value");
        if (value?.includes("GOMEZ")) {
          await input.click();
          break;
        }
      }
    } catch (error) {
      console.log("[chooseCompany] Error:", error);
      throw error;
    }
  }

  async generateReceipt() {
    console.log("[generateReceipt] Generating receipt");
    try {
      await this.invoicePage.click("a#btn_gen_cmp");
    } catch (error) {
      console.log("[generateReceipt] Error:", error);
      throw error;
    }
  }

  async setSellingPoint(point) {
    console.log("[setSellingPoint] Setting selling point", point);
    try {
      await this.invoicePage.selectOption("#puntodeventa", "1");
      await this.invoicePage.selectOption("#universocomprobante", "2");
      await this.invoicePage.click("input[value='Continuar >']");
    } catch (error) {
      console.log("[setSellingPoint] Error:", error);
      throw error;
    }
  }

  async fillInvoiceDetailsPart1() {
    console.log("[fillInvoiceDetailsPart1] Filling invoice details part 1");
    try {
      await this.invoicePage.selectOption("#idconcepto", "2");
      const today = new Date();
      const formattedDate = today
        .toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "/");
      await this.invoicePage.fill("input[id='fsd']", formattedDate);
      const lastDayOfMonth = new Date(
        today.getFullYear(),
        today.getMonth(),
        28
      );
      const formattedLastDay = lastDayOfMonth
        .toLocaleDateString("es-AR", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
        })
        .replace(/\//g, "/");
      await this.invoicePage.fill("input[id='fsh']", formattedLastDay);
      await this.invoicePage.fill(
        "input[id='vencimientopago']",
        formattedLastDay
      );
      await this.invoicePage.waitForTimeout(1000);
      await this.invoicePage.click("input[value='Continuar >']");
    } catch (error) {
      console.log("[fillInvoiceDetailsPart1] Error:", error);
      throw error;
    }
  }

  async fillInvoiceDetailsPart2() {
    console.log("[fillInvoiceDetailsPart2] Filling invoice details part 2");
    try {
      await this.invoicePage.selectOption("#idivareceptor", "1");
      await this.invoicePage.fill(
        "input[id='nrodocreceptor']",
        process.env.COMPANY_CUIT
      );
      await this.invoicePage.click("input[id='formadepago1']");
      await this.invoicePage.waitForTimeout(1000);
      await this.invoicePage.click("input[value='Continuar >']");
    } catch (error) {
      console.log("[fillInvoiceDetailsPart2] Error:", error);
      throw error;
    }
  }

  async fillInvoiceDetailsPart3() {
    console.log("[fillInvoiceDetailsPart3] Filling invoice details part 3");
    try {
      await this.invoicePage.fill('input[name="detalleCodigoArticulo"]', "1");
      await this.invoicePage.fill(
        'textarea[name="detalleDescripcion"]',
        "Honorarios Profesionales"
      );
      await this.invoicePage.fill("#detalle_cantidad1", "1");
      const data = await fetch(process.env.DOLAR_API_URL);
      const dolar = await data.json();
      console.log("🚀 ~ dolar:", dolar);
      await this.invoicePage.fill(
        "#detalle_precio1",
        `${dolar?.blue?.value_avg * 2000}`
      );
      await this.invoicePage.click("input[value='Continuar >']");
    } catch (error) {
      console.log("[fillInvoiceDetailsPart3] Error:", error);
      throw error;
    }
  }

  async confirmInvoice() {
    console.log("[confirmInvoice] Confirming invoice");
    // Check if "input[value='Confirmar Datos...']" is on the page
    const confirmButton = await this.invoicePage.$(
      "input[value='Confirmar Datos...']"
    );
    while (confirmButton) {
      try {
        await confirmButton.click(); // FIX: removed selector argument
        this.invoicePage.once("dialog", async (dialog) => {
          await dialog.accept();
        });
      } catch (error) {
        break; // Exit the loop if an error occurs
      }
    }
  }

  async download() {
    console.log("[download] Downloading invoice");
    try {
      await this.invoicePage.click("input[value='Imprimir...']");
      this.invoicePage.once("dialog", async (dialog) => {
        await dialog.accept();
      });
    } catch (error) {
      console.log("[download] Error:", error);
      alert("Error al descargar la factura");
    }
  }
}
