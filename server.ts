import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import cors from 'cors';
import { initDb } from './src/server/db.ts';

interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
}

interface Transaction {
  id: number;
  user_id: number;
  userId?: number;
  description: string;
  amount: number;
  category: string;
  date: string;
  receipt_url?: string | null;
  receiptUrl?: string | null;
}

interface Budget {
  id: number;
  user_id: number;
  userId?: number;
  category: string;
  amount: number;
  month?: number | null;
  year?: number | null;
}

interface CategorySummary {
  category: string;
  totalAmount: number;
  transactionCount: number;
}

const DEMO_USER = {
  name: 'Demo User',
  email: 'demo@finlytics.app',
  password: 'demo123'
};

function formatDemoDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getDemoSeedData() {
  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  const daysAgo = (days: number) => {
    const date = new Date(now);
    date.setDate(now.getDate() - days);
    return formatDemoDate(date);
  };

  const currentMonthDate = (day: number) => {
    const safeDay = Math.min(day, now.getDate());
    return formatDemoDate(new Date(now.getFullYear(), now.getMonth(), safeDay));
  };

  const previousMonthDate = (day: number) => {
    const previous = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth(), 0).getDate();
    previous.setDate(Math.min(day, lastDay));
    return formatDemoDate(previous);
  };

  const transactions = [
    { description: 'Morning coffee - Blue Bottle', amount: 180, category: 'Food', date: daysAgo(0) },
    { description: 'Metro card recharge', amount: 500, category: 'Transport', date: daysAgo(0) },
    { description: 'Lunch at cafe', amount: 420, category: 'Food', date: daysAgo(1) },
    { description: 'Coffee with client', amount: 210, category: 'Food', date: daysAgo(1) },
    { description: 'Streaming subscription', amount: 649, category: 'Entertainment', date: daysAgo(2) },
    { description: 'Coffee and muffin', amount: 260, category: 'Food', date: daysAgo(2) },
    { description: 'Ride share home', amount: 360, category: 'Transport', date: daysAgo(3) },
    { description: 'Grocery top-up', amount: 980, category: 'Food', date: daysAgo(3) },
    { description: 'New work shirt', amount: 1850, category: 'Shopping', date: daysAgo(4) },
    { description: 'Evening coffee', amount: 160, category: 'Food', date: daysAgo(4) },
    { description: 'Movie tickets', amount: 760, category: 'Entertainment', date: daysAgo(5) },
    { description: 'Coffee beans', amount: 540, category: 'Food', date: daysAgo(5) },
    { description: 'Bus pass', amount: 700, category: 'Transport', date: daysAgo(6) },
    { description: 'Online accessories order', amount: 2450, category: 'Shopping', date: currentMonthDate(3) },
    { description: 'Apartment rent', amount: 28000, category: 'Rent', date: currentMonthDate(1) },
    { description: 'Electricity bill', amount: 1850, category: 'Utilities', date: currentMonthDate(5) },
    { description: 'Weekend dinner', amount: 1250, category: 'Food', date: currentMonthDate(6) },
    { description: 'Internet bill', amount: 999, category: 'Utilities', date: currentMonthDate(7) },
    { description: 'Bowling night', amount: 950, category: 'Entertainment', date: currentMonthDate(8) },
    { description: 'Fuel refill', amount: 1200, category: 'Transport', date: currentMonthDate(9) },
    { description: 'Previous month rent', amount: 28000, category: 'Rent', date: previousMonthDate(1) },
    { description: 'Previous month groceries', amount: 2100, category: 'Food', date: previousMonthDate(5) },
    { description: 'Previous month coffee runs', amount: 720, category: 'Food', date: previousMonthDate(12) },
    { description: 'Previous month shopping', amount: 3150, category: 'Shopping', date: previousMonthDate(14) },
    { description: 'Previous month utilities', amount: 2350, category: 'Utilities', date: previousMonthDate(16) },
    { description: 'Previous month transport', amount: 1650, category: 'Transport', date: previousMonthDate(18) },
    { description: 'Concert tickets', amount: 1800, category: 'Entertainment', date: previousMonthDate(21) },
    { description: 'Previous month dining out', amount: 1450, category: 'Food', date: previousMonthDate(24) }
  ];

  const budgets = [
    { category: 'Food', amount: 3500, month: currentMonth, year: currentYear },
    { category: 'Shopping', amount: 4200, month: currentMonth, year: currentYear },
    { category: 'Entertainment', amount: 3000, month: currentMonth, year: currentYear },
    { category: 'Transport', amount: 3200, month: currentMonth, year: currentYear }
  ];

  return { transactions, budgets };
}

