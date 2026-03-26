// ════════════════════════════════════════════════════════════════════════════
// ─── i18n ────────────────────────────────────────────────────────────────────
// ════════════════════════════════════════════════════════════════════════════

const I18N = {
  ja: {
    /* tabs */
    'tab.items':  '🗡 Items',
    'tab.terrain':'🧱 Terrain',
    'tab.gui':    '🎨 GUI',
    /* common */
    'reset':         '↺ リセット',
    'resLabel':      '出力解像度 (1タイル)',
    'dropLabel':     'ドロップ または クリックして選択',
    'dropOverride':  '上書きする場合はここにドロップ',
    'tagReq':        '必須',
    'tagOpt':        '任意',
    'mappingCard':   'マッピング確認',
    'convertCard':   '変換 & ダウンロード',
    'btnConvert':    '⚙ 変換する',
    'howToUse':      '使い方',
    'thStatus':      '状態',
    'thFile':        'ファイル名',
    'thPos':         '配置先 (x, y)',
    'thNote':        '備考',
    /* items */
    'items.card1':       'テクスチャ & 設定',
    'items.colItems':    'アイテム PNG',
    'items.colBase':     'ベース items.png',
    'items.dropSubItems':'PNG / .zip / .mcpack — apple.png, diamond_sword.png …',
    'items.baseDefault': 'デフォルト: images/items.png',
    'items.notice':      '💡 ベース未選択時は <code>images/items.png</code> を自動使用します。解像度が異なる画像は自動リサイズ。マッチスロットは新テクスチャで完全上書きします。',
    'items.help':        '📦 <strong>.zip / .mcpack</strong>: リソースパックを丸ごとドロップすると <code>textures/items/</code> 内の PNG を自動抽出<br>📂 <strong>Java</strong>: <code>assets/minecraft/textures/item/</code> 内の PNG を複数選択<br>📂 <strong>Bedrock</strong>: <code>textures/items/</code> 内の PNG を選択<br>🖼️ ベース未選択時は <code>images/items.png</code> を自動ベースとして使用<br>🔲 選択解像度と異なるサイズの画像は自動リサイズ',
    'items.dlBtn':       '⬇ items.png',
    /* terrain */
    'terrain.card1':        'テクスチャ & 設定',
    'terrain.colBlocks':    'ブロック PNG',
    'terrain.colBase':      'ベース terrain.png',
    'terrain.dropSubBlocks':'PNG / .zip / .mcpack — grass_block_top.png, stone.png …',
    'terrain.baseDefault':  'デフォルト: images/terrain_16x.png',
    'terrain.notice':       '💡 ベース未選択時は解像度に応じて <code>images/terrain_16x.png</code> または <code>images/terrain_32x.png</code> を自動使用。変換後に <code>terrain.png</code>・<code>terrainMipMapLevel2.png</code>・<code>terrainMipMapLevel3.png</code> の3ファイルを出力します。解像度が異なる画像は自動リサイズ。',
    'terrain.help':         '📦 <strong>.zip / .mcpack</strong>: リソースパックを丸ごとドロップすると <code>textures/blocks/</code> 内の PNG を自動抽出<br>📂 <strong>Java</strong>: <code>assets/minecraft/textures/block/</code> 内の PNG を複数選択<br>📂 <strong>Bedrock</strong>: <code>textures/blocks/</code> 内の PNG を選択<br>🖼️ ベース未選択時は <code>images/terrain_16x.png</code> / <code>images/terrain_32x.png</code> を自動ベースとして使用<br>🔲 解像度は <strong>16×16</strong> または <strong>32×32</strong> のみ<br>📦 変換後に <code>terrain.png</code>・<code>terrainMipMapLevel2.png</code>・<code>terrainMipMapLevel3.png</code> の3ファイルが生成されます',
    'terrain.dl1':          '⬇ terrain.png',
    'terrain.dl2':          '⬇ MipMap L2',
    'terrain.dl3':          '⬇ MipMap L3',
    /* gui */
    'gui.card1':      'ARC ファイル',
    'gui.card2':      'ファイル ブラウザ',
    'gui.card3':      '保存 & ダウンロード',
    'gui.colArc':     'ARC ファイル',
    'gui.dropSubArc': '.arc ファイルを選択',
    'gui.btnExpand':  '⚙ 展開する',
    'gui.notice':     '💡 Minecraft Legacy Console Edition の <code>.arc</code> ファイルを読み込み、内部の <code>.fui</code> ファイルの画像を閲覧・置き換えできます。',
    'gui.treeHeader': 'ファイル一覧',
    'gui.colorSwap':  '色補正 R↔B',
    'gui.invertDisplay': '色反転補正 (表示のみ)',
    'gui.btnReplace': '↩ 置き換え',
    'gui.btnSaveImg': '⬇ 画像を保存',
    'gui.btnTxtSave': '💾 変更を適用',
    'gui.btnDownload':'⬇ ARC をダウンロード',
    'gui.help':       '📦 <strong>ARC ファイル</strong>: Minecraft Legacy Console Edition の <code>.arc</code> ファイルを選択<br>🎨 <strong>FUI ファイル</strong>: ツリーで <code>.fui</code> をクリックすると内部の画像一覧が表示されます<br>↩ <strong>置き換え</strong>: 画像サムネイルを選択して PNG / JPEG で上書きできます<br>⬇ <strong>保存</strong>: 変更を含む <code>.arc</code> ファイルをダウンロードします',
    /* log messages */
    'log.customBaseLoaded':   '✓ カスタムベース items.png を読み込みました',
    'log.customBaseFail':     '✗ カスタムベース読み込み失敗',
    'log.tplLoaded':          (p) => `✓ テンプレート (${p}) を読み込みました`,
    'log.tplFail':            '⚠ テンプレート読み込み失敗 — 空ベースで続行',
    'log.itemsDone':          (d,r) => `✓ 完了: ${d} アイテム / リサイズ ${r}件`,
    'log.terrainDone':        (d,r) => `✓ 完了: ${d} ブロック / リサイズ ${r}件`,
    'log.mipGen':             '⚙ MipMapLevel2 / Level3 を生成中…',
    'log.mipInfo':            (a,b,c,d) => `✓ terrain: ${a}×${b}  MipL2: ${c}×${c}  MipL3: ${d}×${d}`,
    'log.readFail':           (n) => `✗ 読み込み失敗: ${n}`,
    'log.zipExtracting':      (n) => `⚙ ${n} を解析中…`,
    'log.zipExtracted':       (n, name) => `✓ ${name} から ${n} ファイルを抽出しました`,
    'log.zipNoFiles':         '⚠ ZIP 内に対応するテクスチャが見つかりませんでした',
    'log.zipError':           (m) => `✗ ZIP 読み込みエラー: ${m}`,
    'log.guiExpanded':        (n,c) => `✓ ${n} を展開しました (${c} ファイル)`,
    'log.guiParseErr':        (m) => `✗ 解析エラー: ${m}`,
    'log.guiFuiOpened':       (n,c) => `✓ ${n} を開きました (${c} 画像)`,
    'log.guiFuiErr':          (n,m) => `✗ FUI 解析エラー (${n}): ${m}`,
    'log.guiTxtOpened':       (n,b) => `✓ ${n} を開きました (${b} bytes)`,
    'log.guiTxtSaved':        (n) => `✓ 変更を適用: ${n}`,
    'log.guiImgSaved':        (n) => `✓ 保存: ${n}`,
    'log.guiColorErr':        (i,m) => `✗ 色補正エラー (#${i}): ${m}`,
    'log.guiImgReplaced':     (i,w,h) => `✓ 画像 #${i} を置き換えました (${w}×${h})`,
    'log.guiImgLoadFail':     '✗ 画像の読み込みに失敗しました',
    'log.guiReplaceErr':      (m) => `✗ エラー: ${m}`,
    'log.guiFuiUpdated':      (n) => `✓ FUI を更新: ${n}`,
    'log.guiFuiWriteErr':     (m) => `✗ FUI 書き込みエラー: ${m}`,
    'log.guiArcDownloaded':   (b) => `✓ ARC をダウンロード (${b} bytes)`,
    'log.guiArcWriteErr':     (m) => `✗ ARC 書き込みエラー: ${m}`,
    'log.guiFmtDetected':     (l) => `フォーマット検出: ${l}`,
    'log.guiNoFmt':           'ARC フォーマットを認識できませんでした。ファイルが対応形式か確認してください。',
    /* stats */
    'stats.total': '合計',
    'stats.match': '一致',
    'stats.skip':  'スキップ',
    'map.matched': '一致',
    'map.unmatched':'未一致',
    'map.skip':    'スキップ',
    /* confirm */
    'confirm.reset':'全ての入力・出力をリセットしますか？',
    /* hint */
    'hint.files':       (n) => `${n} ファイル読み込み済み`,
    'hint.customBase':  'カスタムベース選択済み',
    /* pack mode */
    'tab.pack':         '📦 Pack',
    'pack.card1':       'リソースパック',
    'pack.dropSub':     '.zip または .mcpack をドロップ',
    'pack.notice':      '💡 リソースパック (.zip / .mcpack) をドロップすると <code>items.png</code> と <code>terrain.png</code> を一括生成します。ポップアップで解像度やベース画像を設定してください。',
    'pack.help':        '📦 <strong>.zip / .mcpack</strong>: リソースパックファイルを丸ごとドロップ<br>⚙ ポップアップで <strong>Items 解像度</strong>・<strong>Terrain 解像度</strong>・<strong>ベース画像</strong>を設定<br>🖼️ ベース未選択時は <code>images/items.png</code> / <code>images/terrain_16x.png</code> を自動使用<br>📄 <code>items.png</code>・<code>terrain.png</code>・<code>terrainMipMapLevel2.png</code>・<code>terrainMipMapLevel3.png</code> の4ファイルを出力',
    /* modal */
    'modal.title':      '⚙ 変換設定',
    'modal.openBtn':    '⚙ 設定を変更',
    'modal.itemsRes':   '🗡 Items 解像度',
    'modal.terrainRes': '🧱 Terrain 解像度',
    'modal.baseImages': '🖼️ ベース画像',
    'modal.apply':      '確定',
    'modal.cancel':     'キャンセル',
    'modal.iStats':     (n, m) => `🗡 ${n} ファイル検出 / 一致: <strong>${m}</strong>`,
    'modal.tStats':     (n, m) => `🧱 ${n} ファイル検出 / 一致: <strong>${m}</strong>`,
    'modal.detectedRes':  (r) => `🔍 検出解像度: ${r}×${r}`,
    'modal.detectedNone': '🔍 検出解像度: —',
    'modal.resMismatch':  (det, sel) => `テクスチャの検出解像度 (${det}×${det}) と選択した出力解像度 (${sel}×${sel}) が異なります。\nリサイズして変換しますか？`,
    /* pack convert */
    'pack.noItems':     '⚠ Items テクスチャが見つかりません — スキップ',
    'pack.noTerrain':   '⚠ Terrain テクスチャが見つかりません — スキップ',
    'pack.allDone':     (i, t) => `✓ 完了 — Items: ${i} / Terrain: ${t}`,
    'pack.dlZip':       '⬇ まとめてダウンロード (.zip)',
    'pack.dlZipBuilding': '⚙ ZIP を生成中…',
    /* res info */
    'resInfo.items':    (w,h) => `→ 出力: ${w} × ${h} px`,
    'resInfo.terrain':  (w,h,hw,hh,qw,qh) => `→ ${w}×${h} / MipL2: ${hw}×${hh} / MipL3: ${qw}×${qh} px`,
    /* gui strings */
    'gui.selectImg':    '画像を選択してください',
    'gui.nSelected':    (n) => `${n} 枚選択中`,
    'gui.fuiTitle':     (n,c) => `${n}  (${c} 画像)  Ctrl+クリックで複数選択`,
    /* pack gui */
    'pack.guiCard':        '🎨 GUI コンバート',
    'pack.guiBadge':       'icons.png / widgets.png → .fui',
    'pack.guiArcLabel':    'ARC ファイル',
    'pack.guiArcSub':      '.arc ファイルをドロップ (省略可)',
    'pack.guiNotice':      '💡 パック内の <code>gui/icons.png</code> / <code>gui/widgets.png</code> / <code>gui/gui.png</code> から HUD 要素を切り抜いて ZIP で保存します。',
    'pack.guiBtnConvert':  '⚙ GUI コンバート',
    'pack.guiBtnCropsDl':  '⬇ 切り抜きを保存 (.zip)',
    'pack.guiBtnArcDl':    '⬇ ARC をダウンロード',
    'pack.guiConvDone':    (n) => `✓ ${n} 個の切り抜きを生成`,
    'pack.guiArcDone':     (b) => `✓ ARC 生成完了 (${b} bytes)`,
    'pack.guiArcLoaded':   (n) => `✓ ARC 読み込み: ${n} ファイル`,
    'pack.guiArcFetching': '⏳ MediaARC/MediaWiiU.arc を読み込み中...',
    'pack.guiArcFail':     (m) => `✗ ARC 読み込み失敗: ${m}`,
    'pack.guiFuiNotFound': (n) => `⚠ ${n} が ARC 内に見つかりません`,
    'pack.guiFuiErr':      (n,m) => `✗ FUI 処理エラー (${n}): ${m}`,
    'pack.guiImgReplaced': (n,i) => `✓ ${n} #${i} を置き換え`,
    'pack.guiIdxOob':      (n,i,c) => `⚠ ${n} #${i} はインデックス範囲外 (${c} 画像)`,
    'pack.guiCrop':        (lbl,w,h) => `✓ 切り抜き: ${lbl} (${w}×${h})`,
    'pack.guiNoGui':       '⚠ GUI テクスチャが見つかりませんでした (icons.png / widgets.png)',
    'pack.guiIcons':       '✓ icons.png 検出',
    'pack.guiWidgets':     '✓ widgets.png 検出',
    'pack.guiGui':         '✓ gui.png 検出',
  },

  en: {
    /* tabs */
    'tab.items':  '🗡 Items',
    'tab.terrain':'🧱 Terrain',
    'tab.gui':    '🎨 GUI',
    /* common */
    'reset':         '↺ Reset',
    'resLabel':      'Output resolution (1 tile)',
    'dropLabel':     'Drop or click to select',
    'dropOverride':  'Drop here to override',
    'tagReq':        'Required',
    'tagOpt':        'Optional',
    'mappingCard':   'Mapping Preview',
    'convertCard':   'Convert & Download',
    'btnConvert':    '⚙ Convert',
    'howToUse':      'How to Use',
    'thStatus':      'Status',
    'thFile':        'File Name',
    'thPos':         'Position (x, y)',
    'thNote':        'Note',
    /* items */
    'items.card1':       'Texture & Settings',
    'items.colItems':    'Item PNGs',
    'items.colBase':     'Base items.png',
    'items.dropSubItems':'PNG / .zip / .mcpack — apple.png, diamond_sword.png …',
    'items.baseDefault': 'Default: images/items.png',
    'items.notice':      '💡 If no base is selected, <code>images/items.png</code> is used automatically. Images with a different resolution are auto-resized. Matched slots are fully overwritten with the new texture.',
    'items.help':        '📦 <strong>.zip / .mcpack</strong>: Drop the whole resource pack to auto-extract PNGs from <code>textures/items/</code><br>📂 <strong>Java</strong>: Select PNGs from <code>assets/minecraft/textures/item/</code><br>📂 <strong>Bedrock</strong>: Select PNGs from <code>textures/items/</code><br>🖼️ Without a base file, <code>images/items.png</code> is used automatically<br>🔲 Images with a different resolution than selected are auto-resized',
    'items.dlBtn':       '⬇ items.png',
    /* terrain */
    'terrain.card1':        'Texture & Settings',
    'terrain.colBlocks':    'Block PNGs',
    'terrain.colBase':      'Base terrain.png',
    'terrain.dropSubBlocks':'PNG / .zip / .mcpack — grass_block_top.png, stone.png …',
    'terrain.baseDefault':  'Default: images/terrain_16x.png',
    'terrain.notice':       '💡 Without a base, <code>images/terrain_16x.png</code> or <code>images/terrain_32x.png</code> is chosen automatically based on resolution. Outputs three files: <code>terrain.png</code>, <code>terrainMipMapLevel2.png</code>, and <code>terrainMipMapLevel3.png</code>. Images with a different resolution are auto-resized.',
    'terrain.help':         '📦 <strong>.zip / .mcpack</strong>: Drop the whole resource pack to auto-extract PNGs from <code>textures/blocks/</code><br>📂 <strong>Java</strong>: Select PNGs from <code>assets/minecraft/textures/block/</code><br>📂 <strong>Bedrock</strong>: Select PNGs from <code>textures/blocks/</code><br>🖼️ Without a base, <code>images/terrain_16x.png</code> / <code>images/terrain_32x.png</code> is used automatically<br>🔲 Only <strong>16×16</strong> or <strong>32×32</strong> tile resolution<br>📦 Three files are generated: <code>terrain.png</code>, <code>terrainMipMapLevel2.png</code>, <code>terrainMipMapLevel3.png</code>',
    'terrain.dl1':          '⬇ terrain.png',
    'terrain.dl2':          '⬇ MipMap L2',
    'terrain.dl3':          '⬇ MipMap L3',
    /* gui */
    'gui.card1':      'ARC File',
    'gui.card2':      'File Browser',
    'gui.card3':      'Save & Download',
    'gui.colArc':     'ARC File',
    'gui.dropSubArc': 'Select an .arc file',
    'gui.btnExpand':  '⚙ Extract',
    'gui.notice':     '💡 Load a Minecraft Legacy Console Edition <code>.arc</code> file to browse and replace images inside <code>.fui</code> files.',
    'gui.treeHeader': 'File List',
    'gui.colorSwap':  'Color fix R↔B',
    'gui.invertDisplay': 'Invert colors (display only)',
    'gui.btnReplace': '↩ Replace',
    'gui.btnSaveImg': '⬇ Save Image',
    'gui.btnTxtSave': '💾 Apply Changes',
    'gui.btnDownload':'⬇ Download ARC',
    'gui.help':       '📦 <strong>ARC File</strong>: Select a Minecraft Legacy Console Edition <code>.arc</code> file<br>🎨 <strong>FUI File</strong>: Click a <code>.fui</code> entry in the tree to view its images<br>↩ <strong>Replace</strong>: Select a thumbnail and overwrite it with a PNG / JPEG<br>⬇ <strong>Save</strong>: Download the <code>.arc</code> file including all changes',
    /* log messages */
    'log.customBaseLoaded':   '✓ Loaded custom base items.png',
    'log.customBaseFail':     '✗ Failed to load custom base',
    'log.tplLoaded':          (p) => `✓ Loaded template (${p})`,
    'log.tplFail':            '⚠ Template load failed — continuing with empty base',
    'log.itemsDone':          (d,r) => `✓ Done: ${d} items / ${r} resized`,
    'log.terrainDone':        (d,r) => `✓ Done: ${d} blocks / ${r} resized`,
    'log.mipGen':             '⚙ Generating MipMapLevel2 / Level3…',
    'log.mipInfo':            (a,b,c,d) => `✓ terrain: ${a}×${b}  MipL2: ${c}×${c}  MipL3: ${d}×${d}`,
    'log.readFail':           (n) => `✗ Failed to load: ${n}`,
    'log.zipExtracting':      (n) => `⚙ Reading ${n}…`,
    'log.zipExtracted':       (n, name) => `✓ Extracted ${n} file(s) from ${name}`,
    'log.zipNoFiles':         '⚠ No matching textures found in the ZIP',
    'log.zipError':           (m) => `✗ ZIP read error: ${m}`,
    'log.guiExpanded':        (n,c) => `✓ Extracted ${n} (${c} files)`,
    'log.guiParseErr':        (m) => `✗ Parse error: ${m}`,
    'log.guiFuiOpened':       (n,c) => `✓ Opened ${n} (${c} images)`,
    'log.guiFuiErr':          (n,m) => `✗ FUI parse error (${n}): ${m}`,
    'log.guiTxtOpened':       (n,b) => `✓ Opened ${n} (${b} bytes)`,
    'log.guiTxtSaved':        (n) => `✓ Changes applied: ${n}`,
    'log.guiImgSaved':        (n) => `✓ Saved: ${n}`,
    'log.guiColorErr':        (i,m) => `✗ Color swap error (#${i}): ${m}`,
    'log.guiImgReplaced':     (i,w,h) => `✓ Replaced image #${i} (${w}×${h})`,
    'log.guiImgLoadFail':     '✗ Failed to load image',
    'log.guiReplaceErr':      (m) => `✗ Error: ${m}`,
    'log.guiFuiUpdated':      (n) => `✓ FUI updated: ${n}`,
    'log.guiFuiWriteErr':     (m) => `✗ FUI write error: ${m}`,
    'log.guiArcDownloaded':   (b) => `✓ ARC downloaded (${b} bytes)`,
    'log.guiArcWriteErr':     (m) => `✗ ARC write error: ${m}`,
    'log.guiFmtDetected':     (l) => `Format detected: ${l}`,
    'log.guiNoFmt':           'Could not recognize ARC format. Please verify the file is supported.',
    /* stats */
    'stats.total': 'Total',
    'stats.match': 'Matched',
    'stats.skip':  'Skipped',
    'map.matched': 'Matched',
    'map.unmatched':'No match',
    'map.skip':    'Skip',
    /* confirm */
    'confirm.reset':'Reset all inputs and outputs?',
    /* hint */
    'hint.files':       (n) => `${n} file(s) loaded`,
    'hint.customBase':  'Custom base selected',
    /* pack mode */
    'tab.pack':         '📦 Pack',
    'pack.card1':       'Resource Pack',
    'pack.dropSub':     'Drop a .zip or .mcpack file',
    'pack.notice':      '💡 Drop a resource pack (.zip / .mcpack) to generate <code>items.png</code> and <code>terrain.png</code> at once. Configure resolution and base images in the popup.',
    'pack.help':        '📦 <strong>.zip / .mcpack</strong>: Drop the whole resource pack file<br>⚙ Set <strong>Items resolution</strong>, <strong>Terrain resolution</strong>, and <strong>base images</strong> in the popup<br>🖼️ Without a base file, <code>images/items.png</code> / <code>images/terrain_16x.png</code> are used automatically<br>📄 Outputs <code>items.png</code>, <code>terrain.png</code>, <code>terrainMipMapLevel2.png</code>, <code>terrainMipMapLevel3.png</code>',
    /* modal */
    'modal.title':      '⚙ Convert Settings',
    'modal.openBtn':    '⚙ Change Settings',
    'modal.itemsRes':   '🗡 Items Resolution',
    'modal.terrainRes': '🧱 Terrain Resolution',
    'modal.baseImages': '🖼️ Base Images',
    'modal.apply':      'Apply',
    'modal.cancel':     'Cancel',
    'modal.iStats':     (n, m) => `🗡 ${n} files found / matched: <strong>${m}</strong>`,
    'modal.tStats':     (n, m) => `🧱 ${n} files found / matched: <strong>${m}</strong>`,
    'modal.detectedRes':  (r) => `🔍 Detected resolution: ${r}×${r}`,
    'modal.detectedNone': '🔍 Detected resolution: —',
    'modal.resMismatch':  (det, sel) => `Detected texture resolution (${det}×${det}) differs from selected output resolution (${sel}×${sel}).\nProceed with resizing?`,
    /* pack convert */
    'pack.noItems':     '⚠ No Items textures found — skipping',
    'pack.noTerrain':   '⚠ No Terrain textures found — skipping',
    'pack.allDone':     (i, t) => `✓ Done — Items: ${i} / Terrain: ${t}`,
    'pack.dlZip':       '⬇ Download All (.zip)',
    'pack.dlZipBuilding': '⚙ Building ZIP…',
    /* res info */
    'resInfo.items':    (w,h) => `→ Output: ${w} × ${h} px`,
    'resInfo.terrain':  (w,h,hw,hh,qw,qh) => `→ ${w}×${h} / MipL2: ${hw}×${hh} / MipL3: ${qw}×${qh} px`,
    /* gui strings */
    'gui.selectImg':    'Select an image',
    'gui.nSelected':    (n) => `${n} selected`,
    'gui.fuiTitle':     (n,c) => `${n}  (${c} images)  Ctrl+click to multi-select`,
    /* pack gui */
    'pack.guiCard':        '🎨 GUI Convert',
    'pack.guiBadge':       'icons.png / widgets.png → .fui',
    'pack.guiArcLabel':    'ARC File',
    'pack.guiArcSub':      'Drop .arc file here (optional)',
    'pack.guiNotice':      '💡 Crops HUD elements from <code>gui/icons.png</code> / <code>gui/widgets.png</code> / <code>gui/gui.png</code> found in the pack and saves them as a ZIP.',
    'pack.guiBtnConvert':  '⚙ Convert GUI',
    'pack.guiBtnCropsDl':  '⬇ Save Crops (.zip)',
    'pack.guiBtnArcDl':    '⬇ Download ARC',
    'pack.guiConvDone':    (n) => `✓ Generated ${n} crop(s)`,
    'pack.guiArcDone':     (b) => `✓ ARC built (${b} bytes)`,
    'pack.guiArcLoaded':   (n) => `✓ ARC loaded: ${n} files`,
    'pack.guiArcFetching': '⏳ Loading MediaARC/MediaWiiU.arc...',
    'pack.guiArcFail':     (m) => `✗ ARC load failed: ${m}`,
    'pack.guiFuiNotFound': (n) => `⚠ ${n} not found in ARC`,
    'pack.guiFuiErr':      (n,m) => `✗ FUI error (${n}): ${m}`,
    'pack.guiImgReplaced': (n,i) => `✓ Replaced ${n} #${i}`,
    'pack.guiIdxOob':      (n,i,c) => `⚠ ${n} #${i} out of range (${c} images)`,
    'pack.guiCrop':        (lbl,w,h) => `✓ Crop: ${lbl} (${w}×${h})`,
    'pack.guiNoGui':       '⚠ No GUI textures found (icons.png / widgets.png)',
    'pack.guiIcons':       '✓ icons.png detected',
    'pack.guiWidgets':     '✓ widgets.png detected',
    'pack.guiGui':         '✓ gui.png detected',
  }
};

