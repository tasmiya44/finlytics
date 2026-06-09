# Finlytics – Personal Finance Management Platform

Finlytics is a full-stack personal finance management application designed to help users track expenses, manage budgets, analyze spending habits, and generate financial reports. The platform provides an intuitive dashboard for monitoring financial activity and making informed budgeting decisions.

## Tech Stack

### Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* Framer Motion
* Lucide React

### Backend

* Node.js
* Express.js
* TypeScript

### Database

* PostgreSQL (Neon)

### Authentication & Security

* bcryptjs password hashing
* User-based data isolation

## Features

### User Authentication

* Secure user registration and login
* Password hashing using bcryptjs
* Multi-user support

### Expense Management

* Add, edit, and delete transactions
* Categorized expense tracking
* Receipt upload support
* Transaction filtering and search

### Budget Management

* Create category-wise budgets
* Track spending against limits
* Budget utilization monitoring

### Analytics & Insights

* Spending trend analysis
* Category-wise breakdowns
* Monthly financial summaries
* Personalized spending insights

### Reports & Exports

* Monthly financial reports
* PDF report generation
* Excel spreadsheet export
* Transaction history summaries

### Dashboard

* Total spending overview
* Budget performance metrics
* Recent transactions
* Financial insights and recommendations

## Database Structure

### Users

* id
* name
* email
* password
* created_at

### Transactions

* id
* user_id
* description
* amount
* category
* date
* receipt_url
* created_at

### Categories

* id
* user_id
* name
* created_at

### Budgets

* id
* user_id
* category
* monthly_limit
* month
* year

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The application runs locally and connects to a PostgreSQL database using environment variables.

## Environment Variables

```env
DATABASE_URL=
JWT_SECRET=
FRONTEND_URL=
VITE_API_URL=
```

## Project Structure

* `server.ts` – API routes and server configuration
* `src/server/db.ts` – Database layer
* `src/components` – Reusable UI components
* `src/pages` – Application pages
* `src/context` – Global state management

## Future Enhancements

* Recurring transactions
* Multi-currency support
* Financial goal tracking
* Advanced analytics
* Mobile application support
