<?php

require_once(dirname(__FILE__).'/../file-upload/image-utils.php');

if( !class_exists('FPD_AI_Service') ) {

	class FPD_AI_Service {

        const SUPER_RES_ENDPOINT = 'https://fpd-processing-b736b6466222.herokuapp.com/api/upscale';
        const REMOVE_BG_ENDPOINT = 'https://fpd-processing-b736b6466222.herokuapp.com/api/remove_background';
        const TEXT2IMG_ENDPOINT = 'https://fpd-processing-b736b6466222.herokuapp.com/api/text2image';
        const FETCH_IMG_TIMEOUT = 20; // the max. timeout to fetch the image

        public function __construct( $payload=array() ) {

            header("Access-Control-Allow-Headers: *");
            header("Access-Control-Allow-Origin: *");
            header('Content-Type: application/json');

            $error = null;
            if( !defined('FPD_GENIUS_LICENSE_KEY') )
                $error = 'API key not set!';

            if( !defined('FPD_GENIUS_DOMAIN') )
                $error = 'Domain not set!';

            else if( !defined('FPD_UPLOADS_DIR') )
                $error = 'FPD_UPLOADS_DIR not set!';

            else if( !defined('FPD_UPLOADS_DIR_URL') )
                $error = 'FPD_UPLOADS_DIR_URL not set!';

            else if(empty($payload) || !isset($payload['service'])) 
                $error = 'The payload is empty or incorrect!';

            if( !empty($error) ) {

                die( json_encode(
                    array(
                        'error'=> $error, 
                    )
                ) );

            }

            //super resolution service
            if( $payload['service'] == 'superRes' ) {

                $result = $this->send_json(
                    self::SUPER_RES_ENDPOINT,
                    array(
                        'image_url' => $payload['image'],
                        'scale' => intval( $payload['scale'] )
                    )
                );
            
                if( $result['status'] == 'success') {
                    
                    $remote_image_url = $result['data']['output'];
                    $this->download_image( $remote_image_url );
                    
            
                }
                else {
            
                    $this->error_output( $result );
            
                }
                
            }
            //remove background service
            else if( $payload['service'] == 'removeBG' ) {

                $result = $this->send_json(
                    self::REMOVE_BG_ENDPOINT,
                    array(
                        'image_url' => $payload['image'],
                    )
                );
                                
                if( $result['status'] == 'success') {
                    
                    $remote_image_url = $result['data']['output'];
                    $this->download_image( $remote_image_url );

                }
                else {

                    $this->error_output( $result );

                }

            }
            //remove background service
            else if( $payload['service'] == 'text2Img' ) {

                $result = $this->send_json(
                    self::TEXT2IMG_ENDPOINT,
                    array(
                        'prompt'    => $payload['prompt'],
                    )
                );

                if( isset($result['status']) && $result['status'] == 'success') {

                    $images = $result['data']['output'];
                                        
                    die( json_encode(
                        array(
                            'images' => $images
                        )
                    ) );

                }
                else {

                    $this->error_output( $result );

                }
                

            }
            else {
            
                die( json_encode(
                    array(
                        'error'=> 'No AI service available!', 
                    )
                ) );
            
            }

        }

        private function error_output( $result ) {

            die( json_encode(
                array(
                    'error' => 'Error' . ( isset( $result['message'] ) ? ': '.$result['message'] : '' ),
                    'data' => $result 
                )
            ) );

        }

        private function download_image( $remote_image_url ) {

            $image_exist = false;
            $count = 0;
            $sleep = 1; //sleep for 1 sec
    
            while(!$image_exist) {
                
                $image_exist = $this->is_image_available( $remote_image_url );
                
                if( $image_exist ) {
                    $this->save_local_image( $remote_image_url );
                }
                else if($count > intval(self::FETCH_IMG_TIMEOUT / $sleep)) {
    
                    die( json_encode(
                        array(
                            'error'=> 'Timeout reached - could not fetch image.',
                            'remoute_image_url' => $remote_image_url 
                        )
                    ) );
    
                }
    
                sleep($sleep);
                $count++;
    
            }

        }

        private function save_local_image( $remote_image_url ) {

            $upload_path = FPD_Image_Utils::get_upload_path(FPD_UPLOADS_DIR, basename($remote_image_url));
            $save_res = $this->save_image_from_url($remote_image_url, $upload_path['full_path']);
            
        
            if( $save_res ) {
        
                die( json_encode(
                    array(
                        'new_image'=> FPD_UPLOADS_DIR_URL. $upload_path['date_path'], 
                    )
                ) );
        
            }
        
        }
        
        
        private function send_json( $url, $data=array() ) {
        
            $ch = curl_init($url);

            curl_setopt_array($ch, array(
                CURLOPT_URL => $url,
                CURLOPT_RETURNTRANSFER => true,
                CURLOPT_ENCODING => '',
                CURLOPT_MAXREDIRS => 10,
                CURLOPT_TIMEOUT => 0,
                CURLOPT_FOLLOWLOCATION => true,
                CURLOPT_CUSTOMREQUEST => 'POST',
                CURLOPT_POSTFIELDS => json_encode($data),
                CURLOPT_HTTPHEADER => array(
                    "Content-Type: application/json",
                    "X_API_TOKEN: ". FPD_GENIUS_LICENSE_KEY,
                    "X_API_DOMAIN: ". FPD_GENIUS_DOMAIN
                )
            ));
        
            $result = curl_exec($ch);
            
            if ($result === FALSE) {
                // Handle error
        
                die( json_encode(
                    array(
                        'error'=> curl_error($ch), 
                    )
                ) );
        
            }
        
            curl_close($ch);
            
            return json_decode($result, true);
        }
        
        private function save_image_from_url( $imageUrl, $localPath ) {
        
            $ch = curl_init($imageUrl);
            $fp = fopen($localPath, 'wb');
        
            curl_setopt($ch, CURLOPT_FILE, $fp);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
        
            $success = curl_exec($ch);
        
            if (!$success) {
                return false;
            }
        
            curl_close($ch);
            fclose($fp);
        
            return true;
        }
        
        private function is_image_available( $url ) {

            $headers = get_headers($url);
            
            // Check if the server responded with a 200 OK status
            if (strpos($headers[0], '200 OK') !== false) {
                $contentType = "";
                foreach ($headers as $header) {
                    if (strpos($header, 'Content-Type:') !== false) {
                        $contentType = $header;
                        break;
                    }
                }
                                
                // Check if the content type is an image
                if (strpos($contentType, 'png') !== false || strpos($contentType, 'jpeg') !== false) {
                    return true;
                }
            }
            
            return false;
        }

    }

}

?>