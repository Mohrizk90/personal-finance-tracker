# 💰 Personal Finance Tracker

A fullstack personal finance tracker web application that helps you manage multiple financial contexts (Home, Work, and Businesses) with their own transactions, subscriptions, savings, and budgets. Built with React, Node.js, and Google Sheets as the database.

## ✨ Features

- **Multi-Context Management**: Organize finances across Home, Work, and multiple Business contexts
- **Transaction Tracking**: Record income and expenses with categories and accounts
- **Subscription Management**: Track recurring subscriptions with billing dates and status
- **Savings Goals**: Monitor savings progress with goal tracking and progress bars
- **Budget Management**: Set monthly budgets and track spending against limits
- **Investment Portfolio**: Track investments across different asset types with profit/loss calculations
- **Interactive Dashboard**: Visual charts showing income vs expenses, spending by category, savings progress, and investment performance
- **Mobile-Responsive**: Fully responsive design that works on all devices
- **Real-time Data**: Google Sheets integration for reliable data storage

## 🛠 Tech Stack

- **Frontend**: React 18 + Tailwind CSS + Recharts
- **Backend**: Node.js + Express
- **Database**: Google Sheets API
- **Deployment**: Railway
- **Charts**: Recharts for data visualization

## 📋 Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or higher)
2. **Google Cloud Project** with Sheets API enabled
3. **Google Service Account** with credentials
4. **Google Spreadsheet** with the required sheets structure

## 🚀 Quick Start

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd personal-finance-tracker
```

### 2. Install Dependencies

```bash
# Install root dependencies
npm install

# Install client dependencies
cd client
npm install
cd ..
```

### 3. Set Up Google Sheets

#### Create a Google Spreadsheet with these sheets:

**Contexts Sheet:**
| id | name | type |
|----|------|------|
| 1  | My Home | Home |
| 2  | Work Expenses | Work |
| 3  | Business A | Business |

**Transactions Sheet:**
| id | context_id | date | category | type | amount | account | notes |
|----|------------|------|----------|------|--------|---------|-------|
| 1  | 1 | 2024-01-15 | Groceries | Expense | 150.00 | Checking | Weekly shopping |

**Subscriptions Sheet:**
| id | context_id | service | amount | frequency | next_billing_date | status |
|----|------------|---------|--------|-----------|-------------------|--------|
| 1  | 1 | Netflix | 15.99 | monthly | 2024-02-01 | Active |

**Savings Sheet:**
| id | context_id | account | date | amount | goal |
|----|------------|---------|------|--------|------|
| 1  | 1 | Emergency Fund | 2024-01-15 | 500.00 | 10000.00 |

**Budgets Sheet:**
| id | context_id | category | monthly_limit | month | spent |
|----|------------|----------|---------------|-------|-------|
| 1  | 1 | Groceries | 600.00 | 2024-01 | 0.00 |

**Investments Sheet:**
| id | context_id | asset_name | type | amount_invested | current_value | date_invested | notes |
|----|------------|------------|------|-----------------|---------------|---------------|-------|
| 1  | 1 | Apple Inc. | Stock | 1000.00 | 1200.00 | 2024-01-15 | AAPL shares |

### 4. Configure Environment Variables

Create a `.env` file in the root directory:

```env
GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
SHEET_ID=your-google-sheet-id
PORT=3000
```

#### How to get Google credentials:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google Sheets API
4. Create a Service Account:
   - Go to IAM & Admin > Service Accounts
   - Click "Create Service Account"
   - Fill in details and create
5. Generate a JSON key for the service account
6. Copy the `client_email` and `private_key` from the JSON file
7. Share your Google Spreadsheet with the service account email

### 5. Run the Application

#### Development Mode:
```bash
npm run dev
```

This will start both the backend server (port 3000) and React development server (port 3001).

#### Production Mode:
```bash
# Build the React app
npm run build

