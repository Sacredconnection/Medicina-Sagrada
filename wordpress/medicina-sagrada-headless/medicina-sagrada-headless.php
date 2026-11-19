<?php
/**
 * Plugin Name: Medicina Sagrada — Conexão Headless
 * Description: Revalidação do catálogo e conclusão da sacola do frontend Next.js. Os pagamentos continuam no plugin oficial Pagar.me.
 * Version: 1.3.1
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

add_action( 'rest_api_init', function () {
    foreach ( array( 'login', 'profile', 'logout', 'register', 'recover', 'save' ) as $action ) {
        register_rest_route( 'ms-account/v1', '/' . $action, array(
            'methods' => 'POST',
            'permission_callback' => function ( $request ) {
                return defined( 'MS_REVALIDATION_SECRET' ) && strlen( MS_REVALIDATION_SECRET ) >= 32
                    && hash_equals( 'Bearer ' . hash_hmac( 'sha256', 'ms-account-v1', MS_REVALIDATION_SECRET ), $request->get_header( 'authorization' ) );
            },
            'callback' => function ( $request ) use ( $action ) {
                $params = $request->get_json_params();
                if ( in_array( $action, array( 'register', 'recover' ), true ) ) {
                    $identity = trim( (string) ( $params['identity'] ?? '' ) );
                    if ( ! $identity || strlen( $identity ) > 254 || ( 'register' === $action && ! is_email( $identity ) ) ) {
                        return new WP_Error( 'invalid', 'Dados inv?lidos.', array( 'status' => 400 ) );
                    }
                    $limit = 'ms_email_' . hash( 'sha256', $action . strtolower( $identity ) );
                    if ( get_transient( $limit ) ) {
                        return new WP_Error( 'rate_limit', 'Aguarde.', array( 'status' => 429 ) );
                    }
                    set_transient( $limit, 1, 5 * MINUTE_IN_SECONDS );
                    if ( 'register' === $action ) {
                        if ( ! function_exists( 'wc_create_new_customer' ) || 'yes' !== get_option( 'woocommerce_enable_myaccount_registration' ) ) {
                            return new WP_Error( 'unavailable', 'Cadastro indispon?vel.', array( 'status' => 503 ) );
                        }
                        if ( ! email_exists( $identity ) ) {
                            if ( '1' === ( $params['newsletter'] ?? '' ) ) {
                                $_POST['mailchimp_woocommerce_newsletter'] = '1';
                            }
                            $customer = wc_create_new_customer( $identity );
                            if ( is_wp_error( $customer ) ) {
                                return new WP_Error( 'unavailable', 'Cadastro indispon?vel.', array( 'status' => 503 ) );
                            }
                        }
                    } else {
                        $sent = retrieve_password( $identity );
                        if ( is_wp_error( $sent ) && ! in_array( $sent->get_error_code(), array( 'invalid_email', 'invalidcombo', 'invalid_username' ), true ) ) {
                            return new WP_Error( 'unavailable', 'Envio indispon?vel.', array( 'status' => 503 ) );
                        }
                    }
                    $result = array( 'accepted' => true );
                } elseif ( 'login' === $action ) {
                    $login = trim( (string) ( $params['login'] ?? '' ) );
                    $limit = 'ms_login_' . hash( 'sha256', strtolower( $login ) );
                    $attempts = (int) get_transient( $limit );
                    if ( $attempts >= 8 ) {
                        return new WP_Error( 'rate_limit', 'Aguarde antes de tentar novamente.', array( 'status' => 429 ) );
                    }
                    $user = wp_authenticate( $login, (string) ( $params['password'] ?? '' ) );
                    if ( is_wp_error( $user ) ) {
                        set_transient( $limit, $attempts + 1, 10 * MINUTE_IN_SECONDS );
                        return new WP_Error( 'invalid_login', 'Credenciais inválidas.', array( 'status' => 401 ) );
                    }
                    delete_transient( $limit );
                    $session = bin2hex( random_bytes( 32 ) );
                    set_transient( 'ms_customer_' . hash( 'sha256', $session ), $user->ID, ( $params['remember'] ?? '0' ) === '1' ? 14 * DAY_IN_SECONDS : HOUR_IN_SECONDS );
                    $result = array( 'session' => $session );
                } else {
                    $key = 'ms_customer_' . hash( 'sha256', (string) ( $params['session'] ?? '' ) );
                    $user = get_userdata( (int) get_transient( $key ) );
                    if ( ! $user ) {
                        return new WP_Error( 'expired', 'Sessão expirada.', array( 'status' => 401 ) );
                    }
                    if ( 'save' === $action ) {
                        $section = $params['section'] ?? '';
                        $customer = new WC_Customer( $user->ID );
                        if ( in_array( $section, array( 'billing', 'shipping' ), true ) ) {
                            foreach ( array( 'first_name', 'last_name', 'company', 'address_1', 'address_2', 'city', 'state', 'postcode', 'country' ) as $field ) {
                                $value = sanitize_text_field( $params[$field] ?? '' );
                                if ( in_array( $field, array( 'address_1','city','country' ), true ) && ! $value ) {
                                    return new WP_Error( 'required', 'Preencha os campos obrigat?rios.', array( 'status' => 400 ) );
                                }
                                $setter = 'set_' . $section . '_' . $field;
                                $customer->$setter( $value );
                            }
                            $customer->save();
                        } elseif ( 'details' === $section ) {
                            $name = sanitize_text_field( $params['name'] ?? '' );
                            $email = sanitize_email( $params['email'] ?? '' );
                            if ( ! $name || ! is_email( $email ) ) { return new WP_Error( 'invalid', 'Confira os dados.', array( 'status' => 400 ) ); }
                            $changes = array( 'ID' => $user->ID, 'display_name' => $name );
                            $password = (string) ( $params['new_password'] ?? '' );
                            if ( $email !== $user->user_email || $password !== '' ) {
                                if ( ! wp_check_password( (string) ( $params['password'] ?? '' ), $user->user_pass, $user->ID ) ) { return new WP_Error( 'invalid', 'Confira a senha atual.', array( 'status' => 400 ) ); }
                                $changes['user_email'] = $email;
                                if ( $password !== '' ) {
                                    if ( strlen( $password ) < 12 ) { return new WP_Error( 'short', 'Senha muito curta.', array( 'status' => 400 ) ); }
                                    $changes['user_pass'] = $password;
                                }
                            }
                            if ( is_wp_error( wp_update_user( $changes ) ) ) { return new WP_Error( 'invalid', 'Confira os dados.', array( 'status' => 400 ) ); }
                        } else { return new WP_Error( 'invalid', 'Se??o inv?lida.', array( 'status' => 400 ) ); }
                        $result = array( 'ok' => true );
                    } elseif ( 'logout' === $action ) {
                        delete_transient( $key );
                        $result = array( 'ok' => true );
                    } else {
                        if ( ! function_exists( 'wc_get_orders' ) ) {
                            return new WP_Error( 'unavailable', 'WooCommerce indisponível.', array( 'status' => 503 ) );
                        }
                        $orders = wc_get_orders( array( 'customer_id' => $user->ID, 'type' => 'shop_order', 'limit' => 10, 'orderby' => 'date', 'order' => 'DESC' ) );
                        $result = array( 'name' => $user->display_name, 'email' => $user->user_email, 'orders' => array_map( function ( $order ) use ( $params ) {
                            $summary = array( 'id' => $order->get_order_number(), 'status' => wc_get_order_status_name( $order->get_status() ), 'total' => html_entity_decode( wp_strip_all_tags( $order->get_formatted_order_total() ), ENT_QUOTES, 'UTF-8' ) );
                            if ( (string) $summary['id'] === ( $params['order'] ?? '' ) ) {
                                $date = $order->get_date_created();
                                $summary['date'] = $date ? wc_format_datetime( $date ) : '';
                                $summary['payment'] = $order->get_payment_method_title();
                                $summary['items'] = array_values( array_map( function ( $item ) use ( $order ) {
                                    return array( 'name' => $item->get_name(), 'quantity' => $item->get_quantity(), 'amount' => html_entity_decode( wp_strip_all_tags( $order->get_formatted_line_subtotal( $item ) ), ENT_QUOTES, 'UTF-8' ) );
                                }, $order->get_items() ) );
                            }
                            return $summary;
                        }, $orders ) );
                        $customer = new WC_Customer( $user->ID );
                        $result['addresses'] = array( 'billing' => $customer->get_data()['billing'], 'shipping' => $customer->get_data()['shipping'] );
                        $result['downloads'] = array_values( array_map( function ( $item ) {
                            return array( 'name' => $item['download_name'], 'url' => $item['download_url'] );
                        }, wc_get_customer_available_downloads( $user->ID ) ) );
                        $result['payments'] = array_values( array_map( function ( $token ) {
                            return $token->get_display_name();
                        }, WC_Payment_Tokens::get_customer_tokens( $user->ID ) ) );
                        $result['sections'] = array_keys( wc_get_account_menu_items() );
                    }
                }
                $response = rest_ensure_response( $result );
                $response->header( 'Cache-Control', 'private, no-store' );
                return $response;
            },
        ) );
    }
} );
