const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = "https://gdewlrkifkgeuwouzzhq.supabase.co";
const supabaseKey = "sb_publishable_jpyVBd_x_4yLqZ2i0VjeoQ_RR0164Y0";
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log("Testing Supabase connection...");
  
  console.log("\n--- Querying 'journeys' ---");
  const { data: journeys, error: journeysError } = await supabase.from('journeys').select('*').limit(1);
  console.log("journeys result:", journeys);
  console.log("journeys error:", journeysError);

  console.log("\n--- Querying 'entries' ---");
  const { data: entries, error: entriesError } = await supabase.from('entries').select('*').limit(1);
  console.log("entries result:", entries);
  console.log("entries error:", entriesError);

  console.log("\n--- Querying 'goals' ---");
  const { data: goals, error: goalsError } = await supabase.from('goals').select('*').limit(1);
  console.log("goals result:", goals);
  console.log("goals error:", goalsError);
}

test();
