# Supabase RLS Apply Checklist

Use this checklist before applying `backend/supabase/migrations/0003_auth_rbac_rls.sql` to a Supabase project. Do not apply `0003` until the owner bootstrap steps are complete.

## Order

1. Apply `backend/supabase/migrations/0001_the_poles_core.sql` first.
2. Apply `backend/supabase/migrations/0002_profile_auth_columns.sql`.
3. Confirm the flexible entity tables exist, including `profiles`, `match_entries`, and `user_match_entities`.
4. Confirm `public.profiles` has typed `auth_user_id`, `email`, and `role` columns.
5. Create or authenticate the Supabase Auth user that will be the initial owner.
6. Verify `OWNER_EMAIL` matches that owner's Supabase Auth email exactly for the target environment.
7. Create or verify the matching `public.profiles` row before enabling production RLS:
   - `auth_user_id` is the owner's `auth.users.id`
   - `email` is the owner's Supabase Auth email
   - `role` is `owner`
8. Repair legacy rows that only identify users by email before relying on user self-access. Prefer `auth_user_id`, `user_id`, `created_by`, or `profile_id`.
9. Apply `backend/supabase/migrations/0003_auth_rbac_rls.sql`.
10. Test normal authenticated user access:
   - The user can read and update their own profile.
   - The user can manage owned `match_entries` rows.
   - The user can manage owned `user_match_entities` rows.
   - The user cannot manage rows owned by another user.
11. Test owner/admin access:
   - Owner can manage profiles.
   - Owner/admin can manage affiliate tables.
   - Owner/admin can manage `match_entries` and `user_match_entities`.

## Notes

`0002_profile_auth_columns.sql` is intentionally not an RLS migration. It exists so `/api/auth/me` can create and bootstrap the owner profile before RLS is enforced.

The current backend may use a Supabase service role key for server-side data access, which bypasses RLS. If it is configured with only an anon key, backend requests will not automatically run with the request user's JWT until backend runtime auth propagation is implemented.

Keep a SQL/service-role recovery path available while applying and testing `0003`, because missing owner bootstrap data can lock normal authenticated users out of owner/admin-managed rows.
