# 席替えメーカー

## 概要

席替えメーカーは、クラスやグループの座席表を簡単に作成・編集・保存・エクスポートできるWebアプリです。ドラッグ＆ドロップや各種制約、CSVインポート・エクスポートなど多機能で、学校現場やイベント運営など幅広く活用できます。

## 主な機能

- 行数・列数・生徒リストの入力
- 列制約・行制約・固定席の設定
- ドラッグ＆ドロップによる座席の手動調整
- 設定の保存・読込（ローカルストレージ/JSONファイル）
- 座席表のエクスポート（テキスト/CSV/画像）
- CSVインポート（標準形式・マトリックス形式両対応）
- 設定パネルの開閉
- 各種バリデーション・エラーハンドリング
- レスポンシブデザイン

## CSVインポート・エクスポート

### エクスポート形式
- 標準形式: `行,列,生徒名` 例: `1,1,田中太郎`
- マトリックス形式: 各行が座席の1行、各列が座席の1列 例:
  ```csv
  "A","B","C"
  "D","E","F"
  "G","H","I"
  ```
- 空欄セルは空席扱い。`●`などの記号も生徒名として扱われます。

### インポート方法
1. 「📤 CSV読込」ボタンをクリック
2. CSVファイルを選択（標準形式・マトリックス形式どちらも可）
3. 座席表が自動で復元されます

## 使い方
1. 行数・列数・生徒名を入力
2. 必要に応じて制約や固定席を設定
3. 「🎲 席替え実行」ボタンでランダム配置
4. 結果をドラッグ＆ドロップで微調整
5. 必要に応じてエクスポート・保存

## 注意事項
- 生徒名は1行1名で入力してください
- CSVインポート時、空欄セルのみ空席扱いとなります
- 「●」などの記号も生徒名として扱われます