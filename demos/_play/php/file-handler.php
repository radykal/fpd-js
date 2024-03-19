<?php

$uploads_dir = '../uploads'; //define the path to the uploads folder
$uploads_dir_url = 'https://nginx/fpd-js/demos/_play/uploads'; //define the public url of the uploads folder

header("Access-Control-Allow-Headers: *");
header("Access-Control-Allow-Origin: *");
header('Content-Type: application/json');

require_once(dirname(__FILE__).'/file-upload/image-utils.php');
require_once(dirname(__FILE__).'/file-upload/svg-handler.php');

$valid_mime_types = array(
    "image/png",
    "image/jpeg",
    "image/pjpeg",
    "image/svg+xml",
    "application/pdf"
);

$unique_file_name = md5(uniqid(rand(), true));

if(empty($uploads_dir) || empty($uploads_dir_url))
	die( json_encode(
        array('error' => 'You need to define a directory, where you want to save the uploaded user images!')
    ) );

if(!function_exists('getimagesize'))
	die( json_encode(
        array('error' => 'The php function getimagesize is not installed on your server. Please contact your server provider!')
    ) );

if(isset($_FILES) && sizeof($_FILES) > 0) {

	if(isset($_FILES['pdf']))
        require_once(dirname(__FILE__).'/file-upload/pdf-to-images.php');
    else
        require_once(dirname(__FILE__).'/file-upload/upload-image.php');

}
else if( $_POST && isset($_POST['url']) ) {
    require_once(dirname(__FILE__).'/file-upload/data-to-image.php');
}

?>