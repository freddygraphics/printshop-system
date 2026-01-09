PrintShop Full Starter (Dockerized)
==================================
Stack:
- PostgreSQL (db)
- Backend: Node.js + Express (CRUD, Workflow, Invoices, WhatsApp payment link route placeholder)
- Frontend: Next.js

Quick start:
1) Install Docker & Docker Compose.
2) From this folder, run:
   docker-compose up --build
3) Frontend: http://localhost:3000
4) Backend: http://localhost:3001  (see docs/postman_collection.json)

Notes:
- Replace the dummy payment URL in /backend/index.js with a real Stripe Payment Link.
- DB schema is applied automatically from db/init/01_schema.sql on first run.
