<title><?php echo $_SERVER['SERVER_NAME'] ?>/<?php echo $_GET['room']?></title>
<script type="text/javascript" src="js/jquery-1.4.2.min.js"></script>
<script type="text/javascript" src="js/jquery.scrollTo-1.4.2-min.js"></script>
<script type="text/javascript" src="js/jquery.oembed.min.js"></script>
<?php if ($CLIENT == 'mobilesafari') { ?>
<script type="text/javascript" src="js/iscroll-z.js"></script>
<?php } ?>
<script type="text/javascript" src="js/jquery.cookie.js"></script>
<script type="text/javascript" src="js/client.js?<?php echo time(); ?>"></script>
<link rel="stylesheet" type="text/css" href="css/style.css?<?php echo time(); ?>" />
