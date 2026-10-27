# Poland pilot launch — 26 October 2026

## Inventory reconciliation

- 60 active videos: Mroczne Dziedzictwo 20, Ukryty Testament 20, Za Zamkniętymi Drzwiami 20.
- 3 already published and 57 awaiting publication; the queue badge is 57, not total inventory.
- 17 files named Behind_Estate_Gates_batch_1792653964370_* were previously unassigned and unscheduled. They were moved into reversible metadata archive, not deleted. Open Kho video → Kho lưu trữ to recover them.
- Sekrety Rodziny and Gorzkie Dziedzictwo currently have zero videos. Their slots and Studio links are ready, but no fake/reserved jobs were created without media.

## Configured daily slots

| Page | Warsaw local slots | Current VN equivalents |
| --- | --- | --- |
| Mroczne Dziedzictwo | 06:30, 09:30, 12:30, 16:00, 19:00 | 12:30, 15:30, 18:30, 22:00, 01:00 +1d |
| Ukryty Testament | 06:35, 09:35, 12:35, 16:05, 19:05 | 12:35, 15:35, 18:35, 22:05, 01:05 +1d |
| Sekrety Rodziny | 06:40, 09:40, 12:40, 16:10, 19:10 | 12:40, 15:40, 18:40, 22:10, 01:10 +1d |
| Za Zamkniętymi Drzwiami | 06:45, 09:45, 12:45, 16:15, 19:15 | 12:45, 15:45, 18:45, 22:15, 01:15 +1d |
| Gorzkie Dziedzictwo | 06:50, 09:50, 12:50, 16:20, 19:20 | 12:50, 15:50, 18:50, 22:20, 01:20 +1d |

These are the user's latest chosen experimental windows, replacing both earlier proposals. They are not Page-specific insights or a guarantee of reach. Five-minute staggering spreads jobs but does not guarantee exemption from spam enforcement. Sources differ: Buffer favors mornings, while Sprout Social highlights midday/evening windows.

All 57 pending jobs were regenerated with Europe/Warsaw and applied through the existing local API, preserving IDs, ownership, filenames, captions/comments and published history. First pending job: 26 October 2026 12:30 VN / 06:30 Warsaw. Existing pending jobs are at least five minutes apart, with no past-due jobs at audit time.

VN is six hours ahead during the current Polish winter time. Page slot settings remain VN clock slots; adjust these saved recurring VN slots by one hour when Poland returns to summer time if retaining the same Warsaw windows. The current finite queued jobs were calculated with timezone-aware conversion.

## End-to-end readiness

- Publisher 3030 and Studio 3020 healthy; Publisher LaunchAgent registered.
- Five Page tokens passed read-only identity verification. This does not substitute for a new end-to-end real publication test.
- All five Studio links enabled, mapped by immutable Page IDs, matching names, recent sync and no errors.
- 60 media files present, matching stored hashes; all have caption and Comment 1.
- Completed whole Studio batches import automatically on the next 10-second bridge cycle. They must target the correct Page (not free mode), use PL locale and have captions. Nothing transfers until the whole batch is completed.
- Files are routed only to the matching Page and queued in filename sequence at future free slots. Other manual Studio Pages remain untouched.
- Publishing uses internal slots: only when due does the worker upload/publish through Meta. No Facebook scheduled_publish_time is used.
- Telegram publication notifications occur only after Meta confirms publication; Comment 1 is sent after publication. Rendering, failed reports and inventory alerts are separate event types.
- No additional Facebook test post was created during this audit. Read-only live checks plus isolated mocked publishing/bridge tests were used.
- Keep the Mac powered on, awake and connected; browser tabs need not remain open. These local workers do not run on a powered-off Mac.

## Research references

- https://buffer.com/resources/best-time-to-post-on-facebook/
- https://sproutsocial.com/insights/best-times-to-post-on-facebook/
- https://napoleoncat.com/pl/blog/kiedy-publikowac-na-facebooku/
