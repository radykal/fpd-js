<?php
//---- UPLOAD IMAGE FROM URL/DATA URI OR SVG STRING --------

$url = stripslashes($_POST['url']);

$mime_type = '';
$is_svg_string = false;

if( FPD_Image_Utils::is_svg_string($url) ) {
    $mime_type = 'image/svg';
    $is_svg_string = true;
}
else {

    $mime_type = FPD_Image_Utils::is_image($url);
    if ( $mime_type === false ) {
        $last_error = error_get_last();
        die( json_encode(array('error' => is_array($last_error) ?  $last_error['message'] : 'File is not an image!')) );
    }

}

$ext = str_replace('image/', '', $mime_type);

$upload_path = FPD_Image_Utils::get_upload_path($uploads_dir, $unique_file_name);
$image_path = $upload_path['full_path'].'.'.$ext;
$image_url = $uploads_dir_url. $upload_path['date_path'].'.'.$ext;

//use curl
$result = false;

//use file_put_contents to save file
if( function_exists('file_put_contents') ) {

    //create image on server from data uri
    $result = file_put_contents($image_path, $is_svg_string ? $url : file_get_contents($url));

}
//if file_put_contents not available, use curl
else if( !$result && function_exists('curl_exec') ) {

    try {

        $fp = fopen($image_path, 'w+');
        
        if( $is_svg_string ) {
            $result = fwrite($fp, $url);
        }
        else {
        
            $ch = curl_init($url);
        
            curl_setopt($ch, CURLOPT_FILE, $fp);
            curl_setopt($ch, CURLOPT_HEADER, 0);
            curl_setopt($ch, CURLOPT_TIMEOUT, 20);
        
            $result = curl_exec($ch);
        
            curl_close($ch);
        
        
        }
        
        fclose($fp);

    }
    catch(Exception $e) {

        echo json_encode( array('error' => $e->getMessage() ));
        die;

    }

}

if($result) {

    echo json_encode(array(
        'image_src' => $image_url
    ));

}
else {

    echo json_encode(array(
        'error' => 'The image could not be created. Please view the error log file of your server to see what went wrong!'
    ));

}
?>