let currentLang = 'ja';

function t(key, ...args) {
  const dict = I18N[currentLang];
  const val = dict[key];
  if (val === undefined) return key;
  if (typeof val === 'function') return val(...args);
  return val;
}

function applyI18n() {
  // text nodes
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    const val = I18N[currentLang][key];
    if (val !== undefined && typeof val === 'string') el.textContent = val;
  });
  // html nodes
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const key = el.dataset.i18nHtml;
    const val = I18N[currentLang][key];
    if (val !== undefined && typeof val === 'string') el.innerHTML = val;
  });
  // lang button label
  document.getElementById('btnLang').textContent = currentLang === 'ja' ? 'EN' : 'JP';
  document.documentElement.lang = currentLang;

  // update dynamic labels that may have already been set
  if (!iBaseFile) {
    document.getElementById('modalItemsBaseLbl').textContent = t('items.baseDefault');
  }
  if (!tBaseFile) {
    document.getElementById('modalTerrainBaseLbl').textContent = t('terrain.baseDefault');
  }
  // update hint
  const ic = Object.keys(iFiles).length, tc2 = Object.keys(tFiles).length;
  if (ic > 0 || tc2 > 0) {
    document.getElementById('hintPack').textContent = `🗡 ${ic}  🧱 ${tc2}`;
  }

  // re-render mapping tables (to update status text)
  if (ic > 0) updateItemsMapping();
  if (tc2 > 0) updateTerrainMapping();

  // update res info labels
  document.getElementById('modalItemsResInfo').textContent = itemsInfoFn(iTS);
  document.getElementById('modalTerrainResInfo').textContent = terrainInfoFn(tTS);
}

function toggleLang() {
  currentLang = currentLang === 'ja' ? 'en' : 'ja';
  applyI18n();
}

// ─── ITEMS Tile Map ───────────────────────────────────────────────────────────
const ITEMS_MAP = {
"acacia_boat":[128,208],"acacia_door":[0,208],"apple":[160,0],"apple_golden":[176,0],
"armor_stand":[128,192],"wooden_armorstand":[128,192],"arrow":[80,32],
"baked_potato":[96,112],"potato_baked":[96,112],"barrier":[48,176],
"beef":[144,96],"beef_cooked":[160,96],"beef_raw":[144,96],"cooked_beef":[160,96],
"beetroot":[16,192],"beetroot_seeds":[32,192],"beetroot_soup":[48,192],"bed":[208,32],
"birch_boat":[144,208],"birch_door":[16,208],"blaze_powder":[208,144],"blaze_rod":[192,96],
"bone":[192,16],"bone_meal":[240,176],
"book":[176,48],"book_enchanted":[240,192],"book_normal":[176,48],
"book_writable":[176,176],"book_written":[192,176],
"enchanted_book":[240,192],"writable_book":[176,176],"written_book":[192,176],
"bow":[80,16],"bow_pulling_0":[80,96],"bow_pulling_1":[80,112],"bow_pulling_2":[80,128],"bow_standby":[80,16],
"bowl":[112,64],"bread":[144,32],"brewing_stand":[192,160],"brick":[96,16],
"broken_elytra":[240,16],"bucket":[160,64],"bucket_empty":[160,64],
"bucket_lava":[192,64],"bucket_milk":[208,64],"bucket_water":[176,64],
"lava_bucket":[192,64],"milk_bucket":[208,64],"water_bucket":[176,64],
"cactus_green":[224,96],"cake":[208,16],"carrot":[128,112],
"carrot_golden":[96,144],"golden_carrot":[96,144],"carrot_on_a_stick":[96,96],
"cauldron":[192,144],
"chainmail_boots":[16,48],"chainmail_chestplate":[16,16],"chainmail_helmet":[16,0],"chainmail_leggings":[16,32],
"charcoal":[128,160],"chest_minecart":[112,144],"minecart_chest":[112,144],
"chicken":[144,112],"chicken_cooked":[160,112],"chicken_raw":[144,112],"cooked_chicken":[160,112],
"chorus_fruit":[240,32],"chorus_fruit_popped":[240,48],"popped_chorus_fruit":[240,48],
"clay_ball":[144,48],"coal":[112,0],"cocoa_beans":[224,112],"cod":[144,80],"cod_bucket":[192,240],
"cooked_cod":[160,80],"cooked_mutton":[64,192],"cooked_porkchop":[128,80],
"cooked_rabbit":[80,192],"cooked_salmon":[96,208],
"fish_cod_cooked":[160,80],"fish_cod_raw":[144,80],"fish_salmon_cooked":[96,208],
"fish_salmon_raw":[96,192],"fish_clownfish_raw":[96,160],"fish_pufferfish_raw":[96,176],
"cookie":[192,80],"cyan_dye":[224,160],"dandelion_yellow":[240,112],
"dark_oak_boat":[160,208],"dark_oak_door":[32,208],
"diamond":[112,48],"diamond_axe":[48,112],"diamond_boots":[48,48],"diamond_chestplate":[48,16],
"diamond_helmet":[48,0],"diamond_hoe":[48,128],"diamond_horse_armor":[48,144],
"diamond_leggings":[48,32],"diamond_pickaxe":[48,96],"diamond_shovel":[48,80],"diamond_sword":[48,64],
"door_acacia":[0,208],"door_birch":[16,208],"door_dark_oak":[32,208],"door_iron":[192,32],
"door_jungle":[48,208],"door_spruce":[64,208],"door_wood":[176,32],
"iron_door":[192,32],"oak_door":[176,32],
"dragon_breath":[32,160],"dried_kelp":[128,256],
"dye_powder_black":[224,64],"dye_powder_blue":[224,128],"dye_powder_brown":[224,112],
"dye_powder_cyan":[224,160],"dye_powder_gray":[240,64],"dye_powder_green":[224,96],
"dye_powder_light_blue":[240,128],"dye_powder_lime":[240,96],"dye_powder_magenta":[240,144],
"dye_powder_orange":[240,160],"dye_powder_pink":[240,80],"dye_powder_purple":[224,144],
"dye_powder_red":[224,80],"dye_powder_silver":[224,176],"dye_powder_white":[240,176],"dye_powder_yellow":[240,112],
"ink_sac":[224,64],"lapis_lazuli":[224,128],"gray_dye":[240,64],"green_dye":[224,96],
"red_dye":[224,80],"orange_dye":[240,160],"pink_dye":[240,80],"light_blue_dye":[240,128],
"lime_dye":[240,96],"magenta_dye":[240,144],"purple_dye":[224,144],"yellow_dye":[240,112],
"light_gray_dye":[224,176],"rose_red":[224,80],
"egg":[192,0],"elytra":[240,0],"emerald":[160,176],"end_crystal":[96,32],
"ender_eye":[176,144],"ender_pearl":[176,96],"experience_bottle":[176,160],
"feather":[128,16],"fermented_spider_eye":[160,128],"spider_eye_fermented":[160,128],
"filled_map":[208,192],"map_filled":[208,192],"fire_charge":[224,32],"fireball":[224,32],
"fireworks":[144,192],"fireworks_charge":[160,192],"fireworks_charge_overlay":[176,192],
"fireworks_rocket":[144,192],"fireworks_star":[160,192],"fireworks_star_overlay":[176,192],
"firework_rocket":[144,192],"firework_star":[160,192],"firework_star_overlay":[176,192],
"fishing_rod":[80,64],"fishing_rod_cast":[80,80],"fishing_rod_uncast":[80,64],
"flint":[96,0],"flint_and_steel":[80,0],"flower_pot":[208,176],
"furnace_minecart":[112,160],"minecart_furnace":[112,160],
"ghast_tear":[176,112],"glass_bottle":[192,128],
"potion":[192,128],"potion_bottle_empty":[192,128],"potion_bottle_drinkable":[192,128],
"glistering_melon_slice":[144,128],"melon_speckled":[144,128],"glowstone_dust":[144,64],
"gold_axe":[64,112],"gold_boots":[64,48],"gold_chestplate":[64,16],"gold_ingot":[112,32],
"gold_leggings":[64,32],"gold_nugget":[192,112],"gold_helmet":[64,0],"gold_hoe":[64,128],
"gold_horse_armor":[64,144],"gold_pickaxe":[64,96],"gold_shovel":[64,80],"gold_sword":[64,64],
"golden_axe":[64,112],"golden_apple":[176,0],"golden_boots":[64,48],"golden_chestplate":[64,16],
"golden_leggings":[64,32],"golden_helmet":[64,0],"golden_hoe":[64,128],
"golden_horse_armor":[64,144],"golden_pickaxe":[64,96],"golden_shovel":[64,80],"golden_sword":[64,64],
"gunpowder":[128,32],"heart_of_the_sea":[176,256],"hopper":[128,176],
"hopper_minecart":[112,176],"minecart_hopper":[112,176],
"iron_axe":[32,112],"iron_boots":[32,48],"iron_chestplate":[32,16],"iron_helmet":[32,0],
"iron_hoe":[32,128],"iron_horse_armor":[32,144],"iron_ingot":[112,16],"iron_leggings":[32,32],
"iron_nugget":[64,224],"iron_pickaxe":[32,96],"iron_shovel":[32,80],"iron_sword":[32,64],
"item_frame":[224,192],"jungle_boat":[176,208],"jungle_door":[48,208],
"kelp":[112,256],"lead":[64,160],"leather":[112,96],
"leather_boots":[0,48],"leather_boots_overlay":[0,192],"leather_chestplate":[0,16],
"leather_chestplate_overlay":[0,160],"leather_helmet":[0,0],"leather_helmet_overlay":[0,144],
"leather_horse_armor":[240,208],"leather_leggings":[0,32],"leather_leggings_overlay":[0,176],
"lingering_potion":[32,176],"potion_bottle_lingering":[32,176],
"magma_cream":[208,160],"map":[192,48],"map_empty":[192,48],
"melon":[208,96],"melon_seeds":[224,48],"seeds_melon":[224,48],"melon_slice":[208,96],
"minecart":[112,128],"minecart_normal":[112,128],"oak_boat":[112,128],
"tnt_minecart":[112,192],"minecart_tnt":[112,192],
"command_block_minecart":[112,208],"minecart_command_block":[112,208],
"mushroom_stew":[128,64],
"music_disc_11":[160,240],"music_disc_13":[0,240],"music_disc_blocks":[32,240],
"music_disc_cat":[16,240],"music_disc_chirp":[48,240],"music_disc_far":[64,240],
"music_disc_mall":[80,240],"music_disc_mellohi":[96,240],"music_disc_stal":[112,240],
"music_disc_strad":[128,240],"music_disc_wait":[176,240],"music_disc_ward":[144,240],
"record_11":[160,240],"record_13":[0,240],"record_blocks":[32,240],"record_cat":[16,240],
"record_chirp":[48,240],"record_far":[64,240],"record_mall":[80,240],"record_mellohi":[96,240],
"record_stal":[112,240],"record_strad":[128,240],"record_wait":[176,240],"record_ward":[144,240],
"mutton":[64,176],"mutton_cooked":[64,192],"mutton_raw":[64,176],
"name_tag":[48,160],"nautilus_shell":[160,256],"nether_brick":[80,160],"netherbrick":[80,160],
"nether_star":[144,176],"nether_wart":[208,112],
"painting":[160,16],"paper":[160,48],"phantom_membrane":[240,256],
"poisonous_potato":[96,128],"potato_poisonous":[96,128],
"porkchop":[112,80],"porkchop_cooked":[128,80],"porkchop_raw":[112,80],"potato":[112,112],
"potion_bottle_splash":[160,144],"splash_potion":[160,144],"splash_bottle":[160,144],
"potion_overlay":[208,128],"prismarine_crystals":[224,208],"prismarine_shard":[208,208],
"pufferfish":[96,176],"pufferfish_bucket":[224,240],"pumpkin_pie":[128,144],
"pumpkin_seeds":[208,48],"seeds_pumpkin":[208,48],
"quartz":[192,192],"rabbit":[80,176],"rabbit_cooked":[80,192],"rabbit_foot":[80,224],
"rabbit_hide":[96,224],"rabbit_raw":[80,176],"rabbit_stew":[80,208],
"redstone":[128,48],"redstone_dust":[128,48],"reeds":[176,16],"sugar_cane":[176,16],
"repeater":[96,80],"rotten_flesh":[176,80],"saddle":[128,96],
"salmon":[96,192],"salmon_bucket":[208,240],"scute":[208,256],"turtle_scute":[208,256],
"sea_pickle":[144,256],"seeds_wheat":[144,0],"wheat_seeds":[144,0],
"shears":[208,80],"shulker_shell":[48,224],"sign":[160,32],"oak_sign":[160,32],
"slimeball":[224,16],"slime_ball":[224,16],"snowball":[224,0],
"spawn_egg":[144,144],"spawn_egg_overlay":[144,160],"spectral_arrow":[16,144],
"spider_eye":[176,128],"stick":[80,48],
"stone_axe":[16,112],"stone_hoe":[16,128],"stone_pickaxe":[16,96],
"stone_shovel":[16,80],"stone_sword":[16,64],
"string":[128,0],"structure_void":[0,224],"sugar":[208,0],
"tipped_arrow_base":[16,160],"tipped_arrow_head":[16,176],
"totem_of_undying":[32,224],"trident":[224,256],
"tropical_fish":[96,160],"tropical_fish_bucket":[240,240],
"turtle_helmet":[192,256],"wheat":[144,16],
"wood_axe":[0,112],"wood_hoe":[0,128],"wood_pickaxe":[0,96],
"wood_shovel":[0,80],"wood_sword":[0,64],
"wooden_axe":[0,112],"wooden_hoe":[0,128],"wooden_pickaxe":[0,96],
"wooden_shovel":[0,80],"wooden_sword":[0,64],
"comparator":[80,144]
};

