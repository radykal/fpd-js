<?php

if(!isset($_POST['action']))
	die("No action set!");

$db_host = 'localhost'; //database host
$db_user = 'root';//database username
$db_pwd = 'root';//database password
$db_database = 'fpd'; //database name

//connect to database
$connection = mysql_connect($db_host, $db_user, $db_pwd) or die('Connection failed to mysql database. Check the database host, username and password.');
//select database
mysql_select_db($db_database) or die("Database could not be selected.");

//store product
if($_POST['action'] == 'store') {
	//get product views
	$views = $_POST['views'];
	//insert views in database table
	$sql = "INSERT INTO products (views) VALUES('$views')";
	$result = mysql_query($sql) or die('Product could not be stored.');

	if($result) {
		//get ID of insert product and echo it as json
		$id = mysql_insert_id();
		header('Content-Type: application/json');
		echo json_encode($id);
	}
}
//load product
else if($_POST['action'] == 'load') {
	//get product ID
	$id = $_POST['id'];
	//select product by ID
	$sql = "SELECT views FROM products WHERE ID=$id";
	$query = mysql_query($sql) or die('Product could not be selected.');
	//get the product views
	$result = mysql_result($query,0,"views");
	//echo result as json
	header('Content-Type: application/json');
	echo json_encode(stripslashes($result));
}

mysql_close();

?>