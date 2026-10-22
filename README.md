# ZERO TRUST CITY

ゼロトラストを体験しながら学ぶセキュリティ研修ゲーム。

> ⚠️ 企業・人物・資料はすべてゲーム内の架空設定です。接続先や攻撃はすべてゲーム内の演出で、外部のシステムには一切アクセスしません。

## 遊ぶ

GitHub Pages で公開: https://ryuseiito-rgp.github.io/security_textbook/

ローカルでは `index.html` をブラウザで開くだけで動きます（ビルド不要）。

## フォルダ構成

```
index.html        画面の文章・ボタン（HTMLの骨組み）
css/              見た目
js/               動作
vendor/           three.js r160（MIT License・編集不要）
```

## よく編集する場所

| やりたいこと | 編集するファイル |
|---|---|
| 研修のシナリオ・セリフを変える | `js/scenario/scenarios.js` |
| 種明かし（解説）の内容を変える | `js/ui/screens.js` |
| スタート画面の文言を変える | `index.html` |
| チュートリアルの文言を変える | `js/ui/tutorial.js` |
| 色を変える | `css/01-base.css` の `:root` |
| 街並み・建物を変える | `js/world/city.js` |

## CSS（番号順に読み込み）

後の番号のファイルが前の番号の指定を上書きします。見た目が変わらないときは、より大きい番号のファイルに同じ指定がないか確認してください。

| ファイル | 内容 |
|---|---|
| `css/01-base.css` | 変数（色・フォント）、リセット、全体の土台 |
| `css/02-vignette-hud.css` | 画面周辺の暗がり、左上の目標表示・右上ミニマップ（HUD） |
| `css/03-prompt-dialogue.css` | 「調べる」プロンプト、会話ウィンドウ、話者ごとの色 |
| `css/04-screens.css` | スタート画面・アバター選択・種明かし（全画面） |
| `css/05-effects.css` | 鬼ごっこタイマー、フェード、ミッション完了バナー |
| `css/06-touch.css` | スマホ用スティック・ボタン |
| `css/07-loader-misc.css` | 読み込み画面、スクロールバー、細かな調整 |
| `css/08-speech-popups.css` | AIの吹き出し、中央の結果ポップアップ（レイアウト改訂版） |
| `css/09-guide.css` | カフェの誘導表示、相棒の吹き出しの安定化 |
| `css/10-remote.css` | 自宅PCの接続先リスト、失敗ルートの×印 |
| `css/11-screen-preview.css` | 操作画面イメージ（疑似ブラウザ） |
| `css/12-fit.css` | 一画面に収めるための縮小調整 |
| `css/13-final.css` | スタートボタン配置、タッチ時の表示切替、AIAアイコン、チュートリアル |

## JavaScript（index.html に書いた順に読み込み）

各ファイルは同じグローバル領域を共有しています。関数や変数は別ファイルから直接呼べますが、**読み込み順は変えないでください**（`main.js` は必ず最後）。新しいファイルを足すときも `index.html` に `<script>` を追加します。

| ファイル | 内容 |
|---|---|
| `vendor/three.r160.js` | three.js 本体 |
| `js/core/utils.js` | 小物ユーティリティ（$、clamp、lerp など） |
| `js/core/audio.js` | 効果音（失敗しても無視） |
| `js/engine/three-setup.js` | three.js の初期化、マテリアル・看板の生成 |
| `js/world/city.js` | 街並み・建物・コライダー（当たり判定） |
| `js/world/characters.js` | 人型キャラクターのモデルとアニメーション |
| `js/player/player.js` | プレイヤー、カメラ、キーボード・スティック入力 |
| `js/player/collision.js` | 壁との衝突処理 |
| `js/systems/interact.js` | 「調べる」対象の登録と判定 |
| `js/ui/dialogue.js` | 会話ウィンドウ、話者、画面イメージ |
| `js/scenario/scenarios.js` | シナリオ S1〜S4（研修内容の本体） |
| `js/scenario/climax.js` | ミッション完了 → ブラックアウト → 鬼ごっこ |
| `js/ui/screens.js` | 種明かし画面、AIヒント、画面遷移 |
| `js/core/game-loop.js` | ゲーム開始とメインループ |
| `js/ui/minimap.js` | ミニマップ |
| `js/core/boot.js` | 起動処理 |
| `js/systems/guidance.js` | 目的地までの経路探索と誘導ドット |
| `js/scenario/remote-pc.js` | 自宅PCから会社システムへの接続（架空） |
| `js/ui/touch.js` | タッチ端末の判定と表示切替 |
| `js/ui/tutorial.js` | 操作チュートリアル |
| `js/main.js` | ボタンの割り当てと起動（最後に読み込む） |

## 更新の手順

1. ファイルを編集
2. `index.html` をブラウザで開いて動作確認
3. GitHub にコミット（数分で公開ページに反映）