// ─── TERRAIN Tile Map ─────────────────────────────────────────────────────────
const TERRAIN_MAP = {
"acacia_door_bottom":[0,384],"acacia_door_top":[0,368],"acacia_leaves":[176,320],
"acacia_log":[128,320],"acacia_log_top":[144,320],"acacia_planks":[160,320],
"acacia_sapling":[96,352],"acacia_trapdoor":[192,528],"activator_rail":[208,176],
"activator_rail_on":[224,176],"allium":[0,352],"andesite":[48,256],"anvil":[112,208],
"anvil_base":[112,208],"anvil_top":[112,224],"anvil_top_damaged_0":[112,224],
"anvil_top_damaged_1":[128,208],"anvil_top_damaged_2":[128,224],
"attached_melon_stem":[32,416],"attached_pumpkin_stem":[240,112],"azure_bluet":[32,352],
"beacon":[144,32],"barrier":[176,368],"bedrock":[16,16],
"beetroots_stage0":[0,400],"beetroots_stage1":[16,400],"beetroots_stage2":[32,400],"beetroots_stage3":[48,400],
"beetroots_stage_0":[0,400],"beetroots_stage_1":[16,400],"beetroots_stage_2":[32,400],"beetroots_stage_3":[48,400],
"birch_door_bottom":[16,384],"birch_door_top":[16,368],"birch_leaves":[176,352],
"birch_log":[80,112],"birch_log_top":[240,256],"birch_planks":[96,208],
"birch_sapling":[240,64],"birch_trapdoor":[208,528],
"black_concrete":[0,432],"black_concrete_powder":[0,432],"black_glazed_terracotta":[0,464],
"black_stained_glass":[0,288],"black_stained_glass_pane_top":[0,304],"black_terracotta":[0,272],"black_wool":[16,112],
"blue_concrete":[16,432],"blue_concrete_powder":[16,448],"blue_glazed_terracotta":[16,464],
"blue_ice":[240,480],"blue_orchid":[16,352],"blue_stained_glass":[16,288],
"blue_stained_glass_pane_top":[16,304],"blue_terracotta":[16,272],"blue_wool":[16,176],
"bone_block_side":[0,416],"bone_block_top":[16,416],"bookshelf":[48,32],
"brain_coral":[176,480],"brain_coral_block":[96,480],"brain_coral_fan":[176,496],
"brewing_stand":[208,144],"brewing_stand_base":[192,144],"brick":[112,0],"bricks":[112,0],
"brown_concrete":[32,432],"brown_concrete_powder":[32,448],"brown_glazed_terracotta":[32,464],
"brown_mushroom":[208,16],"brown_mushroom_block":[224,112],"brown_stained_glass":[32,288],
"brown_stained_glass_pane_top":[32,304],"brown_terracotta":[32,272],"brown_wool":[16,160],
"bubble_coral":[160,480],"bubble_coral_block":[80,480],"bubble_coral_fan":[160,496],
"cactus_bottom":[112,64],"cactus_side":[96,64],"cactus_top":[80,64],
"cake_bottom":[192,112],"cake_inner":[176,112],"cake_side":[160,112],"cake_top":[144,112],
"carrots_stage0":[128,192],"carrots_stage1":[144,192],"carrots_stage2":[160,192],"carrots_stage3":[176,192],
"carrots_stage_0":[128,192],"carrots_stage_1":[144,192],"carrots_stage_2":[160,192],"carrots_stage_3":[176,192],
"carved_pumpkin":[112,112],"cauldron_bottom":[176,144],"cauldron_inner":[176,128],
"cauldron_side":[160,144],"cauldron_top":[160,128],
"chain_command_block_back":[64,400],"chain_command_block_conditional":[80,400],
"chain_command_block_front":[96,400],"chain_command_block_side":[112,400],
"chipped_anvil_top":[128,208],"chiseled_quartz_block":[144,224],"chiseled_quartz_block_top":[144,208],
"chiseled_red_sandstone":[224,352],"chiseled_sandstone":[80,224],"chiseled_stone_bricks":[80,208],
"chorus_flower":[80,368],"chorus_flower_dead":[96,368],"chorus_flower_plant":[112,368],"chorus_plant":[112,368],
"clay":[128,64],"coal_block":[0,256],"coal_ore":[32,32],"coarse_dirt":[128,352],
"cobblestone":[0,16],"cobblestone_mossy":[64,32],"cobweb":[176,0],
"cocoa_stage0":[160,160],"cocoa_stage1":[144,160],"cocoa_stage2":[128,160],
"cocoa_stage_0":[160,160],"cocoa_stage_1":[144,160],"cocoa_stage_2":[128,160],
"command_block":[160,400],"command_block_back":[128,400],"command_block_conditional":[144,400],
"command_block_front":[160,400],"command_block_side":[176,400],
"comparator":[176,176],"comparator_off":[176,176],"comparator_on":[192,176],
"concrete_black":[0,432],"concrete_blue":[16,432],"concrete_brown":[32,432],"concrete_cyan":[48,432],
"concrete_gray":[64,432],"concrete_green":[80,432],"concrete_light_blue":[96,432],
"concrete_lime":[112,432],"concrete_magenta":[128,432],"concrete_orange":[144,432],
"concrete_pink":[160,432],"concrete_powder_black":[0,432],"concrete_powder_blue":[16,448],
"concrete_powder_brown":[32,448],"concrete_powder_cyan":[48,448],"concrete_powder_gray":[64,448],
"concrete_powder_green":[80,448],"concrete_powder_light_blue":[96,448],"concrete_powder_lime":[112,448],
"concrete_powder_magenta":[128,448],"concrete_powder_orange":[144,448],"concrete_powder_pink":[160,448],
"concrete_powder_purple":[176,448],"concrete_powder_red":[192,448],"concrete_powder_silver":[208,448],
"concrete_powder_white":[224,448],"concrete_powder_yellow":[240,448],
"concrete_purple":[176,432],"concrete_red":[192,432],"concrete_silver":[208,432],
"concrete_white":[224,432],"concrete_yellow":[240,432],
"conduit":[96,128],"cracked_stone_bricks":[80,96],
"crafting_table_front":[192,48],"crafting_table_side":[176,48],"crafting_table_top":[176,32],
"cut_red_sandstone":[240,352],"cut_sandstone":[96,224],
"cyan_concrete":[48,432],"cyan_concrete_powder":[48,448],"cyan_glazed_terracotta":[48,464],
"cyan_stained_glass":[48,288],"cyan_stained_glass_pane_top":[48,304],"cyan_terracotta":[48,272],"cyan_wool":[16,208],
"damaged_anvil_top":[128,224],"dandelion":[208,0],
"dark_oak_door_bottom":[32,384],"dark_oak_door_top":[32,368],"dark_oak_log":[128,336],
"dark_oak_log_top":[144,336],"dark_oak_leaves":[176,336],"dark_oak_planks":[160,336],
"dark_oak_sapling":[112,352],"dark_oak_trapdoor":[224,528],"dark_prismarine":[208,336],
"daylight_detector_inverted_top":[224,368],"daylight_detector_side":[160,48],"daylight_detector_top":[144,48],
"deadbush":[112,48],"dead_brain_coral_block":[96,496],"dead_brain_coral_fan":[176,512],
"dead_bubble_coral_block":[80,496],"dead_bubble_coral_fan":[160,512],
"dead_bush":[112,48],"dead_fire_coral_block":[112,496],"dead_fire_coral_fan":[192,512],
"dead_horn_coral_block":[128,496],"dead_horn_coral_fan":[208,512],
"dead_tube_coral_block":[64,496],"dead_tube_coral_fan":[144,512],
"destroy_stage_0":[0,240],"destroy_stage_1":[16,240],"destroy_stage_2":[32,240],
"destroy_stage_3":[48,240],"destroy_stage_4":[64,240],"destroy_stage_5":[80,240],
"destroy_stage_6":[96,240],"destroy_stage_7":[112,240],"destroy_stage_8":[128,240],"destroy_stage_9":[144,240],
"detector_rail":[48,192],"detector_rail_on":[208,208],
"diamond_block":[128,16],"diamond_ore":[32,48],"diorite":[80,256],"dirt":[32,0],
"dirt_path_side":[144,368],"dirt_path_top":[160,368],"dirt_podzol_side":[144,352],"dirt_podzol_top":[160,352],
"dispenser_front":[224,32],"dispenser_front_horizontal":[224,32],"dispenser_front_vertical":[128,32],
"door_acacia_lower":[0,384],"door_acacia_upper":[0,368],"door_birch_lower":[16,384],"door_birch_upper":[16,368],
"door_dark_oak_lower":[32,384],"door_dark_oak_upper":[32,368],"door_iron_lower":[32,96],"door_iron_upper":[32,80],
"door_jungle_lower":[48,384],"door_jungle_upper":[48,368],"door_spruce_lower":[64,384],"door_spruce_upper":[64,368],
"door_wood_lower":[16,96],"door_wood_upper":[16,80],
"double_plant_fern_bottom":[0,336],"double_plant_fern_top":[0,320],
"double_plant_grass_bottom":[16,336],"double_plant_grass_top":[16,320],
"double_plant_paeonia_bottom":[32,336],"double_plant_paeonia_top":[32,320],
"double_plant_rose_top":[48,320],"double_plant_sunflower_back":[112,336],
"double_plant_sunflower_bottom":[96,336],"double_plant_sunflower_front":[112,320],"double_plant_sunflower_top":[96,320],
"double_plant_syringa_bottom":[64,336],"double_plant_syringa_top":[64,320],
"dragon_egg":[112,160],"dried_kelp_bottom":[0,496],"dried_kelp_side":[16,496],"dried_kelp_top":[0,496],
"dropper_front":[176,16],"dropper_front_horizontal":[176,16],"dropper_front_vertical":[160,32],
"emerald_block":[144,16],"emerald_ore":[176,160],
"enchanting_table_bottom":[112,176],"enchanting_table_side":[96,176],"enchanting_table_top":[96,160],
"end_bricks":[128,368],"end_portal_frame_eye":[224,160],"end_portal_frame_side":[240,144],"end_portal_frame_top":[224,144],
"end_rod":[128,384],"end_stone":[240,160],"end_stone_bricks":[128,368],
"endframe_eye":[224,160],"endframe_side":[240,144],"endframe_top":[224,144],
"farmland":[112,80],"farmland_dry":[112,80],"farmland_moist":[96,80],"farmland_wet":[96,80],
"fern":[128,48],"fire_coral":[192,480],"fire_coral_block":[112,480],"fire_coral_fan":[192,496],
"flower_allium":[0,352],"flower_blue_orchid":[16,352],"flower_dandelion":[208,0],
"flower_houstonia":[32,352],"flower_oxeye_daisy":[48,352],"flower_pot":[160,176],
"flower_rose":[192,0],"flower_tulip_orange":[80,320],"flower_tulip_pink":[80,336],
"flower_tulip_red":[64,352],"flower_tulip_white":[80,352],
"frosted_ice_0":[192,384],"frosted_ice_1":[208,384],"frosted_ice_2":[224,384],"frosted_ice_3":[240,384],
"furnace_front":[192,32],"furnace_front_off":[192,32],"furnace_front_on":[208,48],
"furnace_side":[208,32],"furnace_top":[224,48],
"glass":[16,48],"glass_black":[0,288],"glass_blue":[16,288],"glass_brown":[32,288],
"glass_cyan":[48,288],"glass_gray":[64,288],"glass_green":[80,288],"glass_light_blue":[96,288],
"glass_lime":[112,288],"glass_magenta":[128,288],"glass_orange":[144,288],
"glass_pane_top":[64,144],"glass_pane_top_black":[0,304],"glass_pane_top_blue":[16,304],
"glass_pane_top_brown":[32,304],"glass_pane_top_cyan":[48,304],"glass_pane_top_gray":[64,304],
"glass_pane_top_green":[80,304],"glass_pane_top_light_blue":[96,304],"glass_pane_top_lime":[112,304],
"glass_pane_top_magenta":[128,304],"glass_pane_top_orange":[144,304],"glass_pane_top_pink":[160,304],
"glass_pane_top_purple":[176,304],"glass_pane_top_red":[192,304],"glass_pane_top_silver":[208,304],
"glass_pane_top_white":[224,304],"glass_pane_top_yellow":[240,304],
"glass_pink":[160,288],"glass_purple":[176,288],"glass_red":[192,288],
"glass_silver":[208,288],"glass_white":[224,288],"glass_yellow":[240,288],
"glazed_terracotta_black":[0,464],"glazed_terracotta_blue":[16,464],"glazed_terracotta_brown":[32,464],
"glazed_terracotta_cyan":[48,464],"glazed_terracotta_gray":[64,464],"glazed_terracotta_green":[80,464],
"glazed_terracotta_light_blue":[96,464],"glazed_terracotta_lime":[112,464],"glazed_terracotta_magenta":[128,464],
"glazed_terracotta_orange":[144,464],"glazed_terracotta_pink":[160,464],"glazed_terracotta_purple":[176,464],
"glazed_terracotta_red":[192,464],"glazed_terracotta_silver":[208,464],"glazed_terracotta_white":[224,464],"glazed_terracotta_yellow":[240,464],
"glowstone":[144,96],"gold_block":[112,16],"gold_ore":[0,32],"granite":[112,256],
"grass":[112,32],"grass_block_side":[48,0],"grass_block_side_overlay":[96,32],
"grass_block_snow":[64,64],"grass_block_top":[0,0],"grass_blocks_snow":[64,64],"grass_blocks_top":[0,0],
"grass_path_side":[144,368],"grass_path_top":[160,368],"grass_side":[48,0],
"grass_side_overlay":[96,32],"grass_side_snowed":[64,64],"grass_top":[0,0],
"gravel":[48,16],
"gray_concrete":[64,432],"gray_concrete_powder":[64,448],"gray_glazed_terracotta":[64,464],
"gray_stained_glass":[64,288],"gray_stained_glass_pane_top":[64,304],"gray_terracotta":[64,272],"gray_wool":[32,112],
"green_concrete":[80,432],"green_concrete_powder":[80,448],"green_glazed_terracotta":[80,464],
"green_stained_glass":[80,288],"green_stained_glass_pane_top":[80,304],"green_terracotta":[80,272],"green_wool":[16,144],
"hardened_clay":[16,256],
"hardened_clay_stained_black":[0,272],"hardened_clay_stained_blue":[16,272],"hardened_clay_stained_brown":[32,272],
"hardened_clay_stained_cyan":[48,272],"hardened_clay_stained_gray":[64,272],"hardened_clay_stained_green":[80,272],
"hardened_clay_stained_light_blue":[96,272],"hardened_clay_stained_lime":[112,272],"hardened_clay_stained_magenta":[128,272],
"hardened_clay_stained_orange":[144,272],"hardened_clay_stained_pink":[160,272],"hardened_clay_stained_purple":[176,272],
"hardened_clay_stained_red":[192,272],"hardened_clay_stained_silver":[208,272],"hardened_clay_stained_white":[224,272],"hardened_clay_stained_yellow":[240,272],
"hay_block_side":[160,240],"hay_block_top":[208,240],
"hopper_inside":[192,224],"hopper_outside":[192,208],"hopper_top":[192,240],
"horn_coral":[208,480],"horn_coral_block":[128,480],"horn_coral_fan":[208,496],
"ice":[48,64],"ice_packed":[192,368],"iron_bars":[80,80],"iron_block":[96,16],
"iron_door_bottom":[32,96],"iron_door_top":[32,80],"iron_ore":[16,32],"iron_trapdoor":[240,368],
"itemframe":[144,176],"item_frame":[144,176],"itemframe_background":[144,176],
"jack_o_lantern":[128,112],"jukebox_side":[160,64],"jukebox_top":[176,64],
"jungle_door_bottom":[48,384],"jungle_door_top":[48,368],"jungle_leaves":[64,192],
"jungle_log":[144,144],"jungle_log_top":[224,256],"jungle_planks":[112,192],
"jungle_sapling":[224,16],"jungle_trapdoor":[240,528],
"kelp":[64,512],"kelp_plant":[0,512],
"ladder":[48,80],"lapis_block":[0,144],"lapis_ore":[0,160],
"large_fern_bottom":[0,336],"large_fern_top":[0,320],
"leaves_acacia":[176,320],"leaves_big_oak":[176,336],"leaves_birch":[176,352],
"leaves_jungle":[64,192],"leaves_oak":[64,48],"leaves_spruce":[64,128],
"lever":[0,96],
"light_blue_concrete":[96,432],"light_blue_concrete_powder":[96,448],"light_blue_glazed_terracotta":[96,464],
"light_blue_stained_glass":[96,288],"light_blue_stained_glass_pane_top":[96,304],"light_blue_terracotta":[96,272],"light_blue_wool":[32,176],
"light_gray_concrete":[208,432],"light_gray_concrete_powder":[208,448],"light_gray_glazed_terracotta":[208,464],
"light_gray_stained_glass":[208,288],"light_gray_stained_glass_pane_top":[208,304],"light_gray_terracotta":[208,272],"light_gray_wool":[16,224],
"lilac_bottom":[64,336],"lilac_top":[64,320],"lily_pad":[192,64],
"lime_concrete":[112,432],"lime_concrete_powder":[112,448],"lime_glazed_terracotta":[112,464],
"lime_stained_glass":[112,288],"lime_stained_glass_pane_top":[112,304],"lime_terracotta":[112,272],"lime_wool":[32,144],
"log_acacia":[128,320],"log_acacia_top":[144,320],"log_big_oak":[128,336],"log_big_oak_top":[144,336],
"log_birch":[80,112],"log_birch_top":[240,256],"log_jungle":[144,144],"log_jungle_top":[224,256],
"log_oak":[64,16],"log_oak_top":[80,16],"log_spruce":[64,112],"log_spruce_top":[208,256],
"magenta_concrete":[128,432],"magenta_concrete_powder":[128,448],"magenta_glazed_terracotta":[128,464],
"magenta_stained_glass":[128,288],"magenta_stained_glass_pane_top":[128,304],"magenta_terracotta":[128,272],"magenta_wool":[32,192],
"magma":[144,384],"magma_block":[144,384],"melon_side":[128,128],
"melon_stem":[48,416],"melon_stem_connected":[32,416],"melon_stem_disconnected":[48,416],"melon_top":[144,128],
"mob_spawner":[16,64],"mossy_cobblestone":[64,32],"mossy_stone_bricks":[64,96],
"mushroom_block_inside":[224,128],"mushroom_block_skin_brown":[224,112],"mushroom_block_skin_inside":[208,112],
"mushroom_block_skin_red":[208,112],"mushroom_block_skin_stem":[208,128],
"mushroom_brown":[208,16],"mushroom_red":[192,16],"mushroom_stem":[208,128],
"mycelium_side":[208,64],"mycelium_top":[224,64],
"nether_brick":[0,224],"nether_bricks":[0,224],"nether_quartz_ore":[240,176],"nether_wart_block":[160,384],
"nether_wart_stage0":[32,224],"nether_wart_stage1":[48,224],"nether_wart_stage2":[64,224],
"nether_wart_stage_0":[32,224],"nether_wart_stage_1":[48,224],"nether_wart_stage_2":[64,224],
"netherrack":[112,96],"note_block":[32,256],"noteblock":[32,256],
"oak_door_bottom":[16,96],"oak_door_top":[16,80],"oak_leave":[64,48],"oak_leaves":[64,48],
"oak_log":[64,16],"oak_log_top":[80,16],"oak_planks":[64,0],"oak_sapling":[240,0],
"oak_trapdoor":[64,80],"observer_back":[96,416],"observer_back_lit":[112,416],"observer_back_on":[112,416],
"observer_front":[64,416],"observer_side":[80,416],"observer_top":[128,416],"obsidian":[80,32],
"orange_concrete":[144,432],"orange_concrete_powder":[144,448],"orange_glazed_terracotta":[144,464],
"orange_stained_glass":[144,288],"orange_stained_glass_pane_top":[144,304],"orange_terracotta":[144,272],
"orange_tulip":[80,320],"orange_wool":[32,208],"oxeye_daisy":[48,352],"packed_ice":[192,368],
"peony_bottom":[32,336],"peony_top":[32,320],
"pink_concrete":[160,432],"pink_concrete_powder":[160,448],"pink_glazed_terracotta":[160,464],
"pink_stained_glass":[160,288],"pink_stained_glass_pane_top":[160,304],"pink_terracotta":[160,272],
"pink_tulip":[80,336],"pink_wool":[32,128],
"piston_bottom":[208,96],"piston_inner":[224,96],"piston_side":[192,96],
"piston_top":[176,96],"piston_top_normal":[176,96],"piston_top_sticky":[160,96],
"planks_acacia":[112,192],"planks_big_oak":[160,336],"planks_birch":[96,208],
"planks_jungle":[112,192],"planks_oak":[64,0],"planks_spruce":[96,192],
"podzol_side":[144,352],"podzol_top":[160,352],
"polished_andesite":[64,256],"polished_diorite":[96,256],"polished_granite":[128,256],"poppy":[192,0],
"potato_stage0":[144,256],"potato_stage1":[160,256],"potato_stage2":[176,256],"potato_stage3":[192,256],
"potato_stage_0":[144,256],"potato_stage_1":[160,256],"potato_stage_2":[176,256],"potato_stage_3":[192,256],
"potatoes_stage0":[144,256],"potatoes_stage1":[160,256],"potatoes_stage2":[176,256],"potatoes_stage3":[192,256],
"potatoes_stage_0":[144,256],"potatoes_stage_1":[160,256],"potatoes_stage_2":[176,256],"potatoes_stage_3":[192,256],
"powered_rail":[48,160],"powered_rail_on":[48,176],"prismarine":[208,352],
"prismarine_bricks":[208,320],"prismarine_dark":[208,336],"prismarine_rough":[208,352],
"pumpkin_face_off":[112,112],"pumpkin_face_on":[128,112],"pumpkin_side":[96,112],
"pumpkin_stem":[240,96],"pumpkin_stem_connected":[240,112],"pumpkin_stem_disconnected":[240,96],"pumpkin_top":[96,96],
"purple_concrete":[176,432],"purple_concrete_powder":[176,448],"purple_glazed_terracotta":[176,464],
"purple_stained_glass":[176,288],"purple_stained_glass_pane_top":[176,304],"purple_terracotta":[176,272],"purple_wool":[16,192],
"purpur_block":[80,384],"purpur_pillar":[96,384],"purpur_pillar_top":[112,384],
"quartz_block_bottom":[176,240],"quartz_block_chiseled":[144,224],"quartz_block_chiseled_top":[144,208],
"quartz_block_lines":[160,224],"quartz_block_lines_top":[160,208],"quartz_block_side":[176,224],"quartz_block_top":[176,208],
"quartz_ore":[240,176],"quartz_pillar":[160,224],"quartz_pillar_top":[160,208],
"rail":[0,128],"rail_corner":[0,112],"rail_activator":[208,176],"rail_activator_powered":[224,176],
"rail_detector":[48,192],"rail_detector_powered":[208,208],"rail_golden":[48,160],
"rail_golden_powered":[48,176],"rail_normal":[0,128],"rail_normal_turned":[0,112],
"red_concrete":[192,432],"red_concrete_powder":[192,448],"red_glazed_terracotta":[192,464],
"red_mushroom":[192,16],"red_mushroom_block":[208,112],"red_nether_bricks":[176,384],
"red_sand":[224,320],"red_sandstone":[240,336],"red_sandstone_bottom":[224,336],
"red_sandstone_carved":[224,352],"red_sandstone_normal":[240,336],"red_sandstone_smooth":[240,352],"red_sandstone_top":[240,320],
"red_stained_glass":[192,288],"red_stained_glass_pane_top":[192,304],"red_terracotta":[192,272],
"red_tulip":[64,352],"red_wool":[16,128],"redstone_block":[160,16],
"redstone_dust_cross":[64,160],"redstone_dust_line":[80,160],
"redstone_lamp":[48,208],"redstone_lamp_off":[48,208],"redstone_lamp_on":[64,208],
"redstone_ore":[48,48],"redstone_torch":[48,96],"redstone_torch_off":[48,112],"redstone_torch_on":[48,96],
"reeds":[144,64],"repeater":[48,128],"repeater_off":[48,128],"repeater_on":[48,144],
"repeating_command_block_back":[192,400],"repeating_command_block_conditional":[208,400],
"repeating_command_block_front":[224,400],"repeating_command_block_side":[240,400],
"rose_bush_bottom":[48,336],"rose_bush_top":[48,320],
"sand":[32,16],"sandstone":[0,192],"sandstone_bottom":[0,208],"sandstone_carved":[80,224],
"sandstone_normal":[0,192],"sandstone_smooth":[96,224],"sandstone_top":[0,176],
"sapling_acacia":[96,352],"sapling_birch":[240,64],"sapling_jungle":[224,16],
"sapling_oak":[240,0],"sapling_roofed_oak":[112,352],"sapling_spruce":[240,48],
"sea_lantern":[208,368],"sea_pickle":[224,480],"seagrass":[128,512],"short_grass":[112,32],
"slime":[192,192],"slime_block":[192,192],"smooth_stone_slab_side":[80,0],"smooth_stone":[96,0],
"snow":[32,64],"soul_sand":[128,96],"spawner":[16,64],"sponge":[0,48],"sponge_wet":[192,128],
"spruce_door_bottom":[64,384],"spruce_door_top":[64,368],"spruce_leaves":[64,128],
"spruce_log":[64,112],"spruce_log_top":[208,256],"spruce_planks":[96,192],
"spruce_sapling":[240,48],"spruce_trapdoor":[240,512],
"stone":[16,0],"stone_andesite":[48,256],"stone_andesite_smooth":[64,256],
"stone_brick":[96,48],"stone_bricks":[96,48],"stone_diorite":[80,256],"stone_diorite_smooth":[96,256],
"stone_granite":[112,256],"stone_granite_smooth":[128,256],"stone_slab_side":[80,0],"stone_slab_top":[96,0],
"stonebrick":[96,48],"stonebrick_carved":[80,208],"stonebrick_cracked":[80,96],"stonebrick_mossy":[64,96],
"stripped_acacia_log":[32,528],"stripped_acacia_log_top":[48,528],
"stripped_birch_log":[64,528],"stripped_birch_log_top":[80,528],
"stripped_dark_oak_log":[96,528],"stripped_dark_oak_log_top":[112,528],
"stripped_jungle_log":[128,528],"stripped_jungle_log_top":[144,528],
"stripped_oak_log":[0,528],"stripped_oak_log_top":[16,528],
"stripped_spruce_log":[160,528],"stripped_spruce_log_top":[176,528],
"structure_block":[176,416],"structure_block_corner":[192,416],"structure_block_data":[208,416],
"structure_block_load":[224,416],"structure_block_save":[240,416],
"sugar_cane":[144,64],"sunflower_back":[112,336],"sunflower_bottom":[96,336],
"sunflower_front":[112,320],"sunflower_top":[96,320],
"tall_grass_bottom":[16,336],"tall_grass_top":[16,320],"tall_seagrass_bottom":[48,496],"tall_seagrass_top":[48,480],
"tallgrass":[112,32],"terracotta":[16,256],
"tnt_bottom":[160,0],"tnt_side":[128,0],"tnt_top":[144,0],
"torch":[0,80],"torch_on":[0,80],"trapdoor":[64,80],
"trip_wire":[208,160],"trip_wire_source":[192,160],"tripwire":[208,160],"tripwire_hook":[192,160],
"tube_coral":[144,480],"tube_coral_block":[64,480],"tube_coral_fan":[144,496],
"turtle_egg":[112,128],"turtle_egg_slightly_cracked":[112,144],"turtle_egg_very_cracked":[128,144],
"vine":[240,128],"waterlily":[192,64],"web":[176,0],"wet_sponge":[192,128],
"wheat_stage0":[128,80],"wheat_stage1":[144,80],"wheat_stage2":[160,80],"wheat_stage3":[176,80],
"wheat_stage4":[192,80],"wheat_stage5":[208,80],"wheat_stage6":[224,80],"wheat_stage7":[240,80],
"wheat_stage_0":[128,80],"wheat_stage_1":[144,80],"wheat_stage_2":[160,80],"wheat_stage_3":[176,80],
"wheat_stage_4":[192,80],"wheat_stage_5":[208,80],"wheat_stage_6":[224,80],"wheat_stage_7":[240,80],
"white_concrete":[224,432],"white_concrete_powder":[224,448],"white_glazed_terracotta":[224,464],
"white_stained_glass":[224,288],"white_stained_glass_pane_top":[224,304],"white_terracotta":[224,272],
"white_tulip":[80,352],"white_wool":[0,64],
"wool_colored_black":[16,112],"wool_colored_blue":[16,176],"wool_colored_brown":[16,160],
"wool_colored_cyan":[16,208],"wool_colored_gray":[32,112],"wool_colored_green":[16,144],
"wool_colored_light_blue":[32,176],"wool_colored_lime":[32,144],"wool_colored_magenta":[32,192],
"wool_colored_orange":[32,208],"wool_colored_pink":[32,128],"wool_colored_purple":[16,192],
"wool_colored_red":[16,128],"wool_colored_silver":[16,224],"wool_colored_white":[0,64],"wool_colored_yellow":[32,160],
"yellow_concrete":[240,432],"yellow_concrete_powder":[240,448],"yellow_glazed_terracotta":[240,464],
"yellow_stained_glass":[240,288],"yellow_stained_glass_pane_top":[240,304],"yellow_terracotta":[240,272],"yellow_wool":[32,160]
};

