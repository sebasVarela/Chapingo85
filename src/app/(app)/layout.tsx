import Navbar from "@/components/Navbar";
import { createClient } from "@/lib/supabase/server"; // Import createClient

export default async function AppLayout({ // Make the component async
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient(); // Create Supabase client
  const { data: { user } } = await supabase.auth.getUser(); // Fetch user

  let isProfileComplete = false;

  if (user) {
    // Query active_users table if user exists
    const { data: activeUser, error } = await supabase
      .from('active_users')
      .select('id')
      .eq('id', user.id)
      .single();
    
    // Profile is complete if activeUser is found and no critical error
    // For .single(), error PGRST116 (no rows found) means activeUser will be null, so !!activeUser handles it.
    if (error && error.code !== 'PGRST116') {
      console.error("Error fetching active_user in AppLayout:", error.message);
      // Decide how to handle this error, for now, profile is considered incomplete
      isProfileComplete = false;
    } else {
      isProfileComplete = !!activeUser;
    }
  }

  return (
    <div>
      {isProfileComplete && <Navbar />} {/* Conditionally render Navbar */}
      {children}
    </div>
  );
}