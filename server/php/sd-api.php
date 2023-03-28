<?php
header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

$payload = json_decode(file_get_contents("php://input"), true);

define(
    'SD_API_KEY', 
    'ZFnMDwz14KCb26Lrjw8ybnDCnmpHKkiHvtEci9JWr8kVEwBjaqEMaNLZ1H0J'
);

$sd_endpoint = 'https://stablediffusionapi.com/api/v3/';
$sd_dreambooth_endpoint = 'https://stablediffusionapi.com/api/v4/dreambooth/';

function post_json( $url, $data=array() ) {
    
    $data['key'] = SD_API_KEY;
        
    $curl = curl_init();
    
    curl_setopt_array($curl, array(
      CURLOPT_URL => $url,
      CURLOPT_RETURNTRANSFER => true,
      CURLOPT_CUSTOMREQUEST => 'POST',
      CURLOPT_POSTFIELDS => json_encode($data),
      CURLOPT_HTTPHEADER => array(
          'Accept: application/json',
          'Content-Type: application/json'
      ),
    ));
    
    $response = curl_exec($curl);
    
    curl_close($curl);
    
    error_log($response);    
    echo json_encode( $response, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE  );
    
}


if( isset($payload['action']) ) {
    
    $action = $payload['action'];
    
    if( $action == 'text2img' && isset( $payload['prompt'] ) && !empty( $payload['prompt'] ) ) {
        
        post_json(
            $sd_endpoint.'text2img',
            array(
                'prompt' => $payload['prompt'],
                'samples' => isset( $payload['numOfImg'] ) ? intval( $payload['numOfImg'] ) : 1,
                'width' => 400,
                'height' => 400
            )
        );
        
    }
    
}

die;

?>