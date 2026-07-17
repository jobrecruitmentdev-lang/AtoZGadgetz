'use client';
import { useAuth } from "@/components/auth/AuthContext";
import { RevealOnScroll } from "@/components/motion/RevealOnScroll";
import { MagneticButton } from "@/components/motion/MagneticButton";

export default function AccountProfilePage() {
  const { user, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return (
    <div className="space-y-8">
      <RevealOnScroll>
        <h2 className="text-2xl font-bold mb-6">Profile Details</h2>
        <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6 lg:p-8">
          <form className="space-y-6 max-w-lg">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">First Name</label>
                <input type="text" defaultValue={user.first_name} className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-background" />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Last Name</label>
                <input type="text" defaultValue={user.last_name} className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-background" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" defaultValue={user.email} disabled className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-background/50 text-muted cursor-not-allowed" />
              <p className="text-xs text-muted mt-1">To change your email, please contact support.</p>
            </div>
            <div className="pt-4">
              <MagneticButton className="bg-foreground text-background px-6 py-2 rounded-md font-medium hover:bg-accent transition-colors">
                <span className="block text-center">Save Changes</span>
              </MagneticButton>
            </div>
          </form>
        </div>
      </RevealOnScroll>

      <RevealOnScroll delay={0.1}>
        <h2 className="text-2xl font-bold mb-6">Change Password</h2>
        <div className="bg-surface border border-black/5 dark:border-white/5 rounded-2xl p-6 lg:p-8">
          <form className="space-y-6 max-w-lg">
            <div>
              <label className="block text-sm font-medium mb-1">Current Password</label>
              <input type="password" required className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-background" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">New Password</label>
              <input type="password" required className="w-full px-4 py-2 rounded-md border border-gray-200 dark:border-gray-800 bg-background" />
            </div>
            <div className="pt-4">
              <MagneticButton className="bg-foreground text-background px-6 py-2 rounded-md font-medium hover:bg-accent transition-colors">
                <span className="block text-center">Update Password</span>
              </MagneticButton>
            </div>
          </form>
        </div>
      </RevealOnScroll>
    </div>
  );
}
