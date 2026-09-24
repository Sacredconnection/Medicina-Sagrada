<?php
/**
 * Plugin Name: Medicina Sagrada — Conexão Headless
 * Description: Revalidação do catálogo e conclusão da sacola do frontend Next.js. Os pagamentos continuam no plugin oficial Pagar.me.
 * Version: 1.0.1
 * Requires PHP: 7.4
 * Requires Plugins: woocommerce
 */

defined( 'ABSPATH' ) || exit;

// LiteSpeed was caching Store API GET /cart despite its Cache-Control header.
// Also exclude these routes in the cache panel and purge the old REST cache.
add_filter( 'rest_pre_dispatch', function ( $result, $server, $request ) {
    if ( preg_match( '#^/wc/store/v[0-9]+/(cart|checkout|order)(/|$)#', $request->get_route() ) ) {
        if ( ! defined( 'DONOTCACHEPAGE' ) ) { define( 'DONOTCACHEPAGE', true ); }
        do_action( 'litespeed_control_set_nocache', 'Medicina Sagrada: private commerce session' );
        nocache_headers();
        header( 'X-LiteSpeed-Cache-Control: no-cache' );
    }
    return $result;
}, 5, 3 );

add_action( 'rest_api_init', function () {
    register_rest_route( 'ms-headless/v1', '/status', array(
        'methods' => 'GET',
        'permission_callback' => '__return_true',
        'callback' => function () {
            return new WP_REST_Response( array(
                'version' => '1.0.1',
                'cart_completion' => class_exists( 'MS_Headless_Source_Session' ),
                'revalidation' => defined( 'MS_HEADLESS_URL' ) && defined( 'MS_REVALIDATION_SECRET' ) && strlen( MS_REVALIDATION_SECRET ) >= 32,
            ), 200, array( 'Cache-Control' => 'no-store' ) );
        },
    ) );
} );

// WooCommerce imports the session before template_redirect. Remove its bearer
// token from the address bar before rendering analytics, images or payment UI.
add_action( 'template_redirect', function () {
    if ( isset( $_GET['session'] ) && function_exists( 'is_checkout' ) && is_checkout() ) {
        nocache_headers();
        header( 'Referrer-Policy: no-referrer' );
        wp_safe_redirect( wc_get_checkout_url(), 303 );
        exit;
    }
}, 1 );

function ms_headless_cart_signature( $cart ) {
    $items = array();
    foreach ( $cart as $item ) {
        $id = ! empty( $item['variation_id'] ) ? (int) $item['variation_id'] : (int) $item['product_id'];
        $items[ $id ] = ( $items[ $id ] ?? 0 ) + (int) $item['quantity'];
    }
    ksort( $items );
    return hash( 'sha256', wp_json_encode( $items ) );
}

add_action( 'plugins_loaded', function () {
    if ( ! class_exists( 'WC_Session_Handler' ) ) { return; }

    class MS_Headless_Source_Session extends WC_Session_Handler {
        public function consume( $source_id, $expected_signature ) {
            if ( ! is_string( $source_id ) || ! preg_match( '/^t_[a-zA-Z0-9]{20,64}$/', $source_id ) ) { return; }
            $data = (array) $this->get_session( $source_id, array() );
            $cart = isset( $data['cart'] ) ? maybe_unserialize( $data['cart'] ) : array();
            if ( ! is_array( $cart ) || ! $cart || ! hash_equals( $expected_signature, ms_headless_cart_signature( $cart ) ) ) { return; }
            // If the buyer changed the source bag after leaving for checkout,
            // its signature differs and the new items are preserved.
            $this->_customer_id = $source_id;
            $this->_data = $data;
            foreach ( array( 'cart', 'cart_totals', 'applied_coupons', 'coupon_discount_totals', 'coupon_discount_tax_totals', 'removed_cart_contents' ) as $key ) {
                $this->set( $key, array() );
            }
            $this->save_data();
        }
    }
} );

function ms_headless_tag_order( $order ) {
    if ( ! WC()->session || ! WC()->cart ) { return; }
    $source = WC()->session->get( 'previous_customer_id' );
    if ( is_string( $source ) && preg_match( '/^t_[a-zA-Z0-9]{20,64}$/', $source ) ) {
        $order->update_meta_data( '_ms_headless_source', $source );
        $order->update_meta_data( '_ms_headless_cart_signature', ms_headless_cart_signature( WC()->cart->get_cart() ) );
    }
}
add_action( 'woocommerce_checkout_create_order', 'ms_headless_tag_order', 10, 1 );
add_action( 'woocommerce_store_api_checkout_update_order_meta', 'ms_headless_tag_order', 10, 1 );

function ms_headless_complete_source( $order_id ) {
    if ( ! class_exists( 'MS_Headless_Source_Session' ) ) { return; }
    $order = wc_get_order( $order_id );
    if ( ! $order || $order->has_status( array( 'failed', 'cancelled', 'refunded', 'checkout-draft' ) ) ) { return; }
    $source = $order->get_meta( '_ms_headless_source' );
    $signature = $order->get_meta( '_ms_headless_cart_signature' );
    if ( $source && $signature ) { ( new MS_Headless_Source_Session() )->consume( $source, $signature ); }
}
add_action( 'woocommerce_payment_complete', 'ms_headless_complete_source' );
add_action( 'woocommerce_order_status_processing', 'ms_headless_complete_source' );
add_action( 'woocommerce_order_status_on-hold', 'ms_headless_complete_source' );
add_action( 'woocommerce_thankyou', function ( $order_id ) {
    $order = wc_get_order( $order_id );
    $key = isset( $_GET['key'] ) && is_string( $_GET['key'] ) ? wc_clean( wp_unslash( $_GET['key'] ) ) : '';
    if ( $order && $key && hash_equals( $order->get_order_key(), $key ) ) { ms_headless_complete_source( $order_id ); }
} );

function ms_headless_schedule_revalidation() {
    static $scheduled = false;
    if ( $scheduled || ! defined( 'MS_HEADLESS_URL' ) || ! defined( 'MS_REVALIDATION_SECRET' ) || strlen( MS_REVALIDATION_SECRET ) < 32 ) { return; }
    $scheduled = true;
    add_action( 'shutdown', function () {
        wp_remote_post( trailingslashit( MS_HEADLESS_URL ) . 'api/revalidate/', array(
            'timeout' => 3,
            'blocking' => false,
            'headers' => array( 'Content-Type' => 'application/json', 'Authorization' => 'Bearer ' . MS_REVALIDATION_SECRET ),
            'body' => wp_json_encode( array( 'path' => '/' ) ),
        ) );
    } );
}
add_action( 'save_post', function ( $post_id ) {
    if ( ! wp_is_post_revision( $post_id ) && in_array( get_post_type( $post_id ), array( 'post', 'page', 'product', 'product_variation' ), true ) ) { ms_headless_schedule_revalidation(); }
} );
add_action( 'woocommerce_product_set_stock', 'ms_headless_schedule_revalidation' );
add_action( 'woocommerce_variation_set_stock', 'ms_headless_schedule_revalidation' );
add_action( 'edited_product_cat', 'ms_headless_schedule_revalidation' );