# Start the production server
npm start
```

## 🚀 Deployment on Railway

### 1. Prepare for Deployment

Ensure your `.env` file is ready with production values.

### 2. Deploy to Railway

1. **Connect to Railway:**
   ```bash
   npm install -g @railway/cli
   railway login
   ```

2. **Initialize Railway project:**
   ```bash
   railway init
   ```

3. **Set environment variables:**
   ```bash
   railway variables set GOOGLE_CLIENT_EMAIL=your-service-account@your-project.iam.gserviceaccount.com
   railway variables set GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYour private key here\n-----END PRIVATE KEY-----\n"
   railway variables set SHEET_ID=your-google-sheet-id
   ```

4. **Deploy:**
   ```bash
   railway up
   ```

### 3. Alternative: Deploy via Railway Dashboard

1. Go to [Railway.app](https://railway.app)
2. Create a new project
3. Connect your GitHub repository
4. Add environment variables in the Railway dashboard
5. Deploy automatically

## 📱 Usage

### Dashboard
- View financial overview with charts
- Switch between different contexts
- Monitor income vs expenses
- Track savings progress
- View investment performance and portfolio summary

### Transactions
- Add income and expense transactions
- Categorize transactions
- Filter by type (Income/Expense)
- Edit and delete transactions

### Subscriptions
- Manage recurring subscriptions
- Track billing dates and amounts
- Set subscription status (Active/Paused/Cancelled)
- Monitor total subscription costs

### Savings
- Record savings contributions
- Set savings goals
- Track progress with visual progress bars
- Organize by savings accounts

### Budgets
- Set monthly spending limits by category
- Track actual spending vs budgets
- Visual progress indicators
- Monthly budget management

### Investments
- Track investment portfolio across different asset types
- Monitor profit/loss with percentage calculations
- Filter investments by type (Stock, Crypto, Mutual Fund, Property, etc.)
- View total invested vs current value
- Add notes and investment details

## 🔧 API Endpoints

### Contexts
- `GET /api/contexts` - Get all contexts
- `POST /api/contexts` - Create new context
- `PUT /api/contexts/:id` - Update context
- `DELETE /api/contexts/:id` - Delete context

### Transactions
- `GET /api/transactions?context_id=:id` - Get transactions for context
- `POST /api/transactions` - Create new transaction
- `PUT /api/transactions/:id` - Update transaction
- `DELETE /api/transactions/:id` - Delete transaction

### Subscriptions
- `GET /api/subscriptions?context_id=:id` - Get subscriptions for context
- `POST /api/subscriptions` - Create new subscription
- `PUT /api/subscriptions/:id` - Update subscription
- `DELETE /api/subscriptions/:id` - Delete subscription

### Savings
- `GET /api/savings?context_id=:id` - Get savings for context
- `POST /api/savings` - Create new savings record
- `PUT /api/savings/:id` - Update savings record
- `DELETE /api/savings/:id` - Delete savings record

### Budgets
- `GET /api/budgets?context_id=:id&month=:month` - Get budgets for context and month
- `POST /api/budgets` - Create new budget
- `PUT /api/budgets/:id` - Update budget
- `DELETE /api/budgets/:id` - Delete budget

### Investments
- `GET /api/investments?context_id=:id` - Get investments for context
- `POST /api/investments` - Create new investment
- `PUT /api/investments/:id` - Update investment
- `DELETE /api/investments/:id` - Delete investment

## 🎨 Customization

### Adding New Categories
Edit the category arrays in the modal components:
- `TransactionModal.js` - Transaction categories
- `BudgetModal.js` - Budget categories
- `InvestmentModal.js` - Investment types

### Styling
The app uses Tailwind CSS. Customize colors and styling in:
- `client/tailwind.config.js` - Theme configuration
- Component files for specific styling

### Charts
Charts are built with Recharts. Modify chart components in:
- `Dashboard.js` - Main dashboard charts
- Add new chart types as needed

## 🐛 Troubleshooting

### Common Issues

1. **Google Sheets API Errors:**
   - Verify service account has access to the spreadsheet
   - Check that Sheets API is enabled
   - Ensure private key is properly formatted with `\n` characters

2. **Build Errors:**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Check Node.js version (requires v18+)

3. **Railway Deployment Issues:**
   - Verify all environment variables are set
   - Check Railway logs for specific errors
   - Ensure Procfile is in the root directory

### Getting Help

1. Check the browser console for client-side errors
2. Check server logs for backend errors
3. Verify Google Sheets API quotas and permissions
4. Test API endpoints directly with tools like Postman

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support, please open an issue in the GitHub repository or contact the development team.

---

**Happy Financial Tracking! 💰📊**
