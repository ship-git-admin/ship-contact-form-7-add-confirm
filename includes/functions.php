<?php
/**
 *
 *
 * Created by PhpStorm.
 * Author: Eyeta Co.,Ltd.(http://www.eyeta.jp)
 * 
 */


function wpcf7c_load_textdomain( $locale = null ) {
	global $l10n;

	$domain = 'contact-form-7-add-confirm';

	if ( get_locale() == $locale ) {
		$locale = null;
	}

	if ( empty( $locale ) ) {
		if ( is_textdomain_loaded( $domain ) ) {
			return true;
		} else {
			return load_plugin_textdomain( $domain, false, $domain . '/languages' );
		}
	} else {
		$mo_orig = $l10n[$domain];
		unload_textdomain( $domain );

		$mofile = $domain . '-' . $locale . '.mo';
		$path = WP_PLUGIN_DIR . '/' . $domain . '/languages';

		if ( $loaded = load_textdomain( $domain, $path . '/'. $mofile ) ) {
			return $loaded;
		} else {
			$mofile = WP_LANG_DIR . '/plugins/' . $mofile;
			return load_textdomain( $domain, $mofile );
		}

		$l10n[$domain] = $mo_orig;
	}

	return false;
}


function wpcf7c_load_modules() {
	$dir = WPCF7C_PLUGIN_MODULES_DIR;

	if ( empty( $dir ) || ! is_dir( $dir ) ) {
		return false;
	}

	$mods = array(
		'confirm', 'back' );

	foreach ( $mods as $mod ) {
		$file = trailingslashit( $dir ) . $mod . '.php';

		if ( file_exists( $file ) ) {
			include_once $file;
		}
	}
}


/**
 * Determine whether this request can render a Contact Form 7 form.
 *
 * Assets are printed before template output, so inspect the main query's
 * content for the CF7 shortcode or block. Sites that render forms from
 * widgets, page-builder metadata, or templates can override this with the
 * wpcf7c_should_enqueue_assets filter.
 *
 * @return bool Whether AddConfirm front-end assets should be enqueued.
 */
function wpcf7c_should_enqueue_assets() {
	static $should_enqueue = null;

	if ( null !== $should_enqueue ) {
		return $should_enqueue;
	}

	$query_posts = array();
	$should_enqueue = is_admin();

	if ( ! $should_enqueue ) {
		global $wp_query;

		if ( isset( $wp_query->posts ) && is_array( $wp_query->posts ) ) {
			$query_posts = $wp_query->posts;
		} else {
			$current_post = get_post();

			if ( $current_post ) {
				$query_posts[] = $current_post;
			}
		}

		foreach ( $query_posts as $post ) {
			if ( ! isset( $post->post_content ) || ! is_string( $post->post_content ) ) {
				continue;
			}

			$content = $post->post_content;
			$has_cf7_shortcode = false;

			if ( false !== strpos( $content, '[contact-form-7' ) ) {
				$has_cf7_shortcode = ! function_exists( 'has_shortcode' )
					|| has_shortcode( $content, 'contact-form-7' );
			}

			if ( function_exists( 'has_block' ) ) {
				$has_cf7_block = has_block( 'contact-form-7/contact-form-selector', $content );
			} else {
				$has_cf7_block = false !== strpos( $content, 'contact-form-7/contact-form-selector' );
			}

			if ( $has_cf7_shortcode || $has_cf7_block ) {
				$should_enqueue = true;
				break;
			}
		}

		// The events template renders this form with do_shortcode() after
		// wp_enqueue_scripts has run, so post-content scanning cannot find it.
		// Load the assets only while the event's CF7 application form is shown.
		if ( ! $should_enqueue && wpcf7c_event_template_uses_cf7() ) {
			$should_enqueue = true;
		}
	}

	$should_enqueue = (bool) apply_filters(
		'wpcf7c_should_enqueue_assets',
		$should_enqueue,
		$query_posts
	);

	return $should_enqueue;
}


/**
 * Detect the CF7 form rendered by the site's events template.
 *
 * Legacy events without a provider value use CF7. Events that use Formrun,
 * hide the application form, or have ended do not need AddConfirm assets.
 *
 * @return bool Whether the current event template will render the CF7 form.
 */
function wpcf7c_event_template_uses_cf7() {
	if ( ! is_singular( 'events' ) || ! function_exists( 'get_field' ) ) {
		return false;
	}

	$post_id = get_queried_object_id();

	if ( ! $post_id ) {
		return false;
	}

	$show_form = get_field( 'EntryData_ContactBtn', $post_id );
	$is_finished = get_field( 'EntryData_Fin', $post_id );

	if ( empty( $show_form ) || ! empty( $is_finished ) ) {
		return false;
	}

	$form_provider = get_field( 'EntryData_ApplicationFormType', $post_id );

	// Existing events without the provider field default to Contact Form 7.
	return empty( $form_provider ) || 'contact_form_7' === $form_provider;
}


function wpcf7c_plugin_url( $path = '' ) {
	$url = untrailingslashit( WPCF7C_PLUGIN_URL );

	if ( ! empty( $path ) && is_string( $path ) && false === strpos( $path, '..' ) )
		$url .= '/' . ltrim( $path, '/' );

	return $url;
}

