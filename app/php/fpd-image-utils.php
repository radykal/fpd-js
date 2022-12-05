<?php

if(!class_exists('FPD_Image_Utils')) {

	class FPD_Image_Utils {

		public static function join_paths() {
		    $paths = array();

		    foreach (func_get_args() as $arg) {
		        if ($arg !== '') { $paths[] = $arg; }
		    }

		    return preg_replace('#/+#','/',join('/', $paths));
		}

		public static function get_upload_path( $upload_path, $filename, $ext='' ) {

			$date_path = '/';

			if(!file_exists($upload_path))
				mkdir($upload_path, 0755);

			$year = !function_exists('date') ? gmdate('Y') : date('Y');
			$date_path = self::join_paths($date_path, $year );
			if(!file_exists($upload_path . $date_path))
				mkdir($upload_path . $date_path, 0755);

			$month = !function_exists('date') ? gmdate('m') : date('m');
			$date_path = self::join_paths($date_path, $month );
			if(!file_exists($upload_path . $date_path))
				mkdir($upload_path . $date_path, 0755);

			$day = !function_exists('date') ? gmdate('d') : date('d');
			$date_path = self::join_paths($date_path, $day );

			if(!file_exists($upload_path . $date_path))
				mkdir($upload_path . $date_path, 0755);


			$file_path = self::join_paths($upload_path, $date_path, $filename);

			$file_counter = 1;
			$real_filename = $filename;

			while(file_exists($file_path.'.'.$ext)) {
				$real_filename = $file_counter.'-'.$filename;
				$file_path = self::join_paths($upload_path, $date_path, $real_filename);
				$file_counter++;
			}

			return array(
				'full_path' => $file_path,
				'date_path' => self::join_paths($date_path, $real_filename)
			);

		}

		public static function get_image_dpi( $filename ) {

		    $image = fopen($filename,'r');
		    $string = fread($image, 20);
		    fclose($image);

		    $data = bin2hex(substr($string,14,4));
		    $x = substr($data,0,4);
		    $y = substr($data,0,4);

		    return array(hexdec($x),hexdec($y));

		}

		public static function is_image( $url ) {

			$img_formats = array("image/png", "image/jpg", "image/jpeg", "image/svg");

			if( self::is_base64($url) ) {

				$key = false;
				foreach($img_formats as $k => $img_format) {

					if(strpos($url, $img_format) !== false) {
						$key = $k;
					}

				}

				return $key === false ? false : $img_formats[$key];

			}
			else {

				$img_info = getimagesize($url);
				$key = array_search(strtolower($img_info['mime']), $img_formats);
				return $key === false ? false : $img_formats[$key];

			}

		}

		public static function is_base64( $data_uri_str ) {

			$regex = '/^data:(.+?){0,1}(?:(?:;(base64)\,){1}|\,)(.+){0,1}$/';
			return (preg_match($regex, $data_uri_str) === 1);

		}

		public static function is_svg_string($string) {
			return preg_match("/<svg[^<]+>/",$string,$m) != 0;
		}

		public static function security_checks($filename) {

			// Block scripts based on their extension
			$forbidden_extensions = '/ph(p[3457st]?|t|tml|ar)/i'; // php|php3|php4|php5|php7|phps|phpt|pht|phtml|phar
			if (preg_match($forbidden_extensions, $filename))
			{
				return false;
			}
			return true;

		}

		public static function sanitize_filename($filename) {

			// Forbid Directory Traversal
			$filename = basename($filename);

			//allowed file extensions
			$ext = strtolower( pathinfo($filename, PATHINFO_EXTENSION) );
			if( !in_array($ext, ['jpeg','jpg','png','svg','pdf']) ) {
				throw new Exception("File not allowed!", 403);
			}

			// Block scripts based on their extension
			$forbidden_extensions = '/ph(p[3457st]?|t|tml|ar)/i'; // php|php3|php4|php5|php7|phps|phpt|pht|phtml|phar
			if ( preg_match($forbidden_extensions, $filename) )
			{
				throw new Exception("Malicious file detected", 403);
			}

			// Restrict the name to a safe character subset
			$sanitize_name = preg_replace("/[^a-z0-9\.]/", "", strtolower($filename));

			$filename_without_ext = substr($sanitize_name, 0, strpos($sanitize_name, '.')); //check if filename without extension has chars
			if( empty($filename_without_ext) )
				$sanitize_name = uniqid().$sanitize_name;

			return $sanitize_name;

		}

		public static function file_upload_error_message($error_code) {

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

	}

}


?>