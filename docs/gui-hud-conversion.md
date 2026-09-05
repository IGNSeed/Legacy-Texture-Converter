# GUI / HUD conversion

This document records the verified Java / Bedrock GUI-sheet to Legacy Console Edition HUD conversion implemented by this project. The investigation was performed against the local development references on 2026-09-05. `References/` is not a runtime dependency and is never published.

## Supported input

The parsers recognize these PNG files after normalizing archive and folder prefixes:

| Input edition   | HUD icons                | Hotbar widgets             |
| --------------- | ------------------------ | -------------------------- |
| Java Edition    | `textures/gui/icons.png` | `textures/gui/widgets.png` |
| Bedrock Edition | `textures/gui/icons.png` | `textures/gui/gui.png`     |

Root-level `icons.png` plus `widgets.png` or `gui.png` are also accepted for individual-PNG input. Automatic edition detection can be ambiguous for root-level files, so the existing manual Java / Bedrock selector remains available.

Each sheet must be square and an integer multiple of its 256×256 logical coordinate space. The supported range is 256×256 through 4096×4096. Source rectangles are cropped at the detected integer scale and reduced to the verified target dimensions with nearest-neighbor RGBA sampling. Alpha is preserved.

An absent sheet is not an error. Sprites sourced from that sheet remain unchanged in the target FUI and are reported as `Vanilla preserved`. A malformed PNG or unsupported sheet size is skipped with a warning; it does not abort conversion of other texture categories.

## Semantic source mapping

The same logical rectangles were verified in the reference Java and Bedrock sheets. The mapping lives in `data/mappings/common/gui-hud-sources.json` rather than in parser or UI code.

| Semantic ID              | Sheet         | Logical rectangle `x,y,w,h` |
| ------------------------ | ------------- | --------------------------- |
| `crosshair`              | icons         | `0,0,15,15`                 |
| `health.normal.empty`    | icons         | `16,0,9,9`                  |
| `health.normal.full`     | icons         | `52,0,9,9`                  |
| `health.normal.half`     | icons         | `61,0,9,9`                  |
| `health.absorption.full` | icons         | `160,0,9,9`                 |
| `health.absorption.half` | icons         | `169,0,9,9`                 |
| `armor.full`             | icons         | `16,9,9,9`                  |
| `armor.half`             | icons         | `25,9,9,9`                  |
| `armor.empty`            | icons         | `34,9,9,9`                  |
| `oxygen.full`            | icons         | `16,18,9,9`                 |
| `oxygen.empty`           | icons         | `25,18,9,9`                 |
| `hunger.empty`           | icons         | `16,27,9,9`                 |
| `hunger.full`            | icons         | `52,27,9,9`                 |
| `hunger.half`            | icons         | `61,27,9,9`                 |
| `experience.background`  | icons         | `0,64,182,5`                |
| `experience.progress`    | icons         | `0,69,182,5`                |
| `hotbar.background`      | widgets / gui | `0,0,182,22`                |
| `hotbar.selection`       | widgets / gui | `0,22,24,24`                |

Pixel comparison with the extracted Console Edition images also established that the embedded PNG samples use reversed red and blue channels relative to the source sheets. Conversion therefore swaps R and B after resizing while leaving G and alpha unchanged. This is a pixel transformation, not a PNG byte-order assumption.

All 18 mapped targets in each verified FUI are standalone PNG sprites with dimensions matching their semantic source element; none is a multi-sprite atlas or composite. The converter therefore replaces those complete PNG payloads. Unmapped images, including Console-specific HUD and UI content, remain byte-for-byte unchanged.

## Verified target assets

### Wii U Edition

Wii U BASE and UPD were inspected as one baseline set. The BASE Media archive does not contain the required HUD FUI; the UPD archive does, so the unified published baseline uses the UPD `MediaWiiU.arc`.

| Property                  | Verified value                                                     |
| ------------------------- | ------------------------------------------------------------------ |
| Output path               | `Common/Media/MediaWiiU.arc`                                       |
| Reference archive size    | 29,246,646 bytes                                                   |
| Reference archive SHA-256 | `02cac0f823385f018f3ec12eed7a1037ebac2049d4a1adddce6ce0612c8a2e27` |
| HUD FUI                   | `skinGraphicsHud.fui`                                              |
| FUI image count           | 224                                                                |
| FUI size                  | 158,267 bytes                                                      |
| FUI SHA-256               | `6897fb5f6b58d210618b70db0403df86042c7fd8b1b0e9160e5172eaf2aa9cc6` |

