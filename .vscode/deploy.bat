::copy D:\xampp\htdocs\perl\kim_upload.html %~dp0 /V /-Y
@ECHO OFF
SETLOCAL ENABLEEXTENSIONS
chcp 65001
move d:\kim_upload.html
@REM echo user mis mis0308 > __ftpcmd__.dat
@REM echo cd /usr/local/apache_1.3.33/htdocs/frontend/docd400w/  >> __ftpcmd__.dat
@REM echo put %1 >> __ftpcmd__.dat
@REM echo bye >> __ftpcmd__.dat
@REM @ECHO ON
@REM ftp  -n -v -s:__ftpcmd__.dat 192.6.3.8
@REM del __ftpcmd__.dat /Q