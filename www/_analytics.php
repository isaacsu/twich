<?php
/*******************
* Google analytics only come up on production server
********************/ 
if ($_SERVER['SERVER_NAME'] == $config->domain) { 
?>
        <script type="text/javascript">

          var _gaq = _gaq || [];
          var _Account = <?php echo $config->analyticsAccount ?>;
          var _DomainName = <?php echo $config->analyticsDomainName ?>;
          _gaq.push(['_setAccount', _Account]);
          _gaq.push(['_setDomainName', _DomainName]);
          _gaq.push(['_trackPageview']);

          (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
          })();

        </script>
<?php } ?> 
