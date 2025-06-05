import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

function RecipesPanel({ user }) {
  const [recipes, setRecipes] = useState([]);
  const [userIngredients, setUserIngredients] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [filterExact, setFilterExact] = useState(true);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  // Fetch user's ingredients on load
  useEffect(() => {
    async function fetchUserIngredients() {
      const { data } = await supabase.from('ingredients').select('name').eq('user_id', user.id);
      setUserIngredients((data ?? []).map(i => i.name.toLowerCase()));
    }
    fetchUserIngredients();
  }, [user]);

  // Fetch all recipes
  useEffect(() => {
    async function fetchRecipes() {
      const { data } = await supabase.from('recipes').select('*').order('created_at', { ascending: false });
      setRecipes(data ?? []);
    }
    fetchRecipes();
  }, [showAdd]);

  // PUBLIC_INTERFACE
  // Add a new recipe
  async function handleAddRecipe(r) {
    const { error } = await supabase.from('recipes').insert([
      { name: r.name, ingredients: r.ingredients, instructions: r.instructions }
    ]);
    if (!error) setShowAdd(false);
    // recipes refetch on showAdd update
  }

  // Filter recipes: If filterExact, user must have ALL required, else show if the user has at least one required
  const filtered = recipes.filter(r => {
    const ingrArr = (r.ingredients || '').split(',').map(s => s.trim().toLowerCase()).filter(Boolean);
    if (filterExact) {
      return ingrArr.every(i => userIngredients.includes(i));
    } else {
      return ingrArr.some(i => userIngredients.includes(i));
    }
  });

  return (
    <div>
      <h2>Recipes</h2>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <button
          className="btn"
          onClick={() => setShowAdd(x => !x)}
          style={{ background: 'var(--primary-color)', color: '#233', fontWeight: 600 }}
        >{showAdd ? 'Cancel' : 'Add Recipe'}</button>
        <label style={{ alignSelf: 'center', fontSize: 15, color: '#555' }}>
          <input
            type="checkbox"
            checked={filterExact}
            onChange={e => setFilterExact(e.target.checked)}
            style={{ marginRight: 6 }}
          />
          Show only recipes I can make with all my ingredients
        </label>
      </div>
      {showAdd && (
        <RecipeForm
          onAdd={handleAddRecipe}
          onCancel={() => setShowAdd(false)}
        />
      )}
      <div style={{ marginTop: 8 }}>
        {filtered.length === 0 ? (
          <div style={{ color: '#999', fontSize: 15 }}>No matching recipes found for your ingredients.</div>
        ) : (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px,1fr))', gap: 18
          }}>
            {filtered.map(r =>
              <RecipeCard key={r.id} recipe={r} onClick={() => setSelectedRecipe(r)} />
            )}
          </div>
        )}
      </div>
      {selectedRecipe && (
        <div
          style={{
            position: 'fixed', zIndex: 10, left: 0, top: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.15)', display: 'flex', justifyContent: 'center', alignItems: 'center'
          }}
          onClick={() => setSelectedRecipe(null)}
        >
          <div
            style={{
              background: 'white', color: '#222', borderRadius: 12, padding: 28, maxWidth: 370, minWidth: 270,
              boxShadow: '0 2px 26px #b0f7b299', position: 'relative'
            }}
            onClick={e => e.stopPropagation()}
          >
            <h3 style={{ color: 'var(--primary-color)', marginTop: 0, fontSize: 23 }}>{selectedRecipe.name}</h3>
            <h4 style={{ margin: '8px 0 2px 0', fontSize: 17 }}>Ingredients:</h4>
            <ul>
              {(selectedRecipe.ingredients || '').split(',').map((i, idx) => (
                <li key={idx} style={{ fontSize: 15, marginBottom: 2 }}>{i.trim()}</li>
              ))}
            </ul>
            <h4 style={{ margin: '14px 0 4px 0', fontSize: 16 }}>Instructions:</h4>
            <div style={{ fontSize: 15, color: '#232' }}>
              {selectedRecipe.instructions}
            </div>
            <button
              onClick={() => setSelectedRecipe(null)}
              style={{
                position: 'absolute', top: 12, right: 15, background: 'none', border: 'none',
                fontSize: 22, color: '#b0f7b2', cursor: 'pointer'
              }}
              aria-label="Close"
            >✕</button>
          </div>
        </div>
      )}
    </div>
  );
}

// PUBLIC_INTERFACE
function RecipeForm({ onAdd, onCancel }) {
  const [name, setName] = useState('');
  const [ingredients, setIngredients] = useState('');
  const [instructions, setInstructions] = useState('');
  const [err, setErr] = useState('');

  function submit(e) {
    e.preventDefault();
    setErr('');
    if (!name.trim() || !ingredients.trim() || !instructions.trim()) {
      setErr('All fields required');
      return;
    }
    onAdd({ name: name.trim(), ingredients: ingredients.trim(), instructions: instructions.trim() });
  }

  return (
    <form onSubmit={submit} style={{
      background: '#f7e992', padding: 18, borderRadius: 9, marginBottom: 15, boxShadow: '0 2px 10px #ccc', color: '#222'
    }}>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          placeholder="Recipe Name"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ flex: 1, padding: 9, borderRadius: 6, fontSize: 15, border: '1px solid #bbb' }}
        />
        <button type="submit" className="btn" style={{
          background: 'var(--primary-color)', color: '#233', fontWeight: 700, fontSize: 15
        }}>Save</button>
      </div>
      <input
        placeholder="Ingredients (comma separated)"
        value={ingredients}
        onChange={e => setIngredients(e.target.value)}
        style={{ width: '100%', margin: '11px 0', padding: 8, borderRadius: 6, fontSize: 15, border: '1px solid #bbb' }}
      />
      <textarea
        placeholder="Instructions (step by step, optional numbering)"
        minLength={10}
        rows={3}
        value={instructions}
        onChange={e => setInstructions(e.target.value)}
        style={{ width: '100%', marginBottom: 10, padding: 8, borderRadius: 6, fontSize: 15, border: '1px solid #bbb', resize: 'vertical' }}
      />
      {err && <div style={{ color: 'red', fontSize: 13 }}>{err}</div>}
      <button type="button" onClick={onCancel} style={{
        background: 'var(--secondary-color)', color: '#233', marginTop: 8, border: 'none', borderRadius: 5, fontWeight: 600, fontSize: 14, cursor: 'pointer', padding: '5px 15px'
      }}>Cancel</button>
    </form>
  );
}

function RecipeCard({ recipe, onClick }) {
  return (
    <div
      style={{
        background: 'var(--accent-color)', color: '#333', borderRadius: 12,
        boxShadow: '0 2px 12px #faeb7255', padding: 18, cursor: 'pointer'
      }}
      onClick={onClick}
      tabIndex={0}
      aria-label={recipe.name}
    >
      <h4 style={{ margin: '0 0 8px 0', color: 'var(--primary-color)' }}>{recipe.name}</h4>
      <div style={{ fontSize: 15 }}><span style={{ fontWeight: 500 }}>Ingredients:</span> <span>{recipe.ingredients}</span></div>
      <div style={{ fontSize: 15, marginTop: 11, color: '#463', fontWeight: 500 }}>Tap for details</div>
    </div>
  );
}

export default RecipesPanel;
