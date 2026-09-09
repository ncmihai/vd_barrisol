# Future self-hosting

The beta stays on Vercel, Neon and Digi. The planned owner-operated server has 6 CPU cores and 12 GB RAM. Confirm the actual OS, disks, upstream bandwidth, public IP/CGNAT, backup destination and operator before scheduling a move.

## Separate reversible stages

1. Move only the Node application first. Use Node 22, `npm ci`, `npm run build` and a supervised `npm run start`. Put HTTPS termination and request-size limits in a reverse proxy. Keep Neon and Digi unchanged. Keep Vercel ready for rollback.
2. Validate public pages, locale metadata, Payload login/editing, SQL rate limits, notification persistence, cache invalidation and restart behavior. Set `VDB_ANALYTICS=0` outside Vercel. Test realistic image traffic and concurrent admin edits, and record CPU/RAM/latency before changing DNS.
3. Move media in a separate window. Implement the new provider behind the existing storage boundary, including upload/read/delete/variants. Preserve existing Digi metadata until every asset has a verified copy. Copy first, compare counts and checksums, switch reads, monitor and retain the original for a rollback window. Never rename `digiStoragePath` blindly.
4. Move Postgres last, only if desired. Back up off-machine and prove a restore. Plan for enquiries received during cutover, connection-string change, row counts, migration history, role permissions and reconciliation before disabling Neon writes.

## Before DNS changes

- Test reachability from outside the local network, HTTPS renewal and server restart.
- Configure bounded processes, private database access, persistent storage and off-machine backups.
- Prove restoration on a separate database and test rollback with the previous application revision.
- Verify failed notification handling and public-data outage behavior.
- Monitor error rate, latency, disk space and backup age.
- Do not call this migration complete until the actual hardware passes these checks.
