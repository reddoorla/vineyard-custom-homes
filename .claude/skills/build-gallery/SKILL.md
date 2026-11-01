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
- **Never write alt text, or place a photo, without having seen it.** If the
  photos can't be seen (see Step 2), stop and ask for them to be attached.
- Never delete or rename anything in the media library.
- **Never put a photo on any other host** (tmpfiles or the like), even
  though the Prismic upload tools suggest it for attached files: these are
  a client's home. Step 2 says what to do instead.

## What it needs

- **The Prismic connector**, signed in with write access to the
  `vineyard-custom-homes` repository.
- **The photos, attached to the chat** in claude.ai, so you can see them,
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
   is "single", `twoCol` is "two col") and the current options of `twoCol`'s
   `image_aspect`. If options beyond `9:16` and `1:1` exist (such as `3:4`
   or `2:3`), `rules.md` rule 6 uses them.
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
  how many photos are still unseen. (In Claude Code you can instead
  download each library asset's `url` and open the file.)
- **Reaching Prismic.** `upload_asset` and `upload_assets` take only a
  public URL that Prismic fetches itself; the connector cannot take a file
  attached to a chat (and the photos never go on another host: see "What it
  never does"). So the photos reach the library one of two ways. Match an
  attachment to a library asset or a Dropbox file only by an exact file
  name: `search_assets` also returns near matches (`IMG_123` finds
  `IMG_1234`).
  - **Tim has already uploaded them** (the usual way: he drags them into
    Prismic's Media Library and tags them with the client's surname).
    `search_assets` with that tag, paging through `nextCursor` until it is
    null, and match each attachment to its asset by file name. If the chat
    doesn't show you an attachment's file name, list `/mnt/user-data/uploads`
    with code execution. Ask about any photo you can't match; never guess.
    Add the room tags (and the project tag, if missing) with
    `update_asset_tags`; it takes up to 10 tag names a call and is safe to
    repeat, so group photos by room tag. Alt text goes on the page's image
    fields in Step 4.
  - **They are in a Dropbox folder:** `list_folder` on the path and match
    each image file to an attachment by name; ask about any you can't
    match, never guess. `search_assets` by file name first, so a photo
    already in the library isn't stored twice. Upload the rest 10 at a
    time: get `download_link`s for those 10 only, just before the call
    (they expire in minutes and each works once: never open one yourself),
    and pass them to `upload_assets`, each with its Dropbox file name as
    `filename` (otherwise Prismic names it from the link, and later
    searches by name miss it), its alt text and both tags. In Claude Code,
    where nothing is attached, upload without alt text, then look at each
    photo from its asset `url`; Step 4 puts the alt text on the page.
    If a call times out or an item comes back `failed`, `search_assets` by
    file name before retrying (a timed-out call may still have stored its
    files), then get fresh links for only the photos still missing. Never
    reuse a link.

Before calling a photo missing, `search_assets` by its file name: Tim may
have uploaded it without the tag, or under another spelling. If an attached
photo is in neither place, stop and ask Tim to drag it into Prismic's Media
Library with the client's surname as a tag, then carry on.

Every upload result gives an asset's `id`, `url`, `width` and `height`;
keep them in the table.

## Step 3: lay out the page

Follow `rules.md`'s layout rules in order: choose the hero, order the rooms,
then pair and place the photos. Write the result as a numbered list of
slices, for example:

```
hero: P08
1. single P28
2. single P32
3. two col 1:1  P34 | P29
```

Then check it against the rules before writing anything:

- every photo appears exactly once (the hero counts);
- no portrait photo is in a single;
- no more than two singles, or two two cols, in a row;
- every two col's aspect follows rule 6.

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

A single, and a two col:

```json
{
  "key": "content_width_media$<new uuid>",
  "name": "content_width_media",
  "widget": {
    "__TYPE__": "SharedSliceContent",
    "variation": "default",
    "primary": { "image": "<image field>" },
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
   text, and that the slices are in the planned order.
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
