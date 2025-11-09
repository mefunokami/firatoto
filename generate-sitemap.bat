@echo off
echo Sitemap olusturuluyor...
cd /d "C:\Users\Shinichi\Desktop\firatotomer"
node tools/generate-sitemap-from-db.mjs
echo.
echo Sitemap olusturuldu! public/sitemap.xml dosyasini sunucuya yukleyin.
pause 