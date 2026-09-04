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

Java / Bedrock にのみ存在し、Wii U の対応先が確認できないテクスチャは、空き slot へ配置せず未対応として報告します。

## 開発

Node.js 22 以降を推奨します。

```bash
npm install
npm run dev
```

品質チェック:

```bash
npm run lint
npm run typecheck
npm run test
npm run build
```

`dist/` は単独で配信できる静的 Web アプリです。

## 構成

- `src/core/parsers/java/` — Java pack の検出・正規化
- `src/core/parsers/bedrock/` — Bedrock pack の検出・正規化
- `data/mappings/wiiu/` — atlas、armor、特殊画像、alias のマッピング
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
- 実機またはエミュレーターでの表示確認は、生成したパックごとに行ってください。

## ライセンス

本プロジェクトは [GNU General Public License v3.0](LICENSE) で公開します。Minecraft は Microsoft / Mojang の商標であり、このプロジェクトは公式製品ではありません。ゲーム由来のアセットは配布しません。詳しくは [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) を確認してください。
