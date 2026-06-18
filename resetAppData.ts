import { supabase } from '@/lib/supabase/client';

// List of tables to clean up
const tables = ['goals', 'lancamentos', 'jornadas'];

async function resetSupabase() {
  for (const table of tables) {
    const { error } = await supabase.from(table).delete().neq('id', '0'); // delete all rows
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