### Nintendo Switch Edition 1.0.17

Switch uses its own archive, output path, mapping, baseline validation, and package adapter. No Wii U archive or packaging rule is reused.

| Property                  | Verified value                                                        |
| ------------------------- | --------------------------------------------------------------------- |
| Archive path inside romfs | `Common/Media/MediaNX.arc`                                            |
| ZIP output path           | `atmosphere/contents/01006BD001E06000/romfs/Common/Media/MediaNX.arc` |
| Reference archive size    | 38,257,396 bytes                                                      |
| Reference archive SHA-256 | `9acddc0c1bbd9f40ddd9045e52495b4034d0cbbbc52db7fe45686a7f2bbc864a`    |
| Handheld FUI              | `skinGraphicsHud.fui`, 224 images, 158,267 bytes                      |
| Handheld FUI SHA-256      | `6897fb5f6b58d210618b70db0403df86042c7fd8b1b0e9160e5172eaf2aa9cc6`    |
| HD FUI                    | `skinHDGraphicsHud.fui`, 259 images, 166,124 bytes                    |
| HD FUI SHA-256            | `5bb3304198cbfaf2aef10dd620ea2c4eac3e14274cfe495e32911e47881d64aa`    |

The handheld FUI happens to be byte-identical to the verified Wii U FUI. That observation is not used to couple the edition implementations. Switch handheld and HD FUI files are parsed, mapped, rebuilt, and validated independently. The currently mapped sprite dimensions match between them, but each dimension is still checked against its own descriptor table.

## Target descriptor mapping

Mappings live in `data/mappings/wiiu/gui-hud.json` and `data/mappings/switch/gui-hud.json`. Descriptor IDs and dimensions are verified independently for every target FUI.

| Semantic ID              | Descriptor | Wii U / Switch handheld index | Switch HD index |   Size |
| ------------------------ | ---------: | ----------------------------: | --------------: | -----: |
| `health.absorption.half` |     `0x43` |                           171 |             204 |    9×9 |
| `health.absorption.full` |     `0x42` |                           172 |             205 |    9×9 |
| `crosshair`              |     `0x2e` |                           183 |             218 |  15×15 |
| `hotbar.selection`       |     `0x2d` |                           184 |             219 |  24×24 |
| `hotbar.background`      |     `0x2c` |                           185 |             220 | 182×22 |
| `health.normal.half`     |     `0x2b` |                           186 |             221 |    9×9 |
| `health.normal.full`     |     `0x27` |                           190 |             225 |    9×9 |
| `health.normal.empty`    |     `0x23` |                           194 |             229 |    9×9 |
| `hunger.half`            |     `0x21` |                           196 |             231 |    9×9 |
| `hunger.full`            |     `0x1d` |                           200 |             235 |    9×9 |
| `hunger.empty`           |     `0x19` |                           204 |             239 |    9×9 |
| `experience.progress`    |     `0x16` |                           207 |             242 |  182×5 |
| `experience.background`  |     `0x15` |                           208 |             243 |  182×5 |
| `armor.half`             |     `0x14` |                           209 |             244 |    9×9 |
| `armor.empty`            |     `0x13` |                           210 |             245 |    9×9 |
| `armor.full`             |     `0x12` |                           211 |             246 |    9×9 |
| `oxygen.empty`           |     `0x11` |                           212 |             247 |    9×9 |
| `oxygen.full`            |     `0x10` |                           213 |             248 |    9×9 |

## ARC format and rebuild rules

The ARC implementation was derived by validating all table entries and payload boundaries in the actual Wii U and Switch files. MUArchiveEditor was inspected as supporting research, but its absent external ARC library was not copied or used at runtime.

The verified archive layout is:

1. Big-endian `uint32` entry count.
2. For each entry: big-endian `uint16` name byte length, name bytes, big-endian `uint32` absolute data offset, and big-endian `uint32` data size.
3. Payloads occur in table order, contiguously, without observed alignment padding.

The parser rejects unsafe paths, invalid UTF-8, out-of-range fields, gaps, overlaps, trailing data, excessive entry counts, and oversized input. Both verified archives contain two entries named `Graphics\\Achievements\\MCTrophy_61.png`, so duplicate names are deliberately preserved in their original order. A name-based replacement is refused when it would be ambiguous. Rebuilding preserves entry order, exact name bytes, and every unmodified payload. It computes all offsets from the final payload sizes and allocates one final archive buffer.

