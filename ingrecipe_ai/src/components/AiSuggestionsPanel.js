import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

// PUBLIC_INTERFACE
function AiSuggestionsPanel({ user }) {
  const [ingredients, setIngredients] = useState([]);
  const [suggestions, setSuggestions] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    async function fetchIngredients() {
      const { data } = await supabase.from('ingredients').select('name').eq('user_id', user.id);
      setIngredients((data ?? []).map(i => i.name));
    }
    fetchIngredients();
  }, [user]);

  // PUBLIC_INTERFACE
  // Sends prompt to OpenAI API or demo endpoint
  async function fetchSuggestions() {
    setSuggestions('');
    setLoading(true);
    setErr('');
    try {
      // For demo, use OpenAI public endpoint or replace with your own
      const prompt = `I have these ingredients: ${ingredients.join(', ')}. Suggest some creative recipes or meal ideas. Output should be a list.`;
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer sk-demo-your-key" // <-- CHANGE TO REAL KEY
        },
        body: JSON.stringify({
          model: "gpt-3.5-turbo",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        })
      });
      if (!response.ok) {
        throw new Error('Error contacting AI service');
      }
      const data = await response.json();
      const aiIdea = data.choices?.[0]?.message?.content ?? 'No suggestions found.';
      setSuggestions(aiIdea);
    } catch (e) {
      setErr('There was an error retrieving suggestions. Please check your OpenAI API key.');
    }
    setLoading(false);
  }

  return (
    <div>
      <h2>AI Recipe Suggestions</h2>
      <div style={{ marginBottom: 17, color: '#666', fontSize: 15 }}>
        Get creative meal ideas using your current ingredients!
      </div>
      <div style={{ background: '#f7f7f7', borderRadius: 12, padding: 18, boxShadow: '0 1px 7px #b0f7b222' }}>
        <div style={{ marginBottom: 15 }}>
          <span style={{ fontWeight: 500 }}>Your current ingredients:</span> {ingredients.join(', ') || <span style={{ color: '#aaa' }}>None entered</span>}
        </div>
        <button
          className="btn"
          style={{
            background: 'var(--primary-color)', color: '#233', fontWeight: 700, marginBottom: 8
          }}
          onClick={fetchSuggestions}
          disabled={loading || ingredients.length === 0}
        >
          {loading ? 'Getting ideas...' : 'Get Suggestions'}
        </button>
        {err && <div style={{ color: 'red', fontSize: 14, marginTop: 7 }}>{err}</div>}
        {suggestions && (
          <div style={{ marginTop: 13, background: '#fff', borderRadius: 8, padding: 14, color: '#222', fontSize: 15 }}>
            <div dangerouslySetInnerHTML={{ __html: suggestions.replace(/\n/g, '<br/>') }} />
          </div>
        )}
      </div>
      <div style={{ marginTop: 19, fontSize: 13, color: '#473' }}>This is powered by OpenAI (requires a valid API key in code).</div>
    </div>
  );
}

export default AiSuggestionsPanel;
