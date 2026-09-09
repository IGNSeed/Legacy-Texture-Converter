# PlayStation 3 Edition compatibility notes

## Supported targets and evidence

The converter exposes two independent PlayStation 3 targets:

- **Latest** is pinned to the inspected `1.13 Common` resource set.
- **1.8** is pinned to the inspected `1.8 Common` resource set.

The local `References/ps3/` trees were used as evidence only. Production code does not read
`References/`. Each published baseline contains only the files in its version-specific
`default-assets.json` allow-list.

| Property                  |  Latest |     1.8 |
| ------------------------- | ------: | ------: |
| Files in inspected Common |     449 |     336 |
| Paths shared by both      |     334 |     334 |
| Version-only paths        |     115 |       2 |
| Reviewed baseline files   |      54 |      49 |
| `items.png`               | 256x272 | 256x256 |
| `terrain.png`             | 256x544 | 256x512 |
| terrain mip level 2       | 128x272 | 128x256 |
| terrain mip level 3       |  64x136 |  64x128 |
| `particles.png`           | 128x128 | 128x128 |
| Mapped item entries       |     370 |     345 |
| Mapped terrain entries    |     819 |     611 |
| Mapped particle entries   |      83 |      73 |
| HUD container             |     FUI |     SWF |

The Latest core atlases were byte-compared with the corresponding reviewed LCE atlases before
their coordinates were adopted into PS3-specific mapping documents. The 1.8 mappings were then
derived from the actual 1.8 atlas dimensions and alpha occupancy. Entries absent from 1.8 are not
assigned to apparent free slots; they are reported as unsupported.

The two 1.8-only paths are `fire_1MipMapLevel2.png` and
`fire_1MipMapLevel3.png`. Latest adds 115 paths, including Aquatic-era assets, turtle armor,
models, mobs, and newer item resources. Those broad Common differences are not copied into the
baseline unless they are required by the converter's supported categories.

## Output layout

Both PS3 choices emit the actual resource tree directly, without Wii U `BASE`/`UPD` wrappers or
the Nintendo Switch Atmosphere prefix:

```text
Common/
├── Media/MediaPS3.arc
└── res/
    ├── 1_2_2/armor/...
    ├── gui/icons.png
    ├── gui/gui.png
    └── TitleUpdate/res/...
```

The Java `widgets.png` or Bedrock `gui.png` input is copied byte-for-byte to the PS3 `gui.png`
path. `icons.png` is also copied byte-for-byte. HUD extraction from those sheets is a separate
operation and does not change the raw-copy behavior.

## Latest HUD (FUI)

The inspected Latest archive is `Common/Media/MediaPS3.arc`:

- Size: 29,538,242 bytes
- SHA-256: `55e0b05547ecbb99cba1af07f0cd17b259645df5f96c9c759c4356f1f959d05d`
- Mapped file: `skinGraphicsHud.fui`
- ARC entries: 571
- Embedded image count: 224
- FUI size: 158,267 bytes
- FUI SHA-256: `6897fb5f6b58d210618b70db0403df86042c7fd8b1b0e9160e5172eaf2aa9cc6`

Its mapped FUI descriptor IDs, image indexes, dimensions, and byte-storage behavior match the
independently validated Latest PS3 file. Conversion uses the existing ARC/FUI backend with a
PS3-specific mapping and baseline. Wii U paths and packaging are not used.

## 1.8 HUD (SWF)

The inspected 1.8 archive is `Common/Media/MediaPS3.arc`:

- Size: 10,678,972 bytes
- SHA-256: `450583da28484acb5c25bdd2c1c725f9414f6d01a41b4f2e52f9d515786b210a`
- Mapped file: `skinGraphicsHud.swf`
- ARC entries: 212
- SWF SHA-256: `7bb7b49689da81ccc4728e6b75987c242f49803dcd8af3977e4e69631df5356b`
- Signature/version: `CWS`, SWF 9
- Bitmap tags: 53 `DefineBitsLossless2` tags, format 5 (32-bit ARGB)