## FUI format and rebuild rules

FuiEditor was inspected to understand its image-table workflow, then the behavior was validated independently against the actual target FUI files. No FuiEditor source code is included in the application.

The first embedded PNG follows a reverse-discoverable table of 32-byte little-endian image descriptors. Each descriptor contains the descriptor ID, attribute, width, height, relative image offset, image size, and two unknown fields. The oldest descriptor has relative image offset zero. Rebuilding:

1. Preserves the prefix before the descriptor table.
2. Preserves descriptor order, ID, attribute, and both unknown fields.
3. Updates width, height, relative offset, and size from the final PNG.
4. Writes all PNG payloads contiguously in descriptor order.
5. Updates the little-endian size field at offset 8 to `file size - 152`.

Every FUI is parsed again after serialization. Every replaced PNG is structurally checked and browser-decoded, its dimensions are compared to its descriptor, and the completed ARC is parsed again before it can be emitted.

### Confirmed facts and unknown fields

Confirmed facts are the byte order, table widths, offset relationships, contiguous payload layout, FUI descriptor width, image counts, descriptor IDs, image dimensions, size-field update, and mappings documented above. These were checked against all three target FUI files and both target archives, not inferred from editor source alone.

The broader FUI header and ActionScript/FourJ UI structures were not needed for HUD image replacement and remain intentionally uninterpreted. The semantic meaning of the descriptor `attribute`, `unknownOffset`, and `unknown1c` fields and the historical reason for the 152-byte FUI size bias are also unknown. They are copied unchanged. Actual ARC entry names are ASCII-compatible; the parser accepts valid UTF-8 but does not claim that every game version uses UTF-8. No unknown header or payload bytes are regenerated.

## Browser pipeline and failure behavior

Only the selected edition's compressed baseline is fetched. The reviewed bundles produced for this implementation are:

| Bundle                   |             Size | SHA-256                                                            |
| ------------------------ | ---------------: | ------------------------------------------------------------------ |
| `wiiu-base-assets.zip`   | 10,432,654 bytes | `c58c7b5b2a8a331648a973faf9bc834b3dfbee8e0bac652c7270046e4319356b` |
| `switch-base-assets.zip` | 18,678,031 bytes | `69f28c1a6b35b4ff8a49cca08c5b3752759d8dc7e5ea6089dc213beef6791c73` |

During HUD conversion, the selected Media ARC is held as the original buffer plus one rebuilt archive buffer; individual unchanged ARC entries and FUI PNGs are views rather than copies where possible. Inputs larger than 256 MiB and unreasonable table counts are rejected before reconstruction.

If the required Media ARC or FUI is absent, malformed, or different from the verified descriptor map, conversion of other supported resources continues. No partially rebuilt Media archive is emitted. The report identifies the affected source sheet and records the structural reason as a warning.

## Validation

Automated tests cover malformed and truncated ARC/FUI data, offset recalculation when a PNG changes size, preservation of unknown descriptor fields, source recognition, RGBA nearest-neighbor behavior, R/B swapping, 256/512/1024-scale input, missing sheets, invalid sheet dimensions, Wii U conversion, and independent Switch handheld/HD conversion.

`tests/integration/realMediaArchives.test.js` adds a local reference-backed test. When the verified `References/` files exist it checks their exact sizes and hashes, round-trips the untouched ARC byte-for-byte, replaces a valid 9×9 embedded PNG in every target FUI, rebuilds the ARC, reparses it, and validates all mapped descriptors and PNGs. The suite skips this test when `References/` is absent so a public clone remains fully buildable and testable without private references.

## Known limitations

- Conversion currently covers the static HUD sprites listed above. It does not convert menu layouts, container screens, fonts, controller glyphs, cursor animation, or arbitrary FUI vector/layout content.
- Only square integer-multiple 256×256 source sheets are accepted. Mixed scale within a single sheet cannot be inferred safely.
- Target descriptor maps are specific to the verified Wii U resources and Nintendo Switch Edition 1.0.17. Other title updates must be researched and mapped separately.
- Structural and browser PNG validation do not prove in-game rendering. Final packs still require emulator or hardware acceptance testing.
