import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  'https://cthjmezdhqbmmzomgybf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN0aGptZXpkaHFibW16b21neWJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU4NDQ5NDYsImV4cCI6MjA5MTQyMDk0Nn0.mOQLS5ZOUU-Z1eXwxMmevhBGcGu_3Y5H59Ta-3um2fM'
);

async function run() {
  const { data: cases, error } = await supabase.from('cases').select('*');
  if (error) {
    console.error(error);
    return;
  }
  
  const stabilityCases = cases.filter(c => c.title && c.title.toLowerCase().includes('stability test case'));
  const stabilityCase = stabilityCases.length > 0 ? stabilityCases[0] : null;
  
  let casesToKeep = [];
  if (stabilityCase) {
    casesToKeep.push(stabilityCase.id);
    console.log("Found Stability Test Case with ID:", stabilityCase.id);
  } else {
    console.log("WARNING: Stability Test Case not found!");
  }
  
  for (const c of cases) {
    if (casesToKeep.length >= 4) break;
    if (!casesToKeep.includes(c.id)) {
      casesToKeep.push(c.id);
    }
  }
  
  const casesToDelete = cases.filter(c => !casesToKeep.includes(c.id)).map(c => c.id);
  console.log(`Found ${cases.length} cases. Keeping ${casesToKeep.length} cases. Deleting ${casesToDelete.length} cases.`);
  
  if (casesToDelete.length > 0) {
    const { error: deleteError } = await supabase.from('cases').delete().in('id', casesToDelete);
    if (deleteError) {
      console.error(deleteError);
    } else {
      console.log("Successfully deleted cases.");
    }
  } else {
    console.log("No cases to delete.");
  }
}
run();
