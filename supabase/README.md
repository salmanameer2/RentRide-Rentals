# Rent Rides — Supabase Database Architecture & Security Foundation

This directory houses the PostgreSQL database schema, migrations, security triggers, and Row Level Security (RLS) policies powering the **Rent Rides** car rental platform.

---

## 1. Schema Overview & Tables

The database consists of 4 primary application tables in the `public` schema, integrated with Supabase's `auth.users` and `storage.buckets`:

| Table | Primary Key | Description |
| :--- | :--- | :--- |
| `profiles` | `id` (uuid -> `auth.users.id`) | Stores customer and admin profiles, contact info, and security role. |
| `cars` | `id` (uuid) | Master vehicle fleet catalog, technical specs, pricing, and active listing status. |
| `bookings` | `id` (uuid) | Rental reservations linking customers to vehicles with pricing snapshots and date ranges. |
| `contact_submissions` | `id` (uuid) | Public inquiries, customer contact requests, and support queries. |

---

## 2. Entity Relationships

```text
auth.users (Supabase Auth)
    │
    ▼ (1:1 ON DELETE CASCADE via automated trigger)
public.profiles
    │
    ├── (1:N ON DELETE RESTRICT) ──► public.bookings (user_id)
                                          │
public.cars ◄─────────────────────────────┘ (1:N ON DELETE RESTRICT via car_id)
```

- **Delete Protection (`ON DELETE RESTRICT`)**: Deleting a vehicle or profile is prohibited if it has associated historical booking records, ensuring audit trails and financial records remain intact.

---

## 3. Role System & Privilege Escalation Defense

User roles are strictly enforced at the database layer:
- **`customer`**: Default role for all newly registered accounts.
- **`admin`**: Full administrative access (fleet management, booking approvals, inquiry handling, storage uploads).

### Protection Mechanisms:
1. **Default Assignment**: The `handle_new_user()` trigger on `auth.users` automatically provisions the profile row with `role = 'customer'`.
2. **Anti-Escalation Trigger**: `protect_profile_role()` inspects all `UPDATE` statements on `profiles`. If any non-admin attempts to modify `role`, the transaction aborts with an exception.
3. **RLS Policy Isolation**: Role checks use `public.is_admin()`, a `SECURITY DEFINER` function with isolated `search_path` to eliminate recursive RLS loop vulnerabilities.

---

## 4. Booking Integrity & Overlap Protection

### A. Atomic Date-Range Overlap Exclusion (`btree_gist`)
Overlapping reservations are blocked directly by the PostgreSQL engine using a GiST exclusion constraint:
```sql
CONSTRAINT no_overlapping_active_bookings EXCLUDE USING gist (
    car_id WITH =,
    daterange(start_date, end_date, '[]') WITH &&
)
WHERE (status IN ('pending', 'confirmed'));
```
- **Inclusive Range (`'[]'`)**: Prevents race conditions and double-bookings during pending review or confirmed reservations.
- **Cancelled/Rejected Exemption**: Once a booking is cancelled or rejected, its date range is automatically freed for other renters.

### B. Rental Day Convention
- Standard inclusive calendar days:
  $$\text{total\_days} = (\text{end\_date} - \text{start\_date}) + 1$$
  - Example: `2026-10-01` to `2026-10-01` = 1 day.
  - Example: `2026-10-01` to `2026-10-03` = 3 days.

### C. Authoritative Pricing Snapshots
- The `validate_and_price_booking()` trigger queries `cars.price_per_day` server-side, overrides any untrusted client calculations, and freezes the daily rate snapshot on the booking record.
- Calculates: `total_price = total_days * price_per_day`.

### D. Booking Status Lifecycle
Allowed values: `pending`, `confirmed`, `rejected`, `cancelled`, `completed`.
- Newly submitted customer bookings always begin as `pending`.
- Only platform administrators can transition bookings to `confirmed`, `rejected`, or `completed`.
- Customers may only transition their own bookings to `cancelled`.

---

## 5. Vehicle Availability Model

