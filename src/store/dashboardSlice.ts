import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface DashboardState {
  data: any[];
  filters: {
    dateRange: string;
    regions: string[];
    productTypes: string[];
  };
  loading: boolean;
  error: string | null;
  layout: any[];
}

const initialState: DashboardState = {
  data: [],
  filters: {
    dateRange: 'all',
    regions: [],
    productTypes: [],
  },
  loading: false,
  error: null,
  layout: [],
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setData: (state, action: PayloadAction<any[]>) => {
      state.data = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<DashboardState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    setLayout: (state, action: PayloadAction<any[]>) => {
      state.layout = action.payload;
    },
  },
});

export const { setData, setFilters, setLoading, setError, setLayout } = dashboardSlice.actions;
export default dashboardSlice.reducer; 