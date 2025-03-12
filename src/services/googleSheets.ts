import axios from 'axios';

export interface SheetData {
  Date: string;
  'Project/ Block': string;
  Team: string;
  'Plot Category': string;
  Bank: string;
  'Clearance Status': string;
  'Sale Value': number;
}

const GOOGLE_SHEETS_API_URL = import.meta.env.VITE_GOOGLE_SHEETS_API_URL;

// Helper function to parse date
const parseDate = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // If direct parsing fails, try parsing D-MMM-YY format
      const [day, month, year] = dateStr.split('-');
      const monthMap: { [key: string]: string } = {
        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
        'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
      };
      // Convert to YYYY-MM-DD format
      const fullYear = '20' + year; // Assuming all years are in the 2000s
      return `${fullYear}-${monthMap[month]}-${day.padStart(2, '0')}`;
    }
    return date.toISOString().split('T')[0];
  } catch (error) {
    console.error('Error parsing date:', dateStr, error);
    return dateStr;
  }
};

export const fetchSheetData = async (): Promise<SheetData[]> => {
  try {
    const response = await axios.get(GOOGLE_SHEETS_API_URL);
    
    // Transform the data to match our interface
    const transformedData = response.data.map((row: any) => {
      // Add debug logging
      console.log('Raw Sale Value:', row['Sale Value'], 'Type:', typeof row['Sale Value']);
      
      const saleValue = Number(row['Sale Value']) || 0;
      console.log('Parsed Sale Value:', saleValue);

      return {
        Date: parseDate(row.Date || ''),
        'Project/ Block': row['Project/ Block'] || '',
        Team: row.Team || '',
        'Plot Category': row['Plot Category'] || '',
        Bank: row.Bank || '',
        'Clearance Status': row['Clearance Status'] || '',
        'Sale Value': saleValue
      };
    });

    console.log('Transformed data:', transformedData);
    return transformedData;
  } catch (error) {
    console.error('Error fetching data from Google Sheets:', error);
    throw error;
  }
};

export const setupRealtimeUpdates = (callback: (data: SheetData[]) => void) => {
  // Poll for updates every 30 seconds
  const pollInterval = setInterval(async () => {
    try {
      const data = await fetchSheetData();
      callback(data);
    } catch (error) {
      console.error('Error in realtime update:', error);
    }
  }, 30000);

  // Initial fetch
  fetchSheetData()
    .then(callback)
    .catch((error) => console.error('Error in initial fetch:', error));

  return () => clearInterval(pollInterval);
}; 