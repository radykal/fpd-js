<?php

$maximum_filesize = 1024 * 1000;


foreach($_FILES as $fieldName => $file) {

	$filename = $file['name'];

	//check if its an image
	if(!getimagesize($file['tmp_name'])) {
		echo json_encode(array('code' => 500, 'message' => 'File is not an image', 'filename' => $file['name']));
		die;
	}

	//check for php errors
	if($file['error'] !== UPLOAD_ERR_OK) {
		echo json_encode(array('code' => 500, 'message' => file_upload_error_message($file['error']), 'filename' => $filename));
		die;
	}

	//check for maximum upload size
	if($file['size'] > $maximum_filesize) {
		echo json_encode(array('code' => 500, 'message' => 'Uploaded image is too big', 'filename' => $filename));
		die;
	}

	$upload_path = dirname(dirname(__FILE__)) . '/uploaded_imgs/';
	if( @move_uploaded_file($file['tmp_name'], $upload_path.$filename) ) {
		//chmod($upload_path.$filename, 644);
		echo json_encode(array('code' => 200, 'filename' => $filename, 'realFilename' => preg_replace("/\\.[^.\\s]{3,4}$/", "", $filename)));
	}
	else {
		echo json_encode(array('error' => 2, 'message' => 'PHP Issue - move_uploaed_file failed', 'filename' => $filename));
	}
}

function file_upload_error_message($error_code) {

    switch ($error_code) {
        case UPLOAD_ERR_INI_SIZE:
            return 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
        case UPLOAD_ERR_FORM_SIZE:
            return 'The uploaded file exceeds the MAX_FILE_SIZE directive that was specified in the HTML form';
        case UPLOAD_ERR_PARTIAL:
            return 'The uploaded file was only partially uploaded';
        case UPLOAD_ERR_NO_FILE:
            return 'No file was uploaded';
        case UPLOAD_ERR_NO_TMP_DIR:
            return 'Missing a temporary folder';
        case UPLOAD_ERR_CANT_WRITE:
            return 'Failed to write file to disk';
        case UPLOAD_ERR_EXTENSION:
            return 'File upload stopped by extension';
        default:
            return 'Unknown upload error';
    }

}



?>