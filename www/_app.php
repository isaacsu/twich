<?php
/*******************
* Connect Panel
********************/ 
?>
            <div id="connect">
                <h1>
                    <?php echo $_SERVER['SERVER_NAME']?>/<span style='color:#fff'><?php echo $_GET['room']?></span>
                </h1>
                <p>
&nbsp;<br />
<?php /*
Welcome to the <span style='color:#fff'><?php echo $_GET['room']?></span> twich room.<br />
 */?>
                    Twich is a super easy way to start a <br />real-time chat with anyone.
                </p>
                <p>
                    Just enter your name to start chatting.
                </p>


                <div style='margin-top:10px'>
                    <form id='connectForm' action="#">
                        <fieldset> 
                            <label for="nickInput">Name&nbsp;</label><br />
                            <input id="nickInput" class="text" maxlength='20' type="text" name="nick" value=""/>
                            <input id="connectButton" class="button" type="submit" name="" value="Enter" />
                        </fieldset>
                    </form>

                    <p class='footnote'>
                        No signup or registration forms - delight!
                    </p>
                </div>

                <p id='roomusercount' style='display:none;color:#666'>&nbsp;<br /><span class='count' style=''>0 users</span> currently in this room<br />

                <span style='color:#ccc;font-weight:bold' id='roomuserlist'>isaacsu boo iamlauz chris aun</span>
</p>

                <div class='disclaimer'>
<?php /*
                    <h4>Disclaimer</h4>
                    <p> Please be advised that <span style='color:#aaa'>twich.me</span> is still under active development, so please do not rely on it to launch space shuttles, yet. You have been warned.</p>
                    <p> Some other issues that have come up: (17-May-2010) </p>
                    <ul>
                        <li>Layout does not work well in those Internet Explorer things. <br />
                        (Please use a real browser like <a href='http://www.mozilla.com/firefox/'>Firefox</a>, <a href='http://google.com/chrome'>Chrome</a>, or <a href='http://apple.com/safari'>Safari</a>)</li>
                    </ul>
 */ ?>
                    <p>twich.me is developed by <span style='color:#aaa'>Isaac Su</span><br />
                       email <a href='mailto:isaac@pregnate.com.au'>isaac@pregnate.com.au</a> or follow <a href='http://bit.ly/twisaaacsu'>@isaacsu</a></p>

                </div>
            </div> <?php // end of connect ?>

<?php
/*******************
* Loading Panel
********************/ 
?>

            <div id="loading"><p>loading</p></div>

<?php
/*******************
* Log Panel
********************/ 
?>
<div id='logwrap'>
<?php if (true || $CLIENT != 'mobilesafari') { ?><div id='logout'><a onclick='signout()' href='#'>Logout</a></div> <?php } ?>
            <div id="log">
