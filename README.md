# Scalable GenAI Invoice PDF Data Extractor ![InvoiceAI](https://img.shields.io/badge/Scalable-GenAI%20Invoice%20Extractor-blue) 

**One-liner:**  
AI-powered backend system to extract structured data from multi-page invoices and PDFs and Images at scale, flag errors, and store results efficiently.

---

## Table of Contents
- [Demo Video](#demo-video)
- [Features](#features)  
- [High-Level Architecture](#high-level-architecture)  
- [Tech Stack](#tech-stack)  
- [Installation & Setup](#installation--setup)  
- [Scripts](#scripts)  
- [Environment Variables](#environment-variables)  
- [API Endpoints](#api-endpoints)  
- [Sample Output](#sample-output)  
- [Validation & Error Handling](#validation--error-handling)  
- [Scaling Workers & Concurrency](#scaling-workers--concurrency)  
- [Token Efficiency](#token-efficiency)  
- [Postman Collection](#postman-collection)  
- [License](#license)  

---
## Demo Video 


---

## Features
- **Batch & Async Processing:** Upload multiple invoices; files queued in RabbitMQ.  
- **High Concurrency:** Single worker can process ~100 files in parallel; scale horizontally with multiple workers.  
- **GenAI-Powered Extraction:** Extracts vendor details, invoice metadata, line items, totals, and payment info.  
- **Error Detection:** Flags mismatches in subtotal, sales tax, shipping, and total.  
- **Multi-format Support:** PDFs, images, scanned, and multi-page invoices.  
- **Token-Efficient YAML Output:** Saves 20–30% of AI token costs; converted to JSON for DB storage.  

---

## High-Level Architecture
```

[Insert your HLD diagram image here]

````

**Workflow Summary:**
1. Users upload invoices via `/api/file/upload`.  
2. Files queued in **RabbitMQ**.  
3. Workers fetch id's and run GenAI extraction (parallel processing).  
4. YAML output generated → converted to JSON → stored in MongoDB.  
5. Validation checks applied; errors flagged.  
6. Processed results accessible via API.  

---

## Tech Stack
| Layer                  | Technology |
|------------------------|------------|
| Backend Framework      | Express.js |
| Database               | MongoDB |
| Queue / Async Jobs     | RabbitMQ |
| Rate Limiting          | Redis |
| Containerization       | Docker & Docker Compose |
| AI / Data Extraction   | Generative AI (Gemini) |

---

## Installation & Setup

### 🐳 Run with Docker
> ⚠️ Ensure `.env` includes your **Gemini API key**.

```bash
# Build and start containers
docker compose --build -d

# Access the app
http://localhost:3000
````

### 💻 Run Directly

```bash
# Start required services
docker compose up -d

# Start development server
npm run dev

# Start background worker
npm run worker

# OR start with PM2 for production
npm run start
```

---

## Scripts

```json
"scripts": {
    "dev": "node --env-file=.env --watch index.js",
    "worker": "node --env-file=.env worker/file.worker.js",
    "queue:flush": "node --env-file=.env scripts/amqp.flush.js",
    "start": "pm2 start ecosystem.config.cjs"
}
```

---

## Environment Variables

```env
GEMINI_API_KEY=<your-api-key>

AMQP_URL=amqp://user:password@localhost:5672
MONGODB_URI=mongodb://localhost:27017/invoices
REDIS_HOST=localhost
REDIS_PORT=6379

MAX_FILE_SIZE=200
PORT=3000
WORKER_CONCURRENCY=100
```

---

## API Endpoints

### 1. Upload Files

* **Endpoint:** `/api/file/upload`
* **Method:** POST
* **Request:** Multipart/form-data (multiple files)
* **Form Key:** files
* **Response:**

```json
{
 "message": "Files uploaded and queued",
 "file_ids": [array of file id's]
}
```

### 2. Fetch All Files (with filters)

* **Endpoint:** `/api/file`
* **Method:** GET
* **Request Body Example:**
* **filters (status):** pending, processing, processed, error
* **flag:** true or false (to fetch the flagged files having error in calculation or other)
```json
{
  "flag": true,
  "status": "processed"
}
```

### 3. Fetch File by ID

* **Endpoint:** `/api/file/{invoice_id}`
* **Method:** GET
* **FormData Example:** Include file(s) to process if needed

---

## Sample Output (Direct Gen AI)

```yaml
items:
- name: "Activator CREAM 5-gal 5 gallons/pailt"
  quantity: 2
  rate: 269.00
- name: "AEB2461 PTFE 10\"x36YDS 5mil Glass Cloth Fabric / No Adh."
  quantity: 5
  rate: 64.00
- name: "Permabond 106 Cyanoacrylate 1-oz 10 bottles/case"
  quantity: 7
  rate: 139.00
- name: "Araldite 2014 HT Epoxy Paste GRAY 50ml 2:1 6 cartridges/box | 120 cartridges/case"
  quantity: 1
  rate: 719.00
payment_info:
  subtotal: 1187
  sales_tax_percentage: 8
  shipping_handling_cost: 50
  total: 1330.75
errors:
- "Subtotal mismatch: calculated 2550.00 vs declared 1187.00"
- "Sales Tax amount mismatch: calculated 204.00 vs declared 94.75 for sales tax rate 8%"
- "Total mismatch: calculated 2804.00 vs declared 1330.75"
```

> Stored in MongoDB as JSON (YAML converted to JSON internally).

---

## Validation & Error Handling

* Flags subtotal, sales tax, shipping, and total mismatches.
* Invalid invoices are stored with an `errors` array for review.

---

## Scaling Workers & Concurrency

* **Worker Concurrency:** Default 100 files per worker.
* **Multiple Workers:** Run multiple workers to scale horizontally.
* **File Size Limit:** Default 200MB; configurable.
* **Rate Limiting:** ioredis ensures stable API usage.
* **Tips:** Monitor CPU/memory and RabbitMQ queues for optimal throughput.

---

## Token Efficiency

* YAML formatting reduces AI token usage by ~20–30%.
* reduced characters by 30% (in current scenario) → faster output.
* Read more: [How I Saved Millions in GenAI Token Costs](https://www.rohanprajapati.dev/blog/how-i-saved-millions-in-genai-token-efficiency)

---

## Postman Collection

* Import **Postman collection** from `postman_collection.json`.
* Base URL: `http://localhost:3000`
* Test endpoints: upload invoices, fetch all files, fetch file by ID.

---

## License

This project is licensed under the **MIT License**.

