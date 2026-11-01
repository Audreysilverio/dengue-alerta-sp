@echo off
cd /d "%~dp0"

echo ========================================
echo ATUALIZACAO DA BASE DENGUE ALERTA SP
echo ========================================

node baseDengue.js >> "%~dp0atualizacao.log" 2>&1
