# Legacy Texture Converter

Java Edition / Bedrock Edition のテクスチャパックを、Minecraft: Wii U Edition の Legacy Console Edition リソース構造へ変換するブラウザアプリです。アップロードしたファイルは外部サーバーへ送信せず、展開・画像処理・ZIP 生成をすべてブラウザ内で行います。

## 主な機能

- Java: ZIP、展開済みフォルダ、個別 PNG
- Bedrock: ZIP、MCPACK、展開済みフォルダ、個別 PNG
- ファイル選択、フォルダ選択、ドラッグ＆ドロップ
- Java / Bedrock の自動判定と、判定不能時の手動選択
- 公開済み Wii U 基準アセットの自動読み込み（手動アップロード不要）
- Wii U の `items.png` / `terrain.png` / `particles.png` atlas 生成
- 16px / 32px block と、64px 以上から 32px への nearest-neighbor 縮小
- 入力解像度に追従する item atlas
- 最終 `terrain.png` からの mipmap 再生成
- armor、fire、water、lava、glint、particles の変換
- BASE + UPD を統合した `Common/res/...` 出力
- 未対応・スキップ・リサイズ・警告を含む変換レポート
- 日本語 / English UI（選択をブラウザに保存）
- zip-slip 対策を含む入力・出力パス検証

## Wii U 出力

初期版は Wii U Edition のみ出力できます。ZIP に `BASE/` や `UPD/` は作らず、ゲームで使われる `Common/res/...` 構造を直接格納します。主要 atlas は次の確認済み構造です。

```text
Common/res/TitleUpdate/res/items.png
Common/res/TitleUpdate/res/terrain.png
Common/res/TitleUpdate/res/terrainMipMapLevel2.png
Common/res/TitleUpdate/res/terrainMipMapLevel3.png
Common/res/TitleUpdate/res/particles.png
```

Wii U 基準アセットは公開用 ZIP としてアプリに同梱され、ページを開くとブラウザへ自動的に読み込まれます。利用者が BASE / UPD ZIP やフォルダを選択する必要はありません。入力テクスチャパックも引き続き外部サーバーへ送信されず、変換処理はブラウザ内で完結します。

基準リソースは `BundledWiiUBaseAssetProvider` が Pages の base URL に対応したパスから読み込み、PNG 形式・vanilla atlas 解像度・必須カテゴリを検証した `WiiUBaseAssetSet` として変換処理へ渡します。`items.png`、`terrain.png`、`particles.png` は Wii U vanilla 画像を土台にしますが、認識した slot は描画前に完全消去してから入力テクスチャを配置します。これにより入力画像の透明部分から元アイコンが透けず、slot 単位で置き換わります。入力に存在しない slot は基準画像のまま維持されます。

Java / Bedrock にのみ存在し、Wii U の対応先が確認できないテクスチャは、空き slot へ配置せず未対応として報告します。

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

公開基準アセットを管理者が更新する場合は、ローカル専用の `LocalAssets/wiiu/default/` を確認したうえで次を実行します。

```bash
npm run assets:bundle
```

このコマンドは `data/mappings/wiiu/default-assets.json` に列挙されたファイルだけを `public/assets/wiiu/default/wiiu-base-assets.zip` へ格納します。`LocalAssets/` と `References/` 自体は公開されません。

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
- `src/core/editions/wiiu/base-assets/` — 公開アセット provider、BASE/UPD 統合、検証、型付き基準アセット
- `src/core/editions/wiiu/` — Wii U 固有の出力・変換 adapter
- `src/core/atlas/`, `image/`, `mipmap/`, `packaging/` — 共通処理
- `src/i18n/` — 日本語 / 英語 locale

Nintendo Switch Edition は未実装ですが、target edition adapter を追加できる構造に分離しています。

## 既知の制限

- Switch Edition 出力には未対応です。
- Wii U に存在しない新しい Java / Bedrock コンテンツは変換しません。
- 複雑な Bedrock flipbook や、標準外の Java animation 定義は完全には再現できない場合があります。その場合は警告し、確認済みの Wii U 既定シーケンスを維持します。
- 非常に大きな item atlas がブラウザの安全な canvas 上限を超える場合は、明示的なエラーで停止します。
- 公開基準アセットには第三者のゲーム素材が含まれます。コードの GPL-3.0 ライセンスは、それらの素材に対する権利を付与しません。詳細は `THIRD_PARTY_NOTICES.md` を確認してください。
- 基準アセットの再生成元には `LocalAssets/` または `.local-assets/` を使用できます。両方とも Git 管理・production build の対象外です。
- 実機またはエミュレーターでの表示確認は、生成したパックごとに行ってください。