// ─── Constants ────────────────────────────────────────────────────────────────
const ITEMS_COLS = 16, ITEMS_ROWS = 17;
const TERRAIN_BASE_W = 256, TERRAIN_BASE_H = 544;
const ITEMS_RESOLUTIONS = [8, 16, 32, 64, 128, 256, 512, 1024];
const TERRAIN_RESOLUTIONS = [16, 32];
const ITEMS_TEMPLATE = 'images/items.png';
function TERRAIN_TEMPLATE(ts) { return ts === 32 ? 'images/terrain_32x.png' : 'images/terrain_16x.png'; }

// ─── State ────────────────────────────────────────────────────────────────────
let curMode = 'pack';
let iTS = 16, iFiles = {}, iBaseFile = null, iMapped = [];
let tTS = 16, tFiles = {}, tBaseFile = null, tMapped = [];
let currentPackName = '';
let detectedItemsRes = null;   // number | null  (dominant tile px)
let detectedTerrainRes = null; // number | null

// ─── Mode switch ──────────────────────────────────────────────────────────────
function switchMode(m) {
  curMode = m;
  ['pack', 'gui'].forEach(x => {
    document.getElementById('panel' + x.charAt(0).toUpperCase() + x.slice(1)).classList.toggle('active', x === m);
    document.getElementById('tab' + x.charAt(0).toUpperCase() + x.slice(1)).classList.toggle('active', x === m);
  });
}

