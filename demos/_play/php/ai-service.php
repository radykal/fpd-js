<?php

//define the Genius license key
define( 'FPD_GENIUS_LICENSE_KEY', 'BCQ2I-AQZ0K-OVEZY-3SYKK' );

//define the domain that is registered for the license
define( 'FPD_GENIUS_DOMAIN', 'radykal.dep' );

//define the path to the uploads folder
define( 'FPD_UPLOADS_DIR', '../ai_uploads' ); 

//define the public url of the uploads folder
define( 'FPD_UPLOADS_DIR_URL', 'https://nginx/fpd-js/demos/_play/ai_uploads' ); 

require_once(dirname(__FILE__).'/ai/class-ai-service.php');

$input = file_get_contents('php://input');
$payload = json_decode($input, true);

$ai_service = new FPD_AI_Service($payload);

?>