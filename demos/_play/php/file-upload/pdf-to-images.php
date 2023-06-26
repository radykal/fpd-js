<?php
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
?>