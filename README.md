<p align="center">
  <img src="images/thumbnail.png" alt="Legacy Texture Converter" width="320"/>
  <br><br>
  <a href="https://ignseed.github.io/Legacy-Texture-Converter/">
    <img src="https://img.shields.io/badge/今すぐブラウザで試す-Live%20Demo-brightgreen?style=for-the-badge&logo=google-chrome&logoColor=white&labelColor=2e7d32" alt="Live Demo">
  </a>
  &nbsp;&nbsp;
  <img src="https://img.shields.io/badge/Minecraft-Legacy%20Console%20Edition-blue?style=for-the-badge&logo=minecraft&logoColor=white&labelColor=1976d2" alt="LCE">
</p>

<h1 align="center">Legacy Texture Converter</h1>

<p align="center">
  <b>Java / Bedrock Edition のテクスチャパックを<br>Minecraft Legacy Console Edition (LCE) 向けに変換・編集する<br>完全ブラウザベースのツール</b><br><br>
  <i>A powerful browser-based tool to convert and edit Java/Bedrock texture packs for Minecraft Legacy Console Edition.</i>
</p>

<p align="center">
  ✨ インストール不要 ・ 100% クライアントサイド ・ オフラインでも動作 ✨
</p>

---

## 🌟 主な機能 / Features

### 🗡 Items アトラス変換
- 個別アイテムPNGを `items.png` に一括パッキング
- タイルサイズ：8×8 〜 1024×1024 まで自由選択
- カスタムベース `items.png` の読み込み・継続対応
- 解像度がバラバラでも自動リサイズ＆配置

### 🧱 Terrain アトラス + MipMap自動生成
- ブロックPNG → `terrain.png` + `terrainMipMapLevel2.png` + `terrainMipMapLevel3.png`
- 16×16 と 32×32 タイル両対応
- MipMap は自動でダウンスケール生成
- カスタムベース `terrain.png` にも対応

### 🎨 GUI Editor (ARC / FUI)
- `.arc` アーカイブの展開・編集・再パック
- `.fui` ファイル内の全画像をプレビュー＆エクスポート
- PNG / JPEG で画像の差し替えが可能
- 内蔵テキストエディタ（.txt ファイル対応）
- R↔B 色チャンネルスワップ（LCE色補正用ワンクリック機能）

---

## 🚀 いますぐ使ってみる / Quick Start

1. **[https://ignseed.github.io/Legacy-Texture-Converter/](https://ignseed.github.io/Legacy-Texture-Converter/)** にアクセス  
   → ブラウザで即スタート！
2. またはリポジトリをダウンロード  
   ```bash
   git clone [https://github.com/ignseed/Legacy-Texture-Converter.git](https://github.com/ignseed/Legacy-Texture-Converter.git)