- **`cars.is_available`**: Represents whether a vehicle is actively listed in the catalog (i.e. not retired or undergoing maintenance).
- **Date-Specific Availability**: Determined dynamically via:
  - `public.is_car_available(p_car_id, p_start_date, p_end_date)`
  - `public.get_available_cars(p_start_date, p_end_date, p_category)`
- A vehicle booked from June 10 to June 15 is unavailable for those dates, but remains immediately bookable for June 16 onwards.

---

## 6. Row Level Security (RLS) Matrix

| Table | Operation | Public / Anon | Customer (Authenticated) | Admin |
| :--- | :--- | :--- | :--- | :--- |
| `profiles` | SELECT | ❌ Denied | Own record (`auth.uid() = id`) | All records |
| `profiles` | UPDATE | ❌ Denied | Own record (cannot edit `role`) | All records |
| `cars` | SELECT | Active only (`is_available = true`) | Active only | All records |
| `cars` | INSERT / UPDATE / DELETE | ❌ Denied | ❌ Denied | Allowed |
| `bookings` | SELECT | ❌ Denied | Own bookings (`user_id = auth.uid()`) | All bookings |
| `bookings` | INSERT | ❌ Denied | Own bookings (`user_id = auth.uid()`, strictly non-admin) | ❌ Denied (separated from customer workflow) |
| `bookings` | UPDATE | ❌ Denied | Own bookings (cancellation only, pending/confirmed) | All bookings (follows strict state transitions) |
| `bookings` | DELETE | ❌ Denied | ❌ Denied | Allowed |
| `contact_submissions` | INSERT | Allowed | Allowed | Allowed |
| `contact_submissions` | SELECT / UPDATE / DELETE | ❌ Denied | ❌ Denied | Allowed |

---

## 7. Storage Configuration (`car-images`)

- **Bucket Name**: `car-images`
- **Visibility**: Public read access so fleet images can be served directly to web visitors.
- **Allowed MIME Types**: `image/jpeg`, `image/png`, `image/webp` (SVG strictly disallowed to prevent XSS attacks).
- **Max File Size**: 5 MB.
- **Write Access**: Restricted exclusively to administrators via uniquely scoped RLS policies on `storage.objects`:
  - `car_images_public_read`
  - `car_images_admin_insert`
  - `car_images_admin_update`
  - `car_images_admin_delete`

---

## 8. Migration Files & Execution

1. `20260920000000_initial_schema.sql` — Base tables, indexes, triggers, initial RLS, and vehicle catalog seeds.
2. `20260920010000_phase_3_1_database_hardening.sql` — Security audit hardening:
   - Inactive car booking prevention (`is_available = true` check).
   - Past start date prevention for customer bookings.
   - Admin/customer booking creation separation (`NOT is_admin()` on customer INSERT policy).
   - Preservation of historical price snapshots during updates.
   - Enforced formal booking status state machine (terminal states and permitted transitions).
   - Removal of SVG MIME type from car-images bucket.
   - Scoped storage policy names to eliminate naming collisions.
3. `20260920020000_phase_3_1_final_corrections.sql` — Targeted edge-case corrections:
   - Admin vehicle reassignment (`car_id` change): verifies new car exists and is active, takes fresh price snapshot from new car, recalculates `total_days` and `total_price`.
   - Strict preservation of historical price snapshots when `car_id` is unchanged.
   - Guard against moving any booking to an inactive/unlisted car.
   - Safely re-scoped storage policies solely for `car-images`.

### Execution:
```bash
# Via Supabase CLI:
supabase db push

# Or run all three files in sequential order in the Supabase Web SQL Editor.
```

---

## 9. Admin Promotion Instructions (For Phase 4)

> **IMPORTANT**: No admin account is created or seeded in Phase 3. Authentication will be implemented in Phase 4.

Once you have signed up with your personal account in Phase 4, you can promote your user to an administrator using either of the following methods:

### Via SQL Editor:
```sql
UPDATE public.profiles
SET role = 'admin'
WHERE email = 'YOUR_REGISTERED_EMAIL@example.com';
```

### Via Supabase Table Editor:
1. Go to **Table Editor** -> `profiles`.
2. Locate your user record.
3. Change the `role` cell from `customer` to `admin`.
4. Click **Save**.
