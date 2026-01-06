# Cosmetics Formulation Manager

A web application for managing cosmetic formulations, ingredients, and inventory. Features batch scaling, cost tracking, and percentage-based formulation management.

## Features

- **Authentication** - Secure user authentication via Supabase
- **Formulation Management** - Create and manage cosmetic formulations with:
  - Percentage and weight-based ingredient tracking
  - Batch size scaling (scale up or down)
  - Cost calculation per batch
  - Metadata (pH, shelf life, usage instructions)
- **Ingredient Library** - Organize ingredients with:
  - Editable categories
  - Notes and descriptions
  - Cost per unit tracking
- **Inventory Tracking** - Track purchases with:
  - Supplier information
  - Purchase date and cost
  - Quantity and units
  - Automatic cost-per-unit calculation

## Tech Stack

- **Frontend**: React + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Backend/Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Hosting**: Vercel (recommended)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <repository-url>
cd formulation
npm install
```

### 2. Set Up Supabase

1. Go to [https://supabase.com](https://supabase.com) and create a free account
2. Create a new project
3. Go to the SQL Editor in your Supabase dashboard
4. Copy the entire contents of `DATABASE_SCHEMA.md` and run it in the SQL Editor
5. **Configure Authentication URLs** (IMPORTANT):
   - Go to Authentication > URL Configuration
   - Set **Site URL** to `http://localhost:5173`
   - Add `http://localhost:5173/**` to **Redirect URLs**
   - (Later, add your production URL when deployed)
6. Go to Settings > API to get your project URL and anon key

### 3. Configure Environment Variables

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and add your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

### 4. Run Locally

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Deployment

### Deploy to Vercel (Free)

1. Push your code to GitHub:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push
   ```

2. Go to [https://vercel.com](https://vercel.com) and sign up (free)

3. Click "New Project" and import your GitHub repository

4. Add your environment variables in the Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

5. Click "Deploy"

6. **Update Supabase URLs** (IMPORTANT):
   - Once deployed, go back to your Supabase project
   - Go to Authentication > URL Configuration
   - Update **Site URL** to your Vercel URL (e.g., `https://your-project.vercel.app`)
   - Add `https://your-project.vercel.app/**` to **Redirect URLs**

Your app will be live at `https://your-project.vercel.app`

### Alternative: Deploy to Netlify (Free)

1. Push your code to GitHub

2. Go to [https://netlify.com](https://netlify.com) and sign up

3. Click "Add new site" > "Import an existing project"

4. Connect to your GitHub repository

5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`

6. Add environment variables in Netlify dashboard

7. Click "Deploy site"

8. **Update Supabase URLs** (IMPORTANT):
   - Once deployed, go back to your Supabase project
   - Go to Authentication > URL Configuration
   - Update **Site URL** to your Netlify URL
   - Add your Netlify URL with `/**` to **Redirect URLs**

## Usage

### First Time Setup

1. Sign up for an account at your deployed URL
2. Create ingredient categories (e.g., Oils, Butters, Actives, Preservatives)
3. Add ingredients to your library
4. Record ingredient purchases to track costs
5. Create your first formulation

### Creating a Formulation

1. Go to "Formulations" and click "Create Formulation"
2. Fill in the formulation details (name, batch size, etc.)
3. Add ingredients and their percentages
4. Ensure percentages total 100%
5. Save the formulation

### Scaling Batches

1. Open any formulation
2. Change the batch size in the input field
3. The ingredient amounts and costs will automatically recalculate

### Tracking Costs

- Add purchases for each ingredient with quantity and cost
- The system will calculate cost per unit
- When viewing formulations, you'll see the total cost per batch based on the latest purchase prices

## Database Schema

See `DATABASE_SCHEMA.md` for the complete database schema and SQL setup instructions.

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Cost

This application can run **completely free**:
- **Supabase**: Free tier includes 500MB database, 50MB file storage, 2GB bandwidth
- **Vercel**: Free tier includes unlimited personal projects with 100GB bandwidth
- Total: **$0/month** for personal use

## License

MIT
