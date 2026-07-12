import { supabase } from '@/lib/supabase/client';

const tables = ['entries', 'goals'];

async function resetSupabase() {
  for (const table of tables) {
    const filter = table === 'entries' ? 'date' : 'created_at';
    const { error } = await supabase.from(table).delete().gte(filter, '1900-01-01'); // delete all rows
    if (error) {
      console.error(`Error deleting from ${table}:`, error.message);
    } else {
      console.log(`✅ Table ${table} cleared`);
    }
  }
}

async function clearLocalStorage() {
  try {
    console.log('ℹ️ Para limpar dados locais no celular, limpe o cache do aplicativo ou reinstale.');
  } catch (e) {
    console.error('Error clearing local storage', e);
  }
}

async function main() {
  console.log('🔧 Starting reset...');
  await resetSupabase();
  await clearLocalStorage();
  console.log('✅ Reset completed');
}

main();
