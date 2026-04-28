# 🚀 Deploying Veloura Rugs to Render

Follow these steps to take your store live on Render.com.

## 1. Prepare your GitHub Repository
1. Push all your latest code to your GitHub repository.
2. Make sure your `.gitignore` includes `.env` and `node_modules` (I've already set this up for you).

## 2. Set Up a MySQL Database
Render offers managed PostgreSQL, but for MySQL, you can use:
*   **Aiven.io** (Free tier MySQL)
*   **Railway.app** (Paid)
*   **TiDB Cloud** (Free tier)

Once you have your database:
1. Copy the connection details (Host, Port, User, Password, Database Name).
2. Run your `database/schema.sql` and `database/seed.sql` on the new database using a tool like MySQL Workbench or the provider's console.

## 3. Create a new "Web Service" on Render
1. Log in to [Render.com](https://render.com).
2. Click **New +** > **Web Service**.
3. Connect your GitHub repository.
4. Set the following options:
    *   **Name**: `veloura-rugs`
    *   **Environment**: `Node`
    *   **Build Command**: `npm install`
    *   **Start Command**: `npm start`
    *   **Plan**: `Free` (or higher)

## 4. Add Environment Variables
In the Render dashboard, go to the **Environment** tab and add these variables:
*   `PORT`: `10000` (Render will handle this automatically, but good to have)
*   `DB_HOST`: *(Your live database host)*
*   `DB_USER`: *(Your live database username)*
*   `DB_PASSWORD`: *(Your live database password)*
*   `DB_NAME`: *(Your live database name)*
*   `JWT_SECRET`: *(A long random string, e.g., `veloura_secret_2024_secure`)*

## 5. Deploy!
Render will automatically start building and deploying your app. Once it finishes, it will give you a URL like `https://veloura-rugs.onrender.com`.

---
### **Important Note**
Since I've updated the code to use relative paths (`/api`), your storefront and admin panel will work perfectly as soon as the site is live!
