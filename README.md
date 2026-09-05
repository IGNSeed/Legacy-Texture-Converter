# Legacy Texture Converter

Java Edition / Bedrock Edition のテクスチャパックを、Minecraft: Wii U Edition または Minecraft: Nintendo Switch Edition の Legacy Console Edition リソース構造へ変換するブラウザアプリです。アップロードしたファイルは外部サーバーへ送信せず、展開・画像処理・ZIP 生成をすべてブラウザ内で行います。

## 主な機能

- Java: ZIP、展開済みフォルダ、個別 PNG
- Bedrock: ZIP、MCPACK、展開済みフォルダ、個別 PNG
- ファイル選択、フォルダ選択、ドラッグ＆ドロップ
- Java / Bedrock の自動判定と、判定不能時の手動選択
- Wii U / Switch 1.0.17 のエディション別基準アセットを自動読み込み（手動アップロード不要）
- 出力先を Wii U / Nintendo Switch Edition から選択
- エディション固有の `items.png` / `terrain.png` / `particles.png` atlas 生成
- 16px / 32px block と、64px 以上から 32px への nearest-neighbor 縮小
- 入力解像度に追従する item atlas
- 最終 `terrain.png` からの mipmap 再生成
- armor、fire、water、lava、glint、particles の変換
- Java / Bedrock の GUI sheet から crosshair、hotbar、health、armor、hunger、oxygen、experience HUD を変換
- Java / Bedrock の `icons.png` と widget sheet を無加工で `Common/res/gui/` へコピー（`gui.png` は `widgets.png` に改名）
- Java の 3×2 custom Sky、または Bedrock の overworld cubemap 6面を LCE `sky.png`（4032×2688）へ変換
- Wii U `skinGraphicsHud.fui` と Switch の handheld / HD FUI を個別に再構築し、Media ARC へ再格納
- Wii U は BASE + UPD を統合した `Common/res/...` 出力
- Switch は Title ID `01006BD001E06000` の Atmosphère 配置済み ZIP を出力
- 未対応・スキップ・リサイズ・警告を含む変換レポート
- 日本語 / English UI（選択をブラウザに保存）
- zip-slip 対策を含む入力・出力パス検証

## Wii U 出力

Wii U ZIP に `BASE/` や `UPD/` は作らず、ゲームで使われる `Common/res/...` 構造を直接格納します。主要 atlas は次の確認済み構造です。

```text
Common/res/TitleUpdate/res/items.png
Common/res/TitleUpdate/res/terrain.png
Common/res/TitleUpdate/res/terrainMipMapLevel2.png
Common/res/TitleUpdate/res/terrainMipMapLevel3.png
Common/res/TitleUpdate/res/particles.png
Common/Media/MediaWiiU.arc
```

Wii U 基準アセットは公開用 ZIP としてアプリに同梱され、ページを開くとブラウザへ自動的に読み込まれます。利用者が BASE / UPD ZIP やフォルダを選択する必要はありません。入力テクスチャパックも引き続き外部サーバーへ送信されず、変換処理はブラウザ内で完結します。

基準リソースは `BundledWiiUBaseAssetProvider` が Pages の base URL に対応したパスから読み込み、PNG 形式・vanilla atlas 解像度・必須カテゴリを検証した `WiiUBaseAssetSet` として変換処理へ渡します。`items.png`、`terrain.png`、`particles.png` は Wii U vanilla 画像を土台にしますが、認識した slot は描画前に完全消去してから入力テクスチャを配置します。これにより入力画像の透明部分から元アイコンが透けず、slot 単位で置き換わります。入力に存在しない slot は基準画像のまま維持されます。

Java / Bedrock にのみ存在し、Wii U の対応先が確認できないテクスチャは、空き slot へ配置せず未対応として報告します。

GUI の raw copy は HUD/FUI 変換と独立して実行され、入力 PNG のバイト列を変更しません。Java Sky は OptiFine / MCPatcher の overworld custom-sky path を優先して 3×2 sheet 全体をリサイズします。Bedrock Sky は同一ディレクトリの `cubemap_0.png`～`cubemap_5.png` を、次の確認済み配置で結合してから 4032×2688 へリサイズします。

```text
[cubemap_5][cubemap_4][cubemap_2]
[cubemap_3][cubemap_0][cubemap_1]
```

## Nintendo Switch Edition 1.0.17 出力

Switch 出力は `References/switch/Common` の 1.0.17 実ファイルを調査し、Wii U の定数や画像を流用せず、専用の mapping・path・baseline・validation として実装しています。生成 ZIP は展開後にそのまま Atmosphère の SD カード配置になる構造です。

```text
atmosphere/
└─ contents/
   └─ 01006BD001E06000/
      └─ romfs/
         └─ Common/
            ├─ Media/
            │  └─ MediaNX.arc
            └─ res/
               ├─ 1_2_2/armor/...
               └─ TitleUpdate/res/...
```