// ─── Resolution grids ─────────────────────────────────────────────────────────
function buildResGrid(gridId, infoId, resArr, curVal, setter, infoFn) {
  const g = document.getElementById(gridId);
  g.innerHTML = '';
  resArr.forEach(r => {
    const b = document.createElement('button');
    b.className = 'res-btn' + (r === curVal ? ' active' : '');
    b.textContent = r + '×' + r;
    b.dataset.res = r;
    b.addEventListener('click', () => {
      setter(r);
      g.querySelectorAll('.res-btn').forEach(x => x.classList.toggle('active', parseInt(x.dataset.res) === r));
      document.getElementById(infoId).textContent = infoFn(r);
      if (gridId === 'modalItemsResGrid') updateItemsMapping(); else updateTerrainMapping();
    });
    g.appendChild(b);
  });
  document.getElementById(infoId).textContent = infoFn(curVal);
}

function itemsInfoFn(r) {
  return t('resInfo.items', ITEMS_COLS * r, ITEMS_ROWS * r);
}
function terrainInfoFn(r) {
  const s = r / 16, w = TERRAIN_BASE_W * s, h = TERRAIN_BASE_H * s;
  return t('resInfo.terrain', w, h, w/2, h/2, w/4, h/4);
}

// ─── Image helpers ────────────────────────────────────────────────────────────
function loadFile(f) {
  return new Promise((ok, ng) => {
    const u = URL.createObjectURL(f), i = new Image();
    i.onload = () => { URL.revokeObjectURL(u); ok(i); };
    i.onerror = () => { URL.revokeObjectURL(u); ng(); };
    i.src = u;
  });
}
function loadURL(url) {
  return new Promise((ok, ng) => {
    const i = new Image();
    i.crossOrigin = 'anonymous';
    i.onload = () => ok(i);
    i.onerror = () => ng();
    i.src = url + '?v=' + Date.now();
  });
}
function scaled(img, w, h) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const x = c.getContext('2d');
  x.imageSmoothingEnabled = false;
  x.drawImage(img, 0, 0, w, h);
  return c;
}
function half(c) { return scaled(c, c.width >> 1, c.height >> 1); }
function cropAtlas(img) {
  const sw = img.naturalWidth, sh = img.naturalHeight;
  if (sh <= sw) return img;
  const c = document.createElement('canvas');
  c.width = sw; c.height = sw;
  c.getContext('2d').drawImage(img, 0, 0, sw, sw, 0, 0, sw, sw);
  return c;
}
function norm(fn) { return fn.replace(/\.png$/i, '').toLowerCase().trim(); }
function toPx(c, s) { const sc = s / 16; return [Math.round(c[0] * sc), Math.round(c[1] * sc)]; }

// ─── ZIP / MCPack extraction ──────────────────────────────────────────────────
// mode: 'items' → textures/items?/ , 'terrain' → textures/blocks?/
async function extractFromZip(file, mode) {
  if (!window.JSZip) throw new Error('JSZip not loaded');
  const pattern = mode === 'items'
    ? /(?:^|\/)textures\/items?\/([^/]+\.png)$/i
    : /(?:^|\/)textures\/blocks?\/([^/]+\.png)$/i;
  const zip = await window.JSZip.loadAsync(file);
  const results = [];
  const tasks = [];
  zip.forEach((path, entry) => {
    if (entry.dir) return;
    const m = path.match(pattern);
    if (!m) return;
    const filename = m[1];
    tasks.push(entry.async('blob').then(blob => {
      results.push(new File([blob], filename, { type: 'image/png' }));
    }));
  });
  await Promise.all(tasks);
  return results;
}

// ─── Resolution detection ─────────────────────────────────────────────────────
// Returns the most common tile width (pixels) from a sample of files, or null.
async function detectPackResolution(files, sampleCount = 24) {
  const samples = Object.values(files).slice(0, sampleCount);
  if (!samples.length) return null;
  const counts = {};
  await Promise.all(samples.map(async f => {
    try {
      const img = await loadFile(f);
      const w = img.naturalWidth;
      counts[w] = (counts[w] || 0) + 1;
    } catch {}
  }));
  let best = null, bestN = 0;
  for (const [s, n] of Object.entries(counts)) {
    if (n > bestN) { bestN = n; best = parseInt(s); }
  }
  return best;
}

// ─── Drop zones ───────────────────────────────────────────────────────────────
function setupDrop(zoneId, inputId, cb) {
  const z = document.getElementById(zoneId), inp = document.getElementById(inputId);
  ['dragover', 'dragleave', 'drop'].forEach(ev => z.addEventListener(ev, e => {
    e.preventDefault();
    if (ev === 'dragover') z.classList.add('over');
    else { z.classList.remove('over'); if (ev === 'drop') cb(e.dataTransfer.files); }
  }));
  inp.addEventListener('change', () => cb(inp.files));
}

// ─── Pack drop ────────────────────────────────────────────────────────────────
setupDrop('dropPack', 'filePack', async fs => {
  const f = fs[0]; if (!f) return;
  const lo = f.name.toLowerCase();
  if (!lo.endsWith('.zip') && !lo.endsWith('.mcpack')) return;
  const hintEl = document.getElementById('hintPack');
  hintEl.textContent = t('log.zipExtracting', f.name);
  try {
    const [iEx, tEx, guiEx] = await Promise.all([
      extractFromZip(f, 'items'),
      extractFromZip(f, 'terrain'),
      extractPackGuiImages(f).catch(() => ({ iconsImg: null, widgetsImg: null, guiImg: null })),
    ]);
    iFiles = {}; tFiles = {};
    for (const p of iEx) iFiles[norm(p.name)] = p;
    for (const p of tEx) tFiles[norm(p.name)] = p;
    const ic = Object.keys(iFiles).length, tc = Object.keys(tFiles).length;
    if (!ic && !tc) { hintEl.textContent = t('log.zipNoFiles'); return; }
    hintEl.textContent = `🗡 ${ic}  🧱 ${tc}`;
    currentPackName = f.name;
    document.getElementById('dropPack').classList.add('has-file');
    updateItemsMapping();
    updateTerrainMapping();
    updatePackConvertBtn();
    document.getElementById('packSettingsRow').style.display = '';

    // GUI textures
    packGuiIcons   = guiEx.iconsImg;
    packGuiWidgets = guiEx.widgetsImg;
    packGuiGui     = guiEx.guiImg;
    const hasGui = !!(packGuiIcons || packGuiWidgets || packGuiGui);
    document.getElementById('packGuiCard').style.display = hasGui ? '' : 'none';
    if (hasGui) {
      document.getElementById('btnPackGuiConvert').disabled = false;
      renderPackGuiCrops();
      document.getElementById('packGuiLogBox').innerHTML = '';
      document.getElementById('packGuiLogBox').style.display = 'none';
      if (packGuiIcons)   log('packGuiLogBox', t('pack.guiIcons'),   'ok');
      if (packGuiWidgets) log('packGuiLogBox', t('pack.guiWidgets'), 'ok');
      if (packGuiGui)     log('packGuiLogBox', t('pack.guiGui'),     'ok');
    }

    // Detect dominant tile resolution from sampled images
    [detectedItemsRes, detectedTerrainRes] = await Promise.all([
      detectPackResolution(iFiles),
      detectPackResolution(tFiles)
    ]);
    openPackModal(f.name);
  } catch(e) { hintEl.textContent = t('log.zipError', e.message); }
});

// ─── Modal base image drops ───────────────────────────────────────────────────
setupDrop('dropModalItemsBase', 'fileModalItemsBase', fs => {
  const f = fs[0]; if (!f || !f.name.toLowerCase().endsWith('.png')) return;
  iBaseFile = f;
  const z = document.getElementById('dropModalItemsBase');
  z.classList.remove('tmpl'); z.classList.add('has-file');
  document.getElementById('modalItemsBaseLbl').textContent = t('hint.customBase');
  document.getElementById('hintModalItemsBase').textContent = f.name;
});
setupDrop('dropModalTerrainBase', 'fileModalTerrainBase', fs => {
  const f = fs[0]; if (!f || !f.name.toLowerCase().endsWith('.png')) return;
  tBaseFile = f;
  const z = document.getElementById('dropModalTerrainBase');
  z.classList.remove('tmpl'); z.classList.add('has-file');
  document.getElementById('modalTerrainBaseLbl').textContent = t('hint.customBase');
  document.getElementById('hintModalTerrainBase').textContent = f.name;
});

// ─── Mapping ──────────────────────────────────────────────────────────────────
function buildMapping(files, tileMap, ts, cardId, badgeId, statsId, bodyId, btnId) {
  const mapped = [], rows = [];
  for (const [bn, file] of Object.entries(files)) {
    const coord = tileMap[bn], matched = !!coord, px = coord ? toPx(coord, ts) : null;
    mapped.push({ baseName: bn, file, x: px?.[0] ?? null, y: px?.[1] ?? null, matched });
    rows.push({ fileName: file.name, matched, px });
  }
  rows.sort((a, b) => (b.matched ? 1 : 0) - (a.matched ? 1 : 0));
  const tbody = document.getElementById(bodyId);
  tbody.innerHTML = '';
  for (const r of rows) {
    const tr = document.createElement('tr');
    if (r.matched) tr.classList.add('ok');
    tr.innerHTML = `<td><span class="mdot ${r.matched ? 'cg' : 'cd'}"></span>${r.matched ? t('map.matched') : t('map.unmatched')}</td>
      <td style="max-width:230px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${r.fileName}</td>
      <td>${r.matched ? `x=${r.px[0]}, y=${r.px[1]}` : '—'}</td>
      <td>${r.matched ? '' : `<span style="color:var(--text3)">${t('map.skip')}</span>`}</td>`;
    tbody.appendChild(tr);
  }
  const total = rows.length, match = rows.filter(r => r.matched).length;
  document.getElementById(badgeId).textContent = match + ' / ' + total;
  document.getElementById(statsId).innerHTML =
    `<span>${t('stats.total')}: <strong>${total}</strong></span>` +
    `<span style="color:var(--border2)">|</span>` +
    `<span>${t('stats.match')}: <strong style="color:var(--green)">${match}</strong></span>` +
    `<span style="color:var(--border2)">|</span>` +
    `<span>${t('stats.skip')}: <strong>${total - match}</strong></span>`;
  document.getElementById(cardId).style.display = total > 0 ? '' : 'none';
  if (btnId) document.getElementById(btnId).disabled = match === 0;
  return mapped;
}

function updatePackConvertBtn() {
  const iMatch = iMapped.filter(m => m.matched).length;
  const tMatch = tMapped.filter(m => m.matched).length;
  const dis = iMatch === 0 && tMatch === 0;
  document.getElementById('btnPackConvert').disabled = dis;
  document.getElementById('btnModalConvert').disabled = dis;
}
function updateItemsMapping() {
  iMapped = buildMapping(iFiles, ITEMS_MAP, iTS, 'packItemsMappingCard', 'packItemsMatchBadge', 'packItemsStatsBar', 'packItemsMapBody', null);
  updatePackConvertBtn();
}
function updateTerrainMapping() {
  tMapped = buildMapping(tFiles, TERRAIN_MAP, tTS, 'packTerrainMappingCard', 'packTerrainMatchBadge', 'packTerrainStatsBar', 'packTerrainMapBody', null);
  updatePackConvertBtn();
}

// ─── Log ──────────────────────────────────────────────────────────────────────
function log(boxId, msg, type = 'info') {
  const box = document.getElementById(boxId);
  box.style.display = 'block';
  const d = document.createElement('div');
  d.className = 'l-' + type;
  d.textContent = msg;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}

// ─── Modal open / close ───────────────────────────────────────────────────────
function refreshModalDetectedRes() {
  const iEl = document.getElementById('modalItemsDetRes');
  const tEl = document.getElementById('modalTerrainDetRes');
  if (iEl) {
    iEl.textContent = detectedItemsRes ? t('modal.detectedRes', detectedItemsRes) : t('modal.detectedNone');
    iEl.classList.toggle('mismatch', !!detectedItemsRes && detectedItemsRes !== iTS);
  }
  if (tEl) {
    tEl.textContent = detectedTerrainRes ? t('modal.detectedRes', detectedTerrainRes) : t('modal.detectedNone');
    tEl.classList.toggle('mismatch', !!detectedTerrainRes && detectedTerrainRes !== tTS);
  }
}
function openPackModal(packName) {
  const ic = Object.keys(iFiles).length, tc = Object.keys(tFiles).length;
  const im = iMapped.filter(x => x.matched).length, tm = tMapped.filter(x => x.matched).length;
  document.getElementById('modalPackName').textContent = '📦 ' + packName;
  document.getElementById('modalStats').innerHTML =
    `<div class="modal-stat-row">${t('modal.iStats', ic, im)}</div>` +
    `<div class="modal-stat-row">${t('modal.tStats', tc, tm)}</div>`;
  buildResGrid('modalItemsResGrid', 'modalItemsResInfo', ITEMS_RESOLUTIONS, iTS, v => {
    iTS = v; updateItemsMapping(); refreshModalDetectedRes();
  }, itemsInfoFn);
  buildResGrid('modalTerrainResGrid', 'modalTerrainResInfo', TERRAIN_RESOLUTIONS, tTS, v => {
    tTS = v; updateTerrainMapping(); refreshModalDetectedRes();
  }, terrainInfoFn);
  refreshModalDetectedRes();
  document.getElementById('packModal').classList.add('open');
}
function closePackModal() {
  document.getElementById('packModal').classList.remove('open');
}
document.getElementById('btnModalClose').addEventListener('click', closePackModal);
document.getElementById('btnModalCancel').addEventListener('click', closePackModal);
document.getElementById('packModal').addEventListener('click', e => { if (e.target === e.currentTarget) closePackModal(); });
document.getElementById('btnPackSettings').addEventListener('click', () => openPackModal(currentPackName));
document.getElementById('btnModalConvert').addEventListener('click', () => { closePackModal(); doPackConvert(); });
document.getElementById('btnPackConvert').addEventListener('click', doPackConvert);

