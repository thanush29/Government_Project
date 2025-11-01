# MGNREGA Analytics Dashboard

![Build Status](https://img.shields.io/badge/build-passing-brightgreen)
![License](https://img.shields.io/badge/license-MIT-blue)
![India](https://img.shields.io/badge/Made%20in-India-orange)

A modern, responsive analytics dashboard that brings transparency to rural employment data under India's Mahatma Gandhi National Rural Employment Guarantee Act (MGNREGA). Visualize employment trends, wage analytics, and demographic breakdowns across Indian states in real-time.

**Mission:** Make rural labour and wage data transparent and accessible to citizens, policymakers, researchers, and civil society organizations.

---

## 🎯 Overview

The MGNREGA Analytics Dashboard transforms complex government employment data into intuitive, actionable visualizations. It enables stakeholders to monitor:

- **Employment Metrics**: Track individuals employed and trends over time
- **Wage Disbursements**: Monitor wage payments at the state level
- **Demographic Participation**: Analyze participation by women, Scheduled Castes (SC), and Scheduled Tribes (ST)
- **State Comparisons**: Compare metrics across all Indian states and union territories

The dashboard automatically detects your location and provides employment data for your state, with an option to manually select any other state for comparison.

---

## 📡 Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | React 18 + TypeScript | Component-based UI with type safety |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **Backend** | Supabase (PostgreSQL) | Real-time database with REST API |
| **Charts** | Plotly.js + Canvas API | Interactive and custom chart rendering |
| **Icons** | Lucide React | Consistent, scalable SVG icons |
| **Geolocation** | Nominatim OSM | Reverse geocoding for auto-detection |
| **i18n** | Google Translate | Support for 10 Indian languages |

### Data Flow

```
Browser Geolocation
        ↓
Nominatim Reverse Geocoding
        ↓
State Detection → Supabase REST API
        ↓
/rest/v1/state_monthly_summary?state_name=eq.{STATE}
        ↓
React Component State
        ↓
Canvas/DOM Rendering
```

### Real-time Updates

- **Polling**: Data refetches every time the user selects a different state
- **Future Enhancement**: WebSocket support for live updates via Supabase Realtime

---

## 🔑 Environment Variables

Create a `.env` file in your project root with the following variables:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anonymous-key-here
```

**Get your credentials:**

1. Visit [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy the URL and `anon` key

**Important:** These are public-facing keys. Never commit them to version control.

See `.env.example` for reference.

---

## 📦 Database Schema

The dashboard integrates with a Supabase PostgreSQL database with the following schema:

### Tables

#### `states`
```sql
- state_code (text, primary key)
- state_name (text, unique)
```
Master list of Indian states and union territories.

#### `districts`
```sql
- district_code (text, primary key)
- district_name (text)
- state_code (text, foreign key → states.state_code)
```
Administrative districts mapped to states.

#### `mgnrega_stats`
```sql
- unique_key (text, primary key)
- district_code (text, foreign key → districts.district_code)
- month (date)
- total_individuals_worked (integer)
- total_persondays (integer)
- wages (numeric)
- women_persondays (integer)
- sc_persondays (integer)
- st_persondays (integer)
- created_at (timestamp, default: now())
- updated_at (timestamp, default: now())
```

Raw monthly employment data at the district level. This is the source of truth for all analytics.

#### `state_monthly_summary` (View)
```sql
CREATE VIEW state_monthly_summary AS
SELECT
  state_name,
  month,
  SUM(total_individuals_worked) as total_individuals_worked,
  SUM(wages) as wages,
  SUM(women_persondays) as women_persondays,
  SUM(sc_persondays) as sc_persondays,
  SUM(st_persondays) as st_persondays
FROM mgnrega_stats m
JOIN districts d ON m.district_code = d.district_code
JOIN states s ON d.state_code = s.state_code
GROUP BY state_name, month
ORDER BY state_name, month;
```

Pre-aggregated state-level metrics for fast querying.

#### `district_monthly_summary` (View)
```sql
CREATE VIEW district_monthly_summary AS
SELECT
  district_name,
  month,
  total_individuals_worked,
  wages,
  women_persondays,
  sc_persondays,
  st_persondays
FROM mgnrega_stats m
JOIN districts d ON m.district_code = d.district_code
ORDER BY district_name, month;
```

District-level monthly metrics used by advanced analytics components.

---

## 📊 Dashboard Analytics

### Key Performance Indicators

| KPI | Data Source | Description |
|-----|-------------|-------------|
| **Total Individuals Worked** | `SUM(total_individuals_worked)` | Cumulative count across selected period |
| **Total Wages Disbursed** | `SUM(wages)` | In Indian Rupees (displayed in Crores) |
| **Average Monthly Workers** | Derived metric | Total individuals ÷ months |

### Visualizations

#### State-Level Charts (Canvas-based)

**Line Chart: Monthly Employment Trends**
- **X-Axis**: Months (sorted chronologically)
- **Y-Axis**: Total individuals worked
- **Interaction**: Hover over data points for exact values
- **Data Source**: `state_monthly_summary` grouped by month

**Pie Chart: Demographic Breakdown**
- **Segments**: Women, SC (Scheduled Caste), ST (Scheduled Tribe)
- **Data**: Persondays contributed by each demographic
- **Insight**: Identifies inclusion and representation in the scheme
- **Data Source**: `women_persondays`, `sc_persondays`, `st_persondays`

#### District-Level Analytics (Plotly-powered)

**Sunburst Chart: Demographics Breakdown**
- **Technology**: Plotly.js interactive sunburst visualization
- **Categories**: Women (Orange #FB923C), SC (Green #16A34A), ST (Blue #3B82F6), Others (Gray #E5E7EB)
- **Interaction**: Click segments to drill down, hover for exact values
- **Data Source**: `district_monthly_summary` aggregated by category
- **Insight Component**: `SunburstInsight` displays demographic percentages and totals

**Heatmap: Monthly Category Activity**
- **Technology**: Plotly.js heatmap with gradient color scale
- **Axes**: X = Months, Y = Demographics (Women, SC, ST, Others)
- **Color Scale**: Light gray to dark orange based on persondays intensity
- **Interaction**: Hover cells to see exact personday counts
- **Data Source**: `district_monthly_summary` grouped by month and category
- **Insight Component**: `HeatmapInsight` identifies peak months and categories

**Trendline: Wages vs Individuals**
- **Technology**: Plotly.js dual-axis line chart
- **Left Y-Axis**: Wages in rupees (Green line #16A34A)
- **Right Y-Axis**: Total individuals (Orange line #F97316)
- **Interaction**: Hover to see exact values per month
- **Data Source**: `district_monthly_summary` with wages and individuals columns
- **Insight Component**: `TrendInsight` calculates average wage per person

**Choropleth Map: Geographic Distribution**
- **Status**: Placeholder component
- **Future Feature**: Interactive map showing district-level employment data
- **Planned Technology**: Plotly.js choropleth with India district boundaries

### State Selection

- **Auto-Detection**: Browser geolocation → reverse geocoding via Nominatim OSM
- **Fallback**: If location permission denied, defaults to Maharashtra
- **Manual Override**: Dropdown with all 36 Indian states and union territories
- **Instant Updates**: Charts and KPIs refresh automatically on state change

---

## 🌍 Features

### Current Implementation

✅ **Automatic State Detection**
- Uses browser geolocation API
- Reverse geocodes coordinates using OpenStreetMap Nominatim
- Falls back to state dropdown if permission denied

✅ **Real-Time Data Fetching**
- Supabase REST API integration with `@supabase/supabase-js`
- Automatic data aggregation at state level
- Error handling and loading states

✅ **Responsive Design**
- Mobile-first layout
- Touch-friendly controls (large fonts, buttons)
- Optimized for Indian users on various devices
- Tailwind CSS grid system for flexible layouts

✅ **Multilingual Support**
- Google Translate widget embedded
- Supports: English, Hindi, Tamil, Telugu, Bengali, Malayalam, Kannada, Marathi, Gujarati, Punjabi
- Maintains functionality across language switches

✅ **India-Themed Aesthetic**
- Tricolor gradient (orange, white, green)
- India flag emoji in hero section
- Patriotic yet professional design
- High contrast for accessibility

✅ **Smooth Animations**
- Fade-in transitions for content
- Loading spinners
- Hover state effects on cards and districts
- CSS-based animations (no external libraries)

### Future Enhancements

🔄 **Real-Time Updates**
- WebSocket connection via Supabase Realtime
- Live data streaming as new stats are published

🗺️ **Enhanced Geographic Visualization**
- Complete choropleth map implementation with district boundaries
- Interactive state-to-district drill-down navigation

🔐 **Role-Based Access**
- Policymaker dashboard with export capabilities
- Researcher view with raw data downloads
- Public dashboard with visualizations only

🌐 **API Access**
- GraphQL endpoint for developers
- Rate-limited public API for civic tech startups

---

## 🚀 Getting Started

### Prerequisites

- Node.js 16+ and npm/yarn
- Supabase account with database created
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/mgnrega-dashboard.git
   cd mgnrega-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   nano .env
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

5. **Build for production**
   ```bash
   npm run build
   ```

### Database Setup

Ensure your Supabase database has the schema above initialized. The view `state_monthly_summary` must exist for the dashboard to function.

---

## 📡 API Usage

### Fetch State-Level Data

**Using Supabase JavaScript Client:**

```typescript
import { supabase } from './lib/supabase';

async function fetchStateData(stateName: string) {
  const { data, error } = await supabase
    .from('state_monthly_summary')
    .select('*')
    .eq('state_name', stateName)
    .order('month', { ascending: true });

  if (error) {
    console.error('Error fetching data:', error);
    return [];
  }

  return data;
}

// Usage
const maharashtraData = await fetchStateData('Maharashtra');
```

**Using HTTP REST API Directly:**

```bash
curl "https://your-project.supabase.co/rest/v1/state_monthly_summary?state_name=eq.Maharashtra" \
  -H "Authorization: Bearer your-anon-key" \
  -H "Content-Type: application/json"
```

**Response:**
```json
[
  {
    "state_name": "Maharashtra",
    "month": "2024-01-01",
    "total_individuals_worked": 150000,
    "wages": 2500000000,
    "women_persondays": 75000,
    "sc_persondays": 45000,
    "st_persondays": 30000
  },
  // ... more months
]
```

---

## 📁 Project Structure

```
src/
├── components/
│   ├── KPICard.tsx               # Metric cards (individuals, wages, averages)
│   ├── BarChart.tsx              # Monthly bar chart visualization
│   ├── PieChart.tsx              # Demographics pie chart breakdown
│   ├── Sunburst.tsx              # Plotly sunburst chart (district-level demographics)
│   ├── Heatmap.tsx               # Plotly heatmap (monthly × category activity)
│   ├── Trendline.tsx             # Plotly dual-axis trend (wages vs individuals)
│   ├── ChoroplethMap.tsx         # Placeholder for geographic map
│   └── Insights/
│       ├── SunburstInsight.tsx   # Narrative for demographics breakdown
│       ├── HeatmapInsight.tsx    # Narrative for peak month/category
│       └── TrendInsight.tsx      # Narrative for wage trends
├── lib/
│   ├── supabase.ts               # Supabase client initialization
│   └── hooks/
│       ├── useSunburstData.ts    # Data fetching hook for sunburst chart
│       ├── useHeatmapData.ts     # Data fetching hook for heatmap
│       └── useTrendData.ts       # Data fetching hook for trendline
|       |__ useChoroplethData.ts  #  Data fetching hook for Choroplethdata
├── utils/
│   └── districtDetection.ts         # Geolocation + reverse geocoding logic
├── App.tsx                       # Main dashboard container
├── main.tsx                      # React entry point
└── index.css                     # Tailwind + custom animations

public/
└── index.html                    # HTML with Google Translate script

.env.example                      # Environment variable template
india-districts.json              # igen file
tailwind.config.js                # Tailwind configuration
vite.config.ts                    # Vite build configuration
```

---

## 🎨 Design Principles

### Color Palette

- **Primary**: Orange (#f97316) — Government scheme primary
- **Secondary**: Green (#16a34a) — Environmental focus
- **Accent**: Blue (#3b82f6) — Trust and reliability
- **Neutral**: Gray scale for text and backgrounds

### Typography

- **Headlines**: Bold sans-serif, 24-48px
- **Body**: Regular sans-serif, 14-16px
- **Data**: Monospace for numbers and codes

### Responsive Breakpoints

- **Mobile**: 320px - 640px
- **Tablet**: 641px - 1024px
- **Desktop**: 1025px+

---

## 📸 Screenshots

*Add images here after deployment:*

- Dashboard hero with state selector
- KPI cards layout
- Line chart with monthly trends
- Pie chart demographics breakdown
- Mobile responsive view

---

## 🔄 Deployment

### Deploy on Vercel

1. Push code to GitHub
2. Connect repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically on push to main

```bash
# One-time setup
vercel link
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel
```

### Deploy on Netlify

1. Connect GitHub repository
2. Build command: `npm run build`
3. Publish directory: `dist`
4. Add environment variables in Netlify UI
5. Deploy

### Deploy on Self-Hosted Server

```bash
npm run build
# Copy 'dist' folder to your web server (Nginx, Apache)
# Set up CORS if using separate API domain
```

---

## 🧪 Testing

```bash
# Run ESLint
npm run lint

# Type check
npm run typecheck

# Build verification
npm run build
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit changes: `git commit -m "Add your feature"`
4. Push to branch: `git push origin feature/your-feature`
5. Open a Pull Request

### Development Guidelines

- Use TypeScript for type safety
- Follow existing code style
- Keep components small and reusable
- Test on mobile devices
- Add comments for complex logic

---

## 📋 License

This project is licensed under the **MIT License** — see LICENSE file for details.

---

## 📚 Resources

- [MGNREGA Official Website](https://nrega.nic.in/)
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Nominatim Reverse Geocoding](https://nominatim.org/release-docs/latest/api/Reverse/)

---

## 🙋 Support

**Issues & Feedback:**
- Open an issue on GitHub
- Email: contact@example.com

**Data Sources:**
- Employment data: [National Portal of India - MGNREGA](https://nrega.nic.in/)
- Geographic boundaries: [OpenStreetMap](https://www.openstreetmap.org/)

---

## 👏 Attribution

**Data powered by** Government of India
**Built by** Thanush

Made with ❤️ for transparency and accessibility in rural employment.

---

## 🗺️ Acknowledgments

- Government of India for MGNREGA data
- Supabase for backend infrastructure
- React and Tailwind communities
- OpenStreetMap for geolocation services

---

*Last updated: October 2024*
