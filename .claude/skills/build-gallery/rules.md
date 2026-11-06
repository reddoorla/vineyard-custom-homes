# Gallery rules

Tim's rules for laying out a Vineyard project gallery. The `build-gallery`
skill follows this file exactly, so change a rule here and the next gallery
follows it. Each rule says where it came from.

## The page

A project page is the `project` document in Prismic. From top to bottom it
shows the **hero** (`hero_image`), then the **slices**, each one a
`ContentWidthMedia` slice:

- **single**: one photo, full width, in the shape set by the slice's
  **image aspect**, when the slice offers one (Step 1 of the skill reads
  whether it does): 16:9 (the default), 4:3, 3:2, 1:1 (square), or none,
  which shows the photo at its own shape with nothing cut away. Without the
  choice, every single is 16:9. 16:9 is the one shape that changes on a
  phone, where it shows at 4:3: a 4:3 photo loses a little off its top and
  bottom on a computer, and a 3:2 photo a little off its sides on a phone.
  The others keep their shape at every width. A Vimeo video fills the box,
  losing its sides wherever the box is taller than 16:9; with none, a video
  gets the 16:9 shape, because Prismic knows a photo's shape but not a
  video's.
  _Tim, 11-06: "the ideal list would be 16:9, 4:3 and 3:2 or none (taking
  the native aspect ratio)… 1:1 for the single column would be great too."_
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
   (taller than wide) photo goes in a single only when the slice offers the
   single's shapes, and then only with none (it shows whole, and tall) or
   1:1 (it loses its top and bottom); at 16:9, 4:3 or 3:2, or when the
   slice offers no choice, the slice would cut away much of it. Prefer
   pairing a portrait in a two col, and use a portrait single for a photo
   that should stand alone.
   _Not Tim's words: the old rule kept every portrait out of a single;
   this opens it to the shapes Tim asked for on 11-06, for Tim to correct._
6. **Choosing a single's shape**, when the slice offers one:
   - 16:9 by default, for every landscape, including the many shot at 3:2
     or 4:3: it is what every single showed before the choice existed, and
     losing a strip of sky or floor costs nothing.
   - 4:3 or 3:2 only when a landscape's top and bottom matter, such as a
     staircase, a vaulted ceiling or a chimney that 16:9 would cut through,
     and then the one nearer the photo's own shape (a 3000×2250 photo is
     4:3, a 3000×2000 or 2560×1706 photo is 3:2).
   - 1:1 for a detail whose subject sits in the middle of the frame.
   - none for a photo that should not be cropped at all, such as a portrait,
     a panorama or an odd shape; this wins over the 16:9 default. (If Tim later puts a video in a none
     single, it shows at 16:9; in the other shapes the video fills the box
     and loses its sides.)
     _Not Tim's words: a first guess at when to use each shape, for Tim to
     correct._
7. **Choosing a two col's shape:**
   - If either photo is portrait, use 9:16, or the option closest to the
     portrait's own shape when the slice has more than 9:16 and 1:1.
   - Two landscapes: 1:1 by default. 9:16 is allowed for a pair of detail
     shots whose subject sits in the middle of the frame, as Tim does on his
     own pages.
     _The operator, 11-01: copy Tim's habit of putting landscapes in 9:16
     halves._
8. **Vary the rhythm**: never more than two singles in a row, or more than
   two two cols in a row. Move a photo between rooms' neighbours, or a room
   to the next step, to keep it.
   _Tim, 10-30: "a varying layout, from single horizontal to two-column
   vertical"._
9. **Use every photo once.** If one plainly doesn't belong (a duplicate, a
   construction shot), list it in the report rather than drop it silently.
10. **Video is Tim's.** The skill places photos only. A slot that should be a
    Vimeo clip gets its poster photo, and the report says so.

## Tags

Every photo gets its project tag and, where one fits, a room tag in the
Prismic media library.

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
