# Reddoor Starter and Site Scaffold

## Purpose

To provide a forkable starting point for all SvelteKit, Tailwind + Prismic sites developed at Reddoor.

## Contents

### Base configuration and boilerplate for a SvelteKit app integrated with Tailwind

SvelteKit has one of the best developer experiences of any framework, and is especially friendly to component-driven design. We combine it with Tailwind for implementation of CSS to pave the path to quickly devolping reactive, extensible, and data-driven frontends.

### Base configuration and boilerplate necessary to integrate SvelteKit with Prismic CMS

Prismic CMS allows flexible entry of data by content managers without exposing code, and can be integrated into any frontend design as necessary.

### Designed and extensible components to be used within Prismic Slices or as Prismic Slices

We've designed and implemented a library of responsive, functioning components to use first in the wireframing stage, and then to be customized for each site. Delivering these components as slices will allow both us and clients to quickly prototype and push new pages that remain within the design space originally conceived for the site.

This library will grow as we require new interactive functions or layouts, and allow programmatic work from different projects to be easily accessible and carry over, rather than rebuilding components anew for each project.

## How to Use

1. clone this repo

2. terminal npm i

3. npm audit fix

4. initiate new prismic repo

5. change slicemachine.config.json to new prismic name

6. start dev server and push changes to prismic

7. build site, using slices if complex cms or custom types if not

## Next steps

## TODO:

- arrow sometimes sticks on bump
- replace font awesome library with `<i>` syntax
- rework slider logic into a more flexible component
- review tailwind defaults