The observed SWF tag counts are: End 1, ShowFrame 1, SetBackgroundColor 1,
PlaceObject2 12, DefineBitsLossless2 53, DefineEditText 28, DefineSprite 12, FileAttributes 1,
PlaceObject3 53, DefineFontAlignZones 2, DefineFont3 2, SymbolClass 1, DoABC 1, and
DefineSceneAndFrameLabelData 1. No JPEG or color-mapped lossless bitmap tag is used by the mapped
HUD file, so those formats are intentionally outside this implementation.

The browser SWF module supports the subset required by this file. It reads uncompressed `FWS`
and zlib-compressed `CWS`; it identifies `ZWS` and rejects it as unsupported rather than guessing
at LZMA handling. It validates the declared uncompressed size, RECT/frame header, tag headers and
bounds, End tag, duplicate bitmap IDs, dimensions, zlib payload size, and replacement dimensions.

The 18 mapped HUD sprites use these character IDs:

| Semantic                       |    Bitmap ID |           Size |
| ------------------------------ | -----------: | -------------: |
| absorption half/full           |        6 / 7 |            9x9 |
| crosshair                      |           53 |          15x15 |
| hotbar selection/background    |      54 / 55 | 24x24 / 182x22 |
| normal health half/full/empty  | 56 / 60 / 64 |            9x9 |
| hunger half/full/empty         | 66 / 70 / 74 |            9x9 |
| experience progress/background |      77 / 78 |          182x5 |
| armor half/empty/full          | 79 / 80 / 81 |            9x9 |
| oxygen empty/full              |      82 / 83 |            9x9 |

Replacement pixels are stored as premultiplied ARGB, as required by DefineBitsLossless2 format 5. Unlike the FUI PNG payloads, the SWF path does not swap red and blue. Serialization preserves
the original signature, SWF version, frame geometry/rate/count, tag order, and every unrelated
tag byte-for-byte. Only selected bitmap tag payloads and the necessary length/compression fields
are regenerated. The rebuilt SWF and ARC are both parsed again before output.

JPEXS source was inspected as secondary confirmation for the DefineBitsLossless2 field order and
premultiplication behavior. No JPEXS code is copied, bundled, or required at runtime; the browser
implementation and tests are independent.

Both real PS3 ARC files use the already validated big-endian ARC entry table: entry count,
name length, absolute payload offset, and size are big-endian, while payloads are contiguous in
entry order with no observed alignment padding. The Latest FUI image descriptors are 32-byte
little-endian records; unknown descriptor fields remain unchanged.

## Baselines and browser behavior

The PS3 bundles are fetched only after their exact version is selected:

| Bundle                       |             Size | SHA-256                                                            |
| ---------------------------- | ---------------: | ------------------------------------------------------------------ |
| `ps3-latest-base-assets.zip` | 10,737,481 bytes | `f48dd056d293fe442dbbd898288b7bbba27d805cac7331c38110c5dab3d42d02` |
| `ps3-1.8-base-assets.zip`    |  7,787,760 bytes | `fee5b4f5815f013c7c46102f2e42862c18635801807c064fb99c6e0f52ef68db` |

Latest and 1.8 have separate baseline cache entries. Switching versions cannot reuse an asset set
from the other version, and conversion rejects a version mismatch. Processing remains local to
the browser. If a Media/HUD rebuild fails after baseline validation, the original PS3 Media
archive remains in the output and only the HUD override is skipped; the report records a warning
and its internal structural detail.

## Validation boundary

Automated tests validate the two real reference archives when local references are present,
baseline manifests and image dimensions, FUI and SWF reconstruction, zlib round-trips, mapped
pixel bytes, unrelated tag and ARC-entry preservation, version-specific atlas definitions, UI
selection, complete conversion, ZIP output, linting, type checking, and production build checks.

These checks establish structural validity; they do not prove rendering on RPCS3 or PS3 hardware.
An emulator or console acceptance pass remains required for visual and runtime confirmation.
Neither inspected PS3 Common contains a vanilla `sky.png`. To meet the requested sky conversion,
the adapter uses the existing verified LCE custom-sky destination `Common/res/misc/sky.png`; this
specific override still needs PS3 runtime acceptance because the PS3 baseline alone cannot prove
that optional path.
