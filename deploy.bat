@ECHO OFF
REM http://steve-jansen.github.io/guides/windows-batch-scripting/part-2-variables.html
SETLOCAL ENABLEEXTENSIONS
chcp 65001
SET USERNAME=mis
SET PASSWORD=mis0308

IF "%2" == "" GOTO STOP

IF "%2" == "31" (
    SET REMOTE_HOST=192.6.3.1
    SET REMOTE_PATH=/backup/mistest
)
IF "%2" == "38help" (
    SET REMOTE_HOST=192.6.3.8
    SET REMOTE_PATH=/usr/local/apache/htdocs/gfchelp
)
IF "%2" == "38" (
    SET REMOTE_HOST=192.6.3.8
    SET REMOTE_PATH=/usr/local/apache/htdocs/%5
)
IF "%2" == "38frontend" (
    SET REMOTE_HOST=192.6.3.8
    SET REMOTE_PATH=/usr/local/apache/htdocs/frontend/%5
)

IF "%2" == "WIO" (
    IF "%4" == "wio" (
        start "" "http://192.6.3.8/gfcdb/apb2/?MIval=/APB20/apb_edit_Tag.html&ID=%1&project=%3&obj_type=Dynamic+Tag"
    ) ELSE (
        start "" "http://192.6.3.8/gfcdb/apb2/?MIval=/APB20/apb_edit_Page.html&ID=%1&path=/gfc&extension=%4&project=%3&obj_type=AppPage"
    )
    GOTO STOP
)
IF "%3" == "Download" SET WORK=get %4 %1
IF "%3" == "Upload" SET WORK=put %1


echo open %REMOTE_HOST%>> temp.txt
echo %USERNAME%>> temp.txt
echo %PASSWORD%>> temp.txt
echo cd %REMOTE_PATH%>> temp.txt
echo binary>> temp.txt

IF "%3" == "Uploads" (
   echo mkdir css>> temp.txt
   echo cd css>> temp.txt
   echo mput %1css\*>> temp.txt
   echo cd ..>> temp.txt
   echo mkdir js>> temp.txt
   echo cd js>> temp.txt
   echo mput %1js\*>> temp.txt
   echo cd ..>> temp.txt
   SET WORK=mput %1*
)

echo %WORK%>> temp.txt
echo quit>> temp.txt
@ECHO ON
ftp -v -i -s:temp.txt
del temp.txt
:STOP