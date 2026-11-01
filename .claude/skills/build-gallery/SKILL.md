---
name: build-gallery
description: Build a Vineyard Custom Homes project gallery from a set of finished photos. Looks at every photo, tags it in the Prismic media library with the project and room, writes its alt text, lays the photos out in ContentWidthMedia slices by the rules in rules.md, and leaves a draft project page in a new, unpublished Prismic release. Use when asked to "build a gallery from <photos or folder>" or to lay out a Vineyard project's photos.
---

# Build a Vineyard gallery

This skill turns a set of finished photos into a draft project page on
vineyardcustomhomes.com. It runs the same way in a claude.ai chat and in
Claude Code. It uses only the Prismic connector (and the Dropbox connector
when the photos are in Dropbox), so it needs no scripts.

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

## What it needs

- **The Prismic connector**, signed in with write access to the
  `vineyard-custom-homes` repository.
- **The photos**, one of:
  - attached to the chat (the most reliable: they can be seen directly);
  - a Dropbox folder path, through the Dropbox connector;
  - photos already in the Prismic media library, named by their asset tag.
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

- **Attached to the chat:** look at each one, fill its row, then upload it
  with `upload_asset` with its alt text and both tags.
- **In Dropbox:** `list_folder` on the path; take the image files. Look at
  each with `file_preview`. If the preview does not show you the photo,
  stop and ask for the photos to be attached instead. For the ones you have
  seen, get a `download_link` and upload them with `upload_assets`, up to 10
  a call, each with its alt text and both tags.
- **Already in the media library:** `search_assets` with the project tag
  (page through `nextCursor` until it is null). If the results don't show
  you the photos themselves, stop and ask for them to be attached. Add any
  missing tags with `update_asset_tags`; it takes up to 10 tag names a call
  and is safe to repeat, so group photos by room tag. Alt text goes on the
  page's image fields in Step 4.

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
   number of images on it equals the number of photos, that every image
   has alt text, and that the slices are in the planned order.
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

In claude.ai, this folder is uploaded as a skill: zip the `build-gallery`
folder (with `SKILL.md` and `rules.md` inside it) and add it under
Settings, Capabilities, Skills, or have the organisation's owner add it for
everyone. Then, in a new chat with the Prismic connector on, attach the
photos and say "build a gallery for <project name>". After `rules.md`
changes, upload the zip again.
