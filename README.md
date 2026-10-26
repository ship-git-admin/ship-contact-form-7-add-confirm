# Ship Contact Form 7 add confirm

SHIPで管理する Contact Form 7 確認画面フォークです。上流の「Contact Form 7 add confirm」を基に、CF7 6.x 互換性と GitHub Release 経由の更新を管理します。

## 更新方法

- ソース: `ship-git-admin/ship-contact-form-7-add-confirm` の `main`
- WordPress更新チェッカー: 同梱の Yahnis Elsts Plugin Update Checker v5.7
- リリース: `vX.Y.Z` のGitタグとGitHub Releaseを同じバージョンで作成
- インストール先のプラグインディレクトリ名は `ship-contact-form-7-add-confirm`

リポジトリは公開設定にし、WordPressからGitHub API認証なしで更新パッケージを取得できるようにします。トークンや認証情報はソースに含めません。

## 性能変更

通常リクエストではこのプラグインから no-cache ヘッダーを付けません。`_wpcf7c=step1` または `_wpcf7c=step2` の確認処理だけ、既存の no-cache ヘッダーを維持します。ホスティング側のページキャッシュが有効なら、フォームを含むページもキャッシュ候補になります。

確認画面用のCSS/JSは、メインクエリの本文にContact Form 7のショートコードまたはブロックがあるページだけで読み込みます。ウィジェット、ページビルダーのメタデータ、テーマテンプレートなどからフォームを動的に出力する場合は、テーマやスニペットから `wpcf7c_should_enqueue_assets` フィルターで対象ページを追加してください。CF7フォームタグを登録するPHPモジュールは、フォームの解析に必要なためCF7が有効なリクエストで引き続き読み込みます。

```php
function ship_example_load_add_confirm_assets( $should_enqueue ) {
	return $should_enqueue || is_page( 'contact' );
}
add_filter( 'wpcf7c_should_enqueue_assets', 'ship_example_load_add_confirm_assets' );
```

`contact` はフォームを動的に出力するページのスラッグに置き換えてください。サイト共通のウィジェットなどで全ページにフォームを出す場合は、`__return_true` を指定できます。

## ライセンス

確認画面プラグイン本体は GPLv2 or later です。`lib/plugin-update-checker/` は同梱ライブラリ自身の `license.txt` を参照してください。
