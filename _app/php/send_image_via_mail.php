<?php

/*
*
* An example php that sends the created image to a mail address
*
*/

//get the base-64 from data
$base64_str = substr($_POST['base64_image'], strpos($_POST['base64_image'], ",")+1);

$to = 	'your@mail.com';//set here your receiving mail address
$subject = 	'Fancy Product Designer'; //set here the mail subject
$bound_text = 	md5(date('r', time()));
$bound = 	"--".$bound_text."\r\n";
$bound_last = 	"--".$bound_text."--\r\n";

$headers = 	"From: sendermail@domain.com\r\n";//set here the sending mail address
$headers .= 	"MIME-Version: 1.0\r\n"
  	."Content-Type: multipart/mixed; boundary=\"$bound_text\"";

$message .= 	"If you can see this MIME than your client doesn't accept MIME types!\r\n"
  	.$bound;

$message .= 	"Content-Type: text/html; charset=\"iso-8859-1\"\r\n"
  	."Content-Transfer-Encoding: 7bit\r\n\r\n"
  	."Your message goes here\r\n" //set here the mail text
  	.$bound;

$message .= 	"Content-Type: image/png; name=\"mail_product.png\"\r\n"
  	."Content-Transfer-Encoding: base64\r\n"
  	."Content-disposition: attachment; file=\"mail_product.png\"\r\n"
  	."\r\n"
  	.chunk_split($base64_str)
  	.$bound_last;

if(mail($to, $subject, $message, $headers))
{
     echo json_encode(1);
} else {
     echo json_encode(0);
}

?>