# Legacy Texture Converter

Java Edition / Bedrock Edition のテクスチャパックを、Minecraft: Wii U Edition の Legacy Console Edition リソース構造へ変換するブラウザアプリです。アップロードしたファイルは外部サーバーへ送信せず、展開・画像処理・ZIP 生成をすべてブラウザ内で行います。

## 主な機能

- Java: ZIP、展開済みフォルダ、個別 PNG
- Bedrock: ZIP、MCPACK、展開済みフォルダ、個別 PNG
- ファイル選択、フォルダ選択、ドラッグ＆ドロップ
- Java / Bedrock の自動判定と、判定不能時の手動選択
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

変換前に、ご自身が正当に取得した Wii U リソース dump の BASE / UPD ZIP を同時に選択するか、両方を含むフォルダを選択します。アプリは必要な基準ファイルをブラウザ内で統合し、入力パックに存在しない対象をそのまま維持します。ゲームファイルはリポジトリや外部サーバーへ送信されません。

基準リソースは `UserProvidedWiiUBaseAssetProvider` が読み込み、`UPD > BASE` の優先順位で統合してから、PNG形式・vanilla atlas解像度・必須カテゴリを検証した `WiiUBaseAssetSet` として変換処理へ渡します。`items.png`、`terrain.png`、`particles.png` はWii U vanilla画像を土台にし、認識したslotだけを上書きします。高解像度時も土台全体をnearest-neighborで拡大するため、未変更slotは維持されます。

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

`dist/` はGitHub project page用の `/Legacy-Texture-Converter/` baseで生成されます。`npm run build` はPages用URLと、ローカル専用ファイル・未審査画像が混入していないことも検査します。

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
- `src/core/editions/wiiu/base-assets/` — provider、BASE/UPD統合、検証、型付き基準アセット
- `src/core/editions/wiiu/` — Wii U 固有の出力・変換 adapter
- `src/core/atlas/`, `image/`, `mipmap/`, `packaging/` — 共通処理
- `src/i18n/` — 日本語 / 英語 locale

Nintendo Switch Edition は未実装ですが、target edition adapter を追加できる構造に分離しています。

## 既知の制限

- Switch Edition 出力には未対応です。
- Wii U に存在しない新しい Java / Bedrock コンテンツは変換しません。
- 複雑な Bedrock flipbook や、標準外の Java animation 定義は完全には再現できない場合があります。その場合は警告し、確認済みの Wii U 既定シーケンスを維持します。
- 非常に大きな item atlas がブラウザの安全な canvas 上限を超える場合は、明示的なエラーで停止します。
- 権利保護のため Wii U のゲームアセットは同梱しません。変換には利用者自身の BASE + UPD リソース dump が必要です。
- 開発者がローカル確認用に置くゲームアセットは `LocalAssets/` または `.local-assets/` を使用できます。両方ともGit管理・production buildの対象外です。
- 実機またはエミュレーターでの表示確認は、生成したパックごとに行ってください。