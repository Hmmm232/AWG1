// Handles that would shadow application routes or invite impersonation.
// Profile pages live at /[handle] (and lists at /[handle]/[slug]), so a
// handle matching a real route would be unreachable or break the app.
// Keep in sync with the handle_not_reserved DB constraint in
// supabase/migration_hardening.sql.
export const RESERVED_HANDLES = new Set([
  // actual routes
  '404',
  'about',
  'admin',
  'api',
  'explore',
  'index',
  'lookup',
  'privacy',
  'reset-password',
  'saved',
  'search',
  'settings',
  'signin',
  'signup',
  'sitemap',
  'terms',
  'update-password',
  // likely future routes / infrastructure
  'account',
  'app',
  'auth',
  'blog',
  'docs',
  'feed',
  'help',
  'home',
  'login',
  'logout',
  'mail',
  'new',
  'news',
  'quotes',
  'rss',
  'static',
  'status',
  'support',
  'www',
  // impersonation-prone
  'awalledgarden',
  'moderator',
  'official',
  'root',
  'staff',
  'team',
]);

export function isReservedHandle(handle) {
  return RESERVED_HANDLES.has((handle || '').toLowerCase());
}