Switch 1.0.17 の確認済み atlas は `items.png` が 256×272、`terrain.png` が 256×512、`particles.png` が 128×128 です。最終 terrain から 128×256 と 64×128 の mipmap を再生成します。armor、glint、fire、water、lava、portal、magma、prismarine、sea lantern、cauldron water、clock、compass も Switch 固有パスへ処理します。Switch に存在しない Aquatic 系の item / terrain / particle / armor は空き slot へ割り当てず、未対応としてレポートします。

Java の `.mcmeta` と Bedrock の flipbook 定義から解釈できる frame 順・時間は Console Edition のテキスト定義へ変換します。固定順で動く特殊画像は Switch の既定定義を維持し、clock / compass はゲーム側の runtime 制御用 strip として出力します。

調査根拠と Switch 固有差分は [`docs/switch-1.0.17.md`](docs/switch-1.0.17.md)、GUI/HUD の source rectangle・FUI descriptor・ARC/FUI 再構築仕様は [`docs/gui-hud-conversion.md`](docs/gui-hud-conversion.md) にまとめています。

## 開発

Node.js 22 以降を推奨します。

```bash
npm install
npm run dev
```

ルートの `index.html` はViteのソースエントリーポイントです。Windows Explorer等から直接ダブルクリックして起動する形式ではありません。

production buildをローカル確認する場合:

```bash
npm run build
npm run preview
```

previewは `http://localhost:4173/Legacy-Texture-Converter/` で確認できます。

品質チェック:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

`dist/` は GitHub project page 用の `/Legacy-Texture-Converter/` base で生成されます。`npm run build` は Pages 用 URL、ローカル専用ファイルの非混入、公開基準アセット ZIP の内容が manifest と一致することも検査します。

公開基準アセットを管理者が更新する場合は、ローカル専用の `LocalAssets/wiiu/default/` と `LocalAssets/switch/default/` を確認したうえで次を実行します。

```bash
npm run assets:bundle
```

このコマンドは各 `default-assets.json` に列挙されたレビュー済みファイルだけを、Wii U と Switch の `public/assets/.../default/*-base-assets.zip` へ格納します。片方だけを更新する場合は `npm run assets:bundle:wiiu` または `npm run assets:bundle:switch` を使用できます。`LocalAssets/` と `References/` 自体は公開されません。

## GitHub Pages

`main`へのpush後、GitHub Actionsが検査済みの`dist/`だけをPages artifactとしてdeployします。初回のみ、リポジトリの **Settings → Pages → Build and deployment → Source** で **GitHub Actions** を選択してください。

公開URL:

```text
https://ignseed.github.io/Legacy-Texture-Converter/
```

## 構成

- `src/core/parsers/java/` — Java pack の検出・正規化
- `src/core/parsers/bedrock/` — Bedrock pack の検出・正規化
- `data/mappings/wiiu/` — atlas、armor、特殊画像、alias のマッピング
- `data/mappings/switch/` — Switch 1.0.17 固有の atlas、armor、特殊画像、alias、基準 manifest
- `src/core/editions/common/` — エディション adapter が共有する変換契約と pipeline
- `src/core/binary/`, `src/core/gui-hud/` — ARC/FUI の安全な読込・再構築と GUI/HUD 変換
- `src/core/editions/wiiu/base-assets/` — 公開アセット provider、BASE/UPD 統合、検証、型付き基準アセット
- `src/core/editions/wiiu/` — Wii U 固有の出力・変換 adapter
- `src/core/editions/switch/` — Switch 固有の path、baseline、validation、変換 adapter
- `src/core/atlas/`, `image/`, `mipmap/`, `packaging/` — 共通処理
- `src/i18n/` — 日本語 / 英語 locale

## 既知の制限

- Switch 対応の基準バージョンは Nintendo Switch Edition 1.0.17 です。他バージョンの title / resource layout 互換性は保証しません。
- 出力先エディションに存在しない新しい Java / Bedrock コンテンツは変換せず、未対応として報告します。
- 複雑な Bedrock flipbook や、標準外の Java animation 定義は完全には再現できない場合があります。その場合は警告し、確認済みの出力先既定シーケンスを維持します。
- GUI/HUD 対応は確認済みの静的 HUD sprite に限定されます。menu layout、container、font、controller glyph、任意の FUI layout は変換しません。
- GUI sheet は 256×256 の正方形整数倍（最大 4096×4096）のみを扱い、nearest-neighbor で対象 sprite の実寸へ変換します。
- 非常に大きな item atlas がブラウザの安全な canvas 上限を超える場合は、明示的なエラーで停止します。
- 公開基準アセットには第三者のゲーム素材が含まれます。コードの GPL-3.0 ライセンスは、それらの素材に対する権利を付与しません。詳細は `THIRD_PARTY_NOTICES.md` を確認してください。
- 基準アセットの再生成元には `LocalAssets/` または `.local-assets/` を使用できます。両方とも Git 管理・production build の対象外です。
- 実機またはエミュレーターでの表示確認は、生成したパックごとに行ってください。
