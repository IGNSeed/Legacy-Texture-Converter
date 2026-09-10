# Third-party notices

Minecraft, Minecraft: Wii U Edition, Minecraft: Nintendo Switch Edition, Java Edition, Bedrock Edition, and related assets are the property of their respective rights holders, including Microsoft and Mojang. The GPL-3.0 license in this repository does not grant rights to game artwork or other third-party material.

Legacy Texture Converter is an independent interoperability tool and is not affiliated with, endorsed by, or sponsored by Microsoft, Mojang, or Nintendo. The published baseline archives contain the Wii U and Nintendo Switch Edition 1.0.17 texture files needed by the browser-side conversion pipeline. Those third-party files retain their original ownership and are not relicensed under GPL-3.0.

The atlas coordinates were independently reorganized from factual compatibility information in the GPL-3.0-licensed [Java-to-LCE Texture Pack Converter](https://github.com/jeremy2206/Java-to-LCE-Texture-Pack-Converter) project by Jerem2206 and contributors. This project is distributed under GPL-3.0 to preserve compatible terms. No code, executable, or artwork from that project is included as a runtime dependency.

## Browser archive extraction

- **libarchive-wasm 1.2.0** — Copyright (c) 2021 ofk. MIT License. <https://github.com/ofk/libarchive-wasm>
- **libarchive 3.7.7** — Copyright (c) Tim Kientzle and contributors. BSD-style license. <https://github.com/libarchive/libarchive>
- **zlib 1.3.1** — Copyright (c) Jean-loup Gailly and Mark Adler. zlib License. <https://github.com/madler/zlib>
- **bzip2 1.0.8** — Copyright (c) Julian Seward. bzip2 License. <https://sourceware.org/bzip2/>
- **XZ Utils / liblzma 5.6.4** — Copyright (c) The Tukaani Project and contributors. Public-domain and compatible free-software terms as documented by the project. <https://tukaani.org/xz/>
- **OpenSSL 3.4.1** — Copyright (c) The OpenSSL Project Authors. Apache License 2.0. <https://www.openssl.org/>

`libarchive-wasm` and its Vite-managed WebAssembly asset are loaded only when a RAR or TAR-family input is opened. Archive contents remain in the browser and are not sent to a service.
