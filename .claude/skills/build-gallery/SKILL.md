---
name: build-gallery
description: Build a Vineyard Custom Homes project gallery from finished photos into a draft Prismic project page in an unpublished release. Use for "build a gallery for <project>".
---

# Build a Vineyard gallery

This skill turns a set of finished photos into a draft project page on
vineyardconstruction.com. It runs in a claude.ai chat and in Claude Code. It
uses only the Prismic connector (and the Dropbox connector when the photos
are in Dropbox), so it needs no scripts. It tags photos, writes their alt
text, and lays them out by the rules in `rules.md`.

The layout, tag and alt-text rules live in `rules.md` beside this file. Read
it before Step 3 and follow it exactly. When a rule and this file disagree,
`rules.md` wins: it is the part Tim edits.

## What it never does

- **Never publish a release**, and never edit a project that is already
  published. The output is a new draft in a new release; a person publishes
  it.
- **Never write alt text, or place a photo, without having seen it.** If a
  photo can't be seen (see Step 2), stop: in claude.ai ask for it to be
  attached; in Claude Code name the file that would not open.
- Never delete or rename anything in the media library.
- **Never put a photo on any other host** (tmpfiles or the like), even
  though the Prismic upload tools suggest it for attached files: these are
  a client's home. Step 2 says what to do instead.

## What it needs

- **The Prismic connector**, signed in with write access to the
  `vineyard-custom-homes` repository.
- **The photos, attached to the chat** (claude.ai only; Claude Code needs
  no attachments, see the end of Step 2), so you can see them,
  and **also
  either already in the Prismic media library** (tagged with the client's
  surname) **or in a Dropbox folder**, so they can reach Prismic. Step 2
  says why both are needed.
- **The project name** (for example "Nantucket Farm"), and **the client's
  surname** if it differs from what the library already uses as this
  project's tag.
- Optional: the design and architect credits, and a testimonial with its
  attribution. Anything not given is left empty for Tim.

Ask for anything missing in one message, then go.

## Step 1: read the live model and tags

Read these fresh each time, because they change:

1. `get_custom_type` for `project`: its fields (`title`, `uid`,
   `hero_image`, `preview_image`, `design`, `architect`, `testimonial`,
   `testimonial_attribution`, `slices`).
2. `get_shared_slice` for `content_width_media`: its variations (`default`
   is "single", `twoCol` is "two col") and the current options of each
   variation's `image_aspect`. If `twoCol` has options beyond `9:16` and
   `1:1` (such as `3:4` or `2:3`), `rules.md` rule 7 uses them. If `default`
   has its own `image_aspect` (`16:9`, `4:3`, `3:2`, `1:1`, `none`),
   `rules.md` rule 6 chooses each single's shape. If it has no
   `image_aspect`, every single is 16:9, no portrait goes in one, and Step 4
   leaves `image_aspect` out of every single.
3. `list_asset_tags`, so the tags you add reuse the library's spellings and
   the project tag matches the one already in use.

## Step 2: see every photo, and get it into the media library

Give each photo a short label (`P01`, `P02`, …) and keep a table, one row a
photo: label, file name, width × height, portrait or landscape, room, wide
or detail, room tag, alt text. Fill in the room, shot, tag and alt text by
looking at the photo, following `rules.md`.

Each photo has to be **seen** and has to be **in the media library**, and
in a claude.ai chat those come from two different places:

- **Seeing.** You see a photo only when it is attached to the chat. A
  Prismic `search_assets` result or a Dropbox `file_preview` gives a link,
  not the picture. claude.ai takes 20 images in one message, so for a larger
  set ask for the rest, 20 a message, and wait until you have seen every
  photo before Step 3. If the chat refuses more attachments, stop and say
  how many photos are still unseen.
