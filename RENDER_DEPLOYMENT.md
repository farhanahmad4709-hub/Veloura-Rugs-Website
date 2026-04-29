# 🚀 Deploying Veloura Rugs to Vercel

Follow these steps to take your full-stack Veloura Rugs storefront live on Vercel.

## 1. Prepare your GitHub Repository
1. Push all your latest code to your GitHub repository.
2. Make sure your `.gitignore` includes `.env` and `node_modules` (I've already set this up for you).
3. Ensure the `vercel.json` file is present in the root directory (this handles all the complex routing between your API, client storefront, and admin portal).

## 2. Set Up a MySQL Database
Vercel is serverless, so you need an external MySQL database to store your products, users, and orders.
*   **TiDB Cloud** (Free tier, highly recommended, serverless-friendly)
*   **Aiven.io** (Free tier MySQL)
*   **PlanetScale** (If using MySQL-compatible branch)

Once you have your database:
1. Copy the connection details (Host, Port, User, Password, Database Name).
2. *Note:* You DO NOT need to manually run SQL scripts! Our built-in `db-init.js` auto-healing script will automatically create all tables and seed the 30 products the moment your server boots up!

## 3. Create a new Project on Vercel
1. Log in to [Vercel.com](https://vercel.com).
2. Click **Add New...** > **Project**.
3. Import your GitHub repository.
4. Leave the Framework Preset as `Other`.
5. *Important:* Expand the **Environment Variables** section.

## 4. Add Environment Variables
You MUST add these variables in the Vercel dashboard (Settings > Environment Variables) before you click Deploy.

**Database Keys:**
You get these directly from your database provider (like TiDB). Click "Connect" on your database dashboard to find them:
*   `DB_HOST`: *(e.g., gateway01.us-east-1.prod.aws.tidbcloud.com)*
*   `DB_USER`: *(e.g., 2a3b4c5d.root)*
*   `DB_PASSWORD`: *(The password you created for the database)*
*   `DB_NAME`: *(e.g., veloura)*
*   `DB_PORT`: `4000` *(Usually 4000 for TiDB, or 3306 for standard MySQL)*

**Security Keys:**
You do not download this key—you make it up yourself! It acts as a master password for encrypting user logins.
*   `JWT_SECRET`: *(Type any long, random, hard-to-guess string. e.g., `Veloura_Production_Secret_Key_9876!`)*

## 5. Deploy!
Click **Deploy**. Vercel will automatically read the `vercel.json` file, build the Node.js Express serverless functions, and host the static files.

Once it finishes, you will be given a live URL (e.g., `https://veloura-rugs-website.vercel.app`).

---
### **Diagnostic Tools (Post-Deployment)**
If you encounter any database errors after deployment, you can use these secret links:
*   `https://[your-vercel-url]/api/test/force-init` - Forcefully triggers the database self-healing script to create missing columns.
*   `https://[your-vercel-url]/api/test/create-admin` - Instantly generates the `admin@veloura.com` / `admin123` account so you can log into the `/admin` portal.
