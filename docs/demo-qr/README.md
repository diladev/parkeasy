# Demo QR signs

Printable entrance signs for the demo parking lots that `npm run seed` creates.
Open one on another screen (or print it) and scan it with **Home → Scan QR**:
the app opens that lot, ready to book.

Each code holds `parkeasy://lot/<id>`. The number under it ("Lot code 1") can be
typed in instead, with **Enter lot code** on the scanner (handy on the iOS
Simulator, which has no camera).

| Sign | Lot |
|---|---|
| `lot-1.png` | City Center Parking |
| `lot-2.png` | Azadi Park Garage |
| `lot-3.png` | Bakhtiari Plaza Parking |
| `lot-4.png` | Sarchinar Night Parking |
| `lot-5.png` | Old Bazaar Parking |
| `lot-7.png` | Citadel Parking |

Lot 6 (Tasluja Road Parking) is a removed lot in the demo data, so it has no sign.
The ids match a freshly seeded database.
