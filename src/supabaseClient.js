import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mfkyksoprcqztanszhdt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ma3lrc29wcmNxenRhbnN6aGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDgxMTcsImV4cCI6MjA5NzM4NDExN30.F2E-I6M_LfkOokm-OA_68u1mc0eRR8fqrtve_68WhOQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
