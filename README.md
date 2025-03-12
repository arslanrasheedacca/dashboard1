# Interactive Dashboard with Google Sheets Integration

A modern, responsive dashboard built with React.js that fetches and visualizes data from Google Sheets in real-time.

## Features

- Real-time data updates from Google Sheets
- Interactive charts and visualizations
- Dark/Light mode support
- Responsive grid layout
- Advanced filtering and data slicing
- Draggable and resizable widgets
- Beautiful UI with Tailwind CSS

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Google Sheets API credentials
- Google Apps Script setup

## Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd dashboard
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_GOOGLE_SHEETS_API_URL=your_google_apps_script_url
```

4. Set up Google Sheets:
   - Create a new Google Sheet
   - Set up Google Apps Script to expose your data as JSON
   - Deploy the Apps Script as a web app
   - Copy the web app URL to your `.env` file

5. Start the development server:
```bash
npm run dev
```

## Google Apps Script Setup

1. Open your Google Sheet
2. Go to Extensions > Apps Script
3. Create a new script with the following code:

```javascript
function doGet() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  const jsonData = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  return ContentService.createTextOutput(JSON.stringify(jsonData))
    .setMimeType(ContentService.MimeType.JSON);
}
```

4. Deploy the script as a web app:
   - Click "Deploy" > "New deployment"
   - Choose "Web app"
   - Set "Execute as" to your account
   - Set "Who has access" to "Anyone"
   - Click "Deploy"
   - Copy the web app URL

## Project Structure

```
dashboard/
├── src/
│   ├── components/
│   │   ├── DashboardLayout.tsx
│   │   ├── DashboardWidget.tsx
│   │   ├── FilterPanel.tsx
│   │   └── charts/
│   │       ├── SalesChart.tsx
│   │       └── TrendsChart.tsx
│   ├── services/
│   │   └── googleSheets.ts
│   ├── store/
│   │   ├── index.ts
│   │   └── dashboardSlice.ts
│   ├── App.tsx
│   └── main.tsx
├── .env
├── package.json
└── README.md
```

## Technologies Used

- React.js
- TypeScript
- Redux Toolkit
- Recharts
- Tailwind CSS
- Framer Motion
- React Grid Layout
- Google Sheets API
- Google Apps Script

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
