# 🧠 AI Invoice Processing System


## 🐳 Run with Docker

> ⚠️ Make sure to set your `.env` file with the required environment variables, including your **Gemini API key**.


```bash
# Build and start containers
docker compose --build -d

# Access the application
http://localhost:3000
```

---

## 💻 Run Directly

```bash
# Start required services 
docker compose up -d

# Start development server
npm run dev

# Start background worker
npm run worker

# OR start with PM2 for production mode
npm run start
```

## OPTIONAL 
> Import the MongoDB collection from the provided JSON file in the `output/db collection dump` folder.

---

## 🧪 API Testing

* Import the provided **Postman collection**.
* Use `http://localhost:3000` as the base URL.
* Test invoice upload and processing APIs.

---

✅ That’s it — your application should now be running and ready for testing!
