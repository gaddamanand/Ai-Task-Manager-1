import { currentUser } from '@clerk/nextjs/server';
import { query } from '@/db';

export async function syncClerkUserToDb() {
  try {
    const user = await currentUser();
    if (!user) {
      console.log('[Clerk Sync] No user found');
      return null;
    }

    const { id, emailAddresses, firstName, lastName, imageUrl } = user;
    const email = emailAddresses?.[0]?.emailAddress || '';
    const name = [firstName, lastName].filter(Boolean).join(' ');

    const result = await query(
      `INSERT INTO users (id, email, name, image_url)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (id) DO UPDATE SET email = $2, name = $3, image_url = $4`,
      [id, email, name, imageUrl]
    );
    console.log('[Clerk Sync] User synced to DB:', { id, email, name, imageUrl });
    return { id, email, name, imageUrl };
  } catch (error) {
    console.error('[Clerk Sync] Error syncing user:', error);
    return null;
  }
}
