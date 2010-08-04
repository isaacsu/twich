<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="en" lang="en">
<head>
<title><?php echo $_POST['host']?>/<?php echo stripslashes($_POST['room'])?> chat log - <?php echo date('j M Y')?> </title>
<style type='text/css'>

</style>
<style type='text/css'>
body {
    font-family:Arial, sans-serif;
    font-size:10pt;
}

#log .hide {visibility:hidden;}
#log .nick {padding-right:6pt;font-weight:bold;}
#log .date {padding-right:6pt;font-size:8pt;}
</style>

</head>
<body>
<h3><?php echo date('j M Y')?></h3>
<h1><?php echo $_POST['host']?>/<?php echo stripslashes($_POST['room'])?> chat log</h1>
<table id='log'>
<?php echo stripslashes($_POST['content']) ?>
</table>

</body>
</html>