// ─── Pack convert ─────────────────────────────────────────────────────────────
async function doPackConvert() {
  // Resolution mismatch warning
  const iMismatch = detectedItemsRes && detectedItemsRes !== iTS;
  const tMismatch = detectedTerrainRes && detectedTerrainRes !== tTS;
  if (iMismatch || tMismatch) {
    const det = iMismatch ? detectedItemsRes : detectedTerrainRes;
    const sel = iMismatch ? iTS : tTS;
    if (!confirm(t('modal.resMismatch', det, sel))) return;
  }
  const L = (m, tp) => log('packLogBox', m, tp);
  document.getElementById('packLogBox').innerHTML = '';
  document.getElementById('packLogBox').style.display = 'block';
  document.getElementById('packProgWrap').style.display = 'block';
  document.getElementById('packProgBar').style.width = '0%';
  document.getElementById('packDlGroup').style.display = 'none';
  document.getElementById('packIndivDlGroup').style.display = 'none';
  document.getElementById('btnPackConvert').disabled = true;

  // ── Items ──────────────────────────────────────────────────────────────────
  const iS = iTS, iW = ITEMS_COLS * iS, iH = ITEMS_ROWS * iS;
  const iCv = document.createElement('canvas');
  iCv.width = iW; iCv.height = iH;
  const iCtx = iCv.getContext('2d');
  iCtx.clearRect(0, 0, iW, iH);
  const iMatched = iMapped.filter(m => m.matched);
  if (!iMatched.length) {
    L(t('pack.noItems'), 'warn');
  } else {
    let iBaseOk = false;
    if (iBaseFile) {
      try { const i = await loadFile(iBaseFile); iCtx.imageSmoothingEnabled = false; iCtx.drawImage(i, 0, 0, iW, iH); L(t('log.customBaseLoaded'), 'info'); iBaseOk = true; }
      catch { L(t('log.customBaseFail'), 'warn'); }
    }
    if (!iBaseOk) {
      try { const i = await loadURL(ITEMS_TEMPLATE); iCtx.imageSmoothingEnabled = false; iCtx.drawImage(i, 0, 0, iW, iH); L(t('log.tplLoaded', ITEMS_TEMPLATE), 'info'); }
      catch { L(t('log.tplFail'), 'warn'); }
    }
    let iDone = 0, iResized = 0;
    for (const item of iMatched) {
      try {
        const img = await loadFile(item.file);
        const sw = img.naturalWidth, sh = img.naturalHeight;
        const isAtlas = sh > sw;
        const cropped = isAtlas ? cropAtlas(img) : img;
        const nr = (isAtlas ? sw : sw) !== iS || (isAtlas ? sw : sh) !== iS; if (nr) iResized++;
        const tile = scaled(cropped, iS, iS);
        iCtx.clearRect(item.x, item.y, iS, iS);
        iCtx.drawImage(tile, item.x, item.y);
        const aN = isAtlas ? ` [atlas ✂ ${sw}×${sw}]` : '';
        const rN = nr && !isAtlas ? ` [${sw}×${sh}→${iS}×${iS}]` : (nr ? ` [✂${sw}×${sw}→${iS}×${iS}]` : '');
        L('✓ ' + item.file.name + aN + rN + `  →  (${item.x}, ${item.y})`, 'ok');
      } catch { L(t('log.readFail', item.file.name), 'warn'); }
      iDone++;
      document.getElementById('packProgBar').style.width = Math.round(iDone / iMatched.length * 45) + '%';
      await new Promise(r => setTimeout(r, 3));
    }
    L(t('log.itemsDone', iDone, iResized), 'info');
  }

  // ── Terrain ────────────────────────────────────────────────────────────────
  const tS = tTS, tSc = tS / 16, tW = TERRAIN_BASE_W * tSc, tH = TERRAIN_BASE_H * tSc;
  const tCv = document.createElement('canvas');
  tCv.width = tW; tCv.height = tH;
  const tCtx = tCv.getContext('2d');
  tCtx.clearRect(0, 0, tW, tH);
  const tMatched = tMapped.filter(m => m.matched);
  let mip2, mip3;
  if (!tMatched.length) {
    L(t('pack.noTerrain'), 'warn');
    mip2 = tCv; mip3 = tCv;
  } else {
    let tBaseOk = false;
    const tmplPath = TERRAIN_TEMPLATE(tS);
    if (tBaseFile) {
      try { const i = await loadFile(tBaseFile); tCtx.imageSmoothingEnabled = false; tCtx.drawImage(i, 0, 0, tW, tH); L(t('log.customBaseLoaded'), 'info'); tBaseOk = true; }
      catch { L(t('log.customBaseFail'), 'warn'); }
    }
    if (!tBaseOk) {
      try { const i = await loadURL(tmplPath); tCtx.imageSmoothingEnabled = false; tCtx.drawImage(i, 0, 0, tW, tH); L(t('log.tplLoaded', tmplPath), 'info'); }
      catch { L(t('log.tplFail'), 'warn'); }
    }
    let tDone = 0, tResized = 0;
    for (const item of tMatched) {
      try {
        const img = await loadFile(item.file);
        const sw = img.naturalWidth, sh = img.naturalHeight;
        const isAtlas = sh > sw;
        const cropped = isAtlas ? cropAtlas(img) : img;
        const nr = (isAtlas ? sw : sw) !== tS || (isAtlas ? sw : sh) !== tS; if (nr) tResized++;
        const tile = scaled(cropped, tS, tS);
        tCtx.clearRect(item.x, item.y, tS, tS);
        tCtx.drawImage(tile, item.x, item.y);
        const aN = isAtlas ? ` [atlas ✂ ${sw}×${sw}]` : '';
        const rN = nr && !isAtlas ? ` [${sw}×${sh}→${tS}×${tS}]` : (nr ? ` [✂${sw}×${sw}→${tS}×${tS}]` : '');
        L('✓ ' + item.file.name + aN + rN + `  →  (${item.x}, ${item.y})`, 'ok');
      } catch { L(t('log.readFail', item.file.name), 'warn'); }
      tDone++;
      document.getElementById('packProgBar').style.width = Math.round(45 + tDone / tMatched.length * 45) + '%';
      await new Promise(r => setTimeout(r, 3));
    }
    L(t('log.mipGen'), 'info');
    mip2 = half(tCv); mip3 = half(mip2);
    L(t('log.terrainDone', tDone, tResized), 'info');
    L(t('log.mipInfo', tW, tH, mip2.width, mip3.width), 'info');
  }

  document.getElementById('packProgBar').style.width = '100%';
  document.getElementById('btnPackItemsDl').href = iCv.toDataURL('image/png');
  document.getElementById('btnPackTerrainDl1').href = tCv.toDataURL('image/png');
  document.getElementById('btnPackTerrainDl2').href = (mip2 || tCv).toDataURL('image/png');
  document.getElementById('btnPackTerrainDl3').href = (mip3 || tCv).toDataURL('image/png');
  document.getElementById('packDlGroup').style.display = 'flex';
  document.getElementById('packIndivDlGroup').style.display = 'flex';
  document.getElementById('btnPackConvert').disabled = false;
}

