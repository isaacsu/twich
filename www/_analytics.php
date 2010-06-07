<?php
/*******************
* Google analytics only come up on production server
********************/ 
if ($_SERVER['SERVER_NAME'] == 'twich.me') { 
?>
        <script type="text/javascript">

          var _gaq = _gaq || [];
          _gaq.push(['_setAccount', 'UA-246664-21']);
          _gaq.push(['_setDomainName', '.twich.me']);
          _gaq.push(['_trackPageview']);

          (function() {
            var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
            ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
            var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
          })();

        </script>
<?php } ?> 
