# Fixes and additions to the birthday gift app

Only the areas below change. The look, the theme, the animations and the
existing steps of the birthday experience stay as they are.

## 1. Typing bug (keyboard closing after every letter)

Root cause found: in the gift editor, the "Section" block that wraps each group
of fields is created fresh on every keystroke, so React throws away the text
box and builds a new one each time — which is exactly why the field loses focus
and the phone keyboard closes.

Fix: define that wrapper once, outside the form, so the same text box stays
alive while typing. No `autoFocus` workaround. This covers every field in the
editor (name, nickname, messages, notes, final message, hidden message).

## 2. Personal messages, one per screen

The birthday experience currently shows the main message and all extra notes
stacked on one screen. Instead:

- Each message becomes its own full screen: main message first, then each extra
  note in order.
- Navigation: Previous / Next buttons, horizontal swipe on phones, and a
  counter such as `1 / 3`.
- Previous is disabled on the first message; Next on the last message moves on
  to Memories (or to the hidden surprise / final message when there are no
  photos, as today).
- Each message sits inside a clear frame. Short text shows in full; very long
  text scrolls inside the frame only. No clipping, no sideways scrolling.

## 3. Sequence unchanged

Beginning → Countdown → Celebration → Happy Birthday → Personal messages one by
one → Memories → Hidden surprise → Final message / Final moment. Nothing moves.

## 4. Scrolling on small phones

Every screen of the experience becomes naturally scrollable up and down when
its content is taller than the phone, so buttons at the bottom are always
reachable. Short screens stay centred exactly as now. Sideways scrolling stays
blocked.

## 5. "My Gifts" saved permanently in the cloud

- Each gift is already stored in the cloud database with its own id. A new
  owner field is added so a gift can be linked to the person who made it.
- The app gives each browser an anonymous private key (no account, no email, no
  password) and remembers it in the browser and in a long-lived cookie.
- New page "My Gifts" listing every gift created from that device, read from
  the cloud database — so it survives refresh, closing the browser, and the app
  being reopened.
- From each row: open the gift, preview it as the recipient sees it, edit it,
  and copy the share link.
- Editing always updates the same gift and keeps the same link — it never
  creates a copy.
- If saving fails, a clear error is shown and the app does not claim success.

## 6. Link behaviour

The public link keeps opening the birthday experience only — no editor, no
"My Gifts", no tools. It stays the same link after edits.

## 7. Error sweep

Check every button, page and navigation path, remove a leftover debug log in
the preview button, and verify create → save → reload → my gifts → edit → save
→ copy link → open link end to end in a real browser at phone size.

## Technical notes

- Migration: add `owner_hash` (text, indexed) to `gifts`; no data loss.
- `src/lib/owner.ts`: anonymous owner key (localStorage + cookie), sent to the
  server which stores only its SHA-256 hash.
- `gifts.functions.ts`: `createGift` records the owner hash; new
  `listMyGifts`; `getGiftForEdit` / `updateGift` accept either the edit token
  or a matching owner key.
- New route `src/routes/my-gifts.tsx`; link added on the landing page.
- `BirthdayExperience.tsx`: message paging + swipe + per-screen scroll.
- `GiftEditor.tsx`: hoist `Section` out of the component (focus fix).