// ─── ZIP bulk download ────────────────────────────────────────────────────────
document.getElementById('btnPackZipDl').addEventListener('click', async () => {
  const btn = document.getElementById('btnPackZipDl');
  btn.disabled = true;
  btn.textContent = t('pack.dlZipBuilding');
  try {
    const zip = new window.JSZip();
    const entries = [
      ['items.png',                 'btnPackItemsDl'],
      ['terrain.png',               'btnPackTerrainDl1'],
      ['terrainMipMapLevel2.png',   'btnPackTerrainDl2'],
      ['terrainMipMapLevel3.png',   'btnPackTerrainDl3'],
    ];
    for (const [name, id] of entries) {
      const href = document.getElementById(id).href;
      if (href && href.startsWith('data:')) {
        const blob = await fetch(href).then(r => r.blob());
        zip.file(name, blob);
      }
    }
    const blob = await zip.generateAsync({ type: 'blob', compression: 'STORE' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = (currentPackName.replace(/\.(zip|mcpack)$/i, '') || 'textures') + '_converted.zip';
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } finally {
    btn.disabled = false;
    btn.textContent = t('pack.dlZip');
  }
});

// ─── Reset ────────────────────────────────────────────────────────────────────
document.getElementById('btnReset').addEventListener('click', () => {
  if (!confirm(t('confirm.reset'))) return;

  // Pack
  iFiles = {}; iBaseFile = null; iMapped = []; iTS = 16;
  tFiles = {}; tBaseFile = null; tMapped = []; tTS = 16;
  currentPackName = '';
  detectedItemsRes = null; detectedTerrainRes = null;
  document.getElementById('filePack').value = '';
  document.getElementById('dropPack').classList.remove('has-file', 'over');
  document.getElementById('hintPack').textContent = '';
  document.getElementById('packSettingsRow').style.display = 'none';
  document.getElementById('packItemsMappingCard').style.display = 'none';
  document.getElementById('packItemsMapBody').innerHTML = '';
  document.getElementById('packItemsMatchBadge').textContent = '0 / 0';
  document.getElementById('packItemsStatsBar').innerHTML = '';
  document.getElementById('packTerrainMappingCard').style.display = 'none';
  document.getElementById('packTerrainMapBody').innerHTML = '';
  document.getElementById('packTerrainMatchBadge').textContent = '0 / 0';
  document.getElementById('packTerrainStatsBar').innerHTML = '';
  document.getElementById('btnPackConvert').disabled = true;
  document.getElementById('packDlGroup').style.display = 'none';
  document.getElementById('packIndivDlGroup').style.display = 'none';
  document.getElementById('packProgWrap').style.display = 'none';
  document.getElementById('packProgBar').style.width = '0%';
  document.getElementById('packLogBox').innerHTML = '';
  document.getElementById('packLogBox').style.display = 'none';
  // Reset modal base images
  ['fileModalItemsBase', 'fileModalTerrainBase'].forEach(id => document.getElementById(id).value = '');
  const dmib = document.getElementById('dropModalItemsBase');
  dmib.classList.remove('has-file', 'over'); dmib.classList.add('tmpl');
  document.getElementById('modalItemsBaseLbl').textContent = t('items.baseDefault');
  document.getElementById('hintModalItemsBase').textContent = '';
  const dmtb = document.getElementById('dropModalTerrainBase');
  dmtb.classList.remove('has-file', 'over'); dmtb.classList.add('tmpl');
  document.getElementById('modalTerrainBaseLbl').textContent = t('terrain.baseDefault');
  document.getElementById('hintModalTerrainBase').textContent = '';
  closePackModal();

  // GUI Converter
  guiArcFileName = ''; guiArcFiles = {}; guiArcFormat = null;
  document.getElementById('fileGui').value = '';
  document.getElementById('dropGui').classList.remove('has-file', 'over');
  document.getElementById('hintGui').textContent = '';
  document.getElementById('btnGuiExpand').disabled = true;
  document.getElementById('btnGuiDownload').disabled = true;
  document.getElementById('guiFileTree').innerHTML = '';
  document.getElementById('guiLogBox').innerHTML = '';
  document.getElementById('guiLogBox').style.display = 'none';
  guiResetViewer();

  // Pack GUI
  packGuiIcons = null; packGuiWidgets = null; packGuiGui = null;
  document.getElementById('btnPackGuiConvert').disabled = true;
  document.getElementById('btnPackGuiCropsDl').style.display = 'none';
  document.getElementById('packGuiCropsGrid').innerHTML = '';
  document.getElementById('packGuiLogBox').innerHTML = '';
  document.getElementById('packGuiLogBox').style.display = 'none';
  document.getElementById('packGuiCard').style.display = 'none';

  // Rebuild grids
  buildResGrid('modalItemsResGrid', 'modalItemsResInfo', ITEMS_RESOLUTIONS, 16, v => { iTS = v; updateItemsMapping(); }, itemsInfoFn);
  buildResGrid('modalTerrainResGrid', 'modalTerrainResInfo', TERRAIN_RESOLUTIONS, 16, v => { tTS = v; updateTerrainMapping(); }, terrainInfoFn);
});

// ─── Init ─────────────────────────────────────────────────────────────────────
buildResGrid('modalItemsResGrid', 'modalItemsResInfo', ITEMS_RESOLUTIONS, 16, v => { iTS = v; updateItemsMapping(); }, itemsInfoFn);
buildResGrid('modalTerrainResGrid', 'modalTerrainResInfo', TERRAIN_RESOLUTIONS, 16, v => { tTS = v; updateTerrainMapping(); }, terrainInfoFn);

// ─── PACK GUI CONVERTER ───────────────────────────────────────────────────────

// ── State ──
let packGuiIcons   = null;  // HTMLImageElement (icons.png)
let packGuiWidgets = null;  // HTMLImageElement (widgets.png)
let packGuiGui     = null;  // HTMLImageElement (gui.png)

// ── Mapping table ──
// Crop coordinates are for a base 256×256 atlas and will be scaled for HiRes packs.
// src: 'icons' = icons.png  'widgets' = widgets.png  'gui' = gui.png
//
// icons.png top row (y=0) layout (left → right):
//   [0]  crosshair (15×15)
//   [16] 空ハート  [25] 空金ハートA  [34] ウィザー空ハート  [43] 空金ハートB
//   [52] ハート  [61] 半ハート  [70] ハート(半透明)  [79] 半ハート(半透明)
//   [88] 毒ハート  [97] 半毒ハート  [106] 毒(半透明)  [115] 半毒(半透明)
//   [124] ウィザーハート  [133] 半ウィザー  [142] ウィザー(半透明)  [151] 半ウィザー(半透明)
//   [160] 金ハート  [169] 半金ハート
const PACK_GUI_MAPPINGS = [
  // ── icons.png — top row (all hearts at y=0, h=9) ────────────────────────
  { id: 'crosshair',             src: 'icons',   x:  0, y:  0, w: 15, h: 15, fuiIdx: 183, label: 'Crosshair / 照準' },
  { id: 'heart_empty',           src: 'icons',   x: 16, y:  0, w:  9, h:  9, fuiIdx: 194, label: 'Heart empty / 空ハート' },
  { id: 'heart_gold_empty',      src: 'icons',   x: 25, y:  0, w:  9, h:  9, fuiIdx: 195, label: 'Gold heart empty / 空の金ハート' },
  { id: 'heart_full',            src: 'icons',   x: 52, y:  0, w:  9, h:  9, fuiIdx: 190, label: 'Heart / ハート' },
  { id: 'heart_half',            src: 'icons',   x: 61, y:  0, w:  9, h:  9, fuiIdx: 186, label: 'Half heart / 半ハート' },
  { id: 'heart_full_dim',        src: 'icons',   x: 70, y:  0, w:  9, h:  9, fuiIdx: 193, label: 'Heart (dim) / ハート(半透明)' },
  { id: 'heart_half_dim',        src: 'icons',   x: 79, y:  0, w:  9, h:  9, fuiIdx: 189, label: 'Half heart (dim) / 半ハート(半透明)' },
  { id: 'heart_pois_full',       src: 'icons',   x: 88, y:  0, w:  9, h:  9, fuiIdx: 191, label: 'Poison heart / 毒ハート' },
  { id: 'heart_pois_half',       src: 'icons',   x: 97, y:  0, w:  9, h:  9, fuiIdx: 187, label: 'Half poison heart / 半毒ハート' },
  { id: 'heart_pois_full_dim',   src: 'icons',   x:106, y:  0, w:  9, h:  9, fuiIdx: 192, label: 'Poison heart (dim) / 毒ハート(半透明)' },
  { id: 'heart_pois_half_dim',   src: 'icons',   x:115, y:  0, w:  9, h:  9, fuiIdx: 188, label: 'Half poison (dim) / 半毒ハート(半透明)' },
  { id: 'heart_wither_full',     src: 'icons',   x:124, y:  0, w:  9, h:  9, fuiIdx: 181, label: 'Wither heart / ウィザーハート' },
  { id: 'heart_wither_half',     src: 'icons',   x:133, y:  0, w:  9, h:  9, fuiIdx: 182, label: 'Half wither heart / 半ウィザーハート' },
  { id: 'heart_wither_full_dim', src: 'icons',   x:142, y:  0, w:  9, h:  9, fuiIdx: 174, label: 'Wither heart (dim) / ウィザーハート(半透明)' },
  { id: 'heart_wither_half_dim', src: 'icons',   x:151, y:  0, w:  9, h:  9, fuiIdx: 173, label: 'Half wither (dim) / 半ウィザーハート(半透明)' },
  { id: 'heart_gold_full',       src: 'icons',   x:160, y:  0, w:  9, h:  9, fuiIdx: 172, label: 'Golden heart / 金ハート' },
  { id: 'heart_gold_half',       src: 'icons',   x:169, y:  0, w:  9, h:  9, fuiIdx: 171, label: 'Half golden heart / 半金ハート' },
  // ── icons.png — armor row (y=9) ─────────────────────────────────────────
  { id: 'armor_empty',           src: 'icons',   x: 16, y:  9, w:  9, h:  9, fuiIdx: 211, label: 'Armor empty / 防具(空)' },
  { id: 'armor_half',            src: 'icons',   x: 25, y:  9, w:  9, h:  9, fuiIdx: 209, label: 'Armor half / 防具(半)' },
  { id: 'armor_full',            src: 'icons',   x: 34, y:  9, w:  9, h:  9, fuiIdx: 210, label: 'Armor full / 防具(満)' },
  // ── icons.png — food row (y=27) ─────────────────────────────────────────
  { id: 'food_empty',            src: 'icons',   x: 16, y: 27, w:  9, h:  9, fuiIdx: 204, label: 'Food empty / 空腹(空)' },
  { id: 'food_full',             src: 'icons',   x: 52, y: 27, w:  9, h:  9, fuiIdx: 200, label: 'Food full / 空腹(満)' },
  { id: 'food_half',             src: 'icons',   x: 61, y: 27, w:  9, h:  9, fuiIdx: 196, label: 'Food half / 空腹(半)' },
  // ── hotbar selection (not wide) ─────────────────────────────────────────
  { id: 'hotbar_sel',            src: 'widgets', x:  0, y: 22, w: 24, h: 24, fuiIdx: 184, label: 'Hotbar selection / ホットバー選択' },
  { id: 'gui_hotbar_sel',        src: 'gui',     x:  0, y: 22, w: 24, h: 24,              label: 'Hotbar sel (gui) / ホットバー選択(gui)' },
  // ── wide images (displayed last) ────────────────────────────────────────
  { id: 'xpbar_empty',           src: 'icons',   x:  0, y: 64, w:182, h:  5, fuiIdx: 208, label: 'XP Bar empty / 経験値バー(空)' },
  { id: 'xpbar_full',            src: 'icons',   x:  0, y: 69, w:182, h:  5, fuiIdx: 207, label: 'XP Bar full / 経験値バー(満)' },
  { id: 'hotbar',                src: 'widgets', x:  0, y:  0, w:182, h: 22, fuiIdx: 185, label: 'Hotbar / ホットバー' },
  { id: 'gui_hotbar',            src: 'gui',     x:  0, y:  0, w:182, h: 22,              label: 'Hotbar (gui) / ホットバー(gui)' },
];

// ── Extract GUI images from ZIP ──
async function extractPackGuiImages(file) {
  const zip = await window.JSZip.loadAsync(file);
  const pathMap = {};
  zip.forEach((path, entry) => {
    if (!entry.dir) pathMap[path.replace(/\\/g, '/').toLowerCase()] = entry;
  });

  function findEntry(suffixes) {
    for (const sfx of suffixes) {
      for (const [k, v] of Object.entries(pathMap)) {
        if (k.endsWith(sfx.toLowerCase())) return v;
      }
    }
    return null;
  }

  async function entryToImage(entry) {
    if (!entry) return null;
    const blob = await entry.async('blob');
    return new Promise((res, rej) => {
      const img = new Image();
      const url = URL.createObjectURL(blob);
      img.onload  = () => { URL.revokeObjectURL(url); res(img); };
      img.onerror = () => { URL.revokeObjectURL(url); rej(); };
      img.src = url;
    });
  }

  const [iconsImg, widgetsImg, guiImg] = await Promise.all([
    entryToImage(findEntry(['textures/gui/icons.png',   'assets/minecraft/textures/gui/icons.png'])).catch(() => null),
    entryToImage(findEntry(['textures/gui/widgets.png',  'assets/minecraft/textures/gui/widgets.png'])).catch(() => null),
    entryToImage(findEntry(['textures/gui/gui.png',      'assets/minecraft/textures/gui/gui.png'])).catch(() => null),
  ]);
  return { iconsImg, widgetsImg, guiImg };
}

// ── Crop a region from a loaded image → PNG Uint8Array ──
function packGuiCropToPng(img, x, y, w, h) {
  const scale = img.naturalWidth / 256;
  const sx = Math.round(x * scale), sy = Math.round(y * scale);
  const sw = Math.max(1, Math.round(w * scale)), sh = Math.max(1, Math.round(h * scale));
  const c = document.createElement('canvas');
  c.width = sw; c.height = sh;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  return new Promise(res => c.toBlob(b => b.arrayBuffer().then(buf => res(new Uint8Array(buf))), 'image/png'));
}

// ── Resolve source image for a mapping entry ──
function packGuiSrcImg(src) {
  if (src === 'icons')   return packGuiIcons;
  if (src === 'widgets') return packGuiWidgets;
  if (src === 'gui')     return packGuiGui;
  return null;
}

// ── Render crop preview grid ──
function renderPackGuiCrops() {
  const grid = document.getElementById('packGuiCropsGrid');
  grid.innerHTML = '';
  for (const m of PACK_GUI_MAPPINGS) {
    const img = packGuiSrcImg(m.src);
    if (!img) continue;
    const scale = img.naturalWidth / 256;
    const sx = Math.round(m.x * scale), sy = Math.round(m.y * scale);
    const sw = Math.max(1, Math.round(m.w * scale)), sh = Math.max(1, Math.round(m.h * scale));
    const c = document.createElement('canvas');
    c.width = sw; c.height = sh;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

    const isWide = sw > 40;
    const item = document.createElement('div');
    item.className = 'pack-gui-crop-item' + (isWide ? ' wide' : '');

    const preview = document.createElement('div');
    preview.className = 'pack-gui-crop-preview';
    const imgEl = document.createElement('img');
    imgEl.src = c.toDataURL('image/png');
    const MAX_DISP_W = isWide ? 220 : 40, MAX_DISP_H = 40;
    const fitScale = Math.min(MAX_DISP_W / sw, MAX_DISP_H / sh, 4);
    imgEl.width  = Math.max(1, Math.round(sw * fitScale));
    imgEl.height = Math.max(1, Math.round(sh * fitScale));
    preview.appendChild(imgEl);

    const lbl = document.createElement('div');
    lbl.className = 'pack-gui-crop-label';
    lbl.textContent = m.label;

    const info = document.createElement('div');
    info.className = 'pack-gui-crop-info';
    info.textContent = sw + '×' + sh;

    item.appendChild(preview);
    item.appendChild(lbl);
    item.appendChild(info);
    grid.appendChild(item);
  }
}

// ── GUI Convert (Pack tab) — crops only ──
async function doPackGuiConvert() {
  const L = (m, tp) => log('packGuiLogBox', m, tp);
  document.getElementById('packGuiLogBox').innerHTML = '';
  document.getElementById('packGuiLogBox').style.display = 'block';
  document.getElementById('btnPackGuiConvert').disabled = true;
  document.getElementById('btnPackGuiCropsDl').style.display = 'none';

  try {
    const cropsZip = new window.JSZip();
    let cropsCount = 0;

    for (const m of PACK_GUI_MAPPINGS) {
      const img = packGuiSrcImg(m.src);
      if (!img) continue;
      const scale = img.naturalWidth / 256;
      const sw = Math.max(1, Math.round(m.w * scale)), sh = Math.max(1, Math.round(m.h * scale));
      const pngData = await packGuiCropToPng(img, m.x, m.y, m.w, m.h);
      cropsZip.file(m.id + '.png', pngData);
      cropsCount++;
      L(t('pack.guiCrop', m.label, sw, sh), 'ok');
    }

    if (cropsCount > 0) {
      const cropsBlob = await cropsZip.generateAsync({ type: 'blob', compression: 'STORE' });
      const cropsUrl  = URL.createObjectURL(cropsBlob);
      const cropsDl   = document.getElementById('btnPackGuiCropsDl');
      cropsDl.href = cropsUrl;
      cropsDl.download = (currentPackName.replace(/\.(zip|mcpack)$/i, '') || 'pack') + '_gui_crops.zip';
      cropsDl.style.display = '';
      L(t('pack.guiConvDone', cropsCount), 'info');
    }

  } catch(e) {
    log('packGuiLogBox', '✗ ' + e.message, 'warn');
    console.error(e);
  } finally {
    document.getElementById('btnPackGuiConvert').disabled = false;
  }
}

// ── GUI CONVERTER ────────────────────────────────────────────────────────────

// ── State ──
let guiArcFileName = '';
let guiArcFiles = {};
let guiArcFormat = null;
let guiFuiPath = null;
let guiFuiState = null;
let guiTxtPath = null;
let guiSelectedImgs = new Set();

// ── R↔B display toggle (display-only, saved data unchanged) ──
function guiApplyInvertDisplayToImg(imgEl) {
  // Store original src the first time
  if (!imgEl.dataset.origSrc) imgEl.dataset.origSrc = imgEl.src;
  const orig = new Image();
  orig.crossOrigin = 'anonymous';
  orig.onload = () => {
    const c = document.createElement('canvas');
    c.width = orig.naturalWidth; c.height = orig.naturalHeight;
    const ctx = c.getContext('2d');
    ctx.drawImage(orig, 0, 0);
    const id = ctx.getImageData(0, 0, c.width, c.height);
    const d = id.data;
    for (let i = 0; i < d.length; i += 4) { const r = d[i]; d[i] = d[i+2]; d[i+2] = r; }
    ctx.putImageData(id, 0, 0);
    imgEl.src = c.toDataURL('image/png');
  };
  orig.src = imgEl.dataset.origSrc;
}

function guiRestoreInvertDisplayImg(imgEl) {
  if (imgEl.dataset.origSrc) imgEl.src = imgEl.dataset.origSrc;
}

document.getElementById('chkGuiInvertDisplay').addEventListener('change', function () {
  const imgs = document.querySelectorAll('#guiImageGrid img');
  if (this.checked) {
    imgs.forEach(guiApplyInvertDisplayToImg);
  } else {
    imgs.forEach(guiRestoreInvertDisplayImg);
  }
});

// ── Low-level helpers ──
function guiView(bytes) {
  return new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
}
function guiReadI32(bytes, off) { return guiView(bytes).getInt32(off, true); }
function guiReadU32(bytes, off) { return guiView(bytes).getUint32(off, true); }
function guiReadU16(bytes, off) { return guiView(bytes).getUint16(off, true); }
function guiWriteI32(buf, off, v) { new DataView(buf.buffer, buf.byteOffset).setInt32(off, v, true); }
function guiWriteU32(buf, off, v) { new DataView(buf.buffer, buf.byteOffset).setUint32(off, v, true); }
function guiWriteU16(buf, off, v) { new DataView(buf.buffer, buf.byteOffset).setUint16(off, v, true); }

function guiSearch(haystack, needle) {
  outer: for (let i = 0; i <= haystack.length - needle.length; i++) {
    for (let j = 0; j < needle.length; j++) if (haystack[i + j] !== needle[j]) continue outer;
    return i;
  }
  return -1;
}

function guiConcat(parts) {
  const total = parts.reduce((s, p) => s + p.byteLength, 0);
  const out = new Uint8Array(total);
  let off = 0;
  for (const p of parts) { out.set(p, off); off += p.byteLength; }
  return out;
}

function guiMime(data) {
  if (data[0] === 0x89 && data[1] === 0x50) return 'image/png';
  if (data[0] === 0xFF && data[1] === 0xD8) return 'image/jpeg';
  return 'application/octet-stream';
}
function guiExt(data) {
  if (data[0] === 0x89 && data[1] === 0x50) return 'png';
  if (data[0] === 0xFF && data[1] === 0xD8) return 'jpg';
  return 'bin';
}

function guiLog(msg, cls = '') {
  const box = document.getElementById('guiLogBox');
  box.style.display = 'block';
  const d = document.createElement('div');
  d.className = cls; d.textContent = msg;
  box.appendChild(d);
  box.scrollTop = box.scrollHeight;
}
function guiLogClear() {
  const box = document.getElementById('guiLogBox');
  box.innerHTML = ''; box.style.display = 'none';
}

// ── ARC parser / writer ──
function guiArcI32(b, o, le) {
  return le ? (b[o]|b[o+1]<<8|b[o+2]<<16|b[o+3]<<24)
            : (b[o]<<24|b[o+1]<<16|b[o+2]<<8|b[o+3]);
}
function guiArcU32(b, o, le) { return guiArcI32(b, o, le) >>> 0; }
function guiArcU16(b, o, le) { return le ? (b[o]|b[o+1]<<8) : (b[o]<<8|b[o+1]); }
function guiArcPut32(buf, o, v, le) {
  const u = v>>>0;
  if (le){buf[o]=u&0xFF;buf[o+1]=(u>>8)&0xFF;buf[o+2]=(u>>16)&0xFF;buf[o+3]=(u>>24)&0xFF;}
  else   {buf[o]=(u>>24)&0xFF;buf[o+1]=(u>>16)&0xFF;buf[o+2]=(u>>8)&0xFF;buf[o+3]=u&0xFF;}
}
function guiArcPut16(buf, o, v, le) {
  if (le){buf[o]=v&0xFF;buf[o+1]=(v>>8)&0xFF;}
  else   {buf[o]=(v>>8)&0xFF;buf[o+1]=v&0xFF;}
}

function guiTryParseArc(bytes, skip, le, use32len) {
  const dec = new TextDecoder('utf-8');
  const lb = use32len ? 4 : 2;
  let pos = skip;
  if (pos + 4 > bytes.length) return null;
  const count = guiArcI32(bytes, pos, le); pos += 4;
  if (count <= 0 || count > 10000) return null;
  const entries = [];
  for (let i = 0; i < count; i++) {
    if (pos + lb > bytes.length) return null;
    const pl = use32len ? guiArcI32(bytes, pos, le) : guiArcU16(bytes, pos, le);
    pos += lb;
    if (pl <= 0 || pl > 512 || pos + pl > bytes.length) return null;
    const path = dec.decode(bytes.subarray(pos, pos + pl)); pos += pl;
    if (!/^[\x20-\x7E]+$/.test(path)) return null;
    if (pos + 8 > bytes.length) return null;
    const dataOffset = guiArcU32(bytes, pos, le); pos += 4;
    const dataSize   = guiArcU32(bytes, pos, le); pos += 4;
    entries.push({ path, dataOffset, dataSize });
  }
  if (!entries.length) return null;
  if (entries[0].dataOffset >= bytes.length) return null;
  const files = {};
  for (const e of entries) {
    if (e.dataOffset + e.dataSize <= bytes.length)
      files[e.path] = bytes.slice(e.dataOffset, e.dataOffset + e.dataSize);
  }
  if (!Object.keys(files).length) return null;
  return { files, format: { le, use32len, skip, prefix: bytes.slice(0, skip) } };
}

function guiParseArc(buffer) {
  const bytes = new Uint8Array(buffer);
  for (const [skip, le, use32] of [
    [0,false,false],[0,true,false],
    [4,false,false],[4,true,false],
    [0,false,true], [0,true,true],
    [4,false,true], [4,true,true],
  ]) {
    const r = guiTryParseArc(bytes, skip, le, use32);
    if (r) {
      guiArcFormat = r.format;
      const label = (le?'LE':'BE')+', '+(use32?'int32':'uint16')+' path-len'+(skip?', 4-byte skip':'');
      guiLog(t('log.guiFmtDetected', label), 'l-info');
      return r.files;
    }
  }
  throw new Error(t('log.guiNoFmt'));
}

function guiBuildArc(files) {
  const enc = new TextEncoder();
  const fmt = guiArcFormat || { le: true, use32len: false, skip: 0, prefix: new Uint8Array(0) };
  const { le, use32len, skip, prefix } = fmt;
  const lb = use32len ? 4 : 2;

  const entries = Object.entries(files).map(([path, data]) => ({
    pathBytes: enc.encode(path), data
  }));

  let hdrSize = skip + 4;
  for (const e of entries) hdrSize += lb + e.pathBytes.byteLength + 8;

  const hdr = new Uint8Array(hdrSize);
  if (prefix && prefix.length) hdr.set(prefix, 0);

  let pos = skip;
  guiArcPut32(hdr, pos, entries.length, le); pos += 4;

  let dataOff = hdrSize;
  for (const e of entries) {
    const l = e.pathBytes.byteLength;
    if (use32len) { guiArcPut32(hdr, pos, l, le); pos += 4; }
    else          { guiArcPut16(hdr, pos, l, le); pos += 2; }
    hdr.set(e.pathBytes, pos); pos += l;
    guiArcPut32(hdr, pos, dataOff, le); pos += 4;
    guiArcPut32(hdr, pos, e.data.byteLength, le); pos += 4;
    dataOff += e.data.byteLength;
  }

  return guiConcat([hdr, ...entries.map(e => e.data)]);
}

// ── FUI parser / writer ──
const FUI_PNG_MAGIC = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A];
const FUI_INFO_SIZE = 32;

function guiReadFuiInfo(bytes, off) {
  return {
    descriptor:  guiReadI32(bytes, off +  0),
    attribute:   guiReadI32(bytes, off +  4),
    width:       guiReadI32(bytes, off +  8),
    height:      guiReadI32(bytes, off + 12),
    imageOffset: guiReadI32(bytes, off + 16),
    imageSize:   guiReadI32(bytes, off + 20),
    unkOffset:   guiReadI32(bytes, off + 24),
    unk_1C:      guiReadI32(bytes, off + 28),
  };
}

function guiWriteFuiInfo(info) {
  const b = new Uint8Array(FUI_INFO_SIZE);
  guiWriteI32(b,  0, info.descriptor);
  guiWriteI32(b,  4, info.attribute);
  guiWriteI32(b,  8, info.width);
  guiWriteI32(b, 12, info.height);
  guiWriteI32(b, 16, info.imageOffset);
  guiWriteI32(b, 20, info.imageSize);
  guiWriteI32(b, 24, info.unkOffset);
  guiWriteI32(b, 28, info.unk_1C);
  return b;
}

function guiParseFui(buffer) {
  const bytes = new Uint8Array(buffer);
  const pngIdx = guiSearch(bytes, FUI_PNG_MAGIC);
  if (pngIdx < 0) throw new Error('PNG magic bytes not found');

  const stack = [];
  let cur = pngIdx - FUI_INFO_SIZE;
  while (cur >= 0) {
    const info = guiReadFuiInfo(bytes, cur);
    stack.push(info);
    if (info.imageOffset === 0) break;
    cur -= FUI_INFO_SIZE;
  }
  const imageInfos = stack.reverse();

  const mainBytes = bytes.slice(0, pngIdx - imageInfos.length * FUI_INFO_SIZE);
  const images = imageInfos.map(info => ({
    info: { ...info },
    data: bytes.slice(pngIdx + info.imageOffset, pngIdx + info.imageOffset + info.imageSize),
  }));

  return { mainBytes, imageInfos, images };
}

function guiBuildFui(state) {
  let off = 0;
  const updatedInfos = state.imageInfos.map((info, i) => {
    const d = state.images[i].data;
    const u = { ...info, imageOffset: off, imageSize: d.byteLength };
    if (state.images[i].newW !== undefined) { u.width = state.images[i].newW; u.height = state.images[i].newH; }
    off += d.byteLength;
    return u;
  });

  const infoParts = updatedInfos.map(guiWriteFuiInfo);
  const result = guiConcat([state.mainBytes, ...infoParts, ...state.images.map(im => im.data)]);
  guiWriteI32(result, 8, result.byteLength - 152);
  return result;
}

// ── File tree ──
function guiBuildTreeModel(paths) {
  const root = {};
  for (const p of paths) {
    const parts = p.replace(/\\/g, '/').split('/');
    let node = root;
    for (let i = 0; i < parts.length - 1; i++) {
      if (!node[parts[i]]) node[parts[i]] = {};
      node = node[parts[i]];
    }
    node[parts[parts.length - 1]] = p;
  }
  return root;
}

function guiRenderTreeNode(node) {
  const ul = document.createElement('ul');
  ul.className = 'gui-tree-list';

  const sorted = Object.entries(node).sort(([ak, av], [bk, bv]) => {
    const aDir = typeof av === 'object', bDir = typeof bv === 'object';
    if (aDir !== bDir) return aDir ? -1 : 1;
    return ak.localeCompare(bk);
  });

  for (const [name, val] of sorted) {
    const li = document.createElement('li');
    if (typeof val === 'object') {
      const span = document.createElement('span');
      span.className = 'gui-tree-folder';
      span.innerHTML = `<span class="gui-tree-arrow">▶</span> 📁 ${name}`;
      const sub = guiRenderTreeNode(val);
      sub.style.display = 'none';
      span.addEventListener('click', e => {
        e.stopPropagation();
        const open = sub.style.display !== 'none';
        sub.style.display = open ? 'none' : '';
        span.querySelector('.gui-tree-arrow').textContent = open ? '▶' : '▼';
      });
      li.appendChild(span);
      li.appendChild(sub);
    } else {
      const ext = name.split('.').pop().toLowerCase();
      const icon = ext === 'fui' ? '🎨' : ext === 'png' ? '🖼️' : ext === 'loc' ? '📝' : ext === 'col' ? '🎨' : '📄';
      const span = document.createElement('span');
      span.className = 'gui-tree-file';
      span.dataset.path = val;
      span.textContent = icon + ' ' + name;
      span.addEventListener('click', () => guiSelectFile(val));
      li.appendChild(span);
    }
    ul.appendChild(li);
  }
  return ul;
}

// ── UI logic ──
let guiPendingFile = null;

function guiOnFileSelected(file) {
  guiPendingFile = file;
  document.getElementById('hintGui').textContent = file.name;
  document.getElementById('dropGui').classList.add('has-file');
  document.getElementById('btnGuiExpand').disabled = false;
}

function guiLoadArc() {
  const file = guiPendingFile;
  if (!file) return;
  guiLogClear();
  guiArcFileName = file.name;

  const btn = document.getElementById('btnGuiExpand');
  btn.disabled = true;
  btn.textContent = '⏳ …';

  const reader = new FileReader();
  reader.onload = e => {
    try {
      guiArcFiles = guiParseArc(e.target.result);
      const count = Object.keys(guiArcFiles).length;
      guiLog(t('log.guiExpanded', file.name, count), 'l-ok');

      document.getElementById('guiFileBadge').textContent = count + ' files';
      document.getElementById('guiBrowserCard').style.display = '';
      document.getElementById('guiSaveCard').style.display = '';
      document.getElementById('btnGuiDownload').disabled = false;

      const treeEl = document.getElementById('guiFileTree');
      treeEl.innerHTML = '';
      treeEl.appendChild(guiRenderTreeNode(guiBuildTreeModel(Object.keys(guiArcFiles))));

      guiResetViewer();
    } catch (err) {
      guiLog(t('log.guiParseErr', err.message), 'l-warn');
      console.error(err);
    } finally {
      btn.disabled = false;
      btn.textContent = t('gui.btnExpand');
    }
  };
  reader.readAsArrayBuffer(file);
}

// ── Color swap (R↔B) ──
function guiApplyColorSwap(data) {
  return new Promise((resolve, reject) => {
    const blob = new Blob([data], { type: guiMime(data) });
    const url = URL.createObjectURL(blob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const c = document.createElement('canvas');
      c.width = img.naturalWidth; c.height = img.naturalHeight;
      const ctx = c.getContext('2d');
      ctx.drawImage(img, 0, 0);
      const id = ctx.getImageData(0, 0, c.width, c.height);
      const d = id.data;
      for (let i = 0; i < d.length; i += 4) { const r = d[i]; d[i] = d[i+2]; d[i+2] = r; }
      ctx.putImageData(id, 0, 0);
      c.toBlob(b => b.arrayBuffer().then(buf => resolve(new Uint8Array(buf))), 'image/png');
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image decode failed')); };
    img.src = url;
  });
}

// ── Right-panel reset ──
function guiResetViewer() {
  guiFuiPath = null; guiFuiState = null; guiTxtPath = null;
  guiSelectedImgs = new Set();
  document.getElementById('guiFuiPanel').style.display = 'none';
  document.getElementById('guiTxtPanel').style.display = 'none';
  document.getElementById('guiFuiTitle').textContent = '';
  document.getElementById('guiImageGrid').innerHTML = '';
  document.getElementById('guiImageActions').style.display = 'none';
  document.getElementById('guiImgInfo').textContent = '';
}

// ── File selection ──
function guiSelectFile(path) {
  document.querySelectorAll('.gui-tree-file').forEach(el => el.classList.remove('gui-active'));
  const el = document.querySelector(`.gui-tree-file[data-path="${CSS.escape(path)}"]`);
  if (el) el.classList.add('gui-active');

  const ext = path.split('.').pop().toLowerCase();
  if (ext === 'fui') guiOpenFui(path);
  else if (ext === 'png') guiPreviewPng(path);
  else if (ext === 'txt') guiOpenTxt(path);
  else guiResetViewer();
}

// ── PNG preview ──
function guiPreviewPng(path) {
  guiResetViewer();
  const data = guiArcFiles[path];
  if (!data) return;
  guiFuiPath = path;

  document.getElementById('guiFuiPanel').style.display = '';
  document.getElementById('guiFuiTitle').textContent = 'PNG: ' + path.split('\\').pop();

  const grid = document.getElementById('guiImageGrid');
  const blob = new Blob([data], { type: 'image/png' });
  const url = URL.createObjectURL(blob);
  const item = document.createElement('div');
  item.className = 'fui-img-item gui-selected';
  const imgEl = document.createElement('img'); imgEl.src = url;
  const lbl = document.createElement('div'); lbl.className = 'fui-img-label';
  imgEl.onload = () => { lbl.textContent = imgEl.naturalWidth + '×' + imgEl.naturalHeight; };
  lbl.textContent = path.split('\\').pop();
  item.appendChild(imgEl); item.appendChild(lbl);
  grid.appendChild(item);

  guiSelectedImgs = new Set([0]);
  document.getElementById('guiImageActions').style.display = '';
  document.getElementById('btnGuiSaveImg').disabled = false;
  document.getElementById('btnGuiReplaceImg').disabled = true;
  document.getElementById('guiImgInfo').textContent = path.split('\\').pop();
}

// ── FUI viewer ──
function guiOpenFui(path) {
  guiResetViewer();
  const raw = guiArcFiles[path];
  if (!raw) return;

  try {
    const buf = raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength);
    guiFuiState = guiParseFui(buf);
    guiFuiPath = path;
    document.getElementById('guiFuiPanel').style.display = '';
    document.getElementById('guiFuiTitle').textContent =
      t('gui.fuiTitle', path.split('\\').pop(), guiFuiState.images.length);
    guiRenderFuiImages();
    guiLog(t('log.guiFuiOpened', path.split('\\').pop(), guiFuiState.images.length), 'l-ok');
  } catch (err) {
    guiLog(t('log.guiFuiErr', path.split('\\').pop(), err.message), 'l-warn');
    console.error(err);
  }
}

function guiRenderFuiImages() {
  const grid = document.getElementById('guiImageGrid');
  grid.innerHTML = '';
  if (!guiFuiState) return;

  const prevSel = new Set(guiSelectedImgs);
  guiSelectedImgs = new Set();

  guiFuiState.images.forEach((img, i) => {
    const blob = new Blob([img.data], { type: guiMime(img.data) });
    const url = URL.createObjectURL(blob);
    const item = document.createElement('div');
    item.className = 'fui-img-item' + (prevSel.has(i) ? ' gui-selected' : '');
    item.dataset.index = String(i);
    const imgEl = document.createElement('img'); imgEl.src = url;
    const lbl = document.createElement('div'); lbl.className = 'fui-img-label';
    lbl.textContent = '#' + i + '  ' + img.info.width + '×' + img.info.height;
    item.appendChild(imgEl); item.appendChild(lbl);
    item.addEventListener('click', e => guiToggleImage(i, e.ctrlKey || e.metaKey));
    grid.appendChild(item);
  });

  document.getElementById('guiImageActions').style.display = '';
  if (prevSel.size > 0) {
    prevSel.forEach(i => { if (i < guiFuiState.images.length) guiSelectedImgs.add(i); });
    guiUpdateSelectionUI();
  }

  // If invert display is already checked, apply to newly rendered images
  if (document.getElementById('chkGuiInvertDisplay').checked) {
    grid.querySelectorAll('img').forEach(guiApplyInvertDisplayToImg);
  }
}

function guiToggleImage(index, multi) {
  if (multi) {
    if (guiSelectedImgs.has(index)) guiSelectedImgs.delete(index);
    else guiSelectedImgs.add(index);
  } else {
    guiSelectedImgs = new Set([index]);
  }
  guiUpdateSelectionUI();
}

function guiUpdateSelectionUI() {
  const items = document.querySelectorAll('.fui-img-item');
  items.forEach((el, i) => el.classList.toggle('gui-selected', guiSelectedImgs.has(i)));

  const n = guiSelectedImgs.size;
  document.getElementById('btnGuiSaveImg').disabled = n === 0;
  document.getElementById('btnGuiReplaceImg').disabled = n !== 1 || !guiFuiState;

  if (n === 0) {
    document.getElementById('guiImgInfo').textContent = t('gui.selectImg');
  } else if (n === 1 && guiFuiState) {
    const idx = [...guiSelectedImgs][0];
    const info = guiFuiState.imageInfos[idx];
    document.getElementById('guiImgInfo').textContent =
      '#' + idx + '  ' + info.width + '×' + info.height + '  (' + guiFuiState.images[idx].data.byteLength + ' B)';
  } else {
    document.getElementById('guiImgInfo').textContent = t('gui.nSelected', n);
  }
}

// ── TXT editor ──
function guiOpenTxt(path) {
  guiResetViewer();
  const data = guiArcFiles[path];
  if (!data) return;
  guiTxtPath = path;

  const text = new TextDecoder('utf-8').decode(data);
  document.getElementById('guiTxtPanel').style.display = '';
  document.getElementById('guiTxtTitle').textContent = 'TXT: ' + path.split('\\').pop();
  document.getElementById('guiTxtEditor').value = text;
  guiLog(t('log.guiTxtOpened', path.split('\\').pop(), data.byteLength), 'l-ok');
}

function guiTxtSave() {
  if (!guiTxtPath) return;
  const text = document.getElementById('guiTxtEditor').value;
  guiArcFiles[guiTxtPath] = new TextEncoder().encode(text);
  guiLog(t('log.guiTxtSaved', guiTxtPath.split('\\').pop()), 'l-ok');
}

// ── Save image(s) ──
async function guiSaveImage() {
  if (guiSelectedImgs.size === 0) return;
  const doSwap = document.getElementById('chkGuiColorSwap').checked;
  const base = guiFuiPath ? guiFuiPath.split('\\').pop().replace(/\.fui$/i, '') : 'image';

  for (const idx of guiSelectedImgs) {
    let data;
    if (guiFuiState) {
      data = guiFuiState.images[idx].data;
    } else {
      data = guiArcFiles[guiFuiPath];
    }
    if (doSwap) {
      try { data = await guiApplyColorSwap(data); }
      catch (e) { guiLog(t('log.guiColorErr', idx, e.message), 'l-warn'); continue; }
    }
    const filename = guiFuiState ? base + '_' + idx + '.png' : base + '.' + guiExt(data);
    const blob = new Blob([data], { type: guiMime(data) });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = filename; a.click();
    URL.revokeObjectURL(url);
    guiLog(t('log.guiImgSaved', filename), 'l-ok');
  }
}

// ── Replace image ──
function guiReplaceImage() {
  if (guiSelectedImgs.size !== 1 || !guiFuiState) return;
  const idx = [...guiSelectedImgs][0];
  const doSwap = document.getElementById('chkGuiColorSwap').checked;

  const input = document.createElement('input');
  input.type = 'file'; input.accept = 'image/png,image/jpeg';
  input.onchange = () => {
    const file = input.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async e => {
      try {
        let newData = new Uint8Array(e.target.result);
        if (doSwap) newData = await guiApplyColorSwap(newData);

        const blob = new Blob([newData]);
        const url = URL.createObjectURL(blob);
        const tmpImg = new Image();
        tmpImg.onload = () => {
          const w = tmpImg.naturalWidth, h = tmpImg.naturalHeight;
          URL.revokeObjectURL(url);
          guiFuiState.images[idx].data = newData;
          guiFuiState.imageInfos[idx].width = w;
          guiFuiState.imageInfos[idx].height = h;
          guiFuiState.imageInfos[idx].imageSize = newData.byteLength;
          guiRenderFuiImages();
          guiLog(t('log.guiImgReplaced', idx, w, h), 'l-ok');
        };
        tmpImg.onerror = () => { URL.revokeObjectURL(url); guiLog(t('log.guiImgLoadFail'), 'l-warn'); };
        tmpImg.src = url;
      } catch (e) {
        guiLog(t('log.guiReplaceErr', e.message), 'l-warn');
      }
    };
    reader.readAsArrayBuffer(file);
  };
  input.click();
}

// ── Download ARC ──
function guiDownloadArc() {
  if (guiFuiState && guiFuiPath) {
    try {
      guiArcFiles[guiFuiPath] = guiBuildFui(guiFuiState);
      guiLog(t('log.guiFuiUpdated', guiFuiPath.split('\\').pop()), 'l-ok');
    } catch (err) {
      guiLog(t('log.guiFuiWriteErr', err.message), 'l-warn'); return;
    }
  }
  try {
    const arcBytes = guiBuildArc(guiArcFiles);
    const blob = new Blob([arcBytes], { type: 'application/octet-stream' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = guiArcFileName || 'modified.arc'; a.click();
    URL.revokeObjectURL(url);
    guiLog(t('log.guiArcDownloaded', arcBytes.byteLength), 'l-ok');
  } catch (err) {
    guiLog(t('log.guiArcWriteErr', err.message), 'l-warn');
  }
}

// ── GUI init ──
(function guiInit() {
  setupDrop('dropGui', 'fileGui', files => { const f = files[0]; if (f) guiOnFileSelected(f); });
  document.getElementById('btnGuiExpand').addEventListener('click', guiLoadArc);
  document.getElementById('btnGuiSaveImg').addEventListener('click', guiSaveImage);
  document.getElementById('btnGuiReplaceImg').addEventListener('click', guiReplaceImage);
  document.getElementById('btnGuiDownload').addEventListener('click', guiDownloadArc);
  document.getElementById('btnGuiTxtSave').addEventListener('click', guiTxtSave);
}());

// ── Pack GUI init ──
document.getElementById('btnPackGuiConvert').addEventListener('click', doPackGuiConvert);
