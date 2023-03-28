<?php

/*
*
* An example php that gets the 64 bit encoded PNG URL and creates an image of it
*
*/

//get the base-64 from data
$base64_str = substr($_POST['base64_image'], strpos($_POST['base64_image'], ",")+1);

//decode base64 string
$decoded = base64_decode($base64_str);

$png_url = "product-".strtotime('now').".png";
//create png from decoded base 64 string and save the image in the parent folder
$result = file_put_contents($png_url, $decoded);

//send result - the url of the png or 0
header('Content-Type: application/json');
if($result) {
	$png_url = get_folder_url().$png_url;
	echo json_encode($png_url);
}
else {
	echo json_encode(0);
}

//returns the current folder URL
function get_folder_url() {
	$url = $_SERVER['REQUEST_URI']; //returns the current URL
	$parts = explode('/',$url);
	$dir = $_SERVER['SERVER_NAME'];
	for ($i = 0; $i < count($parts) - 1; $i++) {
		$dir .= $parts[$i] . "/";
	}
	return 'http://'.$dir;
}

?>