- **Reaching Prismic.** `upload_asset` and `upload_assets` take only a
  public URL that Prismic fetches itself; the connector cannot take a file
  attached to a chat (and the photos never go on another host: see "What it
  never does"). So the photos reach the library one of two ways. Match an
  attachment to a library asset or a Dropbox file only by an exact file
  name: `search_assets` also returns near matches (`IMG_123` finds
  `IMG_1234`). A file-name search outside the project tag can also find
  another client's photo, because camera names (`IMG_0412.jpg`) repeat
  between shoots and one camera gives every photo the same size. **Never
  accept such a match on its own:** list each one, with the asset's link
  and file name beside the photo it might be, and ask whether it is the
  same photo. Until the answer is yes, treat the photo as not in the
  library, and never tag or place the other asset. The project tag is the
  client's surname, so a repeat client's earlier house shares it: before
  matching, ask whether the client has an earlier project in the library.
  If so, or if a file name appears more than once under the tag, treat a
  match under the tag the same way, and ask.
  - **Tim has already uploaded them** (the usual way: he drags them into
    Prismic's Media Library and tags them with the client's surname).
    `search_assets` with that tag, paging through `nextCursor` until it is
    null, and match each attachment to its asset by file name. Ask about
    any photo you can't match; never guess.
  - **They are in a Dropbox folder:** `list_folder` on the path with
    `recursive: false` (left out, it reads every subfolder too, such as a
    `Web/` or `Low-res/` copy), following its cursor until `has_more` is
    false, and take the image files. Match each image file to an
    attachment by name; ask about any you can't match, never guess. `search_assets` by file name first, so a photo
    already in the library isn't stored twice. Upload the rest 10 at a
    time: get `download_link`s for those 10 only, by their `id:` values,
    with `expiration_in_sec` 900, just before the call (each works once:
    never open one yourself; if the link call fails, it fails for all, so
    split it to find the bad entry). Pass them to `upload_assets`, each
    with its Dropbox file name as `filename` (otherwise Prismic names it
    from the link, and later searches by name miss it), its alt text, its
    project tag and its room tag, if it has one. If a call times out or an
    item comes back `failed`, retry an item marked `failed` with a fresh
    link. For a call that timed out, wait a minute, `search_assets` by file
    name, then wait and search once more (it may still be storing), and
    only then upload the photos still missing, with fresh links. Never
    reuse a link. If a second call times out, stop and say which photos
    are in the library and which are not.

On either route, if the chat doesn't show you which file name belongs to
which attached photo, never pair names to pictures by order or size:
listing `/mnt/user-data/uploads` gives the names, not which picture is
which. Ask Tim for each photo's name, or to attach them again with their
names showing, before going on.

For every photo whose room tag was not set at upload (one already in the
library, on either route, any photo uploaded in Claude Code, or one that
came back `uploaded` with a `tagsError`), add its room tag, unless it
already has one from the list (a photo gets at most one), and the project
tag, if missing, with `update_asset_tags`; it
takes up to 10 tag names a call and is safe to repeat, so group photos by
room tag. Alt text for those goes on the page's image fields in Step 4.

Before calling a photo missing, `search_assets` by its file name: Tim may
have uploaded it without the tag, or under another spelling. If an attached
photo is in neither place, stop and ask Tim to drag it into Prismic's Media
Library with the client's surname as a tag, then carry on. The other way
round, if the tag or the folder holds photos that were not attached, list
them and ask whether to attach them or leave them out; never drop one
silently.

**In Claude Code** nothing is attached. The photo set is every asset with
the project tag (if the client has an earlier project, ask which assets
belong to this one), or the image files directly in the Dropbox folder (read
to the end of the cursor, as above): list the set and its count, and
confirm it before uploading anything. Skip matching to attachments, but
still `search_assets` by file name before any upload.
Upload Dropbox photos with the project tag only and no alt text, then see
each photo by downloading its asset `url` with `w=1600` added to the
query (an imgix resize; the full-size original may be too large to open)
and opening the file before you fill its row. Its room tag is added as
above, and Step 4 puts its alt text on the page.

Every upload result gives an asset's `id`, `url`, `width` and `height`;
keep them in the table.

## Step 3: lay out the page

Follow `rules.md`'s layout rules in order: choose the hero, order the rooms,
then pair and place the photos. Write the result as a numbered list of
slices, for example:

```
hero: P08
1. single 16:9  P28
2. single none  P32
3. two col 1:1  P34 | P29
```

Give a single its shape only when Step 1 found the single's
`image_aspect`; otherwise write it as plain `single P28`.

Then check it against the rules before writing anything:

- every photo appears exactly once (the hero counts);
- every portrait photo in a single has the shape none or 1:1 (rule 5);
- no more than two singles, or two two cols, in a row;
- every single's shape follows rule 6, and every two col's follows rule 7.

Fix any break, or name it in the report if the photos leave no way round
it.

## Step 4: write the draft

1. `create_release`, labelled `Gallery draft: <project name> (<date>)`.
2. `create_document` in that release: custom type `project`, locale
   `en-us`, title the project name, and document tags `["hide"]`. The
   `hide` tag keeps the page out of the built site even if the release is
   published by mistake; Tim removes it when the page is ready. Content:
   - `uid`: the project name in lower case with hyphens (`nantucket-farm`).
     If it is taken, add `-draft`.
   - `title`, `preview_title`: the project name. `design`, `architect`,
     `testimonial`, `testimonial_attribution` if given.
   - `hero_image` and `preview_image`: the hero photo.
   - `slices`: one slice per line of the layout, in order.

An image field, with the asset's values from the table:

```json
{
  "__TYPE__": "ImageContent",
  "origin": { "id": "<asset id>", "url": "<asset url>", "width": 3000, "height": 2250 },
  "url": "<asset url>",
  "width": 3000,
  "height": 2250,
  "edit": { "zoom": 1, "crop": { "x": 0, "y": 0 }, "background": "transparent" },
  "alt": "<alt text>",
  "credits": null,
  "provider": "imgix",
  "thumbnails": {}
}
```

A single, and a two col. Give a single the `image_aspect` that rule 6
chose, and leave the field out altogether when Step 1 found no
`image_aspect` on the `default` variation:

```json
{
  "key": "content_width_media$<new uuid>",
  "name": "content_width_media",
  "widget": {
    "__TYPE__": "SharedSliceContent",
    "variation": "default",
    "primary": {
      "image": "<image field>",
      "image_aspect": { "__TYPE__": "FieldContent", "type": "Select", "value": "16:9" }
    },
    "items": []
  }
}
```

```json
{
  "key": "content_width_media$<new uuid>",
  "name": "content_width_media",
  "widget": {
    "__TYPE__": "SharedSliceContent",
    "variation": "twoCol",
    "primary": {
      "image_one": "<image field>",
      "image_two": "<image field>",
      "image_aspect": { "__TYPE__": "FieldContent", "type": "Select", "value": "1:1" }
    },
    "items": []
  }
}
```

The slice zone wraps the list:
`{"__TYPE__": "SliceContentType", "value": [<slices>]}`.

## Step 5: check, then report

1. `get_document` for the new document with the release id. Check that the
   slices hold every photo but the hero exactly once (the hero fills
   `hero_image` and `preview_image` and no slice), that every image has alt
   text, that the slices are in the planned order, and that each two col
   carries the `image_aspect` the layout gave it, and each single too when
   Step 1 found the single's `image_aspect` (otherwise a single carries no `image_aspect`).
2. `present_release` for the release. Do not publish it.
3. Report, in this order:
   - the release link,
     `https://vineyard-custom-homes.prismic.io/builder/upcoming/<release id>`;
   - the layout list from Step 3;
   - the photo table (label, file, room, room tag, alt text);
   - each rule the page breaks and why, and any photo you were unsure of
     (a room you guessed, a photo that may not belong);
   - what is left for Tim: the testimonial, the related projects, any
     video, removing the `hide` tag, and publishing.

## Running it in claude.ai

In claude.ai, this folder is uploaded as a skill. Zip the `build-gallery`
folder itself, so the zip's top level is `build-gallery/` with `SKILL.md`
and `rules.md` inside it (a `SKILL.md` at the zip's root is not
recognised). Skills need code execution on (Settings, Capabilities). Upload
the zip under Customize, Skills: "+", "Create skill", "Upload a skill",
then switch it on. Then put the photos in the Prismic media library
(tagged with the client's surname) or a Dropbox folder, start a new chat
with the Prismic connector on (and Dropbox, for a folder), attach the same
photos and say "build a gallery for <project name>". After
`rules.md` changes, upload the new zip in place of the old one.
