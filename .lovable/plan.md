# Message Frames selector

## What will be added

- Add a dedicated **Message Frames** section in the gift editor, without changing the existing message fields, sequence, navigation, or animations.
- Offer twelve visually distinct frame designs: Cinematic Luxury, Classic Royal, Vintage Letter, Polaroid, Film Strip, Elegant Glass, Soft Floral, Memory Scrapbook, Romantic, Minimal Luxury, Arched, and Soft Glow.
- Show every design as a real miniature message-frame preview, with a clear selected state.
- Add an elegant preset color selector dedicated to message frames. Colors will remain coordinated with the existing themes and maintain readable message text.
- Apply the chosen design and color to every personal-message screen, including preview, published gifts, and later edits.

## Persistence and compatibility

- Add saved `message_frame_style` and `message_frame_color` fields to gifts in Lovable Cloud.
- Include those fields in create, edit, public viewing, and editor-preview data paths.
- Existing gifts will use the current Cinematic Luxury frame and their existing accent color, so their appearance remains compatible.
- Preserve selections in local drafts and keep the same gift link when editing.

## Responsive presentation

- Implement each frame through shared semantic styles so previews and full message scenes stay visually consistent.
- Keep the existing frame dimensions, content scrolling, message paging, swipe behavior, and screen layout unchanged.
- Ensure decorative details adapt cleanly to narrow phones and desktop screens without covering text.

## Verification

- Verify all twelve previews and colors in English and Arabic.
- Test live preview, create, My Gifts, public opening, edit, save, and reopening the same gift.
- Check mobile and desktop sizing, text contrast, long-message scrolling, and clean build/runtime logs.
