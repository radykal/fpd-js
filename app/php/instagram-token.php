<?php

$client_secret = ''; //ADD YOUR INSTAGRAM SECRET ID HERE

$client_app_id = isset($_GET['client_app_id']) ? $_GET['client_app_id'] : null;
$redirect_uri = isset($_GET['redirect_uri']) ? $_GET['redirect_uri'] : null;
$code = isset($_GET['code']) ? $_GET['code'] : null;


if( $client_app_id && $redirect_uri && $code && !empty($client_secret) ) {

	echo json_encode( getAccessToken($client_app_id, $redirect_uri, $client_secret, $code) );

}
else {

	echo json_encode(array(
		'error_message' => 'Client App ID, Redirect URI or Code is not set!'
	));

}

function getAccessToken($client_id, $redirect_uri, $client_secret, $code) {

	$url = 'https://api.instagram.com/oauth/access_token';

	$curlPost = 'client_id='. $client_id . '&redirect_uri=' . $redirect_uri . '&app_secret=' . $client_secret . '&code='. $code . '&grant_type=authorization_code';

	$ch = curl_init();
	curl_setopt($ch, CURLOPT_URL, $url);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	curl_setopt($ch, CURLOPT_POST, 1);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, FALSE);
	curl_setopt($ch, CURLOPT_POSTFIELDS, $curlPost);
	$data = json_decode(curl_exec($ch), true);
	$http_code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
	curl_close($ch);

	return $data;

}


?>