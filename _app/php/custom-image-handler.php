<?php

require_once(dirname(__FILE__).'/fpd-image-utils.php');
require_once(dirname(__FILE__).'/svg-handler.php');

$valid_mime_types = array(
    "image/png",
    "image/jpeg",
    "image/pjpeg",
    "image/svg+xml",
    "application/pdf"
);

$uploads_dir = $_POST['uploadsDir'];
$uploads_dir_url = $_POST['uploadsDirURL'];
$save_on_server = isset($_POST['saveOnServer']) ? (int) $_POST['saveOnServer'] : false;
$unique_file_name = md5(uniqid(rand(), true));

if(empty($uploads_dir) || empty($uploads_dir_url)) {
	die( json_encode(array('error' => 'You need to define a directory, where you want to save the uploaded user images!')) );
}

if(!function_exists('getimagesize')) {
	die( json_encode(array('error' => 'The php function getimagesize is not installed on your server. Please contact your server provider!')) );
}

if(isset($_FILES) && sizeof($_FILES) > 0 && isset($_FILES['pdf'])) {

	if( !extension_loaded('imagick') )
		die( json_encode(array('error' => 'Imagick extension is required in order to upload PDF files. Please enable Imagick on your server!')) );

	$pdf_file = $_FILES['pdf'];

	// First things first: input sanitation and security checks
	try {
		$sanitized_name = FPD_Image_Utils::sanitize_filename($pdf_file['name']);
	}
	catch (Exception $e) {
		die(json_encode(array('error' => $e->getMessage())));
	}

	$parts = pathinfo($sanitized_name);
	$filename = $parts['filename'];
	$ext = strtolower($parts['extension']);

	//check for php errors
	if( isset($file['error']) && $file['error'] !== UPLOAD_ERR_OK ) {
		die( json_encode( array(
			'error' => FPD_Image_Utils::file_upload_error_message($file['error']),
			'filename' => $filename
		)) );
	}

	if( !in_array($pdf_file['type'], $valid_mime_types) ) {
		die( json_encode(array(
			'error' => 'This file is not a PDF!',
			'filename' => $filename
		)) );
	}

	$upload_path = FPD_Image_Utils::get_upload_path($uploads_dir, $unique_file_name, $ext);
	$pdf_path = $upload_path['full_path'].'.'.$ext;
	$pdf_url = $uploads_dir_url . $upload_path['date_path'].'.'.$ext;

	$pdf_images = array();

	if( @move_uploaded_file($pdf_file['tmp_name'], $pdf_path) ) {

		try {

			$im = new Imagick();
			$im->setBackgroundColor(new ImagickPixel('transparent'));
			$im->setResolution(300, 300);
			$im->readImage($pdf_path);

			for($i = 0;$i < $im->getNumberImages(); $i++) {

				$image_name = $unique_file_name.'_'.($i+1) . '.png';
				$upload_path = FPD_Image_Utils::get_upload_path($uploads_dir, $image_name, 'png');
				$temp_image_path = $upload_path['full_path'];

				$im->setIteratorIndex($i);
				$im->setImageUnits(imagick::RESOLUTION_PIXELSPERINCH);
				$im->setImageFormat('png32');
				$im->writeImage($temp_image_path);

				$pdf_images[] = array(
					'filename' => $image_name,
					'image_url' => $uploads_dir_url . $upload_path['date_path']
				);

			}

			echo json_encode( array(
				'pdf_images' => $pdf_images,
			) );

			$im->destroy();

		}
		catch(ImagickException $e) {

			echo json_encode( array(
				'error' => $e->getMessage(),
				'filename' => $pdf_path,
				'details' => $e->getTrace()
			) );

		}

	}
	else {

		echo json_encode( array(
			'error' => 'PHP Issue - move_upload_file failed.',
			'filename' => $filename
		) );

	}

	die;
}

