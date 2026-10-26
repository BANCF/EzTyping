@echo off
chcp 65001 > nul
title MAY CHU GO BAN PHIM - GIAO VIEN
color 1F

echo ===================================================================
echo               HE THONG GO BAN PHIM CHO HOC SINH TIEU HOC
echo ===================================================================
echo.
echo Dang khoi dong may chu giao vien...
echo.

start "" "http://localhost:3000/teacher.html"
node server.js

pause
