# Nintendo Switch Edition 1.0.17 compatibility notes

## Scope and evidence

Switch support is pinned to the `Common` resources from Minecraft: Nintendo Switch Edition 1.0.17. The inspected reference contains 410 files (385 PNG files) and is used only during local analysis. Production code never reads `References/`.

The browser bundle contains only the 46 baseline files required by the current converter scope. `data/mappings/switch/default-assets.json` is the allow-list for that archive, and the production build checks both its file list and approved SHA-256.

The two vanilla terrain mipmap files were inspected but are not baseline inputs: conversion always regenerates them from the final composed terrain atlas. They are therefore present in every output ZIP without publishing redundant source copies in the baseline archive.

## Verified atlas layout

| Asset                     | Vanilla size | Slot size |  Grid |
| ------------------------- | -----------: | --------: | ----: |
| `items.png`               |      256×272 |     16×16 | 16×17 |
| `terrain.png`             |      256×512 |     16×16 | 16×32 |
| `particles.png`           |      128×128 |       8×8 | 16×16 |
| `terrainMipMapLevel2.png` |      128×256 |   derived |     — |
| `terrainMipMapLevel3.png` |       64×128 |   derived |     — |

An alpha-aware tile comparison was used to validate shared pre-Aquatic positions against the existing mappings. Switch mapping documents are separate files even where coordinates agree. The Switch terrain atlas ends at 512 pixels rather than the Wii U atlas height of 544 pixels.

The three atlases, armor, glint, fire, water, clock, and compass reference images use RGBA data. Lava and flowing lava use RGB. Canvas composition requests an alpha-capable context, clears a destination slot before drawing, and disables interpolation so transparent source pixels replace rather than reveal the vanilla slot beneath them.

Slots not present in the 1.0.17 reference are deliberately absent from the Switch mapping. This includes the later Aquatic item set, conduit and turtle-egg terrain entries, the bubble particle, turtle armor, and entries in terrain rows beyond the Switch atlas. They are reported as unsupported rather than assigned to unused positions.

## Standalone and animated resources

- Armor uses the verified `Common/res/1_2_2/armor` and `Common/res/TitleUpdate/res/armor` names.
- `glint.png` is 64×64.
- `fire_0.png` and `fire_1.png` are 16×512 strips.
- `water.png` is 16×512 and has four named mipmaps. The last two remain at the verified 4×128 minimum strip size.
- `water_flow.png` is 32×1024 and has no corresponding mipmap files in this Switch reference.
- `lava.png` is 16×320 and `lava_flow.png` is 32×512.
- `portal`, `magma`, `prismarine_rough`, `sea_lantern`, and `cauldron_water` use dedicated block texture files.
- `clock.png` and `compass.png` are dedicated runtime-controlled strips at 16×1024 and 16×512.

Java `.mcmeta` and Bedrock flipbook timing are translated when their frame description can be represented by the Console Edition text format. Resources with a fixed Console Edition order keep their verified baseline behavior and produce a warning when incompatible source metadata is present.

## Packaging

Every output path is rooted below the verified title ID:

```text
atmosphere/contents/01006BD001E06000/romfs/Common/...
```

The Switch file-tree builder adds this prefix after edition-specific conversion. Wii U packaging remains unchanged and continues to output `Common/...` directly without `BASE/` or `UPD/` wrapper directories.
