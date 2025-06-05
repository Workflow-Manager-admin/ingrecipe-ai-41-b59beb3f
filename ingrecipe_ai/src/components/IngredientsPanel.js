import React from 'react';
import { supabase } from '../supabaseClient';

// PUBLIC_INTERFACE
function IngredientsPanel({ user }) {
  const [ingredients, setIngredients] = React.useState([]);
  const [input, setInput] = React.useState('');
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(true);

  async function fetchIngredients() {
    setLoading(true);
    const { data, error } = await supabase
      .from('ingredients')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setIngredients(data ?? []);
    setError(error?.message || '');
    setLoading(false);
  }

  React.useEffect(() => {
    fetchIngredients();
    // eslint-disable-next-line
  }, []);

  async function addIngredient(e) {
    e.preventDefault();
    setError('');
    const value = input.trim();
    if (!value) return;
    const { error } = await supabase
      .from('ingredients')
      .insert([{ name: value, user_id: user.id }]);
    if (error) { setError(error.message); return; }
    setInput('');
    fetchIngredients();
  }

  async function deleteIngredient(id) {
    await supabase.from('ingredients').delete().eq('id', id).eq('user_id', user.id);
    fetchIngredients();
  }

  async function updateIngredient(id, newName) {
    if (!newName.trim()) return;
    await supabase.from('ingredients').update({ name: newName.trim() }).eq('id', id).eq('user_id', user.id);
    fetchIngredients();
  }

  return (
    <div>
      <h2>My Ingredients</h2>
      <form style={{ display: 'flex', gap: 8, marginBottom: 16 }} onSubmit={addIngredient}>
        <input
          type="text"
          placeholder="e.g., tomato"
          value={input}
          onChange={e => setInput(e.target.value)}
          style={{ flex: 1, padding: 9, borderRadius: 6, border: '1px solid #ccc', fontSize: 15 }}
        />
        <button type="submit" className="btn" style={{
          background: 'var(--primary-color)', color: '#233', fontWeight: 600
        }}>Add</button>
      </form>
      {error && <div style={{ color: 'red', fontSize: 14, marginBottom: 12 }}>{error}</div>}
      {loading ? <div>Loading...</div> : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {ingredients.length === 0 && <li style={{ color: '#aaa' }}>No ingredients found.</li>}
          {ingredients.map(ingr =>
            <IngredientItem
              key={ingr.id}
              ingredient={ingr}
              onDelete={() => deleteIngredient(ingr.id)}
              onUpdate={updateIngredient}
            />
          )}
        </ul>
      )}
    </div>
  );
}

function IngredientItem({ ingredient, onDelete, onUpdate }) {
  const [edit, setEdit] = React.useState(false);
  const [val, setVal] = React.useState(ingredient.name);

  function handleEdit(e) {
    e.preventDefault();
    onUpdate(ingredient.id, val);
    setEdit(false);
  }

  return (
    <li style={{
      display: 'flex', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid #f5f5f5', gap: 10
    }}>
      {edit ? (
        <form onSubmit={handleEdit} style={{ display: 'flex', gap: 8, flex: 1 }}>
          <input
            value={val}
            onChange={e => setVal(e.target.value)}
            style={{
              padding: 7, border: '1px solid #bbb', borderRadius: 5, fontSize: 15, flex: 1
            }}
            autoFocus
          />
          <button type="submit" style={{
            background: 'var(--primary-color)', border: 'none', color: '#233', borderRadius: 4, fontWeight: 600, cursor: 'pointer', padding: '3px 9px'
          }}>✅</button>
          <button type="button" style={{
            background: '#eee', border: 'none', color: '#555', borderRadius: 4, fontWeight: 600, cursor: 'pointer', padding: '3px 7px'
          }} onClick={() => { setEdit(false); setVal(ingredient.name); }}>✕</button>
        </form>
      ) : (
        <>
          <span style={{ flex: 1 }}>{ingredient.name}</span>
          <button
            style={{
              background: 'none', border: 'none', color: '#e34444', fontSize: 17, cursor: 'pointer', marginRight: 4
            }}
            onClick={onDelete}
            aria-label="Delete"
          >🗑️</button>
          <button
            style={{ background: 'none', border: 'none', color: '#999', fontSize: 17, cursor: 'pointer' }}
            onClick={() => setEdit(true)}
            aria-label="Edit"
          >✏️</button>
        </>
      )}
    </li>
  );
}

export default IngredientsPanel;
