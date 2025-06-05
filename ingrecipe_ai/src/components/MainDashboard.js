import React from 'react';
import IngredientsPanel from './IngredientsPanel';
import RecipesPanel from './RecipesPanel';
import AiSuggestionsPanel from './AiSuggestionsPanel';
import { supabase } from '../supabaseClient';

// PUBLIC_INTERFACE
function MainDashboard({ user }) {
  const [activePanel, setActivePanel] = React.useState(window.localStorage.getItem('activePanel') ?? 'ingredients');

  // Listen to panel changes in Sidebar
  React.useEffect(() => {
    const handler = () => {
      setActivePanel(window.activePanel || window.localStorage.getItem('activePanel') || 'ingredients');
    };
    window.addEventListener('panelchange', handler);
    return () => window.removeEventListener('panelchange', handler);
  }, []);

  // Logout functionality
  async function logout() {
    await supabase.auth.signOut();
    window.location.reload();
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: 16, marginBottom: 18, justifyContent: 'flex-end' }}>
        <button className="btn" style={{ background: 'var(--secondary-color)', color: '#233', fontWeight: 700 }}
          onClick={logout}
        >Logout</button>
      </div>
      <div>
        {activePanel === 'ingredients' && <IngredientsPanel user={user} />}
        {activePanel === 'recipes' && <RecipesPanel user={user} />}
        {activePanel === 'suggestions' && <AiSuggestionsPanel user={user} />}
      </div>
    </div>
  );
}

export default MainDashboard;
