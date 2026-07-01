import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, getTenantId } from '../supabaseClient';

const SiteContext = createContext();

export const useSite = () => {
  return useContext(SiteContext);
};

export const SiteProvider = ({ children }) => {
  const [content, setContent] = useState({});
  const [isAdmin, setIsAdmin] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAdmin(!!session);
      if (!session) setIsEditMode(false);
    });

    return () => {
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsAdmin(!!session);
  };

  const fetchSettings = async () => {
    try {
      const tenantId = await getTenantId();
      const { data, error } = await supabase
        .from('site_settings')
        .select('*')
        .eq('tenant_id', tenantId);
      if (error) throw error;
      
      const contentMap = {};
      data.forEach(item => {
        contentMap[item.id] = item.content;
      });
      setContent(contentMap);
    } catch (err) {
      console.error('Error fetching site settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (id, newValue) => {
    try {
      // Optimistic update
      setContent(prev => ({ ...prev, [id]: newValue }));
      
      const tenantId = await getTenantId();
      const { error } = await supabase
        .from('site_settings')
        .upsert({ tenant_id: tenantId, id, content: newValue, updated_at: new Date().toISOString() });
        
      if (error) throw error;
    } catch (err) {
      console.error('Error updating site content:', err);
      // Revert optimistic update (could refetch here)
      fetchSettings();
    }
  };

  const value = {
    content,
    isAdmin,
    isEditMode,
    setIsEditMode,
    updateContent,
    loading
  };

  return (
    <SiteContext.Provider value={value}>
      {children}
    </SiteContext.Provider>
  );
};