<?php if (false) { ?>
                <table class="message"><tr><td class="date">18:58</td><td valign="top" class="nick">TTilus</td>
                        <td class="msg-text">x6a616e: i think you can, there was some weird #send trick to do that</td>
                </tr></table>
                <table class="message"><tr><td class="date">18:58</td><td valign="top" class="nick">TTilus</td>
                        <td class="msg-text">(or i could just be terribly wrong)</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:02</td><td valign="top" class="nick">x6a616e</td>
                        <td class="msg-text">TTilus: with #send you can invoke private methods</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:03</td><td valign="top" class="nick">x6a616e</td>
                        <td class="msg-text">dunno how to leverage it to access instance var :-/</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:05</td><td valign="top" class="nick">x6a616e</td>
                        <td class="msg-text">i3d: usually I use rspec::mocks</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:05</td><td valign="top" class="nick">dlisboa</td>
                        <td class="msg-text">x6a616e: #instance_variable_get ?</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:06</td><td valign="top" class="nick">x6a616e</td>
                        <td class="msg-text">dlisboa: phew I forgot that ..</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:19</td><td valign="top" class="nick">UrbanVegan</td>
                        <td class="msg-text">How can I use "%" in a string as just another character (meaning "percent")?</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:20</td><td valign="top" class="nick">ddfreyne</td>
                        <td class="msg-text">"%"</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:20</td><td valign="top" class="nick">ddfreyne</td>
                        <td class="msg-text">:)</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:20</td><td valign="top" class="nick">ddfreyne</td>
                        <td class="msg-text">no need to escape it</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:20</td><td valign="top" class="nick">dominikh</td>
                        <td class="msg-text">%%</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:21</td><td valign="top" class="nick">dominikh</td>
                        <td class="msg-text">ddfreyne: if you use something like "%string" % 1</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:21</td><td valign="top" class="nick">dominikh</td>
                        <td class="msg-text">eh</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:21</td><td valign="top" class="nick">dominikh</td>
                        <td class="msg-text">you get the idea</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:21</td><td valign="top" class="nick">ddfreyne</td>
                        <td class="msg-text">"foo %s bar" % [ 'hello' ] # =&gt; "foo hello bar"</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:21</td><td valign="top" class="nick">dominikh</td>
                        <td class="msg-text">lets assume he has some other % stuff he wants to be replaced</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:21</td><td valign="top" class="nick">ddfreyne</td>
                        <td class="msg-text">"foo %% %s bar" % [ 'hello' ] # =&gt; "foo % hello bar"</td>
                </tr></table>
                <table class="message"><tr><td class="date">19:21</td><td valign="top" class="nick">dominikh</td>
                        <td class="msg-text">and some he doesnt want to</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:07</td><td valign="top" class="nick">bougyman</td>
                        <td class="msg-text">docs should be in /usr/share, not /usr/lib/ruby/gems/1.8/doc, too</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:07</td><td valign="top" class="nick">bougyman</td>
                        <td class="msg-text">FHS is OS agnostic.</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:08</td><td valign="top" class="nick">drbrain</td>
                        <td class="msg-text">bougyman: FreeBSD doesn't follow the FHS</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:08</td><td valign="top" class="nick">drbrain</td>
                        <td class="msg-text">Apple doesn't follow the FHS, and windows doesn't follow the FHS</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:08</td><td valign="top" class="nick">drbrain</td>
                        <td class="msg-text">I really don't care about people who say "you don't X, Y or Z!" and won't pony up patches</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:11</td><td valign="top" class="nick">bougyman</td>
                        <td class="msg-text">the fbsd list seems split over FHS compliance</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:11</td><td valign="top" class="nick">bougyman</td>
                        <td class="msg-text">some of em want it, some give it the finger.</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:11</td><td valign="top" class="nick">drbrain</td>
                        <td class="msg-text">that's because they already have the heir man page</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:12</td><td valign="top" class="nick">bougyman</td>
                        <td class="msg-text">looks like they gave in on mounts to FHS 2.2 (freebsd did)</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:12</td><td valign="top" class="nick">bougyman</td>
                        <td class="msg-text">winFS was said to be FHS compliant.</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:12</td><td valign="top" class="nick">bougyman</td>
                        <td class="msg-text">maybe we'll see that in the next MS product.</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:13</td><td valign="top" class="nick">bougyman</td>
                        <td class="msg-text">it was supposed to be in Vista, but got scrapped.</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:13</td><td valign="top" class="nick">ddfreyne</td>
                        <td class="msg-text">stuff in /bin should have config stuff in /etc, stuff in /usr/bin should have their configs in 
                            /usr/etc, ... IMO
                        </td>
                </tr></table>
                <table class="message"><tr><td class="date">20:13</td><td valign="top" class="nick">ddfreyne</td>
                        <td class="msg-text">stuff in ~/bin should have their configs in ~/etc</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:13</td><td valign="top" class="nick">ddfreyne</td>
                        <td class="msg-text">that would make a lot more sense than it does now</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:13</td><td valign="top" class="nick">ddfreyne</td>
                        <td class="msg-text">... what kind of names are "etc" and "var" anyway?</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:13</td><td valign="top" class="nick">ddfreyne</td>
                        <td class="msg-text">"config" and "data" would have made more sense</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:14</td><td valign="top" class="nick">bougyman</td>
                        <td class="msg-text">they make sense to me.</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:14</td><td valign="top" class="nick">ddfreyne</td>
                        <td class="msg-text">even 'etc'? etcetera? "all the rest of the stuff goes here"?</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:14</td><td valign="top" class="nick">bougyman</td>
                        <td class="msg-text">etc. and variable are how I read them.</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:14</td><td valign="top" class="nick">catalystmediastu</td>
                        <td class="msg-text">Does anyone know of a gem or Rails plugin that converts rtf documents to HTML? I've </td>
                </tr></table>
                <table class="message"><tr><td class="date">20:15</td><td valign="top" class="nick">wmoxam</td>
                        <td class="msg-text">catalystmediastu: I doubt it, you'll probably have to find a tool that does it, and call the tool</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:15</td><td valign="top" class="nick">ddfreyne</td>
                        <td class="msg-text">bougyman: you can't really say that 'etc' is a better name than 'config'</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:16</td><td valign="top" class="nick">catalystmediastu</td>
                        <td class="msg-text">wmoxam: I'll start looking for a generic tool for linux then. Thanks!</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:16</td><td valign="top" class="nick">wmoxam</td>
                        <td class="msg-text">catalystmediastu: http://sourceforge.net/projects/rtf2html/  &lt;-- might work</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:17</td><td valign="top" class="nick">catalystmediastu</td>
                        <td class="msg-text">wmoxam: Ahh that looks like it might. Thank you!</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:17</td><td valign="top" class="nick">wmoxam</td>
                        <td class="msg-text">np</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:17</td><td valign="top" class="nick">bougyman</td>
                        <td class="msg-text">catalystmediastu: unrtf works well for that.</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:17</td><td valign="top" class="nick">bougyman</td>
                        <td class="msg-text">http://www.gnu.org/software/unrtf/unrtf.html</td>
                </tr></table>
                <table class="message"><tr><td class="date">20:20</td><td valign="top" class="nick">catalystmediastu</td>
                        <td class="msg-text">bougyman: Thanks, that looks like a good tool too. I'll look into them both a little 
                            more.
                        </td>
                </tr></table>
<?php } ?>
            </div> <?php // end of log ?>
            </div><?php // end of logwrap ?>

<?php
/*******************
* Toolbar Panel
********************/ 
?>
            <div id="toolbar">
                <ul id="status">
                    <li class="date" id="currentTime">12:59</li>
                    <li id='currentUsers'><a id="usersLink" href="#">5 users</a></li>
                </ul>
                <input tabindex="1" maxlength='2000' type="text" id="entry" />
                <input id='entry-btn' type='button' value='Send' />
            </div> <?php //end of toolbar ?>


        