async function startServer() {
  try {
    const db = await initDb();
    const app = express();
    const PORT = process.env.PORT || 3000;

    // Validate FRONTEND_URL to ensure it's not mistakenly set to a database URL
    let frontendOrigin: string | string[] = '*';
    const rawFrontendUrl = process.env.FRONTEND_URL;
    
    if (rawFrontendUrl) {
      if (rawFrontendUrl.startsWith('postgres://') || rawFrontendUrl.startsWith('postgresql://')) {
        console.warn('\x1b[31m%s\x1b[0m', '---------------------------------------------------------');
        console.warn('\x1b[31m%s\x1b[0m', 'ENVIRONMENT MISCONFIGURATION DETECTED:');
        console.warn('\x1b[31m%s\x1b[0m', 'Your FRONTEND_URL contains a PostgreSQL database connection string!');
        console.warn('\x1b[33m%s\x1b[0m', 'Please check your Settings menu to configure:');
        console.warn('\x1b[33m%s\x1b[0m', '  1. DATABASE_URL = ' + rawFrontendUrl);
        console.warn('\x1b[33m%s\x1b[0m', '  2. FRONTEND_URL = your actual frontend domain (e.g. https://your-vercel-app.vercel.app)');
        console.warn('\x1b[31m%s\x1b[0m', '---------------------------------------------------------');
        
        
        if (!process.env.DATABASE_URL) {
          process.env.DATABASE_URL = rawFrontendUrl;
        }
      } else {
        frontendOrigin = rawFrontendUrl;
      }
    }

    app.use(cors({
      origin: frontendOrigin,
      credentials: true
    }));

    app.use(express.json());

    // Setup Multer for file uploads
    const uploadDir = path.join(process.cwd(), 'uploads');
    try {
      await fs.access(uploadDir);
    } catch {
      await fs.mkdir(uploadDir, { recursive: true });
    }

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
      }
    });

    const upload = multer({ storage });

    // Serve static files from uploads directory
    app.use('/uploads', express.static(uploadDir));

    app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', time: new Date().toISOString() });
    });

    const verifiedUsersCache = new Set<number>();

    // --- Auth API ---
    app.post('/api/auth/register', async (req, res) => {
      const { name, email, password } = req.body;
      try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await db.run(
          'INSERT INTO users (name, email, password) VALUES (?, ?, ?)',
          [name, email, hashedPassword]
        );
        const newId = result.lastID;
        if (newId) {
          verifiedUsersCache.add(newId);
        }
        res.status(201).json({ id: newId, name, email });
      } catch (err: any) {
        if (err.message?.includes('UNIQUE')) {
          res.status(400).json({ message: 'Email already exists' });
        } else {
          res.status(500).json({ message: 'Error creating user' });
        }
      }
    });

    app.post('/api/auth/login', async (req, res) => {
      const { email, password } = req.body;
      try {
        // Allow login with either email or name (as "username")
        const user = await db.get('SELECT * FROM users WHERE email = ? OR name = ?', [email, email]) as User | undefined;
        if (!user || !user.password || !(await bcrypt.compare(password, user.password))) {
          return res.status(401).json({ message: 'Invalid email or password' });
        }
        verifiedUsersCache.add(user.id);
        res.json({ id: user.id, name: user.name, email: user.email });
      } catch (err) {
        res.status(500).json({ message: 'Login error' });
      }
    });

    app.post('/api/demo/login', async (req, res) => {
      try {
        const hashedPassword = await bcrypt.hash(DEMO_USER.password, 10);
        const { transactions, budgets } = getDemoSeedData();

        const transactionPlaceholders = transactions.map(() => '(?, ?, ?, ?)').join(', ');
        const transactionParams = transactions.flatMap(transaction => [
          transaction.amount,
          transaction.category,
          transaction.date,
          transaction.description
        ]);

        const budgetPlaceholders = budgets.map(() => '(?, ?, ?, ?)').join(', ');
        const budgetParams = budgets.flatMap(budget => [
          budget.category,
          budget.amount,
          budget.month,
          budget.year
        ]);

        const rows = await db.all(`
          WITH demo_user AS (
            INSERT INTO users (name, email, password)
            VALUES (?, ?, ?)
            ON CONFLICT (email) DO UPDATE SET
              name = EXCLUDED.name,
              password = EXCLUDED.password
            RETURNING id, name, email
          ),
          deleted_transactions AS (
            DELETE FROM transactions
            WHERE user_id = (SELECT id FROM demo_user)
          ),
          deleted_budgets AS (
            DELETE FROM budgets
            WHERE user_id = (SELECT id FROM demo_user)
          ),
          inserted_transactions AS (
            INSERT INTO transactions (amount, category, date, description, user_id, receipt_url)
            SELECT
              values_table.amount::numeric,
              values_table.category,
              values_table.date::date,
              values_table.description,
              demo_user.id,
              NULL
            FROM (VALUES ${transactionPlaceholders}) AS values_table(amount, category, date, description), demo_user
            RETURNING id
          ),
          inserted_budgets AS (
            INSERT INTO budgets (user_id, category, category_id, monthly_limit, month, year)
            SELECT
              demo_user.id,
              values_table.category,
              NULL,
              values_table.amount::numeric,
              values_table.month::integer,
              values_table.year::integer
            FROM (VALUES ${budgetPlaceholders}) AS values_table(category, amount, month, year), demo_user
            RETURNING id
          )
          SELECT id, name, email FROM demo_user
        `, [DEMO_USER.name, DEMO_USER.email, hashedPassword, ...transactionParams, ...budgetParams]) as User[];

        const user = rows[0];

        if (!user?.id) {
          return res.status(500).json({ message: 'Could not initialize demo user' });
        }

        verifiedUsersCache.add(user.id);
        res.json({ id: user.id, name: user.name, email: user.email });
      } catch (err) {
        console.error('Demo Login Error:', err);
        res.status(500).json({ message: 'Error preparing demo account' });
      }
    });

    // --- Expenses API ---
    const checkUser = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const userIdStr = req.headers['x-user-id'];
      if (!userIdStr) {
        return res.status(401).json({ message: 'User ID required' });
      }
      const userId = parseInt(userIdStr as string);
      
      // Use cached verified users to reduce database lookups.
      if (verifiedUsersCache.has(userId)) {
        (req as any).userId = userId;
        return next();
      }

      try {
        const userExists = await db.get('SELECT id FROM users WHERE id = ?', [userId]);
        if (!userExists) {
          console.warn(`API Request received with invalid user_id: ${userId}. Prompting re-auth.`);
          return res.status(401).json({ message: 'User not found' });
        }
        // Store verified user for future requests.
        verifiedUsersCache.add(userId);
        (req as any).userId = userId;
        next();
      } catch (err: any) {
        console.error('Database error in checkUser middleware:', err);
        res.status(500).json({ message: 'Database error verifying user session' });
      }
    };

    app.get('/api/expenses/category-summary', checkUser, async (req, res) => {
      const userId = (req as any).userId;
      const { timeFilter } = req.query;
      
      let dateCondition = '';
      const params: any[] = [userId];

      if (timeFilter === 'this-month') {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        dateCondition = ' AND date >= ?';
        params.push(start.toISOString().split('T')[0]);
      } else if (timeFilter === 'last-month') {
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        
        dateCondition = ' AND date >= ? AND date <= ?';
        params.push(start.toISOString().split('T')[0]);
        params.push(end.toISOString().split('T')[0]);
      }

      try {
        const summary = await db.all(`
          SELECT 
            category, 
            SUM(amount) as totalAmount, 
            COUNT(*) as transactionCount 
          FROM transactions 
          WHERE user_id = ? ${dateCondition} 
          GROUP BY category
          ORDER BY totalAmount DESC
        `, params) as CategorySummary[];

        const totalOverall = summary.reduce((acc, curr) => acc + curr.totalAmount, 0);
        
        const result = summary.map(item => ({
          category: item.category,
          totalAmount: parseFloat(item.totalAmount.toFixed(2)),
          transactionCount: item.transactionCount,
          percentage: totalOverall > 0 ? parseFloat(((item.totalAmount / totalOverall) * 100).toFixed(2)) : 0
        }));

        res.json(result);
      } catch (err) {
        res.status(500).json({ message: 'Error calculating category summary' });
      }
    });

    app.get('/api/expenses', checkUser, async (req, res) => {
      try {
        const expenses = await db.all('SELECT id, user_id as userId, description, amount, category, date, receipt_url as receiptUrl, created_at as createdAt, updated_at as updatedAt FROM transactions WHERE user_id = ? ORDER BY date DESC', [(req as any).userId]);
        res.json(expenses);
      } catch (err) {
        res.status(500).json({ message: 'Error fetching expenses' });
      }
    });

    app.get('/api/expenses/filter', checkUser, async (req, res) => {
      const userId = (req as any).userId;
      const { category, minAmount, maxAmount, startDate, endDate, nlQuery } = req.query;

      try {
        let where = 'WHERE user_id = ?';
        const params: any[] = [userId];

        if (category && category !== 'All') {
          where += ' AND category = ?';
          params.push(category);
        }
        if (minAmount) {
          where += ' AND amount >= ?';
          params.push(parseFloat(minAmount as string));
        }
        if (maxAmount) {
          where += ' AND amount <= ?';
          params.push(parseFloat(maxAmount as string));
        }
        if (startDate) {
          where += ' AND date >= ?';
          params.push(startDate);
        }
        if (endDate) {
          where += ' AND date <= ?';
          params.push(endDate);
        }

        if (nlQuery) {
          where += ' AND (description LIKE ? OR category LIKE ?)';
          params.push(`%${nlQuery}%`, `%${nlQuery}%`);
        }

        const expenses = await db.all(`SELECT id, user_id as userId, description, amount, category, date, receipt_url as receiptUrl, created_at as createdAt, updated_at as updatedAt FROM transactions ${where} ORDER BY date DESC`, params);
        res.json(expenses);
      } catch (err) {
        res.status(500).json({ message: 'Error filtering expenses' });
      }
    });

    app.post('/api/ocr/scan', checkUser, upload.single('receipt'), async (req, res) => {
      try {
        const multerReq = req as any;
        if (!multerReq.file) {
          return res.status(400).json({ message: 'No file uploaded' });
        }
        
        const fileUrl = `/uploads/${multerReq.file.filename}`;
        
        // Return uploaded receipt file details.
        res.json({ 
          url: fileUrl,
          filename: multerReq.file.filename
        });
      } catch (err) {
        console.error('OCR Upload Error:', err);
        res.status(500).json({ message: 'Server error during file upload' });
      }
    });

    app.post('/api/expenses', checkUser, async (req, res) => {
      const { amount, category, date, description, receiptUrl } = req.body;
      const userId = (req as any).userId;
      try {
        const result = await db.run(
          'INSERT INTO transactions (amount, category, date, description, user_id, receipt_url) VALUES (?, ?, ?, ?, ?, ?)',
          [amount, category, date, description, userId, receiptUrl || null]
        );
        res.status(201).json({ id: result.lastID, amount, category, date, description, userId, receiptUrl });
      } catch (err) {
        console.error('Error adding expense details:', err);
        res.status(500).json({ message: 'Error adding expense' });
      }
    });

    app.put('/api/expenses/:id', checkUser, async (req, res) => {
      const { id } = req.params;
      const { amount, category, date, description, receiptUrl } = req.body;
      const userId = (req as any).userId;
      try {
        const expense = await db.get('SELECT * FROM transactions WHERE id = ? AND user_id = ?', [id, userId]);
        if (!expense) return res.status(404).json({ message: 'Expense not found' });

        await db.run(
          'UPDATE transactions SET amount = ?, category = ?, date = ?, description = ?, receipt_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          [amount, category, date, description, receiptUrl || null, parseInt(id)]
        );
        res.json({ id: parseInt(id), amount, category, date, description, userId, receiptUrl });
      } catch (err) {
        console.error('Error updating expense details:', err);
        res.status(500).json({ message: 'Error updating expense' });
      }
    });

    app.delete('/api/expenses/:id', checkUser, async (req, res) => {
      const { id } = req.params;
      const userId = (req as any).userId;
      try {
        const result = await db.run('DELETE FROM transactions WHERE id = ? AND user_id = ?', [parseInt(id), userId]);
        if (result.changes === 0) return res.status(404).json({ message: 'Expense not found' });
        res.status(204).send();
      } catch (err) {
        console.error('Error deleting expense details:', err);
        res.status(500).json({ message: 'Error deleting expense' });
      }
    });

    // --- Budgets API ---
    app.get('/api/budgets', checkUser, async (req, res) => {
      try {
        // Map monthly_limit back to amount for frontend compatibility
        const budgets = await db.all('SELECT id, user_id as userId, category, monthly_limit as amount, month, year FROM budgets WHERE user_id = ?', [(req as any).userId]) as Budget[];
        res.json(budgets);
      } catch (err) {
        res.status(500).json({ message: 'Error fetching budgets' });
      }
    });

    app.post('/api/budgets', checkUser, async (req, res) => {
      const { category, amount } = req.body;
      const userId = (req as any).userId;
      try {
        // Try to find category_id if possibleotherwise use name
        const categoryData = await db.get('SELECT id FROM categories WHERE name = ? AND (user_id = ? OR user_id = 0)', [category, userId]);
        const categoryId = categoryData ? categoryData.id : null;

        const existing = await db.get('SELECT id FROM budgets WHERE user_id = ? AND category = ?', [userId, category]) as Budget | undefined;
        if (existing) {
          await db.run('UPDATE budgets SET monthly_limit = ?, category_id = ? WHERE id = ?', [amount, categoryId, existing.id]);
        } else {
          await db.run('INSERT INTO budgets (user_id, category, category_id, monthly_limit) VALUES (?, ?, ?, ?)', [userId, category, categoryId, amount]);
        }
        res.json({ userId, category, amount });
      } catch (err) {
        console.error('Budget Update Error:', err);
        res.status(500).json({ message: 'Error updating budget' });
      }
    });

    app.delete('/api/budgets/:category', checkUser, async (req, res) => {
      const { category } = req.params;
      const userId = (req as any).userId;
      try {
        await db.run('DELETE FROM budgets WHERE user_id = ? AND category = ?', [userId, category]);
        res.status(204).send();
      } catch (err) {
        res.status(500).json({ message: 'Error deleting budget' });
      }
    });

    // --- Categories API ---
    app.get('/api/categories', checkUser, async (req, res) => {
      const userId = (req as any).userId;
      try {
        const categories = await db.all('SELECT id, name, user_id as userId FROM categories WHERE user_id = ? OR user_id = 0', [userId]) as any[];
        res.json(categories);
      } catch (err) {
        res.status(500).json({ message: 'Error fetching categories' });
      }
    });

    app.post('/api/categories', checkUser, async (req, res) => {
      const { name } = req.body;
      const userId = (req as any).userId;
      try {
        if (!name || name.trim() === '') {
          return res.status(400).json({ message: 'Category name is required' });
        }
        const existing = await db.get('SELECT id FROM categories WHERE name = ? AND (user_id = ? OR user_id = 0)', [name.trim(), userId]);
        if (existing) {
          return res.status(400).json({ message: 'Category already exists' });
        }
        const result = await db.run('INSERT INTO categories (name, user_id) VALUES (?, ?)', [name.trim(), userId]);
        res.status(201).json({ id: result.lastID, name: name.trim(), userId });
      } catch (err) {
        res.status(500).json({ message: 'Error creating category' });
      }
    });

    app.delete('/api/categories/:id', checkUser, async (req, res) => {
      const { id } = req.params;
      const userId = (req as any).userId;
      try {
        const category = await db.get('SELECT id, name, user_id FROM categories WHERE id = ? AND (user_id = ? OR user_id = 0)', [id, userId]) as any;
        
        if (!category) return res.status(404).json({ message: 'Category not found' });
        if (category.user_id === 0) return res.status(403).json({ message: 'Cannot delete default categories' });

        const inUse = await db.get('SELECT id FROM transactions WHERE category = ? AND user_id = ?', [category.name, userId]);
        if (inUse) {
          return res.status(400).json({ message: 'Cannot delete category because it is in use by transactions' });
        }

        const result = await db.run('DELETE FROM categories WHERE id = ? AND user_id = ?', [parseInt(id), userId]);
        if (result.changes === 0) return res.status(403).json({ message: 'Unauthorized to delete this category' });
        res.status(204).send();
      } catch (err) {
        res.status(500).json({ message: 'Error deleting category' });
      }
    });

    // --- Insights API ---
    app.get('/api/insights', checkUser, async (req, res) => {
      const userId = (req as any).userId;
      try {
        const expenses = await db.all('SELECT id, user_id as userId, amount, category, date, description FROM transactions WHERE user_id = ?', [userId]) as Transaction[];
        const budgets = await db.all('SELECT id, user_id as userId, monthly_limit as amount, category, month, year FROM budgets WHERE user_id = ?', [userId]) as Budget[];

        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();

        const currentMonthExpenses = expenses.filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });

        if (currentMonthExpenses.length === 0) {
          return res.json([]);
        }

        const insights: string[] = [];
        const currentMonthTotal = currentMonthExpenses.reduce((sum, e) => sum + Number(e.amount), 0);

        // 1. Group current month by category
        const categoryTotals: Record<string, number> = {};
        currentMonthExpenses.forEach(e => {
          categoryTotals[e.category] = (categoryTotals[e.category] || 0) + Number(e.amount);
        });

        // 2. Highest Spending Category
        const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);
        if (sortedCategories.length > 0) {
          insights.push(`${sortedCategories[0][0]} is your highest spending category this month.`);
        }

        const frequentCoffeeCount = currentMonthExpenses.filter(e => e.description.toLowerCase().includes('coffee')).length;
        if (frequentCoffeeCount >= 3) {
          insights.push(`Frequent purchase detected: coffee appears in ${frequentCoffeeCount} transactions this month.`);
        }

        // 3. Budget Thresholds
        budgets.forEach(b => {
          const spent = categoryTotals[b.category] || 0;
          const budgetAmount = Number(b.amount);
          if (budgetAmount > 0) {
            if (spent > budgetAmount) {
              insights.push(`Warning: You have exceeded your ${b.category} budget by ₹${(spent - budgetAmount).toLocaleString('en-IN')}.`);
            } else if (spent >= budgetAmount * 0.8) {
              insights.push(`Alert: You are close to exceeding your ${b.category} budget.`);
            }
          }
        });

        // 4. Weekly Comparison (Current week vs Last week) - only if enough data exists
        if (currentMonthExpenses.length >= 3) {
          const startOfThisWeek = new Date(now);
          startOfThisWeek.setDate(now.getDate() - now.getDay());
          startOfThisWeek.setHours(0, 0, 0, 0);

          const startOfLastWeek = new Date(startOfThisWeek);
          startOfLastWeek.setDate(startOfLastWeek.getDate() - 7);

          const categoryWeekly: Record<string, { this: number; last: number }> = {};
          
          currentMonthExpenses.forEach(e => {
            const expenseDate = new Date(e.date);
            const cat = e.category;
            if (!categoryWeekly[cat]) categoryWeekly[cat] = { this: 0, last: 0 };

            if (expenseDate >= startOfThisWeek) {
              categoryWeekly[cat].this += Number(e.amount);
            } else if (expenseDate >= startOfLastWeek && expenseDate < startOfThisWeek) {
              categoryWeekly[cat].last += Number(e.amount);
            }
          });

          Object.entries(categoryWeekly).forEach(([cat, amounts]) => {
            if (amounts.last > 0 && amounts.this > amounts.last) {
              const diff = amounts.this - amounts.last;
              const percent = Math.round((diff / amounts.last) * 100);
              if (percent >= 10) {
                insights.push(`You spent ${percent}% more on ${cat} this week compared to last week.`);
              }
            }
          });
        }

        // 5. Weekend vs Weekday (Patterns)
        if (currentMonthExpenses.length >= 5) {
          let weekendSpending = 0;
          let weekdaySpending = 0;
          currentMonthExpenses.forEach(e => {
            const d = new Date(e.date).getDay();
            if (d === 0 || d === 6) {
              weekendSpending += Number(e.amount);
            } else {
              weekdaySpending += Number(e.amount);
            }
          });

          if (weekendSpending > weekdaySpending * 1.5) {
            insights.push("Pattern detected: Your spending is significantly higher on weekends.");
          }
        }

        // 6. Savings Suggestion (Data-driven Tip)
        if (sortedCategories.length > 0 && currentMonthExpenses.length >= 3) {
          const topCat = sortedCategories[0][0];
          const topAmt = sortedCategories[0][1];
          // Suggest saving 10% if category spending is significant (>20% of total)
          if (topAmt > currentMonthTotal * 0.2 && topAmt > 1000) {
            insights.push(`Tip: Reducing your ${topCat} spending by just 10% would save you ₹${Math.round(topAmt * 0.1)} this month.`);
          }
        }

        res.json(insights.slice(0, 5)); // Return top 5 insights
      } catch (err) {
        res.status(500).json({ message: 'Error generating insights' });
      }
    });

    // --- Reports & Export API ---
    app.get('/api/reports/monthly', checkUser, async (req, res) => {
      const userId = (req as any).userId;
      const { month, year } = req.query;
      try {
        const expenses = await db.all('SELECT amount, category, date FROM transactions WHERE user_id = ?', [userId]) as Transaction[];
        const budgets = await db.all('SELECT monthly_limit as amount, category FROM budgets WHERE user_id = ?', [userId]) as Budget[];

        const targetMonth = parseInt(month as string);
        const targetYear = parseInt(year as string);

        const monthlyExpenses = expenses.filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
        });

        if (monthlyExpenses.length === 0) {
          return res.json({
            totalSpent: 0,
            transactionCount: 0,
            categoryBreakdown: {},
            highestCategory: null,
            lowestCategory: null,
            budgetStatus: []
          });
        }

        const totalSpent = monthlyExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
        const categoryMap: Record<string, number> = {};
        const categoryCountMap: Record<string, number> = {};

        monthlyExpenses.forEach(e => {
          categoryMap[e.category] = (categoryMap[e.category] || 0) + Number(e.amount);
          categoryCountMap[e.category] = (categoryCountMap[e.category] || 0) + 1;
        });

        const sortedCats = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
        const highestCategory = sortedCats[0];
        const lowestCategory = sortedCats[sortedCats.length - 1];

        const budgetStatus = budgets.map(b => {
          const spent = categoryMap[b.category] || 0;
          const limit = Number(b.amount);
          return {
            category: b.category,
            limit,
            spent,
            percentage: Math.round((spent / limit) * 100)
          };
        });

        res.json({
          totalSpent,
          transactionCount: monthlyExpenses.length,
          categoryBreakdown: categoryMap,
          categoryCounts: categoryCountMap,
          highestCategory: highestCategory ? { name: highestCategory[0], amount: highestCategory[1] } : null,
          lowestCategory: lowestCategory ? { name: lowestCategory[0], amount: lowestCategory[1] } : null,
          budgetStatus
        });
      } catch (err) {
        res.status(500).json({ message: 'Error generating report metadata' });
      }
    });

    app.get('/api/reports/export/excel', checkUser, async (req, res) => {
      const userId = (req as any).userId;
      const { month, year } = req.query;
      try {
        const expenses = await db.all('SELECT amount, category, date, description FROM transactions WHERE user_id = ?', [userId]) as Transaction[];
        const targetMonth = parseInt(month as string);
        const targetYear = parseInt(year as string);

        const monthlyExpenses = expenses.filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
        });

        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet('Transactions');

        sheet.columns = [
          { header: 'Date', key: 'date', width: 15 },
          { header: 'Description', key: 'description', width: 30 },
          { header: 'Category', key: 'category', width: 15 },
          { header: 'Amount (INR)', key: 'amount', width: 15 },
        ];

        monthlyExpenses.forEach(e => {
          sheet.addRow({
            date: e.date,
            description: e.description,
            category: e.category,
            amount: e.amount
          });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Expense_Report_${targetMonth + 1}_${targetYear}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();
      } catch (err) {
        res.status(500).send('Error generating Excel');
      }
    });

    app.get('/api/reports/export/pdf', checkUser, async (req, res) => {
      const userId = (req as any).userId;
      const { month, year } = req.query;
      try {
        const expenses = await db.all('SELECT amount, category, date, description FROM transactions WHERE user_id = ?', [userId]) as Transaction[];
        const budgets = await db.all('SELECT monthly_limit as amount, category FROM budgets WHERE user_id = ?', [userId]) as Budget[];
        const targetMonth = parseInt(month as string);
        const targetYear = parseInt(year as string);

        const monthlyExpenses = expenses.filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === targetMonth && d.getFullYear() === targetYear;
        });

        const totalSpent = monthlyExpenses.reduce((sum, e) => sum + e.amount, 0);
        const categoryMap: Record<string, number> = {};
        monthlyExpenses.forEach(e => {
          categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
        });

        const doc = new PDFDocument({ margin: 50 });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=Expense_Report_${targetMonth + 1}_${targetYear}.pdf`);
        doc.pipe(res);

        // Header
        doc.fontSize(25).text('Monthly Financial Report', { align: 'center' });
        doc.fontSize(14).text(`Period: ${new Intl.DateTimeFormat('en-US', { month: 'long' }).format(new Date(targetYear, targetMonth))} ${targetYear}`, { align: 'center' });
        doc.moveDown();

        // Summary
        doc.fontSize(16).text('Executive Summary', { underline: true });
        doc.fontSize(12).text(`Total Spending: INR ${totalSpent.toLocaleString()}`);
        doc.text(`Total Transactions: ${monthlyExpenses.length}`);
        
        const sortedCats = Object.entries(categoryMap).sort((a, b) => b[1] - a[1]);
        if (sortedCats.length > 0) {
          doc.text(`Highest Spending Category: ${sortedCats[0][0]} (INR ${sortedCats[0][1].toLocaleString()})`);
          doc.text(`Lowest Spending Category: ${sortedCats[sortedCats.length - 1][0]} (INR ${sortedCats[sortedCats.length - 1][1].toLocaleString()})`);
        }
        doc.moveDown();

        // Category Breakdown
        doc.fontSize(16).text('Category Breakdown', { underline: true });
        for (const [cat, amt] of sortedCats) {
          const percent = ((amt / totalSpent) * 100).toFixed(1);
          doc.fontSize(12).text(`${cat}: INR ${amt.toLocaleString()} (${percent}%)`);
          
          // Simple horizontal bar chart representation
          const barWidth = 300 * (amt / totalSpent);
          doc.rect(150, doc.y - 12, barWidth, 10).fill('#6DA5FF');
          doc.moveDown(0.5);
        }
        doc.fillColor('black'); // Reset color
        doc.moveDown();

        // Budget Status
        if (budgets.length > 0) {
          doc.fontSize(16).text('Budget Performance', { underline: true });
          budgets.forEach(b => {
            const spent = categoryMap[b.category] || 0;
            const status = spent > b.amount ? 'EXCEEDED' : 'ON TRACK';
            doc.fontSize(12).text(`${b.category}: ${Math.round((spent / b.amount) * 100)}% used (${status})`);
            doc.moveDown(0.2);
          });
          doc.moveDown();
        }

        // Transactions Table
        doc.fontSize(16).text('Transaction History', { underline: true });
        doc.moveDown();
        
        // Table Header
        const startY = doc.y;
        doc.fontSize(10).font('Helvetica-Bold').text('Date', 50, startY);
        doc.text('Description', 120, startY);
        doc.text('Category', 350, startY);
        doc.text('Amount', 480, startY, { align: 'right' });
        doc.moveTo(50, startY + 15).lineTo(550, startY + 15).stroke();
        
        let rowY = startY + 25;
        doc.font('Helvetica'); // Reset to regular
        monthlyExpenses.forEach(e => {
          if (rowY > 700) {
            doc.addPage();
            rowY = 50;
          }
          doc.text(e.date, 50, rowY);
          doc.text(e.description.length > 35 ? e.description.substring(0, 32) + '...' : e.description, 120, rowY);
          doc.text(e.category, 350, rowY);
          doc.text(e.amount.toLocaleString(), 480, rowY, { align: 'right' });
          rowY += 20;
        });

        doc.end();
      } catch (err) {
        console.error(err);
        if (!res.headersSent) {
          res.status(500).send('Error generating PDF');
        }
      }
    });

    // --- Vite Middleware ---
    if (process.env.NODE_ENV !== 'production') {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } 

    app.listen(Number(PORT), '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('SERVER FATAL ERROR:', error);
    process.exit(1);
  }
}

startServer();
