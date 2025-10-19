const path = require("path");
const fs = require("fs");
const yaml = require("js-yaml");
const { GoogleGenAI, createUserContent, createPartFromUri } = require("@google/genai");

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
function enforceSchema(parsed) {
  const schema = {
    vendor: { name: null, address: null, taxNumber: null, phone: null },
    invoice: { number: null, date: null, type: null },
    items: [],
    totalInvoiceValue: null,
    gstValue: null,
    payment_info: {
      subtotal: null,
      tax_percentage: null,
      vat_percentage: null,
      sales_tax_percentage: null,
      shipping_handling_cost: null,
      total: null,
    },
    errors: [],
  };

  const result = { ...schema };

  if (parsed.vendor) {
    result.vendor = { ...schema.vendor, ...parsed.vendor };
  }

  if (parsed.invoice) {
    result.invoice = { ...schema.invoice, ...parsed.invoice };
  }

  if (Array.isArray(parsed.items)) {
    result.items = parsed.items.map((item) => ({
      name: item.name ?? null,
      quantity: item.quantity ?? null,
      hsn_sac: item.hsn_sac ?? null,
      rate: item.rate ?? null,
    }));
  }

  result.totalInvoiceValue = parsed.totalInvoiceValue ?? null;
  result.gstValue = parsed.gstValue ?? null;

  if (parsed.payment_info) {
    result.payment_info = { ...schema.payment_info, ...parsed.payment_info };
  }

  result.errors = parsed.errors ?? [];

  return result;
}



function stripMarkdownFence(text) {
  return text.replace(/^\s*```(yaml)?\s*|\s*```\s*$/g, "").trim();
}

async function GenAIprocessFile(file) {
  try {
    const uploadedFile = await ai.files.upload({ file: path.resolve(file.filePath) });
    const mimeType = file.type === "pdf" ? "application/pdf" : "image/png";

    const systemPrompt = `
You are an intelligent invoice parser and validator.
Given an invoice (PDF or image), extract all explicitly visible information exactly as shown and return **only YAML** with no additional explanation or commentary.

Your responsibilities:

1. **Extract** all visible information (text, numbers, percentages) exactly as they appear on the invoice.
2. **Calculate and validate** totals and tax values using the extracted percentages and item details.
3. **Do NOT overwrite, correct, or modify any extracted values.** Show them exactly as on the invoice.
4. **Strictly flag errors** with detailed messages explaining each discrepancy between extracted and calculated values.

Return the data using this exact YAML structure:

vendor:
name:
address:
taxNumber:
phone:

invoice:
number:
date:
type:

items:

* name:
  quantity:
  hsn_sac:
  rate:

totalInvoiceValue: # Extract the declared total exactly as on invoice, do NOT recalculate
gst_percentage: # Extract if shown, else omit

payment_info:
subtotal: # Extract as-is
tax_percentage: # Extract only the tax % (do NOT extract value)
vat_percentage: # Extract only the VAT %
sales_tax_percentage: # Extract only the Sales Tax %
shipping_handling_cost: # Extract as-is
total: # Extract as-is

errors:

* List each error as a separate entry, clearly specifying the issue with values, for example:

  * "Subtotal mismatch: extracted X.XX vs declared Y.YY"
  * "Tax amount mismatch: extracted X.XX vs declared Y.YY for tax rate Z%"
  * "Sales Tax amount mismatch: extracted X.XX vs declared Y.YY for sales tax rate Z%"
  * "Total mismatch: extracted X.XX vs declared Y.YY"
  * "Shipping & Handling amount mismatch: extracted X.XX vs declared Y.YY"

Calculation instructions:

* Calculate subtotal = sum of (quantity × rate) for all items. Round to 2 decimals.
* Calculate each tax component by applying the extracted percentage to the calculated subtotal. Round to 2 decimals.
* Calculate expected total = subtotal + all tax components + shipping & handling. Round to 2 decimals.
* Do not trust or overwrite any extracted numeric value. Use extracted values only for comparison.
* If any field is missing from the invoice, omit it in the output (do not fill with null).
* When extracting string values, ensure all strings are enclosed in double quotes (").
* If the extracted text contains double quotes, escape each with a backslash (\").
* If the extracted text contains single quotes, leave them as-is — no escaping is needed.
* Ensure the final YAML is valid and all strings follow this quoting rule.

IMPORTANT:

* Do not add any fields or values that are not explicitly present in the invoice.
* Do not provide explanations or extra text outside the YAML structure.
* Strictly adhere to this format and error reporting style.
* All Values which are string must be under quotes, do not add any extra text outside the YAML structure.
* do not add currency symbol in front of the values.


`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-pro",
      contents: [createUserContent([systemPrompt, createPartFromUri(uploadedFile.uri, mimeType)])],
    });

    const yamlText = stripMarkdownFence(response.text);
    let parsed = {};
    try {
      parsed = yaml.load(yamlText) || {};
    } catch (err) {
      console.warn("⚠️ Failed to parse YAML, returning empty object");
      throw new Error("Failed to parse YAML");
    }

    return { json: enforceSchema(parsed), yaml: yamlText };
  } catch (err) {
    throw err;
  }
}

module.exports = { GenAIprocessFile };
