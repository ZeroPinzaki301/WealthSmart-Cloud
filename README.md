# PERN App – Cloud-Native Deployment (AWS + Supabase)

A full-stack PERN (PostgreSQL, Express, React, Node.js) application migrated from local development to a serverless, cloud-native architecture on AWS.  
Built with developer efficiency in mind, leveraging AI assistance for boilerplate code while owning the system design, data flow, and cloud infrastructure.

## Architecture Overview

- **Frontend**: React + Vite + Tailwind CSS, hosted on **AWS S3** + **CloudFront** (CDN + HTTPS)
- **Backend**: Node.js + Express (ES6), deployed as **AWS Lambda functions** (via API Gateway)
- **Database**: **Supabase** (PostgreSQL) – managed, scalable, real‑time ready
- **File Storage**: **AWS S3** for user‑uploaded profile images
- **Authentication**: (your choice, e.g. JWT / Supabase Auth)

## Key Features

- User profile management with image uploads (stored in S3)
- Responsive UI built with Tailwind CSS
- Serverless backend – auto‑scales, pay‑per‑request
- Secure image delivery via CloudFront + S3 signed URLs
- Environment‑based config for dev / prod

## Deployment & Operations

| Component          | AWS Service                     |
|--------------------|---------------------------------|
| Frontend hosting   | S3 + CloudFront                 |
| Backend API        | Lambda + API Gateway            |
| File storage       | S3                              |
| Database           | Supabase (external)             |
| IAM & security     | IAM roles, S3 bucket policies   |

## Reason for using said Services

- This is a practice migration to cloud of my personal project, I have to make the services as free as possible but still running as intended without spin downs and also to see if my interest in cloud would go further.


### CI/CD (optional, if implemented)
- Manual deployment via AWS CLI / GitHub Actions
- Can be extended with automated pipelines

## Local Development

```bash
# Clone
git clone https://github.com/ZeroPinzaki301/WealthSmart-Cloud.git

# Backend
cd backend
npm install
npm run dev

# Frontend
cd frontend
npm install
npm run dev

## ⚠️ Important

The `.env.example` uses development defaults. For production:
- Change all secrets (JWT secrets should be 32+ chars)
- Set `FRONTEND_URL` to your actual domain
- Use real Brevo SMTP credentials
- Never commit real `.env` files
