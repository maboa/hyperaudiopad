<?php
	header('Content-type: application/json');
	header('Cache-control: no-cache');
	header('Pragma: no-cache');
	header('Expires: 0');

	$file_path = 'remixes/';
	$file_ext = '.json';

	if(isset($_GET['file'])) :

		$filename = $file_path . $_GET['file'] . $file_ext;

		if(isset($_GET['save']) && $_GET['save'] == '1') :
			// Save JSON to file
			if(isset($_POST['settings'])) :
				// Save the file

				$json = $_POST['settings'];

				// Need to check the server setting, otherwise the magic quotes screw up the JSON like \"syntax\":\"screwed\"
				if(get_magic_quotes_gpc()) {
					$json = stripslashes($json);
				}

				// Need to create any directories given in the filename.
				$path_arr = explode('/', $filename);
				$path_arr = array_slice($path_arr, 0, -1); // Remove the filename, leaving the path.
				$path_dir = implode('/', $path_arr);

				if(!file_exists($path_dir)) :
					mkdir($path_dir, 0777, true);
				endif;

				// Create the file and save it.
				$fp = fopen($filename,'w');
				fwrite($fp,$json);
				fclose($fp);
				echo $json;
			else :
				// Error: No JSON
?>
{
	"error": true,
	"errorMsg": "No JSON sent for save operation"
}
<?php
			endif;
		else :
			// Read the file
			if(file_exists($filename)) :
				$fp = fopen($filename,'r');
				$json = fread($fp,filesize($filename));
				fclose($fp);
				echo $json;
			else :
				// No JSON for the file. Send empty object.
?>
{}
<?php
			endif;
		endif;
	else :
		// Error: No file param
?>
{
	"error": true,
	"errorMsg": "Require file parameter"
}
<?php
	endif;