//upload image
if(isset($_FILES) && sizeof($_FILES) > 0) {

	$warning = null;

	foreach($_FILES as $fieldName => $file) {

		// First things first: input sanitation and security checks
		try {
			$sanitized_name = FPD_Image_Utils::sanitize_filename($file['name'][0]);
		}
		catch (Exception $e) {
			die(json_encode(array('error' => $e->getMessage())));
		}

		// Determining file name parts using pathinfo() instead of explode()
		// prevents double extensions (file.jpg.php) and directory traversal (../../file.jpg)
		$parts = pathinfo($sanitized_name);
		$filename = $parts['filename'];
		$ext = strtolower($parts['extension']);

		//check for php errors
		if( isset($file['error']) && $file['error'][0] !== UPLOAD_ERR_OK ) {
			die( json_encode( array(
				'error' => FPD_Image_Utils::file_upload_error_message($file['error'][0]),
				'filename' => $filename
			)) );
		}

		//check if its an image
		if( (!getimagesize($file['tmp_name'][0]) && $ext !== 'svg') || !in_array($file['type'][0], $valid_mime_types) ) {

			die( json_encode(array(
				'error' => 'This file is not an image!',
				'filename' => $filename
			)) );

		}

		$upload_path = FPD_Image_Utils::get_upload_path($uploads_dir, $unique_file_name, $ext);
		$image_path = $upload_path['full_path'].'.'.$ext;
		$image_url = $uploads_dir_url.'/'.$upload_path['date_path'].'.'.$ext;

		if( @move_uploaded_file($file['tmp_name'][0], $image_path) ) {

			if($ext === 'jpg' || $ext === 'jpeg') {

				if( function_exists('exif_read_data') ) {

					$exif = @exif_read_data($image_path);

				    if ($exif && isset($exif['Orientation']) && !empty($exif['Orientation'])) {

					    if( true || !class_exists('Imagick') ) {

						    $image = imagecreatefromjpeg($image_path);
						    $resolution = imageresolution($image);
					        unlink($image_path);

					        switch ($exif['Orientation']) {
					            case 3:
					                $image = imagerotate($image, 180, 0);
					                break;

					            case 6:
					                $image = imagerotate($image, -90, 0);
					                break;

					            case 8:
					                $image = imagerotate($image, 90, 0);
					                break;
					        }

					        if( is_array( $resolution ) ) {
						        imageresolution($image, $resolution[0], $resolution[1]);
						    }

					        imagejpeg($image, $image_path, 100);

					    }

				    }
				}
				else
					$warning = 'exif_read_data function is not enabled.';

			}
			else if($ext === 'svg') {

				//sanitize svg content and resave image
				if( function_exists('file_get_contents') ) {
					$fpd_svg_handler = new FPD_Svg_Handler();
					$fpd_svg_handler->sanitize_svg($image_path);
				}

			}

			echo json_encode( array(
				'image_src' => $image_url,
				'filename' => $filename,
				'warning' => $warning
			) );

		}
		else {

			echo json_encode( array(
				'error' => 'PHP Issue - move_upload_file failed.',
				'filename' => $filename
			) );

		}

	}

	die;

}


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

if($save_on_server) {

	$upload_path = FPD_Image_Utils::get_upload_path($uploads_dir, $unique_file_name);
	$image_path = $upload_path['full_path'].'.'.$ext;
	$image_url = $uploads_dir_url. $upload_path['date_path'].'.'.$ext;

}

//use curl
$result = false;

//use file_put_contents to save file
if( function_exists('file_put_contents') ) {

	//create image on server from data uri
	if($save_on_server) {
		$result = file_put_contents($image_path, $is_svg_string ? $url : file_get_contents($url));
	}
	//get data uri from url
	else {
		$result = file_get_contents($url);
		$info = getimagesize($url);
		$image_url = 'data: '.$info['mime'].';base64,'.base64_encode($result);
	}

}
//if file_put_contents not available, use curl
else if( !$result && function_exists('curl_exec') ) {

	try {

		////create image on server from url
		if($save_on_server) {

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
		//get data uri from url
		else {

			$ch = curl_init();
			curl_setopt($ch, CURLOPT_URL, $url);
			curl_setopt($ch, CURLOPT_HEADER, 0);
			curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
			curl_setopt($ch, CURLOPT_BINARYTRANSFER,1);
			$result = curl_exec($ch);
			curl_close($ch);

			$info = getimagesize($url);
			$image_url = 'data: '.$info['mime'].';base64,'.base64_encode($result);

		}

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