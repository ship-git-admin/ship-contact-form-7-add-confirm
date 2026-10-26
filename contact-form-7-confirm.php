<?php
/*
Plugin Name: Ship Contact Form 7 add confirm (compatibility fork)
Plugin URI: https://github.com/ship-git-admin/ship-contact-form-7-add-confirm
Description: Add confirm step to contact form 7
Author: SHIPChatGPT
Author URI: http://www.eyeta.jp/
Text Domain: contact-form-7-add-confirm
Domain Path: /languages/
Version: 1.0.1
*/

/*  Copyright 2014- Yuichiro ABE (email: y.abe at eyeta.jp)

    This program is free software; you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation; either version 2 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program; if not, write to the Free Software
    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA
*/


define( 'WPCF7C_VERSION', '1.0.1' );

if ( ! defined( 'WPCF7C_PLUGIN_BASENAME' ) )
	define( 'WPCF7C_PLUGIN_BASENAME', plugin_basename( __FILE__ ) );

if ( ! defined( 'WPCF7C_PLUGIN_NAME' ) )
	define( 'WPCF7C_PLUGIN_NAME', trim( dirname( WPCF7C_PLUGIN_BASENAME ), '/' ) );

if ( ! defined( 'WPCF7C_PLUGIN_DIR' ) )
	define( 'WPCF7C_PLUGIN_DIR', untrailingslashit( dirname( __FILE__ ) ) );

if ( ! defined( 'WPCF7C_PLUGIN_URL' ) )
	define( 'WPCF7C_PLUGIN_URL', untrailingslashit( plugins_url( '', __FILE__ ) ) );

if ( ! defined( 'WPCF7C_PLUGIN_MODULES_DIR' ) )
	define( 'WPCF7C_PLUGIN_MODULES_DIR', WPCF7C_PLUGIN_DIR . '/modules' );

/**
 * Load the GitHub update checker only in update-capable contexts. This keeps
 * its classes and update hooks out of ordinary front-end requests.
 */
if ( is_admin() || ( defined( 'DOING_CRON' ) && DOING_CRON ) || ( defined( 'WP_CLI' ) && WP_CLI ) ) {
	$wpcf7c_update_checker = WPCF7C_PLUGIN_DIR . '/lib/plugin-update-checker/plugin-update-checker.php';

	if ( is_readable( $wpcf7c_update_checker ) ) {
		require_once $wpcf7c_update_checker;

		\YahnisElsts\PluginUpdateChecker\v5\PucFactory::buildUpdateChecker(
			'https://github.com/ship-git-admin/ship-contact-form-7-add-confirm',
			__FILE__,
			'ship-contact-form-7-add-confirm'
		)->setBranch( 'main' );
	}
}



/**
 * Contact Form 7 is an optional dependency. Do not load AddConfirm's modules
 * until CF7 is available; older modules reference WPCF7_VERSION directly.
 * This also supports installations where AddConfirm appears before CF7 in the
 * active-plugin list.
 */
if (defined('WPCF7_VERSION')) {
	require_once WPCF7C_PLUGIN_DIR . '/settings.php';
} else {
	add_action('plugins_loaded', 'wpcf7c_bootstrap_after_cf7', 20);

	function wpcf7c_bootstrap_after_cf7() {
		if (!defined('WPCF7_VERSION')) {
			return;
		}

		require_once WPCF7C_PLUGIN_DIR . '/settings.php';

		// settings.php registered its plugins_loaded hook too late for this
		// request, so initialize it explicitly after all plugins are loaded.
		if (function_exists('wpcf7c')) {
			wpcf7c();
		}
	}
}
