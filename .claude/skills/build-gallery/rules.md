# Gallery rules

Tim's rules for laying out a Vineyard project gallery. The `build-gallery`
skill follows this file exactly, so change a rule here and the next gallery
follows it. Each rule says where it came from.

## The page

A project page is the `project` document in Prismic. From top to bottom it
shows the **hero** (`hero_image`), then the **slices**, each one a
`ContentWidthMedia` slice:

- **single**: one photo, full width. It shows at 16:9 on a computer and 4:3
  on a phone, so a 4:3 photo loses a little off the top and bottom.
- **two col**: two photos side by side. Both halves share one shape, the
  slice's **image aspect**: 9:16 (tall), 1:1 (square), 3:4 or 2:3 (both
  portrait), plus any other options the slice offers when the skill runs.
  On a phone the halves stack, one above the other: 9:16 and 1:1 halves
  show at 4:3 there, while 3:4 and 2:3 keep their shape.

## Layout rules

1. **Hero: an exterior shot, the front door if there is one.** It goes in
   `hero_image`, and also in `preview_image` (the card on the gallery index).
   _Tim, 10-30: "Start with an overall hero shot of the exterior, front door."_
2. **Open the slices on the outside of the house**: the widest exterior
   shots (aerial, front, rear), then outdoor living.
   _Tim, 10-30._
3. **Then walk through the house**, one room at a time, in this order:
   entry, great room, kitchen and dining, other living rooms and the office,
   the primary suite, the other bedrooms and their baths, laundry and
   utility rooms, bonus rooms and the gym, then barns and outbuildings, and
   end on one wide shot of the grounds. Leave out any step the photos don't
   have.
   _Not Tim's words: a first guess at a tour order, for Tim to correct._
4. **Keep each room's photos together, wide shots before details.** Two
   angles of the same room go side by side in a two col. A room with a
   single photo can share a two col with the most similar room next to it in
   the order.
   _Tim, 10-30: "Put shots that look similar next to each other … different
   angles of the same room."_
5. **A wide landscape shot of a whole room goes in a single.** A portrait
   (taller than wide) photo never goes in a single: the slice would cut away
   most of it.
6. **Choosing a two col's shape:**
   - If either photo is portrait, use 9:16, or the option closest to the
     portrait's own shape when the slice has more than 9:16 and 1:1.
   - Two landscapes: 1:1 by default. 9:16 is allowed for a pair of detail
     shots whose subject sits in the middle of the frame, as Tim does on his
     own pages.
     _The operator, 11-01: copy Tim's habit of putting landscapes in 9:16
     halves._
7. **Vary the rhythm**: never more than two singles in a row, or more than
   two two cols in a row. Move a photo between rooms' neighbours, or a room
   to the next step, to keep it.
   _Tim, 10-30: "a varying layout, from single horizontal to two-column
   vertical"._
8. **Use every photo once.** If one plainly doesn't belong (a duplicate, a
   construction shot), list it in the report rather than drop it silently.
9. **Video is Tim's.** The skill places photos only. A slot that should be a
   Vimeo clip gets its poster photo, and the report says so.

## Tags

Every photo gets two asset tags in the Prismic media library.

- **Project tag**: the name the library already uses for this client, which
  is usually the client's surname (`Bentley`, `vanderboom`, `haggett`). For a
  new client, use the surname with the same capitalisation Tim gave. A tag
  holds at most 20 characters.
  _The operator, 11-01: follow the library's existing tags._
- **Room tag**: at most one, from this list:
  `kitchen`, `bathroom`, `fireplace`, `laundry`, `entry`, `front door`,
  `exterior`. When two fit, the first in this order wins: `front door`,
  `fireplace`, `kitchen`, `bathroom`, `laundry`, `entry`, `exterior`. A dining
  room with a fireplace is `fireplace`; a breakfast nook or a butler's pantry
  is `kitchen`; a mud room or dog wash is `laundry`. A bedroom, office or gym
  gets no room tag.
  _Tim, 10-30, with `bathroom` and `exterior` as the library already spells
  them._

## Alt text

Every photo gets alt text, written after looking at it.

- One sentence, under 125 characters.
- Say what is in the photo: the room, then two or three things that tell it
  apart (materials, colours, the furniture you'd point at).
- No "image of" or "photo of", no project or client name, no selling words
  ("stunning", "luxurious", "beautiful").
- Example: "Two-story great room with blue sofas, a stone fireplace and a wall of
  glass doors under a balcony".
