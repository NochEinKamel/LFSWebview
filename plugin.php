<?php

$plugini = 0;
$plugindata = array(
					"Info" => array("Track" => "AS7"),
					"Player" => array(),
					"MCI"	=> array()
			);


function handleMCI($packet) {
	global $plugindata, $plugini;

	foreach ($packet->Info as $c) {
		$carr = array();
		foreach ($c as $foo => $bar)
			$carr[$foo] = $bar;
		
		$plugindata['MCI'][$c->PLID] = $carr;
		$plugindata['Player'][$c->PLID] = array("Name" => "Some AI");
	}
	
	$fh = fopen('E:\proggen\php\lfswebview\racedata\test.json', 'w') or die("can't open file");
	fwrite($fh, json_encode($plugindata)) or die('Could not write to file');
	fclose($fh) or die('Could not release file handle');
	echo $plugini . "Wrote File with ".count($plugindata['Player'])." Drivers.".PHP_EOL;
	$fh = fopen('E:\proggen\php\lfswebview\racedata\test_'.$plugini.'.json', 'w') or die("can't open file");
	fwrite($fh, json_encode($plugindata)) or die('Could not write to file');
	fclose($fh) or die('Could not release file handle');

	$plugini++;
	//die();
}