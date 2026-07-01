import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://mfkyksoprcqztanszhdt.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1ma3lrc29wcmNxenRhbnN6aGR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE4MDgxMTcsImV4cCI6MjA5NzM4NDExN30.F2E-I6M_LfkOokm-OA_68u1mc0eRR8fqrtve_68WhOQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const getTenantSlug = () => {
  if (import.meta.env.VITE_TENANT_SLUG) {
    return import.meta.env.VITE_TENANT_SLUG;
  }
  const host = window.location.hostname;
  const parts = host.split('.');
  if (parts.length > 2 && parts[0] !== 'www' && parts[0] !== 'localhost') {
    return parts[0];
  }
  return 'default';
};

let cachedTenantId = null;

export const getTenantId = async () => {
  if (cachedTenantId) return cachedTenantId;
  
  const slug = getTenantSlug();
  const { data, error } = await supabase
    .from('tenants')
    .select('id')
    .eq('slug', slug)
    .single();
    
  if (error) {
    console.error('Error fetching tenant ID, trying default:', error);
    const { data: defaultData, error: defaultError } = await supabase
      .from('tenants')
      .select('id')
      .eq('slug', 'default')
      .single();
    
    if (defaultError) {
      console.error('Error fetching default tenant ID:', defaultError);
      return null;
    }
    cachedTenantId = defaultData.id;
    return cachedTenantId;
  }
  
  cachedTenantId = data.id;
  return cachedTenantId;
};

